"use client";

import { useState, useEffect, useRef } from "react";
import ChatMessages from "./ChatMessages";
import ChatInput from "./ChatInput";
import { supabaseBrowserClient } from "@/lib/supabaseClient";

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: string;
  status?: "sending" | "error";
  imageUrls?: string[];
}

interface ConversationState {
  messages: Message[];
  isComplete: boolean;
  isRefining: boolean;
  currentImageUrl: string | null;
  originalImageSettings: {
    aspectRatio?: string;
    resolution?: string;
    outputFormat?: string;
  };
  lastGenerationParams?: {
    prompt: string;
    aspectRatio?: string;
    resolution?: string;
    outputFormat?: string;
    hasReferenceImages?: boolean;
    imageUrls?: string[];
  };
}

interface ChatContainerProps {
  selectedProductId: number | null;
  onPreviewUpdate?: (imageUrl: string | null) => void;
  onGenerationParamsUpdate?: (params: any) => void;
}

const PRODUCT_CONFIGS: Record<number, { name: string; greeting: string }> = {
  0: {
    name: "Bilder",
    greeting: "Hallo Fabian, ich helfe dir dabei, grossartige Bilder für dein Geschäft zu erstellen. Du hast folgende Möglichkeiten:\n\n- **Lasse der KI freien Lauf** und beschreibe was für ein Bild du erstellen möchtest\n- **Füge neben der Beschreibung Referenzbilder dazu** (bis zu drei Bilder). Beispielsweise um aus einem Produktbild ein lebhaftes Bild zu erstellen mit deinem Produkt im Mittelpunkt\n- **Kombiniere mehrere Bilder** zu einem neuen, kreativen Bild\n\nWie möchtest du beginnen?",
  },
  1: {
    name: "Social Media Paket",
    greeting: "Hey willkommen Fabian! Ich helfe dir dabei, die richtigen Social Media Posts für dich zu erstellen. Hast du bereits ein spezielles Thema im Kopf?",
  },
  2: {
    name: "Produkt / Service Video",
    greeting: "Hallo! Ich helfe dir dabei, ein professionelles Produktvideo zu erstellen.\n\nDu hast zwei Möglichkeiten:\n\n1. **Produktseiten-URL analysieren**: Gib mir die URL deiner Produktseite und ich analysiere sie automatisch, um Videoideen zu generieren.\n\n2. **Manuell beschreiben**: Beschreibe dein Produkt selbst und lade Bilder hoch.\n\nWie möchtest du vorgehen?",
  },
};

export default function ChatContainer({ selectedProductId, onPreviewUpdate, onGenerationParamsUpdate }: ChatContainerProps) {
  // Store conversation history for each product (session-only, in-memory)
  const conversationHistoryRef = useRef<Map<number, ConversationState>>(new Map());
  const initializedProductRef = useRef<number | null>(null);

  // Current conversation state
  const [currentState, setCurrentState] = useState<ConversationState>({
    messages: [],
    isComplete: false,
    isRefining: false,
    currentImageUrl: null,
    originalImageSettings: {},
    lastGenerationParams: undefined,
  });

  // Transient UI state (not persisted)
  const [isLoading, setIsLoading] = useState(false);

  // Save/restore conversation when product is selected or switched
  useEffect(() => {
    if (selectedProductId !== null && selectedProductId !== initializedProductRef.current) {
      // Save previous conversation before switching
      if (initializedProductRef.current !== null) {
        conversationHistoryRef.current.set(initializedProductRef.current, currentState);
      }

      // Check if we have existing conversation for this product
      const existingConversation = conversationHistoryRef.current.get(selectedProductId);

      if (existingConversation) {
        // Restore previous conversation
        setCurrentState(existingConversation);

        // Restore preview if there was an image
        if (existingConversation.currentImageUrl) {
          onPreviewUpdate?.(existingConversation.currentImageUrl);
        } else {
          onPreviewUpdate?.(null);
        }
      } else {
        // Initialize new conversation
        const config = PRODUCT_CONFIGS[selectedProductId];
        if (config) {
          const newState: ConversationState = {
            messages: [
              {
                id: Date.now().toString(),
                role: "assistant",
                content: config.greeting,
                timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
              },
            ],
            isComplete: false,
            isRefining: false,
            currentImageUrl: null,
            originalImageSettings: {},
            lastGenerationParams: undefined,
          };
          setCurrentState(newState);
          onPreviewUpdate?.(null);
        }
      }
      initializedProductRef.current = selectedProductId;
    } else if (selectedProductId === null) {
      // Save current conversation before clearing
      if (initializedProductRef.current !== null) {
        conversationHistoryRef.current.set(initializedProductRef.current, currentState);
      }

      // Clear current view
      setCurrentState({
        messages: [],
        isComplete: false,
        isRefining: false,
        currentImageUrl: null,
        originalImageSettings: {},
        lastGenerationParams: undefined,
      });
      onPreviewUpdate?.(null);
      initializedProductRef.current = null;
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedProductId, onPreviewUpdate]);

  // Auto-save current conversation state whenever it changes
  useEffect(() => {
    if (selectedProductId !== null && currentState.messages.length > 0) {
      conversationHistoryRef.current.set(selectedProductId, currentState);
    }
  }, [currentState, selectedProductId]);

  const handleSendMessage = async (content: string, images?: File[]) => {
    if ((!content.trim() && (!images || images.length === 0)) || isLoading) return;

    // Handle refinement mode for Bilder
    if (currentState.isRefining && selectedProductId === 0 && currentState.currentImageUrl && content.trim()) {
      setIsLoading(true);

      const userMessage: Message = {
        id: Date.now().toString(),
        role: "user",
        content: content.trim(),
        timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      };
      setCurrentState((prev) => ({
        ...prev,
        messages: [...prev.messages, userMessage],
      }));

      // Add processing message
      setCurrentState((prev) => ({
        ...prev,
        messages: [
          ...prev.messages,
          {
            id: Date.now().toString(),
            role: "assistant",
            content: "Verstanden! Ich erstelle jetzt eine überarbeitete Version des Bildes. Dies kann bis zu 3 Minuten dauern...",
            timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
          },
        ],
      }));

      // Send refinement request to edit webhook with original settings
      const refinementPayload = {
        productId: 0,
        prompt: content.trim(),
        isEditing: true, // Flag to use the edit webhook
        imageUrl: currentState.currentImageUrl, // Single image URL string for editing
        aspectRatio: currentState.originalImageSettings.aspectRatio || "16:9",
        resolution: currentState.originalImageSettings.resolution || "2K",
        outputFormat: currentState.originalImageSettings.outputFormat || "jpg",
      };

      try {
        const response = await fetch("/api/webhook", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(refinementPayload),
        });

        if (!response.ok) {
          throw new Error("Refinement request failed");
        }

        const result = await response.json();

        if (result.imageUrl) {
          onPreviewUpdate?.(result.imageUrl);
          setCurrentState((prev) => ({
            ...prev,
            currentImageUrl: result.imageUrl,
            messages: [
              ...prev.messages,
              {
                id: Date.now().toString(),
                role: "assistant",
                content: "Das überarbeitete Bild ist fertig! Ist das besser, oder möchtest du weitere Änderungen vornehmen?",
                timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
              },
            ],
          }));
        }
      } catch (error: any) {
        setCurrentState((prev) => ({
          ...prev,
          messages: [
            ...prev.messages,
            {
              id: Date.now().toString(),
              role: "assistant",
              content: `Es gab einen Fehler bei der Überarbeitung: ${error.message}`,
              timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
            },
          ],
        }));
      } finally {
        setIsLoading(false);
      }
      return;
    }

    // Don't process new conversations if complete (but refinement mode is allowed above)
    if (currentState.isComplete) return;

    setIsLoading(true);

    // Upload images to Supabase storage if provided
    let imageUrls: string[] = [];
    if (images && images.length > 0) {
      try {
        const { supabaseBrowserClient } = await import("@/lib/supabaseClient");

        for (const image of images) {
          const fileExt = image.name.split(".").pop();
          const timestamp = Date.now();
          const datePrefix = new Date().toISOString().split('T')[0]; // YYYY-MM-DD format
          const randomId = Math.random().toString(36).substring(7);
          const fileName = `${datePrefix}-${timestamp}-${randomId}.${fileExt}`;

          // Use 'temporary' bucket for all uploads - determine folder based on product
          const bucket = "temporary";
          const folder = selectedProductId === 2 ? "product-videos" : selectedProductId === 0 ? "bilder" : "chat-images";
          const filePath = `${folder}/${fileName}`;

          console.log("Uploading to:", { bucket, filePath, productId: selectedProductId });

          const { data, error } = await supabaseBrowserClient.storage
            .from(bucket)
            .upload(filePath, image);

          if (error) {
            console.error("Image upload error:", error);
            console.error("Upload details:", { bucket, filePath, errorMessage: error.message });
            throw new Error(`Failed to upload image: ${error.message}`);
          }

          console.log("Upload successful:", data);

          // Get public URL
          const { data: urlData } = supabaseBrowserClient.storage
            .from(bucket)
            .getPublicUrl(filePath);

          console.log("Generated public URL:", urlData.publicUrl);
          imageUrls.push(urlData.publicUrl);
        }
      } catch (error: any) {
        console.error("Error uploading images:", error);
        setIsLoading(false);
        setCurrentState((prev) => ({
          ...prev,
          messages: [
            ...prev.messages,
            {
              id: Date.now().toString(),
              role: "assistant",
              content: `Entschuldigung, es gab einen Fehler beim Hochladen deiner Bilder: ${error.message}`,
              timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
              status: "error",
            },
          ],
        }));
        return;
      }
    }

    const userMessage: Message = {
      id: Date.now().toString(),
      role: "user",
      content: content.trim(),
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      imageUrls: imageUrls.length > 0 ? imageUrls : undefined,
    };

    setCurrentState((prev) => ({
      ...prev,
      messages: [...prev.messages, userMessage],
    }));

    // Add a placeholder for assistant response
    const assistantMessageId = (Date.now() + 1).toString();
    const assistantMessage: Message = {
      id: assistantMessageId,
      role: "assistant",
      content: "",
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      status: "sending",
    };
    setCurrentState((prev) => ({
      ...prev,
      messages: [...prev.messages, assistantMessage],
    }));

    try {
      const conversation = [...currentState.messages, userMessage].map((msg) => {
        // Include image URLs in the message content for the AI to know about them
        let messageContent = msg.content;
        if (msg.imageUrls && msg.imageUrls.length > 0) {
          messageContent += `\n\n[Hochgeladene Bilder: ${msg.imageUrls.join(', ')}]`;
        }
        return {
          role: msg.role,
          content: messageContent,
        };
      });

      const response = await fetch("/api/assistant", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          messages: conversation,
          productId: selectedProductId,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to get assistant response");
      }

      // Handle streaming response
      const reader = response.body?.getReader();
      const decoder = new TextDecoder();
      let streamedContent = "";

      if (!reader) {
        throw new Error("Response body is not readable");
      }

      // Remove "sending" status once streaming starts
      setCurrentState((prev) => ({
        ...prev,
        messages: prev.messages.map((msg) =>
          msg.id === assistantMessageId
            ? { ...msg, status: undefined }
            : msg
        ),
      }));

      while (true) {
        const { done, value } = await reader.read();

        if (done) break;

        // Decode the chunk
        const chunk = decoder.decode(value, { stream: true });

        // Parse SSE format (data: {...}\n\n)
        const lines = chunk.split("\n");

        for (const line of lines) {
          if (line.startsWith("data: ")) {
            try {
              const jsonData = JSON.parse(line.slice(6));

              if (jsonData.error) {
                throw new Error(jsonData.error);
              }

              // Handle completion event
              if (jsonData.done) {
                // If payload is detected, don't show the JSON in chat
                if (jsonData.hasPayload && jsonData.payload) {
                  // Remove the JSON payload message from chat
                  setCurrentState((prev) => ({
                    ...prev,
                    messages: prev.messages.filter((msg) => msg.id !== assistantMessageId),
                  }));

                  // Send to webhook
                  // Note: sendToWebhook will handle isComplete state based on product type
                  await sendToWebhook(jsonData.payload);
                } else {
                  // Final update with full message (for non-payload messages)
                  setCurrentState((prev) => ({
                    ...prev,
                    messages: prev.messages.map((msg) =>
                      msg.id === assistantMessageId
                        ? {
                            ...msg,
                            content: jsonData.fullMessage,
                            status: undefined,
                          }
                        : msg
                    ),
                  }));
                }
              } else if (jsonData.content) {
                // Stream content chunk
                streamedContent += jsonData.content;

                // Update message with accumulated content
                setCurrentState((prev) => ({
                  ...prev,
                  messages: prev.messages.map((msg) =>
                    msg.id === assistantMessageId
                      ? {
                          ...msg,
                          content: streamedContent,
                        }
                      : msg
                  ),
                }));
              }
            } catch (parseError) {
              console.error("Failed to parse SSE data:", parseError);
            }
          }
        }
      }
    } catch (error: any) {
      setCurrentState((prev) => ({
        ...prev,
        messages: prev.messages.map((msg) =>
          msg.id === assistantMessageId
            ? {
                ...msg,
                content: `Entschuldigung, es ist ein Fehler aufgetreten: ${error.message}`,
                status: "error",
              }
            : msg
        ),
      }));
    } finally {
      setIsLoading(false);
    }
  };

  // Helper function to handle product video URL analysis flow
  const handleProductVideoUrlFlow = async (productUrl: string) => {
    try {
      // Show loading message
      setCurrentState((prev) => ({
        ...prev,
        messages: [
          ...prev.messages,
          {
            id: Date.now().toString(),
            role: "assistant",
            content: "Analysiere deine Produktseite... Dies kann einen Moment dauern.",
            timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
          },
        ],
      }));

      // Get user_id from auth
      const { data: userData } = await supabaseBrowserClient.auth.getUser();
      if (!userData?.user) {
        throw new Error("Nicht angemeldet");
      }

      // Get business_id from database
      const { getUserBusiness } = await import("@/lib/database");
      const business = await getUserBusiness(userData.user.id);
      if (!business) {
        throw new Error("Kein Business gefunden. Bitte erstelle zuerst dein Business-Profil.");
      }

      // Call product data analysis webhook
      console.log("Calling product-data webhook with:", {
        user_id: userData.user.id,
        business_id: business.id,
        product_url: productUrl,
      });

      const response = await fetch("/api/webhook/product-data", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          user_id: userData.user.id,
          business_id: business.id,
          product_url: productUrl,
        }),
      });

      console.log("Product-data webhook response status:", response.status);

      if (!response.ok) {
        let errorData;
        try {
          errorData = await response.json();
        } catch (e) {
          errorData = { error: `HTTP ${response.status}: ${response.statusText}` };
        }
        console.error("Product-data webhook error:", errorData);
        throw new Error(errorData.error || "Produkt-Analyse fehlgeschlagen");
      }

      // Wait a moment for n8n to process and save to database
      await new Promise(resolve => setTimeout(resolve, 3000));

      // Get the latest product with video concepts
      const { getLatestBusinessProduct } = await import("@/lib/database");
      const product = await getLatestBusinessProduct(business.id);

      if (!product || (!product.video_concept_1 && !product.video_concept_2 && !product.video_concept_3)) {
        throw new Error("Keine Videoideen generiert. Bitte versuche es mit einer anderen URL.");
      }

      // Collect video concepts from the three separate fields
      const videoIdeas = [
        product.video_concept_1,
        product.video_concept_2,
        product.video_concept_3,
      ].filter(concept => concept !== null);

      if (videoIdeas.length === 0) {
        throw new Error("Keine Videoideen generiert. Bitte versuche es mit einer anderen URL.");
      }

      // Display video ideas to user
      const videoIdeasText = videoIdeas.map((idea: any, index: number) =>
        `**${index + 1}. ${idea.title || 'Video Konzept'}**\n${idea.prompt || idea.description || ''}\n`
      ).join("\n");

      // Extract product images
      const productImages = product.product_images;
      let imageUrls: string[] = [];
      if (Array.isArray(productImages)) {
        imageUrls = productImages;
      } else if (productImages && typeof productImages === 'object') {
        imageUrls = Object.values(productImages).filter(val => typeof val === 'string') as string[];
      }

      setCurrentState((prev) => ({
        ...prev,
        messages: [
          ...prev.messages,
          {
            id: Date.now().toString(),
            role: "assistant",
            content: `Perfekt! Ich habe deine Produktseite analysiert. Hier sind ${videoIdeas.length} Videoideen:\n\n${videoIdeasText}\n\nWelche Idee möchtest du verwenden? Antworte einfach mit der Nummer (1, 2${videoIdeas.length > 2 ? ' oder 3' : ''}).`,
            timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
          },
        ],
        // Store product ID and video ideas in state for later use
        lastGenerationParams: {
          productId: product.id,
          videoIdeas,
          productImages: imageUrls,
        },
      }));

    } catch (error: any) {
      console.error("Error in handleProductVideoUrlFlow:", error);
      setCurrentState((prev) => ({
        ...prev,
        messages: [
          ...prev.messages,
          {
            id: Date.now().toString(),
            role: "assistant",
            content: `Fehler bei der Produkt-Analyse: ${error.message}`,
            timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
          },
        ],
      }));
    } finally {
      setIsLoading(false);
    }
  };

  // Helper function to handle video generation
  const handleVideoGeneration = async (payload: any) => {
    try {
      // Show loading message
      setCurrentState((prev) => ({
        ...prev,
        messages: [
          ...prev.messages,
          {
            id: Date.now().toString(),
            role: "assistant",
            content: "Erstelle dein Video... Dies kann bis zu 5 Minuten dauern.",
            timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
          },
        ],
      }));

      // Get user_id from auth
      const { data: userData } = await supabaseBrowserClient.auth.getUser();
      if (!userData?.user) {
        throw new Error("Nicht angemeldet");
      }

      // Get business_id from database
      const { getUserBusiness } = await import("@/lib/database");
      const business = await getUserBusiness(userData.user.id);
      if (!business) {
        throw new Error("Kein Business gefunden");
      }

      // Call video generation webhook
      const response = await fetch("/api/webhook/video-generation", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          user_id: userData.user.id,
          business_id: business.id,
          product_id: payload.product_id || null,
          prompt: payload.prompt,
          images: payload.images || [],
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Video-Erstellung fehlgeschlagen");
      }

      const result = await response.json();

      // Show video in preview
      if (result.videoUrl) {
        onPreviewUpdate?.(result.videoUrl);
      }

      // Mark conversation as complete
      setCurrentState((prev) => ({
        ...prev,
        isComplete: true,
        messages: [
          ...prev.messages,
          {
            id: Date.now().toString(),
            role: "assistant",
            content: "Dein Video wurde erfolgreich erstellt! Du kannst es jetzt in der Vorschau sehen.",
            timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
          },
        ],
      }));

    } catch (error: any) {
      console.error("Error in handleVideoGeneration:", error);
      setCurrentState((prev) => ({
        ...prev,
        messages: [
          ...prev.messages,
          {
            id: Date.now().toString(),
            role: "assistant",
            content: `Fehler bei der Video-Erstellung: ${error.message}`,
            timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
          },
        ],
      }));
    } finally {
      setIsLoading(false);
    }
  };

  const sendToWebhook = async (payload: any) => {
    try {
      // ===== PRODUCT VIDEO URL FLOW =====
      if (selectedProductId === 2 && payload.flow === "url") {
        await handleProductVideoUrlFlow(payload.product_url);
        return;
      }

      // ===== PRODUCT VIDEO CONFIRMATION FLOW =====
      if (selectedProductId === 2 && payload.flow === "url_confirmed") {
        await handleVideoGeneration(payload);
        return;
      }

      // ===== PRODUCT VIDEO MANUAL FLOW =====
      if (selectedProductId === 2 && payload.flow === "manual") {
        await handleVideoGeneration({
          ...payload,
          images: payload.imageUrls,
        });
        return;
      }

      // Add a waiting message for Bilder
      if (selectedProductId === 0) {
        setCurrentState((prev) => ({
          ...prev,
          messages: [
            ...prev.messages,
            {
              id: Date.now().toString(),
              role: "assistant",
              content: "Perfekt! Ich erstelle jetzt dein Bild. Dies kann bis zu 4 Minuten dauern...",
              timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
            },
          ],
        }));
      }

      console.log("Sending payload to webhook:", { ...payload, productId: selectedProductId });

      const response = await fetch("/api/webhook", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ ...payload, productId: selectedProductId }),
      });

      console.log("Webhook API response status:", response.status, response.statusText);

      if (!response.ok) {
        let errorMessage = "Webhook request failed";
        try {
          const errorData = await response.json();
          errorMessage = errorData.error || `HTTP ${response.status}: ${response.statusText}`;
        } catch (e) {
          errorMessage = `HTTP ${response.status}: ${response.statusText}`;
        }
        console.error("Webhook request failed:", errorMessage);
        throw new Error(errorMessage);
      }

      const result = await response.json();

      // For Bilder, show the image in preview
      if (selectedProductId === 0 && result.imageUrl) {
        onPreviewUpdate?.(result.imageUrl);

        // Store generation params for saving to gallery
        const generationParams = {
          prompt: payload.prompt,
          aspectRatio: payload.aspectRatio,
          resolution: payload.resolution,
          outputFormat: payload.outputFormat,
          hasReferenceImages: payload.hasReferenceImages,
          imageUrls: payload.imageUrls,
        };

        // Notify parent about generation params
        onGenerationParamsUpdate?.(generationParams);

        setCurrentState((prev) => ({
          ...prev,
          currentImageUrl: result.imageUrl,
          originalImageSettings: {
            aspectRatio: payload.aspectRatio,
            resolution: payload.resolution,
            outputFormat: payload.outputFormat,
          },
          lastGenerationParams: generationParams,
          isComplete: false, // Allow further refinement
          isRefining: true, // Enable refinement mode
          messages: [
            ...prev.messages,
            {
              id: Date.now().toString(),
              role: "assistant",
              content: "Dein Bild wurde erfolgreich erstellt! Du kannst es jetzt in der Vorschau sehen.\n\nMöchtest du etwas an diesem Bild ändern? Beschreibe einfach, was du anders haben möchtest, und ich erstelle eine überarbeitete Version für dich.",
              timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
            },
          ],
        }));
        setIsLoading(false); // Re-enable input for refinements
      } else {
        // For other products - mark as complete
        setCurrentState((prev) => ({
          ...prev,
          isComplete: true,
          messages: [
            ...prev.messages,
            {
              id: Date.now().toString(),
              role: "assistant",
              content: "Perfekt! Dein Content-Paket wurde erfolgreich versendet. Das Gespräch ist jetzt abgeschlossen.",
              timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
            },
          ],
        }));
      }
    } catch (error: any) {
      console.error("Webhook error details:", {
        message: error.message,
        stack: error.stack,
        productId: selectedProductId,
        timestamp: new Date().toISOString(),
      });

      // Provide more helpful error messages based on error type
      let userMessage = `Es gab einen Fehler beim Versenden: ${error.message}`;

      if (error.message.includes("404") || error.message.includes("Not found")) {
        userMessage = `Der Webhook-Endpunkt wurde nicht gefunden (404). Bitte überprüfe die n8n Webhook-URL in der Konfiguration.`;
      } else if (error.message.includes("timeout") || error.message.includes("aborted")) {
        userMessage = `Die Anfrage hat zu lange gedauert (Timeout nach 4 Minuten). Bitte versuche es erneut.`;
      } else if (error.message.includes("NetworkError") || error.message.includes("Failed to fetch")) {
        userMessage = `Netzwerkfehler: Kann keine Verbindung zum Webhook-Server herstellen. Bitte überprüfe deine Internetverbindung.`;
      }

      setCurrentState((prev) => ({
        ...prev,
        messages: [
          ...prev.messages,
          {
            id: Date.now().toString(),
            role: "assistant",
            content: userMessage + `\n\n🔍 Technische Details (für Entwickler): ${error.message}`,
            timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
          },
        ],
      }));
    }
  };

  return (
    <div className="flex flex-col h-full bg-white dark:bg-gray-900">
      <ChatMessages messages={currentState.messages} />
      <ChatInput onSendMessage={handleSendMessage} disabled={isLoading || (currentState.isComplete && !currentState.isRefining)} />
    </div>
  );
}


