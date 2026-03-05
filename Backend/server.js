
import "dotenv/config";
import express from "express";
import cors from "cors";
import Groq from "groq-sdk";
import fs from "fs";
import { randomUUID } from "crypto";
import connectDB from "./config/db.js";
import passport from "./config/passport.js";
import authRoutes from "./routes/auth.js";
import session from "express-session";
import flightRoutes from "./routes/flights.js";

const app = express();
app.use(cors());
app.use(express.json());
app.use(session({
  secret: "voyager_secret",
  resave: false,
  saveUninitialized: false
}));

app.use(passport.initialize());
app.use(passport.session());
app.use("/api/auth", authRoutes);
app.use("/api/flights", flightRoutes);

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });
const MODEL = "llama-3.3-70b-versatile"; 

const PROFILES_FILE = "./profiles.json";
if (!fs.existsSync(PROFILES_FILE)) fs.writeFileSync(PROFILES_FILE, "{}");

const loadProfiles = () => JSON.parse(fs.readFileSync(PROFILES_FILE, "utf-8"));
const saveProfiles = (data) => fs.writeFileSync(PROFILES_FILE, JSON.stringify(data, null, 2));
connectDB();


const sessions = new Map();


const STAGES = {
  IDLE:        "idle",
  NOT_SERIOUS: "not_serious",
  PERSONA:     "persona",
  REFINE:      "refine",
  DONE:        "done",
};

const PERSONA_QUESTIONS = [
  "Where are you planning to go? (Destination or region — even a rough idea works!)",
  "What's your budget per person? (e.g. ₹10,000, $300, or just 'tight' / 'flexible')",
  "How many days are you thinking for this trip?",
  "Who's travelling — solo, couple, a group of friends, or family?",
  "How would you describe your travel style? (Adventure backpacking, cultural exploration, leisure & comfort, luxury, mix…)",
];

const REFINE_QUESTIONS = [
  "What are your top 2–3 must-haves on this trip? (e.g. trekking, local street food, photography spots, nightlife, historical sites…)",
  "Any hard constraints or deal-breakers? (dietary needs, accessibility, specific dates, budget ceiling, avoid crowds…)",
];


const SYSTEM_DETECT = `You are Voyager, an AI travel planning assistant doing intent detection.
A user just sent their very first message. Decide if they are SERIOUS about planning a real trip,
or just casually testing/chatting/sending something off-topic.

Reply ONLY with valid JSON — no prose, no markdown fences:
{"serious": true, "reason": "one sentence"}
or
{"serious": false, "reason": "one sentence"}

Be generous: any travel intent at all → serious: true.
Mark false ONLY for obvious off-topic / test / greeting-only messages with zero travel intent.`;

const SYSTEM_BRIDGE = `You are Voyager, a warm and sharp AI travel assistant building a traveler profile.
The user just answered a question. Your job:
1. One brief natural acknowledgement of their answer (1 sentence, avoid filler like "Great!" or "Awesome!").
2. Immediately ask the next question given to you.
Keep it conversational — like a well-travelled friend. Do NOT add tips, suggestions, or extra questions.`;

const SYSTEM_WRAP = `You are Voyager, an expert travel planner.

Using the traveler profile, generate a structured travel itinerary.

Return ONLY valid JSON with this structure:

{
  "trip_title": "",
  "destination": "",
  "duration": "",
  "budget": "",
  "travel_style": "",
  "itinerary": [
    {
      "day": 1,
      "title": "",
      "activities": []
    }
  ],
  "estimated_cost": "",
  "recommended_hotels": [],
  "tips": []
}

Do not return text explanations. Return ONLY JSON.`;

const SYSTEM_ASSISTANT = `You are Voyager, a brilliant AI travel assistant. The user has a saved trip profile (provided in the message).
Be helpful, specific, and excited about their trip. Answer questions, suggest ideas, and help them plan.`;


async function chat(systemPrompt, userContent) {
  const res = await groq.chat.completions.create({
    model: MODEL,
    max_tokens: 1024,
    messages: [
      { role: "system", content: systemPrompt },
      { role: "user",   content: userContent  },
    ],
  });
  return res.choices[0].message.content || "";
}


function newSession() {
  return {
    id: randomUUID(),
    stage: STAGES.IDLE,
    personaAnswers: [],  
    refineAnswers: [],   
    qIndex: 0,
    profile: null,
    createdAt: new Date().toISOString(),
  };
}

function getProgress(s) {
  const total    = PERSONA_QUESTIONS.length + REFINE_QUESTIONS.length;
  const answered = s.personaAnswers.length + s.refineAnswers.length;
  return {
    answered,
    total,
    percent: Math.round((answered / total) * 100),
    phase: s.stage,
  };
}




app.post("/api/session", (req, res) => {
  const s = newSession();
  sessions.set(s.id, s);
  res.json({ sessionId: s.id });
});


app.post("/api/chat", async (req, res) => {
  const { sessionId, message } = req.body;

  if (!sessionId || !message?.trim())
    return res.status(400).json({ error: "sessionId and message are required" });

  const s = sessions.get(sessionId);
  if (!s)
    return res.status(404).json({ error: "Session not found. Call POST /api/session first." });

  const userText = message.trim();
  let reply = "";

  try {


    if (s.stage === STAGES.IDLE) {
      const raw = await chat(SYSTEM_DETECT, userText);
      let detection;
      try {
        detection = JSON.parse(raw.replace(/```json|```/g, "").trim());
      } catch {
        detection = { serious: true }; // safe default
      }

      if (detection.serious) {

        // If the user already mentioned destination
        s.stage = STAGES.PERSONA;
      
        s.personaAnswers.push({
          q: PERSONA_QUESTIONS[0],
          a: userText
        });
      
        s.qIndex = 1;
      
        reply = `Nice choice! 🌍\n\n${PERSONA_QUESTIONS[1]}`;
      } else {
        reply = "Hey! I'm Voyager — your AI trip planner. Whenever you're ready to plan a real adventure, just tell me where you want to go. ✈️";
        // stay IDLE so they can retry
      }
    }

    // ── PERSONA: 5 profile questions ─────────────────────────
    else if (s.stage === STAGES.PERSONA) {
      s.personaAnswers.push({ q: PERSONA_QUESTIONS[s.qIndex], a: userText });
      s.qIndex++;

      if (s.qIndex < PERSONA_QUESTIONS.length) {
        const nextQ = PERSONA_QUESTIONS[s.qIndex];
        reply = await chat(
          SYSTEM_BRIDGE,
          `User answered: "${userText}"\nNow ask them exactly this question (naturally): "${nextQ}"`
        );
      } else {
        s.stage  = STAGES.REFINE;
        s.qIndex = 0;
        reply = await chat(
          SYSTEM_BRIDGE,
          `User answered: "${userText}"\nTransition to refining the trip and ask: "${REFINE_QUESTIONS[0]}"`
        );
      }
    }

    // ── REFINE: 2 refinement questions ───────────────────────
    else if (s.stage === STAGES.REFINE) {
      s.refineAnswers.push({ q: REFINE_QUESTIONS[s.qIndex], a: userText });
      s.qIndex++;

      if (s.qIndex < REFINE_QUESTIONS.length) {
        reply = await chat(
          SYSTEM_BRIDGE,
          `User answered: "${userText}"\nNow ask them: "${REFINE_QUESTIONS[s.qIndex]}"`
        );
      } else {
        // ── Build & save profile ──────────────────────────────
        const allQA = [...s.personaAnswers, ...s.refineAnswers];
        const profileContext = allQA.map((x) => `Q: ${x.q}\nA: ${x.a}`).join("\n\n");

        const raw = await chat(SYSTEM_WRAP, `Full traveler profile:\n\n${profileContext}`);

let itinerary;

try {
  itinerary = JSON.parse(raw.replace(/```json|```/g, "").trim());
} catch {
  itinerary = { error: "Could not parse itinerary", raw };
}

reply = itinerary;

        s.profile = {
          sessionId:   s.id,
          savedAt:     new Date().toISOString(),
          destination: s.personaAnswers[0]?.a,
          budget:      s.personaAnswers[1]?.a,
          duration:    s.personaAnswers[2]?.a,
          groupType:   s.personaAnswers[3]?.a,
          travelStyle: s.personaAnswers[4]?.a,
          mustHaves:   s.refineAnswers[0]?.a,
          constraints: s.refineAnswers[1]?.a,
          raw: allQA,
        };

        const profiles = loadProfiles();
        profiles[s.id] = s.profile;
        saveProfiles(profiles);

        s.stage = STAGES.DONE;
      }
    }

    // ── DONE: free chat with saved profile context ────────────
    else if (s.stage === STAGES.DONE) {
      const profileSummary = s.profile.raw.map((x) => `${x.q}: ${x.a}`).join(" | ");
      reply = await chat(
        SYSTEM_ASSISTANT,
        `User profile: ${profileSummary}\n\nUser says: "${userText}"`
      );
    }

    sessions.set(s.id, s);
    return res.json({
      reply,
      stage: s.stage,
      progress: getProgress(s),
      profile: s.stage === STAGES.DONE ? s.profile : null,
      itinerary: typeof reply === "object" ? reply : null
    });

  } catch (err) {
    console.error("Agent error:", err.message);
    return res.status(500).json({ error: "Agent error", detail: err.message });
  }
});

// GET /api/profile/:sessionId  →  fetch a saved profile
app.get("/api/profile/:sessionId", (req, res) => {
  const profiles = loadProfiles();
  const profile  = profiles[req.params.sessionId];
  if (!profile) return res.status(404).json({ error: "Profile not found" });
  res.json(profile);
});

// GET recent trips
app.get("/api/recent-trips", (req, res) => {
  const profiles = loadProfiles();

  const trips = Object.values(profiles)
    .sort((a,b)=> new Date(b.savedAt) - new Date(a.savedAt))
    .slice(0,5) // latest 5 trips
    .map(p => ({
      sessionId: p.sessionId,
      destination: p.destination,
      duration: p.duration
    }));

  res.json(trips);
});

// GET /api/profiles  →  all profiles (debug)
app.get("/api/profiles", (_req, res) => res.json(loadProfiles()));

// ── Start ─────────────────────────────────────────────────────
const PORT = process.env.PORT || 3001;
app.listen(PORT, () => console.log(`🌍 Voyager running on http://localhost:${PORT}`));

import searchRoutes from "./routes/search.js";
app.use("/api/search", searchRoutes);