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
    "recommended_hostels": []
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
          "name": "",
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
}`;

function safeJsonParse(raw) {
  try {
    return JSON.parse(String(raw).replace(/```json|```/g, "").trim());
  } catch {
    return null;
  }
}

function buildFallbackFinalTrip(payload) {
  const gallery = payload.images || [];
  const heroImage = gallery[0] || null;

  return {
    trip_meta: {
      trip_title: `${payload.destination} Trip Plan`,
      destination: payload.destination,
      duration: payload.profile?.duration || "Custom",
      budget: payload.profile?.budget || "Flexible",
      travel_style: payload.profile?.travelStyle || "Mixed"
    },
    transport: {
      flights: payload.flights || []
    },
    stay: {
      recommended_hostels: (payload.search?.hotels || []).slice(0, 5)
    },
    destination_media: {
      hero_image: heroImage,
      gallery
    },
    itinerary: [
      {
        day: 1,
        title: `Explore ${payload.destination}`,
        activities: (payload.search?.top_places || []).slice(0, 5).map((name, index) => ({
          name,
          estimated_cost: "₹500 - ₹1500",
          image: gallery[index] || heroImage
        }))
      }
    ],
    practical: {
      weather: payload.search?.weather || {},
      tips: payload.search?.travel_tips || [],
      travel_articles: payload.search?.travel_articles || []
    },
    estimated_total_cost: payload.search?.budget_estimate || "₹15000 - ₹45000"
  };
}

function isValidFinalTripShape(result) {
  if (!result || typeof result !== "object") return false;
  const required = ["trip_meta", "transport", "stay", "destination_media", "itinerary", "practical", "estimated_total_cost"];
  return required.every((key) => Object.prototype.hasOwnProperty.call(result, key));
}

export async function composeFinalTrip(payload) {
  if (!process.env.GROQ_API_KEY) {
    return buildFallbackFinalTrip(payload);
  }

  const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

  const userContent = JSON.stringify(payload);

  const completion = await groq.chat.completions.create({
    model: MODEL,
    max_tokens: 1400,
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
