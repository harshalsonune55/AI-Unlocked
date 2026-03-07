import express from "express";
import { retrieveDestinationData } from "../services/retrieverService.js";

const router = express.Router();
async function getWikiImage(title) {
  try {
    const res = await axios.get(
      `https://en.wikipedia.org/w/api.php?action=query&titles=${encodeURIComponent(
        title
      )}&prop=pageimages&format=json&pithumbsize=800`
    );

    const pages = res.data.query.pages;
    const page = Object.values(pages)[0];

    return page?.thumbnail?.source || null;
  } catch (err) {
    return null;
  }
}


router.get("/", async (req, res) => {
  const place = req.query.place;

  if (!place) {
    return res.status(400).json({ error: "Place required" });
  }

  try {
    const data = await retrieveDestinationData(place);
    return res.json(data);
  } catch (err) {
    console.error("SEARCH ERROR:", err.message);
    return res.status(500).json({
      error: "Search agent failed",
      details: err.message
    });
  }
});

export default router;
