import { NextRequest, NextResponse } from "next/server";
import { supabaseAdminClient } from "@/lib/supabaseAdmin";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      userId,
      businessId,
      productId,
      selectedImage,
      prompt,
    } = body;

    // Validate required fields
    if (!userId || !businessId || !productId) {
      return NextResponse.json(
        {
          error: "Fehlende Daten: userId, businessId und productId sind erforderlich"
        },
        { status: 400 }
      );
    }

    // Validate single image
    if (!selectedImage || typeof selectedImage !== 'string') {
      return NextResponse.json(
        { error: "Genau ein Bild ist erforderlich" },
        { status: 400 }
      );
    }

    // Validate prompt
    if (!prompt || typeof prompt !== 'string' || prompt.trim().length === 0) {
      return NextResponse.json(
        { error: "Prompt ist erforderlich" },
        { status: 400 }
      );
    }

    // Get webhook URL from environment
    const webhookUrl = process.env.N8N_WEBHOOK_VIDEO_8S_PRODUCT_REAL_LIVE;

    if (!webhookUrl) {
      console.error("N8N_WEBHOOK_VIDEO_8S_PRODUCT_REAL_LIVE is not configured");
      return NextResponse.json(
        { error: "Webhook-Konfiguration fehlt" },
        { status: 500 }
      );
    }

    console.log("Creating user speaks video generation job");
    console.log("- Product ID:", productId);
    console.log("- Prompt length:", prompt.length);

    // Create a job record in the database
    const { data: jobData, error: jobError } = await supabaseAdminClient
      .from("campaign_generation_jobs")
      .insert({
        user_id: userId,
        business_id: businessId,
        product_id: productId,
        job_type: "product_video",
        status: "processing",
        request_data: {
          workflow: "user_speaks",
          selectedImage,
          prompt,
        },
      })
      .select()
      .single();

    if (jobError || !jobData) {
      console.error("Failed to create user speaks job:", jobError);
      console.error("Error details:", JSON.stringify(jobError, null, 2));
      return NextResponse.json(
        {
          error: "Fehler beim Erstellen des Jobs",
          details: jobError?.message || "Unknown error"
        },
        { status: 500 }
      );
    }

    const jobId = jobData.id;
    console.log("Created user speaks video job:", jobId);

    // Prepare data for n8n webhook
    const payload = {
      jobId,
      userId,
      businessId,
      productId,
      selectedImage,
      prompt,
    };

    console.log("=== USER SPEAKS VIDEO WEBHOOK REQUEST DEBUG ===");
    console.log("Method: POST");
    console.log("URL:", webhookUrl);
    console.log("Job ID:", jobId);

    // Trigger n8n webhook asynchronously (don't wait for response)
    // This prevents timeout issues
    fetch(webhookUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    }).catch((error) => {
      console.error("Error triggering n8n webhook:", error);
      // Update job status to failed
      supabaseAdminClient
        .from("campaign_generation_jobs")
        .update({
          status: "failed",
          error_message: error.message,
          updated_at: new Date().toISOString(),
        })
        .eq("id", jobId)
        .then(() => console.log("Job marked as failed"));
    });

    // Return immediately with job ID
    console.log("User speaks video job created and started");
    return NextResponse.json({
      success: true,
      jobId,
      status: "processing",
      message: "User Speaks Video-Erstellung wurde gestartet",
    });

  } catch (error: any) {
    console.error("Error in user-speaks-video webhook:", error);
    return NextResponse.json(
      {
        error: "Ein unerwarteter Fehler ist aufgetreten",
        details: error.message,
      },
      { status: 500 }
    );
  }
}
