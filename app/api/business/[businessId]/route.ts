import { NextRequest, NextResponse } from "next/server";
import { supabaseAdminClient } from "@/lib/supabaseAdmin";

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

    // Get the user from the request
    const authHeader = request.headers.get("authorization");
    if (!authHeader) {
      return NextResponse.json(
        { error: "Nicht autorisiert" },
        { status: 401 }
      );
    }

    // Verify the user owns this business
    const { data: business, error: fetchError } = await supabaseAdminClient
      .from("businesses")
      .select("user_id")
      .eq("id", businessId)
      .single();

    if (fetchError || !business) {
      return NextResponse.json(
        { error: "Firmenprofil nicht gefunden" },
        { status: 404 }
      );
    }

    // Detach the business (soft delete) instead of hard deleting
    const { error: detachError } = await supabaseAdminClient
      .from("businesses")
      .update({
        detached_at: new Date().toISOString(),
      })
      .eq("id", businessId);

    if (detachError) {
      console.error("Error detaching business:", detachError);
      return NextResponse.json(
        { error: "Fehler beim Löschen des Firmenprofils" },
        { status: 500 }
      );
    }

    console.log(`Business ${businessId} detached successfully`);

    return NextResponse.json({
      success: true,
      message: "Firmenprofil erfolgreich gelöscht",
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
