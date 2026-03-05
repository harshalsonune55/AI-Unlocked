import { useLocation } from "react-router-dom";
import { useEffect, useState } from "react";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import DestinationCard from "../components/DestinationCard";
import PromptBox from "../components/PromptBox";

export default function Response() {

  const location = useLocation();
  const itinerary = location.state?.itinerary || null;

  const [flights, setFlights] = useState([]);

  // Convert itinerary days → cards
  const trips =
    itinerary?.itinerary?.map((day, index) => ({
      id: index,
      image: "https://images.unsplash.com/photo-1512453979798-5ea266f8880c",
      title: day.title,
      location: itinerary.destination,
      price: itinerary.estimated_cost || "N/A",
      duration: `Day ${day.day}`,
      rating: "4.8",
      tags: day.activities?.slice(0, 2) || []
    })) || [];

  // Fetch flights
  useEffect(() => {

    if (!itinerary?.destination) return;

    const fetchFlights = async () => {
      try {

        // Example: Delhi → Destination
        const res = await fetch(
          `http://localhost:3001/api/flights?dep=DEL&arr=${itinerary.destination}`
        );

        const data = await res.json();
        setFlights(data.flights || []);

      } catch (err) {
        console.error("Flight fetch error:", err);
      }
    };

    fetchFlights();

  }, [itinerary]);

  return (
    <div className="min-h-screen bg-black text-white flex flex-col">

      <Navbar />

      <main className="flex-1 px-6 md:px-16 py-20">

        {/* Header */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 bg-orange-500/20 
                          text-orange-400 px-4 py-2 rounded-full text-sm mb-6">
            ✈ AI Generated Itinerary
          </div>

          <h1 className="text-4xl md:text-6xl font-bold mb-6">
            {itinerary?.trip_title || "Your Trip Plan"}
          </h1>

          <p className="text-gray-400 max-w-2xl mx-auto text-lg">
            Destination: {itinerary?.destination} • Duration: {itinerary?.duration}
          </p>
        </div>

        <PromptBox />

        {/* Itinerary Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 mb-20">

          {trips.length > 0 ? (
            trips.map((trip) => (
              <DestinationCard
                key={trip.id}
                id={trip.id}
                image={trip.image}
                title={trip.title}
                location={trip.location}
                price={trip.price}
                duration={trip.duration}
                rating={trip.rating}
                tags={trip.tags}
              />
            ))
          ) : (
            <p className="text-gray-400 text-center col-span-3">
              Start planning your trip using the prompt above ✈️
            </p>
          )}

        </div>


        {/* FLIGHT SECTION */}
        <div className="mt-20">

          <h2 className="text-3xl font-semibold mb-8">
            ✈ Available Flights
          </h2>

          {flights.length === 0 ? (
            <p className="text-gray-400">No flights found</p>
          ) : (

            <div className="grid md:grid-cols-2 gap-6">

              {flights.map((flight, index) => (

                <div
                  key={index}
                  className="bg-neutral-900 border border-neutral-800 rounded-xl p-6"
                >

                  <h3 className="text-xl font-semibold mb-2">
                    {flight.airline}
                  </h3>

                  <p className="text-gray-400 text-sm mb-2">
                    Flight: {flight.flight_number}
                  </p>

                  <p className="text-gray-300">
                    {flight.departure_iata} → {flight.arrival_iata}
                  </p>

                  <p className="text-gray-400 text-sm">
                    Departure: {new Date(flight.departure_time).toLocaleString()}
                  </p>

                  <p className="text-gray-400 text-sm">
                    Arrival: {new Date(flight.arrival_time).toLocaleString()}
                  </p>

                  <span className="inline-block mt-3 text-xs bg-orange-500/20 text-orange-400 px-3 py-1 rounded-full">
                    {flight.status}
                  </span>

                </div>

              ))}

            </div>

          )}

        </div>

      </main>

      <Footer />
    </div>
  );
}