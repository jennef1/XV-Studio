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

    // Parse form data
    const formData = await request.formData();
    const file = formData.get("file") as File;

    if (!file) {
      return NextResponse.json(
        { success: false, error: "Keine Datei hochgeladen" },
        { status: 400 }
      );
    }

    // Validate file type
    const validTypes = ["image/jpeg", "image/png", "image/webp"];
    if (!validTypes.includes(file.type)) {
      return NextResponse.json(
        { success: false, error: "Bitte laden Sie nur JPG, PNG oder WEBP Dateien hoch" },
        { status: 400 }
      );
    }

    // Validate file size (5MB)
    if (file.size > 5 * 1024 * 1024) {
      return NextResponse.json(
        { success: false, error: "Die Datei darf maximal 5MB groß sein" },
        { status: 400 }
      );
    }

    // Generate file path
    const fileExtension = file.name.split(".").pop() || "jpg";
    const timestamp = Date.now();
    const filePath = `${user.id}/avatar-${timestamp}.${fileExtension}`;

    // Convert file to buffer
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // Upload to Supabase Storage
    const { data: uploadData, error: uploadError } = await supabaseAdminClient.storage
      .from("avatars")
      .upload(filePath, buffer, {
        contentType: file.type,
        upsert: true,
      });

    if (uploadError) {
      console.error("Upload error:", uploadError);
      return NextResponse.json(
        { success: false, error: "Fehler beim Hochladen der Datei" },
        { status: 500 }
      );
    }

    // Get public URL
    const { data: { publicUrl } } = supabaseAdminClient.storage
      .from("avatars")
      .getPublicUrl(filePath);

    // Update user metadata
    const { error: updateError } = await supabaseAdminClient.auth.admin.updateUserById(
      user.id,
      {
        user_metadata: {
          ...user.user_metadata,
          avatar_url: publicUrl,
        },
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
      url: publicUrl,
    });
  } catch (error) {
    console.error("Avatar upload error:", error);
    return NextResponse.json(
      { success: false, error: "Ein unerwarteter Fehler ist aufgetreten" },
      { status: 500 }
    );
  }
}
