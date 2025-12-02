import { NextRequest, NextResponse } from "next/server";
import { supabaseAdminClient } from "@/lib/supabaseAdmin";

// Disable caching for this endpoint
export const dynamic = 'force-dynamic';
export const revalidate = 0;

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

    console.log(`[Campaign Status] Polling for job: ${jobId}`);

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

    console.log(`[Campaign Status] Job ${jobId} status: ${job.status}, images: ${job.result_images?.length || 0}`);

    // Return job status with cache control headers
    return NextResponse.json(
      {
        success: true,
        job: {
          id: job.id,
          status: job.status,
          images: job.result_images,
          errorMessage: job.error_message,
          createdAt: job.created_at,
          updatedAt: job.updated_at,
        },
      },
      {
        headers: {
          'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
          'Pragma': 'no-cache',
          'Expires': '0',
        },
      }
    );

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
