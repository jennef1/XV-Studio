import { supabaseBrowserClient } from "./supabaseClient";
import { getUserPrimaryBusiness } from "./businessAccess";

/**
 * Get the first business associated with a user
 * Now uses junction table for multi-user support
 */
export async function getUserBusiness(userId: string) {
  return getUserPrimaryBusiness(userId, false);
}

/**
 * Get product with its video ideas from business_products table
 */
export async function getProductVideoIdeas(productId: string) {
  try {
    const { data, error } = await supabaseBrowserClient
      .from("business_products")
      .select("*")
      .eq("id", productId)
      .single();

    if (error) {
      console.error("Error fetching product video ideas:", error);
      return null;
    }

    return data;
  } catch (error) {
    console.error("Error in getProductVideoIdeas:", error);
    return null;
  }
}

/**
 * Get the latest product for a business (for retrieving just-created product)
 */
export async function getLatestBusinessProduct(businessId: string) {
  try {
    const { data, error } = await supabaseBrowserClient
      .from("business_products")
      .select("*")
      .eq("business_id", businessId)
      .order("created_at", { ascending: false })
      .limit(1)
      .single();

    if (error) {
      console.error("Error fetching latest business product:", error);
      return null;
    }

    return data;
  } catch (error) {
    console.error("Error in getLatestBusinessProduct:", error);
    return null;
  }
}

/**
 * Get product images from a product
 */
export async function getProductImages(productId: string) {
  try {
    const { data, error } = await supabaseBrowserClient
      .from("business_products")
      .select("product_images")
      .eq("id", productId)
      .single();

    if (error) {
      console.error("Error fetching product images:", error);
      return [];
    }

    // product_images is stored as JSONB, could be array or object
    const images = data?.product_images;
    if (Array.isArray(images)) {
      return images;
    } else if (images && typeof images === 'object') {
      // If it's an object with image URLs, extract the values
      return Object.values(images).filter(val => typeof val === 'string');
    }
    return [];
  } catch (error) {
    console.error("Error in getProductImages:", error);
    return [];
  }
}

/**
 * Get all business products for a user that have video concepts
 * Updated to work with junction table for multi-user support
 */
export async function getUserBusinessProducts(userId: string) {
  try {
    const { getUserBusinesses } = await import("./businessAccess");
    const businesses = await getUserBusinesses(userId, false);
    const businessIds = businesses.map(b => b.id);

    if (businessIds.length === 0) {
      return [];
    }

    const { data, error } = await supabaseBrowserClient
      .from("business_products")
      .select("*")
      .in("business_id", businessIds)
      .not("video_concept_1", "is", null)
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Error fetching user business products:", error);
      return [];
    }

    return data || [];
  } catch (error) {
    console.error("Error in getUserBusinessProducts:", error);
    return [];
  }
}

/**
 * Get all business products for a user (including those without video concepts)
 * Updated to work with junction table for multi-user support
 */
export async function getAllUserBusinessProducts(userId: string) {
  try {
    const { getUserBusinesses } = await import("./businessAccess");
    const businesses = await getUserBusinesses(userId, false);
    const businessIds = businesses.map(b => b.id);

    if (businessIds.length === 0) {
      return [];
    }

    const { data, error } = await supabaseBrowserClient
      .from("business_products")
      .select("*")
      .in("business_id", businessIds)
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Error fetching all user business products:", error);
      return [];
    }

    return data || [];
  } catch (error) {
    console.error("Error in getAllUserBusinessProducts:", error);
    return [];
  }
}
