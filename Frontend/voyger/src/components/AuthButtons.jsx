import { Link } from "react-router-dom";

export default function AuthButtons() {
  return (
    <div className="flex items-center gap-4">
      <Link
        to="/login"
        className="px-4 py-2 text-sm border border-gray-600 rounded-lg hover:border-white transition"
      >
        Log in
      </Link>

      <Link
        to="/signup"
        className="px-4 py-2 text-sm bg-white text-black rounded-lg hover:bg-gray-200 transition"
      >
        Get started
      </Link>
    </div>
  );
}