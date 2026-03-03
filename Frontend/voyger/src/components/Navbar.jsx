import { Link } from "react-router-dom";
export default function Navbar() {
    return (
      <nav className="absolute top-0 left-0 w-full px-10 py-6 flex items-center justify-between text-white z-50">
  
        <div className="flex items-center gap-2 text-2xl font-semibold">
          <div className="w-6 h-6 bg-gradient-to-br from-pink-500 to-orange-500 rounded-md"></div>
          Voyager
        </div>
  
        <div className="hidden md:flex items-center gap-8 text-sm text-gray-300">
          <a href="#" className="hover:text-white transition">Solutions</a>
          <a href="#" className="hover:text-white transition">Resources</a>
          <a href="#" className="hover:text-white transition">Enterprise</a>
          <a href="#" className="hover:text-white transition">Pricing</a>
          <a href="#" className="hover:text-white transition">Community</a>
          <a href="#" className="hover:text-white transition">Security</a>
        </div>
  
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
  
      </nav>
    );
  }