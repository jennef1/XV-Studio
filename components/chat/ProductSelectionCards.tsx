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
    <div className="w-full sm:w-[480px] lg:w-[672px]">
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 my-4">
        {products.map((product) => {
        const firstImage = getFirstImage(product);
        const isSelected = selectedProductId === product.id;

        return (
          <button
            key={product.id}
            onClick={() => handleProductClick(product)}
            className={`group relative border-2 rounded-2xl overflow-hidden transition-all hover:shadow-lg ${
              isSelected
                ? "border-purple-500 bg-purple-50 dark:bg-purple-900/20"
                : "border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 hover:border-purple-400 dark:hover:border-purple-500"
            }`}
          >
            {/* Product Image */}
            <div className="aspect-square bg-gray-100 dark:bg-gray-900 relative overflow-hidden">
              {firstImage ? (
                <Image
                  src={firstImage}
                  alt={product.product_name || "Product"}
                  fill
                  className="object-cover"
                  unoptimized
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-purple-400 to-pink-400">
                  <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909m-18 3.75h16.5a1.5 1.5 0 001.5-1.5V6a1.5 1.5 0 00-1.5-1.5H3.75A1.5 1.5 0 002.25 6v12a1.5 1.5 0 001.5 1.5zm10.5-11.25h.008v.008h-.008V8.25zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z" />
                  </svg>
                </div>
              )}
            </div>

            {/* Product Name */}
            <div className="p-2.5">
              <p className={`text-xs font-medium truncate ${
                isSelected
                  ? "text-purple-900 dark:text-purple-100"
                  : "text-gray-900 dark:text-white group-hover:text-purple-600 dark:group-hover:text-purple-400"
              }`}>
                {product.product_name || "Unbenanntes Produkt"}
              </p>
            </div>

            {/* Selection Indicator */}
            {isSelected && (
              <div className="absolute top-2 right-2">
                <div className="w-5 h-5 bg-purple-600 rounded-full flex items-center justify-center shadow-lg">
                  <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
              </div>
            )}
          </button>
        );
        })}
      </div>
    </div>
  );
}
