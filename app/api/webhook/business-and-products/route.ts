import { NextRequest, NextResponse } from "next/server";
import { supabaseAdminClient } from "@/lib/supabaseAdmin";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { url, user_id } = body;

    console.log("[Business & Products Webhook] Received request:", { url, user_id });

    // 1. Validate inputs
    if (!url || !user_id) {
      return NextResponse.json(
        { error: "URL und user_id sind erforderlich" },
        { status: 400 }
      );
    }

    // 2. Create job record with placeholder IDs
    // Use a zero UUID as placeholder since business and products don't exist yet
    const placeholderId = "00000000-0000-0000-0000-000000000000";

    const { data: jobData, error: jobError } = await supabaseAdminClient
      .from("campaign_generation_jobs")
      .insert({
        user_id: user_id,
        business_id: placeholderId, // Placeholder until business is created
        product_id: placeholderId,  // Placeholder
        job_type: "onboarding",
        status: "processing",
        request_data: { url },
      })
      .select()
      .single();

    if (jobError || !jobData) {
      console.error("[Business & Products Webhook] Failed to create job:", jobError);
      return NextResponse.json(
        { error: "Fehler beim Erstellen des Jobs" },
        { status: 500 }
      );
    }

    const jobId = jobData.id;
    console.log("[Business & Products Webhook] Created job:", jobId);

    // 4. Trigger n8n webhook (fire-and-forget)
    const webhookUrl = process.env.N8N_WEBHOOK_URL_BUSINESS_AND_PRODUCTS;

    if (!webhookUrl) {
      console.error("[Business & Products Webhook] Webhook URL not configured");
      // Update job to failed since we can't process it
      await supabaseAdminClient
        .from("campaign_generation_jobs")
        .update({
          status: "failed",
          error_message: "Webhook nicht konfiguriert",
          updated_at: new Date().toISOString(),
        })
        .eq("id", jobId);

      return NextResponse.json(
        { error: "Webhook-Konfiguration fehlt" },
        { status: 500 }
      );
    }

    // Fire webhook asynchronously (don't wait for response)
    fetch(webhookUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        url,
        user_id,
        job_id: jobId,
      }),
    }).catch((err) => {
      console.error("[Business & Products Webhook] Webhook trigger failed:", err);
      // Update job status to failed
      supabaseAdminClient
        .from("campaign_generation_jobs")
        .update({
          status: "failed",
          error_message: `Webhook-Fehler: ${err.message}`,
          updated_at: new Date().toISOString(),
        })
        .eq("id", jobId);
    });

    console.log("[Business & Products Webhook] Triggered n8n webhook for job:", jobId);

    // 5. Return jobId immediately for polling
    return NextResponse.json({
      success: true,
      jobId: jobId,
    });

  } catch (error: any) {
    console.error("[Business & Products Webhook] Unexpected error:", error);
    return NextResponse.json(
      { error: "Ein Fehler ist aufgetreten", details: error.message },
      { status: 500 }
    );
  }
}
