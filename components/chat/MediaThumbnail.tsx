"use client";

import { motion } from "framer-motion";

interface MediaThumbnailProps {
  url: string;
  type: "image" | "video";
  onClick: () => void;
  isEdit?: boolean;
}

export default function MediaThumbnail({
  url,
  type,
  onClick,
  isEdit = false,
}: MediaThumbnailProps) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.3 }}
      className="relative w-full max-w-sm cursor-pointer rounded-xl overflow-hidden border-2 border-gray-200 dark:border-gray-700 hover:border-purple-500 dark:hover:border-purple-400 transition-all shadow-md hover:shadow-xl"
      onClick={onClick}
    >
      {/* Edit badge if this is an edited version */}
      {isEdit && (
        <div className="absolute top-2 left-2 z-10 bg-blue-600 text-white text-xs px-2 py-1 rounded-full font-medium flex items-center gap-1">
          <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
          </svg>
          Bearbeitet
        </div>
      )}

      {type === "image" ? (
        <img
          src={url}
          alt="Generated content"
          className="w-full h-auto object-cover aspect-video"
        />
      ) : (
        <div className="relative aspect-video">
          <video
            src={url}
            className="w-full h-full object-cover"
            preload="metadata"
          />
          {/* Play icon overlay for videos */}
          <div className="absolute inset-0 bg-black bg-opacity-30 flex items-center justify-center">
            <div className="w-16 h-16 bg-white bg-opacity-90 rounded-full flex items-center justify-center">
              <svg className="w-8 h-8 text-gray-900 ml-1" fill="currentColor" viewBox="0 0 24 24">
                <path d="M8 5v14l11-7z" />
              </svg>
            </div>
          </div>
        </div>
      )}

      {/* Hover overlay */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent opacity-0 hover:opacity-100 transition-opacity flex items-end">
        <div className="p-3 text-white text-sm font-medium">
          Klicken zum Anzeigen
        </div>
      </div>
    </motion.div>
  );
}
