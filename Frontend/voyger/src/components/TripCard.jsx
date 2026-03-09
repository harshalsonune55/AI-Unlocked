import { useState } from "react";

export default function TripCard({ image, title, description, likes }) {

  const [isLiked, setIsLiked] = useState(false);
  const [likeCount, setLikeCount] = useState(likes);

  const handleLike = (e) => {
    e.stopPropagation(); // prevents card click trigger

    if (isLiked) {
      setLikeCount(likeCount - 1);
    } else {
      setLikeCount(likeCount + 1);
    }

    setIsLiked(!isLiked);
  };

  return (
    <div className="group cursor-pointer">

      {/* Image */}
      <div className="rounded-2xl overflow-hidden bg-neutral-800">
        <img
          src={image}
          alt={title}
          className="w-full h-48 object-cover group-hover:scale-105 transition duration-300"
        />
      </div>

      {/* Info */}
      <div className="flex items-center justify-between mt-4">
        <div>
          <h3 className="text-white font-medium">{title}</h3>
          <p className="text-gray-400 text-sm">{description}</p>
        </div>

        <button
          onClick={handleLike}
          className={`flex items-center gap-2 text-sm transition 
            ${isLiked ? "text-red-500" : "text-gray-400 hover:text-red-400"}`}
        >
          <i
            className={`fa-heart ${
              isLiked ? "fa-solid scale-110" : "fa-regular"
            } transition`}
          ></i>
          {likeCount}
        </button>

      </div>
    </div>
  );
}