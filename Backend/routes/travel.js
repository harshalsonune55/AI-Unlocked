import express from "express";
import axios from "axios";
import * as cheerio from "cheerio";

const router = express.Router();

const AVIATION_API = "http://api.aviationstack.com/v1/flights";
const AVIATION_KEY = process.env.AVIATIONSTACK_KEY;


/* -------------------------
   Wikipedia Image Fetcher
------------------------- */

async function getWikiImage(title) {
  try {

    const res = await axios.get(
        `https://en.wikipedia.org/w/api.php?action=query&titles=${encodeURIComponent(title)}&prop=pageimages&format=json&pithumbsize=800`,
        { headers }
      );

    const pages = res.data.query.pages;
    const page = Object.values(pages)[0];

    return page?.thumbnail?.source || null;

  } catch {
    return null;
  }
}

const headers = {
    "User-Agent":
      "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/120 Safari/537.36"
  };

/* -------------------------
   Main Travel API
------------------------- */

router.get("/", async (req, res) => {

  try {

    const { place, dep } = req.query;

    if (!place) {
      return res.status(400).json({ error: "Place required" });
    }

    const headers = {
      "User-Agent":
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64)"
    };


    /* -------------------------
       1️⃣ Wikipedia Info
    ------------------------- */

    const wikiSearch = await axios.get(
        `https://en.wikipedia.org/w/api.php?action=query&list=search&srsearch=${place}&format=json`,
        { headers }
      );

    const pageTitle = wikiSearch.data.query.search[0]?.title || place;

    const destinationImage = await getWikiImage(pageTitle);

    const wiki = await axios.get(
        `https://en.wikipedia.org/api/rest_v1/page/summary/${pageTitle}`,
        { headers }
      );

    const description = wiki.data.extract;


    /* -------------------------
       2️⃣ Weather
    ------------------------- */

    const weather = await axios.get(
        `https://wttr.in/${place}?format=j1`,
        { headers }
      );

    const weatherData = weather.data.current_condition[0];


    /* -------------------------
       3️⃣ Top Places
    ------------------------- */

    const placeNames = [
      `${place} Local Market`,
      `${place} View Point`,
      `${place} Old Town`,
      `${place} Nature Park`,
      `${place} Cultural Center`
    ];

    const places = await Promise.all(
      placeNames.map(async (p) => ({
        name: p,
        image: await getWikiImage(p)
      }))
    );


    /* -------------------------
       4️⃣ Hotels
    ------------------------- */

    const hotels = await Promise.all(
      [
        { name: `Zostel ${place}`, price: "₹900 - ₹1200" },
        { name: `The Hosteller ${place}`, price: "₹1000 - ₹1500" },
        { name: `${place} Backpacker Hostel`, price: "₹700 - ₹1000" },
        { name: `${place} Grand Hotel`, price: "₹3000 - ₹4500" },
        { name: `${place} Residency`, price: "₹2000 - ₹3500" }
      ].map(async (hotel) => ({
        name: hotel.name,
        price_per_night: hotel.price,
        image: await getWikiImage(hotel.name)
      }))
    );


    /* -------------------------
       5️⃣ Travel Articles
    ------------------------- */

    let articles = [];

    try {

        const rss = await axios.get(
            `https://news.google.com/rss/search?q=${place}+travel`,
            { headers }
          );

      const $ = cheerio.load(rss.data, { xmlMode: true });

      $("item").each((i, el) => {

        const title = $(el).find("title").text();
        const link = $(el).find("link").text();

        if (title && link) {
          articles.push({ title, link });
        }

      });

    } catch {}



    /* -------------------------
       6️⃣ Latest News
    ------------------------- */

    let news = [];

    try {

      const rss = await axios.get(
        `https://news.google.com/rss/search?q=${place}`
      );

      const $ = cheerio.load(rss.data, { xmlMode: true });

      $("item").each((i, el) => {

        const title = $(el).find("title").text();
        const link = $(el).find("link").text();

        if (title && link) {
          news.push({ title, link });
        }

      });

    } catch {}



    /* -------------------------
       7️⃣ Flights
    ------------------------- */

    let flights = [];

    if (dep) {

      try {

        const flightRes = await axios.get(AVIATION_API, {
            headers,
          params: {
            access_key: AVIATION_KEY,
            dep_iata: dep,
            arr_iata: place
          }
        });

        flights = flightRes.data.data.map(f => ({
          airline: f.airline?.name,
          flight_number: f.flight?.iata,
          departure_airport: f.departure?.airport,
          departure_time: f.departure?.scheduled,
          arrival_airport: f.arrival?.airport,
          arrival_time: f.arrival?.scheduled,
          status: f.flight_status
        }));

      } catch {
        flights = [];
      }

    }


    /* -------------------------
       Travel Tips
    ------------------------- */

    const travel_tips = [
      "Check weather before traveling",
      "Try local street food",
      "Carry cash for local markets",
      "Visit attractions early morning",
      "Respect local culture"
    ];


    /* -------------------------
       Final Response
    ------------------------- */

    res.json({

      destination: place,
      destination_image: destinationImage,
      description,

      weather: weatherData,

      top_places: places,
      hotels,

      flights,

      travel_articles: articles.slice(0, 5),
      latest_news: news.slice(0, 5),

      travel_tips,

      budget_estimate: "₹1500 - ₹3500 per night"

    });

  } catch (err) {

    console.error("TRAVEL API ERROR:", err.message);

    res.status(500).json({
      error: "Travel API failed"
    });

  }

});

export default router;