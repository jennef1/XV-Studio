"use client";

import { useState } from "react";

const galleryItems = [
  {
    id: 1,
    name: "Unternehmensprofil",
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
      </svg>
    ),
  },
  {
    id: 2,
    name: "Angebot",
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
      </svg>
    ),
  },
  {
    id: 3,
    name: "Meine Projekte",
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
      </svg>
    ),
  },
  {
    id: 4,
    name: "Inspirationen",
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
      </svg>
    ),
  },
];

interface ChatHistoryProps {
  selectedId: number | null;
  onSelect: (id: number) => void;
  hasBusiness: boolean;
}

export default function ChatHistory({ selectedId, onSelect, hasBusiness }: ChatHistoryProps) {
  const [hoveredId, setHoveredId] = useState<number | null>(null);
  return (
    <div className="px-4 pb-6 mt-6">
      <p className="text-xs text-gray-400 font-medium mb-2">Gallerie</p>
      <div className="space-y-1">
        {galleryItems.map((item) => {
          const isActive = item.id === selectedId;
          const isDisabled = !hasBusiness && (item.id === 3 || item.id === 4);

          return (
            <div key={item.id} className="relative">
              <button
                onClick={() => !isDisabled && onSelect(item.id)}
                onMouseEnter={() => setHoveredId(item.id)}
                onMouseLeave={() => setHoveredId(null)}
                disabled={isDisabled}
                className={`w-full text-left px-3 py-2.5 rounded-xl text-sm transition-colors flex items-center gap-3 font-medium ${
                  isActive
                    ? "bg-gray-900 text-white shadow-sm"
                    : isDisabled
                    ? "text-gray-400 dark:text-gray-600 cursor-not-allowed opacity-50"
                    : "text-gray-800 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800"
                }`}
              >
                <span className={`flex-shrink-0 ${
                  isActive ? "text-white" : isDisabled ? "text-gray-400" : "text-gray-600 dark:text-gray-400"
                }`}>
                  {item.icon}
                </span>
                <span className="truncate">{item.name}</span>
              </button>

              {/* Tooltip */}
              {isDisabled && hoveredId === item.id && (
                <div className="absolute left-full ml-2 top-0 z-50 w-48 px-3 py-2 bg-gray-900 dark:bg-gray-700 text-white text-xs rounded-lg shadow-lg">
                  Erstelle zuerst dein Unternehmensprofil
                  <div className="absolute left-0 top-3 -ml-1 w-2 h-2 bg-gray-900 dark:bg-gray-700 transform rotate-45"></div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}


