import express from "express";
import axios from "axios";
import * as cheerio from "cheerio";

const router = express.Router();

router.get("/", async (req, res) => {

  const place = req.query.place;

  if (!place) {
    return res.status(400).json({ error: "Place required" });
  }

  try {

    const headers = {
      "User-Agent":
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/120 Safari/537.36"
    };

    /* -------------------------
       1️⃣ Wikipedia Info
    ------------------------- */

    const wikiSearch = await axios.get(
      `https://en.wikipedia.org/w/api.php?action=query&list=search&srsearch=${place}&format=json`,
      { headers }
    );

    const pageTitle = wikiSearch.data.query.search[0]?.title || place;

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
       3️⃣ Tourist Places
    ------------------------- */

    const places = [
      `${place} Local Market`,
      `${place} View Point`,
      `${place} Old Town`,
      `${place} Nature Park`,
      `${place} Cultural Center`
    ];

    /* -------------------------
       4️⃣ Travel Articles (Google RSS)
    ------------------------- */

    let articles = [];

    try {

      const rss = await axios.get(
        `https://news.google.com/rss/search?q=${place}+travel+guide`
      );

      const $ = cheerio.load(rss.data, { xmlMode: true });

      $("item").each((i, el) => {

        const title = $(el).find("title").text();
        const link = $(el).find("link").text();

        if (title && link) {
          articles.push({ title, link });
        }

      });

    } catch (err) {
      console.log("Article fetch failed:", err.message);
    }

    /* -------------------------
       5️⃣ Hotels
    ------------------------- */

    const hotels = [
      { name: `Zostel ${place}`, price_per_night: "₹900 - ₹1200" },
      { name: `The Hosteller ${place}`, price_per_night: "₹1000 - ₹1500" },
      { name: `${place} Backpacker Hostel`, price_per_night: "₹700 - ₹1000" },
      { name: `${place} Grand Hotel`, price_per_night: "₹3000 - ₹4500" },
      { name: `${place} Residency`, price_per_night: "₹2000 - ₹3500" }
    ];

    /* -------------------------
       6️⃣ Travel Tips
    ------------------------- */

    const travel_tips = [
      "Check weather before traveling.",
      "Try local cuisine and street food.",
      "Carry cash for local transport.",
      "Visit major attractions early morning.",
      "Respect local culture and traditions."
    ];

    /* -------------------------
       7️⃣ Latest News (RSS)
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

    } catch (err) {
      console.log("News fetch failed:", err.message);
    }

    /* -------------------------
       Final Response
    ------------------------- */

    res.json({
      destination: place,
      description: description,
      weather: weatherData,
      top_places: places,
      hotels: hotels,
      travel_articles: articles.slice(0, 5),
      latest_news: news.slice(0, 5),
      travel_tips: travel_tips,
      budget_estimate: "₹1500 - ₹3500 per night"
    });

  } catch (err) {

    console.error("SEARCH ERROR:", err.message);

    res.status(500).json({
      error: "Search agent failed",
      details: err.message
    });

  }

});

export default router;