"use client";

import { motion } from "framer-motion";
import ReactMarkdown from "react-markdown";
import { useState } from "react";
import ProductSelectionCards from "./ProductSelectionCards";
import CampaignTypeSelector from "./CampaignTypeSelector";
import ProductSelector from "./ProductSelector";
import ProductImageSelector from "./ProductImageSelector";
import GeneratedImagesDisplay from "./GeneratedImagesDisplay";
import BilderWorkflowSelector from "./BilderWorkflowSelector";
import VideoWorkflowSelector from "./VideoWorkflowSelector";
import SocialBoostSubWorkflowSelector from "./SocialBoostSubWorkflowSelector";
import ProductImagesMultiSelector from "./ProductImagesMultiSelector";
import MediaThumbnail from "./MediaThumbnail";
import { Database } from "@/types/database";

type BusinessProduct = Database["public"]["Tables"]["business_products"]["Row"];

interface MessageBubbleProps {
  message: string;
  isUser: boolean;
  timestamp?: string;
  index?: number;
  imageUrls?: string[];
  onImageSelection?: (selectedUrls: string[]) => void;
  onProductSelection?: (productId: string) => void;
  onCampaignTypeSelection?: (type: "product" | "concept" | "political") => void;
  onCampaignImageSelection?: (imageUrl: string) => void;
  onCampaignGeneratedImageView?: (imageUrl: string) => void;
  onCampaignImageEdit?: (imageUrl: string, editPrompt: string) => void;
  campaignState?: {
    isGenerating?: boolean;
    isEditingImage?: boolean;
  };
  // Bilder workflow handlers
  onBilderWorkflowSelection?: (workflow: "product" | "combine" | "freebird") => void;
  onBilderProductImagesConfirm?: (selectedImages: string[]) => void;
  // Video workflow handlers
  onVideoWorkflowSelection?: (workflow: "product-rotation" | "user-speaks" | "image-to-video" | "inspirational" | "ai-explains") => void;
  onSocialBoostSubWorkflowSelection?: (subWorkflow: "product-rotation" | "user-speaks" | "image-to-video" | "political-campaign") => void;
  onProductRotationImageSelection?: (imageUrl: string) => void;
  onAiExplainsImageSelection?: (imageUrl: string) => void;
  onUserSpeaksImageSelection?: (imageUrl: string) => void;
  // Image to Video workflow handlers
  onImageToVideoImageSelection?: (imageUrl: string) => void;
  onImageToVideoInspiration?: () => void;
  onImageToVideoPromptIdeaSelect?: (idea: string) => void;
  // Media thumbnail handlers
  mediaThumbnail?: {
    url: string;
    type: "image" | "video";
    isEdit?: boolean;
  };
  onMediaThumbnailClick?: (url: string, type: "image" | "video") => void;
}

export default function MessageBubble({
  message,
  isUser,
  timestamp,
  index = 0,
  imageUrls,
  onImageSelection,
  onProductSelection,
  onCampaignTypeSelection,
  onCampaignImageSelection,
  onCampaignGeneratedImageView,
  onCampaignImageEdit,
  campaignState,
  onBilderWorkflowSelection,
  onBilderProductImagesConfirm,
  onVideoWorkflowSelection,
  onSocialBoostSubWorkflowSelection,
  onProductRotationImageSelection,
  onAiExplainsImageSelection,
  onUserSpeaksImageSelection,
  onImageToVideoImageSelection,
  onImageToVideoInspiration,
  onImageToVideoPromptIdeaSelect,
  mediaThumbnail,
  onMediaThumbnailClick,
}: MessageBubbleProps) {
  const [selectedImages, setSelectedImages] = useState<string[]>([]);

  // Parse product selection data from message content
  const parseProductSelectionFromMessage = (msg: string): { cleanMessage: string; products: BusinessProduct[] | null } => {
    const startMarker = '[PRODUCT_SELECTION:';
    const startIndex = msg.indexOf(startMarker);

    if (startIndex === -1) {
      return { cleanMessage: msg, products: null };
    }

    // Find the matching closing bracket by counting brackets
    let bracketCount = 0;
    let endIndex = -1;
    let i = startIndex + startMarker.length;

    for (; i < msg.length; i++) {
      if (msg[i] === '[') {
        bracketCount++;
      } else if (msg[i] === ']') {
        if (bracketCount === 0) {
          // This is the closing bracket for PRODUCT_SELECTION
          endIndex = i;
          break;
        }
        bracketCount--;
      }
    }

    if (endIndex === -1) {
      console.error("Could not find closing bracket for PRODUCT_SELECTION");
      return { cleanMessage: msg, products: null };
    }

    // Extract the JSON string
    const jsonStr = msg.substring(startIndex + startMarker.length, endIndex);

    let products: BusinessProduct[] | null = null;
    try {
      products = JSON.parse(jsonStr);
    } catch (error) {
      console.error("Error parsing product selection:", error, "JSON:", jsonStr);
      return { cleanMessage: msg, products: null };
    }

    // Remove the entire marker from the message
    const fullMarker = msg.substring(startIndex, endIndex + 1);
    const cleanMsg = msg.replace(fullMarker, '').trim();

    return { cleanMessage: cleanMsg, products };
  };

  // Parse images from message content if they're embedded in the text
  const parseImagesFromMessage = (msg: string): { cleanMessage: string; parsedImageUrls: string[] } => {
    const imagePattern = /\[Hochgeladene Bilder:\s*([^\]]+)\]/g;
    const productImagePattern = /\[Produktbilder:\s*([^\]]+)\]/g;
    let parsedUrls: string[] = [];
    let cleanMsg = msg;

    // Parse [Hochgeladene Bilder: ...]
    const matches = msg.matchAll(imagePattern);
    for (const match of matches) {
      const urlString = match[1];
      const urls = urlString.split(',').map(url => url.trim()).filter(url => url.length > 0);
      parsedUrls.push(...urls);
      // Remove the image marker from the message
      cleanMsg = cleanMsg.replace(match[0], '').trim();
    }

    // Parse and REMOVE [Produktbilder: ...] from display (we don't need to show it)
    const productMatches = msg.matchAll(productImagePattern);
    for (const match of productMatches) {
      // Just remove it from the message, don't parse the URLs
      cleanMsg = cleanMsg.replace(match[0], '').trim();
    }

    return { cleanMessage: cleanMsg, parsedImageUrls: parsedUrls };
  };

  // Parse campaign markers from message
  const parseCampaignMarkers = (msg: string): {
    cleanMessage: string;
    showCampaignTypeSelector: boolean;
    showCampaignProductSelector: boolean;
    campaignImageSelectorData: { images: string[]; productName: string } | null;
    campaignGeneratedImages: string[] | null;
  } => {
    let cleanMsg = msg;
    let showCampaignTypeSelector = false;
    let showCampaignProductSelector = false;
    let campaignImageSelectorData = null;
    let campaignGeneratedImages = null;

    // Check for [CAMPAIGN_TYPE_SELECTOR]
    if (cleanMsg.includes('[CAMPAIGN_TYPE_SELECTOR]')) {
      showCampaignTypeSelector = true;
      cleanMsg = cleanMsg.replace('[CAMPAIGN_TYPE_SELECTOR]', '').trim();
    }

    // Check for [CAMPAIGN_PRODUCT_SELECTOR]
    if (cleanMsg.includes('[CAMPAIGN_PRODUCT_SELECTOR]')) {
      showCampaignProductSelector = true;
      cleanMsg = cleanMsg.replace('[CAMPAIGN_PRODUCT_SELECTOR]', '').trim();
    }

    // Check for [CAMPAIGN_IMAGE_SELECTOR:{...}] using brace counting for robust parsing
    const imageSelectorMarker = '[CAMPAIGN_IMAGE_SELECTOR:';
    const imageSelectorStart = cleanMsg.indexOf(imageSelectorMarker);
    if (imageSelectorStart !== -1) {
      // Find matching closing bracket by counting braces
      let braceCount = 0;
      let endIndex = -1;
      let i = imageSelectorStart + imageSelectorMarker.length;

      for (; i < cleanMsg.length; i++) {
        if (cleanMsg[i] === '{') {
          braceCount++;
        } else if (cleanMsg[i] === '}') {
          braceCount--;
          if (braceCount === 0) {
            endIndex = i;
            break;
          }
        }
      }

      if (endIndex !== -1) {
        // Check if there's a closing ] after the }
        if (cleanMsg[endIndex + 1] === ']') {
          const jsonStr = cleanMsg.substring(imageSelectorStart + imageSelectorMarker.length, endIndex + 1);
          try {
            campaignImageSelectorData = JSON.parse(jsonStr);
            const fullMarker = cleanMsg.substring(imageSelectorStart, endIndex + 2);
            cleanMsg = cleanMsg.replace(fullMarker, '').trim();
          } catch (error) {
            console.error("Error parsing campaign image selector data:", error, "JSON:", jsonStr);
          }
        }
      }
    }

    // Check for [CAMPAIGN_GENERATED_IMAGES:[...]] using bracket counting
    const generatedImagesMarker = '[CAMPAIGN_GENERATED_IMAGES:';
    const generatedImagesStart = cleanMsg.indexOf(generatedImagesMarker);
    if (generatedImagesStart !== -1) {
      // Find matching closing bracket by counting brackets
      let bracketCount = 0;
      let endIndex = -1;
      let i = generatedImagesStart + generatedImagesMarker.length;

      for (; i < cleanMsg.length; i++) {
        if (cleanMsg[i] === '[') {
          bracketCount++;
        } else if (cleanMsg[i] === ']') {
          bracketCount--;
          if (bracketCount === 0) {
            endIndex = i;
            break;
          }
        }
      }

      if (endIndex !== -1) {
        // Check if there's a closing ] after the array ]
        if (cleanMsg[endIndex + 1] === ']') {
          const jsonStr = cleanMsg.substring(generatedImagesStart + generatedImagesMarker.length, endIndex + 1);
          try {
            campaignGeneratedImages = JSON.parse(jsonStr);
            const fullMarker = cleanMsg.substring(generatedImagesStart, endIndex + 2);
            cleanMsg = cleanMsg.replace(fullMarker, '').trim();
          } catch (error) {
            console.error("Error parsing campaign generated images:", error, "JSON:", jsonStr);
          }
        }
      }
    }

    return {
      cleanMessage: cleanMsg,
      showCampaignTypeSelector,
      showCampaignProductSelector,
      campaignImageSelectorData,
      campaignGeneratedImages,
    };
  };

  // Parse Bilder workflow markers
  const parseBilderWorkflowMarkers = (msg: string): {
    cleanMessage: string;
    showBilderWorkflowSelector: boolean;
    showBilderProductSelector: boolean;
    bilderProductImagesData: { images: string[]; productName: string } | null;
  } => {
    let cleanMsg = msg;
    let showBilderWorkflowSelector = false;
    let showBilderProductSelector = false;
    let bilderProductImagesData = null;

    // Check for [BILDER_WORKFLOW_SELECTOR]
    if (cleanMsg.includes('[BILDER_WORKFLOW_SELECTOR]')) {
      showBilderWorkflowSelector = true;
      cleanMsg = cleanMsg.replace('[BILDER_WORKFLOW_SELECTOR]', '').trim();
    }

    // Check for [BILDER_PRODUCT_SELECTOR]
    if (cleanMsg.includes('[BILDER_PRODUCT_SELECTOR]')) {
      showBilderProductSelector = true;
      cleanMsg = cleanMsg.replace('[BILDER_PRODUCT_SELECTOR]', '').trim();
    }

    // Check for [BILDER_PRODUCT_IMAGES:{...}]
    const imagesMarker = '[BILDER_PRODUCT_IMAGES:';
    const imagesStart = cleanMsg.indexOf(imagesMarker);
    if (imagesStart !== -1) {
      let braceCount = 0;
      let endIndex = -1;
      let i = imagesStart + imagesMarker.length;

      for (; i < cleanMsg.length; i++) {
        if (cleanMsg[i] === '{') {
          braceCount++;
        } else if (cleanMsg[i] === '}') {
          braceCount--;
          if (braceCount === 0) {
            endIndex = i;
            break;
          }
        }
      }

      if (endIndex !== -1 && cleanMsg[endIndex + 1] === ']') {
        const jsonStr = cleanMsg.substring(imagesStart + imagesMarker.length, endIndex + 1);
        try {
          bilderProductImagesData = JSON.parse(jsonStr);
          const fullMarker = cleanMsg.substring(imagesStart, endIndex + 2);
          cleanMsg = cleanMsg.replace(fullMarker, '').trim();
        } catch (error) {
          console.error("Error parsing Bilder product images data:", error, "JSON:", jsonStr);
        }
      }
    }

    return {
      cleanMessage: cleanMsg,
      showBilderWorkflowSelector,
      showBilderProductSelector,
      bilderProductImagesData,
    };
  };

  const parseVideoWorkflowMarkers = (msg: string): {
    cleanMessage: string;
    showVideoWorkflowSelector: boolean;
    showSocialBoostSubWorkflowSelector: boolean;
    showVideoProductSelector: boolean;
    productRotationImageSelectorData: { images: string[]; productName: string } | null;
    aiExplainsImageSelectorData: { images: string[]; productName: string } | null;
    userSpeaksImageSelectorData: { images: string[]; productName: string } | null;
    imageToVideoImageSelectorData: { images: string[]; productName: string } | null;
    showImageToVideoInspireButton: boolean;
    imageToVideoPromptIdeas: string[] | null;
  } => {
    let cleanMsg = msg;
    let showVideoWorkflowSelector = false;
    let showSocialBoostSubWorkflowSelector = false;
    let showVideoProductSelector = false;
    let productRotationImageSelectorData = null;
    let aiExplainsImageSelectorData = null;
    let userSpeaksImageSelectorData = null;
    let imageToVideoImageSelectorData = null;
    let showImageToVideoInspireButton = false;
    let imageToVideoPromptIdeas = null;

    // Check for [VIDEO_WORKFLOW_SELECTOR]
    if (cleanMsg.includes('[VIDEO_WORKFLOW_SELECTOR]')) {
      showVideoWorkflowSelector = true;
      cleanMsg = cleanMsg.replace('[VIDEO_WORKFLOW_SELECTOR]', '').trim();
    }

    // Check for [SOCIAL_BOOST_SUB_WORKFLOW_SELECTOR]
    if (cleanMsg.includes('[SOCIAL_BOOST_SUB_WORKFLOW_SELECTOR]')) {
      showSocialBoostSubWorkflowSelector = true;
      cleanMsg = cleanMsg.replace('[SOCIAL_BOOST_SUB_WORKFLOW_SELECTOR]', '').trim();
    }

    // Check for [VIDEO_PRODUCT_SELECTOR]
    if (cleanMsg.includes('[VIDEO_PRODUCT_SELECTOR]')) {
      showVideoProductSelector = true;
      cleanMsg = cleanMsg.replace('[VIDEO_PRODUCT_SELECTOR]', '').trim();
    }

    // Check for [PRODUCT_ROTATION_IMAGE_SELECTOR:{...}]
    const productRotationMarker = '[PRODUCT_ROTATION_IMAGE_SELECTOR:';
    const productRotationStart = cleanMsg.indexOf(productRotationMarker);
    if (productRotationStart !== -1) {
      let braceCount = 0;
      let endIndex = -1;
      let i = productRotationStart + productRotationMarker.length;

      for (; i < cleanMsg.length; i++) {
        if (cleanMsg[i] === '{') {
          braceCount++;
        } else if (cleanMsg[i] === '}') {
          braceCount--;
          if (braceCount === 0) {
            endIndex = i;
            break;
          }
        }
      }

      if (endIndex !== -1 && cleanMsg[endIndex + 1] === ']') {
        const jsonStr = cleanMsg.substring(productRotationStart + productRotationMarker.length, endIndex + 1);
        try {
          productRotationImageSelectorData = JSON.parse(jsonStr);
          const fullMarker = cleanMsg.substring(productRotationStart, endIndex + 2);
          cleanMsg = cleanMsg.replace(fullMarker, '').trim();
        } catch (error) {
          console.error("Error parsing Product Rotation image selector data:", error, "JSON:", jsonStr);
        }
      }
    }

    // Check for [AI_EXPLAINS_IMAGE_SELECTOR:{...}]
    const aiExplainsMarker = '[AI_EXPLAINS_IMAGE_SELECTOR:';
    const aiExplainsStart = cleanMsg.indexOf(aiExplainsMarker);
    if (aiExplainsStart !== -1) {
      let braceCount = 0;
      let endIndex = -1;
      let i = aiExplainsStart + aiExplainsMarker.length;

      for (; i < cleanMsg.length; i++) {
        if (cleanMsg[i] === '{') {
          braceCount++;
        } else if (cleanMsg[i] === '}') {
          braceCount--;
          if (braceCount === 0) {
            endIndex = i;
            break;
          }
        }
      }

      if (endIndex !== -1 && cleanMsg[endIndex + 1] === ']') {
        const jsonStr = cleanMsg.substring(aiExplainsStart + aiExplainsMarker.length, endIndex + 1);
        try {
          aiExplainsImageSelectorData = JSON.parse(jsonStr);
          const fullMarker = cleanMsg.substring(aiExplainsStart, endIndex + 2);
          cleanMsg = cleanMsg.replace(fullMarker, '').trim();
        } catch (error) {
          console.error("Error parsing AI Explains image selector data:", error, "JSON:", jsonStr);
        }
      }
    }

    // Check for [USER_SPEAKS_IMAGE_SELECTOR:{...}]
    const userSpeaksMarker = '[USER_SPEAKS_IMAGE_SELECTOR:';
    const userSpeaksStart = cleanMsg.indexOf(userSpeaksMarker);
    if (userSpeaksStart !== -1) {
      let braceCount = 0;
      let endIndex = -1;
      let i = userSpeaksStart + userSpeaksMarker.length;

      for (; i < cleanMsg.length; i++) {
        if (cleanMsg[i] === '{') {
          braceCount++;
        } else if (cleanMsg[i] === '}') {
          braceCount--;
          if (braceCount === 0) {
            endIndex = i;
            break;
          }
        }
      }

      if (endIndex !== -1 && cleanMsg[endIndex + 1] === ']') {
        const jsonStr = cleanMsg.substring(userSpeaksStart + userSpeaksMarker.length, endIndex + 1);
        try {
          userSpeaksImageSelectorData = JSON.parse(jsonStr);
          const fullMarker = cleanMsg.substring(userSpeaksStart, endIndex + 2);
          cleanMsg = cleanMsg.replace(fullMarker, '').trim();
        } catch (error) {
          console.error("Error parsing User Speaks image selector data:", error, "JSON:", jsonStr);
        }
      }
    }

    // Check for [IMAGE_TO_VIDEO_IMAGE_SELECTOR:{...}]
    const imageToVideoMarker = '[IMAGE_TO_VIDEO_IMAGE_SELECTOR:';
    const imageToVideoStart = cleanMsg.indexOf(imageToVideoMarker);
    if (imageToVideoStart !== -1) {
      let braceCount = 0;
      let endIndex = -1;
      let i = imageToVideoStart + imageToVideoMarker.length;

      for (; i < cleanMsg.length; i++) {
        if (cleanMsg[i] === '{') {
          braceCount++;
        } else if (cleanMsg[i] === '}') {
          braceCount--;
          if (braceCount === 0) {
            endIndex = i;
            break;
          }
        }
      }

      if (endIndex !== -1 && cleanMsg[endIndex + 1] === ']') {
        const jsonStr = cleanMsg.substring(imageToVideoStart + imageToVideoMarker.length, endIndex + 1);
        try {
          imageToVideoImageSelectorData = JSON.parse(jsonStr);
          const fullMarker = cleanMsg.substring(imageToVideoStart, endIndex + 2);
          cleanMsg = cleanMsg.replace(fullMarker, '').trim();
        } catch (error) {
          console.error("Error parsing Image to Video image selector data:", error, "JSON:", jsonStr);
        }
      }
    }

    // Check for [IMAGE_TO_VIDEO_INSPIRIERE_MICH]
    if (cleanMsg.includes('[IMAGE_TO_VIDEO_INSPIRIERE_MICH]')) {
      showImageToVideoInspireButton = true;
      cleanMsg = cleanMsg.replace('[IMAGE_TO_VIDEO_INSPIRIERE_MICH]', '').trim();
    }

    // Check for [IMAGE_TO_VIDEO_PROMPT_IDEAS:{...}]
    const promptIdeasMarker = '[IMAGE_TO_VIDEO_PROMPT_IDEAS:';
    const promptIdeasStart = cleanMsg.indexOf(promptIdeasMarker);
    if (promptIdeasStart !== -1) {
      let braceCount = 0;
      let endIndex = -1;
      let i = promptIdeasStart + promptIdeasMarker.length;

      for (; i < cleanMsg.length; i++) {
        if (cleanMsg[i] === '{') {
          braceCount++;
        } else if (cleanMsg[i] === '}') {
          braceCount--;
          if (braceCount === 0) {
            endIndex = i;
            break;
          }
        }
      }

      if (endIndex !== -1 && cleanMsg[endIndex + 1] === ']') {
        const jsonStr = cleanMsg.substring(promptIdeasStart + promptIdeasMarker.length, endIndex + 1);
        try {
          const data = JSON.parse(jsonStr);
          imageToVideoPromptIdeas = data.ideas || null;
          const fullMarker = cleanMsg.substring(promptIdeasStart, endIndex + 2);
          cleanMsg = cleanMsg.replace(fullMarker, '').trim();
        } catch (error) {
          console.error("Error parsing Image to Video prompt ideas:", error, "JSON:", jsonStr);
        }
      }
    }

    return {
      cleanMessage: cleanMsg,
      showVideoWorkflowSelector,
      showSocialBoostSubWorkflowSelector,
      showVideoProductSelector,
      productRotationImageSelectorData,
      aiExplainsImageSelectorData,
      userSpeaksImageSelectorData,
      imageToVideoImageSelectorData,
      showImageToVideoInspireButton,
      imageToVideoPromptIdeas,
    };
  };

  // Parse both products and images from message
  const { cleanMessage: msgAfterProducts, products } = parseProductSelectionFromMessage(message);
  const { cleanMessage: msgAfterImages, parsedImageUrls } = parseImagesFromMessage(msgAfterProducts);
  const {
    cleanMessage: msgAfterCampaign,
    showCampaignTypeSelector,
    showCampaignProductSelector,
    campaignImageSelectorData,
    campaignGeneratedImages,
  } = parseCampaignMarkers(msgAfterImages);
  const {
    cleanMessage: msgAfterBilder,
    showBilderWorkflowSelector,
    showBilderProductSelector,
    bilderProductImagesData,
  } = parseBilderWorkflowMarkers(msgAfterCampaign);
  const {
    cleanMessage,
    showVideoWorkflowSelector,
    showSocialBoostSubWorkflowSelector,
    showVideoProductSelector,
    productRotationImageSelectorData,
    aiExplainsImageSelectorData,
    userSpeaksImageSelectorData,
    imageToVideoImageSelectorData,
    showImageToVideoInspireButton,
    imageToVideoPromptIdeas,
  } = parseVideoWorkflowMarkers(msgAfterBilder);
  const allImageUrls = [...(imageUrls || []), ...parsedImageUrls];

  // Check if message contains card grids that need more width
  const hasCardGrids = !isUser && (
    (products && products.length > 0) ||
    showCampaignTypeSelector ||
    showCampaignProductSelector ||
    campaignImageSelectorData ||
    (campaignGeneratedImages && campaignGeneratedImages.length > 0) ||
    showBilderWorkflowSelector ||
    showBilderProductSelector ||
    bilderProductImagesData ||
    showVideoWorkflowSelector ||
    showSocialBoostSubWorkflowSelector ||
    showVideoProductSelector ||
    productRotationImageSelectorData ||
    aiExplainsImageSelectorData ||
    userSpeaksImageSelectorData ||
    imageToVideoImageSelectorData
  );

  // Handle product selection
  const handleProductSelect = (product: BusinessProduct) => {
    if (onProductSelection) {
      onProductSelection(product.id);
    }
  };

  // Handle image selection toggle
  const toggleImageSelection = (url: string) => {
    setSelectedImages(prev => {
      const isSelected = prev.includes(url);
      let newSelection: string[];

      if (isSelected) {
        // Deselect
        newSelection = prev.filter(u => u !== url);
      } else {
        // Select (max 5)
        if (prev.length >= 5) {
          return prev; // Don't add more than 5
        }
        newSelection = [...prev, url];
      }

      // Notify parent component
      if (onImageSelection) {
        onImageSelection(newSelection);
      }

      return newSelection;
    });
  };

  const bubbleVariants = {
    hidden: {
      opacity: 0,
      y: 20,
      scale: 0.95
    },
    visible: {
      opacity: 1,
      y: 0,
      scale: 1,
      transition: {
        duration: 0.4,
        ease: [0.23, 1, 0.32, 1] as any, // Custom easing for smooth feel
        delay: index * 0.05, // Stagger for initial load
      }
    }
  };

  const timestampVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        delay: 0.2,
        duration: 0.3
      }
    }
  };

  return (
    <motion.div
      className={`flex ${isUser ? "justify-end" : "justify-start"} mb-4`}
      variants={bubbleVariants}
      initial="hidden"
      animate="visible"
    >
      <div className={`flex gap-3 ${hasCardGrids ? 'max-w-3xl' : 'max-w-[80%]'} ${isUser ? "flex-row-reverse" : "flex-row"}`}>
        {!isUser && (
          <div className="flex-shrink-0 w-8 h-8 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
            <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09zM18.259 8.715L18 9.75l-.259-1.035a3.375 3.375 0 00-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 002.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 002.456 2.456L21.75 6l-1.035.259a3.375 3.375 0 00-2.456 2.456z" />
            </svg>
          </div>
        )}
        <div
          className={`rounded-2xl px-4 py-3 ${hasCardGrids ? 'w-full' : ''} ${
            isUser
              ? "bg-blue-600 text-white"
              : "bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-gray-100"
          }`}
        >
          {/* Display message content first */}
          {cleanMessage && (
            <div className="text-sm leading-relaxed prose prose-sm dark:prose-invert max-w-none">
              <ReactMarkdown
                components={{
                  p: ({ children }) => <p className="mb-2 last:mb-0">{children}</p>,
                  strong: ({ children }) => <strong className="font-semibold">{children}</strong>,
                  ul: ({ children }) => <ul className="list-disc list-inside space-y-1 my-2">{children}</ul>,
                  ol: ({ children }) => <ol className="list-decimal list-inside space-y-1 my-2">{children}</ol>,
                  li: ({ children }) => <li className="ml-2">{children}</li>,
                }}
              >
                {cleanMessage}
              </ReactMarkdown>
            </div>
          )}

          {/* Display product selection cards at the bottom */}
          {products && products.length > 0 && !isUser && (
            <div className="mt-3">
              <ProductSelectionCards
                products={products}
                onProductSelect={handleProductSelect}
              />
            </div>
          )}

          {/* Display campaign type selector */}
          {showCampaignTypeSelector && !isUser && onCampaignTypeSelection && (
            <div className="mt-3">
              <CampaignTypeSelector onSelectType={onCampaignTypeSelection} />
            </div>
          )}

          {/* Display campaign product selector */}
          {showCampaignProductSelector && !isUser && onProductSelection && (
            <div className="mt-3">
              <ProductSelector onSelectProduct={(product) => onProductSelection(product.id)} />
            </div>
          )}

          {/* Display campaign image selector */}
          {campaignImageSelectorData && !isUser && onCampaignImageSelection && (
            <div className="mt-3">
              <ProductImageSelector
                images={campaignImageSelectorData.images}
                productName={campaignImageSelectorData.productName}
                onSelectImage={onCampaignImageSelection}
              />
            </div>
          )}

          {/* Display generated campaign images */}
          {campaignGeneratedImages && campaignGeneratedImages.length > 0 && !isUser && onCampaignGeneratedImageView && (
            <div className="mt-3">
              <GeneratedImagesDisplay
                images={campaignGeneratedImages}
                onImageSelect={onCampaignGeneratedImageView}
                isEditing={campaignState?.isEditingImage || false}
              />
            </div>
          )}

          {/* Display Bilder workflow selector */}
          {showBilderWorkflowSelector && !isUser && onBilderWorkflowSelection && (
            <div className="mt-3">
              <BilderWorkflowSelector onSelectWorkflow={onBilderWorkflowSelection} />
            </div>
          )}

          {/* Display Bilder product selector */}
          {showBilderProductSelector && !isUser && onProductSelection && (
            <div className="mt-3">
              <ProductSelector onSelectProduct={(product) => onProductSelection(product.id)} />
            </div>
          )}

          {/* Display Bilder product images selector */}
          {bilderProductImagesData && !isUser && onBilderProductImagesConfirm && (
            <div className="mt-3">
              <ProductImagesMultiSelector
                images={bilderProductImagesData.images}
                productName={bilderProductImagesData.productName}
                onConfirmSelection={onBilderProductImagesConfirm}
              />
            </div>
          )}

          {/* Display Video workflow selector */}
          {showVideoWorkflowSelector && !isUser && onVideoWorkflowSelection && (
            <div className="mt-3">
              <VideoWorkflowSelector onSelectWorkflow={onVideoWorkflowSelection} />
            </div>
          )}

          {/* Display Social Boost sub-workflow selector */}
          {showSocialBoostSubWorkflowSelector && !isUser && onSocialBoostSubWorkflowSelection && (
            <div className="mt-3">
              <SocialBoostSubWorkflowSelector onSelectSubWorkflow={onSocialBoostSubWorkflowSelection} />
            </div>
          )}

          {/* Display Video product selector */}
          {showVideoProductSelector && !isUser && onProductSelection && (
            <div className="mt-3">
              <ProductSelector onSelectProduct={(product) => onProductSelection(product.id)} />
            </div>
          )}

          {/* Display Product Rotation image selector (single image selection) */}
          {productRotationImageSelectorData && !isUser && onProductRotationImageSelection && (
            <div className="mt-3 w-full sm:w-[480px] lg:w-[672px]">
              <div className="mb-2 text-sm text-gray-700 dark:text-gray-300 font-medium">
                Wähle ein Bild für dein Video:
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                {productRotationImageSelectorData.images.map((imageUrl, idx) => (
                  <motion.div
                    key={idx}
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.1 * idx }}
                    className="relative aspect-square rounded-lg overflow-hidden cursor-pointer border-2 border-transparent hover:border-orange-500 transition-all"
                    onClick={() => onProductRotationImageSelection(imageUrl)}
                  >
                    <img
                      src={imageUrl}
                      alt={`${productRotationImageSelectorData.productName} - Bild ${idx + 1}`}
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-black bg-opacity-0 hover:bg-opacity-10 transition-opacity flex items-center justify-center">
                      <div className="opacity-0 hover:opacity-100 transition-opacity bg-orange-600 text-white px-3 py-1 rounded-full text-sm">
                        Auswählen
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          )}

          {/* Display AI Explains image selector (single image selection) */}
          {aiExplainsImageSelectorData && !isUser && onAiExplainsImageSelection && (
            <div className="mt-3 w-full sm:w-[480px] lg:w-[672px]">
              <div className="mb-2 text-sm text-gray-700 dark:text-gray-300 font-medium">
                Wähle ein Bild für dein Video:
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                {aiExplainsImageSelectorData.images.map((imageUrl, idx) => (
                  <motion.div
                    key={idx}
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.1 * idx }}
                    className="relative aspect-square rounded-lg overflow-hidden cursor-pointer border-2 border-transparent hover:border-purple-500 transition-all"
                    onClick={() => onAiExplainsImageSelection(imageUrl)}
                  >
                    <img
                      src={imageUrl}
                      alt={`${aiExplainsImageSelectorData.productName} - Bild ${idx + 1}`}
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-black bg-opacity-0 hover:bg-opacity-10 transition-opacity flex items-center justify-center">
                      <div className="opacity-0 hover:opacity-100 transition-opacity bg-purple-600 text-white px-3 py-1 rounded-full text-sm">
                        Auswählen
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          )}

          {/* Display User Speaks image selector (single image selection) */}
          {userSpeaksImageSelectorData && !isUser && onUserSpeaksImageSelection && (
            <div className="mt-3 w-full sm:w-[480px] lg:w-[672px]">
              <div className="mb-2 text-sm text-gray-700 dark:text-gray-300 font-medium">
                Wähle ein Bild für dein Video:
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                {userSpeaksImageSelectorData.images.map((imageUrl, idx) => (
                  <motion.div
                    key={idx}
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.1 * idx }}
                    className="relative aspect-square rounded-lg overflow-hidden cursor-pointer border-2 border-transparent hover:border-orange-500 transition-all"
                    onClick={() => onUserSpeaksImageSelection(imageUrl)}
                  >
                    <img
                      src={imageUrl}
                      alt={`${userSpeaksImageSelectorData.productName} - Bild ${idx + 1}`}
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-black bg-opacity-0 hover:bg-opacity-10 transition-opacity flex items-center justify-center">
                      <div className="opacity-0 hover:opacity-100 transition-opacity bg-orange-600 text-white px-3 py-1 rounded-full text-sm">
                        Auswählen
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          )}

          {/* Image to Video - Image Selector */}
          {imageToVideoImageSelectorData && !isUser && onImageToVideoImageSelection && (
            <div className="mt-3 w-full sm:w-[480px] lg:w-[672px]">
              <div className="mb-2 text-sm text-gray-700 dark:text-gray-300 font-medium">
                Wähle ein Bild für dein Video:
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                {imageToVideoImageSelectorData.images.map((imageUrl, idx) => (
                  <motion.div
                    key={idx}
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.1 * idx }}
                    className="relative aspect-square rounded-lg overflow-hidden cursor-pointer border-2 border-transparent hover:border-cyan-500 dark:hover:border-cyan-400 transition-all"
                    onClick={() => onImageToVideoImageSelection(imageUrl)}
                  >
                    <img
                      src={imageUrl}
                      alt={`${imageToVideoImageSelectorData.productName} - Bild ${idx + 1}`}
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-black bg-opacity-0 hover:bg-opacity-10 transition-opacity flex items-center justify-center">
                      <div className="opacity-0 hover:opacity-100 transition-opacity bg-cyan-600 text-white px-3 py-1 rounded-full text-sm">
                        Auswählen
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          )}

          {/* Image to Video - "Inspiriere mich" Button */}
          {showImageToVideoInspireButton && !isUser && onImageToVideoInspiration && (
            <div className="mt-3 flex justify-end">
              <motion.button
                onClick={onImageToVideoInspiration}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                whileHover={{ scale: 1.05 }}
                className="relative px-5 py-2.5 rounded-xl font-medium flex items-center gap-2 shadow-md hover:shadow-lg transition-all duration-300 border-2 border-transparent dark:border-transparent"
                style={{
                  backgroundImage: 'linear-gradient(white, white), linear-gradient(to right, #a855f7, #ec4899, #f97316)',
                  backgroundOrigin: 'border-box',
                  backgroundClip: 'padding-box, border-box',
                }}
              >
                <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none">
                  <defs>
                    <linearGradient id="sparkle-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
                      <stop offset="0%" stopColor="#a855f7" />
                      <stop offset="50%" stopColor="#ec4899" />
                      <stop offset="100%" stopColor="#f97316" />
                    </linearGradient>
                  </defs>
                  <path d="M9.937 15.5A2 2 0 0 0 8.5 14.063l-6.135-1.582a.5.5 0 0 1 0-.962L8.5 9.936A2 2 0 0 0 9.937 8.5l1.582-6.135a.5.5 0 0 1 .963 0L14.063 8.5A2 2 0 0 0 15.5 9.937l6.135 1.582a.5.5 0 0 1 0 .962L15.5 14.063a2 2 0 0 0-1.437 1.437l-1.582 6.135a.5.5 0 0 1-.963 0z" fill="url(#sparkle-gradient)"/>
                  <path d="M20 3v4m-2-2h4M6 11v2m-1-1h2" stroke="url(#sparkle-gradient)" strokeWidth="1.5" strokeLinecap="round"/>
                </svg>
                <span className="bg-gradient-to-r from-purple-500 via-pink-500 to-orange-500 text-transparent bg-clip-text font-semibold">
                  Inspiriere mich
                </span>
              </motion.button>
            </div>
          )}

          {/* Image to Video - Prompt Ideas as Clickable Buttons */}
          {imageToVideoPromptIdeas && imageToVideoPromptIdeas.length > 0 && !isUser && onImageToVideoPromptIdeaSelect && (
            <div className="mt-3 space-y-2">
              <p className="text-xs text-gray-500 dark:text-gray-400 font-medium">💡 Vorschläge:</p>
              {imageToVideoPromptIdeas.map((idea, idx) => (
                <motion.button
                  key={idx}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.1 * idx }}
                  onClick={() => onImageToVideoPromptIdeaSelect(idea)}
                  className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 dark:border-gray-700 hover:border-cyan-400 dark:hover:border-cyan-500 text-left text-sm transition-all duration-200 hover:shadow-lg bg-white dark:bg-gray-800"
                >
                  {idea}
                </motion.button>
              ))}
            </div>
          )}

          {/* Display media thumbnail if present */}
          {mediaThumbnail && !isUser && onMediaThumbnailClick && (
            <div className="mt-3">
              <MediaThumbnail
                url={mediaThumbnail.url}
                type={mediaThumbnail.type}
                isEdit={mediaThumbnail.isEdit}
                onClick={() => onMediaThumbnailClick(mediaThumbnail.url, mediaThumbnail.type)}
              />
            </div>
          )}

          {/* Display attached images */}
          {allImageUrls && allImageUrls.length > 0 && (
            <div>
              <div className={`flex gap-2 mb-2 ${allImageUrls.length === 1 ? "flex-col" : "flex-wrap"}`}>
                {allImageUrls.map((url, idx) => {
                  const isSelected = selectedImages.includes(url);
                  return (
                    <motion.div
                      key={idx}
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: 0.1 * idx }}
                      className="relative rounded-lg overflow-hidden cursor-pointer"
                      onClick={() => toggleImageSelection(url)}
                    >
                      <img
                        src={url}
                        alt={`Attachment ${idx + 1}`}
                        className={`object-cover rounded-lg ${
                          allImageUrls.length === 1
                            ? "max-w-full max-h-64"
                            : "w-24 h-24"
                        } ${isSelected ? "ring-4 ring-purple-500" : ""}`}
                      />
                      {/* Selection indicator */}
                      {isSelected && (
                        <div className="absolute top-1 right-1 bg-purple-500 rounded-full w-6 h-6 flex items-center justify-center">
                          <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                          </svg>
                        </div>
                      )}
                    </motion.div>
                  );
                })}
              </div>
              {/* Selection info */}
              {onImageSelection && allImageUrls.length > 0 && (
                <p className="text-xs text-gray-400 mt-2">
                  {selectedImages.length > 0
                    ? `${selectedImages.length} von max. 5 Bildern ausgewählt`
                    : "Klicke auf Bilder um sie auszuwählen (max. 5)"}
                </p>
              )}
            </div>
          )}

          {timestamp && (
            <motion.p
              className={`text-xs mt-1 ${
                isUser
                  ? "text-blue-100"
                  : "text-gray-500 dark:text-gray-400"
              }`}
              variants={timestampVariants}
              initial="hidden"
              animate="visible"
            >
              {timestamp}
            </motion.p>
          )}
        </div>
      </div>
    </motion.div>
  );
}





