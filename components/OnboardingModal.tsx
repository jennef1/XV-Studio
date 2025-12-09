"use client";

import { useEffect } from "react";

interface OnboardingModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function OnboardingModal({ isOpen, onClose }: OnboardingModalProps) {
  // Auto-close after 2 seconds
  useEffect(() => {
    if (isOpen) {
      const timer = setTimeout(() => {
        onClose();
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-md">
      <div className="relative w-full max-w-md mx-4 bg-white dark:bg-gray-900 rounded-3xl shadow-2xl overflow-hidden p-10">
        <div className="text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-gray-200 dark:border-gray-800 mb-6">
            <span className="text-sm text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-pink-600 font-semibold">
              XV STUDIO
            </span>
          </div>
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-3">
            Willkommen!
          </h2>
          <p className="text-gray-600 dark:text-gray-400 text-lg leading-relaxed">
            Lass uns gemeinsam dein Unternehmensprofil erstellen...
          </p>
        </div>
      </div>
    </div>
  );
}
