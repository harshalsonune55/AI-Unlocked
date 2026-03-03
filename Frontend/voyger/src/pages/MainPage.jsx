import { useEffect, useState } from "react";
import Navbar from "../components/Navbar";
import Hero from "../components/Hero";
import Footer from "../components/Footer";
import DiscoverTrips from "../components/DiscoverTrips";
import TrustedBy from "../components/TrustedBy";
import "./Main.css";

export default function MainPage() {

  const phrases = [
    "Plan a 5-day trip to Paris...",
    "Create a Goa beach itinerary...",
    "Suggest a budget trip to Thailand...",
    "Plan a romantic trip to Bali...",
    "Generate a Europe backpacking route..."
  ];

  const [displayText, setDisplayText] = useState("");
  const [phraseIndex, setPhraseIndex] = useState(0);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    const currentPhrase = phrases[phraseIndex];
    const typingSpeed = isDeleting ? 40 : 80;

    const timeout = setTimeout(() => {
      if (!isDeleting) {
        setDisplayText(currentPhrase.substring(0, displayText.length + 1));

        if (displayText === currentPhrase) {
          setTimeout(() => setIsDeleting(true), 1000);
        }
      } else {
        setDisplayText(currentPhrase.substring(0, displayText.length - 1));

        if (displayText === "") {
          setIsDeleting(false);
          setPhraseIndex((prev) => (prev + 1) % phrases.length);
        }
      }
    }, typingSpeed);

    return () => clearTimeout(timeout);
  }, [displayText, isDeleting, phraseIndex]);

  return (
    <div className="bg-black text-white">
      <Navbar />
      <Hero displayText={displayText} />
      <TrustedBy />
      <DiscoverTrips />
      <Footer />
    </div>
  );
}