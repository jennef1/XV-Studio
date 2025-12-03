"use client";

import Image from "next/image";

interface GeneratedImagesDisplayProps {
  images: string[];
  onImageSelect: (imageUrl: string) => void;
  isEditing?: boolean;
}

export default function GeneratedImagesDisplay({
  images,
  onImageSelect,
  isEditing = false,
}: GeneratedImagesDisplayProps) {
  const handleImageClick = (imageUrl: string) => {
    if (!isEditing) {
      onImageSelect(imageUrl);
    }
  };

  return (
    <div className="my-4">
      <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
        {images.map((imageUrl, index) => (
          <button
            key={index}
            onClick={() => handleImageClick(imageUrl)}
            disabled={isEditing}
            className={`group aspect-square bg-gray-100 dark:bg-gray-900 rounded-3xl overflow-hidden border-2 transition-all w-full relative border-gray-200 dark:border-gray-700 hover:border-blue-400 dark:hover:border-blue-500 hover:shadow-lg ${
              isEditing ? "opacity-50 cursor-not-allowed" : ""
            }`}
          >
            <Image
              src={imageUrl}
              alt={`Generated campaign image ${index + 1}`}
              fill
              className="object-cover"
              unoptimized
            />

            {/* Hover overlay with eye icon */}
            {!isEditing && (
              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-all flex items-center justify-center">
                <div className="opacity-0 group-hover:opacity-100 transform scale-75 group-hover:scale-100 transition-all">
                  <div className="bg-white dark:bg-gray-800 rounded-full p-3 shadow-lg">
                    <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                    </svg>
                  </div>
                </div>
              </div>
            )}
          </button>
        ))}
      </div>

      {isEditing && (
        <div className="mt-4 flex items-center justify-center gap-2 text-sm text-gray-600 dark:text-gray-400">
          <div className="w-4 h-4 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
          <span>Bild wird bearbeitet...</span>
        </div>
      )}
    </div>
  );
}
