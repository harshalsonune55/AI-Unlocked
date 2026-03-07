import express from "express";
import { getFlights } from "../services/flightService.js";

const router = express.Router();

/*
GET /api/flights?dep=DEL&arr=DXB
Example:
DEL → Dubai flights
*/

router.get("/", async (req, res) => {
  try {
    const { dep, arr, airline } = req.query;
    const flights = await getFlights({ dep, arr, airline });

    return res.json({
      total: flights.length,
      flights
    });
  } catch (err) {
    console.error("Flight API error:", err.message);
    return res.status(500).json({
      error: "Could not fetch flight data"
    });
  }
});

export default router;
