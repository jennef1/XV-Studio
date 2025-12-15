"use client";

import { useEffect, useRef } from "react";
import MessageBubble from "./MessageBubble";
import TypingIndicator from "./TypingIndicator";
import GeneratingIndicator from "./GeneratingIndicator";

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: string;
  status?: "sending" | "error";
  imageUrls?: string[];
  mediaThumbnail?: {
    url: string;
    type: "image" | "video";
    workflow?: string;
    isEdit?: boolean;
  };
}

interface ChatMessagesProps {
  messages: Message[];
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
  // Media thumbnail handler
  onMediaThumbnailClick?: (url: string, type: "image" | "video") => void;
  // Generation state
  isGeneratingContent?: boolean;
  generationType?: "image" | "video";
  generationMessage?: string;
}

export default function ChatMessages({
  messages,
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
  onMediaThumbnailClick,
  isGeneratingContent,
  generationType,
  generationMessage,
}: ChatMessagesProps) {
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    const scrollToBottom = () => {
      if (messagesEndRef.current) {
        messagesEndRef.current.scrollIntoView({
          behavior: "smooth",
          block: "end"
        });
      }
    };

    // Small delay to allow animations to start before scrolling
    const timeoutId = setTimeout(scrollToBottom, 100);
    return () => clearTimeout(timeoutId);
  }, [messages]);

  return (
    <div
      ref={containerRef}
      className="flex-1 overflow-y-auto p-6 space-y-4 scroll-smooth"
    >
      {messages.length === 0 ? (
        <div className="flex items-center justify-center h-full text-gray-500 dark:text-gray-400">
          <div className="text-center">
            <p className="text-lg font-medium mb-2">Start a conversation</p>
            <p className="text-sm">
              Choose a project template or ask a question to get started
            </p>
          </div>
        </div>
      ) : (
        <>
          {messages.map((message, index) => {
            // Show typing indicator instead of message content when sending
            if (message.status === "sending" && message.role === "assistant") {
              return <TypingIndicator key={message.id} />;
            }

            return (
              <MessageBubble
                key={message.id}
                message={message.content}
                isUser={message.role === "user"}
                timestamp={message.timestamp}
                index={index}
                imageUrls={message.imageUrls}
                onImageSelection={onImageSelection}
                onProductSelection={onProductSelection}
                onCampaignTypeSelection={onCampaignTypeSelection}
                onCampaignImageSelection={onCampaignImageSelection}
                onCampaignGeneratedImageView={onCampaignGeneratedImageView}
                onCampaignImageEdit={onCampaignImageEdit}
                campaignState={campaignState}
                onBilderWorkflowSelection={onBilderWorkflowSelection}
                onBilderProductImagesConfirm={onBilderProductImagesConfirm}
                onVideoWorkflowSelection={onVideoWorkflowSelection}
                onSocialBoostSubWorkflowSelection={onSocialBoostSubWorkflowSelection}
                onProductRotationImageSelection={onProductRotationImageSelection}
                onAiExplainsImageSelection={onAiExplainsImageSelection}
                onUserSpeaksImageSelection={onUserSpeaksImageSelection}
                onImageToVideoImageSelection={onImageToVideoImageSelection}
                onImageToVideoInspiration={onImageToVideoInspiration}
                onImageToVideoPromptIdeaSelect={onImageToVideoPromptIdeaSelect}
                mediaThumbnail={message.mediaThumbnail}
                onMediaThumbnailClick={onMediaThumbnailClick}
              />
            );
          })}
          {/* Show generating indicator when content is being created */}
          {isGeneratingContent && generationType && (
            <GeneratingIndicator
              type={generationType}
              message={generationMessage}
            />
          )}
          <div ref={messagesEndRef} />
        </>
      )}
    </div>
  );
}


