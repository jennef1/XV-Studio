"use client";

import { useState } from "react";

interface EditableAreaProps {
  initialContent?: string;
}

export default function EditableArea({ initialContent = "" }: EditableAreaProps) {
  const [content, setContent] = useState(initialContent);

  return (
    <div className="flex-1 flex flex-col">
      <div className="flex items-center justify-between mb-2">
        <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300">
          Content Editor
        </h3>
        <button className="text-xs text-blue-600 dark:text-blue-400 hover:underline">
          Save
        </button>
      </div>
      <textarea
        value={content}
        onChange={(e) => setContent(e.target.value)}
        placeholder="Edit your content here..."
        className="flex-1 w-full px-4 py-3 rounded-lg bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400 border border-gray-200 dark:border-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
      />
    </div>
  );
}





