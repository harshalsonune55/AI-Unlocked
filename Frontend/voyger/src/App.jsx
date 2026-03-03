import { Routes, Route } from "react-router-dom";
import MainPage from "./pages/MainPage";
import Login from "./pages/Login";
import Signup from "./pages/Signup";

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<MainPage />} />
      <Route path="/login" element={<Login />} />
      <Route path="/signup" element={<Signup />} />
    </Routes>
  );
}