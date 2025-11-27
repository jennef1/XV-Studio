"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import LoginModal from "./LoginModal";

export default function LandingHeader() {
  const router = useRouter();
  const [showLoginModal, setShowLoginModal] = useState(false);

  return (
    <>
      <header className="fixed top-0 left-0 right-0 z-50 pointer-events-none">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <div className="pointer-events-auto">
              <Image
                src="/images/XV Logo.png"
                alt="XV Studio Logo"
                width={180}
                height={60}
                className="h-14 w-auto"
                priority
              />
            </div>

            {/* Login / Sign Up Button */}
            <button
              onClick={() => setShowLoginModal(true)}
              className="pointer-events-auto px-6 py-2.5 text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-all duration-200 shadow-lg hover:shadow-xl"
            >
              Login / Sign Up
            </button>
          </div>
        </div>
      </header>

      {/* Login Modal */}
      <LoginModal
        isOpen={showLoginModal}
        onClose={() => setShowLoginModal(false)}
      />
    </>
  );
}

