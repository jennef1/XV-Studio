"use client";

export default function HowItWorksSection() {
  return (
    <section className="relative py-32 bg-white">
      <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-12">
        {/* Section Title */}
        <div className="text-center mb-24">
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900">
            Wie unser KI Marketing Tool funktioniert
          </h2>
        </div>

        {/* Steps */}
        <div className="space-y-32">
          {/* Step 01 */}
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div className="relative pl-12">
              {/* Vertical gradient line */}
              <div className="absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b from-blue-500 via-purple-500 to-pink-500"></div>

              <div className="space-y-4">
                <div className="text-5xl font-bold text-gray-900">01</div>
                <h3 className="text-3xl font-bold text-gray-900">Gib deine URL ein</h3>
                <p className="text-lg text-gray-600">
                  Füge deine Webseiten-URL ein und unsere KI lernt deine Marke in Minuten kennen.
                </p>
              </div>
            </div>

            <div className="flex justify-center">
              {/* Browser mockup */}
              <div className="bg-white rounded-2xl shadow-2xl border border-gray-200 p-6 w-full max-w-md">
                <div className="flex items-center gap-2 mb-4">
                  <div className="w-3 h-3 rounded-full bg-red-400"></div>
                  <div className="w-3 h-3 rounded-full bg-yellow-400"></div>
                  <div className="w-3 h-3 rounded-full bg-green-400"></div>
                </div>
                <div className="flex items-center gap-2 p-3 bg-gray-50 rounded-lg border border-gray-200">
                  <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                  <span className="text-gray-900 font-medium">www.deinefirma.ch</span>
                </div>
                <div className="mt-6 space-y-3">
                  <div className="h-4 bg-gray-100 rounded w-full"></div>
                  <div className="h-4 bg-gray-100 rounded w-3/4"></div>
                  <div className="h-4 bg-gray-100 rounded w-5/6"></div>
                </div>
              </div>
            </div>
          </div>

          {/* Step 02 */}
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div className="relative pl-12">
              {/* Vertical gradient line */}
              <div className="absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b from-purple-500 to-pink-500"></div>

              <div className="space-y-4">
                <div className="text-5xl font-bold text-gray-900">02</div>
                <h3 className="text-3xl font-bold text-gray-900">Generiere Bilder & Videos in deinem Stil</h3>
                <p className="text-lg text-gray-600">
                  Unsere KI erstellt täglich frische Bilder und Videos, perfekt angepasst an deine Marke.
                </p>
              </div>
            </div>

            <div className="flex justify-center">
              {/* Image/Video cards mockup */}
              <div className="relative w-full max-w-md">
                <div className="bg-white rounded-2xl shadow-xl border border-gray-200 p-4 absolute top-0 left-4 w-48 h-48 transform rotate-3">
                  <div className="w-full h-full bg-gradient-to-br from-purple-100 to-pink-100 rounded-lg"></div>
                </div>
                <div className="bg-white rounded-2xl shadow-2xl border border-gray-200 p-4 relative z-10 w-56 h-56">
                  <div className="w-full h-full bg-gradient-to-br from-blue-100 to-purple-100 rounded-lg flex items-center justify-center">
                    <svg className="w-16 h-16 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Step 03 */}
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div className="relative pl-12">
              {/* Vertical gradient line */}
              <div className="absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b from-pink-500 to-red-500"></div>

              <div className="space-y-4">
                <div className="text-5xl font-bold text-gray-900">03</div>
                <h3 className="text-3xl font-bold text-gray-900">Bearbeite & personalisiere</h3>
                <p className="text-lg text-gray-600">
                  Ändere alles nach Wunsch, ohne Designkenntnisse zu benötigen.
                </p>
              </div>
            </div>

            <div className="flex justify-center">
              {/* Edit mockup */}
              <div className="bg-white rounded-2xl shadow-2xl border border-gray-200 p-6 w-full max-w-md">
                <div className="bg-gray-50 rounded-lg p-4 mb-4">
                  <div className="w-full h-32 bg-gradient-to-br from-purple-100 to-pink-100 rounded-lg mb-3"></div>
                  <div className="space-y-2">
                    <div className="h-3 bg-gray-200 rounded w-full"></div>
                    <div className="h-3 bg-gray-200 rounded w-3/4"></div>
                  </div>
                </div>
                <div className="flex items-center justify-center gap-2 px-4 py-2 border border-pink-300 rounded-full text-sm text-pink-600">
                  <span>Tausche die Bilder aus</span>
                </div>
              </div>
            </div>
          </div>

          {/* Step 04 */}
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div className="relative pl-12">
              {/* Vertical gradient line - ends here */}
              <div className="absolute left-0 top-0 h-20 w-1 bg-gradient-to-b from-red-500 to-red-500"></div>

              <div className="space-y-4">
                <div className="text-5xl font-bold text-gray-900">04</div>
                <h3 className="text-3xl font-bold text-gray-900">Downloade & veröffentliche</h3>
                <p className="text-lg text-gray-600">
                  Starte 10x mehr Content. 75% schneller.
                </p>
              </div>
            </div>

            <div className="flex justify-center items-center h-48">
              {/* Download icon or illustration */}
              <div className="text-center">
                <div className="w-24 h-24 mx-auto mb-4 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center">
                  <svg className="w-12 h-12 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M9 19l3 3m0 0l3-3m-3 3V10" />
                  </svg>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}




