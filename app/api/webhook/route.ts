import { NextRequest, NextResponse } from "next/server";

// Webhook URL mapping for different products
const WEBHOOK_URLS: Record<number, string | undefined> = {
  0: process.env.N8N_WEBHOOK_URL_MARKETINGBILDER_PROMPT_ONLY, // Will be selected based on payload
  1: process.env.N8N_WEBHOOK_URL_WEEKLY_SOCIAL_MEDIA_PACKAGE,
  2: process.env.N8N_WEBHOOK_URL_PRODUCT_VIDEO,
};

// Special webhooks for Marketingbilder/Bilder
const BILDER_WITH_IMAGES_WEBHOOK = process.env.N8N_WEBHOOK_URL_MARKETINGBILDER_WITH_IMAGES;
const BILDER_EDIT_IMAGE_WEBHOOK = process.env.N8N_WEBHOOK_URL_MARKETINGBILDER_EDIT_IMAGE;

export async function POST(request: NextRequest) {
  try {
    const payload = await request.json();
    console.log("Webhook route received payload:", JSON.stringify(payload, null, 2));

    const { productId, ...webhookPayload } = payload;

    // Get the appropriate webhook URL for the product
    let webhookUrl = WEBHOOK_URLS[productId];

    // For Bilder (productId 0), choose webhook based on the operation type
    if (productId === 0) {
      console.log("🔍 Bilder webhook selection - isEditing:", webhookPayload.isEditing, "hasReferenceImages:", webhookPayload.hasReferenceImages);

      if (webhookPayload.isEditing) {
        // Use edit webhook for refinements/edits
        console.log("✅ Selected EDIT webhook (isEditing=true)");
        webhookUrl = BILDER_EDIT_IMAGE_WEBHOOK;
      } else if (webhookPayload.hasReferenceImages) {
        // Use with images webhook for initial creation with reference images
        console.log("✅ Selected WITH_IMAGES webhook (hasReferenceImages=true)");
        webhookUrl = BILDER_WITH_IMAGES_WEBHOOK;
      } else {
        console.log("✅ Selected PROMPT_ONLY webhook (default)");
      }

      console.log("🎯 Final webhook URL:", webhookUrl?.substring(0, 50) + "...");
    }

    console.log("Sending to n8n:", { webhookUrl: webhookUrl?.substring(0, 50) + "...", productId, isEditing: webhookPayload.isEditing, hasReferenceImages: webhookPayload.hasReferenceImages });

    if (!webhookUrl) {
      return NextResponse.json(
        { error: `Webhook URL not configured for product ${productId}` },
        { status: 500 }
      );
    }

    // For Product Video (productId 2) and Bilder (productId 0), send as GET with query params
    // For other products, send as POST with JSON body
    let response;
    if (productId === 2 || productId === 0) {
      // Build query string from payload
      const queryParams = new URLSearchParams();
      Object.entries(webhookPayload).forEach(([key, value]) => {
        if (Array.isArray(value)) {
          // For arrays (like imageUrls), send as JSON string
          queryParams.append(key, JSON.stringify(value));
        } else {
          queryParams.append(key, String(value));
        }
      });

      const urlWithParams = `${webhookUrl}?${queryParams.toString()}`;
      const urlLength = urlWithParams.length;

      console.log("=== WEBHOOK REQUEST DEBUG ===");
      console.log("Method: GET");
      console.log("URL:", urlWithParams);
      console.log("URL Length:", urlLength);

      if (urlLength > 2000) {
        console.warn("⚠️  WARNING: URL length exceeds 2000 characters. This may cause issues with some servers.");
      }

      console.log("Query Parameters:");
      queryParams.forEach((value, key) => {
        console.log(`  ${key}:`, value.length > 100 ? `${value.substring(0, 100)}... (${value.length} chars)` : value);
      });

      response = await fetch(urlWithParams, {
        method: "GET",
        signal: AbortSignal.timeout(240000), // 4 minute timeout
      });
    } else {
      // POST request with JSON body (existing behavior)
      console.log("=== WEBHOOK REQUEST DEBUG ===");
      console.log("Method: POST");
      console.log("URL:", webhookUrl);
      console.log("Payload:", JSON.stringify(webhookPayload, null, 2));

      response = await fetch(webhookUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(webhookPayload),
      });
    }

    console.log("Response Status:", response.status, response.statusText);

    if (!response.ok) {
      let errorDetails = `${response.status} ${response.statusText}`;
      try {
        const errorBody = await response.text();
        console.error("Error Response Body:", errorBody);
        errorDetails += errorBody ? ` - ${errorBody}` : '';
      } catch (e) {
        console.error("Could not read error response body");
      }
      throw new Error(`Webhook request failed: ${errorDetails}`);
    }

    // Parse the response from n8n to get the image URL
    const responseData = await response.json();
    console.log("Webhook response:", responseData);

    // Extract image URL from response (handle both array and object formats)
    let imageUrl = null;
    if (Array.isArray(responseData) && responseData.length > 0) {
      imageUrl = responseData[0].imageUrl || responseData[0].image_url || null;
    } else if (responseData) {
      imageUrl = responseData.imageUrl || responseData.image_url || null;
    }

    // Clean up the URL (remove any trailing newlines or whitespace)
    if (imageUrl) {
      imageUrl = imageUrl.trim();
    }

    return NextResponse.json({
      success: true,
      imageUrl
    });
  } catch (error: any) {
    console.error("Webhook error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to send webhook" },
      { status: 500 }
    );
  }
}

