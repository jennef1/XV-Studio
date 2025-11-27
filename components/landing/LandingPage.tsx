import LandingHeader from "./LandingHeader";
import HeroSection from "./HeroSection";
import HowItWorksSection from "./HowItWorksSection";
import DiscoverSection from "./DiscoverSection";
import FAQSection from "./FAQSection";

export default function LandingPage() {
  return (
    <main className="min-h-screen">
      <LandingHeader />
      <div id="hero">
        <HeroSection />
      </div>
      <HowItWorksSection />
      <DiscoverSection />
      <FAQSection />
    </main>
  );
}

