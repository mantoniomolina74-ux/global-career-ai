import { fetchHirebaseJobs } from "@/lib/jobs/fetchHirebaseJobs";

export async function GET() {
  try {
    const result = await fetchHirebaseJobs();

    return Response.json({
      success: true,
      source: "hirebase",
      ...result,
    });
  } catch (error: unknown) {
    console.error(
      "HIREBASE JOB SYNC ERROR:",
      error
    );

    return Response.json(
      {
        success: false,
        source: "hirebase",
        error:
          error instanceof Error
            ? error.message
            : "Error sincronizando empleos Hirebase",
      },
      { status: 500 }
    );
  }
}