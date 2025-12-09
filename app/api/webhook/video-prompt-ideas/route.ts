import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      selectedImage,
      productDescription,
      category,
      benefits,
    } = body;

    // Validate required fields
    if (!selectedImage || typeof selectedImage !== 'string') {
      return NextResponse.json(
        { error: "selectedImage ist erforderlich" },
        { status: 400 }
      );
    }

    if (!productDescription || typeof productDescription !== 'string') {
      return NextResponse.json(
        { error: "productDescription ist erforderlich" },
        { status: 400 }
      );
    }

    // Get webhook URL from environment
    const webhookUrl = process.env.N8N_WEBHOOK_VIDEO_PROMPT_IDEAS;

    if (!webhookUrl) {
      console.error("N8N_WEBHOOK_VIDEO_PROMPT_IDEAS is not configured");
      return NextResponse.json(
        { error: "Webhook-Konfiguration fehlt" },
        { status: 500 }
      );
    }

    console.log("Requesting video prompt ideas");
    console.log("- Product Category:", category);
    console.log("- Description length:", productDescription.length);

    // Prepare data for n8n webhook
    const payload = {
      selectedImage,
      productDescription,
      category: category || null,
      benefits: benefits || [],
    };

    console.log("=== VIDEO PROMPT IDEAS WEBHOOK REQUEST DEBUG ===");
    console.log("Method: POST");
    console.log("URL:", webhookUrl);

    // Call n8n webhook SYNCHRONOUSLY (wait for response)
    const response = await fetch(webhookUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      console.error("n8n webhook returned error status:", response.status);
      const errorText = await response.text();
      console.error("Error response:", errorText);
      return NextResponse.json(
        { error: "Fehler beim Abrufen der Prompt-Ideen" },
        { status: 500 }
      );
    }

    const result = await response.json();
    console.log("Received prompt ideas from n8n");

    // Validate response format
    if (!result.ideas || !Array.isArray(result.ideas)) {
      console.error("Invalid response format from n8n:", result);
      return NextResponse.json(
        { error: "Ungültiges Antwortformat vom Webhook" },
        { status: 500 }
      );
    }

    // Return ideas directly
    return NextResponse.json({
      success: true,
      ideas: result.ideas,
    });

  } catch (error: any) {
    console.error("Error in video-prompt-ideas webhook:", error);
    return NextResponse.json(
      {
        error: "Ein unerwarteter Fehler ist aufgetreten",
        details: error.message,
      },
      { status: 500 }
    );
  }
}
