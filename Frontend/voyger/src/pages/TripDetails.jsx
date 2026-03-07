import { useEffect, useState } from "react";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import { useSearchParams } from "react-router-dom";

export default function TripDetails() {

  const API = "http://localhost:3001";
  const [searchParams] = useSearchParams();
  const sessionId = searchParams.get("session");

  const [data,setData] = useState(null);
  const [loading,setLoading] = useState(true);

  useEffect(()=>{

    const fetchTrip = async () => {

      try{

        const res = await fetch(`${API}/api/profile/${sessionId}`);
        const json = await res.json();
        setData(json);

      }catch(err){

        console.error(err);

      }finally{

        setLoading(false);

      }

    };

    fetchTrip();

  },[sessionId]);

  if(loading){
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        Loading trip...
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white flex flex-col">

      <Navbar/>

      <main className="flex-1 px-8 md:px-16 py-10">

      {/* HERO IMAGE */}
      <div className="relative rounded-xl overflow-hidden mb-12">

        <img
          src={`https://source.unsplash.com/1600x600/?${data.destination}`}
          className="w-full h-[340px] object-cover"
        />

        <div className="absolute bottom-10 left-10">

          <p className="text-gray-300 text-sm mb-2">
            FEATURED ITINERARY
          </p>

          <h1 className="text-5xl font-bold">
            {data.duration} in {data.destination}
          </h1>

        </div>

      </div>


      {/* MAIN GRID */}
      <div className="grid md:grid-cols-3 gap-10">

      {/* ITINERARY */}
      <div className="md:col-span-2 space-y-10">

        <h2 className="text-3xl font-semibold">
          The Itinerary
        </h2>

        {data.itinerary?.map((day,index)=>(
          
          <div key={index} className="relative pl-10">

            {/* timeline line */}
            <div className="absolute left-0 top-2 w-4 h-4 bg-orange-500 rounded-full"/>

            <h3 className="text-xl font-semibold mb-3">
              Day {day.day}: {day.title}
            </h3>

            <div className="space-y-4">

            {day.activities.map((act,i)=>(
              
              <div
                key={i}
                className="bg-neutral-900 border border-neutral-800 rounded-xl p-4 flex gap-4"
              >

                <img
                  src={`https://source.unsplash.com/200x200/?${data.destination}`}
                  className="w-20 h-20 object-cover rounded-md"
                />

                <div>

                  <p className="font-medium">
                    {act}
                  </p>

                  <p className="text-gray-400 text-sm">
                    Explore {data.destination}
                  </p>

                </div>

              </div>

            ))}

            </div>

          </div>

        ))}

      </div>


      {/* SIDEBAR */}
      <div className="space-y-6">

      {/* MAP */}
      <div className="bg-neutral-900 border border-neutral-800 rounded-xl p-5">

        <h3 className="font-semibold mb-4">
          Map Overview
        </h3>

        <img
          src="https://upload.wikimedia.org/wikipedia/commons/thumb/9/9e/Bali_map.png/640px-Bali_map.png"
          className="rounded-lg"
        />

      </div>


      {/* TRIP TOOLS */}
      <div className="bg-orange-500/10 border border-orange-500/20 rounded-xl p-5">

        <h3 className="font-semibold mb-4">
          Trip Tools
        </h3>

        <div className="grid grid-cols-2 gap-3">

          <button className="bg-neutral-900 p-3 rounded-lg">
            PDF Guide
          </button>

          <button className="bg-neutral-900 p-3 rounded-lg">
            Book Taxis
          </button>

          <button className="bg-neutral-900 p-3 rounded-lg">
            Reservations
          </button>

          <button className="bg-neutral-900 p-3 rounded-lg">
            Weather
          </button>

        </div>

      </div>

      </div>

      </div>

      </main>

      <Footer/>

    </div>
  );
}