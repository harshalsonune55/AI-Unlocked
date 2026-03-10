import { ArrowUp } from "lucide-react";
import { useState } from "react";
import { useRef } from "react";
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";


const API = "https://ai-unlocked-backend.onrender.com";

export default function Hero({ displayText }) {
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [sessionId, setSessionId] = useState(null);
const [messages, setMessages] = useState([]);
const bottomRef = useRef(null);
const chatRef = useRef(null);
const navigate = useNavigate();
const user = JSON.parse(localStorage.getItem("user"));
const [tripProfile, setTripProfile] = useState(null);
const [tripResult, setTripResult] = useState(null);


useEffect(() => {
  if (chatRef.current) {
    chatRef.current.scrollTop = chatRef.current.scrollHeight;
  }
   }, [messages]);

   

const handleSubmit = async () => {
  if (!input.trim() || loading) return;

  const userText = input.trim();

  setInput("");
  setMessages((prev) => [...prev, { role: "user", text: userText }]);
  setLoading(true);

  try {

    let sid = sessionId;

    // create session once
    if (!sid) {
      const sessionRes = await fetch(`${API}/api/session`, { method: "POST" });
      const data = await sessionRes.json();
      sid = data.sessionId;
      setSessionId(sid);
    }

    const chatRes = await fetch(`${API}/api/chat`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        sessionId: sid,
        message: userText,
        userEmail: user?.email   
      }),
    });

    const data = await chatRes.json();

    // if backend sends trip profile
if (data.profile && !tripProfile) {
  setTripProfile(data.profile);
}

// if backend returns trip itinerary
if (data.trip) {
  setTripResult(data.trip);
} else {
    
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          text:
            typeof data.reply === "object"
              ? JSON.stringify(data.reply, null, 2)
              : data.reply,
        },
      ]);
    
    }

  } catch (err) {
    console.error("Chat error:", err);
  } finally {
    setLoading(false);
  }
};

const handleMakeItinerary = () => {

  if (!tripProfile) return;

  navigate("/response", {
    state: {
      profile: {
        starting_city: tripProfile.startingFrom,
        destination_city: tripProfile.destination,
        duration: tripProfile.duration,
        budget: tripProfile.budget,
        travelStyle: "relaxed"
      }
    }
  });

};

  const handleKeyDown = (e) => {
    if (e.key === "Enter") handleSubmit();
  };

  return (
    <section
  className="relative min-h-screen w-full flex items-center justify-center text-white overflow-hidden"
>
<video
  autoPlay
  muted
  loop
  playsInline
  className="absolute top-0 left-0 w-full h-full object-cover"
>
  <source src="/travel-bg.mp4" type="video/mp4" />
</video>

{/* Dark overlay for readability */}
<div className="absolute inset-0 bg-black/60"></div>
<div className="relative z-10 text-center px-6 w-full max-w-4xl">
        <h1 className="text-6xl md:text-7xl font-bold tracking-tight">
          Voyager
        </h1>

        <p className="mt-4 text-lg md:text-xl text-gray-300">
          Your AI companion for trip planning, itinerary generation, and smart travel ideas.
        </p>

        <div className="mt-12">

        {tripProfile && !tripResult && (
  <div className="bg-neutral-900 border border-neutral-700 rounded-xl p-6 mb-6 text-left">

    <h2 className="text-xl font-semibold mb-4">Trip Summary</h2>

    <div className="space-y-2 text-sm text-gray-300">

      <p><strong>From:</strong> {tripProfile.startingFrom}</p>
      <p><strong>To:</strong> {tripProfile.destination}</p>
      <p><strong>Duration:</strong> {tripProfile.duration}</p>
      <p><strong>Budget:</strong> {tripProfile.budget}</p>

    </div>

    <button
  onClick={handleMakeItinerary}
  disabled={loading}
  className="mt-5 bg-orange-500 hover:bg-orange-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 disabled:opacity-50"
>
  {loading ? (
    <>
      <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
      Generating itinerary...
    </>
  ) : (
    "Make Itinerary"
  )}
</button>

  </div>
)}

    {/* CHAT HISTORY */}
{messages.length > 0 && (
  <div
  ref={chatRef}
  className="mt-8 bg-neutral-900 border border-neutral-800 rounded-2xl p-6 
             flex flex-col gap-4 max-h-[400px] overflow-y-auto"
>

    {messages.map((msg, i) => (
      <div
        key={i}
        className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
      >
        <div
          className={`px-4 py-3 rounded-2xl max-w-[80%] text-sm whitespace-pre-wrap
          ${
            msg.role === "user"
              ? "bg-orange-500 text-white"
              : "bg-neutral-800 text-gray-200"
          }`}
        >
          {msg.text}

        </div>
      </div>
    ))}
    <div ref={bottomRef}></div>

    {loading && (
      <div className="text-gray-400 text-sm">
        Voyager is thinking...
      </div>
    )}

    

  </div>
)}
  <br />

  {tripResult && (
  <div className="bg-neutral-900 border border-neutral-700 rounded-xl p-6 text-left max-h-[400px] overflow-y-auto">

    <h2 className="text-xl font-semibold mb-4">Generated Itinerary</h2>

    <pre className="text-sm text-gray-300 whitespace-pre-wrap">
      {JSON.stringify(tripResult, null, 2)}
    </pre>

  </div>
)}



  {/* INPUT BOX */}
  <div className="bg-neutral-900/90 backdrop-blur-md border border-neutral-800 
                  rounded-3xl shadow-xl p-6 md:p-8 flex items-center gap-4">

    <input
      type="text"
      value={input}
      onChange={(e) => setInput(e.target.value)}
      onKeyDown={handleKeyDown}
      placeholder={displayText}
      className="flex-1 bg-transparent text-white placeholder-gray-400 
                 outline-none text-lg"
    />

    <button
      onClick={handleSubmit}
      disabled={loading}
      className="bg-white text-black p-3 rounded-full 
                 hover:scale-105 transition disabled:opacity-50"
    >
      {loading ? (
        <span className="w-[18px] h-[18px] border-2 border-black border-t-transparent 
                         rounded-full animate-spin block" />
      ) : (
        <ArrowUp size={18} />
      )}
    </button>

    

  </div>



</div>
      </div>
    </section>
  );
}