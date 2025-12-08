"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { supabaseBrowserClient } from "@/lib/supabaseClient";
import { Database } from "@/types/database";
import LoadingModal from "@/components/LoadingModal";

type Business = Database["public"]["Tables"]["businesses"]["Row"];

interface BusinessProfileViewProps {
  onNavigateToProducts?: () => void;
  onBusinessCreated?: () => void;
}

export default function BusinessProfileView({ onNavigateToProducts, onBusinessCreated }: BusinessProfileViewProps = {}) {
  const [business, setBusiness] = useState<Business | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [editedBusiness, setEditedBusiness] = useState<Business | null>(null);
  const [businessUrl, setBusinessUrl] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [processingError, setProcessingError] = useState("");
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [jobId, setJobId] = useState<string | null>(null);
  const [showCompletionMessage, setShowCompletionMessage] = useState(false);

  // Helper function to ensure URL has proper protocol
  const ensureUrlProtocol = (url: string | null | undefined): string => {
    if (!url) return '';
    const trimmedUrl = url.trim();
    if (trimmedUrl.startsWith('http://') || trimmedUrl.startsWith('https://')) {
      return trimmedUrl;
    }
    return `https://${trimmedUrl}`;
  };

  useEffect(() => {
    fetchBusinessProfile();
  }, []);

  const fetchBusinessProfile = async () => {
    try {
      setIsLoading(true);
      const { data: { user } } = await supabaseBrowserClient.auth.getUser();

      if (!user) {
        console.error("No user found");
        return;
      }

      const { data, error } = await supabaseBrowserClient
        .from("businesses")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false })
        .limit(1)
        .single();

      if (error) {
        console.error("Error fetching business:", error);
        return;
      }

      setBusiness(data);
      setEditedBusiness(data);
    } catch (error) {
      console.error("Error:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleEdit = () => {
    setIsEditing(true);
  };

  const handleSave = async () => {
    if (!editedBusiness || !business) return;

    try {
      // Ensure tone_of_voice is stored as array if it's a string
      const toneOfVoiceRaw = editedBusiness.tone_of_voice as string[] | string;
      const toneOfVoice: string[] = Array.isArray(toneOfVoiceRaw)
        ? toneOfVoiceRaw
        : typeof toneOfVoiceRaw === 'string'
        ? toneOfVoiceRaw.split(',').map(s => s.trim()).filter(s => s)
        : [];

      const { error } = await supabaseBrowserClient
        .from("businesses")
        .update({
          business_description: editedBusiness.business_description,
          brand_colors: editedBusiness.brand_colors,
          brand_values: editedBusiness.brand_values,
          tone_of_voice: toneOfVoice,
          target_audience: editedBusiness.target_audience,
          unique_selling_points: editedBusiness.unique_selling_points,
        })
        .eq("id", business.id);

      if (error) throw error;

      setBusiness({...editedBusiness, tone_of_voice: toneOfVoice});
      setIsEditing(false);
    } catch (error) {
      console.error("Error updating business:", error);
    }
  };

  const handleCancel = () => {
    setEditedBusiness(business);
    setIsEditing(false);
  };

  const addColor = () => {
    if (!editedBusiness) return;
    setEditedBusiness({
      ...editedBusiness,
      brand_colors: [...editedBusiness.brand_colors, "#ffffff"],
    });
  };

  const updateColor = (index: number, value: string) => {
    if (!editedBusiness) return;
    const newColors = [...editedBusiness.brand_colors];
    newColors[index] = value;
    setEditedBusiness({
      ...editedBusiness,
      brand_colors: newColors,
    });
  };

  const removeColor = (index: number) => {
    if (!editedBusiness) return;
    const newColors = editedBusiness.brand_colors.filter((_, i) => i !== index);
    setEditedBusiness({
      ...editedBusiness,
      brand_colors: newColors,
    });
  };

  const addBrandValue = () => {
    if (!editedBusiness) return;
    setEditedBusiness({
      ...editedBusiness,
      brand_values: [...editedBusiness.brand_values, ""],
    });
  };

  const updateBrandValue = (index: number, value: string) => {
    if (!editedBusiness) return;
    const newValues = [...editedBusiness.brand_values];
    newValues[index] = value;
    setEditedBusiness({
      ...editedBusiness,
      brand_values: newValues,
    });
  };

  const removeBrandValue = (index: number) => {
    if (!editedBusiness) return;
    const newValues = editedBusiness.brand_values.filter((_, i) => i !== index);
    setEditedBusiness({
      ...editedBusiness,
      brand_values: newValues,
    });
  };

  const handleCreateProfile = async () => {
    if (!businessUrl.trim()) {
      setProcessingError("Bitte gib eine gültige URL ein");
      return;
    }

    setIsProcessing(true);
    setProcessingError("");

    try {
      const { data: { user } } = await supabaseBrowserClient.auth.getUser();

      if (!user) {
        setProcessingError("Kein Benutzer gefunden");
        setIsProcessing(false);
        return;
      }

      // Call the new onboarding webhook
      const response = await fetch("/api/webhook/business-and-products", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          url: businessUrl,
          user_id: user.id,
        }),
      });

      if (!response.ok) {
        throw new Error("Fehler beim Starten der Analyse");
      }

      const { jobId: newJobId } = await response.json();
      setJobId(newJobId);

      // Start polling for job completion
      pollJobStatus(newJobId, user.id);

    } catch (error) {
      console.error("Error creating profile:", error);
      setProcessingError("Ein Fehler ist aufgetreten. Bitte versuche es erneut.");
      setIsProcessing(false);
    }
  };

  const pollJobStatus = async (jobId: string, userId: string) => {
    const maxAttempts = 120; // 10 minutes / 5 seconds = 120 attempts
    let attempts = 0;

    const checkStatus = async () => {
      attempts++;

      try {
        // Poll campaign job status
        const statusResponse = await fetch(`/api/campaign-status/${jobId}?t=${Date.now()}`, {
          cache: 'no-store',
        });

        if (!statusResponse.ok) {
          console.error("Error polling job status");
          // Continue polling on error
          if (attempts < maxAttempts) {
            setTimeout(checkStatus, 5000);
          } else {
            setIsProcessing(false);
            setProcessingError("Zeitüberschreitung beim Erstellen des Profils");
          }
          return;
        }

        const { job } = await statusResponse.json();

        if (job.status === "completed") {
          // Job completed - fetch the business profile
          const { data, error } = await supabaseBrowserClient
            .from("businesses")
            .select("*")
            .eq("user_id", userId)
            .single();

          if (data && !error) {
            // Success!
            setBusiness(data);
            setEditedBusiness(data);
            setIsProcessing(false);
            setBusinessUrl("");
            setShowCompletionMessage(true);

            // Notify parent that business has been created
            if (onBusinessCreated) {
              onBusinessCreated();
            }
            return;
          }
        } else if (job.status === "failed") {
          // Job failed
          setIsProcessing(false);
          setProcessingError(job.errorMessage || "Ein Fehler ist aufgetreten");
          return;
        }

        // Still processing - check if we've exceeded max attempts
        if (attempts >= maxAttempts) {
          setIsProcessing(false);
          setProcessingError("Zeitüberschreitung. Die Analyse dauert länger als erwartet.");
          return;
        }

        // Continue polling
        setTimeout(checkStatus, 5000);

      } catch (error) {
        console.error("Error checking job status:", error);

        if (attempts >= maxAttempts) {
          setIsProcessing(false);
          setProcessingError("Zeitüberschreitung beim Erstellen des Profils");
        } else {
          // Retry
          setTimeout(checkStatus, 5000);
        }
      }
    };

    // Start the polling
    checkStatus();
  };

  const handleDelete = async () => {
    if (!business) return;

    setIsDeleting(true);

    try {
      const { data: { session } } = await supabaseBrowserClient.auth.getSession();

      if (!session) {
        console.error("No session found");
        return;
      }

      const response = await fetch(`/api/business/${business.id}`, {
        method: "DELETE",
        headers: {
          "Authorization": `Bearer ${session.access_token}`,
        },
      });

      if (!response.ok) {
        throw new Error("Fehler beim Löschen des Firmenprofils");
      }

      // Reset the business state to show the create profile screen again
      setBusiness(null);
      setEditedBusiness(null);
      setShowDeleteConfirm(false);
    } catch (error) {
      console.error("Error deleting business:", error);
      alert("Fehler beim Löschen des Firmenprofils. Bitte versuche es erneut.");
    } finally {
      setIsDeleting(false);
    }
  };

  const handleCompletionClose = () => {
    setShowCompletionMessage(false);
  };

  const handleNavigateToProducts = () => {
    if (onNavigateToProducts) {
      onNavigateToProducts();
    }
  };

  if (isLoading) {
    return (
      <div className="flex-1 flex items-center justify-center bg-white dark:bg-gray-950">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">Lade Firmenprofil...</p>
        </div>
      </div>
    );
  }

  if (!business) {
    return (
      <>
        <div className="flex-1 flex items-center justify-center bg-gray-50 dark:bg-gray-900 p-8">
          <div className="max-w-2xl w-full">
            {!isProcessing ? (
              <>
                <div className="text-center mb-48">
                  {/* Title */}
                  <h2 className="text-4xl font-extrabold text-gray-900 dark:text-white mb-8 tracking-tight">
                    Willkommen in deinem{" "}
                    <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-pink-600">
                      XV Studio
                    </span>
                  </h2>

                  {/* Description */}
                  <p className="text-base text-gray-500 dark:text-gray-500 leading-relaxed">
                    Bevor wir gemeinsam kreativ werden, möchten wir gerne mehr über dein Geschäft erfahren. Gib einfach deine Webseite an und unsere KI erstellt ein Unternehmensprofil mit deinen Produkten oder Servicedienstleistungen. Diese dienen als Basis für deine neuen Bilder & Videos.
                  </p>
                </div>

                {/* URL Input Box with Submit Button */}
                <div className="space-y-4">
                  <div className="flex items-center gap-3">
                    <input
                      id="businessUrl"
                      type="url"
                      value={businessUrl}
                      onChange={(e) => setBusinessUrl(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' && !isProcessing && businessUrl.trim()) {
                          handleCreateProfile();
                        }
                      }}
                      placeholder="https://www.deinefirma.ch"
                      className="flex-1 px-6 py-4 border-2 border-gray-200 dark:border-gray-700 rounded-full bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:border-purple-500 transition-colors text-base"
                      disabled={isProcessing}
                    />
                    <button
                      onClick={handleCreateProfile}
                      disabled={isProcessing || !businessUrl.trim()}
                      className="w-14 h-14 flex items-center justify-center bg-gradient-to-r from-purple-600 to-pink-500 hover:from-purple-700 hover:to-pink-600 text-white rounded-full font-semibold transition-all shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed flex-shrink-0"
                      title="Absenden"
                    >
                      <svg
                        className="w-6 h-6"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M14 5l7 7m0 0l-7 7m7-7H3"
                        />
                      </svg>
                    </button>
                  </div>

                  {/* Error Message */}
                  {processingError && (
                    <div className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-2xl text-red-600 dark:text-red-400 text-sm">
                      {processingError}
                    </div>
                  )}
                </div>
              </>
            ) : (
              /* Inline Loading State */
              <div className="text-center space-y-8">
                {/* Circular loading animation */}
                <div className="flex justify-center">
                  <div className="relative w-20 h-20">
                    {/* Outer spinning circle */}
                    <div className="absolute inset-0 border-4 border-gray-200 dark:border-gray-700 rounded-full"></div>
                    <div className="absolute inset-0 border-4 border-transparent border-t-purple-600 dark:border-t-purple-400 rounded-full animate-spin"></div>
                    {/* Inner pulsing circle */}
                    <div className="absolute inset-3 bg-purple-100 dark:bg-purple-800 rounded-full animate-pulse"></div>
                    {/* Center dot */}
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="w-4 h-4 bg-purple-600 dark:bg-purple-400 rounded-full"></div>
                    </div>
                  </div>
                </div>

                {/* Title */}
                <h2 className="text-3xl font-bold text-gray-900 dark:text-white">
                  Erstelle dein Unternehmensprofil
                </h2>

                {/* Subtitle */}
                <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed max-w-md mx-auto">
                  Wir analysieren deine Webseite und erstellen dein Unternehmensprofil mit Angeboten.<br />
                  Dies kann bis zu 10 Minuten dauern.
                </p>

                {/* Status indicator */}
                <div className="flex items-center justify-center gap-2 bg-white dark:bg-gray-800 rounded-xl px-4 py-3 border border-gray-200 dark:border-gray-700 inline-flex mx-auto">
                  <div className="flex gap-1">
                    <span className="w-1.5 h-1.5 bg-purple-500 dark:bg-purple-400 rounded-full animate-bounce" style={{ animationDelay: "0ms" }}></span>
                    <span className="w-1.5 h-1.5 bg-purple-500 dark:bg-purple-400 rounded-full animate-bounce" style={{ animationDelay: "150ms" }}></span>
                    <span className="w-1.5 h-1.5 bg-purple-500 dark:bg-purple-400 rounded-full animate-bounce" style={{ animationDelay: "300ms" }}></span>
                  </div>
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    Webseite wird analysiert
                  </span>
                </div>

                {/* URL Display */}
                <div className="flex items-center justify-center gap-2 bg-white dark:bg-gray-800 rounded-xl px-4 py-3 border border-gray-200 dark:border-gray-700 inline-flex mx-auto">
                  <svg
                    className="w-4 h-4 text-gray-400 dark:text-gray-500 flex-shrink-0"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1"
                    />
                  </svg>
                  <span className="text-sm text-gray-600 dark:text-gray-400 truncate">
                    {businessUrl}
                  </span>
                </div>
              </div>
            )}
          </div>
        </div>

        {showCompletionMessage && (
          <CompletionModal
            onClose={handleCompletionClose}
            onNavigateToProducts={handleNavigateToProducts}
          />
        )}
      </>
    );
  }

  return (
    <div className="flex-1 overflow-y-auto bg-white dark:bg-gray-950 p-8 h-full">
      <div className="max-w-5xl mx-auto pb-20">
        {/* Business Header */}
        <div className="mb-8">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-6">
              {business.logo_url ? (
                <div className="w-24 h-24 rounded-3xl bg-white dark:bg-gray-800 border-2 border-gray-200 dark:border-gray-700 flex items-center justify-center overflow-hidden flex-shrink-0">
                  <Image
                    src={business.logo_url}
                    alt={business.company_name}
                    width={96}
                    height={96}
                    className="object-contain"
                    unoptimized
                  />
                </div>
              ) : (
                <div className="w-24 h-24 rounded-3xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center flex-shrink-0">
                  <span className="text-white text-4xl font-bold">
                    {business.company_name.charAt(0).toUpperCase()}
                  </span>
                </div>
              )}
              <div>
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
                  {business.company_name}
                </h1>
                {business.tagline && (
                  <p className="text-lg text-gray-600 dark:text-gray-400 italic mb-2">
                    {business.tagline}
                  </p>
                )}
                <a
                  href={ensureUrlProtocol(business.company_url)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center text-sm text-blue-600 dark:text-blue-400 hover:underline"
                >
                  <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
                  </svg>
                  {business.company_url}
                </a>
              </div>
            </div>
            {!isEditing ? (
              <div className="flex flex-col items-end gap-3">
                <div className="flex gap-3">
                  <button
                    onClick={() => setShowDeleteConfirm(true)}
                    className="px-6 py-3 bg-red-600 dark:bg-red-700 text-white rounded-2xl font-medium hover:opacity-90 transition-opacity flex items-center gap-2 shadow-lg"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                    Löschen
                  </button>
                  <button
                    onClick={handleEdit}
                    className="px-6 py-3 bg-gray-900 dark:bg-white text-white dark:text-gray-900 rounded-2xl font-medium hover:opacity-90 transition-opacity flex items-center gap-2 shadow-lg"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                    </svg>
                    Bearbeiten
                  </button>
                </div>
                {onNavigateToProducts && (
                  <button
                    onClick={handleNavigateToProducts}
                    className="w-full px-4 py-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl text-sm font-medium hover:from-blue-700 hover:to-purple-700 transition-all shadow-md flex items-center justify-center gap-2"
                  >
                    <span>Weiter zu den Angeboten</span>
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                    </svg>
                  </button>
                )}
              </div>
            ) : (
              <div className="flex gap-3">
                <button
                  onClick={handleCancel}
                  className="px-8 py-3 bg-gray-200 dark:bg-gray-800 text-gray-900 dark:text-white font-medium rounded-2xl hover:bg-gray-300 dark:hover:bg-gray-700 transition-all shadow-lg"
                >
                  Abbrechen
                </button>
                <button
                  onClick={handleSave}
                  className="px-8 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-medium rounded-2xl hover:from-blue-700 hover:to-purple-700 transition-all shadow-lg"
                >
                  Speichern
                </button>
              </div>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - All Business Details */}
          <div className="lg:col-span-2 space-y-6">
            {/* Business Description */}
            <div>
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-lg font-bold text-gray-900 dark:text-white">
                  Geschäftsübersicht
                </h3>
                {!isEditing && (
                  <span className="text-xs text-gray-500 font-medium">Read-only</span>
                )}
              </div>
              {isEditing ? (
                <textarea
                  value={editedBusiness?.business_description || ""}
                  onChange={(e) =>
                    setEditedBusiness({
                      ...editedBusiness!,
                      business_description: e.target.value,
                    })
                  }
                  rows={6}
                  className="w-full px-4 py-4 bg-white dark:bg-gray-800 border-2 border-gray-200 dark:border-gray-700 rounded-3xl text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:border-blue-500 dark:focus:border-blue-500 resize-none"
                  placeholder="Beschreibe dein Unternehmen..."
                />
              ) : (
                <p className="text-gray-700 dark:text-gray-300 leading-relaxed whitespace-pre-wrap">
                  {business.business_description || "Keine Beschreibung vorhanden."}
                </p>
              )}
            </div>

            {/* Brand Colors */}
            <div>
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-lg font-bold text-gray-900 dark:text-white">
                  Firmenfarben
                </h3>
                {!isEditing && (
                  <span className="text-xs text-gray-500 font-medium">Read-only</span>
                )}
              </div>
              <div className="flex flex-wrap gap-3">
                {isEditing ? (
                  <>
                    {editedBusiness?.brand_colors.map((color, index) => (
                      <div key={index} className="relative group">
                        <input
                          type="color"
                          value={color}
                          onChange={(e) => updateColor(index, e.target.value)}
                          className="w-16 h-16 rounded-3xl cursor-pointer border-4 border-white dark:border-gray-800 shadow-lg"
                        />
                        <button
                          onClick={() => removeColor(index)}
                          className="absolute -top-2 -right-2 w-6 h-6 bg-red-600 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity shadow-lg"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                          </svg>
                        </button>
                      </div>
                    ))}
                    {editedBusiness && editedBusiness.brand_colors.length < 5 && (
                      <button
                        onClick={addColor}
                        className="w-16 h-16 rounded-3xl border-2 border-dashed border-gray-300 dark:border-gray-700 flex items-center justify-center hover:border-purple-400 dark:hover:border-purple-500 transition-colors"
                      >
                        <svg className="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                        </svg>
                      </button>
                    )}
                  </>
                ) : (
                  business.brand_colors.map((color, index) => (
                    <div
                      key={index}
                      className="w-16 h-16 rounded-3xl border-4 border-white dark:border-gray-800 shadow-lg"
                      style={{ backgroundColor: color }}
                    />
                  ))
                )}
              </div>
            </div>

            {/* Brand Values */}
            <div className="bg-white dark:bg-gray-800 border-2 border-gray-200 dark:border-gray-700 rounded-3xl p-6">
              <div className="flex items-center justify-between mb-3">
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  Firmenwerte
                </label>
                {!isEditing && (
                  <span className="text-xs text-gray-500 font-medium">Read-only</span>
                )}
              </div>
              {isEditing ? (
                <div className="space-y-2">
                  {editedBusiness?.brand_values.map((value, index) => (
                    <div key={index} className="flex gap-2">
                      <input
                        type="text"
                        value={value}
                        onChange={(e) => updateBrandValue(index, e.target.value)}
                        placeholder={`Wert ${index + 1}`}
                        className="flex-1 px-4 py-3 bg-white dark:bg-gray-900 border-2 border-gray-200 dark:border-gray-700 rounded-2xl text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:border-blue-500 dark:focus:border-blue-500"
                      />
                      <button
                        onClick={() => removeBrandValue(index)}
                        className="px-3 text-red-500 hover:text-red-700"
                      >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </button>
                    </div>
                  ))}
                  <button
                    onClick={addBrandValue}
                    className="text-sm text-blue-600 dark:text-blue-400 hover:underline font-medium"
                  >
                    + Wert hinzufügen
                  </button>
                </div>
              ) : (
                <div className="flex flex-wrap gap-2">
                  {business.brand_values.map((value, index) => (
                    <span
                      key={index}
                      className="px-4 py-2 bg-gray-900 dark:bg-gray-800 text-white rounded-2xl text-sm font-medium"
                    >
                      {value}
                    </span>
                  ))}
                </div>
              )}
            </div>

            {/* Tone of Voice */}
            <div className="bg-white dark:bg-gray-800 border-2 border-gray-200 dark:border-gray-700 rounded-3xl p-6">
              <div className="flex items-center justify-between mb-3">
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  Schreibstil
                </label>
                {!isEditing && (
                  <span className="text-xs text-gray-500 font-medium">Read-only</span>
                )}
              </div>
              {isEditing ? (
                <textarea
                  value={
                    Array.isArray(editedBusiness?.tone_of_voice)
                      ? editedBusiness.tone_of_voice.join(', ')
                      : editedBusiness?.tone_of_voice || ""
                  }
                  onChange={(e) =>
                    setEditedBusiness({
                      ...editedBusiness!,
                      tone_of_voice: e.target.value.split(',').map(s => s.trim()).filter(s => s),
                    })
                  }
                  rows={3}
                  className="w-full px-4 py-4 bg-white dark:bg-gray-900 border-2 border-gray-200 dark:border-gray-700 rounded-2xl text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:border-blue-500 dark:focus:border-blue-500 resize-none"
                  placeholder="professionell, innovativ, leidenschaftlich (getrennt durch Kommas)"
                />
              ) : (
                <div className="flex flex-wrap gap-2">
                  {(() => {
                    try {
                      const toneData = typeof business.tone_of_voice === 'string'
                        ? JSON.parse(business.tone_of_voice)
                        : business.tone_of_voice;
                      return Array.isArray(toneData) && toneData.length > 0 ? (
                        toneData.map((tone, index) => (
                          <span
                            key={index}
                            className="px-4 py-2 bg-blue-100 dark:bg-blue-900/40 text-blue-800 dark:text-blue-200 rounded-2xl text-sm font-medium"
                          >
                            {tone}
                          </span>
                        ))
                      ) : (
                        <span className="text-gray-500 text-sm">Nicht definiert.</span>
                      );
                    } catch {
                      return <span className="text-gray-500 text-sm">Nicht definiert.</span>;
                    }
                  })()}
                </div>
              )}
            </div>

            {/* Target Audience */}
            <div className="bg-white dark:bg-gray-800 border-2 border-gray-200 dark:border-gray-700 rounded-3xl p-6">
              <div className="flex items-center justify-between mb-3">
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  Zielgruppe
                </label>
                {!isEditing && (
                  <span className="text-xs text-gray-500 font-medium">Read-only</span>
                )}
              </div>
              {isEditing ? (
                <textarea
                  value={editedBusiness?.target_audience || ""}
                  onChange={(e) =>
                    setEditedBusiness({
                      ...editedBusiness!,
                      target_audience: e.target.value,
                    })
                  }
                  rows={3}
                  className="w-full px-4 py-4 bg-white dark:bg-gray-900 border-2 border-gray-200 dark:border-gray-700 rounded-2xl text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:border-blue-500 dark:focus:border-blue-500 resize-none"
                  placeholder="Luxus-Käufer, Rennsport-Fans, Sammler (getrennt durch Kommas)"
                />
              ) : (
                <div className="flex flex-wrap gap-2">
                  {business.target_audience && typeof business.target_audience === 'string' ? (
                    business.target_audience.split(',').filter(a => a.trim()).map((audience, index) => (
                      <span
                        key={index}
                        className="px-4 py-2 bg-purple-100 dark:bg-purple-900/40 text-purple-800 dark:text-purple-200 rounded-2xl text-sm font-medium"
                      >
                        {audience.trim()}
                      </span>
                    ))
                  ) : (
                    <span className="text-gray-500 text-sm">Nicht definiert.</span>
                  )}
                </div>
              )}
            </div>

            {/* Unique Selling Points */}
            <div className="bg-white dark:bg-gray-800 border-2 border-gray-200 dark:border-gray-700 rounded-3xl p-6">
              <div className="flex items-center justify-between mb-3">
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  Alleinstellungsmerkmale
                </label>
                {!isEditing && (
                  <span className="text-xs text-gray-500 font-medium">Read-only</span>
                )}
              </div>
              {isEditing ? (
                <textarea
                  value={
                    Array.isArray(editedBusiness?.unique_selling_points)
                      ? editedBusiness.unique_selling_points.join(', ')
                      : typeof editedBusiness?.unique_selling_points === 'string'
                      ? editedBusiness.unique_selling_points
                      : ""
                  }
                  onChange={(e) =>
                    setEditedBusiness({
                      ...editedBusiness!,
                      unique_selling_points: e.target.value.split(',').map(s => s.trim()).filter(s => s),
                    })
                  }
                  rows={3}
                  className="w-full px-4 py-4 bg-white dark:bg-gray-900 border-2 border-gray-200 dark:border-gray-700 rounded-2xl text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:border-blue-500 dark:focus:border-blue-500 resize-none"
                  placeholder="Hochleistungs-Sportwagen, Starke Verbindung zur Geschichte (getrennt durch Kommas)"
                />
              ) : (
                <div className="flex flex-wrap gap-2">
                  {Array.isArray(business.unique_selling_points) && business.unique_selling_points.length > 0 ? (
                    business.unique_selling_points.map((point, index) => (
                      <span
                        key={index}
                        className="px-4 py-2 bg-green-100 dark:bg-green-900/40 text-green-800 dark:text-green-200 rounded-2xl text-sm font-medium"
                      >
                        {typeof point === 'string' ? point : JSON.stringify(point)}
                      </span>
                    ))
                  ) : (
                    <span className="text-gray-500 text-sm">Nicht definiert.</span>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Right Column - Images */}
          <div className="space-y-6">
            {/* Website Images */}
            {business.website_images && business.website_images.length > 0 && (
              <div className="bg-white dark:bg-gray-800 border-2 border-gray-200 dark:border-gray-700 rounded-3xl p-6">
                <div className="flex items-center gap-2 mb-4">
                  <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    Bilder
                  </label>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  {business.website_images.slice(0, 4).map((imageUrl, index) => {
                    // Sanitize URL by trimming whitespace and newlines
                    const cleanUrl = imageUrl.trim().replace(/\n/g, '');
                    return (
                      <div
                        key={index}
                        className="aspect-square rounded-2xl bg-gray-200 dark:bg-gray-700 overflow-hidden"
                      >
                        <Image
                          src={cleanUrl}
                          alt={`Website image ${index + 1}`}
                          width={200}
                          height={200}
                          className="w-full h-full object-cover"
                          unoptimized
                        />
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <div className="bg-white dark:bg-gray-900 rounded-3xl shadow-2xl max-w-md w-full mx-4 p-8 border-2 border-gray-200 dark:border-gray-800">
            <div className="flex items-center gap-4 mb-6">
              <div className="w-12 h-12 rounded-full bg-red-100 dark:bg-red-900/40 flex items-center justify-center flex-shrink-0">
                <svg className="w-6 h-6 text-red-600 dark:text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
              </div>
              <div>
                <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                  Firmenprofil löschen?
                </h3>
              </div>
            </div>

            <p className="text-gray-700 dark:text-gray-300 mb-8 leading-relaxed">
              Bist du sicher, dass du dieses Firmenprofil löschen möchtest? Diese Aktion kann nicht rückgängig gemacht werden.
            </p>

            <div className="flex gap-3">
              <button
                onClick={() => setShowDeleteConfirm(false)}
                disabled={isDeleting}
                className="flex-1 px-6 py-3 bg-gray-200 dark:bg-gray-800 text-gray-900 dark:text-white font-medium rounded-2xl hover:bg-gray-300 dark:hover:bg-gray-700 transition-all shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Abbrechen
              </button>
              <button
                onClick={handleDelete}
                disabled={isDeleting}
                className="flex-1 px-6 py-3 bg-red-600 dark:bg-red-700 text-white font-medium rounded-2xl hover:bg-red-700 dark:hover:bg-red-800 transition-all shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isDeleting ? "Wird gelöscht..." : "Löschen"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// Completion Modal Component
interface CompletionModalProps {
  onClose: () => void;
  onNavigateToProducts: () => void;
}

function CompletionModal({ onClose, onNavigateToProducts }: CompletionModalProps) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="bg-white dark:bg-gray-900 rounded-3xl shadow-2xl max-w-md w-full mx-4 p-8 border-2 border-gray-200 dark:border-gray-800">
        <div className="flex items-center gap-4 mb-6">
          <div className="w-12 h-12 rounded-full bg-green-100 dark:bg-green-900/40 flex items-center justify-center flex-shrink-0">
            <svg className="w-6 h-6 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <div>
            <h3 className="text-xl font-bold text-gray-900 dark:text-white">
              Profil erstellt!
            </h3>
          </div>
        </div>

        <p className="text-gray-700 dark:text-gray-300 mb-8 leading-relaxed">
          Das Unternehmens & Angebotsprofil ist bereit für dich zum Review.
        </p>

        <div className="flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-medium rounded-2xl hover:from-blue-700 hover:to-purple-700 transition-all shadow-lg"
          >
            OK
          </button>
        </div>
      </div>
    </div>
  );
}
