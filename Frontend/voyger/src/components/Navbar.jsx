import { Link, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { User } from "lucide-react";

const API = "https://ai-unlocked-backend.onrender.com/api/trips";

export default function Navbar() {

  const navigate = useNavigate();
  const [user,setUser] = useState(null);
  const [open,setOpen] = useState(false);
  const [trips,setTrips] = useState([]);

  useEffect(()=>{
    const storedUser = localStorage.getItem("user");
    if(storedUser){
      setUser(JSON.parse(storedUser));
    }
  },[]);
  useEffect(()=>{
    const storedUser = localStorage.getItem("user");
    if(storedUser){
      setUser(JSON.parse(storedUser));
  
      fetch(API)
        .then(res=>res.json())
        .then(data=>setTrips(data))
        .catch(()=>setTrips([]));
    }
  },[]);

  const handleLogout = () => {
    localStorage.removeItem("user");
    setUser(null);
    navigate("/login");
  };

  return (
    <nav className="sticky top-0 w-full px-10 py-4 
                    flex items-center justify-between 
                    text-white z-50
                    bg-black/70 backdrop-blur-md
                    border-b border-neutral-800">

      {/* Logo */}
      <div className="flex items-center gap-2 text-2xl font-semibold">
        <div className="w-6 h-6 bg-gradient-to-br from-pink-500 to-orange-500 rounded-md"></div>
        Voyager
      </div>

      {/* Center Menu */}
      <div className="hidden md:flex items-center gap-8 text-sm text-gray-300">
        <a href="#" className="hover:text-white transition">Solutions</a>
        <a href="#" className="hover:text-white transition">Resources</a>
        <a href="#" className="hover:text-white transition">Enterprise</a>
        <a href="#" className="hover:text-white transition">Pricing</a>
        <a href="#" className="hover:text-white transition">Community</a>
        <a href="#" className="hover:text-white transition">Security</a>
      </div>

      {/* Right Section */}
      <div className="flex items-center gap-4 relative">

        {!user ? (
          <>
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
          </>
        ) : (
          <>
            {/* USER BUTTON */}
            <button
              onClick={() => setOpen(!open)}
              className="flex items-center gap-2 bg-neutral-900 px-3 py-2 rounded-lg hover:bg-neutral-800 transition"
            >
              <User size={18}/>
              <span className="text-sm">{user.email}</span>
            </button>

            {/* DROPDOWN PANEL */}
            {open && (
              <div className="absolute right-0 top-12 w-72 bg-neutral-900 border border-neutral-800 rounded-xl shadow-2xl p-4">

                {/* User info */}
                <div className="border-b border-neutral-800 pb-3 mb-3">
                  <p className="text-sm text-gray-400">Signed in as</p>
                  <p className="text-white font-medium">{user.email}</p>
                </div>

                {/* Chat History */}
                <div className="mb-4">
  <p className="text-sm text-gray-400 mb-2">Recent Trips</p>

  <div className="flex flex-col gap-2 text-sm">

    {trips.length === 0 && (
      <span className="text-gray-500">No trips yet</span>
    )}

    {trips.map((trip)=>(
      <button
        key={trip.sessionId}
        className="text-left hover:text-white text-gray-300"
        onClick={()=>navigate(`/response?session=${trip.sessionId}`)}
      >
        {trip.destination} • {trip.duration}
      </button>
    ))}

  </div>
</div>

                {/* Logout */}
                <button
                  onClick={handleLogout}
                  className="w-full border border-neutral-700 rounded-lg py-2 hover:border-white transition"
                >
                  Logout
                </button>

              </div>
            )}
          </>
        )}

      </div>

    </nav>
  );
}