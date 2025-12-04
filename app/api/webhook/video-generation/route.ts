import { NextRequest, NextResponse } from "next/server";
import { supabaseAdminClient } from "@/lib/supabaseAdmin";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      userId,
      businessId,
      productId,
      prompt,
      images
    } = body;

    // Validate required fields
    if (!userId || !businessId || !prompt) {
      return NextResponse.json(
        {
          error: "Fehlende Daten: userId, businessId und prompt sind erforderlich"
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

    console.log("Creating video generation job");
    console.log("- Product ID:", productId || "manual");
    console.log("- Images count:", images.length);
    console.log("- Prompt length:", prompt?.length || 0);

    // Create a job record in the database
    const { data: jobData, error: jobError } = await supabaseAdminClient
      .from("campaign_generation_jobs")
      .insert({
        user_id: userId,
        business_id: businessId,
        product_id: productId || "",
        job_type: "product_video",
        status: "processing",
        request_data: {
          prompt,
          images,
        },
      })
      .select()
      .single();

    if (jobError || !jobData) {
      console.error("Failed to create job:", jobError);
      return NextResponse.json(
        { error: "Fehler beim Erstellen des Jobs" },
        { status: 500 }
      );
    }

    const jobId = jobData.id;
    console.log("Created video generation job:", jobId);

    // Prepare data for n8n webhook
    const payload = {
      jobId, // Include jobId so n8n can update the database
      userId,
      businessId,
      productId: productId || "",
      prompt,
      images,
    };

    console.log("=== VIDEO GENERATION WEBHOOK REQUEST DEBUG ===");
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
    console.log("Video generation job created and started");
    return NextResponse.json({
      success: true,
      jobId,
      status: "processing",
      message: "Video-Erstellung wurde gestartet",
    });

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
