import { useState } from "react";

export default function StartupHero() {
  const [showTextbox, setShowTextbox] = useState(false);

  const handleVideoEnd = () => {
    setShowTextbox(true);
  };

  return (
    <div className="relative w-screen h-screen overflow-hidden bg-black">

      {/* Background Video */}
      <video
        autoPlay
        muted
        playsInline
        onEnded={handleVideoEnd}
        className="absolute inset-0 w-full h-full object-cover"
      >
        <source src="/startup.mp4" type="video/mp4" />
      </video>

      {/* Overlay Dark Gradient */}
      <div className="absolute inset-0 bg-black/40"></div>

      {/* Textbox */}
      <div
        className={`absolute inset-0 flex items-center justify-center transition-all duration-1000 ${
          showTextbox
            ? "opacity-100 translate-y-0"
            : "opacity-0 translate-y-10 pointer-events-none"
        }`}
      >
        <div className="bg-white/10 backdrop-blur-lg border border-white/20 p-8 rounded-2xl shadow-2xl w-[90%] max-w-lg text-center text-white">

          <h1 className="text-4xl font-bold mb-4">
            Welcome
          </h1>

          <input
            type="text"
            placeholder="Enter something..."
            className="w-full px-4 py-3 rounded-lg bg-white/20 placeholder-white/70 focus:outline-none focus:ring-2 focus:ring-white"
          />

          <button className="mt-4 w-full bg-white text-black font-semibold py-3 rounded-lg hover:bg-gray-200 transition">
            Continue
          </button>

        </div>
      </div>

    </div>
  );
}