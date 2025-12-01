"use client";

import { useState } from "react";
import LandingHeader from "./LandingHeader";
import HeroSection from "./HeroSection";
import HowItWorksSection from "./HowItWorksSection";
import DiscoverSection from "./DiscoverSection";
import FAQSection from "./FAQSection";
import LoginModal from "./LoginModal";

export default function LandingPage() {
  const [showLoginModal, setShowLoginModal] = useState(false);

  return (
    <main className="min-h-screen">
      <LandingHeader onOpenLogin={() => setShowLoginModal(true)} />
      <div id="hero">
        <HeroSection onOpenLogin={() => setShowLoginModal(true)} />
      </div>
      <HowItWorksSection />
      <DiscoverSection />
      <FAQSection />

      <LoginModal
        isOpen={showLoginModal}
        onClose={() => setShowLoginModal(false)}
      />
    </main>
  );
}

