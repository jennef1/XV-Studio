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
    const fileName = project.project_name
      ? `${project.project_name}.jpg`
      : `projekt-${formatDate(project.created_at)}.jpg`;

    const result = await downloadImage(project.image_url, fileName);

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

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4"
      onClick={handleBackdropClick}
    >
      <div className="relative w-full max-w-7xl max-h-[90vh] bg-white dark:bg-gray-900 rounded-2xl shadow-2xl overflow-hidden">
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-10 p-2 rounded-full bg-black/30 hover:bg-black/50 backdrop-blur-sm transition-all"
          aria-label="Schließen"
        >
          <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        {/* Two-column layout */}
        <div className="flex flex-col lg:flex-row h-full max-h-[90vh]">
          {/* Left: Image */}
          <div className="flex-1 relative bg-gray-100 dark:bg-gray-800 flex items-center justify-center p-8">
            <div className="relative w-full h-full max-h-[70vh] lg:max-h-full">
              <Image
                src={project.image_url}
                alt={project.project_name || "Project image"}
                fill
                className="object-contain"
                sizes="(max-width: 1024px) 100vw, 60vw"
                priority
              />
            </div>
          </div>

          {/* Right: Details */}
          <div className="w-full lg:w-96 flex flex-col bg-white dark:bg-gray-900 overflow-y-auto">
            <div className="p-6 space-y-6">
              {/* Header */}
              <div>
                <div className="flex items-start justify-between gap-3 mb-3">
                  <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                    {project.project_name || "Unbenanntes Projekt"}
                  </h2>
                  <button
                    onClick={() => onToggleFavorite(project)}
                    className="flex-shrink-0 p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                    aria-label="Als Favorit markieren"
                  >
                    {project.is_favorite ? (
                      <svg className="w-6 h-6 text-yellow-400 fill-current" viewBox="0 0 24 24">
                        <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                      </svg>
                    ) : (
                      <svg className="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
                      </svg>
                    )}
                  </button>
                </div>

                <div className="flex items-center gap-2 mb-2">
                  <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-purple-100 dark:bg-purple-900 text-purple-800 dark:text-purple-200">
                    {PRODUCT_TYPE_NAMES[project.product_type]}
                  </span>
                </div>

                <p className="text-sm text-gray-500 dark:text-gray-400">
                  {formatDate(project.created_at)}
                </p>
              </div>

              {/* Generation Parameters */}
              {project.generation_params && (
                <div className="space-y-4">
                  <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wide">
                    Generierungsdetails
                  </h3>

                  {/* Prompt */}
                  {project.generation_params.prompt && (
                    <div>
                      <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Prompt</p>
                      <p className="text-sm text-gray-700 dark:text-gray-300 bg-gray-50 dark:bg-gray-800 p-3 rounded-lg">
                        {project.generation_params.prompt}
                      </p>
                    </div>
                  )}

                  {/* Technical Settings */}
                  <div className="grid grid-cols-2 gap-3">
                    {project.generation_params.aspectRatio && (
                      <div>
                        <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Seitenverhältnis</p>
                        <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
                          {project.generation_params.aspectRatio}
                        </p>
                      </div>
                    )}

                    {project.generation_params.resolution && (
                      <div>
                        <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Auflösung</p>
                        <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
                          {project.generation_params.resolution}
                        </p>
                      </div>
                    )}

                    {project.generation_params.outputFormat && (
                      <div>
                        <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Format</p>
                        <p className="text-sm font-medium text-gray-900 dark:text-gray-100 uppercase">
                          {project.generation_params.outputFormat}
                        </p>
                      </div>
                    )}

                    {project.generation_params.hasReferenceImages && (
                      <div>
                        <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Referenzbilder</p>
                        <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
                          {project.generation_params.imageUrls?.length || 0} Bilder
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Action Buttons */}
              <div className="space-y-3 pt-4 border-t border-gray-200 dark:border-gray-700">
                <button
                  onClick={handleDownload}
                  className="w-full px-4 py-3 bg-purple-600 hover:bg-purple-700 text-white rounded-lg font-medium transition-colors flex items-center justify-center gap-2"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                  </svg>
                  Herunterladen
                </button>

                <button
                  onClick={handleDelete}
                  className="w-full px-4 py-3 bg-red-600 hover:bg-red-700 text-white rounded-lg font-medium transition-colors flex items-center justify-center gap-2"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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
