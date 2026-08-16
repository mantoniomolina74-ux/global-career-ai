import { supabaseServer } from "@/lib/supabase-server";

export async function GET() {
  try {
    const { data: jobs, error: jobsError } = await supabaseServer
      .from("jobs")
      .select("*")
      .eq("source", "hirebase")
      .not("url", "is", null)
      .order("created_at", { ascending: false });

    if (jobsError) {
      return Response.json(
        {
          success: false,
          error: jobsError.message,
        },
        { status: 500 }
      );
    }

    return Response.json({
      success: true,
      jobs: jobs ?? [],
      meta: {
        matching: false,
        source: "hirebase",
      },
    });
  } catch (error: unknown) {
    console.error("JOBS API ERROR:", error);

    return Response.json(
      {
        success: false,
        error:
          error instanceof Error
            ? error.message
            : "Error cargando empleos",
      },
      { status: 500 }
    );
  }
}