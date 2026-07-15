import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

type JobRecord = {
  id: string;
  industry?: string | null;
};

export async function POST(req: Request) {
  try {
    const { cv_id } = await req.json();

    const { data: cv, error: cvError } = await supabase
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

    const { data: jobs, error: jobsError } = await supabase
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

    const cvIndustries = Array.isArray(cv.industries)
      ? cv.industries
      : [];

    const matches = jobs.map((job: JobRecord) => {
      const matchScore = cvIndustries.includes(job.industry)
        ? 100
        : 0;

      return {
        cv_id,
        job_id: job.id,
        match_score: matchScore,
        matched_skills: [],
      };
    });

    await supabase
      .from("job_matches")
      .delete()
      .eq("cv_id", cv_id);

    const { error: insertError } = await supabase
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

    const sorted = matches.sort(
      (a, b) => b.match_score - a.match_score
    );

    return Response.json({
      success: true,
      total_matches: sorted.length,
      top_matches: sorted.slice(0, 10),
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