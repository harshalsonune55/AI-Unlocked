import Groq from "groq-sdk";

const MODEL = "llama-3.3-70b-versatile";

const SYSTEM_FINAL_JSON = `You are Voyager Final Composer.
You receive planner profile, retriever data, flights, and destination images.
Return ONLY valid JSON with this exact top-level structure and do not include markdown:
{
  "trip_meta": {
    "trip_title": "",
    "destination": "",
    "duration": "",
    "budget": "",
    "travel_style": ""
  },
  "transport": {
    "flights": []
  },
  "stay": {
    "chosen_hotel": {
      "name": "",
      "price_per_night": ""
    },
    "check_in": "",
    "check_out": ""
  },
  "destination_media": {
    "hero_image": {},
    "gallery": []
  },
  "itinerary": [
    {
      "day": 1,
      "title": "",
      "activities": [
        {
          "time": "",
          "from": "",
          "to": "",
          "transport": "",
          "activity": "",
          "estimated_cost": "",
          "image": {}
        }
      ]
    }
  ],
  "practical": {
    "weather": {},
    "tips": [],
    "travel_articles": []
  },
  "estimated_total_cost": ""
}
Important:
- Build a concrete end-to-end plan (no suggestion lists, no alternatives).
- Pick one hotel and create a day-by-day movement plan (from place A to place B).
- Every day should start from hotel or previous location and include explicit transport mode.`;

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

function buildActivitiesForDay({ day, startPoint, places, gallery }) {
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
    const image = gallery[(day * slots.length + i) % Math.max(gallery.length, 1)] || null;

    activities.push({
      time: slots[i].time,
      from,
      to: place,
      transport: slots[i].transport,
      activity: `Visit ${place}`,
      estimated_cost: slots[i].cost,
      image
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
    image: gallery[0] || null
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
        gallery
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
    max_tokens: 1700,
    messages: [
      { role: "system", content: SYSTEM_FINAL_JSON },
      { role: "user", content: userContent }
    ]
  });

  const raw = completion.choices?.[0]?.message?.content || "";
  const parsed = safeJsonParse(raw);

  if (isValidFinalTripShape(parsed)) {
    return parsed;
  }

  return buildFallbackFinalTrip(payload);
}
