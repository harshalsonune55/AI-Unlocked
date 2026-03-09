import axios from "axios";

const AVIATION_API = "http://api.aviationstack.com/v1/flights";

export async function getFlights({ dep, arr, airline }) {
  const API_KEY = process.env.AVIATIONSTACK_KEY;
  if (!dep || !arr) {
    return [];
  }

  if (!API_KEY) {
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

  return (response.data?.data || []).map((f) => ({
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
}
