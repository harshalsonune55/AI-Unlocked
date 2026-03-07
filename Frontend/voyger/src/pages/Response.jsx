import { useEffect, useState } from "react";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import { useSearchParams } from "react-router-dom";



const fakeTrip = {
  destination: "Bali",
  duration: "7 Days",
  travelStyle: "Beach & Adventure",

  itineraries: [
    {
      id: "it1",
      title: "Beach Paradise",
      activities: [
        "Arrival at Ngurah Rai Airport",
        "Relax at Seminyak Beach",
        "Sunset dinner by the sea"
      ]
    },
    {
      id: "it2",
      title: "Temple & Culture",
      activities: [
        "Visit Tanah Lot Temple",
        "Explore Ubud Monkey Forest",
        "Balinese traditional dance show"
      ]
    },
    {
      id: "it3",
      title: "Adventure Bali",
      activities: [
        "Mount Batur sunrise trek",
        "Waterfall hike",
        "Snorkeling at Nusa Penida"
      ]
    }
  ],

  recommended_hotels: [
    "W Bali Seminyak",
    "Alila Ubud",
    "Ayana Resort Bali"
  ],

  tips: [
    "Carry sunscreen and sunglasses",
    "Respect temple dress codes",
    "Use ride apps like Grab or Gojek"
  ],

  estimated_cost: "$1200 – $1800 per person"
};

/* ---------------- COMPONENT ---------------- */

export default function Response() {

  const API = "http://localhost:3001";

  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  const [searchParams] = useSearchParams();
  const sessionId = searchParams.get("session");

  useEffect(() => {

    const fetchData = async () => {

      try {

        const res = await fetch(`${API}/api/profile/${sessionId}`);
        const json = await res.json();

        if (!json || json.error) {
          setData(fakeTrip);
        } else {
          setData(json);
        }

      } catch (err) {

        console.error("API error:", err);
        setData(fakeTrip);

      } finally {

        setLoading(false);

      }

    };

    fetchData();

  }, [sessionId]);

  return (
    <div className="min-h-screen bg-black text-white flex flex-col">

      <Navbar />

      <main className="flex-1 px-6 md:px-16 py-12">

        {/* LOADER */}
        {loading && (
          <div className="flex justify-center items-center py-24">
            <div className="w-10 h-10 border-4 border-orange-500 border-t-transparent rounded-full animate-spin"/>
          </div>
        )}

        {!loading && data && (
          <>

          {/* HEADER */}
          <div className="max-w-4xl mb-12">

            <h1 className="text-5xl font-bold mb-3">
              Your AI Generated Trip
            </h1>

            <p className="text-gray-400">
              {data.destination} • {data.duration} • {data.travelStyle}
            </p>

          </div>

          {/* ITINERARY OPTIONS */}
          <div className="space-y-8">

          {data.itineraries?.map((trip,index)=>(
          
          <div
            key={index}
            className="flex flex-col md:flex-row bg-neutral-900 border border-neutral-800 rounded-xl overflow-hidden"
          >

            {/* IMAGE */}
            <img
              src={`https://source.unsplash.com/600x400/?${data.destination}`}
              className="w-full md:w-[320px] object-cover"
              alt="destination"
            />

            {/* CONTENT */}
            <div className="flex flex-col justify-between p-6 flex-1">

              <div>

                <h2 className="text-2xl font-semibold mb-2">
                  {trip.title}
                </h2>

                <p className="text-gray-400 mb-4">
                  {data.destination} travel plan
                </p>

                <ul className="text-gray-300 space-y-1 text-sm">

                  {trip.activities?.map((act,i)=>(
                    <li key={i}>• {act}</li>
                  ))}

                </ul>

              </div>

              <div className="flex items-center justify-between mt-6">

                <span className="text-xs bg-orange-500/20 text-orange-400 px-3 py-1 rounded-full">
                  AI Generated
                </span>

                <button
                  onClick={() => window.location.href = `/trip?session=${sessionId}&it=${trip.id}`}
                  className="bg-orange-500 hover:bg-orange-600 px-5 py-2 rounded-lg text-sm font-medium"
                >
                  View Details
                </button>

              </div>

            </div>

          </div>

          ))}

          </div>


          {/* HOTELS */}
          {data.recommended_hotels && (

          <section className="mt-16">

            <h2 className="text-2xl font-semibold mb-6">
              🏨 Recommended Hotels
            </h2>

            <div className="grid md:grid-cols-3 gap-6">

              {data.recommended_hotels.map((hotel,index)=>(
              
              <div
                key={index}
                className="bg-neutral-900 border border-neutral-800 rounded-xl p-5"
              >

                <h3 className="font-semibold mb-1">
                  {hotel}
                </h3>

                <p className="text-gray-400 text-sm">
                  Great location for exploring {data.destination}
                </p>

              </div>

              ))}

            </div>

          </section>
          )}


          {/* TIPS */}
          {data.tips && (

          <section className="mt-16">

            <h2 className="text-2xl font-semibold mb-6">
              💡 Travel Tips
            </h2>

            <ul className="space-y-2 text-gray-300">

              {data.tips.map((tip,index)=>(
                <li key={index}>• {tip}</li>
              ))}

            </ul>

          </section>

          )}

          {/* BUDGET */}
          {data.estimated_cost && (

          <section className="mt-16">

            <h2 className="text-2xl font-semibold mb-4">
              💰 Estimated Budget
            </h2>

            <p className="text-orange-400 text-lg">
              {data.estimated_cost}
            </p>

          </section>

          )}

          </>
        )}

      </main>

      <Footer />

    </div>
  );
}