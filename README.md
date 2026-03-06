# AI-Unlocked (Voyager) 🌍✈️

AI-Unlocked is a full-stack travel planner with a multi-stage AI workflow:
- **Planner agent** asks traveler questions and builds profile context.
- **Retriever agent** gathers destination data (description, weather, places, stays, links).
- **Finalizer agent** composes a complete trip JSON with itinerary, flights, hostels, and photos.

---

## Tech Stack

### Frontend
- React 19 + Vite
- React Router
- Tailwind-style utility classes + custom CSS

### Backend
- Node.js + Express
- Groq SDK (LLM itinerary/final composition)
- Passport Local + MongoDB (auth)
- Axios + Cheerio (retrieval)
- File persistence for trip profiles (`profiles.json`)

---

## Repository Structure

```text
AI-Unlocked/
├── Backend/
│   ├── config/
│   ├── models/
│   ├── routes/
│   │   ├── auth.js
│   │   ├── flights.js
│   │   ├── plan.js
│   │   └── search.js
│   ├── services/
│   │   ├── finalComposerService.js
│   │   ├── flightService.js
│   │   ├── imageService.js
│   │   └── retrieverService.js
│   ├── profiles.json
│   ├── server.js
│   └── package.json
├── Frontend/
│   └── voyger/
└── README.md
```

---

## Architecture Overview

## 1) Planner Agent (conversation)
Main planner flow is in `POST /api/chat` with session stages:
- `idle` → intent check
- `persona` → core traveler questions
- `refine` → must-haves/constraints
- `done` → free chat with saved profile context

## 2) Retriever Agent (destination intelligence)
`GET /api/search?place=...` returns raw destination context only:
- destination summary
- weather snapshot
- top places
- hotel/hostel options
- travel links and tips

> Note: this endpoint is **not** the final trip itinerary; use `/api/plan/finalize` for a complete step-by-step plan.

## 3) Finalizer Agent (new)
`POST /api/plan/finalize` orchestrates:
1. read profile by `sessionId` (or accept direct `place`)
2. retrieve destination data
3. fetch destination images (Wikimedia)
4. fetch flights (Aviationstack)
5. compose final strict JSON (Groq + fallback) with concrete hotel selection and movement plan (from A to B)

---

## Backend API

## Auth
- `POST /api/auth/signup`
- `POST /api/auth/login`

## Session + Planner
- `POST /api/session` → create chat session
- `POST /api/chat` → continue planner conversation

## Retriever
- `GET /api/search?place=Rishikesh`

## Flights
- `GET /api/flights?dep=DEL&arr=DXB&airline=EK`

## Final Trip (recommended endpoint)
- `POST /api/plan/finalize`
- Use IATA airport codes for flights via either `dep/arr` or aliases `from/to` (e.g., `JFK` -> `CDG`).

Example body:
```json
{
  "sessionId": "optional-session-id",
  "place": "Rishikesh",
  "from": "JFK",
  "to": "CDG"
}
```

Example response shape:
```json
{
  "sessionId": "...",
  "destination": "Rishikesh",
  "final_trip": {
    "trip_meta": {},
    "transport": { "flights": [] },
    "stay": { "chosen_hotel": {}, "check_in": "", "check_out": "" },
    "destination_media": { "hero_image": {}, "gallery": [] },
    "itinerary": [
      {
        "day": 1,
        "title": "",
        "activities": [
          { "time": "", "from": "", "to": "", "transport": "", "activity": "", "estimated_cost": "", "image": {} }
        ]
      }
    ],
    "practical": {},
    "estimated_total_cost": ""
  },
  "flight_query": { "dep": "JFK", "arr": "CDG" }
}
```

---

## Local Setup

## 1) Backend

```bash
cd Backend
npm install
```

Create `Backend/.env`:

```env
PORT=3001
MONGO_URI=<your_mongodb_uri>
# optional alias accepted by backend as fallback
MONGODB_URI=<your_mongodb_uri>
GROQ_API_KEY=<your_groq_key>
AVIATIONSTACK_KEY=<your_aviationstack_key>
```

Run backend:

```bash
npm run dev
```

Backend local URL:
- `http://localhost:3001`

## 2) Frontend

```bash
cd Frontend/voyger
npm install
npm run dev
```

Frontend local URL:
- `http://localhost:5173`

---

## How to Get the Backend Link

You currently have two backend links in the codebase:

1. **Deployed backend**: `https://ai-unlocked-backend.onrender.com`
   - used in Login/Signup/PromptBox.

2. **Local backend**: `http://localhost:3001`
   - used in one flight request path and in local development.

Tip: standardize with frontend env var:

```env
VITE_API_BASE_URL=https://ai-unlocked-backend.onrender.com
```

Then use `import.meta.env.VITE_API_BASE_URL` everywhere.

---

## Notes / Limitations

- Chat sessions are in-memory; restart clears active sessions.
- Profiles persist in local `profiles.json` (simple, not scalable).
- Flights depend on Aviationstack + IATA correctness.
- Finalizer has graceful fallback if LLM output is invalid.

