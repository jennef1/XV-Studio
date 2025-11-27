"use client";

import type { SavedProject } from "@/types/gallery";
import GalleryCard from "./GalleryCard";

interface GalleryGridProps {
  projects: SavedProject[];
  onProjectClick: (project: SavedProject) => void;
  onToggleFavorite: (project: SavedProject) => void;
  isLoading?: boolean;
}

export default function GalleryGrid({ projects, onProjectClick, onToggleFavorite, isLoading }: GalleryGridProps) {
  if (isLoading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {[...Array(8)].map((_, i) => (
          <div key={i} className="aspect-square bg-gray-200 dark:bg-gray-800 rounded-xl animate-pulse" />
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      {projects.map((project) => (
        <GalleryCard
          key={project.id}
          project={project}
          onClick={() => onProjectClick(project)}
          onToggleFavorite={() => onToggleFavorite(project)}
        />
      ))}
    </div>
  );
}
