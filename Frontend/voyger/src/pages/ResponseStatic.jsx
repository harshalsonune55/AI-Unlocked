import { useEffect, useState } from "react";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";

export default function Response() {

const [data,setData] = useState(null);
const [loading,setLoading] = useState(true);

useEffect(()=>{

const mockData = {
  "trip_summary": {
       "trip_title": "Paris Trip",
       "starting_city": "Delhi",
       "destination_city": "Paris",
       "duration_days": 67,
       "travel_style": "relaxed",
       "budget_per_person": "200000",
       "best_time_to_visit": "Spring and Autumn"
   },
   "flight_options": {
       "departure_flights": [
           {
               "airline": "Air India",
               "flight_number": "AI123",
               "departure_airport": "DEL",
               "arrival_airport": "CDG",
               "departure_time": "10:00",
               "arrival_time": "16:00",
               "duration": "8 hours",
               "estimated_price": "50000"
           },
           {
               "airline": "Emirates",
               "flight_number": "EK456",
               "departure_airport": "DEL",
               "arrival_airport": "CDG",
               "departure_time": "14:00",
               "arrival_time": "20:00",
               "duration": "8 hours",
               "estimated_price": "60000"
           },
           {
               "airline": "Lufthansa",
               "flight_number": "LH789",
               "departure_airport": "DEL",
               "arrival_airport": "CDG",
               "departure_time": "18:00",
               "arrival_time": "00:00",
               "duration": "8 hours",
               "estimated_price": "55000"
           }
       ],
       "return_flights": [
           {
               "airline": "Air India",
               "flight_number": "AI456",
               "departure_airport": "CDG",
               "arrival_airport": "DEL",
               "departure_time": "10:00",
               "arrival_time": "20:00",
               "duration": "10 hours",
               "estimated_price": "50000"
           },
           {
               "airline": "Emirates",
               "flight_number": "EK123",
               "departure_airport": "CDG",
               "arrival_airport": "DEL",
               "departure_time": "14:00",
               "arrival_time": "00:00",
               "duration": "10 hours",
               "estimated_price": "60000"
           },
           {
               "airline": "Lufthansa",
               "flight_number": "LH234",
               "departure_airport": "CDG",
               "arrival_airport": "DEL",
               "departure_time": "18:00",
               "arrival_time": "04:00",
               "duration": "10 hours",
               "estimated_price": "55000"
           }
       ]
   },
   "hotel_options": [
       {
           "name": "Hotel Eiffel",
           "location": "Paris City Centre",
           "rating": "4 stars",
           "price_per_night": "10000",
           "amenities": ["Free Wi-Fi", "Breakfast Included", "Gym"]
       },
       {
           "name": "Hotel Louvre",
           "location": "Paris City Centre",
           "rating": "5 stars",
           "price_per_night": "15000",
           "amenities": ["Free Wi-Fi", "Breakfast Included", "Gym", "Spa"]
       },
       {
           "name": "Hotel Arc de Triomphe",
           "location": "Paris City Centre",
           "rating": "4 stars",
           "price_per_night": "12000",
           "amenities": ["Free Wi-Fi", "Breakfast Included", "Gym"]
       }
   ],
   "itinerary_overview": [
       {
           "day": 1,
           "title": "Arrival in Paris",
           "summary": "Arrive at Charles de Gaulle Airport and check-in to hotel"
       },
       {
           "day": 2,
           "title": "Explore Paris City Centre",
           "summary": "Visit the Eiffel Tower, Louvre Museum, and Notre-Dame Cathedral"
       },
       {
           "day": 3,
           "title": "Montmartre and Sacre-Coeur",
           "summary": "Explore the charming neighborhood of Montmartre and visit the Sacre-Coeur Basilica"
       },
       {
           "day": 4,
           "title": "Palace of Versailles",
           "summary": "Take a day trip to the Palace of Versailles"
       },
       {
           "day": 5,
           "title": "River Seine Cruise",
           "summary": "Take a river cruise along the Seine and enjoy the city's landmarks"
       }
   ],
   "detailed_itinerary": [
       {
           "day": 1,
           "morning": {
               "activity": "Check-in to hotel",
               "place": "Hotel Eiffel",
               "description": "Arrive at the hotel and freshen up"
           },
           "afternoon": {
               "activity": "Explore Paris City Centre",
               "place": "Champs-Elysees",
               "description": "Walk along the famous Champs-Elysees and visit the Arc de Triomphe"
           },
           "evening": {
               "activity": "Dinner at a Parisian bistro",
               "place": "Le Comptoir du Relais",
               "description": "Enjoy a traditional French dinner"
           }
       },
       {
           "day": 2,
           "morning": {
               "activity": "Visit the Eiffel Tower",
               "place": "Eiffel Tower",
               "description": "Take the elevator to the top for stunning views"
           },
           "afternoon": {
               "activity": "Visit the Louvre Museum",
               "place": "Louvre Museum",
               "description": "See the Mona Lisa and other famous artworks"
           },
           "evening": {
               "activity": "River Seine Cruise",
               "place": "River Seine",
               "description": "Take a romantic cruise along the Seine"
           }
       },
       {
           "day": 3,
           "morning": {
               "activity": "Explore Montmartre",
               "place": "Montmartre",
               "description": "Walk through the charming streets and visit the Sacre-Coeur Basilica"
           },
           "afternoon": {
               "activity": "Visit the Palace of Versailles",
               "place": "Palace of Versailles",
               "description": "Take a day trip to the famous palace"
           },
           "evening": {
               "activity": "Dinner at a Michelin-starred restaurant",
               "place": "Le Bernardin",
               "description": "Enjoy a gourmet dinner"
           }
       }
   ],
   "tourist_places": [
       {
           "name": "Eiffel Tower",
           "description": "The iconic iron lattice tower",
           "entry_fee": "17 euros",
           "best_time_to_visit": "Sunset"
       },
       {
           "name": "Louvre Museum",
           "description": "One of the world's largest and most famous museums",
           "entry_fee": "18 euros",
           "best_time_to_visit": "Morning"
       },
       {
           "name": "Notre-Dame Cathedral",
           "description": "The beautiful and historic cathedral",
           "entry_fee": "Free",
           "best_time_to_visit": "Afternoon"
       },
       {
           "name": "Montmartre",
           "description": "The charming neighborhood with narrow streets and artist studios",
           "entry_fee": "Free",
           "best_time_to_visit": "Morning"
       },
       {
           "name": "Palace of Versailles",
           "description": "The former royal palace with stunning gardens and fountains",
           "entry_fee": "20 euros",
           "best_time_to_visit": "Afternoon"
       }
   ],
   "estimated_trip_cost": {
       "flight_cost_estimate": "100000",
       "hotel_cost_estimate": "100000",
       "food_and_transport": "50000",
       "activities": "20000",
       "total_estimated_cost": "250000"
   },
   "travel_tips": [
       "Carry a reusable water bottle and stay hydrated",
       "Start major attractions early to avoid crowds",
       "Keep digital and offline copies of important bookings",
       "Carry warm layers for mornings and evenings"
   ]
};

setData(mockData);
setLoading(false);

},[]);

if(loading){
return(
<div className="bg-black text-white min-h-screen flex items-center justify-center">
Loading Trip...
</div>
);
}

const totalCost = Number(data?.estimated_trip_cost?.total_estimated_cost || 0);

return(

<div className="bg-black text-white min-h-screen">

<Navbar/>

{/* HERO */}

<div className="relative h-[400px] w-full bg-neutral-900 flex items-center justify-center">

<div className="text-center">

<h1 className="text-5xl font-bold">
{data?.trip_summary?.trip_title}
</h1>

<p className="text-gray-400 mt-2">
{data?.trip_summary?.starting_city} → {data?.trip_summary?.destination_city}
</p>

<p className="text-gray-400">
{data?.trip_summary?.duration_days} days • {data?.trip_summary?.travel_style}
</p>

</div>

</div>

<div className="max-w-7xl mx-auto px-6 py-10 space-y-12">

{/* DEPARTURE FLIGHTS */}

<section>

<h2 className="text-2xl font-semibold mb-6">
✈️ Departure Flights
</h2>

<div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">

{data?.flight_options?.departure_flights?.map((flight,i)=>(
<div key={i} className="bg-neutral-900 p-6 rounded-xl">

<h3 className="font-semibold text-lg">
{flight.airline}
</h3>

<p className="text-gray-400">
Flight: {flight.flight_number}
</p>

<p className="text-gray-400">
{flight.departure_airport} → {flight.arrival_airport}
</p>

<p className="text-gray-400">
{flight.departure_time} → {flight.arrival_time}
</p>

<p className="text-orange-400 mt-3 font-semibold">
₹{flight.estimated_price}
</p>

</div>
))}

</div>

</section>

{/* RETURN FLIGHTS */}

<section>

<h2 className="text-2xl font-semibold mb-6">
✈️ Return Flights
</h2>

<div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">

{data?.flight_options?.return_flights?.map((flight,i)=>(
<div key={i} className="bg-neutral-900 p-6 rounded-xl">

<h3 className="font-semibold text-lg">
{flight.airline}
</h3>

<p className="text-gray-400">
Flight: {flight.flight_number}
</p>

<p className="text-gray-400">
{flight.departure_airport} → {flight.arrival_airport}
</p>

<p className="text-gray-400">
{flight.departure_time} → {flight.arrival_time}
</p>

<p className="text-orange-400 mt-3 font-semibold">
₹{flight.estimated_price}
</p>

</div>
))}

</div>

</section>

{/* HOTELS */}

<section>

<h2 className="text-2xl font-semibold mb-6">
🏨 Hotels
</h2>

<div className="grid md:grid-cols-3 gap-6">

{data?.hotel_options?.map((hotel,i)=>(
<div key={i} className="bg-neutral-900 p-6 rounded-xl">

<h3 className="font-semibold text-lg">
{hotel.name}
</h3>

<p className="text-gray-400">
{hotel.location}
</p>

<p className="text-gray-400">
{hotel.rating}
</p>

<p className="text-orange-400 mt-2">
₹{hotel.price_per_night}/night
</p>

</div>
))}

</div>

</section>

{/* ITINERARY OVERVIEW */}

<section>

<h2 className="text-2xl font-semibold mb-6">
📅 Itinerary
</h2>

<div className="space-y-4">

{data?.itinerary_overview?.map((day,i)=>(
<div key={i} className="bg-neutral-900 p-6 rounded-xl">

<h3 className="font-semibold">
Day {day.day}: {day.title}
</h3>

<p className="text-gray-400 mt-2">
{day.summary}
</p>

</div>
))}

</div>

</section>

{/* TOURIST PLACES */}

<section>

<h2 className="text-2xl font-semibold mb-6">
📍 Tourist Places
</h2>

<div className="grid md:grid-cols-3 gap-6">

{data?.tourist_places?.map((place,i)=>(
<div key={i} className="bg-neutral-900 p-6 rounded-xl">

<h3 className="font-semibold">
{place.name}
</h3>

<p className="text-gray-400 mt-2">
{place.description}
</p>

<p className="text-orange-400 mt-2">
Entry Fee: {place.entry_fee}
</p>

</div>
))}

</div>

</section>

{/* TRAVEL TIPS */}

<section>

<h2 className="text-2xl font-semibold mb-6">
💡 Travel Tips
</h2>

<ul className="space-y-2">

{data?.travel_tips?.map((tip,i)=>(
<li key={i} className="bg-neutral-900 p-4 rounded-lg">
{tip}
</li>
))}

</ul>

</section>

{/* PAYMENT */}

<section>

<h2 className="text-2xl font-semibold mb-6">
💳 Trip Payment
</h2>

<div className="bg-neutral-900 p-6 rounded-xl flex justify-between items-center">

<div>

<p className="text-gray-400">
Estimated Trip Cost
</p>

<p className="text-3xl font-bold text-orange-400">
₹{totalCost.toLocaleString()}
</p>

</div>

<button
className="bg-orange-500 hover:bg-orange-600 px-6 py-3 rounded-lg font-semibold"
>

Pay with Card

</button>

</div>

</section>

</div>

<Footer/>

</div>

);
}