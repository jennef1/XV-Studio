"use client";

interface VideoWorkflowSelectorProps {
  onSelectWorkflow: (workflow: "social-booster" | "inspirational" | "ai-explains") => void;
}

export default function VideoWorkflowSelector({ onSelectWorkflow }: VideoWorkflowSelectorProps) {
  return (
    <div className="flex flex-col gap-4 my-4">
      {/* Social Media Booster - 8 Sek */}
      <button
        onClick={() => onSelectWorkflow("social-booster")}
        className="group relative overflow-hidden bg-white dark:bg-gray-800 border-2 border-gray-200 dark:border-gray-700 rounded-3xl p-6 hover:border-orange-400 dark:hover:border-orange-500 transition-all hover:shadow-lg"
      >
        <div className="flex items-start gap-4">
          {/* Icon/Emoji */}
          <div className="flex-shrink-0 w-16 h-16 bg-gradient-to-br from-orange-100 to-red-100 dark:from-orange-900/40 dark:to-red-900/40 rounded-2xl flex items-center justify-center text-4xl">
            🚀
          </div>

          {/* Content */}
          <div className="flex-1 text-left">
            <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2 group-hover:text-orange-600 dark:group-hover:text-orange-400 transition-colors">
              Social Media Boost (8 Sek Video)
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">
              Ein kurzes, prägnantes KI-Video, das sofort Aufmerksamkeit zieht – perfekt für Reels, Stories oder Ads. Schnell, klar und genau das, was KMU&apos;s heute brauchen.
            </p>
          </div>

          {/* Arrow indicator */}
          <div className="flex-shrink-0 text-gray-400 group-hover:text-orange-500 group-hover:translate-x-1 transition-all">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </div>
        </div>
      </button>

      {/* Inspirierendes Produkt Video - 16 Sek */}
      <button
        onClick={() => onSelectWorkflow("inspirational")}
        className="group relative overflow-hidden bg-white dark:bg-gray-800 border-2 border-gray-200 dark:border-gray-700 rounded-3xl p-6 hover:border-purple-400 dark:hover:border-purple-500 transition-all hover:shadow-lg"
      >
        <div className="flex items-start gap-4">
          {/* Icon/Emoji */}
          <div className="flex-shrink-0 w-16 h-16 bg-gradient-to-br from-purple-100 to-pink-100 dark:from-purple-900/40 dark:to-pink-900/40 rounded-2xl flex items-center justify-center text-4xl">
            ✨
          </div>

          {/* Content */}
          <div className="flex-1 text-left">
            <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2 group-hover:text-purple-600 dark:group-hover:text-purple-400 transition-colors">
              Inspirations Video für dein Produkt (16 Sek)
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">
              Ein stimmungsvolles KI-Kurzvideo, das Interesse weckt und Nutzer animiert mehr zu erfahren – ohne viel Erklärung, aber mit Emotion und passender Musik.
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

      {/* KI erklärt - 24 Sek */}
      <button
        onClick={() => onSelectWorkflow("ai-explains")}
        className="group relative overflow-hidden bg-white dark:bg-gray-800 border-2 border-gray-200 dark:border-gray-700 rounded-3xl p-6 hover:border-blue-400 dark:hover:border-blue-500 transition-all hover:shadow-lg"
      >
        <div className="flex items-start gap-4">
          {/* Icon/Emoji */}
          <div className="flex-shrink-0 w-16 h-16 bg-gradient-to-br from-blue-100 to-cyan-100 dark:from-blue-900/40 dark:to-cyan-900/40 rounded-2xl flex items-center justify-center text-4xl">
            🤖
          </div>

          {/* Content */}
          <div className="flex-1 text-left">
            <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
              Stelle dein Produkt ins echte Leben (24 Sek)
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">
              Ein unkompliziertes KI-Video, in dem eine KI-generierte Person dein Angebot direkt erklärt – ideal, um Produkte oder Dienstleistungen verständlich vorzustellen.
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
    </div>
  );
}
