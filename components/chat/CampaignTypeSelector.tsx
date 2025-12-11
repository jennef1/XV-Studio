"use client";

interface CampaignTypeSelectorProps {
  onSelectType: (type: "product" | "concept" | "political") => void;
}

export default function CampaignTypeSelector({ onSelectType }: CampaignTypeSelectorProps) {
  const types = [
    {
      id: "product" as const,
      title: "Produkte Kampagnen",
      icon: "📱",
      gradient: "from-blue-400 to-purple-400",
      borderHover: "hover:border-blue-400 dark:hover:border-blue-500",
      textHover: "group-hover:text-blue-600 dark:group-hover:text-blue-400",
      recommended: true,
      comingSoon: false,
    },
    {
      id: "concept" as const,
      title: "Konzept Kampagne",
      icon: "⭐",
      gradient: "from-purple-400 to-pink-400",
      borderHover: "hover:border-purple-400 dark:hover:border-purple-500",
      textHover: "group-hover:text-purple-600 dark:group-hover:text-purple-400",
      recommended: false,
      comingSoon: false,
    },
    {
      id: "political" as const,
      title: "Politische Kampagne",
      icon: "🗳️",
      gradient: "from-orange-400 to-red-400",
      borderHover: "hover:border-orange-400 dark:hover:border-orange-500",
      textHover: "group-hover:text-orange-600 dark:group-hover:text-orange-400",
      recommended: false,
      comingSoon: true,
    },
  ];

  return (
    <div className="w-full sm:w-[480px] lg:w-[672px]">
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 my-4">
        {types.map((type) => (
          <button
            key={type.id}
            onClick={() => !type.comingSoon && onSelectType(type.id)}
            disabled={type.comingSoon}
            className={`group relative border-2 rounded-2xl overflow-hidden transition-all border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 ${
              type.comingSoon
                ? 'opacity-60 cursor-not-allowed'
                : `hover:shadow-lg ${type.borderHover}`
            }`}
          >
            {/* Image Preview Placeholder */}
            <div className="aspect-square bg-gray-100 dark:bg-gray-900 relative overflow-hidden">
              {/* Gradient Background with Icon */}
              <div className={`w-full h-full flex items-center justify-center bg-gradient-to-br ${type.gradient}`}>
                <span className="text-6xl opacity-90">{type.icon}</span>
              </div>

              {/* Recommended Badge */}
              {type.recommended && (
                <div className="absolute top-2 right-2 bg-gradient-to-r from-pink-500 to-red-500 text-white px-2 py-0.5 rounded text-xs font-bold shadow-md">
                  Top
                </div>
              )}

              {/* Coming Soon Badge */}
              {type.comingSoon && (
                <div className="absolute inset-0 flex items-center justify-center bg-black/40 backdrop-blur-sm">
                  <div className="bg-orange-500 text-white px-3 py-1.5 rounded-lg text-xs font-bold shadow-lg">
                    Coming Soon
                  </div>
                </div>
              )}
            </div>

            {/* Title */}
            <div className="p-2.5">
              <p className={`text-xs font-medium text-gray-900 dark:text-white ${type.textHover} transition-colors text-center`}>
                {type.title}
              </p>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}
