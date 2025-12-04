"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { supabaseBrowserClient } from "@/lib/supabaseClient";
import { Database } from "@/types/database";
import LoadingModal from "@/components/LoadingModal";

type Business = Database["public"]["Tables"]["businesses"]["Row"];

export default function BusinessProfileView() {
  const [business, setBusiness] = useState<Business | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [editedBusiness, setEditedBusiness] = useState<Business | null>(null);
  const [businessUrl, setBusinessUrl] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [processingError, setProcessingError] = useState("");

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
        return;
      }

      // Call the business DNA webhook
      const response = await fetch("/api/webhook/business-website-dna", {
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
        throw new Error("Fehler beim Analysieren der Website");
      }

      // Poll for business profile creation (max 3 minutes, check every 3 seconds)
      const maxAttempts = 60; // 3 minutes / 3 seconds
      let attempts = 0;

      const pollInterval = setInterval(async () => {
        attempts++;

        const { data, error } = await supabaseBrowserClient
          .from("businesses")
          .select("*")
          .eq("user_id", user.id)
          .single();

        if (data && !error) {
          // Success! Business profile created
          clearInterval(pollInterval);
          setBusiness(data);
          setEditedBusiness(data);
          setIsProcessing(false);
          setBusinessUrl("");
        } else if (attempts >= maxAttempts) {
          // Timeout
          clearInterval(pollInterval);
          setIsProcessing(false);
          setProcessingError("Zeitüberschreitung beim Erstellen des Profils");
        }
      }, 3000);
    } catch (error) {
      console.error("Error creating profile:", error);
      setProcessingError("Ein Fehler ist aufgetreten. Bitte versuche es erneut.");
      setIsProcessing(false);
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
        <div className="flex-1 flex items-center justify-center bg-white dark:bg-gray-950 p-8">
          <div className="max-w-xl w-full">
            <div className="text-center mb-10">
              {/* Badge */}
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-gray-200 dark:border-gray-800 mb-6">
                <span className="text-sm text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-pink-600 font-semibold">
                  Firmenprofil
                </span>
              </div>

              {/* Title */}
              <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-3">
                Bevor du Bilder und Videos erstellst
              </h2>

              {/* Description */}
              <p className="text-lg text-gray-600 dark:text-gray-400 leading-relaxed">
                Beginne damit, deine Business-URL anzugeben, damit wir ein Firmenprofil erstellen und es für die Erstellung von Marketingmaterial verwenden können.
              </p>
            </div>

            {/* URL Input Box */}
            <div className="bg-gray-50 dark:bg-gray-900 rounded-3xl shadow-lg border border-gray-200 dark:border-gray-800 p-8">
              <label htmlFor="businessUrl" className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">
                Deine Webseiten-URL
              </label>
              <input
                id="businessUrl"
                type="url"
                value={businessUrl}
                onChange={(e) => setBusinessUrl(e.target.value)}
                placeholder="https://www.deinefirma.ch"
                className="w-full px-5 py-4 border-2 border-gray-200 dark:border-gray-700 rounded-2xl bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:border-purple-500 transition-colors mb-4"
                disabled={isProcessing}
              />

              {/* Error Message */}
              {processingError && (
                <div className="mb-4 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-2xl text-red-600 dark:text-red-400 text-sm">
                  {processingError}
                </div>
              )}

              {/* Let's Go Button */}
              <button
                onClick={handleCreateProfile}
                disabled={isProcessing || !businessUrl.trim()}
                className="w-full px-6 py-4 bg-gradient-to-r from-purple-600 to-pink-500 hover:from-purple-700 hover:to-pink-600 text-white rounded-full font-semibold transition-all shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isProcessing ? "Wird analysiert..." : "Los geht&apos;s"}
              </button>
            </div>
          </div>
        </div>

        <LoadingModal
          isOpen={isProcessing}
          businessUrl={businessUrl}
          estimatedTimeMinutes={2}
        />
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
                  href={business.company_url}
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
              <button
                onClick={handleEdit}
                className="px-6 py-3 bg-gray-900 dark:bg-white text-white dark:text-gray-900 rounded-2xl font-medium hover:opacity-90 transition-opacity flex items-center gap-2 shadow-lg"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                </svg>
                Bearbeiten
              </button>
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
    </div>
  );
}
