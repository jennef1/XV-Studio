import { NextRequest, NextResponse } from "next/server";
import { supabaseAdminClient } from "@/lib/supabaseAdmin";

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
const ALLOWED_TYPES = ["image/jpeg", "image/jpg", "image/png", "image/gif", "image/webp"];

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { imageUrl, folder = "product-images" } = body;

    if (!imageUrl) {
      return NextResponse.json(
        { error: "No image URL provided" },
        { status: 400 }
      );
    }

    // Validate URL format
    let url: URL;
    try {
      url = new URL(imageUrl);
    } catch {
      return NextResponse.json(
        { error: "Invalid image URL" },
        { status: 400 }
      );
    }

    // Download the image
    const imageResponse = await fetch(imageUrl, {
      headers: {
        "User-Agent": "Mozilla/5.0 (compatible; XVStudio/1.0)",
      },
    });

    if (!imageResponse.ok) {
      throw new Error(`Failed to download image: ${imageResponse.statusText}`);
    }

    const contentType = imageResponse.headers.get("content-type");
    if (!contentType || !ALLOWED_TYPES.includes(contentType)) {
      return NextResponse.json(
        { error: `Invalid image type: ${contentType}. Allowed types: ${ALLOWED_TYPES.join(", ")}` },
        { status: 400 }
      );
    }

    const arrayBuffer = await imageResponse.arrayBuffer();
    if (arrayBuffer.byteLength > MAX_FILE_SIZE) {
      return NextResponse.json(
        { error: `File too large. Maximum size: ${MAX_FILE_SIZE / 1024 / 1024}MB` },
        { status: 400 }
      );
    }

    // Generate filename
    const extension = contentType.split("/")[1];
    const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${extension}`;
    const filePath = `${folder}/${fileName}`;

    // Upload to Supabase
    const { error: uploadError } = await supabaseAdminClient.storage
      .from("business-images")
      .upload(filePath, Buffer.from(arrayBuffer), {
        contentType,
        upsert: false,
      });

    if (uploadError) {
      console.error("Supabase upload error:", uploadError);
      throw uploadError;
    }

    // Get public URL
    const { data: urlData } = supabaseAdminClient.storage
      .from("business-images")
      .getPublicUrl(filePath);

    return NextResponse.json({
      success: true,
      url: urlData.publicUrl,
      path: filePath,
    });
  } catch (error) {
    console.error("Error uploading from URL:", error);
    return NextResponse.json(
      {
        error: "Failed to upload image",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
