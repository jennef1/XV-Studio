import { supabaseBrowserClient } from "@/lib/supabaseClient";
import type { SavedProject, SaveProjectData, FilterOptions } from "@/types/gallery";

/**
 * Save a project to the database
 */
export async function saveProject(data: SaveProjectData): Promise<{ success: boolean; error?: string; project?: SavedProject }> {
  try {
    // Check session first
    const { data: { session }, error: sessionError } = await supabaseBrowserClient.auth.getSession();

    console.log("Session check:", {
      hasSession: !!session,
      sessionError,
      userId: session?.user?.id
    });

    if (sessionError) {
      console.error("Session error:", sessionError);
      return { success: false, error: `Authentication error: ${sessionError.message}` };
    }

    if (!session) {
      return {
        success: false,
        error: "Du bist nicht angemeldet. Bitte melde dich an, um Projekte zu speichern."
      };
    }

    const user = session.user;

    console.log("Attempting to save project:", { userId: user.id, ...data });

    const { data: project, error } = await supabaseBrowserClient
      .from('saved_projects')
      .insert({
        user_id: user.id,
        ...data,
      })
      .select()
      .single();

    if (error) {
      console.error("Error saving project:", error);
      return { success: false, error: `Database error: ${error.message}. ${error.hint || ''}` };
    }

    console.log("Project saved successfully:", project);
    return { success: true, project };
  } catch (error: any) {
    console.error("Error in saveProject:", error);
    return { success: false, error: error.message };
  }
}

/**
 * Fetch projects with optional filters
 */
export async function fetchProjects(filters?: FilterOptions): Promise<{ success: boolean; projects?: SavedProject[]; error?: string }> {
  try {
    const { data: { session } } = await supabaseBrowserClient.auth.getSession();

    if (!session?.user) {
      return { success: false, error: "User not authenticated" };
    }

    const user = session.user;

    let query = supabaseBrowserClient
      .from('saved_projects')
      .select('*')
      .eq('user_id', user.id);

    // Apply filters if provided
    if (filters) {
      if (filters.productType !== 'all') {
        query = query.eq('product_type', filters.productType);
      }

      if (filters.favorites) {
        query = query.eq('is_favorite', true);
      }

      // Apply sorting
      const sortField = filters.sortBy === 'name' ? 'project_name' : 'created_at';
      const ascending = filters.sortBy === 'oldest';
      query = query.order(sortField, { ascending, nullsFirst: false });
    } else {
      // Default: newest first
      query = query.order('created_at', { ascending: false });
    }

    const { data: projects, error } = await query;

    if (error) {
      console.error("Error fetching projects:", error);
      return { success: false, error: error.message };
    }

    return { success: true, projects: projects || [] };
  } catch (error: any) {
    console.error("Error in fetchProjects:", error);
    return { success: false, error: error.message };
  }
}

/**
 * Delete a project
 */
export async function deleteProject(id: string): Promise<{ success: boolean; error?: string }> {
  try {
    const { error } = await supabaseBrowserClient
      .from('saved_projects')
      .delete()
      .eq('id', id);

    if (error) {
      console.error("Error deleting project:", error);
      return { success: false, error: error.message };
    }

    return { success: true };
  } catch (error: any) {
    console.error("Error in deleteProject:", error);
    return { success: false, error: error.message };
  }
}

/**
 * Toggle favorite status
 */
export async function toggleFavorite(id: string, currentStatus: boolean): Promise<{ success: boolean; error?: string }> {
  try {
    const { error } = await supabaseBrowserClient
      .from('saved_projects')
      .update({
        is_favorite: !currentStatus,
        updated_at: new Date().toISOString(),
      })
      .eq('id', id);

    if (error) {
      console.error("Error toggling favorite:", error);
      return { success: false, error: error.message };
    }

    return { success: true };
  } catch (error: any) {
    console.error("Error in toggleFavorite:", error);
    return { success: false, error: error.message };
  }
}

/**
 * Download an image
 */
export async function downloadImage(imageUrl: string, fileName?: string): Promise<{ success: boolean; error?: string }> {
  try {
    const response = await fetch(imageUrl);
    if (!response.ok) {
      throw new Error(`Failed to fetch image: ${response.statusText}`);
    }

    const blob = await response.blob();
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = fileName || `projekt-${Date.now()}.jpg`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);

    return { success: true };
  } catch (error: any) {
    console.error("Error downloading image:", error);
    return { success: false, error: error.message };
  }
}

/**
 * Format date for display
 */
export function formatDate(dateString: string): string {
  const date = new Date(dateString);
  return new Intl.DateTimeFormat('de-DE', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(date);
}

/**
 * Generate a project name from a prompt
 * Takes the first 50 characters and capitalizes first letter
 */
export function generateProjectName(prompt: string): string {
  if (!prompt || typeof prompt !== 'string') {
    return 'Unbenanntes Projekt';
  }

  // Clean the prompt: remove extra whitespace and newlines
  const cleaned = prompt.trim().replace(/\s+/g, ' ');

  // Take first 50 characters
  let name = cleaned.substring(0, 50);

  // If we cut in the middle of a word, truncate to last complete word
  if (cleaned.length > 50) {
    const lastSpace = name.lastIndexOf(' ');
    if (lastSpace > 20) { // Only truncate if we have at least 20 chars
      name = name.substring(0, lastSpace);
    }
    name += '...';
  }

  // Capitalize first letter
  return name.charAt(0).toUpperCase() + name.slice(1);
}
