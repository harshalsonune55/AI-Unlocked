export default function TrustedBy() {
    const companies = [
      "MakeMyTrip",
      "Booking.com",
      "OYO",
      "OLA",
      "Uber",
      "Airbnb",
      "Expedia",
      "Trivago",
      "Agoda",
      "TripAdvisor",
    ];
  
    return (
      <section className="bg-black text-white py-20 overflow-hidden">
  
        {/* Title */}
        <div className="text-center mb-14">
          <p className="text-gray-400 text-lg">
            Teams from top companies build with Voyager
          </p>
        </div>
  
        {/* Marquee Container */}
        <div className="relative w-full overflow-hidden">
  
          {/* Gradient Fades */}
          <div className="absolute left-0 top-0 h-full w-32 bg-gradient-to-r from-black to-transparent z-10" />
          <div className="absolute right-0 top-0 h-full w-32 bg-gradient-to-l from-black to-transparent z-10" />
  
          {/* Moving Track */}
          <div className="flex gap-20 animate-marquee whitespace-nowrap hover:[animation-play-state:paused]">
  
            {[...companies, ...companies].map((company, index) => (
              <div
                key={index}
                className="text-3xl font-semibold text-gray-500 hover:text-white transition"
              >
                {company}
              </div>
            ))}
  
          </div>
  
        </div>
  
      </section>
    );
  }