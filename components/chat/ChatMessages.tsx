"use client";

import { useEffect, useRef } from "react";
import MessageBubble from "./MessageBubble";
import TypingIndicator from "./TypingIndicator";

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: string;
  status?: "sending" | "error";
  imageUrls?: string[];
}

interface ChatMessagesProps {
  messages: Message[];
}

export default function ChatMessages({ messages }: ChatMessagesProps) {
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
              />
            );
          })}
          <div ref={messagesEndRef} />
        </>
      )}
    </div>
  );
}


