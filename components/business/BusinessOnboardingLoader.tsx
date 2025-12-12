"use client";

import { useState, useEffect } from "react";
import Image from "next/image";

interface BusinessOnboardingLoaderProps {
  businessUrl: string;
  phase: 'analyzing' | 'screenshot';
  screenshotUrl: string | null;
}

export default function BusinessOnboardingLoader({
  businessUrl,
  phase,
  screenshotUrl,
}: BusinessOnboardingLoaderProps) {
  const [remainingSeconds, setRemainingSeconds] = useState(30);

  // Debug logging
  useEffect(() => {
    console.log("[BusinessOnboardingLoader] Props received:", {
      phase,
      screenshotUrl,
      hasScreenshotUrl: !!screenshotUrl,
      screenshotUrlType: typeof screenshotUrl,
    });
  }, [phase, screenshotUrl]);

  // Countdown timer for screenshot phase
  useEffect(() => {
    if (phase !== 'screenshot') {
      setRemainingSeconds(30);
      return;
    }

    const interval = setInterval(() => {
      setRemainingSeconds((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [phase]);

  return (
    <div className="w-full">
      {phase === 'analyzing' && (
        <div className="max-w-2xl mx-auto">
          <AnalyzingPhase businessUrl={businessUrl} />
        </div>
      )}

      {phase === 'screenshot' && screenshotUrl && (
        <div className="max-w-4xl mx-auto">
          <ScreenshotPhase
            screenshotUrl={screenshotUrl}
            remainingSeconds={remainingSeconds}
          />
        </div>
      )}
    </div>
  );
}

// Phase 1: Analyzing
function AnalyzingPhase({ businessUrl }: { businessUrl: string }) {
  return (
    <div className="relative p-0.5 rounded-3xl bg-gradient-to-r from-purple-300 via-pink-300 to-orange-300 animate-gradient-shift">
      <div className="bg-white dark:bg-gray-900 rounded-[calc(1.5rem-2px)] p-12">
        {/* Circular loading animation */}
        <div className="flex justify-center mb-8">
          <div className="relative w-16 h-16">
            <div className="absolute inset-0 border-2 border-purple-100 dark:border-purple-900 rounded-full"></div>
            <div className="absolute inset-0 border-2 border-transparent border-t-purple-400 dark:border-t-purple-500 rounded-full animate-spin"></div>
            <div className="absolute inset-2 bg-purple-50 dark:bg-purple-950 rounded-full animate-pulse"></div>
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-3 h-3 bg-purple-400 dark:bg-purple-500 rounded-full"></div>
            </div>
          </div>
        </div>

        {/* Message */}
        <h2 className="text-xl font-medium text-center text-gray-700 dark:text-gray-200 mb-6">
          Wir analysieren deine Firma und erstellen das Profil
        </h2>

        {/* URL Display */}
        <div className="flex items-center justify-center gap-2 bg-gray-50 dark:bg-gray-800 rounded-xl px-4 py-2.5 border border-gray-100 dark:border-gray-700">
          <svg className="w-3.5 h-3.5 text-gray-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
          </svg>
          <span className="text-sm text-gray-500 dark:text-gray-400 truncate">{businessUrl}</span>
        </div>
      </div>
    </div>
  );
}

// Phase 2: Screenshot - Expanded view
function ScreenshotPhase({ screenshotUrl, remainingSeconds }: { screenshotUrl: string; remainingSeconds: number }) {
  const [imageError, setImageError] = useState(false);

  console.log("[ScreenshotPhase] Rendering with URL:", screenshotUrl);
  console.log("[ScreenshotPhase] Remaining seconds:", remainingSeconds);

  if (imageError) {
    console.error("[ScreenshotPhase] Image failed to load!");
    return (
      <div className="text-center py-12">
        <p className="text-gray-500 dark:text-gray-400 font-light">Screenshot konnte nicht geladen werden</p>
      </div>
    );
  }

  return (
    <div className="w-full space-y-4">
      {/* Top bar with message */}
      <div className="bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 border-2 border-green-200 dark:border-green-800 rounded-2xl p-6">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-full bg-green-400 dark:bg-green-500 flex items-center justify-center flex-shrink-0 shadow-lg">
            <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <div className="flex-1">
            <h3 className="text-gray-800 dark:text-gray-100 font-bold text-lg">Analyse abgeschlossen!</h3>
            <p className="text-gray-600 dark:text-gray-300 text-base">Wir finalisieren dein Firmenprofil</p>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-full px-5 py-2.5 border-2 border-green-200 dark:border-green-700 shadow-md">
            <span className="text-gray-700 dark:text-gray-200 text-base font-semibold">
              {remainingSeconds}s
            </span>
          </div>
        </div>
      </div>

      {/* Screenshot */}
      <div className="relative overflow-hidden rounded-3xl shadow-2xl animate-fadeIn border-2 border-gray-200 dark:border-gray-700">
        <Image
          src={screenshotUrl}
          alt="Website Screenshot"
          width={1200}
          height={900}
          className="w-full h-auto object-contain bg-white dark:bg-gray-800"
          unoptimized
          onError={(e) => {
            console.error("[ScreenshotPhase] Image onError triggered:", e);
            console.error("[ScreenshotPhase] Failed to load URL:", screenshotUrl);
            setImageError(true);
          }}
        />
      </div>
    </div>
  );
}

