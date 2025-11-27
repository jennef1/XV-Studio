import { NextRequest, NextResponse } from "next/server";

const WEBHOOK_URL = process.env.N8N_WEBHOOK_URL_BUSINESS_WEBSITE_DNA || process.env.NEXT_PUBLIC_N8N_WEBHOOK_URL_BUSINESS_WEBSITE_DNA;

export async function POST(request: NextRequest) {
  try {
    if (!WEBHOOK_URL) {
      console.error("Webhook URL is not configured");
      return NextResponse.json(
        { error: "Webhook URL is not configured" },
        { status: 500 }
      );
    }

    const body = await request.json();
    const { url, user_id } = body;

    if (!url || !user_id) {
      console.error("Missing required fields:", { url, user_id });
      return NextResponse.json(
        { error: "Missing required fields: url and user_id" },
        { status: 400 }
      );
    }

    console.log("Sending to n8n webhook:", WEBHOOK_URL);
    console.log("Payload:", { url, user_id });

    // Create an AbortController with a 120-second timeout
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 120000);

    try {
      // Forward the request to the n8n webhook
      const response = await fetch(WEBHOOK_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          url,
          user_id,
        }),
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      const responseData = await response.text();
      console.log("n8n webhook response status:", response.status);
      console.log("n8n webhook response data:", responseData);

      if (!response.ok) {
        console.error("Webhook request failed:", {
          status: response.status,
          statusText: response.statusText,
          data: responseData,
        });
        return NextResponse.json(
          {
            error: "Die eingegebene URL konnte nicht analysiert werden. Bitte stelle sicher, dass die Website erreichbar ist.",
            details: responseData,
            status: response.status,
            statusText: response.statusText,
          },
          { status: response.status }
        );
      }

      return NextResponse.json({
        success: true,
        data: responseData,
      });
    } catch (fetchError: any) {
      clearTimeout(timeoutId);

      // Handle timeout specifically
      if (fetchError.name === "AbortError") {
        console.error("Webhook request timed out after 120 seconds");
        return NextResponse.json(
          {
            error: "Die Analyse der Website dauert zu lange. Bitte stelle sicher, dass die Website erreichbar ist und versuche es erneut.",
            details: "Request timeout after 120 seconds"
          },
          { status: 504 }
        );
      }

      throw fetchError;
    }
  } catch (error) {
    console.error("Error in webhook API route:", error);
    return NextResponse.json(
      { error: "Ein Fehler ist aufgetreten. Bitte versuche es erneut.", details: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 }
    );
  }
}




