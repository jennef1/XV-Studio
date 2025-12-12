"use client";

import { useRef } from "react";

interface VideoWorkflowSelectorProps {
  onSelectWorkflow: (workflow: "product-rotation" | "user-speaks" | "image-to-video" | "inspirational" | "ai-explains") => void;
}

export default function VideoWorkflowSelector({ onSelectWorkflow }: VideoWorkflowSelectorProps) {
  const workflows = [
    {
      id: "product-rotation" as const,
      title: "Lass dein Produkt im Glanz rotieren",
      price: "CHF 35.-",
      duration: "8 sec",
      icon: "🔄",
      gradient: "from-orange-400 to-red-400",
      borderHover: "hover:border-orange-400 dark:hover:border-orange-500",
      textHover: "group-hover:text-orange-600 dark:group-hover:text-orange-400",
      videoUrl: "https://khvcsdzqqmudeuprgzjf.supabase.co/storage/v1/object/public/XVS%20Material/ProduktRotation.mp4",
    },
    {
      id: "user-speaks" as const,
      title: "Kunden Testimonial Highlight",
      price: "CHF 45.-",
      duration: "8 sec",
      icon: "🗣️",
      gradient: "from-blue-400 to-cyan-400",
      borderHover: "hover:border-blue-400 dark:hover:border-blue-500",
      textHover: "group-hover:text-blue-600 dark:group-hover:text-blue-400",
      videoUrl: "https://khvcsdzqqmudeuprgzjf.supabase.co/storage/v1/object/public/XVS%20Material/KundenTestimonial.mp4",
    },
    {
      id: "image-to-video" as const,
      title: "Image to Video",
      price: "CHF 30.-",
      duration: "8 sec",
      icon: "🎬",
      gradient: "from-green-400 to-emerald-400",
      borderHover: "hover:border-green-400 dark:hover:border-green-500",
      textHover: "group-hover:text-green-600 dark:group-hover:text-green-400",
      videoUrl: "https://khvcsdzqqmudeuprgzjf.supabase.co/storage/v1/object/public/XVS%20Material/ImageToVideo.mp4",
    },
    {
      id: "inspirational" as const,
      title: "Inspirationsvideo für dein Produkt",
      price: "CHF 40.-",
      duration: "16 sec",
      icon: "✨",
      gradient: "from-purple-400 to-pink-400",
      borderHover: "hover:border-purple-400 dark:hover:border-purple-500",
      textHover: "group-hover:text-purple-600 dark:group-hover:text-purple-400",
      videoUrl: "https://khvcsdzqqmudeuprgzjf.supabase.co/storage/v1/object/public/XVS%20Material/Inspiration.mp4",
    },
    {
      id: "ai-explains" as const,
      title: "Stelle dein Produkt in's echte Leben",
      price: "CHF 50.-",
      duration: "24 sec",
      icon: "🤖",
      gradient: "from-indigo-400 to-blue-400",
      borderHover: "hover:border-indigo-400 dark:hover:border-indigo-500",
      textHover: "group-hover:text-indigo-600 dark:group-hover:text-indigo-400",
      videoUrl: "https://khvcsdzqqmudeuprgzjf.supabase.co/storage/v1/object/public/XVS%20Material/ProduktImEchtenLeben.mp4",
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
                preload="metadata"
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

            {/* Duration Badge */}
            <div className="absolute bottom-2 left-2 bg-black/70 backdrop-blur-sm px-2 py-0.5 rounded z-10">
              <p className="text-xs font-medium text-white">
                {workflow.duration}
              </p>
            </div>
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
