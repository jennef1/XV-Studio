"use client";

import { useState } from "react";
import Image from "next/image";

interface ProductImagesMultiSelectorProps {
  images: string[];
  productName: string;
  onConfirmSelection: (selectedImages: string[]) => void;
}

export default function ProductImagesMultiSelector({
  images,
  productName,
  onConfirmSelection,
}: ProductImagesMultiSelectorProps) {
  const [selectedImages, setSelectedImages] = useState<string[]>([]);

  const toggleImage = (imageUrl: string) => {
    setSelectedImages(prev => {
      if (prev.includes(imageUrl)) {
        return prev.filter(url => url !== imageUrl);
      } else {
        // Max 5 images
        if (prev.length >= 5) {
          return prev;
        }
        return [...prev, imageUrl];
      }
    });
  };

  const handleConfirm = () => {
    if (selectedImages.length > 0) {
      onConfirmSelection(selectedImages);
    }
  };

  return (
    <div className="my-4 bg-white dark:bg-gray-800 border-2 border-gray-200 dark:border-gray-700 rounded-3xl p-6">
      <div className="mb-4">
        <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">
          Wähle Bilder von &ldquo;{productName}&rdquo;
        </h3>
        <p className="text-sm text-gray-600 dark:text-gray-400">
          Wähle bis zu 5 Produktbilder aus, die als Referenz dienen sollen
        </p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mb-4">
        {images.map((imageUrl, index) => {
          const isSelected = selectedImages.includes(imageUrl);

          return (
            <button
              key={index}
              onClick={() => toggleImage(imageUrl)}
              className={`group aspect-square bg-gray-100 dark:bg-gray-900 rounded-2xl overflow-hidden border-2 transition-all w-full relative ${
                isSelected
                  ? "border-purple-500 shadow-lg ring-2 ring-purple-300 dark:ring-purple-700"
                  : "border-gray-200 dark:border-gray-700 hover:border-purple-400 dark:hover:border-purple-500"
              }`}
            >
              <Image
                src={imageUrl}
                alt={`${productName} Bild ${index + 1}`}
                fill
                className="object-cover"
                unoptimized
              />

              {/* Selection indicator */}
              {isSelected && (
                <div className="absolute top-2 right-2 bg-purple-600 rounded-full p-1.5 shadow-lg">
                  <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                </div>
              )}

              {/* Selection number badge */}
              {isSelected && (
                <div className="absolute top-2 left-2 bg-purple-600 text-white rounded-full w-7 h-7 flex items-center justify-center text-sm font-bold shadow-lg">
                  {selectedImages.indexOf(imageUrl) + 1}
                </div>
              )}
            </button>
          );
        })}
      </div>

      {/* Selection info and confirm button */}
      <div className="flex items-center justify-between gap-4">
        <p className="text-sm text-gray-600 dark:text-gray-400">
          {selectedImages.length > 0
            ? `${selectedImages.length} von max. 5 Bildern ausgewählt`
            : "Wähle mindestens 1 Bild aus"}
        </p>
        <button
          onClick={handleConfirm}
          disabled={selectedImages.length === 0}
          className="px-6 py-3 bg-purple-600 text-white rounded-xl font-medium hover:bg-purple-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
        >
          <span>Weiter</span>
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
          </svg>
        </button>
      </div>
    </div>
  );
}
