"use client";

import { useState } from "react";
import Image from "next/image";

interface GeneratedImagesDisplayProps {
  images: string[];
  onEditImage: (imageUrl: string, editPrompt: string) => void;
  isEditing?: boolean;
}

export default function GeneratedImagesDisplay({
  images,
  onEditImage,
  isEditing = false,
}: GeneratedImagesDisplayProps) {
  const [selectedImageForEdit, setSelectedImageForEdit] = useState<string | null>(null);
  const [editPrompt, setEditPrompt] = useState("");

  const handleImageClick = (imageUrl: string) => {
    if (!isEditing) {
      setSelectedImageForEdit(imageUrl);
      setEditPrompt("");
    }
  };

  const handleSubmitEdit = () => {
    if (selectedImageForEdit && editPrompt.trim()) {
      onEditImage(selectedImageForEdit, editPrompt);
      setSelectedImageForEdit(null);
      setEditPrompt("");
    }
  };

  const handleCancelEdit = () => {
    setSelectedImageForEdit(null);
    setEditPrompt("");
  };

  return (
    <div className="my-4">
      <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
        {images.map((imageUrl, index) => {
          const isSelectedForEdit = selectedImageForEdit === imageUrl;

          return (
            <div key={index} className="relative">
              <button
                onClick={() => handleImageClick(imageUrl)}
                disabled={isEditing}
                className={`group aspect-square bg-gray-100 dark:bg-gray-900 rounded-3xl overflow-hidden border-2 transition-all w-full relative ${
                  isSelectedForEdit
                    ? "border-blue-500 shadow-lg"
                    : "border-gray-200 dark:border-gray-700 hover:border-blue-400 dark:hover:border-blue-500 hover:shadow-lg"
                } ${isEditing ? "opacity-50 cursor-not-allowed" : ""}`}
              >
                <Image
                  src={imageUrl}
                  alt={`Generated campaign image ${index + 1}`}
                  fill
                  className="object-cover"
                  unoptimized
                />

                {/* Hover overlay */}
                {!isEditing && !isSelectedForEdit && (
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-all flex items-center justify-center">
                    <div className="opacity-0 group-hover:opacity-100 transform scale-75 group-hover:scale-100 transition-all">
                      <div className="bg-white dark:bg-gray-800 rounded-full p-3 shadow-lg">
                        <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                        </svg>
                      </div>
                    </div>
                  </div>
                )}

                {/* Selected indicator */}
                {isSelectedForEdit && (
                  <div className="absolute top-2 right-2 bg-blue-600 rounded-full p-1.5 shadow-lg">
                    <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                    </svg>
                  </div>
                )}
              </button>

              {/* Edit input form */}
              {isSelectedForEdit && (
                <div className="mt-3 bg-white dark:bg-gray-800 border-2 border-blue-400 dark:border-blue-500 rounded-2xl p-4 shadow-lg">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Beschreibe deine Änderungen:
                  </label>
                  <textarea
                    value={editPrompt}
                    onChange={(e) => setEditPrompt(e.target.value)}
                    placeholder="z.B. Mache den Hintergrund blau, füge Text hinzu..."
                    rows={3}
                    className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl text-gray-900 dark:text-white text-sm placeholder-gray-400 focus:outline-none focus:border-blue-500 dark:focus:border-blue-500 resize-none"
                    autoFocus
                  />
                  <div className="flex gap-2 mt-3">
                    <button
                      onClick={handleCancelEdit}
                      className="flex-1 px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-white rounded-xl text-sm font-medium hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
                    >
                      Abbrechen
                    </button>
                    <button
                      onClick={handleSubmitEdit}
                      disabled={!editPrompt.trim()}
                      className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-xl text-sm font-medium hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Bearbeiten
                    </button>
                  </div>
                </div>
              )}
            </div>
          );
        })}
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
