import { useParams, useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";

export default function TripDetails() {
  const { id } = useParams();
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-black text-white">

      <Navbar />

      {/* Hero Section */}
      <div className="relative h-[60vh]">
        <img
          src="https://images.unsplash.com/photo-1505761671935-60b3a7427bad"
          className="w-full h-full object-cover"
          alt=""
        />

        <div className="absolute inset-0 bg-gradient-to-b 
                        from-black/40 to-black"></div>

        <button
          onClick={() => navigate(-1)}
          className="absolute top-6 left-6 bg-black/60 px-4 py-2 
                     rounded-full text-sm"
        >
          ← Back
        </button>

        <div className="absolute bottom-16 left-16">
          <h1 className="text-5xl font-bold">Old Town Heritage</h1>
          <p className="text-gray-300 mt-2">
            Prague, Czech Republic • 3 Days / 2 Nights • ⭐ 4.8
          </p>

          <div className="mt-4 flex items-center gap-6">
            <h2 className="text-3xl font-bold">$899</h2>
            <button className="bg-orange-500 px-6 py-3 rounded-full 
                               hover:bg-orange-600 transition">
              Book Now
            </button>
          </div>
        </div>
      </div>

      {/* Timeline Section */}
      <div className="px-16 py-20 space-y-20">

        {/* Day 1 */}
        <div className="text-center">
          <span className="bg-orange-500 px-6 py-3 rounded-full">
            Day 1 — Arrival & Old Town
          </span>
        </div>

        <div className="grid md:grid-cols-2 gap-16">

          <div className="bg-[#121a2b] rounded-2xl p-6">
            <span className="bg-orange-500 px-3 py-1 rounded-full text-sm">
              9:00 AM
            </span>
            <h3 className="text-xl font-semibold mt-4">
              Arrive at Airport
            </h3>
            <p className="text-gray-400 mt-2">
              Transfer to hotel and check in.
            </p>
          </div>

          <div className="bg-[#121a2b] rounded-2xl p-6">
            <span className="bg-orange-500 px-3 py-1 rounded-full text-sm">
              3:00 PM
            </span>
            <h3 className="text-xl font-semibold mt-4">
              Walking Tour
            </h3>
            <p className="text-gray-400 mt-2">
              Explore cobblestone streets and historic cathedral.
            </p>
          </div>

        </div>

      </div>

      <Footer />
    </div>
  );
}