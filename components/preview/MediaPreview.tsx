"use client";

interface MediaPreviewProps {
  mediaUrl?: string;
  mediaType?: "image" | "video";
}

export default function MediaPreview({
  mediaUrl,
  mediaType = "image",
}: MediaPreviewProps) {
  return (
    <div className="w-full aspect-video bg-gray-900 dark:bg-black rounded-xl flex items-center justify-center overflow-hidden">
      {mediaUrl ? (
        mediaType === "image" ? (
          <img
            src={mediaUrl}
            alt="Preview"
            className="w-full h-full object-contain"
          />
        ) : (
          <video
            src={mediaUrl}
            controls
            className="w-full h-full object-contain"
          />
        )
      ) : (
        <div className="text-center text-gray-500 dark:text-gray-600">
          <svg
            className="w-20 h-20 mx-auto mb-3 opacity-40"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1.5}
              d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
            />
          </svg>
          <p className="text-sm font-medium">Keine Vorschau verfügbar</p>
        </div>
      )}
    </div>
  );
}


