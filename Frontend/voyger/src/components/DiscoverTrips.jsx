import TripCard from "./TripCard";

export default function DiscoverTrips() {

  const trips = [
    {
      image: "/Paris.webp",
      title: "Paris Explorer",
      description: "5-day romantic getaway",
      likes: 1033,
    },
    {
      image: "/bali.jpg",
      title: "Bali Retreat",
      description: "Wellness & beach vibes",
      likes: 731,
    },
    {
      image: "/Thailand.jpg",
      title: "Thailand Budget Trip",
      description: "Backpacking adventure",
      likes: 467,
    },
    {
      image: "/goa.avif",
      title: "Goa Escape",
      description: "Sun & party",
      likes: 432,
    },
    {
      image: "/swiss.jpg",
      title: "Swiss Alps",
      description: "Mountain adventure",
      likes: 384,
    },
    {
      image: "/tok.jpg",
      title: "Tokyo Discovery",
      description: "Tech & culture mix",
      likes: 290,
    },
    {
      image: "/Rom.jpg",
      title: "Rome Classic",
      description: "History & food",
      likes: 204,
    },
    {
      image: "/dubai.jpg",
      title: "Dubai Luxury",
      description: "Modern & desert",
      likes: 167,
    },
  ];

  return (
    <section className="bg-black text-white px-16 py-24">

      {/* Header */}
      <div className="flex items-center justify-between mb-12">
        <div>
          <h2 className="text-4xl font-bold">Discover trips</h2>
          <p className="text-gray-400 mt-2">
            Explore what others are planning
          </p>
        </div>

        <button className="border border-gray-600 px-4 py-2 rounded-lg text-sm hover:border-white transition">
          View all
        </button>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10">
        {trips.map((trip, index) => (
          <TripCard key={index} {...trip} />
        ))}
      </div>

    </section>
  );
}