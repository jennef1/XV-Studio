"use client";

import { useRouter } from "next/navigation";

export default function EmptyGallery() {
  const router = useRouter();

  return (
    <div className="flex flex-col items-center justify-center py-20 px-4">
      <div className="w-24 h-24 mb-6 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center">
        <svg className="w-12 h-12 text-gray-400 dark:text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909m-18 3.75h16.5a1.5 1.5 0 001.5-1.5V6a1.5 1.5 0 00-1.5-1.5H3.75A1.5 1.5 0 002.25 6v12a1.5 1.5 0 001.5 1.5zm10.5-11.25h.008v.008h-.008V8.25zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z" />
        </svg>
      </div>
      <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-2">
        Noch keine Projekte gespeichert
      </h2>
      <p className="text-gray-600 dark:text-gray-400 mb-8 text-center max-w-md">
        Erstelle dein erstes Projekt im Studio und speichere es, um es hier zu sehen.
      </p>
      <button
        onClick={() => router.push('/studio')}
        className="px-6 py-3 bg-purple-600 hover:bg-purple-700 text-white rounded-lg font-medium transition-colors flex items-center gap-2"
      >
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
        </svg>
        Zum Studio
      </button>
    </div>
  );
}
