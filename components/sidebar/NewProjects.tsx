"use client";

import { ReactNode, useState } from "react";

interface ProjectTemplate {
  id: number;
  name: string;
  icon: ReactNode;
  badge?: string;
}

const projectTemplates: ProjectTemplate[] = [
    {
      id: 0,
      name: "Bilder",
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909m-18 3.75h16.5a1.5 1.5 0 001.5-1.5V6a1.5 1.5 0 00-1.5-1.5H3.75A1.5 1.5 0 002.25 6v12a1.5 1.5 0 001.5 1.5zm10.5-11.25h.008v.008h-.008V8.25zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z" />
        </svg>
      ),
    },
    {
      id: 2,
      name: "Video",
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 7.5l-9-5.25L3 7.5m18 0l-9 5.25m9-5.25v9l-9 5.25M3 7.5l9 5.25M3 7.5v9l9 5.25m0-9v9" />
        </svg>
      ),
    },
    {
      id: 1,
      name: "Social Media Paket",
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5" />
        </svg>
      ),
    },
  ];

interface NewProjectsProps {
  selectedId: number | null;
  onSelect: (id: number) => void;
  hasBusiness: boolean;
}

export default function NewProjects({ selectedId, onSelect, hasBusiness }: NewProjectsProps) {
  const [hoveredId, setHoveredId] = useState<number | null>(null);

  return (
    <div className="px-4 pb-4">
      <div className="space-y-1">
        {projectTemplates.map((project) => {
          const isActive = project.id === selectedId;
          const isDisabled = !hasBusiness;
          const hasBadge = 'badge' in project;

          return (
            <div key={project.id} className="relative">
              <button
                onClick={() => !isDisabled && onSelect(project.id)}
                onMouseEnter={() => setHoveredId(project.id)}
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
                  {project.icon}
                </span>
                <span className="truncate flex-1">{project.name}</span>
                {hasBadge && (
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400 font-medium">
                    {project.badge}
                  </span>
                )}
              </button>

              {/* Tooltip */}
              {isDisabled && hoveredId === project.id && (
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


