/* ── flightService.js ─────────────────────────────────────────────── */

import axios from "axios";

const AVIATION_API = "http://api.aviationstack.com/v1/flights";

/* ── City → IATA map ── */
const IATA_MAP = {
  delhi: "DEL", mumbai: "BOM", bangalore: "BLR", chennai: "MAA",
  kolkata: "CCU", hyderabad: "HYD", ahmedabad: "AMD", pune: "PNQ", goa: "GOI",
  paris: "CDG", london: "LHR", dubai: "DXB", singapore: "SIN",
  "new york": "JFK", newyork: "JFK", tokyo: "NRT", sydney: "SYD",
  bangkok: "BKK", amsterdam: "AMS", frankfurt: "FRA", rome: "FCO",
  barcelona: "BCN", "kuala lumpur": "KUL", kualalumpur: "KUL"
};

export function toIATA(cityName) {
  if (!cityName) return "UNK";
  // Strip trailing words like "trip", "city", "getaway"
  const key = cityName.toLowerCase().replace(/\s*(trip|city|getaway|tour)$/,"").trim();
  // If already a valid 3-letter IATA code, return as-is
  if (/^[A-Z]{3}$/.test(cityName)) return cityName;
  return IATA_MAP[key] || cityName.toUpperCase().slice(0, 3);
}

/* ── Coordinate map for price estimation ── */
const AIRPORT_COORDS = {
  DEL: { lat: 28.5562, lon: 77.1000 },
  BOM: { lat: 19.0896, lon: 72.8656 },
  GOI: { lat: 15.3808, lon: 73.8314 },
  DXB: { lat: 25.2532, lon: 55.3657 },
  BLR: { lat: 13.1986, lon: 77.7066 },
  HYD: { lat: 17.2403, lon: 78.4294 },
  MAA: { lat: 12.9941, lon: 80.1709 },
  CCU: { lat: 22.6520, lon: 88.4463 },
  CDG: { lat: 49.0097, lon:  2.5479 },
  LHR: { lat: 51.4700, lon: -0.4543 },
  SIN: { lat:  1.3644, lon: 103.9915 },
  JFK: { lat: 40.6413, lon: -73.7781 },
  NRT: { lat: 35.7720, lon: 140.3929 },
  SYD: { lat: -33.9399, lon: 151.1753 },
  BKK: { lat: 13.6811, lon: 100.7470 },
  AMS: { lat: 52.3086, lon:  4.7639 },
  FRA: { lat: 50.0379, lon:  8.5622 },
  FCO: { lat: 41.8003, lon: 12.2389 },
  BCN: { lat: 41.2974, lon:  2.0833 },
  KUL: { lat:  2.7456, lon: 101.7099 },
};

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
    Math.sin(dLat / 2) ** 2 +
    Math.sin(dLon / 2) ** 2 * Math.cos(lat1) * Math.cos(lat2);
  return R * 2 * Math.atan2(Math.sqrt(x), Math.sqrt(1 - x));
}

function estimatePrice(dep, arr, multiplier = 1) {
  const distance = calculateDistance(dep, arr);
  return Math.round((2500 + distance * 4) * multiplier);
}

/* ── Fallback airlines when API is unavailable ── */
const FALLBACK_AIRLINES = [
  { name: "Air India",        code: "AI", base: 101 },
  { name: "Emirates",         code: "EK", base: 210 },
  { name: "Air France",       code: "AF", base: 225 },
];

const DEP_TIMES = ["06:00", "10:30", "14:45"];

function addHours(time, hours) {
  const [h, m] = time.split(":").map(Number);
  return `${String((h + hours) % 24).padStart(2, "0")}:${String(m).padStart(2, "0")}`;
}

function buildFallbackFlights(depIATA, arrIATA, direction = "departure") {
  const from = direction === "departure" ? depIATA : arrIATA;
  const to   = direction === "departure" ? arrIATA : depIATA;

  return FALLBACK_AIRLINES.map((airline, i) => ({
    airline:           airline.name,
    flight_number:     `${airline.code}${airline.base + i}`,
    departure_airport: from,
    departure_iata:    from,
    departure_time:    DEP_TIMES[i],
    arrival_airport:   to,
    arrival_iata:      to,
    arrival_time:      addHours(DEP_TIMES[i], 8),
    status:            "scheduled",
    estimated_price:   estimatePrice(from, to, 1 + i * 0.05),
    source:            "estimated",  // flag so you know it's fallback
  }));
}

/* ── Format a real AviationStack flight ── */
function formatFlight(f, dep, arr) {
  return {
    airline:           f.airline?.name || "Unknown Airline",
    flight_number:     f.flight?.iata || "N/A",
    departure_airport: f.departure?.airport || dep,
    departure_iata:    f.departure?.iata || dep,
    departure_time:    f.departure?.scheduled?.slice(11, 16) || "00:00",
    arrival_airport:   f.arrival?.airport || arr,
    arrival_iata:      f.arrival?.iata || arr,
    arrival_time:      f.arrival?.scheduled?.slice(11, 16) || "08:00",
    status:            f.flight_status || "scheduled",
    estimated_price:   estimatePrice(dep, arr),
    source:            "live",
  };
}

/* ── Main export ── */
export async function getFlights({ dep, arr, airline }) {
  // Normalize city names to IATA codes
  const depIATA = toIATA(dep);
  const arrIATA = toIATA(arr);

  console.log(`✈️  Fetching flights: ${dep} → ${arr} (${depIATA} → ${arrIATA})`);

  const API_KEY = process.env.AVIATIONSTACK_KEY;

  if (!API_KEY) {
    console.warn("⚠️  No AVIATIONSTACK_KEY found — using fallback data");
    return {
      departure_flights: buildFallbackFlights(depIATA, arrIATA, "departure"),
      return_flights:    buildFallbackFlights(depIATA, arrIATA, "return"),
    };
  }

  try {
    // Fetch departure and return flights in parallel
    const [depRes, retRes] = await Promise.all([
      axios.get(AVIATION_API, {
        params: { access_key: API_KEY, dep_iata: depIATA, arr_iata: arrIATA, airline_iata: airline },
        timeout: 8000,
      }),
      axios.get(AVIATION_API, {
        params: { access_key: API_KEY, dep_iata: arrIATA, arr_iata: depIATA, airline_iata: airline },
        timeout: 8000,
      }),
    ]);

    const depFlights = (depRes.data?.data || []).slice(0, 3);
    const retFlights = (retRes.data?.data || []).slice(0, 3);

    // If API returned empty results, use fallback
    const departure_flights = depFlights.length
      ? depFlights.map(f => formatFlight(f, depIATA, arrIATA))
      : buildFallbackFlights(depIATA, arrIATA, "departure");

    const return_flights = retFlights.length
      ? retFlights.map(f => formatFlight(f, arrIATA, depIATA))
      : buildFallbackFlights(depIATA, arrIATA, "return");

    return { departure_flights, return_flights };

  } catch (err) {
    if (err?.response?.status === 429) {
      console.warn("⚠️  AviationStack rate limit hit (429) — using fallback data");
    } else if (err?.response?.status === 401) {
      console.warn("⚠️  AviationStack invalid API key — using fallback data");
    } else {
      console.error("✈️  Flight API error:", err.message);
    }

    // Always return something so the rest of your app doesn't break
    return {
      departure_flights: buildFallbackFlights(depIATA, arrIATA, "departure"),
      return_flights:    buildFallbackFlights(depIATA, arrIATA, "return"),
    };
  }
}