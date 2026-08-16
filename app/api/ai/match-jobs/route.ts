import { supabaseServer } from "@/lib/supabase-server";
import { runJobMatchEngine } from "@/lib/engine/jobs/jobMatchEngine";

export async function POST(req: Request) {
  try {
    const { cv_id } = await req.json();

    if (!cv_id) {
      return Response.json(
        {
          success: false,
          error: "cv_id es requerido",
        },
        { status: 400 }
      );
    }

    const { data: cv, error: cvError } = await supabaseServer
      .from("cv_analyses")
      .select("*")
      .eq("id", cv_id)
      .single();

    if (cvError || !cv) {
      return Response.json(
        {
          success: false,
          error: "CV no encontrado",
        },
        { status: 404 }
      );
    }

    const { data: jobs, error: jobsError } = await supabaseServer
      .from("jobs")
      .select("*");

    if (jobsError) {
      return Response.json(
        {
          success: false,
          error: jobsError.message,
        },
        { status: 500 }
      );
    }

    const result = runJobMatchEngine(
      jobs ?? [],
      {
        skills: Array.isArray(cv.skills) ? cv.skills : [],
        industries: Array.isArray(cv.industries)
          ? cv.industries
          : [],
      }
    );

    const matches = result.items.map((job) => ({
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

    if (matches.length > 0) {
      const { error: insertError } = await supabaseServer
        .from("job_matches")
        .insert(matches);

      if (insertError) {
        return Response.json(
          {
            success: false,
            error: insertError.message,
          },
          { status: 500 }
        );
      }
    }

    return Response.json({
      success: true,
      total_matches: result.items.length,
      top_matches: result.items.slice(0, 10),
    });
  } catch (error: unknown) {
    console.error("MATCH JOBS ERROR:", error);

    return Response.json(
      {
        success: false,
        error:
          error instanceof Error
            ? error.message
            : "Error ejecutando Matching Engine",
      },
      { status: 500 }
    );
  }
}
