"use client";

import { motion } from "framer-motion";
import ReactMarkdown from "react-markdown";

interface MessageBubbleProps {
  message: string;
  isUser: boolean;
  timestamp?: string;
  index?: number;
  imageUrls?: string[];
}

export default function MessageBubble({
  message,
  isUser,
  timestamp,
  index = 0,
  imageUrls,
}: MessageBubbleProps) {
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
        ease: [0.23, 1, 0.32, 1], // Custom easing for smooth feel
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
      <div className={`flex gap-3 max-w-[80%] ${isUser ? "flex-row-reverse" : "flex-row"}`}>
        {!isUser && (
          <div className="flex-shrink-0 w-8 h-8 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
            <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09zM18.259 8.715L18 9.75l-.259-1.035a3.375 3.375 0 00-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 002.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 002.456 2.456L21.75 6l-1.035.259a3.375 3.375 0 00-2.456 2.456z" />
            </svg>
          </div>
        )}
        <div
          className={`rounded-2xl px-4 py-3 ${
            isUser
              ? "bg-blue-600 text-white"
              : "bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-gray-100"
          }`}
        >
          {/* Display attached images */}
          {imageUrls && imageUrls.length > 0 && (
            <div className={`flex gap-2 mb-2 ${imageUrls.length === 1 ? "flex-col" : "flex-wrap"}`}>
              {imageUrls.map((url, idx) => (
                <motion.div
                  key={idx}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.1 * idx }}
                  className="relative rounded-lg overflow-hidden"
                >
                  <img
                    src={url}
                    alt={`Attachment ${idx + 1}`}
                    className={`object-cover rounded-lg ${
                      imageUrls.length === 1
                        ? "max-w-full max-h-64"
                        : "w-24 h-24"
                    }`}
                    onClick={() => window.open(url, "_blank")}
                    style={{ cursor: "pointer" }}
                  />
                </motion.div>
              ))}
            </div>
          )}

          {message && (
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
                {message}
              </ReactMarkdown>
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





