"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { supabaseBrowserClient } from "@/lib/supabaseClient";
import type { Database } from "@/types/database";

type Business = Database["public"]["Tables"]["businesses"]["Row"];

export default function BusinessDNAPage() {
  const params = useParams();
  const router = useRouter();
  const businessId = params.id as string;

  const [business, setBusiness] = useState<Business | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [viewMode, setViewMode] = useState<"business-dna" | "studio-selection" | "sign-up">("business-dna");

  useEffect(() => {
    fetchBusinessData();
  }, [businessId]);

  const fetchBusinessData = async () => {
    try {
      const { data, error: supabaseError } = await supabaseBrowserClient
        .from("businesses")
        .select("*")
        .eq("id", businessId)
        .single();

      if (supabaseError) throw supabaseError;

      console.log("Business data fetched:", data);
      console.log("Logo URL from database:", data?.logo_url);

      setBusiness(data);
    } catch (err) {
      console.error("Error fetching business:", err);
      setError("Failed to load business data. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // Helper function to get the full image URL
  const getImageUrl = (imagePathOrUrl: string | null, isLogo: boolean = false): string | null => {
    if (!imagePathOrUrl) return null;

    // If it's already a full URL, return it
    if (imagePathOrUrl.startsWith('http://') || imagePathOrUrl.startsWith('https://')) {
      console.log("Logo is already a full URL:", imagePathOrUrl);
      return imagePathOrUrl;
    }

    // Determine the bucket based on the path or if it's a logo
    let bucket = "attachments";
    let path = imagePathOrUrl;

    if (isLogo || imagePathOrUrl.includes('logos/') || imagePathOrUrl.includes('business-images')) {
      bucket = "business-images";
      // If the path doesn't already include the full path, construct it
      if (!imagePathOrUrl.startsWith('business-images/')) {
        path = imagePathOrUrl.startsWith('logos/')
          ? `business-images/${imagePathOrUrl}`
          : `business-images/logos/${imagePathOrUrl}`;
      }
    }

    console.log("Getting image URL - Original:", imagePathOrUrl, "Bucket:", bucket, "Path:", path);

    // Construct the public URL from the path
    const { data } = supabaseBrowserClient.storage
      .from(bucket)
      .getPublicUrl(path);

    console.log("Constructed public URL:", data.publicUrl);

    return data.publicUrl;
  };

  const updateField = async (field: keyof Business, value: any) => {
    if (!business) return;

    setSaving(true);
    try {
      const { error: updateError } = await supabaseBrowserClient
        .from("businesses")
        .update({ [field]: value })
        .eq("id", businessId);

      if (updateError) throw updateError;

      setBusiness({ ...business, [field]: value });
    } catch (err) {
      console.error("Error updating field:", err);
      alert("Failed to save changes. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  const handleReset = async () => {
    if (!confirm("Are you sure you want to reset your Business DNA? This will delete all data.")) {
      return;
    }

    try {
      const { error: deleteError } = await supabaseBrowserClient
        .from("businesses")
        .delete()
        .eq("id", businessId);

      if (deleteError) throw deleteError;

      router.push("/");
    } catch (err) {
      console.error("Error deleting business:", err);
      alert("Failed to reset Business DNA. Please try again.");
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-950">
        <div className="text-center">
          <div className="animate-spin w-12 h-12 border-4 border-purple-500 border-t-transparent rounded-full mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">Loading...</p>
        </div>
      </div>
    );
  }

  if (error || !business) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-950">
        <div className="text-center max-w-md mx-auto px-4">
          <p className="text-red-500 dark:text-red-400 mb-4">{error || "Business not found"}</p>
          <button
            onClick={() => router.push("/")}
            className="px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
          >
            Back to Home
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white dark:from-gray-950 dark:to-gray-900 py-8 px-4 relative overflow-hidden">
      {/* Decorative Background Elements */}
      <div className="absolute inset-0 pointer-events-none">
        {/* Curved line decoration */}
        <svg className="absolute top-0 left-0 w-full h-full opacity-10" xmlns="http://www.w3.org/2000/svg">
          <path
            d="M 0,400 Q 400,450 800,400 T 1600,400"
            stroke="currentColor"
            strokeWidth="2"
            fill="none"
            className="text-purple-500"
          />
          <path
            d="M 0,600 Q 500,550 1000,600 T 2000,600"
            stroke="currentColor"
            strokeWidth="2"
            fill="none"
            className="text-pink-500"
          />
        </svg>

        {/* Gradient orbs */}
        <div className="absolute top-20 right-10 w-64 h-64 bg-purple-300 dark:bg-purple-900 rounded-full mix-blend-multiply dark:mix-blend-soft-light filter blur-3xl opacity-20"></div>
        <div className="absolute bottom-20 left-10 w-64 h-64 bg-pink-300 dark:bg-pink-900 rounded-full mix-blend-multiply dark:mix-blend-soft-light filter blur-3xl opacity-20"></div>
      </div>

      {/* Header */}
      <header className="max-w-5xl mx-auto mb-6 relative z-10">
        <button
          onClick={() => router.push("/")}
          className="flex items-center gap-2 text-gray-500 hover:text-gray-900 dark:hover:text-white transition-colors mb-6"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
          Zurück
        </button>

        {/* Friendly Title */}
        <div className="text-center mb-6">
          {viewMode === "business-dna" ? (
            <>
              <h1 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white mb-2">
                Deine Website sieht ja schon super aus! 🎉
              </h1>
              <p className="text-gray-600 dark:text-gray-400 text-sm md:text-base max-w-2xl mx-auto">
                Hier eine Übersicht deiner Firma, welche wir als Basis nutzen um massgeschneiderte Marketingkampagnen zu erstellen. Dies kannst du jeder Zeit anpassen
              </p>
            </>
          ) : viewMode === "studio-selection" ? (
            <>
              <h1 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white mb-2">
                In deinem XV Studio erstellst du geniale, neue Marketingassets und bringst deine Firma ins Rampenlicht
              </h1>
              <p className="text-gray-600 dark:text-gray-400 text-sm md:text-base max-w-2xl mx-auto">
                KI geführt, in deiner Firmen DNA und sofort einsetzbar - von Bildern, neuen Produkt Videos bis hin zu kompletten Social Media Kampagnen
              </p>
            </>
          ) : (
            <>
              <h1 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white mb-2">
                Logge dich jetzt ein und erfahre was alles machbar ist für deine Firma
              </h1>
              <p className="text-gray-600 dark:text-gray-400 text-sm md:text-base max-w-2xl mx-auto">
                Erstelle dein Konto in wenigen Sekunden und starte mit der Erstellung deiner Marketingmaterialien
              </p>
            </>
          )}
        </div>
      </header>

      {/* Main Content - Single Card with Fixed Height and Scrolling */}
      <main className="max-w-5xl mx-auto relative z-10">
        <div className="bg-white dark:bg-gray-900 rounded-3xl shadow-2xl border-4 border-gray-300 dark:border-gray-700 overflow-hidden" style={{ maxHeight: 'calc(100vh - 280px)' }}>
          <div className="overflow-y-auto p-8 md:p-10" style={{ maxHeight: 'calc(100vh - 280px)' }}>

          {viewMode === "business-dna" ? (
            <>
          {/* Profile Header */}
          <div className="flex items-start gap-6 pb-4 mb-4">
            {/* Logo/Avatar */}
            <div className="flex-shrink-0">
              {business.logo_url && getImageUrl(business.logo_url, true) ? (
                <div className="w-24 h-24 rounded-2xl overflow-hidden border-2 border-gray-200 dark:border-gray-700 shadow-md bg-gray-100 dark:bg-gray-700">
                  <img
                    src={getImageUrl(business.logo_url, true)!}
                    alt={business.company_name}
                    className="w-full h-full object-cover"
                    crossOrigin="anonymous"
                    onError={(e) => {
                      const target = e.target as HTMLImageElement;
                      console.error('Failed to load logo:', business.logo_url, 'Resolved URL:', getImageUrl(business.logo_url, true));
                      target.style.display = 'none';
                      if (target.parentElement) {
                        target.parentElement.innerHTML = `<div class="w-full h-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-white text-3xl font-bold">${business.company_name.charAt(0)}</div>`;
                      }
                    }}
                  />
                </div>
              ) : (
                <div className="w-24 h-24 rounded-2xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-white text-3xl font-bold shadow-md">
                  {business.company_name.charAt(0)}
                </div>
              )}
            </div>

            {/* Company Info */}
            <div className="flex-1 min-w-0">
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">{business.company_name}</h1>
              <div className="mb-1">
                <EditableText
                  value={business.tagline || ""}
                  onSave={(value) => updateField("tagline", value)}
                  saving={saving}
                  placeholder="Füge einen Slogan hinzu..."
                  className="text-lg text-gray-600 dark:text-gray-400 italic"
                />
              </div>
              <a
                href={business.company_url}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-purple-600 dark:hover:text-purple-400 transition-colors"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
                </svg>
                {business.company_url}
              </a>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left Column */}
            <div className="lg:col-span-2 space-y-5">
              {/* Business Overview */}
              {business.business_description && (
                <div className="bg-gray-50 dark:bg-gray-800 rounded-2xl p-5 border border-gray-200 dark:border-gray-700 shadow-md">
                  <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">Geschäftsübersicht</h3>
                  <EditableTextArea
                    value={business.business_description || ""}
                    onSave={(value) => updateField("business_description", value)}
                    saving={saving}
                    placeholder="Beschreibe dein Business..."
                  />
                </div>
              )}

              {/* Colors */}
              <div className="bg-gray-50 dark:bg-gray-800 rounded-2xl p-5 border border-gray-200 dark:border-gray-700 shadow-md">
                <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">Firmenfarben</h3>
                <ColorEditor
                  colors={business.brand_colors}
                  onSave={(colors) => updateField("brand_colors", colors)}
                  saving={saving}
                />
              </div>

              {/* Brand Values */}
              {business.brand_values.length > 0 && (
                <div className="bg-gray-50 dark:bg-gray-800 rounded-2xl p-5 border border-gray-200 dark:border-gray-700 shadow-md">
                  <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">Firmenwerte</h3>
                  <TagEditor
                    tags={business.brand_values}
                    onSave={(tags) => updateField("brand_values", tags)}
                    saving={saving}
                    placeholder="Wert hinzufügen..."
                  />
                </div>
              )}

              {/* Tone of Voice */}
              {business.tone_of_voice.length > 0 && (
                <div className="bg-gray-50 dark:bg-gray-800 rounded-2xl p-5 border border-gray-200 dark:border-gray-700 shadow-md">
                  <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">Brand-Voice</h3>
                  <TagEditor
                    tags={business.tone_of_voice}
                    onSave={(tags) => updateField("tone_of_voice", tags)}
                    saving={saving}
                    placeholder="Tonbeschreibung hinzufügen..."
                  />
                </div>
              )}
            </div>

            {/* Right Column - Images */}
            <div>
              <div className="bg-gray-50 dark:bg-gray-800 rounded-2xl p-5 border border-gray-200 dark:border-gray-700 shadow-md">
                <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">Bilder</h3>
                <ImageGallery
                  images={business.website_images}
                  onSave={(images) => updateField("website_images", images)}
                  saving={saving}
                />
              </div>
            </div>
          </div>
            </>
          ) : viewMode === "studio-selection" ? (
            <>
              {/* Studio Selection Cards */}
              <div className="space-y-6">
                {/* Social Media Kampagnen */}
                <div className="bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 rounded-2xl p-6 border-2 border-purple-200 dark:border-purple-700 shadow-lg hover:shadow-xl transition-all cursor-pointer group hover:scale-[1.02]">
                  <div className="flex flex-col md:flex-row gap-6 items-center">
                    {/* Image */}
                    <div className="flex-shrink-0 w-full md:w-48 h-48 rounded-xl overflow-hidden border-2 border-purple-300 dark:border-purple-600 shadow-md">
                      <img
                        src="https://images.unsplash.com/photo-1611162617474-5b21e879e113?w=400&h=400&fit=crop"
                        alt="Social Media Kampagnen"
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                      />
                    </div>
                    {/* Content */}
                    <div className="flex-1">
                      <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
                        Social Media Kampagnen
                      </h3>
                      <ul className="space-y-2 text-gray-700 dark:text-gray-300">
                        <li className="flex items-start gap-2">
                          <svg className="w-5 h-5 text-purple-600 dark:text-purple-400 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                          </svg>
                          <span>KI-generierte Posts für Instagram, Facebook und LinkedIn</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <svg className="w-5 h-5 text-purple-600 dark:text-purple-400 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                          </svg>
                          <span>Perfekt abgestimmt auf deine Firmen DNA und Zielgruppe</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <svg className="w-5 h-5 text-purple-600 dark:text-purple-400 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                          </svg>
                          <span>Inkl. passender Bildvorschläge und Hashtags</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <svg className="w-5 h-5 text-purple-600 dark:text-purple-400 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                          </svg>
                          <span>Sofort einsetzbar und in deinem Brand-Voice</span>
                        </li>
                      </ul>
                    </div>
                  </div>
                </div>

                {/* Dein neues Produktvideo */}
                <div className="bg-gradient-to-br from-pink-50 to-orange-50 dark:from-pink-900/20 dark:to-orange-900/20 rounded-2xl p-6 border-2 border-pink-200 dark:border-pink-700 shadow-lg hover:shadow-xl transition-all cursor-pointer group hover:scale-[1.02]">
                  <div className="flex flex-col md:flex-row gap-6 items-center">
                    {/* Image */}
                    <div className="flex-shrink-0 w-full md:w-48 h-48 rounded-xl overflow-hidden border-2 border-pink-300 dark:border-pink-600 shadow-md">
                      <img
                        src="https://images.unsplash.com/photo-1492691527719-9d1e07e534b4?w=400&h=400&fit=crop"
                        alt="Produktvideo"
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                      />
                    </div>
                    {/* Content */}
                    <div className="flex-1">
                      <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
                        Dein neues Produktvideo
                      </h3>
                      <ul className="space-y-2 text-gray-700 dark:text-gray-300">
                        <li className="flex items-start gap-2">
                          <svg className="w-5 h-5 text-pink-600 dark:text-pink-400 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                          </svg>
                          <span>Professionelle Videos für deine Produkte und Services</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <svg className="w-5 h-5 text-pink-600 dark:text-pink-400 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                          </svg>
                          <span>KI-generierte Voiceover in deinem Brand-Voice</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <svg className="w-5 h-5 text-pink-600 dark:text-pink-400 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                          </svg>
                          <span>Optimiert für Social Media und Website</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <svg className="w-5 h-5 text-pink-600 dark:text-pink-400 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                          </svg>
                          <span>Mehrere Formate und Varianten verfügbar</span>
                        </li>
                      </ul>
                    </div>
                  </div>
                </div>

                {/* Marketingmaterial das verblüfft */}
                <div className="bg-gradient-to-br from-orange-50 to-yellow-50 dark:from-orange-900/20 dark:to-yellow-900/20 rounded-2xl p-6 border-2 border-orange-200 dark:border-orange-700 shadow-lg hover:shadow-xl transition-all cursor-pointer group hover:scale-[1.02]">
                  <div className="flex flex-col md:flex-row gap-6 items-center">
                    {/* Image */}
                    <div className="flex-shrink-0 w-full md:w-48 h-48 rounded-xl overflow-hidden border-2 border-orange-300 dark:border-orange-600 shadow-md">
                      <img
                        src="https://images.unsplash.com/photo-1542744094-3a31f272c490?w=400&h=400&fit=crop"
                        alt="Marketingmaterial"
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                      />
                    </div>
                    {/* Content */}
                    <div className="flex-1">
                      <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
                        Marketingmaterial das verblüfft
                      </h3>
                      <ul className="space-y-2 text-gray-700 dark:text-gray-300">
                        <li className="flex items-start gap-2">
                          <svg className="w-5 h-5 text-orange-600 dark:text-orange-400 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                          </svg>
                          <span>Flyer, Broschüren und Präsentationen auf Profi-Niveau</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <svg className="w-5 h-5 text-orange-600 dark:text-orange-400 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                          </svg>
                          <span>In deinen Firmenfarben und mit deinem Logo</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <svg className="w-5 h-5 text-orange-600 dark:text-orange-400 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                          </svg>
                          <span>Print-ready Dateien zum direkten Download</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <svg className="w-5 h-5 text-orange-600 dark:text-orange-400 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                          </svg>
                          <span>Mehrsprachig und anpassbar nach deinen Wünschen</span>
                        </li>
                      </ul>
                    </div>
                  </div>
                </div>
              </div>
            </>
          ) : (
            <>
              {/* Sign-Up Form */}
              <SignUpForm onSuccess={() => router.push("/studio")} />
            </>
          )}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center justify-center gap-4 mt-6">
          <button
            onClick={() => {
              if (viewMode === "business-dna") {
                setViewMode("studio-selection");
              } else if (viewMode === "studio-selection") {
                setViewMode("sign-up");
              } else {
                // Already in sign-up view - form handles submission
              }
            }}
            className="px-10 py-4 bg-gradient-to-r from-purple-600 via-pink-600 to-orange-500 hover:shadow-2xl hover:shadow-purple-500/50 text-white rounded-3xl font-semibold transition-all transform hover:scale-105"
            style={{ display: viewMode === "sign-up" ? "none" : "block" }}
          >
            {viewMode === "business-dna" ? "Weiter zum Studio" : "Zum XV Studio"}
          </button>
        </div>
      </main>
    </div>
  );
}

// Editable TextArea Component
function EditableTextArea({
  value,
  onSave,
  saving,
  placeholder,
  className = "",
}: {
  value: string;
  onSave: (value: string) => void;
  saving: boolean;
  placeholder?: string;
  className?: string;
}) {
  const [isEditing, setIsEditing] = useState(false);
  const [editValue, setEditValue] = useState(value);

  const handleSave = () => {
    if (editValue !== value) {
      onSave(editValue);
    }
    setIsEditing(false);
  };

  if (isEditing) {
    return (
      <div>
        <textarea
          value={editValue}
          onChange={(e) => setEditValue(e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent min-h-[80px] resize-none"
          placeholder={placeholder}
          autoFocus
          disabled={saving}
        />
        <div className="flex gap-2 mt-2">
          <button
            onClick={handleSave}
            disabled={saving}
            className="px-3 py-1.5 bg-purple-600 text-white text-sm rounded-lg hover:bg-purple-700 disabled:opacity-50"
          >
            Save
          </button>
          <button
            onClick={() => {
              setEditValue(value);
              setIsEditing(false);
            }}
            className="px-3 py-1.5 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 text-sm rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600"
          >
            Cancel
          </button>
        </div>
      </div>
    );
  }

  return (
    <div
      onClick={() => setIsEditing(true)}
      className={`group relative px-3 py-2 border border-transparent rounded-lg bg-gray-50 dark:bg-gray-800 cursor-pointer hover:border-purple-500/50 transition-colors min-h-[80px] ${className}`}
    >
      <p className="text-gray-700 dark:text-gray-200 whitespace-pre-wrap text-sm">
        {value || <span className="text-gray-400 dark:text-gray-500">{placeholder}</span>}
      </p>
      <svg className="absolute top-2 right-2 w-4 h-4 text-gray-400 dark:text-gray-600 group-hover:text-purple-500 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
      </svg>
    </div>
  );
}

// Editable Text Component (single line)
function EditableText({
  value,
  onSave,
  saving,
  placeholder,
  className = "",
}: {
  value: string;
  onSave: (value: string) => void;
  saving: boolean;
  placeholder?: string;
  className?: string;
}) {
  const [isEditing, setIsEditing] = useState(false);
  const [editValue, setEditValue] = useState(value);

  const handleSave = () => {
    if (editValue !== value) {
      onSave(editValue);
    }
    setIsEditing(false);
  };

  if (isEditing) {
    return (
      <div className="flex items-center gap-2">
        <input
          type="text"
          value={editValue}
          onChange={(e) => setEditValue(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") handleSave();
            if (e.key === "Escape") {
              setEditValue(value);
              setIsEditing(false);
            }
          }}
          className="flex-1 px-3 py-1.5 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent"
          placeholder={placeholder}
          autoFocus
          disabled={saving}
        />
        <button
          onClick={handleSave}
          disabled={saving}
          className="px-3 py-1.5 bg-purple-600 text-white text-xs rounded-lg hover:bg-purple-700 disabled:opacity-50"
        >
          Save
        </button>
        <button
          onClick={() => {
            setEditValue(value);
            setIsEditing(false);
          }}
          className="px-3 py-1.5 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 text-xs rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600"
        >
          Cancel
        </button>
      </div>
    );
  }

  return (
    <div
      onClick={() => setIsEditing(true)}
      className="group inline-flex items-center gap-2 cursor-pointer"
    >
      <span className={value ? className : "text-gray-400 dark:text-gray-500 italic"}>
        {value || placeholder}
      </span>
      <svg className="w-3.5 h-3.5 text-gray-400 dark:text-gray-600 opacity-0 group-hover:opacity-100 transition-opacity" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
      </svg>
    </div>
  );
}

// Color Editor Component
function ColorEditor({
  colors,
  onSave,
  saving,
}: {
  colors: string[];
  onSave: (colors: string[]) => void;
  saving: boolean;
}) {
  const [isAdding, setIsAdding] = useState(false);
  const [newColor, setNewColor] = useState("#000000");

  const handleAddColor = () => {
    if (colors.length < 8) {
      onSave([...colors, newColor]);
      setNewColor("#000000");
      setIsAdding(false);
    }
  };

  const handleRemoveColor = (index: number) => {
    onSave(colors.filter((_, i) => i !== index));
  };

  return (
    <div className="flex flex-wrap gap-5 items-center">
      {colors.slice(0, 8).map((color, index) => (
        <div key={index} className="group relative">
          <div
            className="w-14 h-14 rounded-full border-2 border-gray-300 dark:border-gray-600 shadow-md cursor-pointer hover:scale-110 transition-transform"
            style={{ backgroundColor: color }}
            title={color}
          />
          <button
            onClick={() => handleRemoveColor(index)}
            className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-xs font-bold shadow-lg"
          >
            ×
          </button>
        </div>
      ))}

      {isAdding ? (
        <div className="flex items-center gap-2">
          <input
            type="color"
            value={newColor}
            onChange={(e) => setNewColor(e.target.value)}
            className="w-14 h-14 rounded-full border-2 border-gray-300 dark:border-gray-600 cursor-pointer"
          />
          <button
            onClick={handleAddColor}
            disabled={saving}
            className="px-3 py-1 bg-purple-600 text-white text-xs rounded-full hover:bg-purple-700 shadow-md"
          >
            Add
          </button>
          <button
            onClick={() => setIsAdding(false)}
            className="px-3 py-1 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 text-xs rounded-full hover:bg-gray-300 dark:hover:bg-gray-600"
          >
            Cancel
          </button>
        </div>
      ) : (
        colors.length < 8 && (
          <button
            onClick={() => setIsAdding(true)}
            className="w-14 h-14 rounded-full border-2 border-dashed border-gray-300 dark:border-gray-600 flex items-center justify-center text-gray-400 dark:text-gray-500 hover:border-purple-500 hover:text-purple-500 transition-colors"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
          </button>
        )
      )}
    </div>
  );
}

// Tag Editor Component
function TagEditor({
  tags,
  onSave,
  saving,
  placeholder,
}: {
  tags: string[];
  onSave: (tags: string[]) => void;
  saving: boolean;
  placeholder?: string;
}) {
  const [isAdding, setIsAdding] = useState(false);
  const [newTag, setNewTag] = useState("");

  const handleAddTag = () => {
    if (newTag.trim() && !tags.includes(newTag.trim())) {
      onSave([...tags, newTag.trim()]);
      setNewTag("");
      setIsAdding(false);
    }
  };

  const handleRemoveTag = (index: number) => {
    onSave(tags.filter((_, i) => i !== index));
  };

  return (
    <div className="flex flex-wrap gap-2">
      {tags.map((tag, index) => (
        <span
          key={index}
          className="group inline-flex items-center gap-2 px-3 py-1.5 bg-[#2a2a2a] text-gray-300 rounded-full text-sm border border-gray-600"
        >
          {tag}
          <button
            onClick={() => handleRemoveTag(index)}
            className="text-gray-500 hover:text-red-400 transition-colors"
          >
            ×
          </button>
        </span>
      ))}

      {isAdding ? (
        <div className="inline-flex gap-2">
          <input
            type="text"
            value={newTag}
            onChange={(e) => setNewTag(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") handleAddTag();
              if (e.key === "Escape") {
                setNewTag("");
                setIsAdding(false);
              }
            }}
            className="px-3 py-1.5 border border-gray-600 rounded-full bg-[#2a2a2a] text-white text-sm focus:ring-2 focus:ring-purple-500 focus:border-transparent w-32"
            placeholder={placeholder}
            autoFocus
            disabled={saving}
          />
          <button
            onClick={handleAddTag}
            disabled={saving}
            className="px-3 py-1.5 bg-purple-600 text-white text-sm rounded-full hover:bg-purple-700"
          >
            Add
          </button>
          <button
            onClick={() => {
              setNewTag("");
              setIsAdding(false);
            }}
            className="px-3 py-1.5 bg-[#2a2a2a] text-gray-300 text-sm rounded-full hover:bg-[#333333]"
          >
            Cancel
          </button>
        </div>
      ) : (
        <button
          onClick={() => setIsAdding(true)}
          className="inline-flex items-center gap-1 px-3 py-1.5 border border-dashed border-gray-600 text-gray-500 rounded-full text-sm hover:border-purple-500 hover:text-purple-500 transition-colors"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Add
        </button>
      )}
    </div>
  );
}

// Image Upload Component
function ImageUpload({
  imageUrl,
  onSave,
  saving,
  aspectRatio = "square",
  placeholder,
}: {
  imageUrl: string | null;
  onSave: (url: string | null) => void;
  saving: boolean;
  aspectRatio?: "square" | "portrait" | "landscape";
  placeholder?: string;
}) {
  const [uploading, setUploading] = useState(false);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    try {
      // Upload via API route (bypasses RLS)
      const formData = new FormData();
      formData.append("file", file);
      formData.append("folder", "logos");

      const response = await fetch("/api/storage/upload", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Upload failed");
      }

      const data = await response.json();
      onSave(data.url);
    } catch (error) {
      console.error("Error uploading image:", error);
      alert("Failed to upload image. Please try again.");
    } finally {
      setUploading(false);
    }
  };

  const aspectClass = {
    square: "aspect-square",
    portrait: "aspect-[3/4]",
    landscape: "aspect-[16/9]",
  }[aspectRatio];

  if (imageUrl) {
    return (
      <div className="group relative">
        <div className={`${aspectClass} rounded-xl overflow-hidden bg-[#2a2a2a]`}>
          <img src={imageUrl} alt="Logo" className="w-full h-full object-cover" />
        </div>
        <div className="absolute inset-0 bg-black/70 opacity-0 group-hover:opacity-100 transition-opacity rounded-xl flex items-center justify-center gap-2">
          <label className="px-3 py-2 bg-white text-gray-900 text-sm rounded-lg cursor-pointer hover:bg-gray-100">
            Change
            <input
              type="file"
              accept="image/*"
              onChange={handleFileChange}
              className="hidden"
              disabled={uploading || saving}
            />
          </label>
          <button
            onClick={() => onSave(null)}
            className="px-3 py-2 bg-red-500 text-white text-sm rounded-lg hover:bg-red-600"
          >
            Remove
          </button>
        </div>
      </div>
    );
  }

  return (
    <label className={`${aspectClass} rounded-xl border-2 border-dashed border-gray-600 flex flex-col items-center justify-center cursor-pointer hover:border-purple-500 transition-colors bg-[#2a2a2a]`}>
      <svg className="w-8 h-8 text-gray-600 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
      </svg>
      <span className="text-xs text-gray-500">
        {uploading ? "Uploading..." : placeholder || "Upload"}
      </span>
      <input
        type="file"
        accept="image/*"
        onChange={handleFileChange}
        className="hidden"
        disabled={uploading || saving}
      />
    </label>
  );
}

// Image Gallery Component
function ImageGallery({
  images,
  onSave,
  saving,
}: {
  images: string[];
  onSave: (images: string[]) => void;
  saving: boolean;
}) {
  const [uploading, setUploading] = useState(false);
  const [imageErrors, setImageErrors] = useState<{[key: number]: boolean}>({});

  // Helper function to get the full image URL
  const getImageUrl = (imagePathOrUrl: string): string => {
    // If it's already a full URL, return it
    if (imagePathOrUrl.startsWith('http://') || imagePathOrUrl.startsWith('https://')) {
      return imagePathOrUrl;
    }

    // Determine bucket based on path
    const bucket = imagePathOrUrl.includes('business-images') ? 'business-images' : 'attachments';

    // Construct the public URL from the path
    const { data } = supabaseBrowserClient.storage
      .from(bucket)
      .getPublicUrl(imagePathOrUrl);

    return data.publicUrl;
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;

    setUploading(true);
    try {
      const uploadedUrls: string[] = [];

      for (const file of files) {
        // Upload via API route (bypasses RLS)
        const formData = new FormData();
        formData.append("file", file);
        formData.append("folder", "website-images");

        const response = await fetch("/api/storage/upload", {
          method: "POST",
          body: formData,
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || "Upload failed");
        }

        const data = await response.json();
        uploadedUrls.push(data.url);
      }

      onSave([...images, ...uploadedUrls]);
    } catch (error) {
      console.error("Error uploading images:", error);
      alert("Failed to upload images. Please try again.");
    } finally {
      setUploading(false);
    }
  };

  const handleRemoveImage = (index: number) => {
    onSave(images.filter((_, i) => i !== index));
  };

  const handleImageError = (index: number, imageUrl: string) => {
    console.error(`Failed to load image at index ${index}:`, imageUrl);
    setImageErrors(prev => ({ ...prev, [index]: true }));
  };

  return (
    <div className="grid grid-cols-2 gap-3">
      {images.slice(0, 8).map((imagePathOrUrl, index) => {
        const imageUrl = getImageUrl(imagePathOrUrl);
        return (
          <div key={index} className="group relative aspect-square rounded-xl overflow-hidden bg-gray-100 dark:bg-gray-700 shadow-sm">
            {imageErrors[index] ? (
              <div className="w-full h-full flex flex-col items-center justify-center text-gray-400 dark:text-gray-500 p-2">
                <svg className="w-8 h-8 mb-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                <span className="text-xs text-center">Failed to load</span>
              </div>
            ) : (
              <img
                src={imageUrl}
                alt={`Image ${index + 1}`}
                className="w-full h-full object-cover"
                onError={() => handleImageError(index, imageUrl)}
                loading="lazy"
                crossOrigin="anonymous"
              />
            )}
            <button
              onClick={() => handleRemoveImage(index)}
              className="absolute top-1.5 right-1.5 w-5 h-5 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-xs font-bold shadow-lg"
            >
              ×
            </button>
          </div>
        );
      })}

      {images.length < 8 && (
        <label className="aspect-square rounded-xl border-2 border-dashed border-gray-300 dark:border-gray-600 flex flex-col items-center justify-center cursor-pointer hover:border-purple-500 transition-colors bg-gray-50 dark:bg-gray-800">
          <svg className="w-6 h-6 text-gray-400 dark:text-gray-500 mb-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          <span className="text-xs text-gray-400 dark:text-gray-500">
            {uploading ? "Uploading..." : "Add"}
          </span>
          <input
            type="file"
            accept="image/*"
            multiple
            onChange={handleFileChange}
            className="hidden"
            disabled={uploading || saving}
          />
        </label>
      )}
    </div>
  );
}

// SignUp Form Component
function SignUpForm({ onSuccess }: { onSuccess: () => void }) {
  const [authMode, setAuthMode] = useState<"select" | "email">("select");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleEmailSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const { signUpWithEmail } = await import("@/lib/auth");
      const result = await signUpWithEmail(email, password);

      if ("error" in result) {
        setError(result.error);
      } else {
        // Success! Redirect to studio
        onSuccess();
      }
    } catch (err) {
      console.error("Sign up error:", err);
      setError("Ein Fehler ist aufgetreten. Bitte versuche es erneut.");
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignUp = async () => {
    setError("");
    setLoading(true);

    try {
      const { signInWithGoogle } = await import("@/lib/auth");
      await signInWithGoogle();
      // OAuth will redirect automatically
    } catch (err) {
      console.error("Google sign up error:", err);
      setError("Google Anmeldung fehlgeschlagen. Bitte versuche es erneut.");
      setLoading(false);
    }
  };

  if (authMode === "select") {
    return (
      <div className="max-w-md mx-auto space-y-4 py-8">
        {/* Gmail Sign Up Button */}
        <button
          onClick={handleGoogleSignUp}
          disabled={loading}
          className="w-full flex items-center justify-center gap-3 px-6 py-4 bg-white dark:bg-gray-800 text-gray-900 dark:text-white border-2 border-gray-300 dark:border-gray-600 rounded-2xl font-semibold hover:border-purple-500 dark:hover:border-purple-400 hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <svg className="w-6 h-6" viewBox="0 0 24 24">
            <path
              fill="#4285F4"
              d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
            />
            <path
              fill="#34A853"
              d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
            />
            <path
              fill="#FBBC05"
              d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
            />
            <path
              fill="#EA4335"
              d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
            />
          </svg>
          {loading ? "Wird geladen..." : "Mit Gmail anmelden"}
        </button>

        {/* Divider */}
        <div className="flex items-center gap-3 my-6">
          <div className="flex-1 h-px bg-gray-300 dark:bg-gray-600"></div>
          <span className="text-sm text-gray-500 dark:text-gray-400">oder</span>
          <div className="flex-1 h-px bg-gray-300 dark:bg-gray-600"></div>
        </div>

        {/* Email Sign Up Button */}
        <button
          onClick={() => setAuthMode("email")}
          disabled={loading}
          className="w-full flex items-center justify-center gap-3 px-6 py-4 bg-gradient-to-r from-purple-600 via-pink-600 to-orange-500 text-white rounded-2xl font-semibold hover:shadow-2xl hover:shadow-purple-500/50 transition-all transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
            />
          </svg>
          Mit E-Mail anmelden
        </button>

        {error && (
          <div className="mt-4 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg text-red-600 dark:text-red-400 text-sm">
            {error}
          </div>
        )}
      </div>
    );
  }

  // Email form
  return (
    <div className="max-w-md mx-auto space-y-6 py-8">
      <button
        onClick={() => setAuthMode("select")}
        className="flex items-center gap-2 text-gray-600 dark:text-gray-400 hover:text-purple-600 dark:hover:text-purple-400 transition-colors"
      >
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
        </svg>
        Zurück
      </button>

      <form onSubmit={handleEmailSignUp} className="space-y-4">
        {/* Email Input */}
        <div>
          <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            E-Mail-Adresse
          </label>
          <input
            id="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            placeholder="deine@email.com"
            className="w-full px-4 py-3 border-2 border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            disabled={loading}
          />
        </div>

        {/* Password Input */}
        <div>
          <label htmlFor="password" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Passwort
          </label>
          <input
            id="password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            placeholder="Mindestens 6 Zeichen"
            minLength={6}
            className="w-full px-4 py-3 border-2 border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            disabled={loading}
          />
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          disabled={loading}
          className="w-full px-6 py-4 bg-gradient-to-r from-purple-600 via-pink-600 to-orange-500 text-white rounded-2xl font-semibold hover:shadow-2xl hover:shadow-purple-500/50 transition-all transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
        >
          {loading ? "Wird erstellt..." : "Konto erstellen"}
        </button>

        {error && (
          <div className="p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg text-red-600 dark:text-red-400 text-sm">
            {error}
          </div>
        )}
      </form>

      <p className="text-center text-sm text-gray-600 dark:text-gray-400">
        Mit der Anmeldung akzeptierst du unsere{" "}
        <a href="/terms" className="text-purple-600 dark:text-purple-400 hover:underline">
          Nutzungsbedingungen
        </a>
      </p>
    </div>
  );
}
