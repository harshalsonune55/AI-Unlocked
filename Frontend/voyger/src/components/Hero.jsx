import { ArrowUp } from "lucide-react";

export default function Hero({ displayText }) {
  return (
    <section
      className="min-h-screen w-full flex items-center justify-center 
                 bg-cover bg-center bg-no-repeat text-white"
      style={{
        backgroundImage: "url('/background2.png')",
      }}
    >
      <div className="text-center px-6 w-full max-w-4xl">

        <h1 className="text-6xl md:text-7xl font-bold tracking-tight">
          Voyager
        </h1>

        <p className="mt-4 text-lg md:text-xl text-white-400">
          Your AI companion for trip planning, itinerary generation, and smart travel ideas.
        </p>

        <div className="mt-12">
          <div className="bg-neutral-900/90 backdrop-blur-md border border-neutral-800 
                          rounded-3xl shadow-xl p-6 md:p-8 flex items-center gap-4">

            <input
              type="text"
              placeholder={displayText}
              className="flex-1 bg-transparent text-white placeholder-gray-400 
                         outline-none text-lg"
            />

            <button className="bg-white text-black p-3 rounded-full 
                               hover:scale-105 transition">
              <ArrowUp size={18} />
            </button>

          </div>
        </div>

      </div>
    </section>
  );
}