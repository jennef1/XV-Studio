import { NextRequest, NextResponse } from "next/server";
import { supabaseAdminClient } from "@/lib/supabaseAdmin";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      userId,
      businessId,
      productId,
      product,
      selectedImage,
      brandDNA,
      additionalComments
    } = body;

    // Validate required fields
    if (!userId || !businessId || !productId || !product || !selectedImage) {
      return NextResponse.json(
        {
          error: "Fehlende Daten: userId, businessId, productId, product und selectedImage sind erforderlich"
        },
        { status: 400 }
      );
    }

    // Validate product structure
    if (!product.name || !product.description) {
      return NextResponse.json(
        { error: "Produkt muss mindestens einen Namen und eine Beschreibung haben" },
        { status: 400 }
      );
    }

    // Validate brandDNA structure
    if (!brandDNA || !brandDNA.tone_of_voice || !brandDNA.brand_values) {
      return NextResponse.json(
        { error: "Brand DNA Informationen sind erforderlich" },
        { status: 400 }
      );
    }

    // Get webhook URL from environment
    const webhookUrl = process.env.N8N_WEBHOOK_URL_SOCIAL_MEDIA_CAMPAIGN;

    if (!webhookUrl) {
      console.error("N8N_WEBHOOK_URL_SOCIAL_MEDIA_CAMPAIGN is not configured");
      return NextResponse.json(
        { error: "Webhook-Konfiguration fehlt" },
        { status: 500 }
      );
    }

    console.log("Creating campaign generation job");
    console.log("- Product:", product.name);
    console.log("- Selected Image:", selectedImage);
    console.log("- Brand DNA included");
    console.log("- Additional Comments:", additionalComments || "none");

    // Create a job record in the database
    const { data: jobData, error: jobError } = await supabaseAdminClient
      .from("campaign_generation_jobs")
      .insert({
        user_id: userId,
        business_id: businessId,
        product_id: productId,
        job_type: "campaign_images",
        status: "processing",
        request_data: {
          product,
          selectedImage,
          brandDNA,
          additionalComments,
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

    // Type assertion to help TypeScript
    const typedJobData = jobData as {
      id: string;
      job_type: string;
      status: string;
      created_at: string;
    };

    const jobId = typedJobData.id;
    console.log("✅ Created job successfully!");
    console.log("- Job ID:", jobId);
    console.log("- Job ID type:", typeof jobId);
    console.log("- Job ID length:", jobId.length);
    console.log("- Job type:", typedJobData.job_type);
    console.log("- Initial status:", typedJobData.status);

    // Prepare data for POST request to n8n
    const payload = {
      jobId, // Include jobId so n8n can call the completion webhook
      userId,
      businessId,
      productId,
      product: {
        name: product.name,
        description: product.description,
        key_features: product.key_features || [],
        benefits: product.benefits || [],
      },
      selectedImage,
      brandDNA: {
        tone_of_voice: brandDNA.tone_of_voice || [],
        brand_values: brandDNA.brand_values || [],
        brand_colors: brandDNA.brand_colors || [],
      },
      additionalComments: additionalComments || "",
    };

    console.log("=== CAMPAIGN WEBHOOK REQUEST DEBUG ===");
    console.log("Method: POST");
    console.log("URL:", webhookUrl);
    console.log("Job ID:", jobId);

    // Trigger n8n webhook asynchronously (don't wait for response)
    // This prevents Cloudflare timeout issues
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
    console.log("Campaign generation job created and started");
    return NextResponse.json({
      success: true,
      jobId,
      status: "processing",
      message: "Kampagnen-Erstellung wurde gestartet",
    });

  } catch (error: any) {
    console.error("Error in social-media-campaign webhook:", error);
    return NextResponse.json(
      {
        error: "Ein unerwarteter Fehler ist aufgetreten",
        details: error.message,
      },
      { status: 500 }
    );
  }
}
