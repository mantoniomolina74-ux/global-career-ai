import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(req: Request) {
  try {
    const { cv_id } = await req.json();

    // 1. Obtener CV
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

    // 2. Obtener jobs
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

    // 3. Calcular matches (solo por industria)
    const matches = jobs.map((job: any) => {
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

    // 4. Limpiar matches anteriores del CV
    await supabase
      .from("job_matches")
      .delete()
      .eq("cv_id", cv_id);

    // 5. Guardar matches
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

    // 6. Ordenar resultados
    const sorted = matches.sort(
      (a, b) => b.match_score - a.match_score
    );

    return Response.json({
      success: true,
      total_matches: sorted.length,
      top_matches: sorted.slice(0, 10),
    });

  } catch (error: any) {
    return Response.json(
      {
        error: "Server error",
        details: error.message,
      },
      { status: 500 }
    );
  }
}