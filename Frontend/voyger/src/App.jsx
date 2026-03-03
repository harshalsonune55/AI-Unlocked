import { useEffect, useState } from "react";
import { ArrowUp } from "lucide-react";
import "./App.css";

export default function App() {
  const phrases = [
    "Plan a 5-day trip to Paris...",
    "Create a Goa beach itinerary...",
    "Suggest a budget trip to Thailand...",
    "Plan a romantic trip to Bali...",
    "Generate a Europe backpacking route..."
  ];

  const [displayText, setDisplayText] = useState("");
  const [phraseIndex, setPhraseIndex] = useState(0);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    const currentPhrase = phrases[phraseIndex];
    const typingSpeed = isDeleting ? 40 : 80;

    const timeout = setTimeout(() => {
      if (!isDeleting) {
        setDisplayText(currentPhrase.substring(0, displayText.length + 1));

        if (displayText === currentPhrase) {
          setTimeout(() => setIsDeleting(true), 1000);
        }
      } else {
        setDisplayText(currentPhrase.substring(0, displayText.length - 1));

        if (displayText === "") {
          setIsDeleting(false);
          setPhraseIndex((prev) => (prev + 1) % phrases.length);
        }
      }
    }, typingSpeed);

    return () => clearTimeout(timeout);
  }, [displayText, isDeleting, phraseIndex]);

  return (
    <div className="relative min-h-screen w-full overflow-hidden flex items-center justify-center bg-black">

      {/* Premium Gradient Background */}
      <div className="absolute inset-0 -z-10 overflow-hidden">

        {/* Top Blue/Purple Glow */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1200px] h-[800px]
        bg-[radial-gradient(circle_at_top,rgba(99,102,241,0.9),rgba(168,85,247,0.7),transparent_70%)]
        blur-2xl" />

        {/* Middle Blend */}
        <div className="absolute inset-0
        bg-gradient-to-b from-indigo-500/40 via-purple-500/30 to-transparent" />

        {/* Bottom Pink/Orange Glow */}
        <div className="absolute bottom-[-300px] left-1/2 -translate-x-1/2 w-[1400px] h-[900px]
        bg-[radial-gradient(circle_at_center,rgba(236,72,153,0.9),rgba(249,115,22,0.8),transparent_70%)]
        blur-2xl" />

      </div>

      {/* Content */}
      <div className="text-center px-6 w-full max-w-4xl">

        {/* Title */}
        <h1 className="text-6xl md:text-7xl font-bold text-white tracking-tight">
          Voyager
        </h1>

        {/* Subtitle */}
        <p className="mt-4 text-lg md:text-xl text-white/70">
          Your AI companion for trip planning, itinerary generation, and smart travel ideas.
        </p>

        {/* Input Box */}
        <div className="mt-12">
          <div className="bg-neutral-900/80 backdrop-blur-xl border border-white/10 
          rounded-3xl shadow-2xl p-6 md:p-8 flex items-center gap-4">

            <input
              type="text"
              placeholder={displayText}
              className="flex-1 bg-transparent text-white placeholder-white/70 
              outline-none text-lg"
            />

            <button className="bg-white text-black p-3 rounded-full 
            hover:scale-105 transition">
              <ArrowUp size={18} />
            </button>

          </div>
        </div>

      </div>
    </div>
  );
}