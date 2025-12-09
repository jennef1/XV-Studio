"use client";

import { useEffect } from "react";
import Image from "next/image";
import type { SavedProject } from "@/types/gallery";
import { PRODUCT_TYPE_NAMES } from "@/types/gallery";
import { formatDate, downloadImage, deleteProject } from "@/lib/gallery/galleryService";

interface ImageDetailModalProps {
  project: SavedProject;
  onClose: () => void;
  onDelete: (project: SavedProject) => void;
  onToggleFavorite: (project: SavedProject) => void;
}

export default function ImageDetailModal({ project, onClose, onDelete, onToggleFavorite }: ImageDetailModalProps) {
  // For videos (product_type: 2), use video_url; otherwise use image_url
  const isVideo = project.product_type === 2;
  const mediaUrl = isVideo && project.video_url ? project.video_url : project.image_url;

  // Prevent body scroll when modal is open
  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, []);

  // Handle ESC key
  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };
    window.addEventListener('keydown', handleEsc);
    return () => window.removeEventListener('keydown', handleEsc);
  }, [onClose]);

  // Handle backdrop click
  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  // Handle download
  const handleDownload = async () => {
    const extension = isVideo ? 'mp4' : 'jpg';
    const fileName = project.project_name
      ? `${project.project_name}.${extension}`
      : `projekt-${formatDate(project.created_at)}.${extension}`;

    const result = await downloadImage(mediaUrl, fileName);

    if (!result.success) {
      alert(`Download fehlgeschlagen: ${result.error}`);
    }
  };

  // Handle delete with confirmation
  const handleDelete = async () => {
    const confirmed = window.confirm(
      `Möchten Sie "${project.project_name || 'Unbenanntes Projekt'}" wirklich löschen? Diese Aktion kann nicht rückgängig gemacht werden.`
    );

    if (!confirmed) return;

    const result = await deleteProject(project.id);

    if (result.success) {
      onDelete(project);
      onClose();
    } else {
      alert(`Löschen fehlgeschlagen: ${result.error}`);
    }
  };

  // Handle share
  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: project.project_name || "Mein Projekt",
          text: `Schau dir mein Projekt an: ${project.project_name || "Unbenanntes Projekt"}`,
          url: mediaUrl,
        });
      } catch (error) {
        if ((error as Error).name !== "AbortError") {
          console.error("Teilen fehlgeschlagen:", error);
          copyToClipboard();
        }
      }
    } else {
      copyToClipboard();
    }
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(mediaUrl);
    alert("Link in die Zwischenablage kopiert!");
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-6"
      onClick={handleBackdropClick}
    >
      <div className="relative w-full max-w-5xl h-[75vh] bg-gray-900 rounded-2xl shadow-[0_20px_60px_-15px_rgba(0,0,0,0.8)] overflow-hidden border border-gray-700/50">
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-10 p-2.5 rounded-full bg-gray-800/80 hover:bg-gray-700/80 backdrop-blur-sm transition-all group"
          aria-label="Schließen"
        >
          <svg className="w-5 h-5 text-gray-300 group-hover:text-white transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        {/* Two-column layout */}
        <div className="flex flex-col lg:flex-row h-full">
          {/* Left: Media (Image or Video) with dark padding */}
          <div className="flex-1 relative bg-gray-950 flex items-center justify-center p-4">
            <div className="relative w-full h-full">
              {isVideo ? (
                <video
                  src={mediaUrl}
                  controls
                  className="w-full h-full object-contain rounded-lg"
                  playsInline
                >
                  Dein Browser unterstützt das Video-Tag nicht.
                </video>
              ) : (
                <Image
                  src={mediaUrl}
                  alt={project.project_name || "Project image"}
                  fill
                  className="object-contain rounded-lg"
                  sizes="(max-width: 1024px) 100vw, 65vw"
                  priority
                />
              )}
            </div>
          </div>

          {/* Right: Details - Wider sidebar for more prompt space */}
          <div className="w-full lg:w-96 flex flex-col bg-gray-900 border-l border-gray-800">
            <div className="flex-1 overflow-y-auto p-6 space-y-6">
              {/* Header */}
              <div>
                <div className="flex items-start justify-between gap-3 mb-3">
                  <h2 className="text-xl font-bold text-white">
                    {project.project_name || "Unbenanntes Projekt"}
                  </h2>
                  <button
                    onClick={() => onToggleFavorite(project)}
                    className="flex-shrink-0 p-2 rounded-full hover:bg-gray-800 transition-colors"
                    aria-label="Als Favorit markieren"
                  >
                    {project.is_favorite ? (
                      <svg className="w-5 h-5 text-yellow-400 fill-current" viewBox="0 0 24 24">
                        <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                      </svg>
                    ) : (
                      <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
                      </svg>
                    )}
                  </button>
                </div>

                <div className="flex items-center gap-2 mb-2">
                  <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-purple-500/20 text-purple-300 border border-purple-500/30">
                    {PRODUCT_TYPE_NAMES[project.product_type]}
                  </span>
                </div>

                <p className="text-sm text-gray-400">
                  {formatDate(project.created_at)}
                </p>
              </div>

              {/* Prompt */}
              {project.generation_params?.prompt && (
                <div>
                  <p className="text-xs text-gray-500 mb-2">Prompt</p>
                  <p className="text-sm text-gray-300 bg-gray-800/50 p-3 rounded-lg border border-gray-700/50">
                    {project.generation_params.prompt}
                  </p>
                </div>
              )}
            </div>

            {/* Action Buttons - Fixed at bottom */}
            <div className="flex-shrink-0 p-6 pt-0">
              <div className="space-y-2.5 pt-6 border-t border-gray-800">
                <button
                  onClick={handleDownload}
                  className="group w-full px-4 py-3.5 bg-gradient-to-r from-purple-600 to-purple-500 hover:from-purple-500 hover:to-purple-400 text-white rounded-xl font-medium transition-all duration-200 flex items-center justify-center gap-2.5 shadow-lg shadow-purple-500/25 hover:shadow-purple-500/40 hover:scale-[1.02] active:scale-[0.98]"
                >
                  <svg className="w-5 h-5 transition-transform group-hover:translate-y-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                  </svg>
                  Herunterladen
                </button>

                <button
                  onClick={handleShare}
                  className="group w-full px-4 py-3.5 bg-gray-800 hover:bg-gray-700 text-gray-200 hover:text-white rounded-xl font-medium transition-all duration-200 flex items-center justify-center gap-2.5 border border-gray-700 hover:border-gray-600 hover:scale-[1.02] active:scale-[0.98]"
                >
                  <svg className="w-5 h-5 transition-transform group-hover:rotate-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
                  </svg>
                  Teilen
                </button>

                <button
                  onClick={handleDelete}
                  className="group w-full px-4 py-3.5 bg-gray-800 hover:bg-red-600/20 text-gray-400 hover:text-red-400 rounded-xl font-medium transition-all duration-200 flex items-center justify-center gap-2.5 border border-gray-700 hover:border-red-500/50 hover:scale-[1.02] active:scale-[0.98]"
                >
                  <svg className="w-5 h-5 transition-transform group-hover:scale-110" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                  Löschen
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
