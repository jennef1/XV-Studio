import { NextRequest, NextResponse } from "next/server";
import { supabaseAdminClient } from "@/lib/supabaseAdmin";

/**
 * Callback endpoint for N8N to call when Firmenprofil workflow completes
 * N8N should POST to this endpoint with the job result
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { job_id, status, business_id, error_message } = body;

    console.log("[Firmenprofil Callback] Received:", { job_id, status, business_id });

    // Validate required fields
    if (!job_id || !status) {
      return NextResponse.json(
        { error: "job_id and status are required" },
        { status: 400 }
      );
    }

    // Update the job status in the database
    const updateData: any = {
      status: status, // "completed" or "failed"
      updated_at: new Date().toISOString(),
    };

    // If business_id is provided, update it (replace placeholder)
    if (business_id) {
      updateData.business_id = business_id;
    }

    // If there's an error message, include it
    if (error_message) {
      updateData.error_message = error_message;
    }

    const { data, error } = await supabaseAdminClient
      .from("campaign_generation_jobs")
      .update(updateData)
      .eq("id", job_id)
      .select()
      .single();

    if (error) {
      console.error("[Firmenprofil Callback] Failed to update job:", error);
      return NextResponse.json(
        { error: "Failed to update job status" },
        { status: 500 }
      );
    }

    console.log("[Firmenprofil Callback] Job updated successfully:", data);

    return NextResponse.json({
      success: true,
      message: "Job status updated successfully",
      job: data,
    });

  } catch (error: any) {
    console.error("[Firmenprofil Callback] Unexpected error:", error);
    return NextResponse.json(
      { error: "Ein Fehler ist aufgetreten", details: error.message },
      { status: 500 }
    );
  }
}
