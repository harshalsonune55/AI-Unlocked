// import axios from "axios";

// const AVIATION_API = "http://api.aviationstack.com/v1/flights";

// export async function getFlights({ dep, arr, airline }) {
//   const API_KEY = process.env.AVIATIONSTACK_KEY;
//   if (!dep || !arr) {
//     return [];
//   }

//   if (!API_KEY) {
//     return [];
//   }

//   const response = await axios.get(AVIATION_API, {
//     params: {
//       access_key: API_KEY,
//       dep_iata: dep,
//       arr_iata: arr,
//       airline_iata: airline
//     }
//   });

//   return (response.data?.data || []).map((f) => ({
//     airline: f.airline?.name,
//     flight_number: f.flight?.iata,
//     departure_airport: f.departure?.airport,
//     departure_iata: f.departure?.iata,
//     departure_time: f.departure?.scheduled,
//     arrival_airport: f.arrival?.airport,
//     arrival_iata: f.arrival?.iata,
//     arrival_time: f.arrival?.scheduled,
//     status: f.flight_status
//   }));
// }
import axios from "axios";

const AVIATION_API = "http://api.aviationstack.com/v1/flights";

/* Approx coordinates for some major airports */
const AIRPORT_COORDS = {
  DEL: { lat: 28.5562, lon: 77.1000 },
  BOM: { lat: 19.0896, lon: 72.8656 },
  GOI: { lat: 15.3808, lon: 73.8314 },
  DXB: { lat: 25.2532, lon: 55.3657 },
  BLR: { lat: 13.1986, lon: 77.7066 },
  HYD: { lat: 17.2403, lon: 78.4294 }
};

/* Calculate distance between airports */
function calculateDistance(dep, arr) {
  const a = AIRPORT_COORDS[dep];
  const b = AIRPORT_COORDS[arr];

  if (!a || !b) return 1200;

  const R = 6371;
  const dLat = (b.lat - a.lat) * Math.PI / 180;
  const dLon = (b.lon - a.lon) * Math.PI / 180;

  const lat1 = a.lat * Math.PI / 180;
  const lat2 = b.lat * Math.PI / 180;

  const x =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.sin(dLon / 2) *
      Math.sin(dLon / 2) *
      Math.cos(lat1) *
      Math.cos(lat2);

  const c = 2 * Math.atan2(Math.sqrt(x), Math.sqrt(1 - x));

  return R * c;
}

/* Estimate price from distance */
function estimatePrice(dep, arr) {
  const distance = calculateDistance(dep, arr);

  const base = 2500;
  const perKm = 4;

  const price = base + distance * perKm;

  return `₹${Math.round(price)}`;
}

export async function getFlights({ dep, arr, airline }) {

  const API_KEY = process.env.AVIATIONSTACK_KEY;

  if (!dep || !arr || !API_KEY) {
    return [];
  }

  const response = await axios.get(AVIATION_API, {
    params: {
      access_key: API_KEY,
      dep_iata: dep,
      arr_iata: arr,
      airline_iata: airline
    }
  });

  return (response.data?.data || []).slice(0,5).map((f) => ({
    airline: f.airline?.name || "Unknown Airline",
    flight_number: f.flight?.iata || "N/A",

    departure_airport: f.departure?.airport,
    departure_iata: f.departure?.iata,
    departure_time: f.departure?.scheduled,

    arrival_airport: f.arrival?.airport,
    arrival_iata: f.arrival?.iata,
    arrival_time: f.arrival?.scheduled,

    status: f.flight_status,

    estimated_price: estimatePrice(dep, arr)
  }));
}