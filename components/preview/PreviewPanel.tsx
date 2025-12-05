"use client";

import {
  useEffect,
  useRef,
  useState,
  type MouseEvent as ReactMouseEvent,
} from "react";
import MediaPreview from "./MediaPreview";
import { saveProject, generateProjectName } from "@/lib/gallery/galleryService";
import type { GenerationParams } from "@/types/gallery";

const actionButtons = [
  {
    id: "download",
    label: "Herunterladen",
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"
        />
      </svg>
    ),
  },
  {
    id: "save",
    label: "In Projekten speichern",
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z"
        />
      </svg>
    ),
  },
];

interface PreviewPanelProps {
  mediaUrl?: string | null;
  productType?: number | null;
  generationParams?: GenerationParams | null;
}

export default function PreviewPanel({ mediaUrl, productType, generationParams }: PreviewPanelProps) {
  const [isCollapsed, setIsCollapsed] = useState(true); // Start collapsed
  const [panelWidthPercent, setPanelWidthPercent] = useState(50); // Start at 50%
  const [isResizing, setIsResizing] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [editPrompt, setEditPrompt] = useState("");
  const [isEditingCampaignImage, setIsEditingCampaignImage] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const startXRef = useRef(0);
  const startWidthPercentRef = useRef(50);
  const MIN_WIDTH_PERCENT = 25;
  const MAX_WIDTH_PERCENT = 75;

  // Check if this is a campaign image
  const isCampaignImage = generationParams?.isCampaignImage === true;

  // Monitor mediaUrl changes for debugging
  useEffect(() => {
    console.log("📷 [PreviewPanel] mediaUrl changed:", mediaUrl);
    console.log("📷 [PreviewPanel] isCampaignImage:", isCampaignImage);
    console.log("📷 [PreviewPanel] generationParams:", generationParams);
  }, [mediaUrl, isCampaignImage, generationParams]);

  const handleDownload = async () => {
    if (!mediaUrl || isDownloading) return;

    setIsDownloading(true);
    try {
      // Fetch the media file
      const response = await fetch(mediaUrl);
      const blob = await response.blob();

      // Extract filename from URL or create a default one
      const urlParts = mediaUrl.split('/');
      let filename = urlParts[urlParts.length - 1];

      // If no filename or it doesn't have extension, create a default based on type
      if (!filename || !filename.includes('.')) {
        const isVideo = productType === 2;
        const extension = isVideo ? 'mp4' : 'jpg';
        const prefix = isVideo ? 'video' : 'bild';
        filename = `${prefix}-${Date.now()}.${extension}`;
      }

      // Create download link
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Download failed:', error);
      alert('Download fehlgeschlagen. Bitte versuche es erneut.');
    } finally {
      setIsDownloading(false);
    }
  };

  const handleSave = async () => {
    if (!mediaUrl || !generationParams || productType === null || productType === undefined || isSaving) {
      console.log('Cannot save:', { mediaUrl, generationParams, productType });
      return;
    }

    setIsSaving(true);
    try {
      // Auto-generate project name from prompt
      const projectName = generateProjectName(generationParams.prompt);

      console.log('Saving project with name:', projectName);

      // For videos (product_type: 2), store URL in video_url field
      // For images, store URL in image_url field
      const isVideo = productType === 2;

      const result = await saveProject({
        project_name: projectName,
        product_type: productType,
        image_url: isVideo ? '' : mediaUrl, // Empty string for videos, actual URL for images
        video_url: isVideo ? mediaUrl : null, // Video URL for videos, null for images
        thumbnail_url: null, // Could generate a thumbnail in the future
        generation_params: generationParams,
      });

      if (result.success) {
        alert('Projekt erfolgreich gespeichert!');
      } else {
        alert(`Fehler beim Speichern: ${result.error}`);
      }
    } catch (error: any) {
      console.error('Save failed:', error);
      alert('Speichern fehlgeschlagen. Bitte versuche es erneut.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleButtonClick = (buttonId: string) => {
    if (buttonId === 'download') {
      handleDownload();
    } else if (buttonId === 'save') {
      handleSave();
    }
  };

  const handleEditCampaignImage = async () => {
    console.log("🖼️ [PreviewPanel] Edit button clicked!");
    console.log("🖼️ [PreviewPanel] editPrompt:", editPrompt);
    console.log("🖼️ [PreviewPanel] generationParams:", generationParams);
    console.log("🖼️ [PreviewPanel] Has onEdit callback?:", !!generationParams?.onEdit);
    console.log("🖼️ [PreviewPanel] isCampaignImage?:", generationParams?.isCampaignImage);

    if (!editPrompt.trim()) {
      console.warn("🖼️ [PreviewPanel] No edit prompt provided");
      return;
    }

    if (!generationParams?.onEdit) {
      console.error("🖼️ [PreviewPanel] No onEdit callback found in generationParams!");
      console.error("🖼️ [PreviewPanel] Current generationParams:", generationParams);
      return;
    }

    setIsEditingCampaignImage(true);
    try {
      console.log("🖼️ [PreviewPanel] Calling onEdit callback with prompt:", editPrompt.trim());
      await generationParams.onEdit(editPrompt.trim());
      console.log("🖼️ [PreviewPanel] onEdit callback completed successfully");
      setEditPrompt("");
    } catch (error) {
      console.error("🖼️ [PreviewPanel] Failed to edit campaign image:", error);
    } finally {
      setIsEditingCampaignImage(false);
    }
  };

  // Auto-expand when image is available
  useEffect(() => {
    if (mediaUrl && isCollapsed) {
      setIsCollapsed(false);
    }
  }, [mediaUrl, isCollapsed]);

  useEffect(() => {
    function handleMouseMove(event: MouseEvent) {
      if (!isResizing || !containerRef.current) return;

      const containerWidth = containerRef.current.parentElement?.offsetWidth || 0;
      const delta = startXRef.current - event.clientX;
      const deltaPercent = (delta / containerWidth) * 100;
      const nextWidthPercent = Math.min(
        MAX_WIDTH_PERCENT,
        Math.max(MIN_WIDTH_PERCENT, startWidthPercentRef.current + deltaPercent)
      );
      setPanelWidthPercent(nextWidthPercent);
    }

    function handleMouseUp() {
      if (!isResizing) return;
      setIsResizing(false);
      document.body.style.userSelect = "";
      document.body.style.cursor = "";
    }

    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("mouseup", handleMouseUp);

    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseup", handleMouseUp);
    };
  }, [isResizing]);

  const startResizing = (event: ReactMouseEvent<HTMLDivElement>) => {
    setIsResizing(true);
    startXRef.current = event.clientX;
    startWidthPercentRef.current = panelWidthPercent;
    document.body.style.userSelect = "none";
    document.body.style.cursor = "col-resize";
  };

  if (isCollapsed) {
    return (
      <div className="w-12 h-full bg-gray-800 dark:bg-gray-950 border-l border-gray-700 dark:border-gray-900 flex items-center justify-center">
        <button
          onClick={() => setIsCollapsed(false)}
          className="p-2 rounded-lg hover:bg-gray-700 dark:hover:bg-gray-900 transition-colors"
          aria-label="Expand preview panel"
        >
          <svg
            className="w-6 h-6 text-gray-400 dark:text-gray-500"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9 5l7 7-7 7"
            />
          </svg>
        </button>
      </div>
    );
  }

  return (
    <div
      ref={containerRef}
      className="relative h-full bg-gray-800 dark:bg-gray-950 border-l border-gray-700 dark:border-gray-900 flex flex-col"
      style={{ width: `${panelWidthPercent}%` }}
    >
      <div
        className="absolute left-0 top-0 bottom-0 w-2 cursor-col-resize flex items-center justify-center"
        onMouseDown={startResizing}
        aria-hidden="true"
      >
        <div className="relative -left-1 w-5 h-10 rounded-lg bg-gray-700 dark:bg-gray-900 shadow border border-gray-600 dark:border-gray-800 flex items-center justify-center">
          <div className="grid grid-cols-2 gap-0.5 text-gray-400">
            {[...Array(6)].map((_, index) => (
              <span key={index} className="block w-0.5 h-0.5 bg-current rounded-full" />
            ))}
          </div>
        </div>
      </div>
      <div className="p-5 flex items-center justify-between">
        <h2 className="text-lg font-semibold text-gray-100 dark:text-gray-200">
          Vorschau
        </h2>
        <button
          onClick={() => setIsCollapsed(true)}
          className="p-2 rounded-lg hover:bg-gray-700 dark:hover:bg-gray-900 transition-colors"
          aria-label="Collapse preview panel"
        >
          <svg
            className="w-5 h-5 text-gray-400 dark:text-gray-500"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M15 19l-7-7 7-7"
            />
          </svg>
        </button>
      </div>
      <div className="flex-1 overflow-y-auto p-5 space-y-6">
        <MediaPreview
          mediaUrl={mediaUrl || undefined}
          mediaType={productType === 2 ? "video" : "image"}
        />
        {mediaUrl && (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {actionButtons.map((button) => (
                <button
                  key={button.id}
                  onClick={() => handleButtonClick(button.id)}
                  disabled={(button.id === 'download' && isDownloading) || (button.id === 'save' && isSaving)}
                  className="flex items-center justify-center gap-2 rounded-lg border border-gray-600 bg-gray-700 py-3 text-sm font-medium text-gray-200 hover:bg-gray-600 hover:border-gray-500 active:bg-gray-500 transition-all duration-150 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <span className="text-gray-300">{button.icon}</span>
                  {button.id === 'download' && isDownloading
                    ? 'Lädt herunter...'
                    : button.id === 'save' && isSaving
                    ? 'Speichert...'
                    : button.label}
                </button>
              ))}
            </div>

            {/* Campaign Image Edit Section */}
            {isCampaignImage && (
              <div className="bg-gray-800 dark:bg-gray-900 border-2 border-gray-700 dark:border-gray-800 rounded-2xl p-4">
                <label className="block text-sm font-medium text-gray-300 dark:text-gray-400 mb-2">
                  Bild bearbeiten:
                </label>
                <textarea
                  value={editPrompt}
                  onChange={(e) => setEditPrompt(e.target.value)}
                  placeholder="z.B. Mache den Hintergrund blau, füge Text hinzu..."
                  rows={3}
                  className="w-full px-3 py-2 bg-gray-700 dark:bg-gray-950 border border-gray-600 dark:border-gray-800 rounded-xl text-white text-sm placeholder-gray-500 focus:outline-none focus:border-blue-500 dark:focus:border-blue-500 resize-none"
                  disabled={isEditingCampaignImage}
                />
                <button
                  onClick={handleEditCampaignImage}
                  disabled={!editPrompt.trim() || isEditingCampaignImage}
                  className="mt-3 w-full px-4 py-3 bg-blue-600 text-white rounded-xl text-sm font-medium hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {isEditingCampaignImage ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      <span>Wird bearbeitet...</span>
                    </>
                  ) : (
                    <>
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                      </svg>
                      <span>Bearbeiten</span>
                    </>
                  )}
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
