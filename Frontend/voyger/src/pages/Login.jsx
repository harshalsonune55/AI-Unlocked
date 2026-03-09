import AuthLayout from "../components/AuthLayout";
import { Link, useNavigate } from "react-router-dom";
import { useState } from "react";

const API = "https://ai-unlocked-backend.onrender.com";

export default function Login() {

  const navigate = useNavigate();

  const [email,setEmail] = useState("");
  const [password,setPassword] = useState("");
  const [loading,setLoading] = useState(false);

  const handleLogin = async () => {

    try{

      setLoading(true);

      const res = await fetch(`${API}/api/auth/login`,{
        method:"POST",
        headers:{
          "Content-Type":"application/json"
        },
        body: JSON.stringify({
          email,
          password
        })
      });

      const data = await res.json();

      if(!res.ok){
        alert(data.error || "Login failed");
        return;
      }

      // save user session
      localStorage.setItem("user", JSON.stringify(data.user));

      alert("Login successful");

      navigate("/");

    }catch(err){
      console.error(err);
      alert("Server error");
    }finally{
      setLoading(false);
    }

  };

  return (
    <AuthLayout title="Welcome back">

      <input
        type="email"
        placeholder="Email"
        value={email}
        onChange={(e)=>setEmail(e.target.value)}
        className="w-full mb-4 bg-neutral-900 border border-neutral-700 rounded-lg px-4 py-3"
      />

      <input
        type="password"
        placeholder="Password"
        value={password}
        onChange={(e)=>setPassword(e.target.value)}
        className="w-full mb-6 bg-neutral-900 border border-neutral-700 rounded-lg px-4 py-3"
      />

      <button
        onClick={handleLogin}
        disabled={loading}
        className="w-full bg-white text-black py-3 rounded-lg hover:bg-gray-200 transition"
      >
        {loading ? "Logging in..." : "Login"}
      </button>

      <p className="mt-6 text-sm text-gray-400 text-center">
        Don’t have an account?{" "}
        <Link to="/signup" className="text-white underline">
          Sign up
        </Link>
      </p>

    </AuthLayout>
  );
}