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
  const [hasBusiness, setHasBusiness] = useState<boolean | null>(null);
  const [isCheckingBusiness, setIsCheckingBusiness] = useState(true);

  // Check if user has a business profile on mount
  useEffect(() => {
    const checkBusinessProfile = async () => {
      try {
        setIsCheckingBusiness(true);
        const { data: { user } } = await supabaseBrowserClient.auth.getUser();

        if (user) {
          const { data: business, error } = await supabaseBrowserClient
            .from("businesses")
            .select("*")
            .eq("user_id", user.id)
            .maybeSingle();

          // If no business profile found, show onboarding and navigate to business profile view
          if (error || !business) {
            setShowOnboarding(true);
            setHasBusiness(false);
            setShowBusinessProfile(true);
            setShowGallery(false);
            setShowProducts(false);
            setSelectedProductId(null);
          } else {
            setHasBusiness(true);
          }
        }
      } catch (err) {
        console.error("Error checking business profile:", err);
      } finally {
        setCheckingProfile(false);
        setIsCheckingBusiness(false);
      }
    };

    checkBusinessProfile();
  }, []);

  // Add custom event listener for navigation from Business Profile to Products
  useEffect(() => {
    const handleNavigateToProducts = () => {
      setShowProducts(true);
      setShowBusinessProfile(false);
      setShowGallery(false);
      setSelectedProductId(null);
    };

    window.addEventListener('navigateToProducts', handleNavigateToProducts as EventListener);

    return () => {
      window.removeEventListener('navigateToProducts', handleNavigateToProducts as EventListener);
    };
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
      // Angebot
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

  // Show loading screen while checking for business profile
  if (isCheckingBusiness) {
    return (
      <div className="flex h-screen items-center justify-center bg-white dark:bg-gray-950">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">Lade Studio...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen overflow-hidden bg-gray-50 dark:bg-gray-950">
      <Sidebar
        selectedProductId={selectedProductId}
        onProductSelect={handleProductSelect}
        onGallerySelect={handleGallerySelect}
        hasBusiness={hasBusiness || false}
      />
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header spacer for consistent top alignment */}
        <div className="h-16 bg-white dark:bg-gray-950"></div>
        {/* Main content area */}
        <div className="flex-1 flex overflow-hidden">
          {showBusinessProfile ? (
            // Show business profile view when Unternehmensprofil is selected
            <div className="flex-1">
              <BusinessProfileView
                onNavigateToProducts={() => {
                  setShowProducts(true);
                  setShowBusinessProfile(false);
                  setShowGallery(false);
                }}
                onBusinessCreated={() => {
                  setHasBusiness(true);
                }}
              />
            </div>
          ) : showProducts ? (
            // Show products view when Angebot is selected
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

