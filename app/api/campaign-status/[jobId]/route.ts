import { NextRequest, NextResponse } from "next/server";
import { supabaseAdminClient } from "@/lib/supabaseAdmin";

export async function GET(
  request: NextRequest,
  { params }: { params: { jobId: string } }
) {
  try {
    const { jobId } = params;

    if (!jobId) {
      return NextResponse.json(
        { error: "jobId ist erforderlich" },
        { status: 400 }
      );
    }

    // Fetch job status
    const { data: job, error: fetchError } = await supabaseAdminClient
      .from("campaign_generation_jobs" as any)
      .select("id, status, result_images, error_message, created_at, updated_at")
      .eq("id", jobId)
      .single();

    if (fetchError || !job) {
      console.error("Job not found:", jobId, fetchError);
      return NextResponse.json(
        { error: "Job nicht gefunden" },
        { status: 404 }
      );
    }

    // Return job status
    return NextResponse.json({
      success: true,
      job: {
        id: job.id,
        status: job.status,
        images: job.result_images,
        errorMessage: job.error_message,
        createdAt: job.created_at,
        updatedAt: job.updated_at,
      },
    });

  } catch (error: any) {
    console.error("Error fetching campaign status:", error);
    return NextResponse.json(
      {
        error: "Ein unerwarteter Fehler ist aufgetreten",
        details: error.message,
      },
      { status: 500 }
    );
  }
}
