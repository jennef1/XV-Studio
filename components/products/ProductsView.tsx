"use client";

import { useState, useEffect, useRef } from "react";
import Image from "next/image";
import { supabaseBrowserClient } from "@/lib/supabaseClient";
import { Database } from "@/types/database";

type BusinessProduct = Database["public"]["Tables"]["business_products"]["Row"];

export default function ProductsView() {
  const [products, setProducts] = useState<BusinessProduct[]>([]);
  const [selectedProduct, setSelectedProduct] = useState<BusinessProduct | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [hasBusiness, setHasBusiness] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [productUrl, setProductUrl] = useState("");
  const [productName, setProductName] = useState("");
  const [productDescription, setProductDescription] = useState("");
  const [keyFeatures, setKeyFeatures] = useState<string[]>([]);
  const [benefits, setBenefits] = useState<string[]>([]);
  const [targetCustomer, setTargetCustomer] = useState("");
  const [isFetching, setIsFetching] = useState(false);
  const [isUploadingImages, setIsUploadingImages] = useState(false);
  const [uploadedImages, setUploadedImages] = useState<string[]>([]);
  const [editingImageIndex, setEditingImageIndex] = useState<number | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    fetchProducts();
  }, []);

  useEffect(() => {
    if (selectedProduct) {
      setProductUrl(selectedProduct.source_url || "");
      setProductName(selectedProduct.product_name || "");
      setProductDescription(selectedProduct.product_description || "");
      setKeyFeatures((selectedProduct.key_features as string[]) || []);
      setBenefits((selectedProduct.benefits as string[]) || []);
      setTargetCustomer(selectedProduct.target_customer || "");
      setUploadedImages((selectedProduct.product_images as string[]) || []);
    } else {
      // Reset form when no product selected
      setProductUrl("");
      setProductName("");
      setProductDescription("");
      setKeyFeatures([]);
      setBenefits([]);
      setTargetCustomer("");
      setUploadedImages([]);
    }
  }, [selectedProduct]);

  const fetchProducts = async () => {
    try {
      setIsLoading(true);
      const { data: { user } } = await supabaseBrowserClient.auth.getUser();

      if (!user) {
        console.error("No user found");
        return;
      }

      // Check if business exists
      const { data: businessData, error: businessError } = await supabaseBrowserClient
        .from("businesses")
        .select("id")
        .eq("user_id", user.id)
        .limit(1);

      if (businessError || !businessData || businessData.length === 0) {
        setHasBusiness(false);
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

  const handleFetchProductData = async () => {
    if (!productUrl.trim()) {
      alert("Bitte gib eine Produkt-URL ein");
      return;
    }

    try {
      setIsFetching(true);

      const { data: { user } } = await supabaseBrowserClient.auth.getUser();
      if (!user) throw new Error("No user found");

      const { data: businessData } = await supabaseBrowserClient
        .from("businesses")
        .select("id")
        .eq("user_id", user.id)
        .limit(1)
        .maybeSingle();

      if (!businessData) throw new Error("No business found");

      const response = await fetch("/api/webhook/product-data", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          user_id: user.id,
          business_id: businessData.id,
          product_url: productUrl
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to fetch product data");
      }

      await fetchProducts();

      // Reset form
      setProductUrl("");
      setProductName("");
      setProductDescription("");
      setKeyFeatures([]);
      setBenefits([]);
      setTargetCustomer("");
      setUploadedImages([]);
      setSelectedProduct(null);

      alert("Produkt erfolgreich hinzugefügt!");
    } catch (error: any) {
      console.error("Error fetching product data:", error);
      alert(error.message || "Fehler beim Abrufen der Produktdaten. Bitte versuche es erneut.");
    } finally {
      setIsFetching(false);
    }
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;

    setIsUploadingImages(true);
    try {
      const uploadedUrls: string[] = [];

      for (const file of Array.from(files)) {
        const formData = new FormData();
        formData.append("file", file);
        formData.append("folder", "product-images");

        const response = await fetch("/api/storage/upload", {
          method: "POST",
          body: formData,
        });

        if (!response.ok) {
          throw new Error(`Failed to upload ${file.name}`);
        }

        const data = await response.json();
        uploadedUrls.push(data.url);
      }

      // If editing a specific image slot, replace it
      if (editingImageIndex !== null) {
        const newImages = [...uploadedImages];
        uploadedUrls.forEach((url, i) => {
          const targetIndex = editingImageIndex + i;
          if (targetIndex < 5) { // Max 5 images (0-4)
            newImages[targetIndex] = url;
          }
        });
        setUploadedImages(newImages);
      } else {
        // Otherwise append
        setUploadedImages([...uploadedImages, ...uploadedUrls]);
      }

      setEditingImageIndex(null);
      // Reset file input to allow re-uploading the same file
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    } catch (error: any) {
      console.error("Error uploading images:", error);
      alert(`Fehler beim Hochladen der Bilder: ${error.message || "Bitte versuche es erneut."}`);
    } finally {
      setIsUploadingImages(false);
    }
  };

  const handleDeleteImage = (index: number) => {
    const newImages = uploadedImages.filter((_, i) => i !== index);
    setUploadedImages(newImages);
  };

  const handleAddManualProduct = async () => {
    if (!productName.trim()) {
      alert("Bitte gib einen Produktnamen ein");
      return;
    }

    try {
      const { data: { user } } = await supabaseBrowserClient.auth.getUser();
      if (!user) throw new Error("No user found");

      const { data: businessData } = await supabaseBrowserClient
        .from("businesses")
        .select("id")
        .eq("user_id", user.id)
        .limit(1)
        .maybeSingle();

      if (!businessData) throw new Error("No business found");

      const { data: newProduct, error } = await supabaseBrowserClient
        .from("business_products")
        .insert({
          business_id: businessData.id,
          user_id: user.id,
          product_name: productName,
          product_description: productDescription,
          key_features: keyFeatures,
          benefits: benefits,
          target_customer: targetCustomer || null,
          source_url: productUrl || null,
          product_images: uploadedImages,
        })
        .select()
        .single();

      if (error) throw error;

      await fetchProducts();

      // Reset form
      setProductUrl("");
      setProductName("");
      setProductDescription("");
      setKeyFeatures([]);
      setBenefits([]);
      setTargetCustomer("");
      setUploadedImages([]);
      setSelectedProduct(null);

      alert("Produkt erfolgreich hinzugefügt!");
    } catch (error: any) {
      console.error("Error adding product:", error);
      alert("Fehler beim Hinzufügen des Produkts. Bitte versuche es erneut.");
    }
  };

  const handleUpdateProduct = async () => {
    if (!selectedProduct) return;
    if (!productName.trim()) {
      alert("Bitte gib einen Produktnamen ein");
      return;
    }

    try {
      const { error } = await supabaseBrowserClient
        .from("business_products")
        .update({
          product_name: productName,
          product_description: productDescription,
          key_features: keyFeatures,
          benefits: benefits,
          target_customer: targetCustomer || null,
          source_url: productUrl || null,
          product_images: uploadedImages,
        })
        .eq("id", selectedProduct.id);

      if (error) throw error;

      await fetchProducts();

      // Exit editing mode
      setIsEditing(false);

      alert("Produkt erfolgreich aktualisiert!");
    } catch (error: any) {
      console.error("Error updating product:", error);
      alert("Fehler beim Aktualisieren des Produkts. Bitte versuche es erneut.");
    }
  };

  const handleSelectProduct = (product: BusinessProduct) => {
    setSelectedProduct(product);
    setIsEditing(false);
  };

  const handleNewProduct = () => {
    setSelectedProduct(null);
    setIsEditing(true);
  };

  const handleStartEditing = () => {
    setIsEditing(true);
  };

  const handleCancelEditing = () => {
    if (selectedProduct) {
      // Revert to original values
      setProductUrl(selectedProduct.source_url || "");
      setProductName(selectedProduct.product_name || "");
      setProductDescription(selectedProduct.product_description || "");
      setKeyFeatures((selectedProduct.key_features as string[]) || []);
      setBenefits((selectedProduct.benefits as string[]) || []);
      setTargetCustomer(selectedProduct.target_customer || "");
      setUploadedImages((selectedProduct.product_images as string[]) || []);
      setIsEditing(false);
    } else {
      // Cancel new product
      setProductUrl("");
      setProductName("");
      setProductDescription("");
      setKeyFeatures([]);
      setBenefits([]);
      setTargetCustomer("");
      setUploadedImages([]);
    }
  };

  if (isLoading) {
    return (
      <div className="flex-1 flex items-center justify-center bg-white dark:bg-gray-950">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">Lade Produkte...</p>
        </div>
      </div>
    );
  }

  if (!hasBusiness) {
    return (
      <div className="flex-1 flex items-center justify-center bg-white dark:bg-gray-950">
        <div className="text-center max-w-md">
          <div className="mb-6">
            <svg className="w-20 h-20 mx-auto text-gray-300 dark:text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
            </svg>
          </div>
          <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
            Kein Firmenprofil gefunden
          </h3>
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            Du musst zuerst ein Firmenprofil erstellen, bevor du Produkte hinzufügen kannst.
          </p>
          <a
            href="/"
            className="inline-flex items-center px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
          >
            Zur Startseite
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 flex h-full bg-white dark:bg-gray-950">
      {/* Left Sidebar - Product List */}
      <div className="w-80 bg-gray-50 dark:bg-gray-900 border-r border-gray-200 dark:border-gray-800 overflow-y-auto p-6 flex-shrink-0">
        {/* Add Product Button */}
        <button
          onClick={handleNewProduct}
          className="w-full mb-6 p-4 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 hover:border-purple-400 dark:hover:border-purple-500 transition-colors flex items-center gap-3 group"
        >
          <div className="w-10 h-10 bg-gradient-to-br from-purple-400 to-pink-400 rounded-lg flex items-center justify-center flex-shrink-0">
            <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
          </div>
          <span className="text-gray-700 dark:text-gray-300 font-medium">Produkt manuell hinzufügen</span>
        </button>

        {/* Product List */}
        <div className="space-y-3">
          {products.map((product) => (
            <button
              key={product.id}
              onClick={() => handleSelectProduct(product)}
              className={`w-full p-3 rounded-xl transition-all flex items-center gap-3 ${
                selectedProduct?.id === product.id
                  ? "bg-white dark:bg-gray-800 shadow-md border-2 border-blue-500"
                  : "bg-white dark:bg-gray-800 hover:shadow-md border border-gray-200 dark:border-gray-700"
              }`}
            >
              {product.product_images && (product.product_images as string[])[0] ? (
                <div className="w-12 h-12 rounded-lg bg-gray-200 dark:bg-gray-700 overflow-hidden flex-shrink-0">
                  <Image
                    src={(product.product_images as string[])[0]}
                    alt={product.product_name || "Product"}
                    width={48}
                    height={48}
                    className="w-full h-full object-cover"
                  />
                </div>
              ) : (
                <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-gray-200 to-gray-300 dark:from-gray-700 dark:to-gray-600 flex-shrink-0" />
              )}
              <span className="text-left text-gray-900 dark:text-white font-medium text-sm truncate">
                {product.product_name || "Unbenanntes Produkt"}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Right Panel - Product Form */}
      <div className="flex-1 overflow-y-auto p-8 h-full">
        <div className="max-w-3xl mx-auto pb-20">
          {/* Read-only Product Display */}
          {selectedProduct && !isEditing && (
            <div className="space-y-6 mb-8">
              {/* Header with Edit Button */}
              <div className="flex items-center justify-between mb-6">
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                  {selectedProduct.product_name}
                </h1>
                <button
                  onClick={handleStartEditing}
                  className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl transition-colors flex items-center gap-2"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                  </svg>
                  Bearbeiten
                </button>
              </div>

              {/* Product Images */}
              {selectedProduct.product_images && (selectedProduct.product_images as string[]).length > 0 && (
                <div className="bg-white dark:bg-gray-800 rounded-3xl border-2 border-gray-200 dark:border-gray-700 p-6">
                  <div className="flex gap-4">
                    {/* Main Image */}
                    <div className="w-80 h-80 rounded-3xl overflow-hidden flex-shrink-0">
                      <Image
                        src={(selectedProduct.product_images as string[])[0]}
                        alt={selectedProduct.product_name || "Product"}
                        width={320}
                        height={320}
                        className="w-full h-full object-cover"
                        unoptimized
                      />
                    </div>
                    {/* Additional Images Grid */}
                    {(selectedProduct.product_images as string[]).length > 1 && (
                      <div className="grid grid-cols-2 gap-3 w-80">
                        {(selectedProduct.product_images as string[]).slice(1, 5).map((img, index) => (
                          <div key={index} className="aspect-square rounded-3xl overflow-hidden">
                            <Image
                              src={img}
                              alt={`${selectedProduct.product_name} ${index + 2}`}
                              width={150}
                              height={150}
                              className="w-full h-full object-cover"
                              unoptimized
                            />
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Description */}
              {selectedProduct.product_description && (
                <div>
                  <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-3">Beschreibung</h3>
                  <p className="text-gray-700 dark:text-gray-300 leading-relaxed whitespace-pre-wrap">
                    {selectedProduct.product_description}
                  </p>
                </div>
              )}

              {/* Key Features */}
              {selectedProduct.key_features && Array.isArray(selectedProduct.key_features) && selectedProduct.key_features.length > 0 && (
                <div className="bg-white dark:bg-gray-800 rounded-3xl border-2 border-gray-200 dark:border-gray-700 p-6">
                  <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">Hauptmerkmale</h3>
                  <div className="flex flex-wrap gap-3">
                    {(selectedProduct.key_features as string[]).map((feature, index) => (
                      <span
                        key={index}
                        className="px-4 py-2 bg-blue-100 dark:bg-blue-900/40 text-blue-800 dark:text-blue-200 rounded-2xl text-sm font-medium"
                      >
                        {feature}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Benefits */}
              {selectedProduct.benefits && Array.isArray(selectedProduct.benefits) && selectedProduct.benefits.length > 0 && (
                <div className="bg-white dark:bg-gray-800 rounded-3xl border-2 border-gray-200 dark:border-gray-700 p-6">
                  <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">Vorteile</h3>
                  <div className="flex flex-wrap gap-3">
                    {(selectedProduct.benefits as string[]).map((benefit, index) => (
                      <span
                        key={index}
                        className="px-4 py-2 bg-purple-100 dark:bg-purple-900/40 text-purple-800 dark:text-purple-200 rounded-2xl text-sm font-medium"
                      >
                        {benefit}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Target Customer */}
              {selectedProduct.target_customer && (
                <div className="bg-white dark:bg-gray-800 rounded-3xl border-2 border-gray-200 dark:border-gray-700 p-6">
                  <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">Zielgruppe</h3>
                  <div className="flex flex-wrap gap-3">
                    <span className="px-4 py-2 bg-green-100 dark:bg-green-900/40 text-green-800 dark:text-green-200 rounded-2xl text-sm font-medium">
                      {selectedProduct.target_customer}
                    </span>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Edit Form - Only show when editing or creating new product */}
          {(!selectedProduct || isEditing) && (
            <>
              {/* Quick Import from URL - Only show for new products */}
              {!selectedProduct && (
            <div className="mb-8">
              <div className="flex items-center justify-between mb-3">
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  Schnellimport von URL
                </label>
                <span className="text-xs text-blue-500 font-medium">Optional</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="flex-1 relative p-[2px] rounded-2xl bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500">
                  <div className="bg-white dark:bg-gray-950 rounded-2xl flex items-center">
                    <div className="pl-5 pr-3 text-gray-400">
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                      </svg>
                    </div>
                    <input
                      type="url"
                      value={productUrl}
                      onChange={(e) => setProductUrl(e.target.value)}
                      placeholder="www.products.com"
                      className="flex-1 py-4 pr-5 bg-transparent text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none"
                    />
                  </div>
                </div>
                <button
                  onClick={handleFetchProductData}
                  disabled={!productUrl.trim() || isFetching}
                  className="p-4 bg-blue-600 text-white rounded-2xl hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
                >
                  {isFetching ? (
                    <svg className="w-5 h-5 animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                    </svg>
                  ) : (
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                    </svg>
                  )}
                </button>
              </div>
            </div>
          )}

          {/* Product Images */}
          <div className="mb-8">
            <div className="flex items-center gap-2 mb-3">
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Produktbilder
              </label>
              <span className="text-red-500">*</span>
            </div>
            <div className="flex gap-4">
              {/* Main Image Upload - Larger */}
              <div
                onClick={() => {
                  if (!isUploadingImages) {
                    setEditingImageIndex(0);
                    fileInputRef.current?.click();
                  }
                }}
                className={`w-80 h-80 rounded-3xl border-2 border-dashed border-gray-300 dark:border-gray-700 flex flex-col items-center justify-center transition-colors bg-white dark:bg-gray-800 group ${
                  isUploadingImages
                    ? "opacity-50 cursor-not-allowed"
                    : "hover:border-purple-400 dark:hover:border-purple-500 cursor-pointer"
                }`}
              >
                {uploadedImages[0] ? (
                  <div className="relative w-full h-full">
                    <Image
                      src={uploadedImages[0]}
                      alt="Product image 1"
                      width={320}
                      height={320}
                      className="w-full h-full object-cover rounded-3xl"
                    />
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDeleteImage(0);
                      }}
                      className="absolute top-3 right-3 w-10 h-10 bg-red-500 hover:bg-red-600 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center shadow-lg"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </div>
                ) : (
                  <>
                    <div className="w-12 h-12 bg-gradient-to-br from-purple-400 to-pink-400 rounded-full flex items-center justify-center mb-3">
                      <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                      </svg>
                    </div>
                    <p className="text-xs text-gray-400 text-center px-2">
                      Bild hier ablegen oder klicken zum Hochladen
                    </p>
                  </>
                )}
              </div>

              {/* Additional Image Slots - 2x2 Grid of smaller images */}
              <div className="grid grid-cols-2 gap-3 w-80">
                {[1, 2, 3, 4].map((index) => (
                  <div
                    key={index}
                    onClick={() => {
                      if (!isUploadingImages) {
                        setEditingImageIndex(index);
                        fileInputRef.current?.click();
                      }
                    }}
                    className={`aspect-square rounded-3xl border-2 border-dashed border-gray-200 dark:border-gray-700 flex items-center justify-center transition-colors bg-white dark:bg-gray-800 group ${
                      isUploadingImages
                        ? "opacity-50 cursor-not-allowed"
                        : "hover:border-gray-300 dark:hover:border-gray-600 cursor-pointer"
                    }`}
                  >
                    {uploadedImages[index] ? (
                      <div className="relative w-full h-full">
                        <Image
                          src={uploadedImages[index]}
                          alt={`Product image ${index + 1}`}
                          width={150}
                          height={150}
                          className="w-full h-full object-cover rounded-3xl"
                        />
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDeleteImage(index);
                          }}
                          className="absolute top-2 right-2 w-8 h-8 bg-red-500 hover:bg-red-600 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center shadow-lg"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                          </svg>
                        </button>
                      </div>
                    ) : (
                      <div className="w-8 h-8 bg-gradient-to-br from-purple-400 to-pink-400 rounded-full flex items-center justify-center">
                        <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                        </svg>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              multiple
              onChange={handleImageUpload}
              disabled={isUploadingImages}
              className="hidden"
            />
            {isUploadingImages && (
              <p className="text-sm text-blue-600 dark:text-blue-400 mt-3 flex items-center gap-2">
                <svg className="w-4 h-4 animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
                Bilder werden hochgeladen...
              </p>
            )}
          </div>

          {/* Product Title */}
          <div className="mb-8">
            <div className="flex items-center gap-2 mb-3">
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Produkttitel
              </label>
              <span className="text-red-500">*</span>
            </div>
            <input
              type="text"
              value={productName}
              onChange={(e) => setProductName(e.target.value)}
              placeholder="Titel für neues Produkt eingeben..."
              className="w-full px-4 py-4 bg-white dark:bg-gray-800 border-2 border-gray-200 dark:border-gray-700 rounded-3xl text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:border-blue-500 dark:focus:border-blue-500"
            />
          </div>

          {/* Description */}
          <div className="mb-8">
            <div className="flex items-center justify-between mb-3">
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Beschreibung
              </label>
              <span className="text-xs text-blue-500 font-medium">Optional</span>
            </div>
            <textarea
              value={productDescription}
              onChange={(e) => setProductDescription(e.target.value)}
              placeholder="Beschreibung für neues Produkt eingeben..."
              rows={4}
              className="w-full px-4 py-4 bg-white dark:bg-gray-800 border-2 border-gray-200 dark:border-gray-700 rounded-3xl text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:border-blue-500 dark:focus:border-blue-500 resize-none"
            />
          </div>

          {/* Key Features */}
          <div className="mb-8">
            <div className="flex items-center justify-between mb-3">
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Hauptmerkmale
              </label>
              <span className="text-xs text-blue-500 font-medium">Optional</span>
            </div>
            <div className="space-y-2">
              {keyFeatures.map((feature, index) => (
                <div key={index} className="flex gap-2">
                  <input
                    type="text"
                    value={feature}
                    onChange={(e) => {
                      const newFeatures = [...keyFeatures];
                      newFeatures[index] = e.target.value;
                      setKeyFeatures(newFeatures);
                    }}
                    placeholder={`Merkmal ${index + 1}`}
                    className="flex-1 px-4 py-3 bg-white dark:bg-gray-800 border-2 border-gray-200 dark:border-gray-700 rounded-2xl text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:border-blue-500 dark:focus:border-blue-500"
                  />
                  <button
                    onClick={() => {
                      const newFeatures = keyFeatures.filter((_, i) => i !== index);
                      setKeyFeatures(newFeatures);
                    }}
                    className="px-3 text-red-500 hover:text-red-700"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              ))}
              <button
                onClick={() => setKeyFeatures([...keyFeatures, ""])}
                className="text-sm text-blue-600 dark:text-blue-400 hover:underline font-medium"
              >
                + Merkmal hinzufügen
              </button>
            </div>
          </div>

          {/* Benefits */}
          <div className="mb-8">
            <div className="flex items-center justify-between mb-3">
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Vorteile
              </label>
              <span className="text-xs text-blue-500 font-medium">Optional</span>
            </div>
            <div className="space-y-2">
              {benefits.map((benefit, index) => (
                <div key={index} className="flex gap-2">
                  <input
                    type="text"
                    value={benefit}
                    onChange={(e) => {
                      const newBenefits = [...benefits];
                      newBenefits[index] = e.target.value;
                      setBenefits(newBenefits);
                    }}
                    placeholder={`Vorteil ${index + 1}`}
                    className="flex-1 px-4 py-3 bg-white dark:bg-gray-800 border-2 border-gray-200 dark:border-gray-700 rounded-2xl text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:border-blue-500 dark:focus:border-blue-500"
                  />
                  <button
                    onClick={() => {
                      const newBenefits = benefits.filter((_, i) => i !== index);
                      setBenefits(newBenefits);
                    }}
                    className="px-3 text-red-500 hover:text-red-700"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              ))}
              <button
                onClick={() => setBenefits([...benefits, ""])}
                className="text-sm text-blue-600 dark:text-blue-400 hover:underline font-medium"
              >
                + Vorteil hinzufügen
              </button>
            </div>
          </div>

          {/* Target Customer */}
          <div className="mb-8">
            <div className="flex items-center justify-between mb-3">
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Zielgruppe
              </label>
              <span className="text-xs text-blue-500 font-medium">Optional</span>
            </div>
            <textarea
              value={targetCustomer}
              onChange={(e) => setTargetCustomer(e.target.value)}
              placeholder="Beschreibe deine Zielgruppe..."
              rows={3}
              className="w-full px-4 py-4 bg-white dark:bg-gray-800 border-2 border-gray-200 dark:border-gray-700 rounded-3xl text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:border-blue-500 dark:focus:border-blue-500 resize-none"
            />
          </div>

          {/* Save Button */}
          <div className="flex justify-end gap-3">
            {selectedProduct && isEditing && (
              <button
                onClick={handleCancelEditing}
                className="px-8 py-3 bg-gray-200 dark:bg-gray-800 text-gray-900 dark:text-white font-medium rounded-2xl hover:bg-gray-300 dark:hover:bg-gray-700 transition-all shadow-lg"
              >
                Abbrechen
              </button>
            )}
            <button
              onClick={selectedProduct ? handleUpdateProduct : handleAddManualProduct}
              disabled={!productName.trim()}
              className="px-8 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-medium rounded-2xl hover:from-blue-700 hover:to-purple-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg"
            >
              {selectedProduct ? "Änderungen speichern" : "Produkt speichern"}
            </button>
          </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
