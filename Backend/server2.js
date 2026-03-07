import express from "express";
import dotenv from "dotenv";
dotenv.config();
import cors from "cors";


import { retrieveDestinationData } from "./services/retrieverService.js";
import { getFlights } from "./services/flightService.js";
import { getImages } from "./services/imageService.js";
import { composeFinalTrip } from "./services/finalComposerService.js";
import { getHotels } from "./services/hotelService.js";

dotenv.config();

const app = express();

app.use(cors({ origin: "*" }));
app.use(express.json());

/*
POST BODY EXAMPLE

{
  "profile": {
    "starting_city": "DEL",
    "destination_city": "GOI",
    "duration": "4 days",
    "budget": "₹20000",
    "travelStyle": "relaxed"
  }
}
*/

app.post("/api/trip", async (req, res) => {
  try {
    const { profile } = req.body;

    const start = profile.starting_city;
    const destination = profile.destination_city;

    if (!start || !destination) {
      return res.status(400).json({
        error: "starting_city and destination_city required"
      });
    }

    const [flights, search, images, hotels] = await Promise.all([
        getFlights({ dep: start, arr: destination }),
        retrieveDestinationData(destination),
        getImages(destination),
        getHotels(destination)
      ]);

    /* 4️⃣ BUILD PAYLOAD FOR LLM */
    const payload = {
        profile,
        destination,
        flights,
        hotels,
        search,
        images
      };

    /* 5️⃣ GENERATE FINAL TRIP */
    const finalTrip = await composeFinalTrip(payload);

    res.json(finalTrip);

  } catch (err) {
    console.error(err);

    res.status(500).json({
      error: "Trip generation failed"
    });
  }
});

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`Voyager AI running on port ${PORT}`);
});