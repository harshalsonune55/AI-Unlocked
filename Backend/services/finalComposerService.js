import Groq from "groq-sdk";

const MODEL = "llama-3.3-70b-versatile";

const SYSTEM_WRAP = `
You are Voyager, an expert AI travel planner.

You will receive a traveler profile. Using that information, generate a FULL travel itinerary.

You MUST follow these rules:

1. Return ONLY valid JSON.
2. Do NOT include explanations.
3. Do NOT include markdown.
4. Do NOT add text before or after the JSON.
5. All keys in the schema MUST be present.
6. If a value is unknown, still include the key with an empty value.
7. Provide at least:
   - 3 departure flights
   - 3 return flights
   - 3 hotel options
   - 5 tourist places
8. If flight prices are missing from data, ESTIMATE realistic prices based on route distance.
9. Hotel must include price_per_night.
10. Itinerary must include activities for morning, afternoon, and evening for each day.

Return JSON using EXACTLY this structure:

{
  "trip_summary": {
    "trip_title": "",
    "starting_city": "",
    "destination_city": "",
    "duration_days": 0,
    "travel_style": "",
    "budget_per_person": "",
    "best_time_to_visit": ""
  },

  "flight_options": {
    "departure_flights": [
      {
        "airline": "",
        "flight_number": "",
        "departure_airport": "",
        "arrival_airport": "",
        "departure_time": "",
        "arrival_time": "",
        "duration": "",
        "estimated_price": ""
      }
    ],

    "return_flights": [
      {
        "airline": "",
        "flight_number": "",
        "departure_airport": "",
        "arrival_airport": "",
        "departure_time": "",
        "arrival_time": "",
        "duration": "",
        "estimated_price": ""
      }
    ]
  },

  "hotel_options": [
    {
      "name": "",
      "location": "",
      "rating": "",
      "price_per_night": "",
      "amenities": []
    }
  ],

  "itinerary_overview": [
    {
      "day": 1,
      "title": "",
      "summary": ""
    }
  ],

  "detailed_itinerary": [
    {
      "day": 1,
      "morning": {
        "activity": "",
        "place": "",
        "description": ""
      },
      "afternoon": {
        "activity": "",
        "place": "",
        "description": ""
      },
      "evening": {
        "activity": "",
        "place": "",
        "description": ""
      }
    }
  ],

  "tourist_places": [
    {
      "name": "",
      "description": "",
      "entry_fee": "",
      "best_time_to_visit": ""
    }
  ],

  "estimated_trip_cost": {
    "flight_cost_estimate": "",
    "hotel_cost_estimate": "",
    "food_and_transport": "",
    "activities": "",
    "total_estimated_cost": ""
  },

  "travel_tips": []
}
`;



function safeJsonParse(raw) {
  try {
    const cleaned = String(raw)
      .replace(/^```json\s*/i, "")
      .replace(/^```\s*/i, "")
      .replace(/```\s*$/i, "")
      .trim();
    return JSON.parse(cleaned);
  } catch {
    return null;
  }
}

function parseTripDays(durationText) {
  const match = String(durationText || "").match(/(\d+)/);
  const parsed = match ? Number(match[1]) : 3;
  if (!Number.isFinite(parsed) || parsed < 1) return 3;
  return Math.min(parsed, 10);
}

function buildActivitiesForDay({ day, startPoint, places, gallery, hotel }) {
  const slots = [
    { time: "08:30", transport: "Walk/Auto", cost: "₹100 - ₹250" },
    { time: "11:30", transport: "Auto/Ride", cost: "₹150 - ₹400" },
    { time: "15:30", transport: "Auto", cost: "₹100 - ₹300" },
    { time: "19:00", transport: "Walk", cost: "₹0 - ₹200" }
  ];

  const activities = [];
  let from = startPoint;

  for (let i = 0; i < slots.length; i += 1) {

    const place = places[(day * slots.length + i) % places.length];

    const imageObj =
      gallery[(day * slots.length + i) % Math.max(gallery.length, 1)] || null;

    const imageUrl =
      typeof imageObj === "string"
        ? imageObj
        : imageObj?.image_url || imageObj?.thumbnail_url || null;

    activities.push({
      time: slots[i].time,
      from,
      to: place,
      transport: slots[i].transport,
      activity: `Visit ${place}`,
      estimated_cost: slots[i].cost,

      /* image attached to itinerary activity */
      image: imageUrl,

      /* hotel reference for that day */
      hotel: {
        name: hotel?.name || "",
        price_per_night: hotel?.price_per_night || "",
        location: hotel?.location || ""
      }
    });

    from = place;
  }

  activities.push({
    time: "21:00",
    from,
    to: startPoint,
    transport: "Auto/Ride",
    activity: "Return to hotel and rest",
    estimated_cost: "₹100 - ₹300",

    image:
      typeof gallery?.[0] === "string"
        ? gallery[0]
        : gallery?.[0]?.image_url || gallery?.[0]?.thumbnail_url || null,

    hotel: {
      name: hotel?.name || "",
      price_per_night: hotel?.price_per_night || "",
      location: hotel?.location || ""
    }
  });

  return activities;
}

function buildFallbackFinalTrip(payload) {
  const gallery = payload.images || [];
  const heroImage = gallery[0] || null;
  const chosenHotel = payload.search?.hotels?.[0] || {
    name: `Central Stay ${payload.destination}`,
    price_per_night: "₹1200 - ₹2000"
  };
  const durationDays = parseTripDays(payload.profile?.duration);
  const topPlaces = (payload.search?.top_places || [
    `${payload.destination} Riverside Walk`,
    `${payload.destination} Main Temple`,
    `${payload.destination} Local Cafe`,
    `${payload.destination} Market Area`
  ]).filter(Boolean);

  const itinerary = Array.from({ length: durationDays }, (_, idx) => {
    const day = idx + 1;
    return {
      day,
      title: day === 1 ? "Arrival and local exploration" : `Explore ${payload.destination} - Day ${day}`,
      activities: buildActivitiesForDay({
        day: idx,
        startPoint: chosenHotel.name,
        places: topPlaces,
        gallery,
        hotel: chosenHotel
      })
    };
  });

  return {
    trip_meta: {
      trip_title: `${payload.destination} Complete Trip Plan`,
      destination: payload.destination,
      duration: `${durationDays} days`,
      budget: payload.profile?.budget || "Flexible",
      travel_style: payload.profile?.travelStyle || "Mixed"
    },
    transport: {
      flights: payload.flights || []
    },
    stay: {
      chosen_hotel: chosenHotel,
      check_in: "Day 1, 12:00",
      check_out: `Day ${durationDays}, 11:00`
    },
    destination_media: {
      hero_image: heroImage,
      gallery
    },
    itinerary,
    practical: {
      weather: payload.search?.weather || {},
      tips: payload.search?.travel_tips || [],
      travel_articles: payload.search?.travel_articles || []
    },
    estimated_total_cost: payload.search?.budget_estimate || "₹15000 - ₹45000"
  };
}

function isValidActivity(activity) {
  if (!activity || typeof activity !== "object") return false;
  const keys = ["time", "from", "to", "transport", "activity", "estimated_cost"];
  return keys.every((k) => typeof activity[k] === "string" && activity[k].trim().length > 0);
}

function isValidFinalTripShape(result) {
  if (!result || typeof result !== "object") return false;
  const required = ["trip_meta", "transport", "stay", "destination_media", "itinerary", "practical", "estimated_total_cost"];
  if (!required.every((key) => Object.prototype.hasOwnProperty.call(result, key))) return false;
  if (!result.stay?.chosen_hotel?.name) return false;
  if (!Array.isArray(result.itinerary) || result.itinerary.length === 0) return false;

  return result.itinerary.every((day) =>
    day && typeof day === "object" &&
    Array.isArray(day.activities) &&
    day.activities.length > 0 &&
    day.activities.every(isValidActivity)
  );
}

export async function composeFinalTrip(payload) {
  if (!process.env.GROQ_API_KEY) {
    return buildFallbackFinalTrip(payload);
  }

  const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });
  const userContent = JSON.stringify(payload);

  const completion = await groq.chat.completions.create({
    model: MODEL,
    temperature: 0.2,
    max_tokens: 2500,
    response_format: { type: "json_object" },
    messages: [
      { role: "system", content: SYSTEM_WRAP },
      { role: "user", content: userContent }
    ]
  });

  const raw = completion.choices?.[0]?.message?.content || "";
  console.log(raw);
  const parsed = safeJsonParse(raw);

  if (parsed) {

    const departureFlights = parsed.flight_options?.departure_flights || [];
    const returnFlights = parsed.flight_options?.return_flights || [];
  
    const chosenHotel = parsed.hotel_options?.[0] || {};
  
    return {
      trip_meta: {
        trip_title: parsed.trip_summary?.trip_title || "",
        destination: parsed.trip_summary?.destination_city || "",
        duration: `${parsed.trip_summary?.duration_days || 3} days`,
        budget: parsed.trip_summary?.budget_per_person || "",
        travel_style: parsed.trip_summary?.travel_style || ""
      },
  
      transport: {
        departure_flights: departureFlights.map(f => ({
          airline: f.airline,
          flight_number: f.flight_number,
          departure_airport: f.departure_airport,
          arrival_airport: f.arrival_airport,
          departure_time: f.departure_time,
          arrival_time: f.arrival_time,
          duration: f.duration,
          estimated_price: Number(f.estimated_price || 0)
        })),
  
        return_flights: returnFlights.map(f => ({
          airline: f.airline,
          flight_number: f.flight_number,
          departure_airport: f.departure_airport,
          arrival_airport: f.arrival_airport,
          departure_time: f.departure_time,
          arrival_time: f.arrival_time,
          duration: f.duration,
          estimated_price: Number(f.estimated_price || 0)
        }))
      },
  
      stay: {
        chosen_hotel: {
          name: chosenHotel.name || "",
          price_per_night: chosenHotel.price_per_night || "",
          location: chosenHotel.location || ""
        },
        check_in: "Day 1",
        check_out: `Day ${parsed.trip_summary?.duration_days || 3}`
      },
  
      destination_media: {
        hero_image: payload.images?.[0] || {},
        gallery: payload.images || []
      },
  
      itinerary: parsed.detailed_itinerary?.map(day => ({
        day: day.day,
        title: `Day ${day.day} Activities`,
        activities: [
          {
            time: "Morning",
            activity: day.morning.activity,
            transport: "Local transport",
            estimated_cost: "₹200 - ₹500",
            image: payload.images?.[0]?.image_url
          },
          {
            time: "Afternoon",
            activity: day.afternoon.activity,
            transport: "Local transport",
            estimated_cost: "₹200 - ₹500",
            image: payload.images?.[1]?.image_url
          },
          {
            time: "Evening",
            activity: day.evening.activity,
            transport: "Local transport",
            estimated_cost: "₹200 - ₹500",
            image: payload.images?.[2]?.image_url
          }
        ]
      })) || [],
  
      practical: {
        weather: payload.search?.weather || {},
        tips: parsed.travel_tips || []
      },
  
      estimated_trip_cost: {
        flight_cost_estimate: parsed.estimated_trip_cost?.flight_cost_estimate || "",
        hotel_cost_estimate: parsed.estimated_trip_cost?.hotel_cost_estimate || "",
        food_and_transport: parsed.estimated_trip_cost?.food_and_transport || "",
        activities: parsed.estimated_trip_cost?.activities || "",
        total_estimated_cost: Number(parsed.estimated_trip_cost?.total_estimated_cost || 0)
      }
    };
  }

  return buildFallbackFinalTrip(payload);
}
