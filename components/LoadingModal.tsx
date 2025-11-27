"use client";

import { useEffect, useState } from "react";

interface LoadingModalProps {
  isOpen: boolean;
  businessUrl: string;
  estimatedTimeMinutes?: number;
}

export default function LoadingModal({
  isOpen,
  businessUrl,
  estimatedTimeMinutes = 2,
}: LoadingModalProps) {
  const [timeLeft, setTimeLeft] = useState(estimatedTimeMinutes);
  const [showCircle, setShowCircle] = useState(false);

  useEffect(() => {
    if (!isOpen) {
      setTimeLeft(estimatedTimeMinutes);
      setShowCircle(false);
      return;
    }

    // Show circle animation briefly at the start
    setShowCircle(true);
    const circleTimeout = setTimeout(() => {
      setShowCircle(false);
    }, 1500);

    const interval = setInterval(() => {
      setTimeLeft((prev) => Math.max(0, prev - 0.1));
    }, 6000); // Decrease by 0.1 every 6 seconds (1 minute per minute)

    return () => {
      clearInterval(interval);
      clearTimeout(circleTimeout);
    };
  }, [isOpen, estimatedTimeMinutes]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-sm">
      {/* Subtle circle animation that appears briefly */}
      {showCircle && (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <div className="w-32 h-32 border-4 border-purple-400 rounded-full animate-ping opacity-50"></div>
        </div>
      )}

      <div className="relative max-w-xl w-full mx-4 bg-gradient-to-br from-purple-50/90 via-pink-50/90 to-orange-50/90 dark:from-purple-950/30 dark:via-pink-950/30 dark:to-orange-950/30 rounded-3xl shadow-xl overflow-hidden border border-purple-200/50 dark:border-purple-700/50 backdrop-blur-sm">
        <div className="relative p-8">
          {/* Circular loading animation */}
          <div className="flex justify-center mb-6">
            <div className="relative w-20 h-20">
              {/* Outer spinning circle */}
              <div className="absolute inset-0 border-4 border-purple-200 dark:border-purple-800 rounded-full"></div>
              <div className="absolute inset-0 border-4 border-transparent border-t-purple-600 dark:border-t-purple-400 rounded-full animate-spin"></div>
              {/* Inner pulsing circle */}
              <div className="absolute inset-3 bg-purple-100 dark:bg-purple-900 rounded-full animate-pulse"></div>
              {/* Center dot */}
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-4 h-4 bg-purple-600 dark:bg-purple-400 rounded-full"></div>
              </div>
            </div>
          </div>

          {/* Title */}
          <h2 className="text-2xl md:text-3xl font-bold text-center mb-3 text-gray-900 dark:text-white">
            Erstelle deine Business DNA
          </h2>

          {/* Subtitle */}
          <p className="text-center text-sm text-gray-600 dark:text-gray-300 mb-6 leading-relaxed">
            Wir analysieren deine Webseite und erstellen deine Business DNA.<br />
            Dies kann bis zu 2 Minuten dauern.
          </p>

          {/* Status indicator */}
          <div className="mb-5">
            <div className="flex items-center justify-center gap-2 bg-white/60 dark:bg-gray-700/60 rounded-xl px-4 py-3 border border-purple-200/50 dark:border-purple-700/50">
              <div className="flex gap-1">
                <span className="w-1.5 h-1.5 bg-purple-500 dark:bg-purple-400 rounded-full animate-bounce" style={{ animationDelay: "0ms" }}></span>
                <span className="w-1.5 h-1.5 bg-purple-500 dark:bg-purple-400 rounded-full animate-bounce" style={{ animationDelay: "150ms" }}></span>
                <span className="w-1.5 h-1.5 bg-purple-500 dark:bg-purple-400 rounded-full animate-bounce" style={{ animationDelay: "300ms" }}></span>
              </div>
              <span className="text-sm font-medium text-gray-700 dark:text-gray-200">
                Webseite wird analysiert
              </span>
            </div>
          </div>

          {/* URL Display */}
          <div className="mb-5 flex items-center justify-center gap-2 bg-white/60 dark:bg-gray-700/60 rounded-xl px-4 py-3 border border-purple-200/50 dark:border-purple-700/50">
            <svg
              className="w-4 h-4 text-gray-400 dark:text-gray-500 flex-shrink-0"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1"
              />
            </svg>
            <span className="text-sm text-gray-600 dark:text-gray-300 truncate">
              {businessUrl}
            </span>
          </div>

          {/* Time estimate */}
          <div className="flex items-center justify-center gap-2 text-gray-500 dark:text-gray-400 mb-4">
            <svg
              className="w-4 h-4 animate-spin"
              fill="none"
              viewBox="0 0 24 24"
            >
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
              />
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
              />
            </svg>
            <span className="text-sm font-medium">
              Noch ca. {Math.ceil(timeLeft)} Minute{Math.ceil(timeLeft) !== 1 ? "n" : ""}
            </span>
          </div>

          {/* Progress bar */}
          <div className="w-full bg-white/60 dark:bg-gray-700/60 rounded-full h-2 overflow-hidden border border-purple-200/50 dark:border-purple-700/50">
            <div
              className="h-full bg-gradient-to-r from-purple-500 via-pink-500 to-orange-500 rounded-full transition-all duration-1000 ease-linear"
              style={{
                width: `${Math.max(5, ((estimatedTimeMinutes - timeLeft) / estimatedTimeMinutes) * 100)}%`
              }}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
