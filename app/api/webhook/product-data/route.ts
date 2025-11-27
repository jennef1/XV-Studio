import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { user_id, business_id, product_url } = body;

    // Validate required fields
    if (!user_id || !business_id || !product_url) {
      return NextResponse.json(
        {
          error: "Fehlende Daten: user_id, business_id und product_url sind erforderlich"
        },
        { status: 400 }
      );
    }

    // Validate URL format
    try {
      new URL(product_url);
    } catch (e) {
      return NextResponse.json(
        { error: "Ungültige URL. Bitte gib eine vollständige URL ein (z.B. https://example.com)" },
        { status: 400 }
      );
    }

    // Get webhook URL from environment
    const webhookUrl = process.env.N8N_WEBHOOK_URL_PRODUCT_DATA;

    if (!webhookUrl) {
      console.error("N8N_WEBHOOK_URL_PRODUCT_DATA is not configured");
      return NextResponse.json(
        { error: "Webhook-Konfiguration fehlt" },
        { status: 500 }
      );
    }

    console.log("Sending product URL to n8n for analysis:", product_url);

    // Create an AbortController with timeout
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 120000); // 120 second timeout

    try {
      // Forward request to n8n webhook as GET with query parameters
      const url = new URL(webhookUrl);
      url.searchParams.append('user_id', user_id);
      url.searchParams.append('business_id', business_id);
      url.searchParams.append('product_url', product_url);

      const response = await fetch(url.toString(), {
        method: "GET",
        signal: controller.signal,
      });

      clearTimeout(timeout);

      if (!response.ok) {
        const errorText = await response.text();
        console.error("n8n webhook error:", response.status, errorText);
        return NextResponse.json(
          { error: "Fehler bei der Produkt-Analyse. Bitte versuche es erneut." },
          { status: response.status }
        );
      }

      const result = await response.json();
      console.log("Product analysis completed successfully");

      return NextResponse.json({
        success: true,
        message: "Produkt-Analyse erfolgreich gestartet",
        data: result,
      });

    } catch (fetchError: any) {
      clearTimeout(timeout);

      if (fetchError.name === "AbortError") {
        console.error("Product analysis request timed out");
        return NextResponse.json(
          { error: "Die Anfrage hat zu lange gedauert. Bitte versuche es mit einer anderen URL." },
          { status: 504 }
        );
      }

      throw fetchError;
    }

  } catch (error: any) {
    console.error("Error in product-data webhook:", error);
    return NextResponse.json(
      {
        error: "Ein unerwarteter Fehler ist aufgetreten",
        details: error.message,
      },
      { status: 500 }
    );
  }
}
