import { useEffect, useState } from "react";
import { ArrowUp } from "lucide-react";

export default function AuthLayout({ children, title }) {
    const phrases = [
        "Plan a 5-day trip to Paris...",
        "Create a Goa beach itinerary...",
        "Build your SaaS startup idea...",
        "Generate a Europe backpacking route...",
        "Design your next AI product..."
      ];
      
      const [displayText, setDisplayText] = useState("");
      const [phraseIndex, setPhraseIndex] = useState(0);
      const [isDeleting, setIsDeleting] = useState(false);
      
      useEffect(() => {
        const currentPhrase = phrases[phraseIndex];
        const typingSpeed = isDeleting ? 40 : 70;
      
        const timeout = setTimeout(() => {
          if (!isDeleting) {
            // Typing
            setDisplayText(currentPhrase.substring(0, displayText.length + 1));
      
            if (displayText === currentPhrase) {
              setTimeout(() => setIsDeleting(true), 1200); // pause before deleting
            }
          } else {
            // Deleting
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
    <div className="min-h-screen flex bg-[#0f0f0f] text-white">

      {/* LEFT SIDE - FORM */}
      <div className="w-full md:w-1/2 flex items-center justify-center px-10 py-16">
        <div className="w-full max-w-md">

          {/* Logo */}
          <div className="w-8 h-8 bg-gradient-to-br from-pink-500 to-orange-500 rounded-md mb-8"></div>

          <h2 className="text-3xl font-semibold mb-8">
            {title}
          </h2>

          {children}

        </div>
      </div>

      {/* RIGHT SIDE - GRADIENT + ANIMATED BOX */}
      <div
        className="hidden md:flex md:w-1/2 items-center justify-center bg-cover bg-center"
        style={{
          backgroundImage: "url('/background2.png')",
        }}
      >
        <div className="w-[80%] max-w-xl">

          <div className="bg-white/90 backdrop-blur-md rounded-3xl px-8 py-6 
                          flex items-center justify-between shadow-2xl">

            {/* Animated Text */}
            <div className="text-black text-lg font-medium flex items-center">
              {displayText}
              <span className="ml-1 w-[2px] h-6 bg-blue-600 animate-pulse"></span>
            </div>

            {/* Send Button */}
            <button className="ml-6 bg-[#0f172a] text-white p-4 rounded-full 
                               hover:scale-105 transition">
              <ArrowUp size={20} />
            </button>

          </div>

        </div>
      </div>

    </div>
  );
}