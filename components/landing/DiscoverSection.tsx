"use client";

import { useState } from "react";
import Image from "next/image";

interface Example {
  id: number;
  title: string;
  description: string;
  imageType: "image" | "video";
  imageSrc?: string;
  prompt?: string;
}

const examples: Example[] = [
  {
    id: 1,
    title: "Social Media Post",
    description: "KI-generierte Produktbilder für Instagram",
    imageType: "image",
    imageSrc: "/images/example-social-1.jpg",
    prompt: "Modern product photography for luxury watch on marble surface",
  },
  {
    id: 2,
    title: "Video Content",
    description: "Professionelle Werbevideos in Minuten",
    imageType: "video",
    imageSrc: "/images/example-video-1.jpg",
    prompt: "Close up shot of woman with sunglasses on top of her head",
  },
  {
    id: 3,
    title: "Marketing Material",
    description: "Ansprechende Grafiken für deine Kampagne",
    imageType: "image",
    imageSrc: "/images/example-marketing-1.jpg",
    prompt: "Corporate business presentation design with modern aesthetic",
  },
  {
    id: 4,
    title: "Produkt Showcase",
    description: "Hochwertige Produktpräsentationen",
    imageType: "image",
    imageSrc: "/images/example-product-1.jpg",
    prompt: "E-commerce product photography with professional lighting",
  },
  {
    id: 5,
    title: "Content Series",
    description: "Konsistente Inhalte für deine Marke",
    imageType: "image",
    imageSrc: "/images/example-series-1.jpg",
    prompt: "Brand storytelling through visual content creation",
  },
];

export default function DiscoverSection() {
  const [currentIndex, setCurrentIndex] = useState(0);

  const goToPrevious = () => {
    setCurrentIndex((prev) => (prev === 0 ? examples.length - 1 : prev - 1));
  };

  const goToNext = () => {
    setCurrentIndex((prev) => (prev === examples.length - 1 ? 0 : prev + 1));
  };

  const currentExample = examples[currentIndex];

  return (
    <section className="relative py-24 bg-gradient-to-b from-gray-50 to-white dark:from-gray-900 dark:to-gray-950 overflow-hidden">
      {/* Background decoration */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-purple-300 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-yellow-300 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob animation-delay-2000"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-80 h-80 bg-pink-300 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob animation-delay-4000"></div>
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section header */}
        <div className="text-center mb-12">
          <h2 className="text-4xl md:text-5xl font-bold mb-4 text-gray-900 dark:text-white">
            Entdecke was möglich ist mit XV Studio
          </h2>
          <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
            Sieh dir Beispiele an, wie unsere KI professionelle Marketinginhalte erstellt
          </p>
        </div>

        {/* Large card with carousel */}
        <div className="bg-gray-50 dark:bg-gray-900 rounded-3xl shadow-2xl overflow-hidden border border-gray-200 dark:border-gray-800">
          <div className="grid lg:grid-cols-2 gap-0">
            {/* Left side - Input (Reference Image + Prompt) */}
            <div className="p-6 lg:p-8 flex flex-col justify-center border-r border-gray-200 dark:border-gray-800">
              <div className="mb-4">
                <span className="inline-block px-3 py-1 rounded-full bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 text-xs font-semibold mb-3">
                  Input
                </span>
                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
                  {currentExample.title}
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-300 mb-4">
                  {currentExample.description}
                </p>
              </div>

              {/* Reference Image - Small */}
              <div className="mb-4">
                <h4 className="text-xs font-semibold text-gray-500 dark:text-gray-400 mb-2">
                  Referenzbild
                </h4>
                <div className="bg-white dark:bg-gray-800 rounded-lg p-2 border border-gray-200 dark:border-gray-700 inline-block">
                  <div className="w-24 h-24 bg-gradient-to-br from-blue-400 to-purple-500 rounded flex items-center justify-center">
                    <div className="text-white text-2xl">📷</div>
                  </div>
                </div>
              </div>

              {/* Generation Prompt */}
              {currentExample.prompt && (
                <div className="mb-6">
                  <h4 className="text-xs font-semibold text-gray-500 dark:text-gray-400 mb-2">
                    Generation Prompt
                  </h4>
                  <div className="bg-white dark:bg-gray-800 rounded-lg p-3 border border-gray-200 dark:border-gray-700">
                    <p className="text-xs text-gray-700 dark:text-gray-300">
                      {currentExample.prompt}
                    </p>
                  </div>
                </div>
              )}

              {/* Indicators */}
              <div className="flex items-center gap-2 mb-4">
                {examples.map((_, index) => (
                  <button
                    key={index}
                    onClick={() => setCurrentIndex(index)}
                    className={`h-1.5 rounded-full transition-all ${
                      index === currentIndex
                        ? "w-6 bg-gradient-to-r from-purple-600 to-pink-600"
                        : "w-1.5 bg-gray-300 dark:bg-gray-700 hover:bg-gray-400 dark:hover:bg-gray-600"
                    }`}
                    aria-label={`Go to example ${index + 1}`}
                  />
                ))}
              </div>

              {/* CTA */}
              <a
                href="/studio"
                className="inline-flex items-center justify-center px-5 py-2.5 text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-all duration-300 shadow-lg hover:shadow-xl"
              >
                Jetzt selbst erstellen
                <svg
                  className="w-4 h-4 ml-2"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 5l7 7-7 7"
                  />
                </svg>
              </a>
            </div>

            {/* Right side - Output (Generated Result) */}
            <div className="relative bg-gray-100 dark:bg-gray-800 aspect-[4/3] lg:aspect-auto min-h-[400px]">
              {/* Placeholder for generated result */}
              <div className="w-full h-full flex items-center justify-center p-6">
                <div className="relative w-full h-full max-w-lg bg-gradient-to-br from-purple-600 via-pink-600 to-orange-500 rounded-xl flex items-center justify-center">
                  <div className="text-center text-white p-6">
                    <div className="text-5xl mb-3">
                      {currentExample.imageType === "video" ? "🎥" : "🖼️"}
                    </div>
                    <h3 className="text-xl font-bold mb-1">
                      Generiertes Ergebnis
                    </h3>
                    <p className="text-sm opacity-90">
                      {currentExample.imageType === "video" ? "Video" : "Bild"}
                    </p>
                  </div>
                </div>
              </div>

              {/* Navigation arrows */}
              <button
                onClick={goToPrevious}
                className="absolute left-3 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white dark:bg-gray-800 shadow-lg flex items-center justify-center hover:scale-110 transition-transform"
                aria-label="Previous example"
              >
                <svg
                  className="w-5 h-5 text-gray-900 dark:text-white"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M15 19l-7-7 7-7"
                  />
                </svg>
              </button>

              <button
                onClick={goToNext}
                className="absolute right-3 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white dark:bg-gray-800 shadow-lg flex items-center justify-center hover:scale-110 transition-transform"
                aria-label="Next example"
              >
                <svg
                  className="w-5 h-5 text-gray-900 dark:text-white"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 5l7 7-7 7"
                  />
                </svg>
              </button>

              {/* Output badge */}
              <div className="absolute top-3 left-3">
                <span className="inline-block px-3 py-1 rounded-full bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm text-gray-900 dark:text-white text-xs font-semibold shadow-lg">
                  {currentExample.imageType === "video" ? "Video" : "Bild"} Output
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
