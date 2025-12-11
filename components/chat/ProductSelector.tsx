"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { supabaseBrowserClient } from "@/lib/supabaseClient";
import { Database } from "@/types/database";

type BusinessProduct = Database["public"]["Tables"]["business_products"]["Row"];

interface ProductSelectorProps {
  onSelectProduct: (product: BusinessProduct) => void;
}

export default function ProductSelector({ onSelectProduct }: ProductSelectorProps) {
  const [products, setProducts] = useState<BusinessProduct[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      setIsLoading(true);
      const { data: { user } } = await supabaseBrowserClient.auth.getUser();

      if (!user) {
        console.error("No user found");
        return;
      }

      const { data, error } = await supabaseBrowserClient
        .from("business_products")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });

      if (error) {
        console.error("Error fetching products:", error);
        return;
      }

      setProducts(data || []);
    } catch (error) {
      console.error("Error:", error);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (products.length === 0) {
    return (
      <div className="bg-gray-50 dark:bg-gray-900 border-2 border-dashed border-gray-300 dark:border-gray-700 rounded-3xl p-8 text-center">
        <p className="text-gray-600 dark:text-gray-400 mb-2">
          Keine Produkte gefunden
        </p>
        <p className="text-sm text-gray-500 dark:text-gray-500">
          Füge zuerst Produkte im Produkte-Bereich hinzu
        </p>
      </div>
    );
  }

  return (
    <div className="w-full sm:w-[480px] lg:w-[672px]">
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 my-4">
        {products.map((product) => {
        const imageUrl = Array.isArray(product.product_images) && product.product_images.length > 0
          ? (product.product_images[0] as string)
          : null;

        return (
          <button
            key={product.id}
            onClick={() => onSelectProduct(product)}
            className="group bg-white dark:bg-gray-800 border-2 border-gray-200 dark:border-gray-700 rounded-2xl overflow-hidden hover:border-blue-400 dark:hover:border-blue-500 transition-all hover:shadow-lg"
          >
            {/* Product Image */}
            <div className="aspect-square bg-gray-100 dark:bg-gray-900 relative overflow-hidden">
              {imageUrl ? (
                <Image
                  src={imageUrl}
                  alt={product.product_name || "Product"}
                  fill
                  className="object-cover"
                  unoptimized
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <svg className="w-10 h-10 text-gray-300 dark:text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909m-18 3.75h16.5a1.5 1.5 0 001.5-1.5V6a1.5 1.5 0 00-1.5-1.5H3.75A1.5 1.5 0 002.25 6v12a1.5 1.5 0 001.5 1.5zm10.5-11.25h.008v.008h-.008V8.25zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z" />
                  </svg>
                </div>
              )}
            </div>

            {/* Product Name */}
            <div className="p-2.5">
              <p className="text-xs font-medium text-gray-900 dark:text-white truncate group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                {product.product_name || "Unbenanntes Produkt"}
              </p>
            </div>
          </button>
        );
        })}
      </div>
    </div>
  );
}
