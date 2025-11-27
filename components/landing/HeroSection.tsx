"use client";

import Image from "next/image";

export default function HeroSection() {
  return (
    <section className="relative h-screen w-full overflow-hidden">
      {/* Background image */}
      <div className="absolute inset-0 w-full h-full">
        <Image
          src="/images/backgroundHeroSection.jpeg"
          alt="Hero background"
          fill
          className="object-cover"
          priority
          quality={100}
        />
      </div>

      {/* Overlay gradient for better text readability */}
      <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/40 to-black/60"></div>

      {/* Content overlay */}
      <div className="absolute inset-0 flex items-center z-10">
        <div className="w-full pl-12 sm:pl-16 lg:pl-24">
          <div className="max-w-4xl">
            {/* Title */}
            <h1 className="text-4xl md:text-5xl font-medium text-white mb-6 leading-loose">
              KI-Marketingmaterial für dein KMU
              <br />
              <span className="text-blue-400">
                Geführt, schnell und kostengünstig
              </span>
            </h1>

            {/* Subtitle */}
            <p className="text-lg md:text-xl text-white/90 mb-8 leading-relaxed max-w-2xl">
              Unsere KI begleitet dich Schritt für Schritt und erstellt automatisch professionelles Marketingmaterial – ohne technisches Wissen, hohe Kosten oder interne Experten. So gewinnst du Zeit und kannst dich auf das konzentrieren, was du am besten kannst!
            </p>

            {/* CTA Button */}
            <a
              href="/studio"
              className="inline-block px-8 py-4 text-base md:text-lg font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-all duration-300 shadow-lg hover:shadow-xl"
            >
              Lass uns dein Marketing auf's nächste Level bringen
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}

