"use client";

import { useState, useEffect } from "react";
import Sidebar from "@/components/sidebar/Sidebar";
import ChatContainer from "@/components/chat/ChatContainer";
import PreviewPanel from "@/components/preview/PreviewPanel";
import GalleryView from "@/components/gallery/GalleryView";
import BusinessProfileView from "@/components/business/BusinessProfileView";
import ProductsView from "@/components/products/ProductsView";
import OnboardingModal from "@/components/OnboardingModal";
import { supabaseBrowserClient } from "@/lib/supabaseClient";

export default function StudioPage() {
  const [selectedProductId, setSelectedProductId] = useState<number | null>(null);
  const [previewMediaUrl, setPreviewMediaUrl] = useState<string | null>(null);
  const [generationParams, setGenerationParams] = useState<any>(null);
  const [showGallery, setShowGallery] = useState(false);
  const [showBusinessProfile, setShowBusinessProfile] = useState(false);
  const [showProducts, setShowProducts] = useState(false);
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [checkingProfile, setCheckingProfile] = useState(true);

  // Check if user has a business profile on mount
  useEffect(() => {
    const checkBusinessProfile = async () => {
      try {
        const { data: { user } } = await supabaseBrowserClient.auth.getUser();

        if (user) {
          const { data: business, error } = await supabaseBrowserClient
            .from("businesses")
            .select("*")
            .eq("user_id", user.id)
            .single();

          // If no business profile found, show onboarding
          if (error || !business) {
            setShowOnboarding(true);
          }
        }
      } catch (err) {
        console.error("Error checking business profile:", err);
      } finally {
        setCheckingProfile(false);
      }
    };

    checkBusinessProfile();
  }, []);

  const handleOnboardingClose = () => {
    setShowOnboarding(false);
    // Navigate to Unternehmensprofil section
    setShowBusinessProfile(true);
    setShowGallery(false);
    setShowProducts(false);
    setSelectedProductId(null);
  };

  const handleProductSelect = (id: number | null) => {
    setSelectedProductId(id);
    setShowGallery(false);
    setShowBusinessProfile(false);
    setShowProducts(false);
  };

  const handleGallerySelect = (id: number) => {
    if (id === 1) {
      // Unternehmensprofil
      setShowBusinessProfile(true);
      setShowGallery(false);
      setShowProducts(false);
    } else if (id === 2) {
      // Produkte / Services
      setShowProducts(true);
      setShowBusinessProfile(false);
      setShowGallery(false);
    } else if (id === 3) {
      // Meine gespeicherten Projekte
      setShowGallery(true);
      setShowBusinessProfile(false);
      setShowProducts(false);
    }
    setSelectedProductId(null);
  };

  return (
    <div className="flex h-screen overflow-hidden bg-gray-50 dark:bg-gray-950">
      <Sidebar
        selectedProductId={selectedProductId}
        onProductSelect={handleProductSelect}
        onGallerySelect={handleGallerySelect}
      />
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header spacer for consistent top alignment */}
        <div className="h-16 bg-white dark:bg-gray-900"></div>
        {/* Main content area */}
        <div className="flex-1 flex overflow-hidden">
          {showBusinessProfile ? (
            // Show business profile view when Unternehmensprofil is selected
            <div className="flex-1">
              <BusinessProfileView />
            </div>
          ) : showProducts ? (
            // Show products view when Produkte/Services is selected
            <div className="flex-1">
              <ProductsView />
            </div>
          ) : showGallery ? (
            // Show gallery view when saved projects is selected
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

      <OnboardingModal
        isOpen={showOnboarding}
        onClose={handleOnboardingClose}
      />
    </div>
  );
}

