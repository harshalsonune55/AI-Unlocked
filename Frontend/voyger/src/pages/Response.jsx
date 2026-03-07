import { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import { useSearchParams } from "react-router-dom";


export default function Response() {

  const API = "https://ai-unlocked-backend.onrender.com";

  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const location = useLocation();
  const profile = location.state?.profile;

  const [searchParams] = useSearchParams();
  const sessionId = searchParams.get("session");

  useEffect(() => {

    const fetchTrip = async () => {

      if (!profile) return;

      try {

        const res = await fetch("http://localhost:3000/api/trip", {
          method: "POST",
          headers: {
            "Content-Type": "application/json"
          },
          body: JSON.stringify({
            profile
          })
        });

        const json = await res.json();

        setData(json);

      } catch (err) {

        console.error(err);

      } finally {

        setLoading(false);

      }

    };

    fetchTrip();

  }, [profile]);

  if (loading) {
    return (
      <div className="bg-black text-white min-h-screen flex flex-col items-center justify-center">

        <div className="w-16 h-16 border-4 border-orange-500 border-t-transparent rounded-full animate-spin"></div>

        <p className="mt-6 text-lg text-gray-300">
          Building your travel plan...
        </p>

        <div className="mt-4 text-sm text-gray-500">
          ✈️ Finding flights • 🏨 Selecting hotels • 📍 Planning itinerary
        </div>

      </div>
    );
  }
  if (!data) return <div className="p-10 text-white">Trip not found</div>;

  const calculateTotalCost = () => {

    if (!data) return 0;
  
    let total = 0;
  
    data?.itinerary?.forEach(day => {
      day.activities?.forEach(act => {
  
        const cost = act.estimated_cost?.replace(/[^0-9]/g,"");
        if(cost) total += parseInt(cost);
  
      });
    });
  
    return total;
  };
  
  const totalCost = calculateTotalCost();

  const handlePayment = async () => {

    const res = await fetch("http://localhost:3000/api/create-checkout",{
      method:"POST",
      headers:{
        "Content-Type":"application/json"
      },
      body: JSON.stringify({
        amount: totalCost
      })
    });
  
    const data = await res.json();
  
    window.location = data.url;
  
  };

  return (

    <div className="bg-black text-white min-h-screen">

      <Navbar />

      {/* HERO IMAGE */}

      <div className="relative h-[450px] w-full">

        <img
          src={data?.destination_media?.hero_image?.image_url || "/travel-placeholder.jpg"}
          className="w-full h-full object-cover"
        />

        <div className="absolute bottom-10 left-10">

          <h1 className="text-5xl font-bold">
            {data?.trip_meta?.trip_title}
          </h1>

          <p className="text-lg text-gray-300">
            {data?.trip_meta?.duration}•{data?.trip_meta?.travel_style}
          </p>

        </div>

      </div>

      <div className="max-w-7xl mx-auto px-6 py-10 space-y-12">

        {/* FLIGHTS */}
        <section>

          <h2 className="text-2xl font-semibold mb-6">
            ✈️ Available Flights
          </h2>

          {!data?.transport?.flights?.length && (
            <div className="text-gray-400">
              No flights available
            </div>
          )}

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">

            {data?.transport?.flights?.map((flight, i) => {

              const departure = new Date(flight.departure_time);
              const arrival = new Date(flight.arrival_time);

              return (

                <div
                  key={i}
                  className="bg-neutral-900 rounded-xl p-6 border border-neutral-800 hover:border-orange-500 transition"
                >

                  <div className="flex justify-between items-center mb-3">

                    <h3 className="text-lg font-semibold">
                      {flight.airline}
                    </h3>

                    <span className="text-sm text-gray-400">
                      {flight.flight_number}
                    </span>

                  </div>

                  <div className="flex justify-between items-center">

                    <div>

                      <p className="text-xs text-gray-400">Departure</p>

                      <p className="text-lg font-semibold">
                        {flight.departure_iata}
                      </p>

                      <p className="text-sm text-gray-400">
                        {departure.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </p>

                    </div>

                    <div className="text-gray-500">→</div>

                    <div className="text-right">

                      <p className="text-xs text-gray-400">Arrival</p>

                      <p className="text-lg font-semibold">
                        {flight.arrival_iata}
                      </p>

                      <p className="text-sm text-gray-400">
                        {arrival.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </p>

                    </div>

                  </div>

                  <div className="mt-4 text-sm text-gray-400">
                    <p>{flight.departure_airport}</p>
                    <p>{flight.arrival_airport}</p>
                  </div>

                  <div className="flex justify-between items-center mt-4">

                    <span className="text-green-400 text-sm capitalize">
                      {flight.status}
                    </span>

                    <span className="text-orange-400 font-semibold text-lg">
                      {flight.estimated_price}
                    </span>

                  </div>

                </div>

              );

            })}

          </div>

        </section>



        {/* HOTEL */}

        <section>

          <h2 className="text-2xl font-semibold mb-6">
            Stay
          </h2>

          <div className="bg-neutral-900 p-6 rounded-xl">

            <h3 className="text-xl font-semibold">
              {data.stay.chosen_hotel.name}
            </h3>

            <p className="text-gray-400 mt-1">
              {data.stay.chosen_hotel.price_per_night}
            </p>

            <p className="text-gray-400 mt-2">
              Check in: {data.stay.check_in}
            </p>

            <p className="text-gray-400">
              Check out: {data.stay.check_out}
            </p>

          </div>

        </section>

        {/* DESTINATION GALLERY */}


        <section>

          <h2 className="text-2xl font-semibold mb-6">
            Explore Destination
          </h2>

          <div className="flex gap-6 overflow-x-auto">

            {data?.destination_media?.gallery?.map((img) => (

              <div
                key={img.id}
                className="min-w-[300px]"
              >

                <img
                  src={img.image_url}
                  className="rounded-xl h-[200px] w-full object-cover"
                />

                <p className="text-sm mt-2 text-gray-400">
                  {img.photographer}
                </p>

              </div>

            ))}

          </div>

        </section>

        {/* ITINERARY */}

        <section>

          <h2 className="text-2xl font-semibold mb-6">
            Itinerary
          </h2>

          <div className="space-y-8">

            {data?.itinerary?.map((day) => (

              <div key={day.day}>

                <h3 className="text-xl font-semibold mb-4">
                  Day {day.day} — {day.title}
                </h3>

                <div className="grid md:grid-cols-3 gap-6">

                  {day?.activities?.map((act, i) => (

                    <div
                      key={i}
                      className="bg-neutral-900 rounded-xl overflow-hidden"
                    >

                      <img
                        src={act.image}
                        className="h-[160px] w-full object-cover"
                      />

                      <div className="p-4">

                        <p className="text-sm text-gray-400">
                          {act.time}
                        </p>

                        <h4 className="font-semibold">
                          {act.activity}
                        </h4>

                        <p className="text-sm text-gray-400">
                          {act.transport}
                        </p>

                        <p className="text-orange-400 mt-2">
                          {act.estimated_cost}
                        </p>

                      </div>

                    </div>

                  ))}

                </div>

              </div>

            ))}

          </div>

        </section>

        {/* WEATHER */}

        <section>

          <h2 className="text-2xl font-semibold mb-6">
            Weather
          </h2>

          <div className="bg-neutral-900 p-6 rounded-xl">

            <p>
              Temperature: {data?.practical?.weather?.temp_C}°C
            </p>

            <p>
              Condition: {data?.practical?.weather?.weatherDesc?.[0]?.value}
            </p>

            <p>
              Humidity: {data?.practical?.weather?.humidity}%
            </p>

          </div>

        </section>

        {/* TIPS */}

        <section>

          <h2 className="text-2xl font-semibold mb-6">
            Travel Tips
          </h2>

          <ul className="space-y-2">

            {data?.practical?.tips?.map((tip, i) => (

              <li
                key={i}
                className="bg-neutral-900 p-4 rounded-lg"
              >
                {tip}
              </li>

            ))}

          </ul>

        </section>
        <section>

<h2 className="text-2xl font-semibold mb-6">
💳 Trip Payment
</h2>

<div className="bg-neutral-900 p-6 rounded-xl flex items-center justify-between">

<div>

<p className="text-gray-400">
Estimated Trip Cost
</p>

<p className="text-3xl font-bold text-orange-400">
₹{totalCost}
</p>

</div>

<button
className="bg-orange-500 hover:bg-orange-600 px-6 py-3 rounded-lg font-semibold"
onClick={() => handlePayment()}
>
Pay with Card
</button>

</div>

</section>

      </div>

      <Footer />

    </div>

  );

}