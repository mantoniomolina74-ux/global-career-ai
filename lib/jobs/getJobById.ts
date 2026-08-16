import { supabaseServer } from "@/lib/supabase-server";

export type JobDetail = {
  id: string;
  title: string | null;
  company: string | null;
  location: string | null;
  country: string | null;
  industry: string | null;
  description: string | null;
  url: string | null;
  source: string | null;
  category: string | null;
  tags: string | null;
  created_at: string | null;
};

export async function getJobById(
  id: string
): Promise<JobDetail | null> {
  const { data, error } = await supabaseServer
    .from("jobs")
    .select(
      `
        id,
        title,
        company,
        location,
        country,
        industry,
        description,
        url,
        source,
        category,
        tags,
        created_at
      `
    )
    .eq("id", id)
    .eq("source", "hirebase")
    .maybeSingle();

  if (error) {
    throw new Error(
      `Error obteniendo la oportunidad: ${error.message}`
    );
  }

  return data;
}