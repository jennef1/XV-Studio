"use client";

import { FormEvent, useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";

interface ChatInputProps {
  onSendMessage: (message: string, images?: File[]) => void;
  disabled?: boolean;
}

export default function ChatInput({ onSendMessage, disabled = false }: ChatInputProps) {
  const [message, setMessage] = useState("");
  const [isFocused, setIsFocused] = useState(false);
  const [selectedImages, setSelectedImages] = useState<File[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Auto-focus the textarea when it becomes enabled (assistant finishes responding)
  useEffect(() => {
    if (!disabled && textareaRef.current) {
      textareaRef.current.focus();
    }
  }, [disabled]);

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if ((!message.trim() && selectedImages.length === 0) || disabled) return;

    onSendMessage(message, selectedImages);
    setMessage("");
    setSelectedImages([]);
  };

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    const imageFiles = files.filter(file => file.type.startsWith("image/"));

    // Limit to 3 images total
    const remainingSlots = 3 - selectedImages.length;
    const newImages = imageFiles.slice(0, remainingSlots);

    setSelectedImages(prev => [...prev, ...newImages]);

    // Reset file input
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const removeImage = (index: number) => {
    setSelectedImages(prev => prev.filter((_, i) => i !== index));
  };

  const canSend = (message.trim() || selectedImages.length > 0) && !disabled;

  return (
    <div className="p-4 bg-white dark:bg-gray-950">
      <form onSubmit={handleSubmit}>
        <div className="flex flex-col items-center gap-3">
          {/* Image Preview */}
          <AnimatePresence>
            {selectedImages.length > 0 && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                className="flex gap-2 max-w-3xl w-full overflow-x-auto px-2"
              >
                {selectedImages.map((image, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.8 }}
                    className="relative flex-shrink-0 w-20 h-20 rounded-lg overflow-hidden border-2 border-gray-200 dark:border-gray-700"
                  >
                    <img
                      src={URL.createObjectURL(image)}
                      alt={`Preview ${index + 1}`}
                      className="w-full h-full object-cover"
                    />
                    <button
                      type="button"
                      onClick={() => removeImage(index)}
                      className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white rounded-full flex items-center justify-center text-xs hover:bg-red-600 transition-colors"
                    >
                      ×
                    </button>
                  </motion.div>
                ))}
              </motion.div>
            )}
          </AnimatePresence>

          {/* Input Area */}
          <motion.div
            className={`flex items-center rounded-full border bg-white dark:bg-gray-800 shadow-md shadow-gray-200/60 dark:shadow-black/30 px-4 py-3 gap-3 max-w-3xl w-full transition-all duration-300 ${
              isFocused
                ? "border-blue-500 dark:border-blue-400 shadow-lg shadow-blue-200/40 dark:shadow-blue-900/40"
                : "border-gray-200 dark:border-gray-700"
            }`}
            animate={{
              scale: isFocused ? 1.01 : 1,
            }}
            transition={{ duration: 0.2 }}
          >
            {/* Image Upload Button */}
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              multiple
              onChange={handleImageSelect}
              className="hidden"
              disabled={disabled || selectedImages.length >= 3}
            />
            <motion.button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              disabled={disabled || selectedImages.length >= 3}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className={`flex-shrink-0 p-2 rounded-full transition-colors ${
                disabled || selectedImages.length >= 3
                  ? "text-gray-300 dark:text-gray-600 cursor-not-allowed"
                  : "text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700"
              }`}
              aria-label="Attach images"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </motion.button>
            {selectedImages.length > 0 && (
              <span className="text-xs text-gray-500 dark:text-gray-400">
                {selectedImages.length}/3
              </span>
            )}

            <textarea
              ref={textareaRef}
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              onFocus={() => setIsFocused(true)}
              onBlur={() => setIsFocused(false)}
              placeholder="Send a message..."
              rows={1}
              disabled={disabled}
              autoFocus
              className="flex-1 bg-transparent border-none focus:outline-none focus:ring-0 text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400 min-h-[3rem] resize-none disabled:opacity-50 disabled:cursor-not-allowed"
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  handleSubmit(e as any);
                }
              }}
            />

            <AnimatePresence mode="wait">
              {disabled ? (
                <motion.div
                  key="loading"
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.8 }}
                  transition={{ duration: 0.2 }}
                  className="w-11 h-11 rounded-full bg-gray-900 dark:bg-gray-700 flex items-center justify-center"
                >
                  <motion.div
                    className="flex gap-1"
                    animate={{ opacity: [0.4, 1, 0.4] }}
                    transition={{
                      duration: 1.5,
                      repeat: Infinity,
                      ease: "easeInOut",
                    }}
                  >
                    <div className="w-1.5 h-1.5 rounded-full bg-white" />
                    <div className="w-1.5 h-1.5 rounded-full bg-white" />
                    <div className="w-1.5 h-1.5 rounded-full bg-white" />
                  </motion.div>
                </motion.div>
              ) : (
                <motion.button
                  key="send"
                  type="submit"
                  disabled={!canSend}
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.8 }}
                  whileHover={canSend ? { scale: 1.05 } : {}}
                  whileTap={canSend ? { scale: 0.95 } : {}}
                  transition={{ duration: 0.2 }}
                  className={`w-11 h-11 rounded-full flex items-center justify-center transition-colors ${
                    canSend
                      ? "bg-blue-600 hover:bg-blue-700 text-white"
                      : "bg-gray-200 dark:bg-gray-700 text-gray-400 dark:text-gray-500 cursor-not-allowed"
                  }`}
                  aria-label="Send message"
                >
                  <motion.svg
                    className="w-5 h-5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    animate={canSend ? { x: [0, 2, 0] } : {}}
                    transition={{ duration: 1.5, repeat: Infinity }}
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 12h14m-7-7l7 7-7 7" />
                  </motion.svg>
                </motion.button>
              )}
            </AnimatePresence>
          </motion.div>
        </div>
      </form>
    </div>
  );
}
