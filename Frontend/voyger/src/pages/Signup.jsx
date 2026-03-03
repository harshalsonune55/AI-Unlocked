import AuthLayout from "../components/AuthLayout";
import { Link } from "react-router-dom";

export default function Signup() {
  return (
    <AuthLayout title="Create your account">

      {/* Social Buttons */}
      <button className="w-full border border-neutral-700 rounded-lg py-3 mb-4 hover:border-white transition">
        Continue with Google
      </button>

      <button className="w-full border border-neutral-700 rounded-lg py-3 mb-6 hover:border-white transition">
        Continue with GitHub
      </button>

      {/* Divider */}
      <div className="flex items-center gap-4 mb-6">
        <div className="flex-1 h-px bg-neutral-700" />
        <span className="text-gray-500 text-sm">OR</span>
        <div className="flex-1 h-px bg-neutral-700" />
      </div>

      {/* Email */}
      <input
        type="email"
        placeholder="Email"
        className="w-full mb-4 bg-neutral-900 border border-neutral-700 rounded-lg px-4 py-3"
      />

      {/* Password */}
      <input
        type="password"
        placeholder="Password"
        className="w-full mb-4 bg-neutral-900 border border-neutral-700 rounded-lg px-4 py-3"
      />

      {/* Confirm Password */}
      <input
        type="password"
        placeholder="Confirm Password"
        className="w-full mb-6 bg-neutral-900 border border-neutral-700 rounded-lg px-4 py-3"
      />

      <button className="w-full bg-white text-black py-3 rounded-lg hover:bg-gray-200 transition">
        Continue
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