"use client";

import type { FilterOptions } from "@/types/gallery";
import { PRODUCT_TYPE_NAMES } from "@/types/gallery";

interface GalleryFiltersProps {
  activeFilter: FilterOptions;
  onFilterChange: (filter: FilterOptions) => void;
}

export default function GalleryFilters({ activeFilter, onFilterChange }: GalleryFiltersProps) {
  const productTypes = [
    { value: 'all' as const, label: 'Alle' },
    { value: 0, label: PRODUCT_TYPE_NAMES[0] },
    { value: 1, label: PRODUCT_TYPE_NAMES[1] },
    { value: 2, label: PRODUCT_TYPE_NAMES[2] },
  ];

  return (
    <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
      {/* Product Type Filters */}
      <div className="flex flex-wrap gap-2">
        {productTypes.map((type) => (
          <button
            key={type.value}
            onClick={() => onFilterChange({ ...activeFilter, productType: type.value })}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              activeFilter.productType === type.value
                ? 'bg-purple-600 text-white'
                : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
            }`}
          >
            {type.label}
          </button>
        ))}
      </div>

      {/* Sort & Favorites */}
      <div className="flex gap-3">
        {/* Favorites Toggle */}
        <button
          onClick={() => onFilterChange({ ...activeFilter, favorites: !activeFilter.favorites })}
          className={`p-2 rounded-lg transition-colors ${
            activeFilter.favorites
              ? 'bg-yellow-100 dark:bg-yellow-900 text-yellow-700 dark:text-yellow-200'
              : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700'
          }`}
          aria-label="Filter favorites"
        >
          <svg className="w-5 h-5" fill={activeFilter.favorites ? 'currentColor' : 'none'} stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
          </svg>
        </button>

        {/* Sort Dropdown */}
        <select
          value={activeFilter.sortBy}
          onChange={(e) => onFilterChange({ ...activeFilter, sortBy: e.target.value as 'newest' | 'oldest' | 'name' })}
          className="px-4 py-2 rounded-lg bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 text-sm font-medium border-none focus:ring-2 focus:ring-purple-500"
        >
          <option value="newest">Neueste zuerst</option>
          <option value="oldest">Älteste zuerst</option>
          <option value="name">Nach Name</option>
        </select>
      </div>
    </div>
  );
}
