import { useEffect, useState } from "react";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";

export default function Response() {

  const API = "http://localhost:3001";

  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {

    const fetchData = async () => {

      try {

        const res = await fetch(`${API}/api/travel?place=DXB&dep=DEL`);
        const json = await res.json();

        setData(json);

      } catch (err) {
        console.error("API error:", err);
      } finally {
        setLoading(false);
      }

    };

    fetchData();

  }, []);

  return (
    <div className="min-h-screen bg-black text-white flex flex-col">

      <Navbar />

      <main className="flex-1 px-6 md:px-16 py-16 space-y-20">

        {/* GLOBAL LOADER */}
        {loading && (
          <div className="flex flex-col items-center justify-center py-16">
            <div className="w-12 h-12 border-4 border-orange-400 border-t-transparent rounded-full animate-spin"></div>
            <p className="text-gray-400 mt-4">
              Loading destination data...
            </p>
          </div>
        )}

        {/* CONTENT */}
        {!loading && data && (
          <>
            {/* HEADER */}
            <div className="text-center max-w-3xl mx-auto">

              <h1 className="text-5xl font-bold mb-6 capitalize">
                Explore {data.destination}
              </h1>

              <p className="text-gray-400">
                {data.description}
              </p>

            </div>


            {/* WEATHER */}
            <section>

              <h2 className="text-2xl font-semibold mb-4">
                🌤 Current Weather
              </h2>

              <div className="bg-neutral-900 border border-neutral-800 rounded-xl p-6 inline-block">

                <p className="text-lg">
                  {data.weather?.temp_C}°C • {data.weather?.weatherDesc?.[0]?.value}
                </p>

                <p className="text-gray-400 text-sm mt-2">
                  Humidity: {data.weather?.humidity}% • Wind: {data.weather?.windspeedKmph} km/h
                </p>

              </div>

            </section>


            {/* TOP PLACES */}
            <section>

              <h2 className="text-2xl font-semibold mb-6">
                📍 Top Places
              </h2>

              <div className="flex gap-6 overflow-x-auto pb-4">

                {data.top_places?.map((place, index) => (

                  <div
                    key={index}
                    className="min-w-[260px] bg-neutral-900 border border-neutral-800 rounded-xl overflow-hidden"
                  >

                    <img
                      src={place.image}
                      alt={place.name}
                      className="h-44 w-full object-cover"
                    />

                    <div className="p-4">

                      <h3 className="font-semibold">
                        {place.name}
                      </h3>

                    </div>

                  </div>

                ))}

              </div>

            </section>


            {/* HOTELS */}
            <section>

              <h2 className="text-2xl font-semibold mb-6">
                🏨 Hotels
              </h2>

              <div className="flex gap-6 overflow-x-auto pb-4">

                {data.hotels?.map((hotel, index) => (

                  <div
                    key={index}
                    className="min-w-[260px] bg-neutral-900 border border-neutral-800 rounded-xl overflow-hidden"
                  >

                    <img
                      src={hotel.image}
                      alt={hotel.name}
                      className="h-44 w-full object-cover"
                    />

                    <div className="p-4">

                      <h3 className="font-semibold">
                        {hotel.name}
                      </h3>

                      <p className="text-gray-400 text-sm">
                        {hotel.price_per_night}
                      </p>

                    </div>

                  </div>

                ))}

              </div>

            </section>


            {/* FLIGHTS */}
            <section>

              <h2 className="text-2xl font-semibold mb-6">
                ✈ Available Flights
              </h2>

              <div className="grid md:grid-cols-2 gap-6">

                {data.flights?.length === 0 && (
                  <p className="text-gray-400">
                    No flights available
                  </p>
                )}

                {data.flights?.map((flight, index) => (

                  <div
                    key={index}
                    className="bg-neutral-900 border border-neutral-800 rounded-xl p-6"
                  >

                    <h3 className="text-lg font-semibold mb-2">
                      {flight.airline}
                    </h3>

                    <p className="text-gray-400 text-sm">
                      Flight: {flight.flight_number}
                    </p>

                    <p className="mt-2">
                      {flight.departure_airport} → {flight.arrival_airport}
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

            </section>


            {/* TRAVEL ARTICLES */}
            <section>

              <h2 className="text-2xl font-semibold mb-6">
                📰 Travel Articles
              </h2>

              <div className="space-y-4">

                {data.travel_articles?.map((article, index) => (

                  <a
                    key={index}
                    href={article.link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block bg-neutral-900 border border-neutral-800 p-4 rounded-xl hover:border-neutral-700"
                  >

                    {article.title}

                  </a>

                ))}

              </div>

            </section>


            {/* TRAVEL TIPS */}
            <section>

              <h2 className="text-2xl font-semibold mb-6">
                💡 Travel Tips
              </h2>

              <ul className="space-y-2 text-gray-300">

                {data.travel_tips?.map((tip, index) => (

                  <li key={index}>
                    • {tip}
                  </li>

                ))}

              </ul>

            </section>


            {/* BUDGET */}
            <section>

              <h2 className="text-2xl font-semibold mb-4">
                💰 Budget Estimate
              </h2>

              <p className="text-orange-400 text-lg">
                {data.budget_estimate}
              </p>

            </section>
          </>
        )}

      </main>

      <Footer />

    </div>
  );
}