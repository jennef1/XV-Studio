import { NextRequest, NextResponse } from "next/server";
import { supabaseAdminClient } from "@/lib/supabaseAdmin";
import { supabaseBrowserClient } from "@/lib/supabaseClient";

export async function POST(request: NextRequest) {
  try {
    // Get current user from session
    const { data: { user }, error: authError } = await supabaseBrowserClient.auth.getUser();

    if (authError || !user) {
      return NextResponse.json(
        { success: false, error: "Nicht authentifiziert" },
        { status: 401 }
      );
    }

    // Parse request body
    const body = await request.json();
    const { full_name, avatar_url } = body;

    // Validate name
    if (!full_name || typeof full_name !== "string") {
      return NextResponse.json(
        { success: false, error: "Name ist erforderlich" },
        { status: 400 }
      );
    }

    if (full_name.trim().length < 2) {
      return NextResponse.json(
        { success: false, error: "Der Name muss mindestens 2 Zeichen lang sein" },
        { status: 400 }
      );
    }

    if (full_name.trim().length > 50) {
      return NextResponse.json(
        { success: false, error: "Der Name darf maximal 50 Zeichen lang sein" },
        { status: 400 }
      );
    }

    // Prepare updated metadata
    const updatedMetadata: Record<string, any> = {
      ...user.user_metadata,
      full_name: full_name.trim(),
    };

    // Update avatar URL if provided
    if (avatar_url !== undefined) {
      updatedMetadata.avatar_url = avatar_url;
    }

    // Update user metadata using admin client
    const { data: updatedUser, error: updateError } = await supabaseAdminClient.auth.admin.updateUserById(
      user.id,
      {
        user_metadata: updatedMetadata,
      }
    );

    if (updateError) {
      console.error("User update error:", updateError);
      return NextResponse.json(
        { success: false, error: "Fehler beim Aktualisieren des Profils" },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      user: updatedUser.user,
    });
  } catch (error) {
    console.error("Profile update error:", error);
    return NextResponse.json(
      { success: false, error: "Ein unerwarteter Fehler ist aufgetreten" },
      { status: 500 }
    );
  }
}
