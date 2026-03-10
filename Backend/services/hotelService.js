import axios from "axios";

const SERP_API_KEY = "a74b50434c39573af9b1cf2fc6387dc71d33d9125b500edf91605fb412a6081b";

export async function getHotels(city) {

  if (!city) return [];

  try {

    const response = await axios.get("https://serpapi.com/search.json", {
      params: {
        engine: "google_hotels",
        q: `${city} hotels`,
        check_in_date: "2026-03-10",
        check_out_date: "2026-03-11",
        adults: 2,
        currency: "USD",
        gl: "us",
        hl: "en",
        api_key: SERP_API_KEY
      }
    });

    const hotels = response.data.properties || [];

    const parsedHotels = hotels.slice(0, 5).map((hotel) => {

      return {
        name: hotel.name,
        rating: hotel.overall_rating || "N/A",
        reviews: hotel.reviews || 0,
        price_per_night: hotel.rate_per_night?.lowest || "N/A",
        location: hotel.address || city,
        thumbnail: hotel.images?.[0]?.thumbnail || null
      };

    });

    return parsedHotels;

  } catch (err) {

    console.error("Hotel API error:", err.message);

    return [];

  }

}