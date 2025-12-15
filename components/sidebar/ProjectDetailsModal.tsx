"use client";

import { useEffect } from "react";
import { X, Download, Share2, Trash2 } from "lucide-react";
import { useToast } from "@/components/ToastProvider";

interface ProjectDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  project: {
    id: string;
    project_name: string | null;
    image_url: string;
    generation_params: any;
    created_at: string;
  } | null;
  onDelete: (projectId: string) => void;
}

export default function ProjectDetailsModal({
  isOpen,
  onClose,
  project,
  onDelete,
}: ProjectDetailsModalProps) {
  const { showSuccess, showError } = useToast();

  useEffect(() => {
    console.log("Modal state changed:", { isOpen, project });
  }, [isOpen, project]);

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };

    if (isOpen) {
      document.addEventListener("keydown", handleEscape);
      document.body.style.overflow = "hidden";
    }

    return () => {
      document.removeEventListener("keydown", handleEscape);
      document.body.style.overflow = "unset";
    };
  }, [isOpen, onClose]);

  if (!isOpen || !project) {
    console.log("Modal not rendering:", { isOpen, hasProject: !!project });
    return null;
  }

  const handleDownload = async () => {
    try {
      const response = await fetch(project.image_url);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${project.project_name || "project"}.${blob.type.split("/")[1]}`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error) {
      console.error("Download failed:", error);
      showError("Failed to download the file");
    }
  };

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: project.project_name || "My Project",
          text: `Check out my project: ${project.project_name || "Untitled"}`,
          url: project.image_url,
        });
      } catch (error) {
        if ((error as Error).name !== "AbortError") {
          console.error("Share failed:", error);
          copyToClipboard();
        }
      }
    } else {
      copyToClipboard();
    }
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(project.image_url);
    showSuccess("Link copied to clipboard!");
  };

  const handleDelete = () => {
    if (confirm(`Are you sure you want to delete "${project.project_name || "this project"}"?`)) {
      onDelete(project.id);
      onClose();
    }
  };

  const getPromptText = () => {
    if (!project.generation_params) return "No prompt available";

    if (typeof project.generation_params === "string") {
      return project.generation_params;
    }

    if (typeof project.generation_params === "object") {
      return project.generation_params.prompt ||
             project.generation_params.content ||
             JSON.stringify(project.generation_params, null, 2);
    }

    return "No prompt available";
  };

  const isVideo = project.image_url.includes(".mp4") ||
                  project.image_url.includes(".mov") ||
                  project.image_url.includes(".webm");

  return (
    <div
      className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
      onClick={onClose}
    >
      <div
        className="bg-white dark:bg-gray-900 rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="sticky top-0 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 p-4 flex items-center justify-between">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
            {project.project_name || "Untitled Project"}
          </h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
            aria-label="Close modal"
          >
            <X className="w-5 h-5 text-gray-500 dark:text-gray-400" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Media Display */}
          <div className="relative w-full bg-gray-100 dark:bg-gray-800 rounded-lg overflow-hidden">
            {isVideo ? (
              <video
                src={project.image_url}
                controls
                className="w-full h-auto max-h-[60vh] object-contain"
              >
                Your browser does not support the video tag.
              </video>
            ) : (
              <img
                src={project.image_url}
                alt={project.project_name || "Project"}
                className="w-full h-auto max-h-[60vh] object-contain"
              />
            )}
          </div>

          {/* Prompt Section */}
          <div>
            <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
              Prompt Used
            </h3>
            <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
              <pre className="text-sm text-gray-700 dark:text-gray-300 whitespace-pre-wrap font-mono">
                {getPromptText()}
              </pre>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3 pt-4">
            <button
              onClick={handleDownload}
              className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors font-medium"
            >
              <Download className="w-5 h-5" />
              Download
            </button>
            <button
              onClick={handleShare}
              className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors font-medium"
            >
              <Share2 className="w-5 h-5" />
              Share
            </button>
            <button
              onClick={handleDelete}
              className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors font-medium"
            >
              <Trash2 className="w-5 h-5" />
              Delete
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
