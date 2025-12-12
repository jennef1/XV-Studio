import { NextRequest, NextResponse } from "next/server";
import { supabaseAdminClient } from "@/lib/supabaseAdmin";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { url, user_id, business_id } = body;

    console.log("[Product Data Manual Webhook] Received request:", { url, user_id, business_id });

    // Validate inputs
    if (!url || !user_id || !business_id) {
      return NextResponse.json(
        { error: "URL, user_id, and business_id are required" },
        { status: 400 }
      );
    }

    // Get the N8N webhook URL from environment
    const n8nWebhook = process.env.N8N_WEBHOOK_URL_PRODUCT_DATA_MANUALLY;

    if (!n8nWebhook) {
      console.error("[Product Data Manual Webhook] N8N webhook not configured");
      return NextResponse.json(
        { error: "Webhook-Konfiguration fehlt" },
        { status: 500 }
      );
    }

    console.log("[Product Data Manual Webhook] Creating job record");

    // Create a job record in the database using admin client
    const { data: jobData, error: jobError } = await supabaseAdminClient
      .from("campaign_generation_jobs")
      .insert({
        user_id: user_id,
        business_id: business_id,
        product_id: business_id, // Use business_id as placeholder since product doesn't exist yet
        job_type: "onboarding",
        status: "processing",
        request_data: { url, manual: true },
      })
      .select()
      .single();

    if (jobError || !jobData) {
      console.error("[Product Data Manual Webhook] Failed to create job:", jobError);
      return NextResponse.json(
        { error: "Failed to create job", details: jobError?.message },
        { status: 500 }
      );
    }

    const jobId = jobData.id;
    console.log("[Product Data Manual Webhook] ✅ Created job:", jobId);
    console.log("[Product Data Manual Webhook] Calling N8N webhook (POST):", n8nWebhook);

    // Trigger N8N webhook asynchronously (don't wait for response)
    fetch(n8nWebhook, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        url,
        user_id,
        business_id,
        job_id: jobId,
      }),
    }).catch((error) => {
      console.error("[Product Data Manual Webhook] Error triggering n8n:", error);
      // Update job status to failed
      supabaseAdminClient
        .from("campaign_generation_jobs")
        .update({
          status: "failed",
          error_message: error.message,
          updated_at: new Date().toISOString(),
        })
        .eq("id", jobId)
        .then(() => console.log("[Product Data Manual Webhook] Job marked as failed"));
    });

    // Return immediately with job ID
    return NextResponse.json({
      success: true,
      jobId,
      status: "processing",
      message: "Product data analysis started",
    });

  } catch (error: any) {
    console.error("[Product Data Manual Webhook] Unexpected error:", error);
    return NextResponse.json(
      { error: "Ein Fehler ist aufgetreten", details: error.message },
      { status: 500 }
    );
  }
}
