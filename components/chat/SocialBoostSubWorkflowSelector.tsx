"use client";

interface SocialBoostSubWorkflowSelectorProps {
  onSelectSubWorkflow: (subWorkflow: "product-rotation" | "user-speaks" | "image-to-video" | "political-campaign") => void;
}

export default function SocialBoostSubWorkflowSelector({ onSelectSubWorkflow }: SocialBoostSubWorkflowSelectorProps) {
  const workflows = [
    {
      id: "product-rotation" as const,
      title: "Lass dein Produkt im Glanz rotieren",
      price: "CHF 35.-",
      duration: "8 sec",
      icon: "🔄",
      comingSoon: false,
    },
    {
      id: "user-speaks" as const,
      title: "Kunden Testimonial Highlight",
      price: "CHF 45.-",
      duration: "8 sec",
      icon: "🗣️",
      comingSoon: false,
    },
    {
      id: "image-to-video" as const,
      title: "Image to Video",
      price: "CHF 30.-",
      duration: "8 sec",
      icon: "🎬",
      comingSoon: false,
    },
    {
      id: "political-campaign" as const,
      title: "Politische Kampagne",
      price: "CHF 40.-",
      duration: "10 sec",
      icon: "🗳️",
      comingSoon: true,
    },
  ];

  return (
    <div className="w-full sm:w-[480px] lg:w-[672px]">
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 my-4">
        {workflows.map((workflow) => (
        <button
          key={workflow.id}
          onClick={() => !workflow.comingSoon && onSelectSubWorkflow(workflow.id)}
          disabled={workflow.comingSoon}
          className={`group relative border-2 rounded-2xl overflow-hidden transition-all border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 ${
            workflow.comingSoon
              ? 'opacity-60 cursor-not-allowed'
              : 'hover:shadow-lg hover:border-orange-400 dark:hover:border-orange-500'
          }`}
        >
          {/* Video Preview Placeholder */}
          <div className="aspect-square bg-gray-100 dark:bg-gray-900 relative overflow-hidden">
            {/* Gradient Background with Icon */}
            <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-orange-400 to-red-400">
              <span className="text-6xl opacity-90">{workflow.icon}</span>
            </div>

            {/* Price Tag */}
            <div className="absolute top-2 right-2 bg-white/90 dark:bg-gray-900/90 backdrop-blur-sm px-2.5 py-1 rounded-lg shadow-md">
              <p className="text-xs font-bold text-gray-900 dark:text-white">
                {workflow.price}
              </p>
            </div>

            {/* Duration Badge */}
            <div className="absolute bottom-2 left-2 bg-black/70 backdrop-blur-sm px-2 py-0.5 rounded">
              <p className="text-xs font-medium text-white">
                {workflow.duration}
              </p>
            </div>

            {/* Coming Soon Badge */}
            {workflow.comingSoon && (
              <div className="absolute inset-0 flex items-center justify-center bg-black/40 backdrop-blur-sm">
                <div className="bg-orange-500 text-white px-3 py-1.5 rounded-lg text-xs font-bold shadow-lg">
                  Coming Soon
                </div>
              </div>
            )}
          </div>

          {/* Title */}
          <div className="p-2.5">
            <p className="text-xs font-medium text-gray-900 dark:text-white group-hover:text-orange-600 dark:group-hover:text-orange-400 transition-colors text-center">
              {workflow.title}
            </p>
          </div>
        </button>
        ))}
      </div>
    </div>
  );
}
