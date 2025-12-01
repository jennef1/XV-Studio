import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  try {
    // Extract query parameters
    const searchParams = request.nextUrl.searchParams;
    const user_id = searchParams.get('user_id');
    const business_id = searchParams.get('business_id');
    const product_id = searchParams.get('product_id') || null;
    const prompt = searchParams.get('prompt');
    const imagesParam = searchParams.get('images');

    // Parse images array
    let images: string[] = [];
    if (imagesParam) {
      try {
        images = JSON.parse(imagesParam);
      } catch (e) {
        return NextResponse.json(
          { error: "Ungültiges images-Format" },
          { status: 400 }
        );
      }
    }

    // Validate required fields
    if (!user_id || !business_id || !prompt) {
      return NextResponse.json(
        {
          error: "Fehlende Daten: user_id, business_id und prompt sind erforderlich"
        },
        { status: 400 }
      );
    }

    // Validate images array
    if (!images || !Array.isArray(images) || images.length === 0) {
      return NextResponse.json(
        { error: "Mindestens ein Bild ist erforderlich" },
        { status: 400 }
      );
    }

    if (images.length > 5) {
      return NextResponse.json(
        { error: "Maximal 5 Bilder erlaubt" },
        { status: 400 }
      );
    }

    // Get webhook URL from environment
    const webhookUrl = process.env.N8N_WEBHOOK_IMAGES_TO_VIDEO_GENERATION;

    if (!webhookUrl) {
      console.error("N8N_WEBHOOK_IMAGES_TO_VIDEO_GENERATION is not configured");
      return NextResponse.json(
        { error: "Webhook-Konfiguration fehlt" },
        { status: 500 }
      );
    }

    console.log("Sending video generation request to n8n");
    console.log("- Product ID:", product_id || "manual");
    console.log("- Images count:", images.length);
    console.log("- Prompt length:", prompt?.length || 0);

    // Build query parameters for n8n webhook (GET request)
    const n8nParams = new URLSearchParams({
      user_id: user_id || '',
      business_id: business_id || '',
      product_id: product_id || '',
      prompt: prompt || '',
      images: JSON.stringify(images),
    });

    const n8nUrl = `${webhookUrl}?${n8nParams.toString()}`;

    // Create an AbortController with timeout (video generation takes longer)
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 480000); // 480 second (8 minute) timeout

    try {
      // Forward request to n8n webhook as GET
      const response = await fetch(n8nUrl, {
        method: "GET",
        signal: controller.signal,
      });

      clearTimeout(timeout);

      if (!response.ok) {
        const errorText = await response.text();
        console.error("n8n video generation webhook error:", response.status, errorText);
        return NextResponse.json(
          { error: "Fehler bei der Video-Erstellung. Bitte versuche es erneut." },
          { status: response.status }
        );
      }

      const result = await response.json();
      console.log("Video generation completed successfully");
      console.log("n8n response:", JSON.stringify(result, null, 2));

      // Extract video URL from response
      let videoUrl = null;
      if (Array.isArray(result)) {
        console.log("Response is an array, checking first element...");
        videoUrl = result[0]?.videoUrl || result[0]?.video_url || result[0]?.url || null;
      } else {
        console.log("Response is an object, checking for video URL fields...");
        videoUrl = result.videoUrl || result.video_url || result.url || null;
      }

      if (!videoUrl) {
        console.error("No video URL found in response!");
        console.error("Full response structure:", JSON.stringify(result, null, 2));
        console.error("Available keys:", Object.keys(result));
        return NextResponse.json(
          { error: "Keine Video-URL in der Antwort erhalten" },
          { status: 500 }
        );
      }

      console.log("Successfully extracted video URL:", videoUrl);

      return NextResponse.json({
        success: true,
        videoUrl,
        message: "Video erfolgreich erstellt",
      });

    } catch (fetchError: any) {
      clearTimeout(timeout);

      if (fetchError.name === "AbortError") {
        console.error("Video generation request timed out after 8 minutes");
        return NextResponse.json(
          { error: "Die Video-Erstellung hat zu lange gedauert (über 8 Minuten). Bitte versuche es erneut." },
          { status: 504 }
        );
      }

      throw fetchError;
    }

  } catch (error: any) {
    console.error("Error in video-generation webhook:", error);
    return NextResponse.json(
      {
        error: "Ein unerwarteter Fehler ist aufgetreten",
        details: error.message,
      },
      { status: 500 }
    );
  }
}
