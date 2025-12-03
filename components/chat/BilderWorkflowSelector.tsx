"use client";

interface BilderWorkflowSelectorProps {
  onSelectWorkflow: (workflow: "product" | "combine" | "freebird") => void;
}

export default function BilderWorkflowSelector({ onSelectWorkflow }: BilderWorkflowSelectorProps) {
  return (
    <div className="flex flex-col gap-4 my-4">
      {/* Product-based workflow */}
      <button
        onClick={() => onSelectWorkflow("product")}
        className="group relative overflow-hidden bg-white dark:bg-gray-800 border-2 border-gray-200 dark:border-gray-700 rounded-3xl p-6 hover:border-purple-400 dark:hover:border-purple-500 transition-all hover:shadow-lg"
      >
        <div className="flex items-start gap-4">
          {/* Icon/Emoji */}
          <div className="flex-shrink-0 w-16 h-16 bg-gradient-to-br from-purple-100 to-pink-100 dark:from-purple-900/40 dark:to-pink-900/40 rounded-2xl flex items-center justify-center text-4xl">
            📦
          </div>

          {/* Content */}
          <div className="flex-1 text-left">
            <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2 group-hover:text-purple-600 dark:group-hover:text-purple-400 transition-colors">
              Setze dein Produkt ein
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">
              Wähle ein Produkt aus deinem Katalog und erstelle Marketingbilder basierend auf deinen Produktbildern
            </p>
          </div>

          {/* Arrow indicator */}
          <div className="flex-shrink-0 text-gray-400 group-hover:text-purple-500 group-hover:translate-x-1 transition-all">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </div>
        </div>

        {/* Best badge */}
        <div className="absolute top-4 right-4">
          <span className="px-3 py-1 bg-gradient-to-r from-purple-500 to-pink-500 text-white text-xs font-bold rounded-full shadow-lg">
            Empfohlen
          </span>
        </div>
      </button>

      {/* Combine images workflow */}
      <button
        onClick={() => onSelectWorkflow("combine")}
        className="group relative overflow-hidden bg-white dark:bg-gray-800 border-2 border-gray-200 dark:border-gray-700 rounded-3xl p-6 hover:border-blue-400 dark:hover:border-blue-500 transition-all hover:shadow-lg"
      >
        <div className="flex items-start gap-4">
          {/* Icon/Emoji */}
          <div className="flex-shrink-0 w-16 h-16 bg-gradient-to-br from-blue-100 to-cyan-100 dark:from-blue-900/40 dark:to-cyan-900/40 rounded-2xl flex items-center justify-center text-4xl">
            🎨
          </div>

          {/* Content */}
          <div className="flex-1 text-left">
            <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
              Kombiniere Bilder
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">
              Lade mehrere Bilder hoch und erstelle ein neues, kreatives Bild daraus
            </p>
          </div>

          {/* Arrow indicator */}
          <div className="flex-shrink-0 text-gray-400 group-hover:text-blue-500 group-hover:translate-x-1 transition-all">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </div>
        </div>
      </button>

      {/* Free bird workflow */}
      <button
        onClick={() => onSelectWorkflow("freebird")}
        className="group relative overflow-hidden bg-white dark:bg-gray-800 border-2 border-gray-200 dark:border-gray-700 rounded-3xl p-6 hover:border-green-400 dark:hover:border-green-500 transition-all hover:shadow-lg"
      >
        <div className="flex items-start gap-4">
          {/* Icon/Emoji */}
          <div className="flex-shrink-0 w-16 h-16 bg-gradient-to-br from-green-100 to-emerald-100 dark:from-green-900/40 dark:to-emerald-900/40 rounded-2xl flex items-center justify-center text-4xl">
            🚀
          </div>

          {/* Content */}
          <div className="flex-1 text-left">
            <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2 group-hover:text-green-600 dark:group-hover:text-green-400 transition-colors">
              Free Bird
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">
              Lasse der KI freien Lauf - beschreibe einfach, was für ein Bild du erstellen möchtest
            </p>
          </div>

          {/* Arrow indicator */}
          <div className="flex-shrink-0 text-gray-400 group-hover:text-green-500 group-hover:translate-x-1 transition-all">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </div>
        </div>
      </button>
    </div>
  );
}
