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



    const weather = await axios.get(
      `https://wttr.in/${place}?format=j1`,
      { headers }
    );

    const weatherData = weather.data.current_condition[0];



    const places = [
      `${place} Old Town`,
      `${place} Main Market`,
      `${place} Cultural Center`,
      `${place} Nature Park`,
      `${place} Scenic View Point`
    ];

/* -------------------------
   4️⃣ Travel Articles
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
   5️⃣ Dynamic Hotels (Geoapify)
------------------------- */

let hotels = [];

try {

  // 1️⃣ Convert place → latitude/longitude
  const geo = await axios.get(
    `https://api.geoapify.com/v1/geocode/search`,
    {
      params: {
        text: place,
        apiKey: process.env.GEOAPIFY_KEY
      }
    }
  );

  const location = geo.data.features[0];

  if (location) {

    const lat = location.geometry.coordinates[1];
    const lon = location.geometry.coordinates[0];

    // 2️⃣ Search hotels near that location
    const hotelRes = await axios.get(
      `https://api.geoapify.com/v2/places`,
      {
        params: {
          categories: "accommodation.hotel",
          filter: `circle:${lon},${lat},5000`,
          limit: 5,
          apiKey: process.env.GEOAPIFY_KEY
        }
      }
    );

    hotels = hotelRes.data.features.map(h => ({
      name: h.properties.name || "Hotel",
      address: h.properties.formatted || "",
      price_estimate: "₹1500 - ₹4000 per night"
    }));

  }

} catch (err) {
  console.log("Hotel API failed:", err.message);
}
    /* -------------------------
       6️⃣ Dynamic Travel Tips
    ------------------------- */

    const travel_tips = [];

    const temp = parseInt(weatherData.temp_C);

    if (temp <= 5) {
      travel_tips.push("Carry heavy winter clothes.");
    }

    if (temp >= 30) {
      travel_tips.push("Stay hydrated and wear sunscreen.");
    }

    if (weatherData.weatherDesc[0].value.includes("Rain")) {
      travel_tips.push("Carry an umbrella or raincoat.");
    }

    travel_tips.push(`Try local food specialties in ${place}.`);
    travel_tips.push(`Explore local markets and cultural spots in ${place}.`);
    travel_tips.push("Visit major attractions early to avoid crowds.");

    /* -------------------------
       7️⃣ Latest News
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
      description,
      weather: weatherData,
      top_places: places,
      hotels,
      travel_articles: articles.slice(0,5),
      latest_news: news.slice(0,5),
      travel_tips,
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