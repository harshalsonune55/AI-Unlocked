import express from "express";
import fs from "fs";
import { retrieveDestinationData } from "../services/retrieverService.js";
import { getFlights } from "../services/flightService.js";
import { getPlaceImages } from "../services/imageService.js";
import { composeFinalTrip } from "../services/finalComposerService.js";

const router = express.Router();

const PROFILES_FILE = "./profiles.json";

const loadProfiles = () => {
  if (!fs.existsSync(PROFILES_FILE)) return {};
  return JSON.parse(fs.readFileSync(PROFILES_FILE, "utf-8"));
};

router.post("/finalize", async (req, res) => {
  const { sessionId, place, dep = "DEL", airline } = req.body || {};

  if (!sessionId && !place) {
    return res.status(400).json({ error: "sessionId or place is required" });
  }

  try {
    const profiles = loadProfiles();
    const profile = sessionId ? profiles[sessionId] : null;

    const destination = place || profile?.destination;

    if (!destination) {
      return res.status(400).json({ error: "Could not determine destination" });
    }

    const [search, images] = await Promise.all([
      retrieveDestinationData(destination),
      getPlaceImages(destination, 6)
    ]);

    const arr = String(destination).slice(0, 3).toUpperCase();
    const flights = await getFlights({ dep, arr, airline }).catch(() => []);

    const finalTrip = await composeFinalTrip({
      destination,
      profile,
      search,
      images,
      flights
    });

    return res.json({
      sessionId: sessionId || null,
      destination,
      final_trip: finalTrip
    });
  } catch (err) {
    console.error("Finalize plan error:", err.message);
    return res.status(500).json({
      error: "Could not finalize plan",
      detail: err.message
    });
  }
});

export default router;
