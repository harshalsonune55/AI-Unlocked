import { useEffect, useState, useRef } from "react";
import { ArrowUp } from "lucide-react";
import { useLocation } from "react-router-dom";

const API = "http://localhost:3001";

export default function PromptBox() {
  const location = useLocation();
  const { sessionId: initialSessionId, firstReply, stage: initialStage } = location.state || {};

  const phrases = [
    "Modify my trip to include luxury stays...",
    "Add adventure activities...",
    "Make it budget friendly...",
    "Include local food experiences...",
  ];

  const [displayText, setDisplayText] = useState("");
  const [phraseIndex, setPhraseIndex] = useState(0);
  const [isDeleting, setIsDeleting] = useState(false);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [sessionId, setSessionId] = useState(initialSessionId || null);
  const [messages, setMessages] = useState(
    firstReply ? [{ role: "assistant", text: firstReply }] : []
  );
  const bottomRef = useRef(null);

  // Typing animation (only when no messages yet)
  useEffect(() => {
    if (messages.length > 0) return;
    const currentPhrase = phrases[phraseIndex];
    const typingSpeed = isDeleting ? 40 : 60;
    const timeout = setTimeout(() => {
      if (!isDeleting) {
        setDisplayText(currentPhrase.substring(0, displayText.length + 1));
        if (displayText === currentPhrase) setTimeout(() => setIsDeleting(true), 1200);
      } else {
        setDisplayText(currentPhrase.substring(0, displayText.length - 1));
        if (displayText === "") {
          setIsDeleting(false);
          setPhraseIndex((prev) => (prev + 1) % phrases.length);
        }
      }
    }, typingSpeed);
    return () => clearTimeout(timeout);
  }, [displayText, isDeleting, phraseIndex, messages.length]);

  // Auto-scroll to latest message
  useEffect(() => {
  if (bottomRef.current) {
    bottomRef.current.scrollIntoView({ behavior: "smooth", block: "nearest" });
  }
}, [messages]);

  const sendMessage = async () => {
    if (!input.trim() || loading) return;
    const userText = input.trim();
    setInput("");
    setMessages((prev) => [...prev, { role: "user", text: userText }]);
    setLoading(true);

    try {
      let sid = sessionId;

      // If no session yet (user landed here directly), create one
      if (!sid) {
        const res = await fetch(`${API}/api/session`, { method: "POST" });
        const data = await res.json();
        sid = data.sessionId;
        setSessionId(sid);
      }

      const res = await fetch(`${API}/api/chat`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sessionId: sid, message: userText }),
      });
      const data = await res.json();
      setMessages((prev) => [...prev, { role: "assistant", text: data.reply }]);
    } catch (err) {
      setMessages((prev) => [
        ...prev,
        { role: "assistant", text: "⚠️ Could not reach the backend. Is server.js running?" },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter") sendMessage();
  };

  return (
    <div className="max-w-2xl mx-auto mb-16 flex flex-col gap-4">

      {/* Chat history */}
      {messages.length > 0 && (
        <div className="bg-neutral-900 border border-neutral-800 rounded-2xl p-6 
                        flex flex-col gap-4 max-h-[60vh] overflow-y-auto">
          {messages.map((msg, i) => (
            <div
              key={i}
              className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
            >
              <div
                className={`px-4 py-3 rounded-2xl max-w-[80%] text-sm whitespace-pre-wrap leading-relaxed
                  ${msg.role === "user"
                    ? "bg-orange-500 text-white rounded-br-sm"
                    : "bg-neutral-800 text-gray-200 rounded-bl-sm"
                  }`}
              >
                {msg.text}
              </div>
            </div>
          ))}

          {loading && (
            <div className="flex justify-start">
              <div className="bg-neutral-800 text-gray-400 px-4 py-3 rounded-2xl rounded-bl-sm text-sm">
                <span className="animate-pulse">Voyager is thinking...</span>
              </div>
            </div>
          )}
          <div ref={bottomRef} />
        </div>
      )}

      {/* Input box */}
      <div className="bg-neutral-900 border border-neutral-800 
                      rounded-2xl px-6 py-4 flex items-center 
                      justify-between shadow-md gap-4">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={messages.length > 0 ? "Continue the conversation..." : displayText}
          className="flex-1 bg-transparent text-white placeholder-gray-400 
                     outline-none text-base"
        />

        <button
          onClick={sendMessage}
          disabled={loading}
          className="bg-white text-black p-2.5 rounded-full 
                     hover:scale-105 transition disabled:opacity-50"
        >
          {loading ? (
            <span className="w-4 h-4 border-2 border-black border-t-transparent 
                             rounded-full animate-spin block" />
          ) : (
            <ArrowUp size={16} />
          )}
        </button>
      </div>
    </div>
  );
}