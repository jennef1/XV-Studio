export default function ExamplesSection() {
  const examples = [
    {
      title: "E-Commerce Shop",
      description: "Produktkataloge verwandelt in ansprechende Social-Media-Posts",
      image: "🛍️",
      gradient: "from-blue-500 to-cyan-500",
    },
    {
      title: "SaaS-Plattform",
      description: "Technische Features erklärt durch überzeugende Video-Skripte",
      image: "💻",
      gradient: "from-purple-500 to-pink-500",
    },
    {
      title: "Lokales Restaurant",
      description: "Menüpunkte präsentiert mit appetitanregenden Beschreibungen",
      image: "🍽️",
      gradient: "from-orange-500 to-red-500",
    },
    {
      title: "Fitnessstudio",
      description: "Trainingsprogramme vermarktet mit motivierendem Content",
      image: "💪",
      gradient: "from-green-500 to-emerald-500",
    },
    {
      title: "Beratungsfirma",
      description: "Expertise übersetzt in Thought-Leadership-Artikel",
      image: "📊",
      gradient: "from-indigo-500 to-purple-500",
    },
    {
      title: "Beauty-Marke",
      description: "Produkte hervorgehoben mit inspirierenden Lifestyle-Bildern",
      image: "✨",
      gradient: "from-pink-500 to-rose-500",
    },
  ];

  return (
    <section className="py-24 bg-gradient-to-b from-gray-50 to-white dark:from-gray-900 dark:to-gray-950">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section header */}
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold mb-4 text-gray-900 dark:text-white">
            Sieh es in Aktion
          </h2>
          <p className="text-xl text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
            Entdecke, wie Unternehmen wie deines erstklassigen Content erstellen
          </p>
        </div>

        {/* Examples grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {examples.map((example, index) => (
            <div
              key={index}
              className="group relative bg-white dark:bg-gray-800 rounded-3xl p-8 shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 overflow-hidden"
            >
              {/* Gradient background on hover */}
              <div
                className={`absolute inset-0 bg-gradient-to-br ${example.gradient} opacity-0 group-hover:opacity-5 transition-opacity duration-300`}
              ></div>

              {/* Icon */}
              <div className="relative mb-6">
                <div
                  className={`w-20 h-20 rounded-2xl bg-gradient-to-br ${example.gradient} flex items-center justify-center text-4xl shadow-lg group-hover:scale-110 transition-transform duration-300`}
                >
                  {example.image}
                </div>
              </div>

              {/* Content */}
              <div className="relative">
                <h3 className="text-2xl font-bold mb-3 text-gray-900 dark:text-white">
                  {example.title}
                </h3>
                <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
                  {example.description}
                </p>
              </div>

              {/* Decorative element */}
              <div
                className={`absolute bottom-0 right-0 w-32 h-32 bg-gradient-to-br ${example.gradient} opacity-10 rounded-full blur-2xl -mr-16 -mb-16 group-hover:opacity-20 transition-opacity duration-300`}
              ></div>
            </div>
          ))}
        </div>

        {/* CTA at bottom */}
        <div className="mt-16 text-center">
          <p className="text-lg text-gray-600 dark:text-gray-300 mb-6">
            Bereit zu sehen, was wir für dein Business erstellen können?
          </p>
          <a
            href="#hero"
            className="inline-block px-8 py-4 text-lg font-semibold text-white bg-gradient-to-r from-purple-600 via-pink-600 to-orange-500 rounded-xl hover:shadow-2xl hover:shadow-purple-500/50 transition-all duration-300 transform hover:scale-105"
          >
            Jetzt ausprobieren
          </a>
        </div>
      </div>
    </section>
  );
}




