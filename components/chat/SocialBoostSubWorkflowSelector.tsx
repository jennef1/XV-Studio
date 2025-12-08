"use client";

interface SocialBoostSubWorkflowSelectorProps {
  onSelectSubWorkflow: (subWorkflow: "product-rotation" | "user-speaks" | "image-to-video") => void;
}

export default function SocialBoostSubWorkflowSelector({ onSelectSubWorkflow }: SocialBoostSubWorkflowSelectorProps) {
  return (
    <div className="flex flex-col gap-3 my-4">
      {/* Product Rotation */}
      <button
        onClick={() => onSelectSubWorkflow("product-rotation")}
        className="group relative overflow-hidden bg-white dark:bg-gray-800 border-2 border-gray-200 dark:border-gray-700 rounded-2xl p-5 hover:border-orange-400 dark:hover:border-orange-500 transition-all hover:shadow-lg text-left"
      >
        <div className="flex items-center gap-3">
          {/* Icon */}
          <div className="flex-shrink-0 w-12 h-12 bg-gradient-to-br from-orange-100 to-red-100 dark:from-orange-900/40 dark:to-red-900/40 rounded-xl flex items-center justify-center text-2xl">
            🔄
          </div>

          {/* Content */}
          <div className="flex-1">
            <h4 className="text-base font-semibold text-gray-900 dark:text-white group-hover:text-orange-600 dark:group-hover:text-orange-400 transition-colors">
              Lass dein Produkt im Glanz rotieren
            </h4>
          </div>

          {/* Arrow */}
          <div className="flex-shrink-0 text-gray-400 group-hover:text-orange-500 group-hover:translate-x-1 transition-all">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </div>
        </div>
      </button>

      {/* User Speaks */}
      <button
        onClick={() => onSelectSubWorkflow("user-speaks")}
        className="group relative overflow-hidden bg-white dark:bg-gray-800 border-2 border-gray-200 dark:border-gray-700 rounded-2xl p-5 hover:border-orange-400 dark:hover:border-orange-500 transition-all hover:shadow-lg text-left"
      >
        <div className="flex items-center gap-3">
          {/* Icon */}
          <div className="flex-shrink-0 w-12 h-12 bg-gradient-to-br from-orange-100 to-red-100 dark:from-orange-900/40 dark:to-red-900/40 rounded-xl flex items-center justify-center text-2xl">
            🗣️
          </div>

          {/* Content */}
          <div className="flex-1">
            <h4 className="text-base font-semibold text-gray-900 dark:text-white group-hover:text-orange-600 dark:group-hover:text-orange-400 transition-colors">
              Ein User spricht zu deinem Produkt kurz und knackig
            </h4>
          </div>

          {/* Arrow */}
          <div className="flex-shrink-0 text-gray-400 group-hover:text-orange-500 group-hover:translate-x-1 transition-all">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </div>
        </div>
      </button>

      {/* Image to Video */}
      <button
        onClick={() => onSelectSubWorkflow("image-to-video")}
        className="group relative overflow-hidden bg-white dark:bg-gray-800 border-2 border-gray-200 dark:border-gray-700 rounded-2xl p-5 hover:border-orange-400 dark:hover:border-orange-500 transition-all hover:shadow-lg text-left"
      >
        <div className="flex items-center gap-3">
          {/* Icon */}
          <div className="flex-shrink-0 w-12 h-12 bg-gradient-to-br from-orange-100 to-red-100 dark:from-orange-900/40 dark:to-red-900/40 rounded-xl flex items-center justify-center text-2xl">
            🎬
          </div>

          {/* Content */}
          <div className="flex-1">
            <h4 className="text-base font-semibold text-gray-900 dark:text-white group-hover:text-orange-600 dark:group-hover:text-orange-400 transition-colors">
              Image to Video: bringe ein statisches Bild in ein kurzes motion Video
            </h4>
          </div>

          {/* Arrow */}
          <div className="flex-shrink-0 text-gray-400 group-hover:text-orange-500 group-hover:translate-x-1 transition-all">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </div>
        </div>
      </button>
    </div>
  );
}
