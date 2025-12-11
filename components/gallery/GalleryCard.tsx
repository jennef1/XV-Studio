"use client";

import Image from "next/image";
import type { SavedProject } from "@/types/gallery";
import { PRODUCT_TYPE_NAMES } from "@/types/gallery";
import { formatDate } from "@/lib/gallery/galleryService";

interface GalleryCardProps {
  project: SavedProject;
  onClick: () => void;
  onToggleFavorite: () => void;
}

export default function GalleryCard({ project, onClick, onToggleFavorite }: GalleryCardProps) {
  const handleFavoriteClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    onToggleFavorite();
  };

  // For videos (product_type: 2), use video_url; otherwise use image_url
  const isVideo = project.product_type === 2;
  const mediaUrl = isVideo && project.video_url ? project.video_url : project.image_url;

  return (
    <div
      className="group relative bg-white dark:bg-gray-900 rounded-xl overflow-hidden shadow-md hover:shadow-xl transition-all duration-300 cursor-pointer"
      onClick={onClick}
    >
      {/* Media (Image or Video thumbnail) */}
      <div className="relative aspect-video w-full bg-gray-100 dark:bg-gray-800">
        {isVideo ? (
          <video
            src={mediaUrl}
            className="object-contain w-full h-full group-hover:scale-105 transition-transform duration-300"
            muted
            playsInline
          />
        ) : (
          <Image
            src={mediaUrl}
            alt={project.project_name || "Project image"}
            fill
            className="object-contain group-hover:scale-105 transition-transform duration-300"
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          />
        )}

        {/* Favorite button */}
        <button
          onClick={handleFavoriteClick}
          className="absolute top-3 right-3 p-2 rounded-full bg-black/30 hover:bg-black/50 backdrop-blur-sm transition-all opacity-0 group-hover:opacity-100"
          aria-label="Toggle favorite"
        >
          {project.is_favorite ? (
            <svg className="w-5 h-5 text-yellow-400 fill-current" viewBox="0 0 24 24">
              <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
            </svg>
          ) : (
            <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
            </svg>
          )}
        </button>

        {/* Hover overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
      </div>

      {/* Info */}
      <div className="p-4">
        <div className="flex items-start justify-between gap-2 mb-2">
          <h3 className="font-medium text-gray-900 dark:text-gray-100 truncate flex-1">
            {project.project_name || "Unbenanntes Projekt"}
          </h3>
          <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-purple-100 dark:bg-purple-900 text-purple-800 dark:text-purple-200 flex-shrink-0">
            {PRODUCT_TYPE_NAMES[project.product_type]}
          </span>
        </div>
        <p className="text-sm text-gray-500 dark:text-gray-400">
          {formatDate(project.created_at)}
        </p>
      </div>
    </div>
  );
}
