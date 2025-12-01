"use client";

import { useState } from "react";
import Image from "next/image";
import { Database } from "@/types/database";

type BusinessProduct = Database["public"]["Tables"]["business_products"]["Row"];

interface ProductSelectionCardsProps {
  products: BusinessProduct[];
  onProductSelect: (product: BusinessProduct) => void;
}

export default function ProductSelectionCards({
  products,
  onProductSelect,
}: ProductSelectionCardsProps) {
  const [selectedProductId, setSelectedProductId] = useState<string | null>(null);

  const handleProductClick = (product: BusinessProduct) => {
    setSelectedProductId(product.id);
    onProductSelect(product);
  };

  const getFirstImage = (product: BusinessProduct): string | null => {
    if (!product.product_images) return null;

    const images = product.product_images;
    if (Array.isArray(images) && images.length > 0) {
      const stringImages = images.filter((img): img is string => typeof img === 'string');
      return stringImages[0] || null;
    } else if (images && typeof images === 'object') {
      const imageValues = Object.values(images).filter((val): val is string => typeof val === 'string');
      return imageValues[0] || null;
    }
    return null;
  };

  if (products.length === 0) {
    return (
      <div className="p-4 bg-gray-100 dark:bg-gray-800 rounded-lg text-center">
        <p className="text-gray-600 dark:text-gray-400">
          Du hast noch keine Produkte mit Videokonzepten. Nutze Option 1 oder 2, um ein neues Produkt zu analysieren.
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 my-4">
      {products.map((product) => {
        const firstImage = getFirstImage(product);
        const isSelected = selectedProductId === product.id;

        return (
          <button
            key={product.id}
            onClick={() => handleProductClick(product)}
            className={`p-4 rounded-2xl border-2 transition-all flex items-center gap-3 text-left ${
              isSelected
                ? "border-purple-500 bg-purple-50 dark:bg-purple-900/20"
                : "border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 hover:border-purple-300 dark:hover:border-purple-600"
            }`}
          >
            {/* Product Image */}
            {firstImage ? (
              <div className="w-16 h-16 rounded-xl bg-gray-200 dark:bg-gray-700 overflow-hidden flex-shrink-0">
                <Image
                  src={firstImage}
                  alt={product.product_name || "Product"}
                  width={64}
                  height={64}
                  className="w-full h-full object-cover"
                />
              </div>
            ) : (
              <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-purple-400 to-pink-400 flex-shrink-0 flex items-center justify-center">
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                </svg>
              </div>
            )}

            {/* Product Name */}
            <div className="flex-1 min-w-0">
              <p className={`font-medium text-sm truncate ${
                isSelected
                  ? "text-purple-900 dark:text-purple-100"
                  : "text-gray-900 dark:text-white"
              }`}>
                {product.product_name || "Unbenanntes Produkt"}
              </p>
              {product.product_description && (
                <p className={`text-xs mt-1 line-clamp-2 ${
                  isSelected
                    ? "text-purple-700 dark:text-purple-300"
                    : "text-gray-500 dark:text-gray-400"
                }`}>
                  {product.product_description}
                </p>
              )}
            </div>

            {/* Selection Indicator */}
            {isSelected && (
              <div className="flex-shrink-0">
                <div className="w-6 h-6 bg-purple-600 rounded-full flex items-center justify-center">
                  <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
              </div>
            )}
          </button>
        );
      })}
    </div>
  );
}
