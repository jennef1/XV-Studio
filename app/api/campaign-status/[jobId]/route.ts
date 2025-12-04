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
    console.log(`[Campaign Status] Job ID type: ${typeof jobId}, length: ${jobId.length}`);

    // Fetch job status
    const { data: job, error: fetchError } = await supabaseAdminClient
      .from("campaign_generation_jobs")
      .select("id, job_type, status, result_images, result_video_url, error_message, created_at, updated_at")
      .eq("id", jobId)
      .single();

    if (fetchError) {
      console.error("[Campaign Status] Supabase error:", {
        code: fetchError.code,
        message: fetchError.message,
        details: fetchError.details,
        hint: fetchError.hint,
      });
      return NextResponse.json(
        {
          error: "Job nicht gefunden",
          details: fetchError.message,
          code: fetchError.code,
        },
        { status: 404 }
      );
    }

    if (!job) {
      console.error("[Campaign Status] Job not found in database:", jobId);
      return NextResponse.json(
        { error: "Job nicht gefunden - keine Daten zurückgegeben" },
        { status: 404 }
      );
    }

    // Type assertion to help TypeScript
    const jobData = job as {
      id: string;
      job_type: "campaign_images" | "product_video";
      status: string;
      result_images: string[] | null;
      result_video_url: string | null;
      error_message: string | null;
      created_at: string;
      updated_at: string;
    };

    console.log(`[Campaign Status] Job ${jobId} type: ${jobData.job_type}, status: ${jobData.status}`);

    if (jobData.job_type === "campaign_images") {
      console.log(`[Campaign Status] Images: ${jobData.result_images?.length || 0}`);
    } else if (jobData.job_type === "product_video") {
      console.log(`[Campaign Status] Video URL: ${jobData.result_video_url ? "present" : "null"}`);
    }

    // Return job status with cache control headers
    return NextResponse.json(
      {
        success: true,
        job: {
          id: jobData.id,
          jobType: jobData.job_type,
          status: jobData.status,
          images: jobData.result_images,
          videoUrl: jobData.result_video_url,
          errorMessage: jobData.error_message,
          createdAt: jobData.created_at,
          updatedAt: jobData.updated_at,
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
