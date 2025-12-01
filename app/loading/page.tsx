"use client";

import { useEffect, useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import LoadingSpinner from "@/components/loading/LoadingSpinner";
import { supabaseBrowserClient } from "@/lib/supabaseClient";

const POLL_INTERVAL = 3000; // 3 seconds
const MAX_WAIT_TIME = 180000; // 3 minutes

function LoadingPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const userId = searchParams.get("user_id");
  const [error, setError] = useState<string | null>(null);
  const [elapsedTime, setElapsedTime] = useState(0);

  useEffect(() => {
    if (!userId) {
      setError("Fehlende Benutzer-ID. Bitte versuche es erneut von der Startseite.");
      return;
    }

    let pollTimer: NodeJS.Timeout;
    let elapsedTimer: NodeJS.Timeout;
    let startTime = Date.now();

    const checkForBusinessData = async () => {
      try {
        const { data, error: supabaseError } = await supabaseBrowserClient
          .from("businesses")
          .select("*")
          .eq("user_id", userId)
          .order("created_at", { ascending: false })
          .limit(1)
          .single();

        if (supabaseError) {
          // If no data found, continue polling
          if (supabaseError.code === "PGRST116") {
            const elapsed = Date.now() - startTime;
            if (elapsed >= MAX_WAIT_TIME) {
              setError(
                "Wir verarbeiten immer noch deine Business-DNA. Dies dauert länger als erwartet. Bitte schau in ein paar Minuten noch einmal vorbei."
              );
              clearInterval(pollTimer);
              clearInterval(elapsedTimer);
              return;
            }
            return;
          }
          throw supabaseError;
        }

        if (data) {
          // Data found! Redirect to business DNA page
          clearInterval(pollTimer);
          clearInterval(elapsedTimer);
          router.push(`/business-dna/${data.id}`);
        }
      } catch (err) {
        console.error("Error checking for business data:", err);
        setError("Ein Fehler ist beim Überprüfen deiner Geschäftsdaten aufgetreten. Bitte versuche es erneut.");
        clearInterval(pollTimer);
        clearInterval(elapsedTimer);
      }
    };

    // Start polling
    checkForBusinessData();
    pollTimer = setInterval(checkForBusinessData, POLL_INTERVAL);

    // Update elapsed time every second for UI
    elapsedTimer = setInterval(() => {
      setElapsedTime(Date.now() - startTime);
    }, 1000);

    return () => {
      clearInterval(pollTimer);
      clearInterval(elapsedTimer);
    };
  }, [userId, router]);

  const formatElapsedTime = (ms: number) => {
    const seconds = Math.floor(ms / 1000);
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, "0")}`;
  };

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-gray-50 to-white dark:from-gray-950 dark:to-gray-900">
        <div className="text-center max-w-md mx-auto px-4">
          <div className="mb-6 text-red-500 text-6xl">⚠️</div>
          <h2 className="text-2xl font-bold mb-4 text-gray-900 dark:text-white font-[family-name:var(--font-quicksand)]">
            Hoppla!
          </h2>
          <p className="text-gray-600 dark:text-gray-400 mb-8">{error}</p>
          <button
            onClick={() => router.push("/")}
            className="px-8 py-3 bg-gradient-to-r from-purple-600 via-pink-600 to-orange-500 text-white rounded-3xl font-semibold hover:shadow-lg transition-all transform hover:scale-105"
          >
            Zurück zur Startseite
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-gray-50 to-white dark:from-gray-950 dark:to-gray-900">
      {/* Background decoration */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-purple-300 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-yellow-300 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob animation-delay-2000"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-80 h-80 bg-pink-300 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob animation-delay-4000"></div>
      </div>

      <div className="relative z-10 text-center">
        <LoadingSpinner />
        <h2 className="mt-8 text-2xl md:text-3xl font-bold text-gray-900 dark:text-white mb-4 font-[family-name:var(--font-quicksand)]">
          Erstelle deine Business-DNA
        </h2>
        <p className="text-lg text-gray-600 dark:text-gray-400 mb-2">
          Dies kann bis zu 3 Minuten dauern
        </p>
        <p className="text-sm text-gray-500 dark:text-gray-500">
          Verstrichene Zeit: {formatElapsedTime(elapsedTime)}
        </p>
        <p className="mt-6 text-sm text-gray-400 dark:text-gray-600">
          Wir analysieren deine Website und erstellen ein umfassendes Markenprofil...
        </p>
      </div>
    </div>
  );
}

export default function LoadingPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-gray-50 to-white dark:from-gray-950 dark:to-gray-900">
        <LoadingSpinner />
      </div>
    }>
      <LoadingPageContent />
    </Suspense>
  );
}
