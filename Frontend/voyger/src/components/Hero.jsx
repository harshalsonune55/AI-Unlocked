import { ArrowUp } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useState } from "react";

const API = "https://ai-unlocked-backend.onrender.com";

export default function Hero({ displayText }) {
  const navigate = useNavigate();
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    if (!input.trim()) return;
    setLoading(true);

    try {
      // 1. Create a new session
      const sessionRes = await fetch(`${API}/api/session`, { method: "POST" });
      const { sessionId } = await sessionRes.json();

      // 2. Send the first message
      const chatRes = await fetch(`${API}/api/chat`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sessionId, message: input }),
      });
      const data = await chatRes.json();

      // 3. Navigate to /response with session state
      navigate("/response", {
        state: { 
          sessionId, 
          firstReply: data.reply, 
          stage: data.stage,
          initialQuery: input   // ✅ pass the query
        },
      });
      setInput(""); 
    } catch (err) {
      console.error("Failed to start session:", err);
      alert("Could not connect to backend. Is server.js running?");
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter") handleSubmit();
  };

  return (
    <section
      className="min-h-screen w-full flex items-center justify-center 
                 bg-cover bg-center bg-no-repeat text-white"
      style={{ backgroundImage: "url('/background2.png')" }}
    >
      <div className="text-center px-6 w-full max-w-4xl">
        <h1 className="text-6xl md:text-7xl font-bold tracking-tight">
          Voyager
        </h1>

        <p className="mt-4 text-lg md:text-xl text-gray-300">
          Your AI companion for trip planning, itinerary generation, and smart travel ideas.
        </p>

        <div className="mt-12">
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