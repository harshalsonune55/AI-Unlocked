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
import axios from "axios";
import Stripe from "stripe";




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

const groq = process.env.GROQ_API_KEY
  ? new Groq({ apiKey: process.env.GROQ_API_KEY })
  : null;

const MODEL = "llama-3.3-70b-versatile";

connectDB();

/* ---------------- PROFILES STORAGE ---------------- */

const PROFILES_FILE = "./profiles.json";

if (!fs.existsSync(PROFILES_FILE))
  fs.writeFileSync(PROFILES_FILE, "{}");

const loadProfiles = () =>
  JSON.parse(fs.readFileSync(PROFILES_FILE, "utf-8"));

const saveProfiles = (data) =>
  fs.writeFileSync(PROFILES_FILE, JSON.stringify(data, null, 2));

/* ---------------- SESSION STORE ---------------- */

const sessions = new Map();

/* ---------------- STAGES ---------------- */

const STAGES = {
  IDLE: "idle",
  PERSONA: "persona",
  REFINE: "refine",
  DONE: "done"
};

/* ---------------- QUESTIONS ---------------- */

const PERSONA_QUESTIONS = [
  "Where are you planning to go? (Destination or region)",
  "Where will you be starting from? (City or airport code)",
  "What's your budget per person?",
  "How many days is the trip?",
  "Who's travelling?",
  "What's your travel style?"
];

const REFINE_QUESTIONS = [
  "What are your must-have experiences?",
  "Any constraints or deal-breakers?"
];

/* ---------------- LLM PROMPTS ---------------- */

const SYSTEM_DETECT = `
Decide if the user is serious about travel planning.

Return JSON only:

{"serious": true}
or
{"serious": false}
`;

const SYSTEM_BRIDGE = `
You are Voyager.

Acknowledge the user's answer briefly and ask the next question naturally.
`;

const SYSTEM_WRAP = `
You are Voyager, an expert AI travel planner.

Generate a full travel itinerary.

Return ONLY valid JSON.

Include:
- flights
- hotels
- tourist places
- itinerary
- cost estimate
- travel tips
`;

const SYSTEM_ASSISTANT = `
You are Voyager.

Answer follow-up travel questions using the saved profile.
`;

/* ---------------- LLM CHAT ---------------- */

async function chat(systemPrompt, userContent) {

  if (!groq)
    throw new Error("Missing GROQ_API_KEY");

  const res = await groq.chat.completions.create({
    model: MODEL,
    max_tokens: 3000,
    messages: [
      { role: "system", content: systemPrompt },
      { role: "user", content: userContent }
    ]
  });

  return res.choices[0].message.content || "";
}

/* ---------------- SESSION HELPERS ---------------- */

function newSession() {
  return {
    id: randomUUID(),
    stage: STAGES.IDLE,
    personaAnswers: [],
    refineAnswers: [],
    qIndex: 0,
    profile: null
  };
}

function getProgress(s) {

  const total =
    PERSONA_QUESTIONS.length +
    REFINE_QUESTIONS.length;

  const answered =
    s.personaAnswers.length +
    s.refineAnswers.length;

  return {
    answered,
    total,
    percent: Math.round((answered / total) * 100),
    phase: s.stage
  };
}

/* ---------------- CREATE SESSION ---------------- */

app.post("/api/session", (req, res) => {

  const s = newSession();
  sessions.set(s.id, s);

  res.json({ sessionId: s.id });

});

// payment

app.post("/api/create-checkout", async (req,res)=>{

  const { amount } = req.body;

  const session = await stripe.checkout.sessions.create({

    payment_method_types:["card"],

    line_items:[{
      price_data:{
        currency:"inr",
        product_data:{
          name:"Voyager AI Trip"
        },
        unit_amount: amount * 100
      },
      quantity:1
    }],

    mode:"payment",

    success_url:"http://localhost:5173/success",
    cancel_url:"http://localhost:5173/cancel"

  });

  res.json({ url: session.url });

});

/* ---------------- CHAT ENDPOINT ---------------- */

app.post("/api/chat", async (req, res) => {

  const { sessionId, message } = req.body;

  if (!sessionId || !message)
    return res.status(400).json({
      error: "sessionId and message required"
    });

  const s = sessions.get(sessionId);

  if (!s)
    return res.status(404).json({
      error: "Session not found"
    });

  const userText = message.trim();
  let reply = "";

  try {

    /* ---------- IDLE ---------- */

    if (s.stage === STAGES.IDLE) {

      const raw = await chat(SYSTEM_DETECT, userText);

      let detection;

      try {
        detection = JSON.parse(raw);
      } catch {
        detection = { serious: true };
      }

      if (detection.serious) {

        s.stage = STAGES.PERSONA;

        s.personaAnswers.push({
          q: PERSONA_QUESTIONS[0],
          a: userText
        });

        s.qIndex = 1;

        reply = PERSONA_QUESTIONS[1];

      } else {

        reply =
          "Hi! Tell me where you'd like to travel.";

      }
    }

    /* ---------- PERSONA QUESTIONS ---------- */

    else if (s.stage === STAGES.PERSONA) {

      s.personaAnswers.push({
        q: PERSONA_QUESTIONS[s.qIndex],
        a: userText
      });

      s.qIndex++;

      if (s.qIndex < PERSONA_QUESTIONS.length) {

        reply = await chat(
          SYSTEM_BRIDGE,
          `User said: ${userText}. Ask: ${PERSONA_QUESTIONS[s.qIndex]}`
        );

      } else {

        s.stage = STAGES.REFINE;
        s.qIndex = 0;

        reply = REFINE_QUESTIONS[0];
      }
    }

    /* ---------- REFINE QUESTIONS ---------- */

    else if (s.stage === STAGES.REFINE) {

      s.refineAnswers.push({
        q: REFINE_QUESTIONS[s.qIndex],
        a: userText
      });

      s.qIndex++;

      if (s.qIndex < REFINE_QUESTIONS.length) {

        reply = REFINE_QUESTIONS[s.qIndex];

      } else {

  /* ---------- CALL TRIP API ---------- */

const destination = s.personaAnswers[0]?.a;
const start = s.personaAnswers[1]?.a;

const tripResponse = await axios.post(
  "http://localhost:3000/api/trip",
  {
    profile: {
      starting_city: start,
      destination_city: destination,
      duration: s.personaAnswers[3]?.a,
      budget: s.personaAnswers[2]?.a,
      travelStyle: s.personaAnswers[5]?.a
    }
  }
);

/* RAW API RESPONSE */

const itinerary = tripResponse.data;

/* RETURN RAW DATA */

reply = itinerary;

        /* ---------- SAVE PROFILE ---------- */

        s.profile = {
          sessionId: s.id,
          destination,
          startingFrom: start,
          budget: s.personaAnswers[2]?.a,
          duration: s.personaAnswers[3]?.a
        };

        const profiles = loadProfiles();
        profiles[s.id] = s.profile;
        saveProfiles(profiles);

        s.stage = STAGES.DONE;

      }
    }

    /* ---------- POST-TRIP CHAT ---------- */

    else if (s.stage === STAGES.DONE) {

      const summary =
        JSON.stringify(s.profile);

      reply = await chat(
        SYSTEM_ASSISTANT,
        `User profile: ${summary}. Question: ${userText}`
      );

    }

    sessions.set(s.id, s);

    return res.json({

      message:
        typeof reply === "string"
          ? reply
          : "Trip itinerary ready",

      stage: s.stage,

      progress: getProgress(s),

      session: {
        id: s.id,
        phase: s.stage
      },

      profile:
        s.stage === STAGES.DONE
          ? s.profile
          : null,

      trip:
        typeof reply === "object"
          ? reply
          : null

    });

  } catch (err) {

    console.error(err);

    res.status(500).json({
      error: "Agent error",
      detail: err.message
    });

  }
});

/* ---------------- PROFILE ROUTES ---------------- */

app.get("/api/profile/:sessionId", (req, res) => {

  const profiles = loadProfiles();
  const profile = profiles[req.params.sessionId];

  if (!profile)
    return res.status(404).json({
      error: "Profile not found"
    });

  res.json(profile);

});

app.get("/api/profiles", (_req, res) =>
  res.json(loadProfiles())
);

/* ---------------- START SERVER ---------------- */

const PORT = process.env.PORT || 3001;

app.listen(PORT, () =>
  console.log(`🌍 Voyager running on http://localhost:${PORT}`)
);