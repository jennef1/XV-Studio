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
    productImages?: string[];
  };
  selectedVideoImages?: string[];
  // Social Media Campaign state
  campaignState?: {
    type: "product" | "concept" | "political" | null;
    selectedProduct: any | null;
    selectedImage: string | null;
    generatedImages: string[];
    isGenerating: boolean;
    isEditingImage: boolean;
    editingImageIndex: number | null;
  };
  // Bilder workflow state
  bilderWorkflowState?: {
    workflow: "product" | "combine" | "freebird" | null;
    selectedProduct: any | null;
    selectedProductImages: string[];
  };
  // Video workflow state
  videoWorkflowState?: {
    workflow: "social-booster" | "inspirational" | "ai-explains" | null;
    subWorkflow?: "product-rotation" | "user-speaks" | "image-to-video" | "political-campaign";
    selectedProduct: any | null;
    selectedImage: string | null;
    scenarioDescription: string | null;
    personDescription: string | null; // Used to store the prompt for ai-explains
    actionDescription: string | null;
    waitingFor: "product" | "image" | "prompt" | null;
  };
  // Generation state for loading indicator
  generationState?: {
    isGenerating: boolean;
    type: "image" | "video" | null;
    message?: string;
  };
}

interface ChatContainerProps {
  selectedProductId: number | null;
  onPreviewUpdate?: (imageUrl: string | null) => void;
  onGenerationParamsUpdate?: (params: any) => void;
  onCampaignImageEditRequest?: (imageUrl: string, editPrompt: string) => void;
}

const PRODUCT_CONFIGS: Record<number, { name: string; greeting: string }> = {
  0: {
    name: "Bilder",
    greeting: "Hallo! Ich helfe dir dabei, grossartige Marketingbilder für dein Geschäft zu erstellen.\n\nWähle aus, wie du vorgehen möchtest:\n\n[BILDER_WORKFLOW_SELECTOR]",
  },
  1: {
    name: "Social Media Boost",
    greeting: "Hey! Ich helfe dir dabei, professionelle Social Media Kampagnen zu erstellen.\n\nWähle aus, wie du vorgehen möchtest:\n\n[CAMPAIGN_TYPE_SELECTOR]",
  },
  2: {
    name: "Video",
    greeting: "Hallo! Ich helfe dir dabei, professionelle Videos zu erstellen.\n\n**Wähle aus, was du erstellen möchtest:**\n\n[VIDEO_WORKFLOW_SELECTOR]",
  },
};

export default function ChatContainer({ selectedProductId, onPreviewUpdate, onGenerationParamsUpdate, onCampaignImageEditRequest }: ChatContainerProps) {
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
    selectedVideoImages: [],
    campaignState: {
      type: null,
      selectedProduct: null,
      selectedImage: null,
      generatedImages: [],
      isGenerating: false,
      isEditingImage: false,
      editingImageIndex: null,
    },
    bilderWorkflowState: {
      workflow: null,
      selectedProduct: null,
      selectedProductImages: [],
    },
    videoWorkflowState: {
      workflow: null,
      selectedProduct: null,
      selectedImage: null,
      scenarioDescription: null,
      personDescription: null,
      actionDescription: null,
      waitingFor: null,
    },
    generationState: {
      isGenerating: false,
      type: null,
      message: undefined,
    },
  });

  // Transient UI state (not persisted)
  const [isLoading, setIsLoading] = useState(false);

  // Save/restore conversation when product is selected or switched
  useEffect(() => {
    if (selectedProductId !== null && selectedProductId !== initializedProductRef.current) {
      // Save previous conversation before switching
      if (initializedProductRef.current !== null) {
        console.log(`[CONVERSATION] Saving conversation for product ${initializedProductRef.current}, messages: ${currentState.messages.length}`);
        conversationHistoryRef.current.set(initializedProductRef.current, currentState);
      }

      // Check if we have existing conversation for this product
      const existingConversation = conversationHistoryRef.current.get(selectedProductId);
      console.log(`[CONVERSATION] Switching to product ${selectedProductId}, found existing: ${!!existingConversation}, messages: ${existingConversation?.messages.length ?? 0}`);

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
          // All products - just show greeting with workflow selector
          // Products will be shown AFTER workflow selection
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
            selectedVideoImages: [],
            campaignState: {
              type: null,
              selectedProduct: null,
              selectedImage: null,
              generatedImages: [],
              isGenerating: false,
              isEditingImage: false,
              editingImageIndex: null,
            },
            bilderWorkflowState: {
              workflow: null,
              selectedProduct: null,
              selectedProductImages: [],
            },
            videoWorkflowState: {
              workflow: null,
              selectedProduct: null,
              selectedImage: null,
              scenarioDescription: null,
              personDescription: null,
              actionDescription: null,
              waitingFor: null,
            },
          };
          setCurrentState(newState);
          onPreviewUpdate?.(null);
        }
      }
      initializedProductRef.current = selectedProductId;
    } else if (selectedProductId === null) {
      // Save current conversation before clearing
      if (initializedProductRef.current !== null) {
        console.log(`[CONVERSATION] Navigating away, saving conversation for product ${initializedProductRef.current}, messages: ${currentState.messages.length}`);
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
        selectedVideoImages: [],
        campaignState: {
          type: null,
          selectedProduct: null,
          selectedImage: null,
          generatedImages: [],
          isGenerating: false,
          isEditingImage: false,
          editingImageIndex: null,
        },
        bilderWorkflowState: {
          workflow: null,
          selectedProduct: null,
          selectedProductImages: [],
        },
        videoWorkflowState: {
          workflow: null,
          selectedProduct: null,
          selectedImage: null,
          scenarioDescription: null,
          personDescription: null,
          actionDescription: null,
          waitingFor: null,
        },
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

  // Initialize with embedded products in greeting (for Bilder and Product Video)
  const initializeWithProducts = async (baseGreeting: string, productId: number) => {
    try {
      // Get user_id from auth
      const { data: userData } = await supabaseBrowserClient.auth.getUser();

      let greetingContent = baseGreeting;

      if (userData?.user) {
        let products;

        if (productId === 2) {
          // For Product Video: only products with video concepts
          const { getUserBusinessProducts } = await import("@/lib/database");
          products = await getUserBusinessProducts(userData.user.id);
        } else if (productId === 0) {
          // For Bilder: ALL products with images
          const { data, error } = await supabaseBrowserClient
            .from("business_products")
            .select("*")
            .eq("user_id", userData.user.id)
            .not("product_images", "is", null)
            .order("created_at", { ascending: false });

          if (!error && data) {
            products = data;
          }
        }

        // If products exist, embed them in the greeting
        if (products && products.length > 0) {
          const productData = products.map(p => ({
            id: p.id,
            product_name: p.product_name,
            product_description: p.product_description,
            product_images: p.product_images
          }));

          greetingContent = `${baseGreeting}\n\n[PRODUCT_SELECTION:${JSON.stringify(productData)}]`;
        }
      }

      // Create new state with greeting (with or without products)
      const newState: ConversationState = {
        messages: [
          {
            id: Date.now().toString(),
            role: "assistant",
            content: greetingContent,
            timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
          },
        ],
        isComplete: false,
        isRefining: false,
        currentImageUrl: null,
        originalImageSettings: {},
        lastGenerationParams: undefined,
        selectedVideoImages: [],
        campaignState: {
          type: null,
          selectedProduct: null,
          selectedImage: null,
          generatedImages: [],
          isGenerating: false,
          isEditingImage: false,
          editingImageIndex: null,
        },
        bilderWorkflowState: {
          workflow: null,
          selectedProduct: null,
          selectedProductImages: [],
        },
        videoWorkflowState: {
          workflow: null,
          selectedProduct: null,
          selectedImage: null,
          scenarioDescription: null,
          personDescription: null,
          actionDescription: null,
          waitingFor: null,
        },
      };

      setCurrentState(newState);
      onPreviewUpdate?.(null);

    } catch (error) {
      console.error("Error initializing with products:", error);

      // Fallback: show greeting without products
      const newState: ConversationState = {
        messages: [
          {
            id: Date.now().toString(),
            role: "assistant",
            content: baseGreeting,
            timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
          },
        ],
        isComplete: false,
        isRefining: false,
        currentImageUrl: null,
        originalImageSettings: {},
        lastGenerationParams: undefined,
        selectedVideoImages: [],
        campaignState: {
          type: null,
          selectedProduct: null,
          selectedImage: null,
          generatedImages: [],
          isGenerating: false,
          isEditingImage: false,
          editingImageIndex: null,
        },
        bilderWorkflowState: {
          workflow: null,
          selectedProduct: null,
          selectedProductImages: [],
        },
        videoWorkflowState: {
          workflow: null,
          selectedProduct: null,
          selectedImage: null,
          scenarioDescription: null,
          personDescription: null,
          actionDescription: null,
          waitingFor: null,
        },
      };

      setCurrentState(newState);
      onPreviewUpdate?.(null);
    }
  };

  const handleSendMessage = async (content: string, images?: File[]) => {
    if ((!content.trim() && (!images || images.length === 0)) || isLoading) return;

    // Handle AI Explains Video workflow input collection
    if (selectedProductId === 2 && currentState.videoWorkflowState?.workflow === "ai-explains") {
      if (currentState.videoWorkflowState.waitingFor === "prompt" && content.trim()) {
        // User provided the combined prompt - start video generation
        const userMessage: Message = {
          id: Date.now().toString(),
          role: "user",
          content: content.trim(),
          timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
        };

        const prompt = content.trim();

        setCurrentState(prev => ({
          ...prev,
          videoWorkflowState: {
            ...prev.videoWorkflowState!,
            personDescription: prompt, // Store in personDescription for now
            waitingFor: null,
          },
          messages: [...prev.messages, userMessage],
        }));

        // Trigger video generation with the prompt
        setIsLoading(true);
        await handleAiExplainsVideoGeneration(prompt);
        return;
      }
    }

    // Handle Product Rotation workflow input collection
    if (selectedProductId === 2 && currentState.videoWorkflowState?.subWorkflow === "product-rotation") {
      if (currentState.videoWorkflowState.waitingFor === "prompt" && content.trim()) {
        // User provided the style prompt - start video generation
        const userMessage: Message = {
          id: Date.now().toString(),
          role: "user",
          content: content.trim(),
          timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
        };

        const prompt = content.trim();

        setCurrentState(prev => ({
          ...prev,
          videoWorkflowState: {
            ...prev.videoWorkflowState!,
            personDescription: prompt, // Store the style description
            waitingFor: null,
          },
          messages: [...prev.messages, userMessage],
        }));

        // Trigger video generation with the prompt
        setIsLoading(true);
        await handleProductRotationVideoGeneration(prompt);
        return;
      }
    }

    // Handle User Speaks video workflow prompt collection
    if (selectedProductId === 2 && currentState.videoWorkflowState?.subWorkflow === "user-speaks") {
      if (currentState.videoWorkflowState.waitingFor === "prompt" && content.trim()) {
        // User provided the person/scenario description - start video generation
        const userMessage: Message = {
          id: Date.now().toString(),
          role: "user",
          content: content.trim(),
          timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
        };

        const prompt = content.trim();

        setCurrentState(prev => ({
          ...prev,
          videoWorkflowState: {
            ...prev.videoWorkflowState!,
            personDescription: prompt, // Store the person description
            waitingFor: null,
          },
          messages: [...prev.messages, userMessage],
        }));

        // Trigger video generation with the prompt
        setIsLoading(true);
        await handleUserSpeaksVideoGeneration(prompt);
        return;
      }
    }

    // Handle Image to Video workflow prompt collection
    if (selectedProductId === 2 && currentState.videoWorkflowState?.subWorkflow === "image-to-video") {
      if (currentState.videoWorkflowState.waitingFor === "prompt" && content.trim()) {
        // User provided the video description - start video generation
        const userMessage: Message = {
          id: Date.now().toString(),
          role: "user",
          content: content.trim(),
          timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
        };

        const prompt = content.trim();

        setCurrentState(prev => ({
          ...prev,
          videoWorkflowState: {
            ...prev.videoWorkflowState!,
            videoPrompt: prompt,
            waitingFor: null,
          },
          messages: [...prev.messages, userMessage],
        }));

        // Trigger video generation with the prompt
        setIsLoading(true);
        await handleImageToVideoGeneration(prompt);
        return;
      }
    }

    // Handle Social Media Campaign generation trigger
    if (
      selectedProductId === 1 &&
      currentState.campaignState?.selectedImage &&
      !currentState.campaignState?.generatedImages.length &&
      content.trim()
    ) {
      const triggerWords = ["generieren", "los geht", "los gehts", "start", "erstellen"];
      const isTrigger = triggerWords.some(word => content.trim().toLowerCase().includes(word));

      if (isTrigger) {
        // User wants to generate campaign
        await handleCampaignGeneration(content.trim());
        return;
      } else {
        // User is providing additional comments
        await handleCampaignGeneration(content.trim());
        return;
      }
    }

    // Handle Bilder combine workflow - direct generation with uploaded images
    if (
      selectedProductId === 0 &&
      currentState.bilderWorkflowState?.workflow === "combine" &&
      images && images.length > 0 &&
      content.trim() &&
      !currentState.isComplete
    ) {
      console.log("[BILDER COMBINE DEBUG] ✅ Combine workflow triggered! Uploading images and generating directly");

      setIsLoading(true);

      // Upload images first
      let uploadedImageUrls: string[] = [];
      try {
        const { supabaseBrowserClient } = await import("@/lib/supabaseClient");

        for (const image of images) {
          const fileExt = image.name.split(".").pop();
          const timestamp = Date.now();
          const datePrefix = new Date().toISOString().split('T')[0];
          const randomId = Math.random().toString(36).substring(7);
          const fileName = `${datePrefix}-${timestamp}-${randomId}.${fileExt}`;
          const bucket = "temporary";
          const folder = "bilder";
          const filePath = `${folder}/${fileName}`;

          const { data, error } = await supabaseBrowserClient.storage
            .from(bucket)
            .upload(filePath, image);

          if (error) {
            throw new Error(`Failed to upload image: ${error.message}`);
          }

          const { data: urlData } = supabaseBrowserClient.storage
            .from(bucket)
            .getPublicUrl(filePath);

          uploadedImageUrls.push(urlData.publicUrl);
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

      const userMessage: Message = {
        id: Date.now().toString(),
        role: "user",
        content: content.trim(),
        timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
        imageUrls: uploadedImageUrls,
      };

      setCurrentState((prev) => ({
        ...prev,
        messages: [
          ...prev.messages,
          userMessage,
          {
            id: (Date.now() + 1).toString(),
            role: "assistant",
            content: "Perfekt! Ich kombiniere deine Bilder jetzt...",
            timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
          },
        ],
        generationState: {
          isGenerating: true,
          type: "image",
          message: "Kombiniertes Bild wird erstellt",
        },
      }));

      // Generate combined image with standard settings
      const payload = {
        productId: 0,
        prompt: content.trim(),
        aspectRatio: "16:9",
        resolution: "2K",
        outputFormat: "jpg",
        hasReferenceImages: true,
        imageUrls: uploadedImageUrls,
      };

      try {
        const response = await fetch("/api/webhook", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(payload),
        });

        if (!response.ok) {
          throw new Error("Image generation request failed");
        }

        const result = await response.json();

        if (result.imageUrl) {
          onPreviewUpdate?.(result.imageUrl);

          onGenerationParamsUpdate?.({
            isCampaignImage: true,
            imageUrl: result.imageUrl,
            prompt: content.trim(),
            workflow: 'bilder_combine',
            aspectRatio: "16:9",
            resolution: "2K",
            outputFormat: "jpg",
            hasReferenceImages: true,
            imageUrls: uploadedImageUrls,
            onEdit: (editPrompt: string) => {
              handleBilderImageEdit(result.imageUrl, editPrompt);
            },
          });

          setCurrentState((prev) => ({
            ...prev,
            currentImageUrl: result.imageUrl,
            isRefining: true,
            originalImageSettings: {
              aspectRatio: "16:9",
              resolution: "2K",
              outputFormat: "jpg",
            },
            lastGenerationParams: {
              prompt: content.trim(),
              aspectRatio: "16:9",
              resolution: "2K",
              outputFormat: "jpg",
              hasReferenceImages: true,
              imageUrls: uploadedImageUrls,
            },
            generationState: {
              isGenerating: false,
              type: null,
              message: undefined,
            },
            messages: [
              ...prev.messages,
              {
                id: Date.now().toString(),
                role: "assistant",
                content: "Dein kombiniertes Bild ist fertig! Schau es dir im Vorschau-Bereich an. Möchtest du Änderungen vornehmen? Beschreibe einfach, was ich anpassen soll.",
                timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
              },
            ],
          }));
        }
      } catch (error: any) {
        console.error("Error generating combined image:", error);
        setCurrentState((prev) => ({
          ...prev,
          generationState: {
            isGenerating: false,
            type: null,
            message: undefined,
          },
          messages: [
            ...prev.messages,
            {
              id: Date.now().toString(),
              role: "assistant",
              content: `Es gab einen Fehler bei der Bildgenerierung: ${error.message}`,
              timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
              status: "error" as const,
            },
          ],
        }));
      } finally {
        setIsLoading(false);
      }
      return;
    }

    // Handle Bilder product workflow - direct generation with standard settings
    console.log("[BILDER DEBUG] Checking shortcut condition:", {
      selectedProductId,
      workflow: currentState.bilderWorkflowState?.workflow,
      hasSelectedImages: (currentState.bilderWorkflowState?.selectedProductImages?.length ?? 0) > 0,
      selectedImagesCount: currentState.bilderWorkflowState?.selectedProductImages?.length ?? 0,
      hasContent: !!content.trim(),
      isComplete: currentState.isComplete,
    });

    if (
      selectedProductId === 0 &&
      currentState.bilderWorkflowState?.workflow === "product" &&
      currentState.bilderWorkflowState?.selectedProductImages?.length > 0 &&
      content.trim() &&
      !currentState.isComplete
    ) {
      console.log("[BILDER DEBUG] ✅ Shortcut triggered! Bypassing AI, using standard settings");
      console.log("[BILDER DEBUG] Selected images to send:", currentState.bilderWorkflowState?.selectedProductImages);

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
        generationState: {
          isGenerating: true,
          type: "image",
          message: "Marketingbild wird erstellt",
        },
      }));

      // Use standard settings for product-based workflow
      const payload = {
        productId: 0,
        prompt: content.trim(),
        aspectRatio: "16:9", // Standard setting
        resolution: "2K", // Standard setting
        outputFormat: "jpg", // Standard setting
        hasReferenceImages: true,
        imageUrls: currentState.bilderWorkflowState!.selectedProductImages,
      };

      try {
        const response = await fetch("/api/webhook", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(payload),
        });

        if (!response.ok) {
          throw new Error("Image generation request failed");
        }

        const result = await response.json();

        if (result.imageUrl) {
          // Update preview with generated image
          onPreviewUpdate?.(result.imageUrl);

          // Store generation params for potential refinement
          onGenerationParamsUpdate?.({
            isCampaignImage: true,
            imageUrl: result.imageUrl,
            prompt: content.trim(),
            workflow: 'bilder_product',
            productId: currentState.bilderWorkflowState?.selectedProduct?.id,
            productCategory: currentState.bilderWorkflowState?.selectedProduct?.category,
            productName: currentState.bilderWorkflowState?.selectedProduct?.product_name,
            businessId: currentState.bilderWorkflowState?.selectedProduct?.business_id,
            aspectRatio: "16:9",
            resolution: "2K",
            outputFormat: "jpg",
            hasReferenceImages: true,
            imageUrls: currentState.bilderWorkflowState!.selectedProductImages,
            onEdit: (editPrompt: string) => {
              handleBilderImageEdit(result.imageUrl, editPrompt);
            },
          });

          setCurrentState((prev) => ({
            ...prev,
            currentImageUrl: result.imageUrl,
            isRefining: true, // Enable refinement mode
            originalImageSettings: {
              aspectRatio: "16:9",
              resolution: "2K",
              outputFormat: "jpg",
            },
            lastGenerationParams: {
              prompt: content.trim(),
              aspectRatio: "16:9",
              resolution: "2K",
              outputFormat: "jpg",
              hasReferenceImages: true,
              imageUrls: currentState.bilderWorkflowState!.selectedProductImages,
            },
            generationState: {
              isGenerating: false,
              type: null,
              message: undefined,
            },
            messages: [
              ...prev.messages,
              {
                id: Date.now().toString(),
                role: "assistant",
                content: "Dein Marketingbild ist fertig! Schau es dir im Vorschau-Bereich an. Möchtest du Änderungen vornehmen? Beschreibe einfach, was ich anpassen soll.",
                timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
              },
            ],
          }));
        }
      } catch (error: any) {
        console.error("Error generating image:", error);
        setCurrentState((prev) => ({
          ...prev,
          generationState: {
            isGenerating: false,
            type: null,
            message: undefined,
          },
          messages: [
            ...prev.messages,
            {
              id: Date.now().toString(),
              role: "assistant",
              content: `Es gab einen Fehler bei der Bildgenerierung: ${error.message}`,
              timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
              status: "error" as const,
            },
          ],
        }));
      } finally {
        setIsLoading(false);
      }
      return;
    }

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

      console.log("🔧 Sending refinement request with payload:", refinementPayload);
      console.log("🔧 isEditing flag:", refinementPayload.isEditing);

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

    console.log("[BILDER DEBUG] ❌ Fell through to AI assistant. State:", {
      selectedProductId,
      workflow: currentState.bilderWorkflowState?.workflow,
      selectedImages: currentState.bilderWorkflowState?.selectedProductImages,
    });

    try {
      const conversation = [...currentState.messages, userMessage].map((msg, index) => {
        // Include image URLs in the message content for the AI to know about them
        let messageContent = msg.content;
        if (msg.imageUrls && msg.imageUrls.length > 0) {
          messageContent += `\n\n[Hochgeladene Bilder: ${msg.imageUrls.join(', ')}]`;
        }

        // For Product Video: If this is the LAST user message (concept selection) and we have product images, inject them
        const isLastUserMessage = index === [...currentState.messages, userMessage].length - 1 && msg.role === 'user';
        if (selectedProductId === 2 && isLastUserMessage && currentState.lastGenerationParams?.productImages && currentState.lastGenerationParams.productImages.length > 0) {
          messageContent += `\n\n[Produktbilder: ${currentState.lastGenerationParams.productImages.join(', ')}]`;
        }

        // For Bilder Product Workflow: If user selected product images, inject them for AI to use
        if (selectedProductId === 0 && isLastUserMessage && currentState.bilderWorkflowState?.workflow === "product" && currentState.bilderWorkflowState?.selectedProductImages && currentState.bilderWorkflowState.selectedProductImages.length > 0) {
          messageContent += `\n\n[Hochgeladene Bilder: ${currentState.bilderWorkflowState.selectedProductImages.join(', ')}]`;
          console.log("[BILDER DEBUG] Injecting selected product images into AI conversation:", currentState.bilderWorkflowState.selectedProductImages);
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
        `**${index + 1}. ${idea.title || 'Video Konzept'}**\n${idea.video_prompt || idea.prompt || idea.description || ''}\n`
      ).join("\n");

      // Extract product images
      const productImages = product.product_images;
      let imageUrls: string[] = [];
      if (Array.isArray(productImages)) {
        imageUrls = productImages.filter((img): img is string => typeof img === 'string');
      } else if (productImages && typeof productImages === 'object') {
        imageUrls = Object.values(productImages).filter((val): val is string => typeof val === 'string');
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
          prompt: '', // Will be set when user selects a video idea
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

  // Helper function to display product images for Bilder flow
  const displayProductImagesForBilder = async (productId: string) => {
    try {
      setIsLoading(true);

      // Fetch the product
      const { data: product, error } = await supabaseBrowserClient
        .from("business_products")
        .select("*")
        .eq("id", productId)
        .single();

      if (error || !product) {
        throw new Error("Produkt nicht gefunden");
      }

      // Extract product images
      let imageUrls: string[] = [];
      const productImages = product.product_images;
      if (Array.isArray(productImages)) {
        imageUrls = productImages.filter((img): img is string => typeof img === 'string');
      } else if (productImages && typeof productImages === 'object') {
        imageUrls = Object.values(productImages).filter((val): val is string => typeof val === 'string');
      }

      if (imageUrls.length === 0) {
        throw new Error("Keine Bilder für dieses Produkt gefunden");
      }

      // Display product images for selection
      const imageUrlsText = `[Hochgeladene Bilder: ${imageUrls.join(", ")}]`;

      setCurrentState((prev) => ({
        ...prev,
        messages: [
          ...prev.messages,
          {
            id: Date.now().toString(),
            role: "assistant",
            content: `Perfekt! Hier sind die Bilder von **${product.product_name}**:\n\n${imageUrlsText}\n\nKlicke auf die Bilder, die du verwenden möchtest (bis zu 5 Bilder).\n\nBeschreibe dann, was für ein Bild du erstellen möchtest. Zum Beispiel: "Erstelle ein lebhaftes Social-Media-Bild mit meinem Produkt im Mittelpunkt auf einem modernen Hintergrund."`,
            timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
          },
        ],
      }));

    } catch (error: any) {
      console.error("Error displaying product images:", error);
      setCurrentState((prev) => ({
        ...prev,
        messages: [
          ...prev.messages,
          {
            id: Date.now().toString(),
            role: "assistant",
            content: "Es gab einen Fehler beim Laden der Produktbilder. Bitte versuche es erneut.",
            timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
            status: "error" as const,
          },
        ],
      }));
    } finally {
      setIsLoading(false);
    }
  };

  // Helper function to display video concepts for selected product
  const displayVideoConceptsForProduct = async (productId: string) => {
    try {
      setIsLoading(true);

      // Fetch the product with video concepts
      const { getProductVideoIdeas } = await import("@/lib/database");
      const product = await getProductVideoIdeas(productId);

      if (!product) {
        throw new Error("Produkt nicht gefunden");
      }

      // Extract video concepts
      const videoIdeas = [
        product.video_concept_1,
        product.video_concept_2,
        product.video_concept_3,
      ].filter(Boolean);

      if (videoIdeas.length === 0) {
        throw new Error("Keine Videokonzepte für dieses Produkt gefunden");
      }

      // Extract product images
      let imageUrls: string[] = [];
      const productImages = product.product_images;
      if (Array.isArray(productImages)) {
        imageUrls = productImages.filter((img): img is string => typeof img === 'string');
      } else if (productImages && typeof productImages === 'object') {
        imageUrls = Object.values(productImages).filter((val): val is string => typeof val === 'string');
      }

      // Store in state for later use
      setCurrentState((prev) => ({
        ...prev,
        lastGenerationParams: {
          prompt: '', // Will be set when user selects a video idea
          productId: product.id,
          videoIdeas,
          productImages: imageUrls,
        },
      }));

      // Display video concepts
      const videoIdeasText = videoIdeas.map((idea: any, index: number) =>
        `**${index + 1}. ${idea.title || 'Video Konzept'}**\n${idea.video_prompt || idea.prompt || idea.description || ''}\n`
      ).join("\n");

      // Show product images with special format that MessageBubble will detect
      const imageUrlsText = imageUrls.length > 0
        ? `\n\n[Produktbilder: ${imageUrls.join(", ")}]`
        : "";

      setCurrentState((prev) => ({
        ...prev,
        messages: [
          ...prev.messages,
          {
            id: Date.now().toString(),
            role: "assistant",
            content: `Hier sind die 3 Videoideen für **${product.product_name}**:\n\n${videoIdeasText}\nWelche Idee möchtest du verwenden? Antworte einfach mit der Nummer (1, 2 oder 3).${imageUrlsText}`,
            timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
          },
        ],
      }));

    } catch (error: any) {
      console.error("Error displaying video concepts:", error);
      setCurrentState((prev) => ({
        ...prev,
        messages: [
          ...prev.messages,
          {
            id: Date.now().toString(),
            role: "assistant",
            content: "Es gab einen Fehler beim Laden der Videokonzepte. Bitte versuche es erneut.",
            timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
            status: "error" as const,
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
            content: "Starte Video-Erstellung... Dies kann bis zu 5 Minuten dauern.",
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

      // Use selected images from state, or fall back to payload images
      const imagesToUse = currentState.selectedVideoImages && currentState.selectedVideoImages.length > 0
        ? currentState.selectedVideoImages
        : (payload.images || []);

      // Get product_id from state (stored during URL analysis)
      const productId = (currentState.lastGenerationParams as any)?.productId || payload.product_id || null;

      // Call video generation webhook to start the job
      const response = await fetch("/api/webhook/video-generation", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          userId: userData.user.id,
          businessId: business.id,
          productId: productId || "",
          prompt: payload.prompt,
          images: imagesToUse,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Video-Erstellung fehlgeschlagen");
      }

      const result = await response.json();

      if (!result.jobId) {
        throw new Error("Keine Job-ID erhalten");
      }

      const jobId = result.jobId;
      console.log("Video generation started, job ID:", jobId);

      // Update message to show polling started
      setCurrentState(prev => ({
        ...prev,
        messages: [
          ...prev.messages.slice(0, -1), // Remove the "Starte..." message
          {
            id: Date.now().toString(),
            role: "assistant",
            content: "Video-Erstellung läuft... Ich überprüfe alle paar Sekunden den Status.",
            timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
          },
        ],
      }));

      // Poll for job completion
      const maxPollingAttempts = 120; // 120 * 5 seconds = 10 minutes max
      let attempts = 0;

      const pollStatus = async (): Promise<void> => {
        if (attempts >= maxPollingAttempts) {
          throw new Error("Video-Erstellung hat zu lange gedauert (über 10 Minuten)");
        }

        attempts++;

        // Add cache busting to prevent cached responses
        const statusResponse = await fetch(`/api/campaign-status/${jobId}?t=${Date.now()}`, {
          cache: 'no-store',
        });

        if (!statusResponse.ok) {
          throw new Error("Fehler beim Abrufen des Job-Status");
        }

        const statusData = await statusResponse.json();
        console.log(`[Video Polling ${attempts}] Status: ${statusData.job?.status}, VideoUrl: ${statusData.job?.videoUrl ? 'present' : 'null'}`);

        const { status, videoUrl, errorMessage } = statusData.job;

        if (status === "completed") {
          console.log(`[Video Polling ${attempts}] Completed! Video URL:`, videoUrl);
          if (!videoUrl) {
            console.error(`[Video Polling ${attempts}] No video URL found!`);
            throw new Error("Keine Video-URL erhalten");
          }

          // Show video in preview
          onPreviewUpdate?.(videoUrl);

          // Set generation params so save button works
          onGenerationParamsUpdate?.({
            prompt: payload.prompt,
            workflow: "video_generation",
            jobId: jobId,
            images: imagesToUse,
          });

          // Mark conversation as complete
          setCurrentState((prev) => ({
            ...prev,
            isComplete: true,
            currentImageUrl: videoUrl,
            messages: [
              ...prev.messages.slice(0, -1), // Remove the "läuft..." message
              {
                id: Date.now().toString(),
                role: "assistant",
                content: "Dein Video wurde erfolgreich erstellt! Du kannst es jetzt in der Vorschau sehen.",
                timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
              },
            ],
          }));

          return; // Done!
        } else if (status === "failed") {
          throw new Error(errorMessage || "Video-Erstellung fehlgeschlagen");
        } else {
          // Still processing, wait and poll again
          await new Promise(resolve => setTimeout(resolve, 5000)); // Wait 5 seconds
          return pollStatus();
        }
      };

      await pollStatus();

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
          workflow: 'bilder_freebird',
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

  // Handle image selection for Product Video flow
  const handleImageSelection = (selectedUrls: string[]) => {
    setCurrentState(prev => ({
      ...prev,
      selectedVideoImages: selectedUrls,
    }));
  };

  // ===== AI EXPLAINS VIDEO HANDLERS =====

  const handleAiExplainsProductSelection = async (productId: string) => {
    try {
      setIsLoading(true);

      // Fetch the product
      const { data: product, error } = await supabaseBrowserClient
        .from("business_products")
        .select("*")
        .eq("id", productId)
        .single();

      if (error || !product) {
        throw new Error("Produkt nicht gefunden");
      }

      // Extract product images
      let imageUrls: string[] = [];
      const productImages = product.product_images;
      if (Array.isArray(productImages)) {
        imageUrls = productImages.filter((img): img is string => typeof img === 'string');
      } else if (productImages && typeof productImages === 'object') {
        imageUrls = Object.values(productImages).filter((val): val is string => typeof val === 'string');
      }

      if (imageUrls.length === 0) {
        throw new Error("Keine Bilder für dieses Produkt gefunden");
      }

      // Update state with selected product and show image selector
      setCurrentState(prev => ({
        ...prev,
        videoWorkflowState: {
          ...prev.videoWorkflowState!,
          selectedProduct: product,
          waitingFor: "image",
        },
        messages: [
          ...prev.messages,
          {
            id: Date.now().toString(),
            role: "assistant",
            content: `Großartig! Du hast "${product.product_name}" ausgewählt.\n\nWähle jetzt EIN Bild aus, das im Video verwendet werden soll:\n\n[AI_EXPLAINS_IMAGE_SELECTOR:${JSON.stringify({
              images: imageUrls,
              productName: product.product_name,
            })}]`,
            timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
          },
        ],
      }));

    } catch (error: any) {
      console.error("Error selecting AI Explains product:", error);
      setCurrentState(prev => ({
        ...prev,
        messages: [
          ...prev.messages,
          {
            id: Date.now().toString(),
            role: "assistant",
            content: `Fehler beim Laden des Produkts: ${error.message}`,
            timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
            status: "error" as const,
          },
        ],
      }));
    } finally {
      setIsLoading(false);
    }
  };

  const handleAiExplainsImageSelection = (imageUrl: string) => {
    setCurrentState(prev => ({
      ...prev,
      videoWorkflowState: {
        ...prev.videoWorkflowState!,
        selectedImage: imageUrl,
        waitingFor: "prompt",
      },
      messages: [
        ...prev.messages,
        {
          id: Date.now().toString(),
          role: "assistant",
          content: `Perfekt! Jetzt beschreibe, wie eine Person dein Produkt vorstellen soll.\n\n**Beispiele:**\n- "Eine junge Frau in Business-Kleidung zeigt das Produkt und erklärt die 3 Hauptfunktionen"\n- "Ein freundlicher Bauarbeiter erklärt die Maschine und demonstriert ihre Anwendung"\n- "Eine professionelle Verkäuferin präsentiert das Geschäft und lädt Kunden ein"`,
          timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
        },
      ],
    }));
  };

  const handleAiExplainsVideoGeneration = async (prompt?: string) => {
    try {
      const product = currentState.videoWorkflowState?.selectedProduct;
      const selectedImage = currentState.videoWorkflowState?.selectedImage;
      const videoPrompt = prompt || currentState.videoWorkflowState?.personDescription;

      if (!product || !selectedImage || !videoPrompt) {
        console.error("Missing data for AI Explains video generation:", {
          product: !!product,
          selectedImage: !!selectedImage,
          prompt: !!videoPrompt,
        });
        throw new Error("Fehlende Daten für Video-Erstellung");
      }

      // Set generation state to show loading indicator
      setCurrentState(prev => ({
        ...prev,
        generationState: {
          isGenerating: true,
          type: "video",
          message: "Video wird erstellt",
        },
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

      // Call AI Explains video webhook to start the job
      const response = await fetch("/api/webhook/ai-explains-video", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          userId: userData.user.id,
          businessId: business.id,
          productId: product.id,
          selectedImage,
          prompt: videoPrompt,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        console.error("AI Explains webhook error:", errorData);
        throw new Error(errorData.details || errorData.error || "Video-Erstellung fehlgeschlagen");
      }

      const result = await response.json();

      if (!result.jobId) {
        throw new Error("Keine Job-ID erhalten");
      }

      const jobId = result.jobId;
      console.log("AI Explains video generation started, job ID:", jobId);

      // Poll for job completion
      const maxPollingAttempts = 120; // 120 * 5 seconds = 10 minutes max
      let attempts = 0;

      const pollStatus = async (): Promise<void> => {
        if (attempts >= maxPollingAttempts) {
          throw new Error("Video-Erstellung hat zu lange gedauert (über 10 Minuten)");
        }

        attempts++;

        // Add cache busting to prevent cached responses
        const statusResponse = await fetch(`/api/campaign-status/${jobId}?t=${Date.now()}`, {
          cache: 'no-store',
        });

        if (!statusResponse.ok) {
          throw new Error("Fehler beim Abrufen des Job-Status");
        }

        const statusData = await statusResponse.json();
        console.log(`[AI Explains Polling ${attempts}] Status: ${statusData.job?.status}, VideoUrl: ${statusData.job?.videoUrl ? 'present' : 'null'}`);

        const { status, videoUrl, errorMessage } = statusData.job;

        if (status === "completed") {
          console.log(`[AI Explains Polling ${attempts}] Completed! Video URL:`, videoUrl);
          if (!videoUrl) {
            console.error(`[AI Explains Polling ${attempts}] No video URL found!`);
            throw new Error("Keine Video-URL erhalten");
          }

          // Show video in preview
          onPreviewUpdate?.(videoUrl);

          // Set generation params so save button works
          onGenerationParamsUpdate?.({
            prompt: videoPrompt,
            workflow: "ai_explains",
            jobId: jobId,
            productId: product.id,
            productCategory: product.category,
            productName: product.product_name,
            businessId: business.id,
            selectedImage,
          });

          // Mark conversation as complete and stop generation indicator
          setCurrentState(prev => ({
            ...prev,
            isComplete: true,
            currentImageUrl: videoUrl,
            generationState: {
              isGenerating: false,
              type: null,
              message: undefined,
            },
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

          return; // Done!
        } else if (status === "failed") {
          throw new Error(errorMessage || "Video-Erstellung fehlgeschlagen");
        } else {
          // Still processing, wait and poll again
          await new Promise(resolve => setTimeout(resolve, 5000)); // Wait 5 seconds
          return pollStatus();
        }
      };

      await pollStatus();

    } catch (error: any) {
      console.error("Error in handleAiExplainsVideoGeneration:", error);
      setCurrentState(prev => ({
        ...prev,
        generationState: {
          isGenerating: false,
          type: null,
          message: undefined,
        },
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

  const handleProductSelection = async (productId: string) => {
    // Route to appropriate handler based on selected product type
    if (selectedProductId === 0) {
      // Check if we're in the new Bilder workflow mode
      if (currentState.bilderWorkflowState?.workflow === "product") {
        await handleBilderProductSelection(productId);
      } else {
        // Old Bilder flow - show product images for selection
        await displayProductImagesForBilder(productId);
      }
    } else if (selectedProductId === 2) {
      // Check if we're in product rotation sub-workflow
      if (currentState.videoWorkflowState?.subWorkflow === "product-rotation") {
        await handleProductRotationProductSelection(productId);
      } else if (currentState.videoWorkflowState?.subWorkflow === "user-speaks") {
        await handleUserSpeaksProductSelection(productId);
      } else if (currentState.videoWorkflowState?.subWorkflow === "image-to-video") {
        await handleImageToVideoProductSelection(productId);
      } else if (currentState.videoWorkflowState?.workflow === "ai-explains") {
        // AI Explains workflow mode
        await handleAiExplainsProductSelection(productId);
      } else {
        // Other video workflows - show video concepts
        await displayVideoConceptsForProduct(productId);
      }
    } else if (selectedProductId === 1) {
      // Social Media Campaign flow - show product images for selection
      await handleCampaignProductSelection(productId);
    }
  };

  // ===== SOCIAL MEDIA CAMPAIGN HANDLERS =====

  const handleCampaignTypeSelection = (type: "product" | "concept" | "political") => {
    setCurrentState(prev => ({
      ...prev,
      campaignState: {
        ...prev.campaignState!,
        type,
      },
      messages: [
        ...prev.messages,
        {
          id: Date.now().toString(),
          role: "assistant",
          content: type === "product"
            ? "Perfekt! Wähle das Produkt aus, für das du eine Kampagne erstellen möchtest:\n\n[CAMPAIGN_PRODUCT_SELECTOR]"
            : type === "political"
            ? "Diese Funktion ist noch in Entwicklung und wird bald verfügbar sein."
            : "Super! Beschreibe deine Kampagnenidee und ich generiere passende Bilder für dich.",
          timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
        },
      ],
    }));
  };

  const handleCampaignProductSelection = async (productId: string) => {
    try {
      setIsLoading(true);

      // Fetch the product
      const { data: product, error } = await supabaseBrowserClient
        .from("business_products")
        .select("*")
        .eq("id", productId)
        .single();

      if (error || !product) {
        throw new Error("Produkt nicht gefunden");
      }

      // Extract product images
      let imageUrls: string[] = [];
      const productImages = product.product_images;
      if (Array.isArray(productImages)) {
        imageUrls = productImages.filter((img): img is string => typeof img === 'string');
      } else if (productImages && typeof productImages === 'object') {
        imageUrls = Object.values(productImages).filter((val): val is string => typeof val === 'string');
      }

      if (imageUrls.length === 0) {
        throw new Error("Keine Bilder für dieses Produkt gefunden");
      }

      // Update state with selected product
      setCurrentState(prev => ({
        ...prev,
        campaignState: {
          ...prev.campaignState!,
          selectedProduct: product,
        },
        messages: [
          ...prev.messages,
          {
            id: Date.now().toString(),
            role: "assistant",
            content: `[CAMPAIGN_IMAGE_SELECTOR:${JSON.stringify({ images: imageUrls, productName: product.product_name })}]`,
            timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
          },
        ],
      }));

    } catch (error: any) {
      console.error("Error selecting campaign product:", error);
      setCurrentState(prev => ({
        ...prev,
        messages: [
          ...prev.messages,
          {
            id: Date.now().toString(),
            role: "assistant",
            content: `Fehler beim Laden des Produkts: ${error.message}`,
            timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
            status: "error" as const,
          },
        ],
      }));
    } finally {
      setIsLoading(false);
    }
  };

  const handleCampaignImageSelection = (imageUrl: string) => {
    setCurrentState(prev => ({
      ...prev,
      campaignState: {
        ...prev.campaignState!,
        selectedImage: imageUrl,
      },
      messages: [
        ...prev.messages,
        {
          id: Date.now().toString(),
          role: "assistant",
          content: "Perfekt! Möchtest du noch zusätzliche Hinweise für die Kampagne geben? (z.B. bestimmte Farben, Stil, Text)\n\nWenn nicht, schreibe einfach 'Generieren' oder 'Los geht's'.",
          timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
        },
      ],
    }));
  };

  const handleCampaignGeneration = async (additionalComments: string = "") => {
    try {
      // Update state to show generation is in progress
      setCurrentState(prev => ({
        ...prev,
        campaignState: {
          ...prev.campaignState!,
          isGenerating: true,
        },
        generationState: {
          isGenerating: true,
          type: "image",
          message: "Kampagnenbilder werden erstellt",
        },
      }));

      // Get user and business data
      const { data: userData } = await supabaseBrowserClient.auth.getUser();
      if (!userData?.user) {
        throw new Error("Nicht angemeldet");
      }

      const { getUserBusiness } = await import("@/lib/database");
      const business = await getUserBusiness(userData.user.id);
      if (!business) {
        throw new Error("Kein Business gefunden");
      }

      const product = currentState.campaignState?.selectedProduct;
      const selectedImage = currentState.campaignState?.selectedImage;

      if (!product || !selectedImage) {
        throw new Error("Produkt oder Bild nicht ausgewählt");
      }

      // Prepare brand DNA
      const brandDNA = {
        tone_of_voice: business.tone_of_voice || [],
        brand_values: business.brand_values || [],
        brand_colors: business.brand_colors || [],
      };

      // Call campaign generation webhook to start the job
      const response = await fetch("/api/webhook/social-media-campaign", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          userId: userData.user.id,
          businessId: business.id,
          productId: product.id,
          product: {
            name: product.product_name,
            description: product.product_description,
            key_features: product.key_features || [],
            benefits: product.benefits || [],
          },
          selectedImage,
          brandDNA,
          additionalComments,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Kampagnen-Erstellung fehlgeschlagen");
      }

      const result = await response.json();

      if (!result.jobId) {
        throw new Error("Keine Job-ID erhalten");
      }

      const jobId = result.jobId;
      console.log("✅ Campaign generation started successfully!");
      console.log("- Job ID received:", jobId);
      console.log("- Job ID type:", typeof jobId);
      console.log("- Job ID length:", jobId?.length);
      console.log("- Will poll URL:", `/api/campaign-status/${jobId}`);

      // Poll for job completion
      const maxPollingAttempts = 120; // 120 * 5 seconds = 10 minutes max
      let attempts = 0;

      const pollStatus = async (): Promise<void> => {
        if (attempts >= maxPollingAttempts) {
          throw new Error("Kampagnen-Erstellung hat zu lange gedauert (über 10 Minuten)");
        }

        attempts++;

        // Add cache busting to prevent cached responses
        const statusResponse = await fetch(`/api/campaign-status/${jobId}?t=${Date.now()}`, {
          cache: 'no-store',
        });

        if (!statusResponse.ok) {
          const errorData = await statusResponse.json().catch(() => ({}));
          console.error(`[Polling ${attempts}] Status check failed:`, {
            status: statusResponse.status,
            statusText: statusResponse.statusText,
            errorData,
            jobId,
          });
          throw new Error(
            `Fehler beim Abrufen des Job-Status (${statusResponse.status}): ${
              errorData.details || errorData.error || statusResponse.statusText
            }`
          );
        }

        const statusData = await statusResponse.json();
        console.log(`[Polling ${attempts}] Full response:`, statusData);
        console.log(`[Polling ${attempts}] Job object:`, statusData.job);
        console.log(`[Polling ${attempts}] Images field:`, statusData.job?.images);
        console.log(`[Polling ${attempts}] Images type:`, typeof statusData.job?.images);
        console.log(`[Polling ${attempts}] Images isArray:`, Array.isArray(statusData.job?.images));

        const { status, images, errorMessage } = statusData.job;

        console.log(`[Polling ${attempts}] Status: ${status}, Images: ${images?.length || 0}, Error: ${errorMessage || 'none'}`);
        console.log(`[Polling ${attempts}] Extracted images:`, images);

        if (status === "completed") {
          console.log(`[Polling ${attempts}] Status is completed. Images:`, images);
          if (!images || images.length === 0) {
            console.error(`[Polling ${attempts}] No images found! Images value:`, images);
            throw new Error("Keine Bilder generiert");
          }

          // Auto-save all images to gallery
          await saveImagesToGallery(
            images,
            product.product_name,
            jobId,
            business.id,
            product.id,
            product.category
          );

          // Update state with generated images
          setCurrentState(prev => ({
            ...prev,
            campaignState: {
              ...prev.campaignState!,
              generatedImages: images,
              isGenerating: false,
            },
            generationState: {
              isGenerating: false,
              type: null,
              message: undefined,
            },
            messages: [
              ...prev.messages,
              {
                id: Date.now().toString(),
                role: "assistant",
                content: `Deine Kampagnenbilder sind fertig! Ich habe ${images.length} Varianten für dich erstellt.\n\n[CAMPAIGN_GENERATED_IMAGES:${JSON.stringify(images)}]\n\nKlicke auf ein Bild um es in der Vorschau zu öffnen. Dort kannst du es speichern, herunterladen oder mit einem Text-Prompt bearbeiten.`,
                timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
              },
            ],
          }));

          return; // Done!
        } else if (status === "failed") {
          throw new Error(errorMessage || "Kampagnen-Erstellung fehlgeschlagen");
        } else {
          // Still processing, wait and poll again
          await new Promise(resolve => setTimeout(resolve, 5000)); // Wait 5 seconds
          return pollStatus();
        }
      };

      await pollStatus();

    } catch (error: any) {
      console.error("Error generating campaign:", error);
      setCurrentState(prev => ({
        ...prev,
        campaignState: {
          ...prev.campaignState!,
          isGenerating: false,
        },
        generationState: {
          isGenerating: false,
          type: null,
          message: undefined,
        },
        messages: [
          ...prev.messages,
          {
            id: Date.now().toString(),
            role: "assistant",
            content: `Fehler bei der Kampagnen-Erstellung: ${error.message}`,
            timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
            status: "error" as const,
          },
        ],
      }));
    }
  };

  const handleBilderImageEdit = async (imageUrl: string, editPrompt: string) => {
    console.log("🖼️ [Bilder Edit] ===== FUNCTION CALLED =====");
    console.log("🖼️ [Bilder Edit] Image URL:", imageUrl);
    console.log("🖼️ [Bilder Edit] Edit prompt:", editPrompt);

    try {
      setIsLoading(true);

      // Call the edit webhook
      const editPayload = {
        productId: 0,
        prompt: editPrompt,
        isEditing: true,
        imageUrl,
        aspectRatio: currentState.lastGenerationParams?.aspectRatio || "16:9",
        resolution: currentState.lastGenerationParams?.resolution || "2K",
        outputFormat: currentState.lastGenerationParams?.outputFormat || "jpg",
      };

      console.log("🖼️ [Bilder Edit] Sending edit request:", editPayload);

      const response = await fetch("/api/webhook", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(editPayload),
      });

      console.log("🖼️ [Bilder Edit] Response status:", response.status, response.statusText);

      if (!response.ok) {
        const errorText = await response.text();
        console.error("🖼️ [Bilder Edit] Webhook failed:", errorText);
        throw new Error("Bild-Bearbeitung fehlgeschlagen");
      }

      const result = await response.json();
      console.log("🖼️ [Bilder Edit] Webhook result:", result);

      if (!result.imageUrl) {
        console.error("🖼️ [Bilder Edit] No imageUrl in response!");
        throw new Error("Keine Bild-URL erhalten");
      }

      // Update preview with the new edited image
      console.log("🖼️ [Bilder Edit] Calling onPreviewUpdate with:", result.imageUrl);
      onPreviewUpdate?.(result.imageUrl);

      // Update generation params to maintain edit capability
      onGenerationParamsUpdate?.({
        isCampaignImage: true,
        imageUrl: result.imageUrl,
        prompt: editPrompt,
        aspectRatio: editPayload.aspectRatio,
        resolution: editPayload.resolution,
        outputFormat: editPayload.outputFormat,
        onEdit: (editPrompt: string) => {
          handleBilderImageEdit(result.imageUrl, editPrompt);
        },
      });

      // Update state
      setCurrentState(prev => ({
        ...prev,
        currentImageUrl: result.imageUrl,
        messages: [
          ...prev.messages,
          {
            id: Date.now().toString(),
            role: "assistant",
            content: "✅ Dein bearbeitetes Bild ist fertig! Schau es dir im Vorschau-Bereich an.",
            timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
          },
        ],
      }));

    } catch (error: any) {
      console.error("🖼️ [Bilder Edit] ❌ ERROR:", error);
      setCurrentState(prev => ({
        ...prev,
        messages: [
          ...prev.messages,
          {
            id: Date.now().toString(),
            role: "assistant",
            content: `❌ Fehler beim Bearbeiten: ${error.message}`,
            timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
            status: "error",
          },
        ],
      }));
    } finally {
      setIsLoading(false);
    }
  };

  const handleCampaignImageEdit = async (imageUrl: string, editPrompt: string) => {
    console.log("🎨 [Campaign Edit] ===== FUNCTION CALLED =====");
    console.log("🎨 [Campaign Edit] Image URL:", imageUrl);
    console.log("🎨 [Campaign Edit] Edit prompt:", editPrompt);

    try {
      // Find the index of the image being edited
      const imageIndex = currentState.campaignState?.generatedImages.findIndex(img => img === imageUrl) ?? -1;
      console.log("🎨 [Campaign Edit] Image index:", imageIndex);

      if (imageIndex === -1) {
        throw new Error("Bild nicht gefunden");
      }

      // Update state to show editing is in progress
      setCurrentState(prev => ({
        ...prev,
        campaignState: {
          ...prev.campaignState!,
          isEditingImage: true,
          editingImageIndex: imageIndex,
        },
      }));

      // Call the existing edit webhook
      const editPayload = {
        productId: 0, // Use Bilder product ID for edit workflow
        prompt: editPrompt,
        isEditing: true,
        imageUrl,
        aspectRatio: "1:1", // Social media standard
        resolution: "2K",
        outputFormat: "jpg",
      };

      console.log("🎨 [Campaign Edit] Sending edit request:", editPayload);

      const response = await fetch("/api/webhook", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(editPayload),
      });

      console.log("🎨 [Campaign Edit] Response status:", response.status, response.statusText);

      if (!response.ok) {
        const errorText = await response.text();
        console.error("🎨 [Campaign Edit] Webhook failed:", errorText);
        throw new Error("Bild-Bearbeitung fehlgeschlagen");
      }

      let result;
      try {
        const responseText = await response.text();
        console.log("🎨 [Campaign Edit] Raw response text:", responseText.substring(0, 200));
        result = JSON.parse(responseText);
        console.log("🎨 [Campaign Edit] Parsed webhook result:", result);
        console.log("🎨 [Campaign Edit] Extracted imageUrl:", result.imageUrl);
      } catch (parseError) {
        console.error("🎨 [Campaign Edit] Failed to parse response JSON:", parseError);
        throw new Error("Ungültige Antwort vom Server");
      }

      if (!result.imageUrl) {
        console.error("🎨 [Campaign Edit] No imageUrl in response! Full result:", result);
        throw new Error("Keine Bild-URL erhalten");
      }

      // Update the specific image in the array
      const updatedImages = [...(currentState.campaignState?.generatedImages || [])];
      updatedImages[imageIndex] = result.imageUrl;
      console.log("🎨 [Campaign Edit] Updated images array:", updatedImages);

      // Auto-save the edited image to gallery
      const product = currentState.campaignState?.selectedProduct;
      await saveImagesToGallery(
        [result.imageUrl],
        `${product?.product_name} (Bearbeitet)`,
        undefined,
        product?.business_id,
        product?.id,
        product?.category
      );

      // Update preview with the new edited image
      console.log("🎨 [Campaign Edit] Calling onPreviewUpdate with:", result.imageUrl);
      onPreviewUpdate?.(result.imageUrl);

      // Update generation params to maintain campaign edit capability
      onGenerationParamsUpdate?.({
        isCampaignImage: true,
        imageUrl: result.imageUrl,
        onEdit: (editPrompt: string) => {
          handleCampaignImageEdit(result.imageUrl, editPrompt);
        },
      });

      // Update state with new image
      setCurrentState(prev => ({
        ...prev,
        campaignState: {
          ...prev.campaignState!,
          generatedImages: updatedImages,
          isEditingImage: false,
          editingImageIndex: null,
        },
      }));

    } catch (error: any) {
      console.error("🎨 [Campaign Edit] ❌ ERROR:", error);
      console.error("🎨 [Campaign Edit] Error message:", error.message);
      console.error("🎨 [Campaign Edit] Error stack:", error.stack);
      setCurrentState(prev => ({
        ...prev,
        campaignState: {
          ...prev.campaignState!,
          isEditingImage: false,
          editingImageIndex: null,
        },
        messages: [
          ...prev.messages,
          {
            id: Date.now().toString(),
            role: "assistant",
            content: `❌ Fehler beim Bearbeiten: ${error.message}`,
            timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
          },
        ],
      }));
    }
  };

  const handleViewGeneratedCampaignImage = (imageUrl: string) => {
    // Send the selected image to the preview panel
    onPreviewUpdate?.(imageUrl);

    // Send campaign edit handler info to preview panel via generation params
    onGenerationParamsUpdate?.({
      isCampaignImage: true,
      imageUrl,
      onEdit: (editPrompt: string) => {
        handleCampaignImageEdit(imageUrl, editPrompt);
      },
    });

    // Store the image URL and enable edit mode for this campaign image
    setCurrentState(prev => ({
      ...prev,
      campaignState: {
        ...prev.campaignState!,
        // We can use editingImageIndex to track which generated image is being viewed
        editingImageIndex: prev.campaignState?.generatedImages.findIndex(img => img === imageUrl) ?? -1,
      },
    }));
  };

  const handleBilderWorkflowSelection = async (workflow: "product" | "combine" | "freebird") => {
    setCurrentState(prev => ({
      ...prev,
      bilderWorkflowState: {
        ...prev.bilderWorkflowState!,
        workflow,
      },
    }));

    if (workflow === "product") {
      // Show product selector
      setCurrentState(prev => ({
        ...prev,
        messages: [
          ...prev.messages,
          {
            id: Date.now().toString(),
            role: "assistant",
            content: "Perfekt! Wähle ein Produkt aus deinem Katalog:\n\n[BILDER_PRODUCT_SELECTOR]",
            timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
          },
        ],
      }));
    } else if (workflow === "combine") {
      // Ask user to upload images
      setCurrentState(prev => ({
        ...prev,
        messages: [
          ...prev.messages,
          {
            id: Date.now().toString(),
            role: "assistant",
            content: "Super! Lade mehrere Bilder hoch (max. 5), die du kombinieren möchtest. Beschreibe dann, was für ein Bild daraus entstehen soll.",
            timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
          },
        ],
      }));
    } else if (workflow === "freebird") {
      // Ask for prompt directly
      setCurrentState(prev => ({
        ...prev,
        messages: [
          ...prev.messages,
          {
            id: Date.now().toString(),
            role: "assistant",
            content: "Los geht's! Beschreibe einfach, was für ein Bild du erstellen möchtest. Ich kümmere mich um den Rest.",
            timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
          },
        ],
      }));
    }
  };

  const handleVideoWorkflowSelection = async (workflow: "product-rotation" | "user-speaks" | "image-to-video" | "inspirational" | "ai-explains") => {
    // Handle the three social boost sub-workflows (product-rotation, user-speaks, image-to-video)
    if (workflow === "product-rotation" || workflow === "user-speaks" || workflow === "image-to-video") {
      console.log("[Video Workflow] Selected social boost sub-workflow:", workflow);

      // Store the sub-workflow in state and set waitingFor to "product"
      setCurrentState(prev => ({
        ...prev,
        videoWorkflowState: {
          ...prev.videoWorkflowState,
          workflow: "social-booster",
          subWorkflow: workflow,
          selectedProduct: null,
          selectedImage: null,
          scenarioDescription: null,
          personDescription: null,
          actionDescription: null,
          waitingFor: "product",
        },
      }));

      // Show products for the selected sub-workflow
      try {
        const { data: userData } = await supabaseBrowserClient.auth.getUser();

        if (userData?.user) {
          const { getAllUserBusinessProducts } = await import("@/lib/database");
          const products = await getAllUserBusinessProducts(userData.user.id);

          if (products && products.length > 0) {
            const productData = products.map(p => ({
              id: p.id,
              product_name: p.product_name,
              product_description: p.product_description,
              product_images: p.product_images
            }));

            setCurrentState(prev => ({
              ...prev,
              messages: [
                ...prev.messages,
                {
                  id: Date.now().toString(),
                  role: "assistant",
                  content: `Perfekt! Wähle ein Produkt aus deinem Katalog:\n\n[PRODUCT_SELECTION:${JSON.stringify(productData)}]`,
                  timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
                },
              ],
            }));
          } else {
            setCurrentState(prev => ({
              ...prev,
              messages: [
                ...prev.messages,
                {
                  id: Date.now().toString(),
                  role: "assistant",
                  content: "Du hast noch keine Produkte in deinem Katalog. Bitte füge zuerst ein Produkt hinzu, bevor du ein Video erstellst.",
                  timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
                },
              ],
            }));
          }
        }
      } catch (error) {
        console.error("Error loading products for social boost workflow:", error);
        setCurrentState(prev => ({
          ...prev,
          messages: [
            ...prev.messages,
            {
              id: Date.now().toString(),
              role: "assistant",
              content: "Es gab einen Fehler beim Laden deiner Produkte. Bitte versuche es erneut.",
              timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
            },
          ],
        }));
      }
      return;
    }

    setCurrentState(prev => ({
      ...prev,
      videoWorkflowState: {
        ...prev.videoWorkflowState,
        workflow,
        selectedProduct: null,
        selectedImage: null,
        scenarioDescription: null,
        personDescription: null,
        actionDescription: null,
        waitingFor: workflow === "ai-explains" ? "product" : null,
      },
    }));

    // Special handling for AI Explains workflow - show concept explanation first
    if (workflow === "ai-explains") {
      try {
        // Get user_id from auth
        const { data: userData } = await supabaseBrowserClient.auth.getUser();

        if (userData?.user) {
          // Fetch all products (not just those with video concepts)
          const { getAllUserBusinessProducts } = await import("@/lib/database");
          const products = await getAllUserBusinessProducts(userData.user.id);

          // If products exist, show explanation then products
          if (products && products.length > 0) {
            const productData = products.map(p => ({
              id: p.id,
              product_name: p.product_name,
              product_description: p.product_description,
              product_images: p.product_images
            }));

            setCurrentState(prev => ({
              ...prev,
              messages: [
                ...prev.messages,
                {
                  id: Date.now().toString(),
                  role: "assistant",
                  content: `In diesem Video wird dein Produkt von einer KI generierten Person in einem realistisch aussehenden Umfeld super dargestellt. Die Person zeigt dein Produkt oder dein Geschäft und spricht beispielsweise über die Vorteile.\n\nWähle ein Produkt aus deinem Katalog:\n\n[PRODUCT_SELECTION:${JSON.stringify(productData)}]`,
                  timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
                },
              ],
            }));
          } else {
            // No products found
            setCurrentState(prev => ({
              ...prev,
              messages: [
                ...prev.messages,
                {
                  id: Date.now().toString(),
                  role: "assistant",
                  content: "Du hast noch keine Produkte in deinem Katalog. Bitte füge zuerst ein Produkt hinzu, bevor du ein Video erstellst.",
                  timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
                },
              ],
            }));
          }
        }
      } catch (error) {
        console.error("Error loading products for AI explains workflow:", error);
        setCurrentState(prev => ({
          ...prev,
          messages: [
            ...prev.messages,
            {
              id: Date.now().toString(),
              role: "assistant",
              content: "Es gab einen Fehler beim Laden deiner Produkte. Bitte versuche es erneut.",
              timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
            },
          ],
        }));
      }
    } else {
      // For other workflows (inspirational), just show products
      try {
        // Get user_id from auth
        const { data: userData } = await supabaseBrowserClient.auth.getUser();

        if (userData?.user) {
          // Fetch all products (not just those with video concepts)
          const { getAllUserBusinessProducts } = await import("@/lib/database");
          const products = await getAllUserBusinessProducts(userData.user.id);

          // If products exist, embed them in the message
          if (products && products.length > 0) {
            const productData = products.map(p => ({
              id: p.id,
              product_name: p.product_name,
              product_description: p.product_description,
              product_images: p.product_images
            }));

            setCurrentState(prev => ({
              ...prev,
              messages: [
                ...prev.messages,
                {
                  id: Date.now().toString(),
                  role: "assistant",
                  content: `Perfekt! Wähle ein Produkt aus deinem Katalog:\n\n[PRODUCT_SELECTION:${JSON.stringify(productData)}]`,
                  timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
                },
              ],
            }));
          } else {
            // No products found
            setCurrentState(prev => ({
              ...prev,
              messages: [
                ...prev.messages,
                {
                  id: Date.now().toString(),
                  role: "assistant",
                  content: "Du hast noch keine Produkte in deinem Katalog. Bitte füge zuerst ein Produkt hinzu, bevor du ein Video erstellst.",
                  timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
                },
              ],
            }));
          }
        }
      } catch (error) {
        console.error("Error loading products for video workflow:", error);
        setCurrentState(prev => ({
          ...prev,
          messages: [
            ...prev.messages,
            {
              id: Date.now().toString(),
              role: "assistant",
              content: "Es gab einen Fehler beim Laden deiner Produkte. Bitte versuche es erneut.",
              timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
            },
          ],
        }));
      }
    }
  };

  const handleSocialBoostSubWorkflowSelection = async (subWorkflow: "product-rotation" | "user-speaks" | "image-to-video" | "political-campaign") => {
    console.log("[Social Boost Sub-Workflow] Selected:", subWorkflow);

    // If political-campaign is selected, show coming soon message and return
    if (subWorkflow === "political-campaign") {
      setCurrentState(prev => ({
        ...prev,
        messages: [
          ...prev.messages,
          {
            id: Date.now().toString(),
            role: "assistant",
            content: "Diese Funktion ist noch in Entwicklung und wird bald verfügbar sein.",
            timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
          },
        ],
      }));
      return;
    }

    // Store the sub-workflow in state and set waitingFor to "product"
    setCurrentState(prev => ({
      ...prev,
      videoWorkflowState: {
        ...prev.videoWorkflowState!,
        subWorkflow,
        waitingFor: "product",
        selectedProduct: null,
        selectedImage: null,
      },
    }));

    // Now show products for the selected sub-workflow
    try {
      const { data: userData } = await supabaseBrowserClient.auth.getUser();

      if (userData?.user) {
        const { getAllUserBusinessProducts } = await import("@/lib/database");
        const products = await getAllUserBusinessProducts(userData.user.id);

        if (products && products.length > 0) {
          const productData = products.map(p => ({
            id: p.id,
            product_name: p.product_name,
            product_description: p.product_description,
            product_images: p.product_images
          }));

          setCurrentState(prev => ({
            ...prev,
            messages: [
              ...prev.messages,
              {
                id: Date.now().toString(),
                role: "assistant",
                content: `Perfekt! Wähle ein Produkt aus deinem Katalog:\n\n[PRODUCT_SELECTION:${JSON.stringify(productData)}]`,
                timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
              },
            ],
          }));
        } else {
          setCurrentState(prev => ({
            ...prev,
            messages: [
              ...prev.messages,
              {
                id: Date.now().toString(),
                role: "assistant",
                content: "Du hast noch keine Produkte in deinem Katalog. Bitte füge zuerst ein Produkt hinzu, bevor du ein Video erstellst.",
                timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
              },
            ],
          }));
        }
      }
    } catch (error) {
      console.error("Error loading products for social boost sub-workflow:", error);
      setCurrentState(prev => ({
        ...prev,
        messages: [
          ...prev.messages,
          {
            id: Date.now().toString(),
            role: "assistant",
            content: "Es gab einen Fehler beim Laden deiner Produkte. Bitte versuche es erneut.",
            timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
          },
        ],
      }));
    }
  };

  const handleProductRotationProductSelection = async (productId: string) => {
    try {
      setIsLoading(true);

      // Fetch the selected product from database
      const { data: product, error } = await supabaseBrowserClient
        .from("business_products")
        .select("*")
        .eq("id", productId)
        .single();

      if (error || !product) {
        throw new Error("Produkt nicht gefunden");
      }

      // Extract product images
      let imageUrls: string[] = [];
      const productImages = product.product_images;
      if (Array.isArray(productImages)) {
        imageUrls = productImages.filter((img): img is string => typeof img === 'string');
      } else if (productImages && typeof productImages === 'object') {
        imageUrls = Object.values(productImages).filter((val): val is string => typeof val === 'string');
      }

      if (imageUrls.length === 0) {
        throw new Error("Keine Bilder für dieses Produkt gefunden");
      }

      // Update state: save product, set waitingFor to "image", show image selector
      setCurrentState(prev => ({
        ...prev,
        videoWorkflowState: {
          ...prev.videoWorkflowState!,
          selectedProduct: product,
          waitingFor: "image",
        },
        messages: [
          ...prev.messages,
          {
            id: Date.now().toString(),
            role: "assistant",
            content: `Großartig! Du hast "${product.product_name}" ausgewählt.

Wähle jetzt EIN Bild aus, das im Video rotieren soll:

[PRODUCT_ROTATION_IMAGE_SELECTOR:${JSON.stringify({
              images: imageUrls,
              productName: product.product_name,
            })}]`,
            timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
          },
        ],
      }));

      setIsLoading(false);
    } catch (error: any) {
      console.error("Error in handleProductRotationProductSelection:", error);
      setIsLoading(false);
      setCurrentState(prev => ({
        ...prev,
        messages: [
          ...prev.messages,
          {
            id: Date.now().toString(),
            role: "assistant",
            content: `Fehler: ${error.message}`,
            timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
          },
        ],
      }));
    }
  };

  const handleProductRotationImageSelection = (imageUrl: string) => {
    setCurrentState(prev => ({
      ...prev,
      videoWorkflowState: {
        ...prev.videoWorkflowState!,
        selectedImage: imageUrl,
        waitingFor: "prompt",
      },
      messages: [
        ...prev.messages,
        {
          id: Date.now().toString(),
          role: "assistant",
          content: `Perfekt! Jetzt beschreibe kurz den Stil für das Video.

**Beispiele:**
- "premium, photorealistic photoshoot video"
- "elegant mit warmem Licht"
- "modern und minimalistisch"
- "luxuriös und hochwertig"`,
          timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
        },
      ],
    }));
  };

  const handleProductRotationVideoGeneration = async (prompt?: string) => {
    try {
      const product = currentState.videoWorkflowState?.selectedProduct;
      const selectedImage = currentState.videoWorkflowState?.selectedImage;
      const videoPrompt = prompt || currentState.videoWorkflowState?.personDescription;

      if (!product || !selectedImage || !videoPrompt) {
        console.error("Missing data for product rotation video generation:", {
          product: !!product,
          selectedImage: !!selectedImage,
          prompt: !!videoPrompt,
        });
        throw new Error("Fehlende Daten für Video-Erstellung");
      }

      // Set generation state to show loading indicator
      setCurrentState(prev => ({
        ...prev,
        generationState: {
          isGenerating: true,
          type: "video",
          message: "Video wird erstellt",
        },
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

      // Call product rotation webhook to start the job
      const response = await fetch("/api/webhook/product-rotation", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          userId: userData.user.id,
          businessId: business.id,
          productId: product.id,
          selectedImage,
          prompt: videoPrompt,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        console.error("Product rotation webhook error:", errorData);
        throw new Error(errorData.details || errorData.error || "Video-Erstellung fehlgeschlagen");
      }

      const result = await response.json();

      if (!result.jobId) {
        throw new Error("Keine Job-ID erhalten");
      }

      const jobId = result.jobId;
      console.log("Product rotation video generation started, job ID:", jobId);

      // Poll for job completion
      const maxPollingAttempts = 120; // 120 * 5 seconds = 10 minutes max
      let attempts = 0;

      const pollStatus = async (): Promise<void> => {
        if (attempts >= maxPollingAttempts) {
          throw new Error("Video-Erstellung hat zu lange gedauert (über 10 Minuten)");
        }

        attempts++;

        // Add cache busting to prevent cached responses
        const statusResponse = await fetch(`/api/campaign-status/${jobId}?t=${Date.now()}`, {
          cache: 'no-store',
        });

        if (!statusResponse.ok) {
          throw new Error("Fehler beim Abrufen des Job-Status");
        }

        const statusData = await statusResponse.json();
        console.log(`[Product Rotation Polling ${attempts}] Status: ${statusData.job?.status}, VideoUrl: ${statusData.job?.videoUrl ? 'present' : 'null'}`);

        const { status, videoUrl, errorMessage } = statusData.job;

        if (status === "completed") {
          console.log(`[Product Rotation Polling ${attempts}] Completed! Video URL:`, videoUrl);
          if (!videoUrl) {
            console.error(`[Product Rotation Polling ${attempts}] No video URL found!`);
            throw new Error("Keine Video-URL erhalten");
          }

          // Show video in preview
          onPreviewUpdate?.(videoUrl);

          // Set generation params so save button works
          onGenerationParamsUpdate?.({
            prompt: videoPrompt,
            workflow: "product_rotation",
            jobId: jobId,
            productId: product.id,
            productCategory: product.category,
            productName: product.product_name,
            businessId: business.id,
            selectedImage,
          });

          // Mark conversation as complete and stop generation indicator
          setCurrentState(prev => ({
            ...prev,
            isComplete: true,
            currentImageUrl: videoUrl,
            generationState: {
              isGenerating: false,
              type: null,
              message: undefined,
            },
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

          return; // Done!
        } else if (status === "failed") {
          throw new Error(errorMessage || "Video-Erstellung fehlgeschlagen");
        } else {
          // Still processing, wait and poll again
          await new Promise(resolve => setTimeout(resolve, 5000)); // Wait 5 seconds
          return pollStatus();
        }
      };

      await pollStatus();

    } catch (error: any) {
      console.error("Error in handleProductRotationVideoGeneration:", error);
      setCurrentState(prev => ({
        ...prev,
        generationState: {
          isGenerating: false,
          type: null,
          message: undefined,
        },
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
      setIsLoading(false);
    }
  };

  const handleUserSpeaksProductSelection = async (productId: string) => {
    try {
      setIsLoading(true);

      // Fetch the selected product from database
      const { data: product, error } = await supabaseBrowserClient
        .from("business_products")
        .select("*")
        .eq("id", productId)
        .single();

      if (error || !product) {
        throw new Error("Produkt nicht gefunden");
      }

      // Extract product images
      let imageUrls: string[] = [];
      const productImages = product.product_images;
      if (Array.isArray(productImages)) {
        imageUrls = productImages.filter((img): img is string => typeof img === 'string');
      } else if (productImages && typeof productImages === 'object') {
        imageUrls = Object.values(productImages).filter((val): val is string => typeof val === 'string');
      }

      if (imageUrls.length === 0) {
        throw new Error("Keine Bilder für dieses Produkt gefunden");
      }

      // Update state: save product, set waitingFor to "image", show image selector
      setCurrentState(prev => ({
        ...prev,
        videoWorkflowState: {
          ...prev.videoWorkflowState!,
          selectedProduct: product,
          waitingFor: "image",
        },
        messages: [
          ...prev.messages,
          {
            id: Date.now().toString(),
            role: "assistant",
            content: `Großartig! Du hast "${product.product_name}" ausgewählt.

Wähle jetzt EIN Bild aus, das im Video verwendet werden soll:

[USER_SPEAKS_IMAGE_SELECTOR:${JSON.stringify({
              images: imageUrls,
              productName: product.product_name,
            })}]`,
            timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
          },
        ],
      }));

      setIsLoading(false);
    } catch (error: any) {
      console.error("Error in handleUserSpeaksProductSelection:", error);
      setIsLoading(false);
      setCurrentState(prev => ({
        ...prev,
        messages: [
          ...prev.messages,
          {
            id: Date.now().toString(),
            role: "assistant",
            content: `Fehler: ${error.message}`,
            timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
          },
        ],
      }));
    }
  };

  const handleUserSpeaksImageSelection = (imageUrl: string) => {
    setCurrentState(prev => ({
      ...prev,
      videoWorkflowState: {
        ...prev.videoWorkflowState!,
        selectedImage: imageUrl,
        waitingFor: "prompt",
      },
      messages: [
        ...prev.messages,
        {
          id: Date.now().toString(),
          role: "assistant",
          content: `Perfekt! Jetzt beschreibe, wie die Person dein Produkt präsentieren soll.

**Beispiele:**
- "Ein sportlicher, junger Mann spricht nach dem Training im Fitnessstudio über die neuen Supplements"
- "Eine elegante Frau zeigt das Produkt in einem modernen Büro"
- "Ein begeisterter Kunde spricht authentisch über seine Erfahrungen"`,
          timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
        },
      ],
    }));
  };

  const handleImageToVideoProductSelection = async (productId: string) => {
    try {
      setIsLoading(true);

      // Fetch the selected product from database
      const { data: product, error } = await supabaseBrowserClient
        .from("business_products")
        .select("*")
        .eq("id", productId)
        .single();

      if (error || !product) {
        throw new Error("Produkt nicht gefunden");
      }

      // Extract product images
      let imageUrls: string[] = [];
      const productImages = product.product_images;
      if (Array.isArray(productImages)) {
        imageUrls = productImages.filter((img): img is string => typeof img === 'string');
      } else if (productImages && typeof productImages === 'object') {
        imageUrls = Object.values(productImages).filter((val): val is string => typeof val === 'string');
      }

      if (imageUrls.length === 0) {
        throw new Error("Keine Bilder für dieses Produkt gefunden");
      }

      // Update state: save product, set waitingFor to "image", show image selector
      setCurrentState(prev => ({
        ...prev,
        videoWorkflowState: {
          ...prev.videoWorkflowState!,
          selectedProduct: product,
          waitingFor: "image",
        },
        messages: [
          ...prev.messages,
          {
            id: Date.now().toString(),
            role: "assistant",
            content: `Großartig! Du hast "${product.product_name}" ausgewählt.

Wähle jetzt EIN Bild aus, das im Video verwendet werden soll:

[IMAGE_TO_VIDEO_IMAGE_SELECTOR:${JSON.stringify({
              images: imageUrls,
              productName: product.product_name,
            })}]`,
            timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
          },
        ],
      }));

      setIsLoading(false);
    } catch (error: any) {
      console.error("Error in handleImageToVideoProductSelection:", error);
      setIsLoading(false);
      setCurrentState(prev => ({
        ...prev,
        messages: [
          ...prev.messages,
          {
            id: Date.now().toString(),
            role: "assistant",
            content: `Fehler: ${error.message}`,
            timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
          },
        ],
      }));
    }
  };

  const handleUserSpeaksVideoGeneration = async (prompt?: string) => {
    try {
      const product = currentState.videoWorkflowState?.selectedProduct;
      const selectedImage = currentState.videoWorkflowState?.selectedImage;
      const videoPrompt = prompt || currentState.videoWorkflowState?.personDescription;

      if (!product || !selectedImage || !videoPrompt) {
        console.error("Missing data for user speaks video generation:", {
          product: !!product,
          selectedImage: !!selectedImage,
          prompt: !!videoPrompt,
        });
        throw new Error("Fehlende Daten für Video-Erstellung");
      }

      // Set generation state to show loading indicator
      setCurrentState(prev => ({
        ...prev,
        generationState: {
          isGenerating: true,
          type: "video",
          message: "Video wird erstellt",
        },
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

      // Call user speaks webhook to start the job
      const response = await fetch("/api/webhook/user-speaks-video", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          userId: userData.user.id,
          businessId: business.id,
          productId: product.id,
          selectedImage,
          prompt: videoPrompt,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        console.error("User speaks webhook error:", errorData);
        throw new Error(errorData.details || errorData.error || "Video-Erstellung fehlgeschlagen");
      }

      const result = await response.json();

      if (!result.jobId) {
        throw new Error("Keine Job-ID erhalten");
      }

      const jobId = result.jobId;
      console.log("User speaks video generation started, job ID:", jobId);

      // Poll for job completion
      const maxPollingAttempts = 120; // 120 * 5 seconds = 10 minutes max
      let attempts = 0;

      const pollStatus = async (): Promise<void> => {
        if (attempts >= maxPollingAttempts) {
          throw new Error("Video-Erstellung hat zu lange gedauert (über 10 Minuten)");
        }

        attempts++;

        // Add cache busting to prevent cached responses
        const statusResponse = await fetch(`/api/campaign-status/${jobId}?t=${Date.now()}`, {
          cache: 'no-store',
        });

        if (!statusResponse.ok) {
          throw new Error("Fehler beim Abrufen des Job-Status");
        }

        const statusData = await statusResponse.json();
        console.log(`[User Speaks Polling ${attempts}] Status: ${statusData.job?.status}, VideoUrl: ${statusData.job?.videoUrl ? 'present' : 'null'}`);

        const { status, videoUrl, errorMessage } = statusData.job;

        if (status === "completed") {
          console.log(`[User Speaks Polling ${attempts}] Completed! Video URL:`, videoUrl);
          if (!videoUrl) {
            console.error(`[User Speaks Polling ${attempts}] No video URL found!`);
            throw new Error("Video wurde erstellt, aber keine URL gefunden");
          }

          // Video is ready, display it
          onPreviewUpdate?.(videoUrl);

          // Set generation params so save button works
          onGenerationParamsUpdate?.({
            prompt: videoPrompt,
            workflow: "user_speaks",
            jobId: jobId,
            productId: product.id,
            productCategory: product.category,
            productName: product.product_name,
            businessId: business.id,
            selectedImage,
          });

          setCurrentState((prev) => ({
            ...prev,
            isComplete: true,
            generationState: {
              isGenerating: false,
              type: null,
            },
            messages: [
              ...prev.messages,
              {
                id: Date.now().toString(),
                role: "assistant",
                content: `✓ Dein Video ist fertig! Du kannst es jetzt im Vorschaufenster sehen.`,
                timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
              },
            ],
          }));
          return;
        } else if (status === "failed") {
          throw new Error(errorMessage || "Video-Erstellung ist fehlgeschlagen");
        }

        // Still processing, wait and poll again
        await new Promise(resolve => setTimeout(resolve, 5000));
        await pollStatus();
      };

      await pollStatus();
    } catch (error: any) {
      console.error("Error generating user speaks video:", error);
      setCurrentState((prev) => ({
        ...prev,
        generationState: {
          isGenerating: false,
          type: null,
        },
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
    }
  };

  // IMAGE TO VIDEO HANDLERS
  const handleImageToVideoImageSelection = (imageUrl: string) => {
    setCurrentState(prev => ({
      ...prev,
      videoWorkflowState: {
        ...prev.videoWorkflowState!,
        selectedImage: imageUrl,
        waitingFor: "prompt",
      },
      messages: [
        ...prev.messages,
        {
          id: Date.now().toString(),
          role: "assistant",
          content: `Perfekt! Ich habe dein Bild ausgewählt.\n\nJetzt beschreibe, wie das Video aussehen soll (z.B. Kamerabewegung, Effekte, Stimmung). Oder klicke auf "Inspiriere mich" für KI-generierte Vorschläge!\n\n[IMAGE_TO_VIDEO_INSPIRIERE_MICH]`,
          timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
        },
      ],
    }));
  };

  const handleImageToVideoInspiration = async () => {
    try {
      // Get product and business data
      const { data: { user } } = await supabaseBrowserClient.auth.getUser();
      if (!user) return;

      const product = currentState.videoWorkflowState?.selectedProduct;
      if (!product) return;

      const { data: business } = await supabaseBrowserClient
        .from("businesses")
        .select("*")
        .eq("user_id", user.id)
        .single();

      if (!business) return;

      const selectedImage = currentState.videoWorkflowState?.selectedImage;

      // Show loading message
      setCurrentState(prev => ({
        ...prev,
        messages: [
          ...prev.messages,
          {
            id: Date.now().toString(),
            role: "assistant",
            content: "✨ Ich generiere kreative Video-Ideen für dich...",
            timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
          },
        ],
      }));

      // Call video prompt ideas webhook
      const response = await fetch("/api/webhook/video-prompt-ideas", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          selectedImage,
          productDescription: product.description || "",
          category: product.category || null,
          benefits: product.benefits || [],
        }),
      });

      if (!response.ok) {
        throw new Error("Fehler beim Abrufen der Prompt-Ideen");
      }

      const result = await response.json();

      // Display the ideas as clickable buttons
      setCurrentState(prev => ({
        ...prev,
        messages: [
          ...prev.messages.slice(0, -1), // Remove loading message
          {
            id: Date.now().toString(),
            role: "assistant",
            content: `Hier sind 3 kreative Video-Ideen für dich:\n\n[IMAGE_TO_VIDEO_PROMPT_IDEAS:${JSON.stringify({ ideas: result.ideas })}]`,
            timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
          },
        ],
      }));
    } catch (error: any) {
      console.error("Error getting prompt ideas:", error);
      setCurrentState(prev => ({
        ...prev,
        messages: [
          ...prev.messages.slice(0, -1), // Remove loading message
          {
            id: Date.now().toString(),
            role: "assistant",
            content: `Fehler beim Abrufen der Ideen: ${error.message}. Bitte beschreibe deine Video-Idee selbst.`,
            timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
          },
        ],
      }));
    }
  };

  const handleImageToVideoPromptIdeaSelect = (selectedIdea: string) => {
    // Auto-fill chat input with selected idea
    // This will be handled by the ChatInput component via a callback
    // For now, we'll simulate a user message
    const userMessage: Message = {
      id: Date.now().toString(),
      role: "user",
      content: selectedIdea,
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    };

    setCurrentState(prev => ({
      ...prev,
      messages: [...prev.messages, userMessage],
    }));

    // Trigger video generation with the selected idea
    setIsLoading(true);
    handleImageToVideoGeneration(selectedIdea);
  };

  const handleImageToVideoGeneration = async (prompt: string) => {
    try {
      // Get user, business, and product
      const { data: { user } } = await supabaseBrowserClient.auth.getUser();
      if (!user) {
        throw new Error("Nicht angemeldet");
      }

      const product = currentState.videoWorkflowState?.selectedProduct;
      if (!product) {
        throw new Error("Kein Produkt ausgewählt");
      }

      const { data: business } = await supabaseBrowserClient
        .from("businesses")
        .select("*")
        .eq("user_id", user.id)
        .single();

      if (!business) {
        throw new Error("Kein Business-Profil gefunden");
      }

      const selectedImage = currentState.videoWorkflowState?.selectedImage;
      if (!selectedImage) {
        throw new Error("Kein Bild ausgewählt");
      }

      const videoPrompt = prompt;

      // Show generation message
      setCurrentState((prev) => ({
        ...prev,
        generationState: {
          isGenerating: true,
          type: "video",
          message: "Erstelle Video...",
        },
        videoWorkflowState: {
          ...prev.videoWorkflowState!,
          videoPrompt: prompt,
          waitingFor: null,
        },
        messages: [
          ...prev.messages,
          {
            id: Date.now().toString(),
            role: "assistant",
            content: `Super! Ich erstelle jetzt dein Video mit dieser Beschreibung: "${prompt}"\n\nDas wird einen Moment dauern...`,
            timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
          },
        ],
      }));

      // Call the image-to-video webhook
      const response = await fetch("/api/webhook/image-to-video", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          userId: user.id,
          businessId: business.id,
          productId: product.id,
          selectedImage,
          prompt: videoPrompt,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        console.error("Image to video webhook error:", errorData);
        throw new Error(errorData.details || errorData.error || "Video-Erstellung fehlgeschlagen");
      }

      const result = await response.json();

      if (!result.jobId) {
        throw new Error("Keine Job-ID erhalten");
      }

      const jobId = result.jobId;
      console.log("Image to video generation started, job ID:", jobId);

      // Poll for job completion
      const maxPollingAttempts = 120; // 120 * 5 seconds = 10 minutes max
      let attempts = 0;

      const pollStatus = async (): Promise<void> => {
        if (attempts >= maxPollingAttempts) {
          throw new Error("Video-Erstellung hat zu lange gedauert (über 10 Minuten)");
        }

        attempts++;

        // Add cache busting to prevent cached responses
        const statusResponse = await fetch(`/api/campaign-status/${jobId}?t=${Date.now()}`, {
          cache: 'no-store',
        });

        if (!statusResponse.ok) {
          throw new Error("Fehler beim Abrufen des Job-Status");
        }

        const statusData = await statusResponse.json();
        console.log(`[Image to Video Polling ${attempts}] Status: ${statusData.job?.status}, VideoUrl: ${statusData.job?.videoUrl ? 'present' : 'null'}`);

        const { status, videoUrl, errorMessage } = statusData.job;

        if (status === "completed") {
          console.log(`[Image to Video Polling ${attempts}] Completed! Video URL:`, videoUrl);
          if (!videoUrl) {
            console.error(`[Image to Video Polling ${attempts}] No video URL found!`);
            throw new Error("Video wurde erstellt, aber keine URL gefunden");
          }

          // Video is ready, display it
          onPreviewUpdate?.(videoUrl);

          // Set generation params so save button works
          onGenerationParamsUpdate?.({
            prompt: videoPrompt,
            workflow: "image_to_video",
            jobId: jobId,
            productId: product.id,
            productCategory: product.category,
            productName: product.product_name,
            businessId: business.id,
            selectedImage,
          });

          setCurrentState((prev) => ({
            ...prev,
            isComplete: true,
            generationState: {
              isGenerating: false,
              type: null,
            },
            messages: [
              ...prev.messages,
              {
                id: Date.now().toString(),
                role: "assistant",
                content: `✓ Dein Video ist fertig! Du kannst es jetzt im Vorschaufenster sehen.`,
                timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
              },
            ],
          }));
          return;
        } else if (status === "failed") {
          throw new Error(errorMessage || "Video-Erstellung ist fehlgeschlagen");
        }

        // Still processing, wait and poll again
        await new Promise(resolve => setTimeout(resolve, 5000));
        await pollStatus();
      };

      await pollStatus();
    } catch (error: any) {
      console.error("Error generating image to video:", error);
      setCurrentState((prev) => ({
        ...prev,
        generationState: {
          isGenerating: false,
          type: null,
        },
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

  const handleBilderProductSelection = async (productId: string) => {
    // Get the product details
    try {
      const { data: { user } } = await supabaseBrowserClient.auth.getUser();
      if (!user) return;

      const { data: product } = await supabaseBrowserClient
        .from("business_products")
        .select("*")
        .eq("id", productId)
        .single();

      if (!product) return;

      setCurrentState(prev => ({
        ...prev,
        bilderWorkflowState: {
          ...prev.bilderWorkflowState!,
          selectedProduct: product,
        },
        messages: [
          ...prev.messages,
          {
            id: Date.now().toString(),
            role: "assistant",
            content: `Großartig! Du hast "${product.product_name}" ausgewählt.\n\nWähle jetzt die Produktbilder aus, die als Referenz dienen sollen:\n\n[BILDER_PRODUCT_IMAGES:${JSON.stringify({
              images: product.product_images || [],
              productName: product.product_name,
            })}]`,
            timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
          },
        ],
      }));
    } catch (error) {
      console.error("Error selecting product:", error);
    }
  };

  const handleBilderProductImagesConfirm = (selectedImages: string[]) => {
    setCurrentState(prev => ({
      ...prev,
      bilderWorkflowState: {
        ...prev.bilderWorkflowState!,
        selectedProductImages: selectedImages,
      },
      lastGenerationParams: {
        prompt: prev.lastGenerationParams?.prompt || "",
        ...prev.lastGenerationParams,
        productImages: selectedImages,
      },
      messages: [
        ...prev.messages,
        {
          id: Date.now().toString(),
          role: "assistant",
          content: `Perfect! Ich habe ${selectedImages.length} Produktbild${selectedImages.length > 1 ? 'er' : ''} ausgewählt.\n\nJetzt beschreibe, was für ein Marketingbild du erstellen möchtest. Ich werde deine Produktbilder als Referenz verwenden.`,
          timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
        },
      ],
    }));
  };

  const saveImagesToGallery = async (
    imageUrls: string[],
    productName: string,
    jobId?: string,
    businessId?: string,
    productId?: string,
    productCategory?: string
  ) => {
    try {
      const { saveProject } = await import("@/lib/gallery/galleryService");

      for (const imageUrl of imageUrls) {
        await saveProject({
          product_type: 1, // Social Media Paket
          image_url: imageUrl,
          project_name: `${productName} - Kampagne - ${new Date().toLocaleDateString()}`,
          campaign_job_id: jobId,
          workflow_type: 'campaign_images',
          generation_params: {
            prompt: `Campaign images for ${productName}`,
            product: productName,
            campaignType: "product",
            workflow: 'campaign_images',
            jobId: jobId,
            businessId: businessId,
            productId: productId,
            productCategory: productCategory,
            productName: productName,
          } as any,
        });
      }

      console.log(`Saved ${imageUrls.length} images to gallery`);
    } catch (error) {
      console.error("Failed to save images to gallery:", error);
      // Don't fail the whole process if saving fails
    }
  };

  return (
    <div className="flex flex-col h-full bg-white dark:bg-gray-950">
      <ChatMessages
        messages={currentState.messages}
        onImageSelection={selectedProductId === 0 || selectedProductId === 2 ? handleImageSelection : undefined}
        onProductSelection={selectedProductId === 0 || selectedProductId === 1 || selectedProductId === 2 ? handleProductSelection : undefined}
        onCampaignTypeSelection={selectedProductId === 1 ? handleCampaignTypeSelection : undefined}
        onCampaignImageSelection={selectedProductId === 1 ? handleCampaignImageSelection : undefined}
        onCampaignGeneratedImageView={selectedProductId === 1 ? handleViewGeneratedCampaignImage : undefined}
        onCampaignImageEdit={selectedProductId === 1 ? handleCampaignImageEdit : undefined}
        campaignState={
          selectedProductId === 1
            ? {
                isGenerating: currentState.campaignState?.isGenerating,
                isEditingImage: currentState.campaignState?.isEditingImage,
              }
            : undefined
        }
        onBilderWorkflowSelection={selectedProductId === 0 ? handleBilderWorkflowSelection : undefined}
        onBilderProductImagesConfirm={selectedProductId === 0 ? handleBilderProductImagesConfirm : undefined}
        onVideoWorkflowSelection={selectedProductId === 2 ? handleVideoWorkflowSelection : undefined}
        onSocialBoostSubWorkflowSelection={selectedProductId === 2 ? handleSocialBoostSubWorkflowSelection : undefined}
        onProductRotationImageSelection={selectedProductId === 2 ? handleProductRotationImageSelection : undefined}
        onAiExplainsImageSelection={selectedProductId === 2 ? handleAiExplainsImageSelection : undefined}
        onUserSpeaksImageSelection={selectedProductId === 2 ? handleUserSpeaksImageSelection : undefined}
        onImageToVideoImageSelection={selectedProductId === 2 ? handleImageToVideoImageSelection : undefined}
        onImageToVideoInspiration={selectedProductId === 2 ? handleImageToVideoInspiration : undefined}
        onImageToVideoPromptIdeaSelect={selectedProductId === 2 ? handleImageToVideoPromptIdeaSelect : undefined}
        isGeneratingContent={currentState.generationState?.isGenerating}
        generationType={currentState.generationState?.type || undefined}
        generationMessage={currentState.generationState?.message}
      />
      <ChatInput onSendMessage={handleSendMessage} disabled={isLoading || (currentState.isComplete && !currentState.isRefining)} />
    </div>
  );
}


