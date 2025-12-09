import { supabaseBrowserClient } from "@/lib/supabaseClient";
import type {
  ProjectTracking,
  ProjectEditHistory,
  WorkflowType,
} from "@/types/gallery";

/**
 * Create initial project tracking record
 */
export async function createProjectTracking(data: {
  saved_project_id: string;
  campaign_job_id?: string | null;
  workflow_type: WorkflowType;
  product_category?: string | null;
  business_id?: string | null;
  product_id?: string | null;
  generation_count?: number;
  edit_count?: number;
}): Promise<{
  success: boolean;
  tracking?: ProjectTracking;
  error?: string;
}> {
  try {
    const {
      data: { session },
    } = await supabaseBrowserClient.auth.getSession();

    if (!session?.user) {
      return { success: false, error: "User not authenticated" };
    }

    const { data: tracking, error } = await supabaseBrowserClient
      .from("project_tracking")
      .insert({
        user_id: session.user.id,
        ...data,
      })
      .select()
      .single();

    if (error) {
      console.error("Error creating project tracking:", error);
      return { success: false, error: error.message };
    }

    return { success: true, tracking: tracking as ProjectTracking };
  } catch (error: any) {
    console.error("Error in createProjectTracking:", error);
    return { success: false, error: error.message };
  }
}

/**
 * Increment edit count for a project using atomic database function
 */
export async function incrementEditCount(
  trackingId: string
): Promise<{ success: boolean; error?: string }> {
  try {
    const { error } = await supabaseBrowserClient.rpc("increment_edit_count", {
      tracking_id: trackingId,
    });

    if (error) {
      console.error("Error incrementing edit count:", error);
      return { success: false, error: error.message };
    }

    return { success: true };
  } catch (error: any) {
    console.error("Error in incrementEditCount:", error);
    return { success: false, error: error.message };
  }
}

/**
 * Create edit history entry
 */
export async function createEditHistoryEntry(data: {
  project_tracking_id: string;
  saved_project_id: string;
  edit_type: "generation" | "edit";
  edit_number: number;
  prompt: string;
  result_url: string;
  metadata?: any;
}): Promise<{
  success: boolean;
  entry?: ProjectEditHistory;
  error?: string;
}> {
  try {
    const { data: entry, error } = await supabaseBrowserClient
      .from("project_edit_history")
      .insert(data)
      .select()
      .single();

    if (error) {
      console.error("Error creating edit history entry:", error);
      return { success: false, error: error.message };
    }

    return { success: true, entry: entry as ProjectEditHistory };
  } catch (error: any) {
    console.error("Error in createEditHistoryEntry:", error);
    return { success: false, error: error.message };
  }
}

/**
 * Get edit history for a project
 */
export async function getEditHistory(
  savedProjectId: string
): Promise<{
  success: boolean;
  history?: ProjectEditHistory[];
  error?: string;
}> {
  try {
    const { data: history, error } = await supabaseBrowserClient
      .from("project_edit_history")
      .select("*")
      .eq("saved_project_id", savedProjectId)
      .order("edit_number", { ascending: true });

    if (error) {
      console.error("Error fetching edit history:", error);
      return { success: false, error: error.message };
    }

    return { success: true, history: history as ProjectEditHistory[] };
  } catch (error: any) {
    console.error("Error in getEditHistory:", error);
    return { success: false, error: error.message };
  }
}

/**
 * Get project tracking info
 */
export async function getProjectTracking(
  savedProjectId: string
): Promise<{
  success: boolean;
  tracking?: ProjectTracking;
  error?: string;
}> {
  try {
    const { data: tracking, error } = await supabaseBrowserClient
      .from("project_tracking")
      .select("*")
      .eq("saved_project_id", savedProjectId)
      .single();

    if (error) {
      console.error("Error fetching project tracking:", error);
      return { success: false, error: error.message };
    }

    return { success: true, tracking: tracking as ProjectTracking };
  } catch (error: any) {
    console.error("Error in getProjectTracking:", error);
    return { success: false, error: error.message };
  }
}
