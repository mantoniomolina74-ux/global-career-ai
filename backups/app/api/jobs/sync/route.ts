import { fetchRemoteJobs } from "@/lib/jobs/fetchRemoteJobs";

export async function GET() {
  await fetchRemoteJobs();

  return Response.json({
    success: true,
    message: "Jobs sincronizados correctamente"
  });
}