import { supabaseServer } from "@/lib/supabase-server";
import { scoreJobs } from "@/lib/engine/jobScoring";

type JobRecord = {
  id: string;
  title?: string;
  description?: string;
  industry?: string;
  country?: string;
  category?: string;
  tags?: string;
  requires_whmis?: boolean;
  requires_csts?: boolean;
  requires_first_aid?: boolean;
};

export async function POST(req: Request) {
  try {
    const { cv_id } = await req.json();

    const { data: cv, error: cvError } = await supabaseServer
      .from("cv_analyses")
      .select("*")
      .eq("id", cv_id)
      .single();

    if (cvError || !cv) {
      return Response.json(
        {
          error: "CV no encontrado",
          details: cvError,
        },
        { status: 404 }
      );
    }

    const { data: jobs, error: jobsError } = await supabaseServer
      .from("jobs")
      .select("*");

    if (jobsError || !jobs) {
      return Response.json(
        {
          error: "No se encontraron empleos",
          details: jobsError,
        },
        { status: 404 }
      );
    }

    const scoredJobs = scoreJobs(
      jobs as JobRecord[],
      {
        skills: Array.isArray(cv.skills)
          ? cv.skills
          : [],

        industries: Array.isArray(cv.industries)
          ? cv.industries
          : [],
      }
    );

    const matches = scoredJobs.map((job) => ({
      user_id: cv.user_id ?? null,
      cv_id,
      job_id: job.id,
      match_score: job.match_score,

      matched_skills:
        job.match_explanation?.matched_skills ?? [],
    }));

    await supabaseServer
      .from("job_matches")
      .delete()
      .eq("cv_id", cv_id);

    const { error: insertError } = await supabaseServer
      .from("job_matches")
      .insert(matches);

    if (insertError) {
      return Response.json(
        {
          error: "Error guardando matches",
          details: insertError,
        },
        { status: 500 }
      );
    }

    return Response.json({
      success: true,

      total_matches: scoredJobs.length,

      top_matches: scoredJobs.slice(0, 10),
    });
  } catch (error: unknown) {
    const message =
      error instanceof Error
        ? error.message
        : "Server error";

    return Response.json(
      {
        error: "Server error",
        details: message,
      },
      { status: 500 }
    );
  }
}
