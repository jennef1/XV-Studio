"use client";

interface HeroSectionProps {
  onOpenLogin: () => void;
}

export default function HeroSection({ onOpenLogin }: HeroSectionProps) {
  return (
    <section className="relative min-h-screen w-full bg-white flex items-center justify-center px-8 sm:px-12 lg:px-16 py-20">
      <div className="max-w-6xl mx-auto text-center">
        {/* Badge */}
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-gray-200 mb-8">
          <span className="text-sm text-blue-600 font-medium">KI für</span>
          <span className="text-sm font-medium text-transparent bg-clip-text bg-gradient-to-r from-pink-500 to-purple-600">
            Marketing
          </span>
        </div>

        {/* Main Headline */}
        <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-bold mb-8 leading-relaxed tracking-tight pb-2">
          <div className="text-gray-900 whitespace-nowrap">KI-Marketing für dein KMU</div>
          <div className="text-transparent bg-clip-text bg-gradient-to-r from-pink-500 to-purple-600 mt-2 whitespace-nowrap">
            Geführt, schnell & kostengünstig.
          </div>
        </h1>

        {/* Subtitle */}
        <p className="text-lg md:text-xl text-gray-700 mb-12 leading-loose max-w-3xl mx-auto">
          Unsere KI begleitet dich Schritt für Schritt und erstellt automatisch professionelles Marketingmaterial – ohne technisches Wissen, hohe Kosten oder interne Experten. So gewinnst du Zeit und kannst dich auf das konzentrieren, was du am besten kannst!
        </p>

        {/* CTA Button */}
        <button
          onClick={onOpenLogin}
          className="inline-flex items-center gap-2 px-8 py-4 text-lg font-semibold text-white bg-gradient-to-r from-purple-600 to-pink-500 hover:from-purple-700 hover:to-pink-600 rounded-full transition-all duration-300 shadow-lg hover:shadow-xl"
        >
          Let&apos;s start
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
          </svg>
        </button>

        {/* Bottom Badges */}
        <div className="mt-16 flex items-center justify-center gap-8 text-sm">
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
              <span className="text-white font-bold text-lg">XV</span>
            </div>
            <div className="text-left">
              <div className="font-semibold text-gray-900">Für KMUs entwickelt</div>
              <div className="text-gray-500">Schweizer Qualität</div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 rounded-full bg-gray-900 flex items-center justify-center">
              <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
              </svg>
            </div>
            <div className="text-left">
              <div className="font-semibold text-gray-900">Powered by OpenAI</div>
              <div className="text-gray-500">Führendes KI-Modell</div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

