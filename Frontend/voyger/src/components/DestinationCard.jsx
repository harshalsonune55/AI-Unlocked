import { useNavigate } from "react-router-dom";

export default function DestinationCard({
  id,
  image,
  title,
  location,
  price,
  duration,
  rating,
  tags = []
}) {
  const navigate = useNavigate();

  return (
    <div
      onClick={() => navigate(`/trip/${id}`)}
      className="cursor-pointer bg-[#121a2b] rounded-2xl overflow-hidden shadow-xl 
                 hover:scale-[1.02] transition duration-300"
    >

      {/* Image */}
      <div className="relative h-48 overflow-hidden">
        <img
          src={image}
          alt={title}
          className="w-full h-full object-cover"
        />

        {/* Tags */}
        <div className="absolute top-4 left-4 flex gap-2">
          {tags.map((tag, i) => (
            <span
              key={i}
              className="bg-orange-500 text-white text-xs px-3 py-1 rounded-full"
            >
              {tag}
            </span>
          ))}
        </div>

        {/* Rating */}
        <div className="absolute bottom-4 right-4 bg-black/70 
                        px-3 py-1 rounded-full text-sm">
          ⭐ {rating}
        </div>

        {/* Title Overlay */}
        <div className="absolute bottom-4 left-4">
          <h3 className="text-xl font-semibold">{title}</h3>
          <p className="text-sm text-gray-200">📍 {location}</p>
        </div>
      </div>

      {/* Bottom Section */}
      <div className="p-5 border-t border-gray-700">
        <div className="flex justify-between items-center mb-4">
          <div>
            <p className="text-gray-400 text-sm">STARTING FROM</p>
            <h3 className="text-2xl font-bold">{price}</h3>
          </div>

          <div className="text-right">
            <p className="text-gray-400 text-sm">DURATION</p>
            <h3 className="text-lg font-semibold">{duration}</h3>
          </div>
        </div>

        <div className="flex gap-4 text-gray-400 text-sm">
          🏨 WiFi
          🚗 Transport
          🌊 Pool
        </div>
      </div>

    </div>
  );
}