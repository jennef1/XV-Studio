"use client";

interface BilderWorkflowSelectorProps {
  onSelectWorkflow: (workflow: "product" | "combine" | "freebird") => void;
}

export default function BilderWorkflowSelector({ onSelectWorkflow }: BilderWorkflowSelectorProps) {
  const workflows = [
    {
      id: "product" as const,
      title: "Setze dein Produkt ein",
      price: "CHF 10.-",
      icon: "📦",
      gradient: "from-purple-400 to-pink-400",
      borderHover: "hover:border-purple-400 dark:hover:border-purple-500",
      textHover: "group-hover:text-purple-600 dark:group-hover:text-purple-400",
      recommended: true,
      videoUrl: "https://khvcsdzqqmudeuprgzjf.supabase.co/storage/v1/object/public/XVS%20Material/Bilder_SetzeProduktEin.mp4",
    },
    {
      id: "combine" as const,
      title: "Kombiniere Bilder",
      price: "CHF 10.-",
      icon: "🎨",
      gradient: "from-blue-400 to-cyan-400",
      borderHover: "hover:border-blue-400 dark:hover:border-blue-500",
      textHover: "group-hover:text-blue-600 dark:group-hover:text-blue-400",
      recommended: false,
      videoUrl: "https://khvcsdzqqmudeuprgzjf.supabase.co/storage/v1/object/public/XVS%20Material/Bilder_KombiniereBilder.mp4",
    },
    {
      id: "freebird" as const,
      title: "Free Bird",
      price: "CHF 5.-",
      icon: "🚀",
      gradient: "from-green-400 to-emerald-400",
      borderHover: "hover:border-green-400 dark:hover:border-green-500",
      textHover: "group-hover:text-green-600 dark:group-hover:text-green-400",
      recommended: false,
      videoUrl: "https://khvcsdzqqmudeuprgzjf.supabase.co/storage/v1/object/public/XVS%20Material/Bilder_FreeBird.mp4",
    },
  ];

  const handleMouseEnter = (e: React.MouseEvent<HTMLButtonElement>) => {
    const video = e.currentTarget.querySelector('video');
    if (video) {
      video.play();
    }
  };

  const handleMouseLeave = (e: React.MouseEvent<HTMLButtonElement>) => {
    const video = e.currentTarget.querySelector('video');
    if (video) {
      video.pause();
      video.currentTime = 0;
    }
  };

  return (
    <div className="w-full sm:w-[480px] lg:w-[672px]">
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 my-4">
        {workflows.map((workflow) => (
          <button
            key={workflow.id}
            onClick={() => onSelectWorkflow(workflow.id)}
            onMouseEnter={handleMouseEnter}
            onMouseLeave={handleMouseLeave}
            className={`group relative border-2 rounded-2xl overflow-hidden transition-all hover:shadow-lg border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 ${workflow.borderHover}`}
          >
            {/* Video Preview Placeholder */}
            <div className="aspect-square bg-gray-100 dark:bg-gray-900 relative overflow-hidden">
              {/* Video or Gradient Background */}
              {workflow.videoUrl ? (
                <video
                  src={workflow.videoUrl}
                  muted
                  loop
                  playsInline
                  preload="auto"
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className={`w-full h-full flex items-center justify-center bg-gradient-to-br ${workflow.gradient}`}>
                  <span className="text-6xl opacity-90">{workflow.icon}</span>
                </div>
              )}

              {/* Price Tag */}
              <div className="absolute top-2 right-2 bg-white/90 dark:bg-gray-900/90 backdrop-blur-sm px-2.5 py-1 rounded-lg shadow-md z-10">
                <p className="text-xs font-bold text-gray-900 dark:text-white">
                  {workflow.price}
                </p>
              </div>

              {/* Recommended Badge */}
              {workflow.recommended && (
                <div className="absolute top-2 left-2 bg-gradient-to-r from-purple-500 to-pink-500 text-white px-2 py-0.5 rounded text-xs font-bold shadow-md z-10">
                  Top
                </div>
              )}
            </div>

            {/* Title */}
            <div className="p-2.5">
              <p className={`text-xs font-medium text-gray-900 dark:text-white ${workflow.textHover} transition-colors text-center`}>
                {workflow.title}
              </p>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}
