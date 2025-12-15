import { NextRequest, NextResponse } from "next/server";
import { supabaseAdminClient } from "@/lib/supabaseAdmin";
import { getBusinessUsers } from "@/lib/businessAccess";

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ businessId: string }> }
) {
  try {
    const { businessId } = await params;

    if (!businessId) {
      return NextResponse.json(
        { error: "Business ID ist erforderlich" },
        { status: 400 }
      );
    }

    // Get the user ID from auth header
    // Note: In production, you should extract and verify the user ID from the JWT token
    const authHeader = request.headers.get("authorization");
    if (!authHeader) {
      return NextResponse.json(
        { error: "Nicht autorisiert" },
        { status: 401 }
      );
    }

    // TODO: Extract user ID from JWT token properly
    // For now, we'll need to get it from the request body or session
    const body = await request.json();
    const userId = body.user_id;

    if (!userId) {
      return NextResponse.json(
        { error: "User ID erforderlich" },
        { status: 400 }
      );
    }

    // Verify the user has access to this business
    const { data: userBusinessLink, error: accessError } = await supabaseAdminClient
      .from("business_users")
      .select("role")
      .eq("business_id", businessId)
      .eq("user_id", userId)
      .maybeSingle();

    if (accessError || !userBusinessLink) {
      return NextResponse.json(
        { error: "Firmenprofil nicht gefunden oder keine Berechtigung" },
        { status: 404 }
      );
    }

    // Unlink user from business (not deleting the whole business)
    const { error: unlinkError } = await supabaseAdminClient
      .from("business_users")
      .delete()
      .eq("business_id", businessId)
      .eq("user_id", userId);

    if (unlinkError) {
      console.error("Error unlinking user from business:", unlinkError);
      return NextResponse.json(
        { error: "Fehler beim Trennen vom Firmenprofil" },
        { status: 500 }
      );
    }

    console.log(`User ${userId} unlinked from business ${businessId}`);

    // Check if this was the last user - if so, soft delete the business
    const remainingUsers = await getBusinessUsers(businessId);

    if (remainingUsers.length === 0) {
      console.log(`Last user removed from business ${businessId}, soft deleting`);

      await supabaseAdminClient
        .from("businesses")
        .update({ detached_at: new Date().toISOString() })
        .eq("id", businessId);

      console.log(`Business ${businessId} soft deleted`);
    }

    return NextResponse.json({
      success: true,
      message: "Vom Firmenprofil getrennt",
    });
  } catch (error) {
    console.error("Error in delete business API route:", error);
    return NextResponse.json(
      {
        error: "Ein unerwarteter Fehler ist aufgetreten",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
