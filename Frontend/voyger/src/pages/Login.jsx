import AuthLayout from "../components/AuthLayout";
import { Link } from "react-router-dom";

export default function Login() {
  return (
    <AuthLayout title="Welcome back">

      <input
        type="email"
        placeholder="Email"
        className="w-full mb-4 bg-neutral-900 border border-neutral-700 rounded-lg px-4 py-3"
      />

      <input
        type="password"
        placeholder="Password"
        className="w-full mb-6 bg-neutral-900 border border-neutral-700 rounded-lg px-4 py-3"
      />

      <button className="w-full bg-white text-black py-3 rounded-lg hover:bg-gray-200 transition">
        Login
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