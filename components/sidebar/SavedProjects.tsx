"use client";

import { useState, useEffect } from "react";
import { supabaseBrowserClient } from "@/lib/supabaseClient";
import ProjectDetailsModal from "./ProjectDetailsModal";
import type { Database } from "@/types/database";
import { useToast } from "@/components/ToastProvider";

type SavedProject = Database["public"]["Tables"]["saved_projects"]["Row"];

export default function SavedProjects() {
  const { showSuccess, showError } = useToast();
  const [savedProjects, setSavedProjects] = useState<SavedProject[]>([]);
  const [selectedProject, setSelectedProject] = useState<SavedProject | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchSavedProjects();
  }, []);

  const fetchSavedProjects = async () => {
    try {
      setIsLoading(true);

      // Get current user
      const { data: { user } } = await supabaseBrowserClient.auth.getUser();

      if (!user) {
        console.log("No authenticated user");
        setSavedProjects([]);
        setIsLoading(false);
        return;
      }

      const { data, error } = await supabaseBrowserClient
        .from("saved_projects")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false })
        .limit(10);

      if (error) {
        console.error("Error fetching saved projects:", error);
        return;
      }

      setSavedProjects(data || []);
    } catch (error) {
      console.error("Error fetching saved projects:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleProjectClick = (project: SavedProject) => {
    console.log("Project clicked:", project);
    setSelectedProject(project);
    setIsModalOpen(true);
    console.log("Modal should be open now");
  };

  const handleDeleteProject = async (projectId: string) => {
    try {
      const { error } = await supabaseBrowserClient
        .from("saved_projects")
        .delete()
        .eq("id", projectId);

      if (error) {
        console.error("Error deleting project:", error);
        showError("Failed to delete the project");
        return;
      }

      setSavedProjects((prev) => prev.filter((p) => p.id !== projectId));
      showSuccess("Project deleted successfully");
    } catch (error) {
      console.error("Error deleting project:", error);
      showError("Failed to delete the project");
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  return (
    <>
      <div className="p-4 border-b border-gray-200 dark:border-gray-800">
        <h3 className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-3">
          Meine Gespeicherten Projekte
        </h3>
        <div className="space-y-1">
          {isLoading ? (
            <div className="text-sm text-gray-500 dark:text-gray-400 px-3 py-2">
              Loading...
            </div>
          ) : savedProjects.length === 0 ? (
            <div className="text-sm text-gray-500 dark:text-gray-400 px-3 py-2">
              No saved projects yet
            </div>
          ) : (
            savedProjects.map((project) => (
              <button
                key={project.id}
                onClick={() => handleProjectClick(project)}
                className="w-full text-left px-3 py-2 rounded-lg text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors group"
              >
                <div className="flex items-center gap-3">
                  {project.thumbnail_url || project.image_url ? (
                    <img
                      src={project.thumbnail_url || project.image_url}
                      alt={project.project_name || "Project"}
                      className="w-10 h-10 object-cover rounded"
                    />
                  ) : (
                    <div className="w-10 h-10 bg-gray-200 dark:bg-gray-700 rounded flex items-center justify-center text-xs text-gray-500">
                      No img
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <div className="font-medium truncate">
                      {project.project_name || "Untitled Project"}
                    </div>
                    <div className="text-xs text-gray-500 dark:text-gray-500">
                      {formatDate(project.created_at)}
                    </div>
                  </div>
                </div>
              </button>
            ))
          )}
        </div>
      </div>

      <ProjectDetailsModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        project={selectedProject}
        onDelete={handleDeleteProject}
      />
    </>
  );
}





