"use client";

import Image from "next/image";

interface ProductImageSelectorProps {
  images: string[];
  productName: string;
  onSelectImage: (imageUrl: string) => void;
}

export default function ProductImageSelector({
  images,
  productName,
  onSelectImage,
}: ProductImageSelectorProps) {
  if (!images || images.length === 0) {
    return (
      <div className="bg-gray-50 dark:bg-gray-900 border-2 border-dashed border-gray-300 dark:border-gray-700 rounded-3xl p-8 text-center my-4">
        <p className="text-gray-600 dark:text-gray-400 mb-2">
          Keine Bilder verfügbar
        </p>
        <p className="text-sm text-gray-500 dark:text-gray-500">
          Dieses Produkt hat noch keine Bilder
        </p>
      </div>
    );
  }

  return (
    <div className="my-4 w-full sm:w-[480px] lg:w-[672px]">
      <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
        Wähle ein Bild für <span className="font-medium text-gray-900 dark:text-white">{productName}</span>:
      </p>

      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
        {images.map((imageUrl, index) => (
          <button
            key={index}
            onClick={() => onSelectImage(imageUrl)}
            className="group aspect-square bg-gray-100 dark:bg-gray-900 rounded-2xl overflow-hidden border-2 border-gray-200 dark:border-gray-700 hover:border-blue-400 dark:hover:border-blue-500 transition-all hover:shadow-lg relative"
          >
            <Image
              src={imageUrl}
              alt={`${productName} - Bild ${index + 1}`}
              fill
              className="object-cover"
              unoptimized
            />

            {/* Overlay on hover */}
            <div className="absolute inset-0 bg-blue-600/0 group-hover:bg-blue-600/20 transition-all flex items-center justify-center">
              <div className="w-10 h-10 bg-white dark:bg-gray-800 rounded-full shadow-lg flex items-center justify-center opacity-0 group-hover:opacity-100 transform scale-75 group-hover:scale-100 transition-all">
                <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}
