import { NextResponse } from "next/server";

import { getJobById } from "@/lib/jobs/getJobById";
import { createSupabaseServerAuth } from "@/lib/supabase/server";

export async function POST(
  request: Request
) {
  try {
    const supabase =
      await createSupabaseServerAuth();

    const {
      data: {
        user,
      },
    } =
      await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json(
        {
          error: "Authentication required",
        },
        {
          status: 401,
        }
      );
    }

    const body =
      await request.json();

    const jobId =
      typeof body?.jobId === "string"
        ? body.jobId.trim()
        : "";

    if (!jobId) {
      return NextResponse.json(
        {
          error: "jobId is required",
        },
        {
          status: 400,
        }
      );
    }

    const job =
      await getJobById(jobId);

    if (!job) {
      return NextResponse.json(
        {
          error: "Job not found",
        },
        {
          status: 404,
        }
      );
    }

    const {
      data: existingApplication,
      error: existingApplicationError,
    } =
      await supabase
        .from("applications")
        .select("id, job_id, status")
        .eq("user_id", user.id)
        .eq("job_id", job.id)
        .maybeSingle();

    if (existingApplicationError) {
      console.error(
        "[APPLICATION CREATE] Existing application lookup failed",
        existingApplicationError
      );

      return NextResponse.json(
        {
          error:
            "Failed to check existing application",
        },
        {
          status: 500,
        }
      );
    }

    if (existingApplication) {
      return NextResponse.json(
        {
          application:
            existingApplication,
          created: false,
        },
        {
          status: 200,
        }
      );
    }

    const {
      data: application,
      error: insertError,
    } =
      await supabase
        .from("applications")
        .insert({
          user_id: user.id,
          job_id: job.id,
          company: job.company ?? null,
          position: job.title,
          country: job.country ?? null,
          application_date:
            new Date()
              .toISOString()
              .slice(0, 10),
          status: "Saved",
          source: job.source ?? null,
        })
        .select(
          "id, user_id, job_id, company, position, country, application_date, status, source, created_at, updated_at"
        )
        .single();

    if (insertError) {
      console.error(
        "[APPLICATION CREATE] Insert failed",
        insertError
      );

      return NextResponse.json(
        {
          error:
            "Failed to create application",
        },
        {
          status: 500,
        }
      );
    }

    console.log(
      "[APPLICATION CREATE]",
      {
        userId: user.id,
        applicationId:
          application.id,
        jobId: job.id,
        status:
          application.status,
      }
    );

    return NextResponse.json(
      {
        application,
        created: true,
      },
      {
        status: 201,
      }
    );

  } catch (error) {

    console.error(
      "[APPLICATION CREATE] Unexpected error",
      error
    );

    return NextResponse.json(
      {
        error:
          "Unexpected application error",
      },
      {
        status: 500,
      }
    );
  }
}
