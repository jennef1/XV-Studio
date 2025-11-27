"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import LoadingModal from "@/components/LoadingModal";

const USER_ID = "0a052fb8-e740-4940-b56f-fe138bbd845d";
const API_ROUTE = "/api/webhook/business-website-dna";

export default function HowItWorksSection() {
  const [businessUrl, setBusinessUrl] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [showLoadingModal, setShowLoadingModal] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();

  const isValidUrl = (urlString: string): boolean => {
    try {
      const url = new URL(urlString);
      return url.protocol === "http:" || url.protocol === "https:";
    } catch {
      // Try adding https:// if no protocol
      try {
        const urlWithProtocol = `https://${urlString}`;
        new URL(urlWithProtocol);
        return true;
      } catch {
        return false;
      }
    }
  };

  const normalizeUrl = (urlString: string): string => {
    try {
      new URL(urlString);
      return urlString;
    } catch {
      return `https://${urlString}`;
    }
  };

  const handleGetStarted = async () => {
    if (!isValidUrl(businessUrl)) {
      setError("Bitte gib eine gültige Website-URL ein");
      return;
    }

    setIsLoading(true);
    setError("");
    setShowLoadingModal(true);

    try {
      const normalizedUrl = normalizeUrl(businessUrl);

      console.log("Sending request to API route:", API_ROUTE);
      console.log("Payload:", { url: normalizedUrl, user_id: USER_ID });

      const response = await fetch(API_ROUTE, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          url: normalizedUrl,
          user_id: USER_ID,
        }),
      });

      console.log("Response status:", response.status);
      console.log("Response ok:", response.ok);

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: "Unknown error" }));
        console.error("Error response:", errorData);
        throw new Error(errorData.error || `Failed to submit URL: ${response.status} ${response.statusText}`);
      }

      const responseData = await response.json();
      console.log("Success response:", responseData);

      // Redirect to loading page to wait for Business DNA creation
      router.push(`/loading?user_id=${encodeURIComponent(USER_ID)}`);
    } catch (err) {
      console.error("Error submitting URL:", err);
      const errorMessage = err instanceof Error ? err.message : "Etwas ist schiefgelaufen. Bitte versuche es erneut.";
      setError(errorMessage);
      setShowLoadingModal(false);
    } finally {
      setIsLoading(false);
    }
  };

  const isUrlValid = isValidUrl(businessUrl);

  return (
    <>
      <LoadingModal
        isOpen={showLoadingModal}
        businessUrl={businessUrl}
        estimatedTimeMinutes={2}
      />

      <section className="relative py-24 bg-gradient-to-b from-gray-50 to-gray-50 dark:from-gray-950 dark:to-gray-900 overflow-hidden">
      {/* Background decoration */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-purple-300 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-yellow-300 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob animation-delay-2000"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-80 h-80 bg-pink-300 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob animation-delay-4000"></div>
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section header */}
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold mb-4 text-gray-900 dark:text-white">
            So funktioniert's
          </h2>
          <p className="text-base md:text-lg text-gray-600 dark:text-gray-400 max-w-3xl mx-auto leading-relaxed">
            Unsere KI analysiert deine Webseite sowie deinen Input und erstellt daraus richtig starkes Marketingmaterial - schnell, unkompliziert und in deiner Firmensprache.
          </p>
        </div>

        {/* URL Input with radiant shadow */}
        <div className="max-w-2xl mx-auto mb-4 mt-12">
          <div className="relative group">
            <input
              type="url"
              value={businessUrl}
              onChange={(e) => {
                setBusinessUrl(e.target.value);
                setError("");
              }}
              onKeyDown={(e) => {
                if (e.key === "Enter" && isUrlValid && !isLoading) {
                  handleGetStarted();
                }
              }}
              placeholder="https://deinefirma.ch"
              className={`w-full px-6 py-5 text-lg rounded-3xl border-2 ${
                error
                  ? "border-red-500 dark:border-red-500"
                  : isUrlValid
                  ? "border-green-500 dark:border-green-500"
                  : "border-gray-200 dark:border-gray-700"
              } bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-0 transition-all duration-300 shadow-[0_0_0_0_rgba(139,92,246,0)] group-hover:shadow-[0_0_30px_10px_rgba(139,92,246,0.3)] focus:shadow-[0_0_40px_15px_rgba(139,92,246,0.4),0_0_60px_20px_rgba(236,72,153,0.3)]`}
            />
            <div className="absolute inset-0 rounded-3xl bg-gradient-to-r from-purple-500 via-pink-500 to-orange-500 opacity-0 group-hover:opacity-10 blur-xl transition-opacity duration-300 pointer-events-none"></div>
          </div>
          {error && (
            <p className="mt-2 text-sm text-red-500 text-center">{error}</p>
          )}
        </div>

        {/* CTA Button */}
        <div className="text-center mb-16">
          <button
            onClick={handleGetStarted}
            disabled={!isUrlValid || isLoading}
            className="px-10 py-5 text-lg font-semibold text-white rounded-3xl transition-all duration-300 focus:outline-none focus:ring-4 focus:ring-purple-300 dark:focus:ring-purple-800 bg-gradient-to-r from-purple-600 via-pink-600 to-orange-500 hover:shadow-2xl hover:shadow-purple-500/50 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none disabled:shadow-none"
          >
            {isLoading ? "Wird verarbeitet..." : "Jetzt starten"}
          </button>
        </div>

        {/* Steps overview */}
        <div className="mt-16 grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
          <div className="text-center p-6 rounded-2xl bg-gray-50 dark:bg-gray-800">
            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-purple-100 dark:bg-purple-900 flex items-center justify-center">
              <span className="text-2xl font-bold text-purple-600 dark:text-purple-400">1</span>
            </div>
            <h3 className="text-xl font-semibold mb-2 text-gray-900 dark:text-white">
              URL eingeben
            </h3>
            <p className="text-gray-600 dark:text-gray-300">
              Gib einfach deine Website-URL ein und lass unsere KI sie analysieren
            </p>
          </div>

          <div className="text-center p-6 rounded-2xl bg-gray-50 dark:bg-gray-800">
            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-pink-100 dark:bg-pink-900 flex items-center justify-center">
              <span className="text-2xl font-bold text-pink-600 dark:text-pink-400">2</span>
            </div>
            <h3 className="text-xl font-semibold mb-2 text-gray-900 dark:text-white">
              KI-Analyse
            </h3>
            <p className="text-gray-600 dark:text-gray-300">
              Unsere KI versteht deine Marke, Produkte und Zielgruppe
            </p>
          </div>

          <div className="text-center p-6 rounded-2xl bg-gray-50 dark:bg-gray-800">
            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-orange-100 dark:bg-orange-900 flex items-center justify-center">
              <span className="text-2xl font-bold text-orange-600 dark:text-orange-400">3</span>
            </div>
            <h3 className="text-xl font-semibold mb-2 text-gray-900 dark:text-white">
              Content erstellen
            </h3>
            <p className="text-gray-600 dark:text-gray-300">
              Erstelle beeindruckendes Marketingmaterial, perfekt auf dein Business zugeschnitten
            </p>
          </div>
        </div>
      </div>
    </section>
    </>
  );
}




