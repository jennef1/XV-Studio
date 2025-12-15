import { supabaseBrowserClient } from "./supabaseClient";

/**
 * Get all businesses a user has access to (non-detached)
 * Uses junction table for multi-user support
 *
 * @param userId - The user's ID
 * @param useAdmin - Whether to use admin client (for server-side operations)
 * @returns Array of businesses the user has access to, with role and joined_at metadata
 */
export async function getUserBusinesses(userId: string, useAdmin = false) {
  // Dynamically import admin client only when needed (server-side)
  const client = useAdmin
    ? (await import("./supabaseAdmin")).supabaseAdminClient
    : supabaseBrowserClient;

  const { data, error } = await client
    .from("business_users")
    .select(`
      business_id,
      role,
      joined_at,
      businesses!inner (*)
    `)
    .eq("user_id", userId)
    .is("businesses.detached_at", null)
    .order("joined_at", { ascending: false });

  if (error) {
    console.error("Error fetching user businesses:", error);
    return [];
  }

  // Transform to include role and joined_at at the top level
  return data?.map(item => ({
    ...item.businesses,
    user_role: item.role,
    user_joined_at: item.joined_at
  })) || [];
}

/**
 * Get the primary (first joined) business for a user
 * This is used for UI components that show a single business
 *
 * @param userId - The user's ID
 * @param useAdmin - Whether to use admin client
 * @returns The first business the user joined, or null if none
 */
export async function getUserPrimaryBusiness(userId: string, useAdmin = false) {
  const businesses = await getUserBusinesses(userId, useAdmin);
  return businesses[0] || null;
}

/**
 * Check if a user has access to a specific business
 *
 * @param userId - The user's ID
 * @param businessId - The business ID to check
 * @param useAdmin - Whether to use admin client
 * @returns True if user has access, false otherwise
 */
export async function userHasBusinessAccess(
  userId: string,
  businessId: string,
  useAdmin = false
): Promise<boolean> {
  // Dynamically import admin client only when needed (server-side)
  const client = useAdmin
    ? (await import("./supabaseAdmin")).supabaseAdminClient
    : supabaseBrowserClient;

  const { data, error } = await client
    .from("business_users")
    .select("id")
    .eq("user_id", userId)
    .eq("business_id", businessId)
    .maybeSingle();

  return !error && !!data;
}

/**
 * Link a user to an existing business
 * Used when a user enters a company URL that already exists
 *
 * @param userId - The user's ID
 * @param businessId - The business ID to link to
 * @param role - The user's role (default: 'member')
 * @returns Success status and error message if applicable
 */
export async function linkUserToBusiness(
  userId: string,
  businessId: string,
  role: string = 'member'
): Promise<{ success: boolean; error?: string }> {
  // This function is only called server-side, so we can import admin client
  const { supabaseAdminClient } = await import("./supabaseAdmin");

  const { error } = await supabaseAdminClient
    .from("business_users")
    .insert({
      user_id: userId,
      business_id: businessId,
      role: role,
      joined_at: new Date().toISOString()
    });

  if (error) {
    console.error("Error linking user to business:", error);
    return { success: false, error: error.message };
  }

  return { success: true };
}

/**
 * Unlink a user from a business
 * Used when a user "deletes" their business connection
 *
 * @param userId - The user's ID
 * @param businessId - The business ID to unlink from
 * @returns Success status and error message if applicable
 */
export async function unlinkUserFromBusiness(
  userId: string,
  businessId: string
): Promise<{ success: boolean; error?: string }> {
  // This function is only called server-side, so we can import admin client
  const { supabaseAdminClient } = await import("./supabaseAdmin");

  const { error } = await supabaseAdminClient
    .from("business_users")
    .delete()
    .eq("user_id", userId)
    .eq("business_id", businessId);

  if (error) {
    console.error("Error unlinking user from business:", error);
    return { success: false, error: error.message };
  }

  return { success: true };
}

/**
 * Get all users connected to a business
 * Used to check if business should be soft-deleted when last user leaves
 *
 * @param businessId - The business ID
 * @returns Array of users with their roles and joined dates
 */
export async function getBusinessUsers(businessId: string) {
  // This function is only called server-side, so we can import admin client
  const { supabaseAdminClient } = await import("./supabaseAdmin");

  const { data, error } = await supabaseAdminClient
    .from("business_users")
    .select("user_id, role, joined_at")
    .eq("business_id", businessId)
    .order("joined_at", { ascending: true });

  if (error) {
    console.error("Error fetching business users:", error);
    return [];
  }

  return data || [];
}
