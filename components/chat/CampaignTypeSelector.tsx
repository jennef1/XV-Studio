"use client";

interface CampaignTypeSelectorProps {
  onSelectType: (type: "product" | "concept") => void;
}

export default function CampaignTypeSelector({ onSelectType }: CampaignTypeSelectorProps) {
  return (
    <div className="flex flex-col gap-4 my-4">
      {/* Product Campaign Button */}
      <button
        onClick={() => onSelectType("product")}
        className="group relative overflow-hidden bg-white dark:bg-gray-800 border-2 border-gray-200 dark:border-gray-700 rounded-3xl p-6 hover:border-blue-400 dark:hover:border-blue-500 transition-all hover:shadow-lg"
      >
        <div className="flex items-start gap-4">
          {/* Icon/Emoji */}
          <div className="flex-shrink-0 w-16 h-16 bg-gradient-to-br from-blue-100 to-purple-100 dark:from-blue-900/40 dark:to-purple-900/40 rounded-2xl flex items-center justify-center text-4xl">
            📱
          </div>

          {/* Content */}
          <div className="flex-1 text-left">
            <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
              Produkte Kampagnen
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">
              Erstelle konsistente, markenkonforme Inhalte basierend auf deinem Schreibstil für jede Plattform
            </p>
          </div>

          {/* Arrow indicator */}
          <div className="flex-shrink-0 text-gray-400 group-hover:text-blue-500 group-hover:translate-x-1 transition-all">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </div>
        </div>

        {/* Best badge */}
        <div className="absolute top-4 right-4">
          <span className="px-3 py-1 bg-gradient-to-r from-pink-500 to-red-500 text-white text-xs font-bold rounded-full shadow-lg">
            Empfohlen
          </span>
        </div>
      </button>

      {/* Concept Campaign Button */}
      <button
        onClick={() => onSelectType("concept")}
        className="group relative overflow-hidden bg-white dark:bg-gray-800 border-2 border-gray-200 dark:border-gray-700 rounded-3xl p-6 hover:border-purple-400 dark:hover:border-purple-500 transition-all hover:shadow-lg"
      >
        <div className="flex items-start gap-4">
          {/* Icon/Emoji */}
          <div className="flex-shrink-0 w-16 h-16 bg-gradient-to-br from-purple-100 to-pink-100 dark:from-purple-900/40 dark:to-pink-900/40 rounded-2xl flex items-center justify-center text-4xl">
            ⭐
          </div>

          {/* Content */}
          <div className="flex-1 text-left">
            <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2 group-hover:text-purple-600 dark:group-hover:text-purple-400 transition-colors">
              Konzept Kampagne
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">
              Starte mit einer Idee, und ich generiere passende Visuals dazu
            </p>
          </div>

          {/* Arrow indicator */}
          <div className="flex-shrink-0 text-gray-400 group-hover:text-purple-500 group-hover:translate-x-1 transition-all">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </div>
        </div>
      </button>
    </div>
  );
}
