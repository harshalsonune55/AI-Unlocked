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

function normalizeIata(value) {
  const code = String(value || "").trim().toUpperCase();
  return /^[A-Z]{3}$/.test(code) ? code : "";
}

router.post("/finalize", async (req, res) => {
  const {
    sessionId,
    place,
    dep,
    from,
    arr,
    to,
    airline
  } = req.body || {};

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

    const depCode = normalizeIata(dep) || normalizeIata(from) || "";
    const arrCode = normalizeIata(arr) || normalizeIata(to) || "";

    const flights = depCode && arrCode
      ? await getFlights({ dep: depCode, arr: arrCode, airline }).catch(() => [])
      : [];

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
      final_trip: finalTrip,
      flight_query: {
        dep: depCode || null,
        arr: arrCode || null
      }
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
