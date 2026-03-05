import AuthLayout from "../components/AuthLayout";
import { Link, useNavigate } from "react-router-dom";
import { useState } from "react";

const API = "http://localhost:3001";

export default function Signup() {

  const navigate = useNavigate();

  const [email,setEmail] = useState("");
  const [password,setPassword] = useState("");
  const [confirmPassword,setConfirmPassword] = useState("");
  const [loading,setLoading] = useState(false);

  const handleSignup = async () => {

    if(password !== confirmPassword){
      alert("Passwords do not match");
      return;
    }

    try{

      setLoading(true);

      const res = await fetch(`${API}/api/auth/signup`,{
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
        alert(data.error || "Signup failed");
        return;
      }

      alert("Signup successful");

      navigate("/login");

    }catch(err){
      console.error(err);
      alert("Server error");
    }finally{
      setLoading(false);
    }

  };

  return (
    <AuthLayout title="Create your account">

      <button className="w-full border border-neutral-700 rounded-lg py-3 mb-4 hover:border-white transition">
        Continue with Google
      </button>

      <button className="w-full border border-neutral-700 rounded-lg py-3 mb-6 hover:border-white transition">
        Continue with GitHub
      </button>

      <div className="flex items-center gap-4 mb-6">
        <div className="flex-1 h-px bg-neutral-700" />
        <span className="text-gray-500 text-sm">OR</span>
        <div className="flex-1 h-px bg-neutral-700" />
      </div>

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
        className="w-full mb-4 bg-neutral-900 border border-neutral-700 rounded-lg px-4 py-3"
      />

      <input
        type="password"
        placeholder="Confirm Password"
        value={confirmPassword}
        onChange={(e)=>setConfirmPassword(e.target.value)}
        className="w-full mb-6 bg-neutral-900 border border-neutral-700 rounded-lg px-4 py-3"
      />

      <button
        onClick={handleSignup}
        disabled={loading}
        className="w-full bg-white text-black py-3 rounded-lg hover:bg-gray-200 transition"
      >
        {loading ? "Creating..." : "Continue"}
      </button>

      <p className="mt-6 text-sm text-gray-400 text-center">
        Already have an account?{" "}
        <Link to="/login" className="text-white underline">
          Log in
        </Link>
      </p>

    </AuthLayout>
  );
}