import express from "express";
import axios from "axios";

const router = express.Router();

const AVIATION_API = "http://api.aviationstack.com/v1/flights";
const API_KEY = process.env.AVIATIONSTACK_KEY;

/*
GET /api/flights?dep=DEL&arr=DXB
Example:
DEL → Dubai flights
*/

router.get("/", async (req, res) => {

  try {

    const { dep, arr, airline } = req.query;

    const response = await axios.get(AVIATION_API, {
      params: {
        access_key: API_KEY,
        dep_iata: dep,
        arr_iata: arr,
        airline_iata: airline
      }
    });

    const flights = response.data.data.map(f => ({
      airline: f.airline?.name,
      flight_number: f.flight?.iata,
      departure_airport: f.departure?.airport,
      departure_iata: f.departure?.iata,
      departure_time: f.departure?.scheduled,
      arrival_airport: f.arrival?.airport,
      arrival_iata: f.arrival?.iata,
      arrival_time: f.arrival?.scheduled,
      status: f.flight_status
    }));

    res.json({
      total: flights.length,
      flights
    });

  } catch (err) {
    console.error("Flight API error:", err.message);
    res.status(500).json({
      error: "Could not fetch flight data"
    });
  }

});

export default router;