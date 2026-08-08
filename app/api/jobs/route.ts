import { supabaseServer } from "@/lib/supabase-server";
import { scoreJobs } from "@/lib/engine/jobScoring";


export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const userId = searchParams.get("user_id");

  if (!userId) {
    return Response.json({
      success: false,
      error: "user_id is required"
    });
  }

  // Obtener empleos
  const { data: jobs, error: jobsError } = await supabaseServer
    .from("jobs")
    .select("*");

  if (jobsError) {
    return Response.json({
      success: false,
      error: jobsError.message
    });
  }

  // Obtener último análisis de CV del usuario
  const { data: cvData, error: cvError } = await supabaseServer
    .from("cv_analyses")
    .select("*")
    .eq("user_id", userId)
    .order("created_at", { ascending: false })
    .limit(1)
    .single();

  if (cvError || !cvData) {
    return Response.json({
      success: false,
      error: "CV not found for this user"
    });
  }

  // Motor de recomendación
  const rankedJobs = scoreJobs(jobs || [], cvData);

  return Response.json({
    success: true,
    jobs: rankedJobs,
    meta: {
      ats_score: cvData.ats_score,
      user_id: userId
    }
  });
}