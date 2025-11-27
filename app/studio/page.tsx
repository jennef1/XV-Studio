"use client";

import { useState } from "react";
import Image from "next/image";
import Sidebar from "@/components/sidebar/Sidebar";
import ChatContainer from "@/components/chat/ChatContainer";
import PreviewPanel from "@/components/preview/PreviewPanel";
import GalleryView from "@/components/gallery/GalleryView";

export default function StudioPage() {
  const [selectedProductId, setSelectedProductId] = useState<number | null>(null);
  const [previewMediaUrl, setPreviewMediaUrl] = useState<string | null>(null);
  const [generationParams, setGenerationParams] = useState<any>(null);
  const [showGallery, setShowGallery] = useState(false);

  const handleProductSelect = (id: number | null) => {
    setSelectedProductId(id);
    setShowGallery(false); // Hide gallery when a product is selected
  };

  const handleGallerySelect = () => {
    setShowGallery(true);
    setSelectedProductId(null); // Clear product selection
  };

  return (
    <div className="flex h-screen overflow-hidden bg-gray-50 dark:bg-gray-950">
      <Sidebar
        selectedProductId={selectedProductId}
        onProductSelect={handleProductSelect}
        onGallerySelect={handleGallerySelect}
      />
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header with logo */}
        <div className="h-16 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 flex items-center justify-start px-6">
          <div className="relative h-10 w-32">
            <Image
              src="/images/XV Logo.png"
              alt="XV Studio Logo"
              fill
              className="object-contain"
              priority
            />
          </div>
        </div>
        {/* Main content area */}
        <div className="flex-1 flex overflow-hidden">
          {showGallery ? (
            // Show gallery view when gallery is selected
            <div className="flex-1">
              <GalleryView />
            </div>
          ) : (
            // Show normal chat + preview when product is selected
            <>
              <div className="flex-1 min-w-0">
                <ChatContainer
                  selectedProductId={selectedProductId}
                  onPreviewUpdate={setPreviewMediaUrl}
                  onGenerationParamsUpdate={setGenerationParams}
                />
              </div>
              <PreviewPanel
                mediaUrl={previewMediaUrl}
                productType={selectedProductId}
                generationParams={generationParams}
              />
            </>
          )}
        </div>
      </div>
    </div>
  );
}

