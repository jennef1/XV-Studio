import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { user_id, business_id, product_id, prompt, images } = body;

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

    if (images.length > 3) {
      return NextResponse.json(
        { error: "Maximal 3 Bilder erlaubt" },
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
    console.log("- Prompt length:", prompt.length);

    // Create an AbortController with timeout (video generation takes longer)
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 240000); // 240 second (4 minute) timeout

    try {
      // Forward request to n8n webhook
      const response = await fetch(webhookUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          user_id,
          business_id,
          product_id,
          prompt,
          images,
        }),
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

      // Extract video URL from response
      let videoUrl = null;
      if (Array.isArray(result)) {
        videoUrl = result[0]?.videoUrl || result[0]?.video_url || result[0]?.url || null;
      } else {
        videoUrl = result.videoUrl || result.video_url || result.url || null;
      }

      if (!videoUrl) {
        console.error("No video URL in response:", result);
        return NextResponse.json(
          { error: "Keine Video-URL in der Antwort erhalten" },
          { status: 500 }
        );
      }

      return NextResponse.json({
        success: true,
        videoUrl,
        message: "Video erfolgreich erstellt",
      });

    } catch (fetchError: any) {
      clearTimeout(timeout);

      if (fetchError.name === "AbortError") {
        console.error("Video generation request timed out");
        return NextResponse.json(
          { error: "Die Video-Erstellung hat zu lange gedauert. Bitte versuche es erneut." },
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
