import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { url, user_id, business_id, job_id } = body;

    console.log("[Trigger Angebote Webhook] Received request:", { url, user_id, business_id, job_id });

    // Validate inputs
    if (!url || !user_id || !business_id) {
      return NextResponse.json(
        { error: "URL, user_id, and business_id are required" },
        { status: 400 }
      );
    }

    // Get N8N webhook URL from environment
    const angeboteWebhook = process.env.N8N_WEBHOOK_URL_PRODUCT_DATA;

    if (!angeboteWebhook) {
      console.error("[Trigger Angebote Webhook] N8N_WEBHOOK_URL_PRODUCT_DATA not configured");
      return NextResponse.json(
        { error: "Angebote webhook not configured" },
        { status: 500 }
      );
    }

    // Trigger the N8N Angebote webhook
    console.log("[Trigger Angebote Webhook] Calling N8N webhook:", {
      webhook: angeboteWebhook,
      payload: { url, user_id, business_id, job_id }
    });

    const response = await fetch(angeboteWebhook, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        url,
        user_id,
        business_id,
        job_id,
      }),
    });

    const responseText = await response.text();
    console.log("[Trigger Angebote Webhook] N8N response status:", response.status);
    console.log("[Trigger Angebote Webhook] N8N response:", responseText);

    if (!response.ok) {
      console.error("[Trigger Angebote Webhook] N8N webhook failed:", {
        status: response.status,
        statusText: response.statusText,
        response: responseText,
      });
      return NextResponse.json(
        {
          error: "Failed to trigger Angebote webhook",
          details: responseText,
          status: response.status,
        },
        { status: 500 }
      );
    }

    console.log("[Trigger Angebote Webhook] Successfully triggered N8N webhook");

    return NextResponse.json({
      success: true,
      message: "Angebote webhook triggered successfully",
    });

  } catch (error: any) {
    console.error("[Trigger Angebote Webhook] Unexpected error:", error);
    return NextResponse.json(
      { error: "Ein Fehler ist aufgetreten", details: error.message },
      { status: 500 }
    );
  }
}
