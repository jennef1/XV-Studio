"use client";

import { useState, useEffect } from "react";
import type { SavedProject, FilterOptions } from "@/types/gallery";
import { fetchProjects, toggleFavorite } from "@/lib/gallery/galleryService";
import GalleryGrid from "@/components/gallery/GalleryGrid";
import GalleryFilters from "@/components/gallery/GalleryFilters";
import EmptyGallery from "@/components/gallery/EmptyGallery";
import ImageDetailModal from "@/components/gallery/ImageDetailModal";
import { useToast } from "@/components/ToastProvider";

/**
 * Gallery view component for use in the studio
 * Shows saved projects in the main content area
 */
export default function GalleryView() {
  const { showError } = useToast();
  const [projects, setProjects] = useState<SavedProject[]>([]);
  const [filteredProjects, setFilteredProjects] = useState<SavedProject[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedProject, setSelectedProject] = useState<SavedProject | null>(null);

  const [filters, setFilters] = useState<FilterOptions>({
    productType: 'all',
    favorites: false,
    sortBy: 'newest',
  });

  // Fetch projects on mount
  useEffect(() => {
    loadProjects();
  }, []);

  // Apply filters whenever projects or filters change
  useEffect(() => {
    applyFilters();
  }, [projects, filters]);

  const loadProjects = async () => {
    setIsLoading(true);
    setError(null);

    const result = await fetchProjects(filters);

    if (result.success && result.projects) {
      setProjects(result.projects);
    } else {
      setError(result.error || "Fehler beim Laden der Projekte");
    }

    setIsLoading(false);
  };

  const applyFilters = () => {
    let filtered = [...projects];

    // Filter by product type
    if (filters.productType !== 'all') {
      filtered = filtered.filter(p => p.product_type === filters.productType);
    }

    // Filter by favorites
    if (filters.favorites) {
      filtered = filtered.filter(p => p.is_favorite);
    }

    // Sort
    filtered.sort((a, b) => {
      if (filters.sortBy === 'name') {
        const nameA = a.project_name || '';
        const nameB = b.project_name || '';
        return nameA.localeCompare(nameB);
      } else if (filters.sortBy === 'oldest') {
        return new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
      } else {
        // newest (default)
        return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
      }
    });

    setFilteredProjects(filtered);
  };

  const handleProjectClick = (project: SavedProject) => {
    setSelectedProject(project);
  };

  const handleCloseModal = () => {
    setSelectedProject(null);
  };

  const handleToggleFavorite = async (project: SavedProject) => {
    const result = await toggleFavorite(project.id, project.is_favorite);

    if (result.success) {
      // Update local state
      setProjects(prev =>
        prev.map(p =>
          p.id === project.id
            ? { ...p, is_favorite: !p.is_favorite }
            : p
        )
      );

      // Also update selected project if it's open
      if (selectedProject?.id === project.id) {
        setSelectedProject({ ...project, is_favorite: !project.is_favorite });
      }
    } else {
      showError(`Fehler: ${result.error}`);
    }
  };

  const handleDelete = (deletedProject: SavedProject) => {
    // Remove from local state
    setProjects(prev => prev.filter(p => p.id !== deletedProject.id));
  };

  return (
    <div className="h-full bg-gray-50 dark:bg-gray-950 overflow-hidden flex flex-col">
      <div className="flex-shrink-0 px-8 pt-16 pb-6">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">
            Meine Projekte
          </h1>
        </div>

        {/* Error state */}
        {error && (
          <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
            <p className="text-red-800 dark:text-red-200">{error}</p>
          </div>
        )}

        {/* Filters */}
        {!isLoading && projects.length > 0 && (
          <div>
            <GalleryFilters
              activeFilter={filters}
              onFilterChange={setFilters}
            />
          </div>
        )}
      </div>

      {/* Gallery Grid - Scrollable */}
      <div className="flex-1 overflow-y-auto px-8 pb-8">
        {!isLoading && filteredProjects.length === 0 && projects.length > 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-600 dark:text-gray-400">
              Keine Projekte gefunden, die deinen Filterkriterien entsprechen.
            </p>
            <button
              onClick={() => setFilters({ productType: 'all', favorites: false, sortBy: 'newest' })}
              className="mt-4 text-purple-600 hover:text-purple-700 dark:text-purple-400 dark:hover:text-purple-300 font-medium"
            >
              Filter zurücksetzen
            </button>
          </div>
        ) : !isLoading && projects.length === 0 ? (
          <EmptyGallery />
        ) : (
          <GalleryGrid
            projects={filteredProjects}
            onProjectClick={handleProjectClick}
            onToggleFavorite={handleToggleFavorite}
            isLoading={isLoading}
          />
        )}
      </div>

      {/* Detail Modal */}
      {selectedProject && (
        <ImageDetailModal
          project={selectedProject}
          onClose={handleCloseModal}
          onDelete={handleDelete}
          onToggleFavorite={handleToggleFavorite}
        />
      )}
    </div>
  );
}
