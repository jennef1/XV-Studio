import { NextRequest, NextResponse } from "next/server";
import { supabaseAdminClient } from "@/lib/supabaseAdmin";
import { normalizeUrl } from "@/lib/urlUtils";

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

    // 2. Check if business with this URL already exists (URL-based discovery)
    const normalizedUrl = normalizeUrl(url);

    console.log("[Business & Products Webhook] Checking for existing business:", normalizedUrl);

    const { data: existingBusiness, error: checkError } = await supabaseAdminClient
      .from("businesses")
      .select("id, company_name, detached_at")
      .eq("company_url", normalizedUrl)
      .maybeSingle();

    if (existingBusiness) {
      console.log("[Business & Products Webhook] Found existing business:", existingBusiness.id);

      // Check if user is already linked to this business
      const { data: existingLink } = await supabaseAdminClient
        .from("business_users")
        .select("id")
        .eq("business_id", existingBusiness.id)
        .eq("user_id", user_id)
        .maybeSingle();

      if (!existingLink) {
        // User not linked yet - create junction table entry
        console.log("[Business & Products Webhook] Linking new user to existing business");

        await supabaseAdminClient
          .from("business_users")
          .insert({
            business_id: existingBusiness.id,
            user_id: user_id,
            role: 'member', // Subsequent users are members (first user was 'owner')
            joined_at: new Date().toISOString()
          });

        console.log("[Business & Products Webhook] Successfully linked user to existing business");
      } else {
        console.log("[Business & Products Webhook] User already linked to business");
      }

      // Return immediately without N8N workflow - instant connection!
      return NextResponse.json({
        success: true,
        business_id: existingBusiness.id,
        message: "Connected to existing business",
        skipped_scraping: true,
      });
    }

    // No existing business found, proceed with N8N workflow
    console.log("[Business & Products Webhook] No existing business found, creating new one");

    // 3. Create job record with placeholder IDs
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
        request_data: { url, webhook: "firmenprofil" },
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

    // 4. Trigger Firmenprofil n8n webhook and wait for response with business_id
    const firmenprofilWebhook = process.env.N8N_WEBHOOK_URL_BUSINESS_WEBSITE_DNA;

    if (!firmenprofilWebhook) {
      console.error("[Business & Products Webhook] Firmenprofil webhook not configured");
      // Update job to failed since we can't process it
      await supabaseAdminClient
        .from("campaign_generation_jobs")
        .update({
          status: "failed",
          error_message: "Webhook-Konfiguration fehlt",
          updated_at: new Date().toISOString(),
        })
        .eq("id", jobId);

      return NextResponse.json(
        { error: "Webhook-Konfiguration fehlt" },
        { status: 500 }
      );
    }

    console.log("[Business & Products Webhook] Calling Firmenprofil webhook (SYNC):", firmenprofilWebhook);

    // Call Firmenprofil webhook and wait for business_id response
    try {
      const firmenprofilResponse = await fetch(firmenprofilWebhook, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          url,
          user_id,
          job_id: jobId,
        }),
      });

      const responseText = await firmenprofilResponse.text();
      console.log("[Business & Products Webhook] Firmenprofil response status:", firmenprofilResponse.status);
      console.log("[Business & Products Webhook] Firmenprofil response body:", responseText);

      if (!firmenprofilResponse.ok) {
        console.error("[Business & Products Webhook] Firmenprofil webhook failed");
        await supabaseAdminClient
          .from("campaign_generation_jobs")
          .update({
            status: "failed",
            error_message: `Firmenprofil Webhook-Fehler: ${firmenprofilResponse.status}`,
            updated_at: new Date().toISOString(),
          })
          .eq("id", jobId);

        return NextResponse.json(
          { error: "Firmenprofil webhook failed" },
          { status: 500 }
        );
      }

      // Parse business_id and screenshot_url from response
      let business_id: string | null = null;
      let screenshot_url: string | null = null;
      try {
        const responseData = JSON.parse(responseText);
        business_id = responseData.business_id || responseData.businessId || null;
        screenshot_url = responseData.screenshot_url || responseData.screenshotUrl || null;
        console.log("[Business & Products Webhook] Extracted business_id:", business_id);
        console.log("[Business & Products Webhook] Extracted screenshot_url:", screenshot_url);
      } catch (parseError) {
        console.error("[Business & Products Webhook] Failed to parse response JSON:", parseError);
      }

      // Update business record with screenshot if available
      if (business_id && screenshot_url) {
        console.log("[Business & Products Webhook] Updating business with screenshot URL");
        const { error: updateError } = await supabaseAdminClient
          .from("businesses")
          .update({ website_screenshot: screenshot_url })
          .eq("id", business_id);

        if (updateError) {
          console.error("[Business & Products Webhook] Failed to update business screenshot:", updateError);
        } else {
          console.log("[Business & Products Webhook] Successfully updated business with screenshot");
        }
      }

      // Update job status to completed with business_id
      await supabaseAdminClient
        .from("campaign_generation_jobs")
        .update({
          status: "completed",
          business_id: business_id || jobData.business_id, // Use extracted or keep placeholder
          updated_at: new Date().toISOString(),
        })
        .eq("id", jobId);

      console.log("[Business & Products Webhook] Job marked as completed with business_id:", business_id);

      // Link the creator to the new business in junction table
      if (business_id) {
        console.log("[Business & Products Webhook] Linking creator to newly created business");

        await supabaseAdminClient
          .from("business_users")
          .insert({
            business_id: business_id,
            user_id: user_id,
            role: 'owner', // First user is owner
            joined_at: new Date().toISOString()
          });

        console.log("[Business & Products Webhook] Successfully linked creator to business");
      }

      // Now trigger Angebote webhook asynchronously with business_id
      if (business_id) {
        const angeboteWebhook = process.env.N8N_WEBHOOK_URL_PRODUCT_DATA;
        if (angeboteWebhook) {
          console.log("[Business & Products Webhook] Triggering Angebote webhook with business_id:", business_id);

          fetch(angeboteWebhook, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              url,
              user_id,
              business_id,
              job_id: jobId,
            }),
          }).then(async (res) => {
            const angeboteText = await res.text();
            console.log("[Business & Products Webhook] Angebote webhook response:", res.status, angeboteText);
          }).catch((err) => {
            console.error("[Business & Products Webhook] Angebote webhook failed:", err);
          });
        }
      }

    } catch (err: any) {
      console.error("[Business & Products Webhook] Firmenprofil webhook error:", err);
      await supabaseAdminClient
        .from("campaign_generation_jobs")
        .update({
          status: "failed",
          error_message: `Firmenprofil Webhook-Fehler: ${err.message}`,
          updated_at: new Date().toISOString(),
        })
        .eq("id", jobId);

      return NextResponse.json(
        { error: "Firmenprofil webhook error" },
        { status: 500 }
      );
    }

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
