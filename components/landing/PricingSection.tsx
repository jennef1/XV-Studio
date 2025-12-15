"use client";

import { useState } from "react";

export default function PricingSection() {
  const bilderWorkflows = [
    {
      id: "product",
      title: "Aus einem Bild ein neues kreieren",
      price: "CHF 10.-",
      icon: "📦",
      gradient: "from-purple-400 to-pink-400",
      recommended: true,
      videoUrl: "https://khvcsdzqqmudeuprgzjf.supabase.co/storage/v1/object/public/XVS%20Material/Bilder_SetzeProduktEin.mp4",
    },
    {
      id: "combine",
      title: "Bilder zu einem neuen Bild kombinieren",
      price: "CHF 10.-",
      icon: "🎨",
      gradient: "from-blue-400 to-cyan-400",
      recommended: false,
      videoUrl: "https://khvcsdzqqmudeuprgzjf.supabase.co/storage/v1/object/public/XVS%20Material/Bilder_KombiniereBilder.mp4",
    },
    {
      id: "freebird",
      title: "Ein neues Bild nach deinen Ideen erstellen",
      price: "CHF 5.-",
      icon: "🚀",
      gradient: "from-green-400 to-emerald-400",
      recommended: false,
      videoUrl: "https://khvcsdzqqmudeuprgzjf.supabase.co/storage/v1/object/public/XVS%20Material/Bilder_FreeBird.mp4",
    },
    {
      id: "social-media-campaign",
      title: "Social Media Kampagne",
      price: "CHF 80.-",
      icon: "📱",
      gradient: "from-blue-400 to-purple-400",
      recommended: false,
      videoUrl: "https://khvcsdzqqmudeuprgzjf.supabase.co/storage/v1/object/public/XVS%20Material/Social%20Media%20Boost_Kampagne.mp4",
    },
  ];

  const videoWorkflows = [
    {
      id: "product-rotation",
      title: "Rotierendes Produkt im Glanz",
      price: "CHF 40.-",
      duration: "8 sec",
      icon: "🔄",
      gradient: "from-orange-400 to-red-400",
      videoUrl: "https://khvcsdzqqmudeuprgzjf.supabase.co/storage/v1/object/public/XVS%20Material/ProduktRotation.mp4",
    },
    {
      id: "user-speaks",
      title: "KI spricht über dein Angebot",
      price: "CHF 40.-",
      duration: "8 sec",
      icon: "🗣️",
      gradient: "from-blue-400 to-cyan-400",
      videoUrl: "https://khvcsdzqqmudeuprgzjf.supabase.co/storage/v1/object/public/XVS%20Material/KundenTestimonial.mp4",
    },
    {
      id: "image-to-video",
      title: "Aus Bild und Text ein Video generieren",
      price: "CHF 35.-",
      duration: "8 sec",
      icon: "🎬",
      gradient: "from-green-400 to-emerald-400",
      videoUrl: "https://khvcsdzqqmudeuprgzjf.supabase.co/storage/v1/object/public/XVS%20Material/ImageToVideo.mp4",
    },
    {
      id: "inspirational",
      title: "Inspirierendes Video generieren",
      price: "CHF 80.-",
      duration: "16 sec",
      icon: "✨",
      gradient: "from-purple-400 to-pink-400",
      videoUrl: "https://khvcsdzqqmudeuprgzjf.supabase.co/storage/v1/object/public/XVS%20Material/Inspiration.mp4",
    },
    {
      id: "ai-explains",
      title: "Erklärvideo mit Fokus auf Vorteile",
      price: "CHF 120.-",
      duration: "24 sec",
      icon: "🤖",
      gradient: "from-indigo-400 to-blue-400",
      videoUrl: "https://khvcsdzqqmudeuprgzjf.supabase.co/storage/v1/object/public/XVS%20Material/ProduktImEchtenLeben.mp4",
    },
  ];

  const handleMouseEnter = (e: React.MouseEvent<HTMLDivElement>) => {
    const video = e.currentTarget.querySelector('video');
    if (video) {
      video.play();
    }
  };

  const handleMouseLeave = (e: React.MouseEvent<HTMLDivElement>) => {
    const video = e.currentTarget.querySelector('video');
    if (video) {
      video.pause();
      video.currentTime = 0;
    }
  };

  return (
    <section className="py-20 bg-gray-100">
      <div className="container mx-auto px-6 max-w-7xl">
        {/* Header */}
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
            Bezahle erst, wenn du zufrieden bist
          </h2>
          <p className="text-xl text-gray-700 max-w-3xl mx-auto">
            Keine monatliche Gebühr. Du kannst deine Bilder und Video&apos;s iterieren bis du zufrieden bist.
            Passt das Produkt, so bezahlst du nur die Marketing Ads, die dir gefallen!
          </p>
        </div>

        {/* Bilder Section */}
        <div className="mb-20">
          <div className="mb-8">
            <h3 className="text-3xl font-bold text-gray-900 mb-2">
              Bilder
            </h3>
            <div className="h-1 w-20 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full"></div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {bilderWorkflows.map((workflow) => (
              <div
                key={workflow.id}
                onMouseEnter={handleMouseEnter}
                onMouseLeave={handleMouseLeave}
                className="group relative border-2 rounded-2xl overflow-hidden transition-all hover:shadow-2xl border-gray-200 bg-white hover:scale-105"
              >
                {/* Video Preview */}
                <div className="aspect-square bg-gray-50 relative overflow-hidden">
                  {workflow.videoUrl ? (
                    <video
                      src={workflow.videoUrl}
                      muted
                      loop
                      playsInline
                      preload="auto"
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className={`w-full h-full flex items-center justify-center bg-gradient-to-br ${workflow.gradient}`}>
                      <span className="text-6xl opacity-90">{workflow.icon}</span>
                    </div>
                  )}

                  {/* Price Tag */}
                  <div className="absolute top-3 right-3 bg-white/95 backdrop-blur-sm px-3 py-1.5 rounded-xl shadow-lg z-10">
                    <p className="text-sm font-bold text-gray-900">
                      {workflow.price}
                    </p>
                  </div>

                  {/* Recommended Badge */}
                  {workflow.recommended && (
                    <div className="absolute top-3 left-3 bg-gradient-to-r from-purple-500 to-pink-500 text-white px-3 py-1 rounded-lg text-xs font-bold shadow-lg z-10">
                      Top
                    </div>
                  )}
                </div>

                {/* Title */}
                <div className="p-4">
                  <p className="text-sm font-semibold text-gray-900 text-center">
                    {workflow.title}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Video Section */}
        <div>
          <div className="mb-8">
            <h3 className="text-3xl font-bold text-gray-900 mb-2">
              Video
            </h3>
            <div className="h-1 w-20 bg-gradient-to-r from-orange-500 to-red-500 rounded-full"></div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6">
            {videoWorkflows.map((workflow) => (
              <div
                key={workflow.id}
                onMouseEnter={handleMouseEnter}
                onMouseLeave={handleMouseLeave}
                className="group relative border-2 rounded-2xl overflow-hidden transition-all hover:shadow-2xl border-gray-200 bg-white hover:scale-105"
              >
                {/* Video Preview */}
                <div className="aspect-square bg-gray-50 relative overflow-hidden">
                  {workflow.videoUrl ? (
                    <video
                      src={workflow.videoUrl}
                      muted
                      loop
                      playsInline
                      preload="auto"
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className={`w-full h-full flex items-center justify-center bg-gradient-to-br ${workflow.gradient}`}>
                      <span className="text-6xl opacity-90">{workflow.icon}</span>
                    </div>
                  )}

                  {/* Price Tag */}
                  <div className="absolute top-3 right-3 bg-white/95 backdrop-blur-sm px-3 py-1.5 rounded-xl shadow-lg z-10">
                    <p className="text-sm font-bold text-gray-900">
                      {workflow.price}
                    </p>
                  </div>

                  {/* Duration Badge */}
                  <div className="absolute bottom-3 left-3 bg-black/80 backdrop-blur-sm px-2.5 py-1 rounded-lg z-10">
                    <p className="text-xs font-medium text-white">
                      {workflow.duration}
                    </p>
                  </div>
                </div>

                {/* Title */}
                <div className="p-4">
                  <p className="text-sm font-semibold text-gray-900 text-center">
                    {workflow.title}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
