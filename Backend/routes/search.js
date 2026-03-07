import express from "express";
import { retrieveDestinationData } from "../services/retrieverService.js";

const router = express.Router();

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
