import express from "express";
import fs from "fs";

const router = express.Router();

const PROFILES_FILE = "./profiles.json";

function loadProfiles() {
  if (!fs.existsSync(PROFILES_FILE)) return {};
  return JSON.parse(fs.readFileSync(PROFILES_FILE, "utf-8"));
}

router.get("/", (req, res) => {

  try {

    const profiles = loadProfiles();

    const trips = Object.values(profiles)
      .sort((a, b) => new Date(b.savedAt) - new Date(a.savedAt))
      .slice(0, 6)
      .map(p => ({
        sessionId: p.sessionId,
        destination: p.destination,
        duration: p.duration,
        budget: p.budget,
        savedAt: p.savedAt
      }));

    res.json({
      total: trips.length,
      trips
    });

  } catch (err) {

    console.error("Recent trips error:", err.message);

    res.status(500).json({
      error: "Could not fetch recent trips"
    });

  }

});

export default router;