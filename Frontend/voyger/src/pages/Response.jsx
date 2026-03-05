import { useLocation } from "react-router-dom";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import DestinationCard from "../components/DestinationCard";
import PromptBox from "../components/PromptBox";

export default function Response() {

  const location = useLocation();

  const itinerary = location.state?.itinerary || null;

  // Convert itinerary days → cards
  const trips =
    itinerary?.itinerary?.map((day, index) => ({
      id: index,
      image: "https://images.unsplash.com/photo-1512453979798-5ea266f8880c", // fallback image
      title: day.title,
      location: itinerary.destination,
      price: itinerary.estimated_cost || "N/A",
      duration: `Day ${day.day}`,
      rating: "4.8",
      tags: day.activities?.slice(0, 2) || []
    })) || [];

  return (
    <div className="min-h-screen bg-black text-white flex flex-col">

      <Navbar />

      <main className="flex-1 px-6 md:px-16 py-20">

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
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">

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

      </main>

      <Footer />
    </div>
  );
}