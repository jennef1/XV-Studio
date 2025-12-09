"use client";

import { useState } from "react";
import SidebarHeader from "./SidebarHeader";
import NewProjects from "./NewProjects";
import ChatHistory from "./ChatHistory";

type Selection =
  | {
      category: "project" | "chat" | "gallery";
      id: number;
    }
  | null;

interface SidebarProps {
  selectedProductId: number | null;
  onProductSelect: (id: number | null) => void;
  onGallerySelect: (id: number) => void;
  hasBusiness: boolean;
}

export default function Sidebar({ selectedProductId, onProductSelect, onGallerySelect, hasBusiness }: SidebarProps) {
  const [selection, setSelection] = useState<Selection>(null);

  const handleProjectSelect = (id: number) => {
    setSelection({ category: "project", id });
    onProductSelect(id);
  };

  const handleChatSelect = (id: number) => {
    setSelection({ category: "chat", id });
    // All gallery items notify parent with their ID
    onGallerySelect(id);
  };

  return (
    <div className="w-64 h-full bg-gray-50 dark:bg-gray-900 border-r border-gray-200 dark:border-gray-800 flex flex-col overflow-y-auto">
      <SidebarHeader />
      <NewProjects
        selectedId={selection?.category === "project" ? selection.id : null}
        onSelect={handleProjectSelect}
        hasBusiness={hasBusiness}
      />
      <div className="flex-1 flex flex-col justify-end overflow-y-auto">
        <ChatHistory
          selectedId={selection?.category === "chat" ? selection.id : null}
          onSelect={handleChatSelect}
          hasBusiness={hasBusiness}
        />
      </div>
    </div>
  );
}


