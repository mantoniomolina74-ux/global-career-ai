
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

type RemoteJob = {
  title: string;
  company_name: string;
  candidate_required_location?: string;
  description?: string;
  url: string;
  category?: string;
  tags?: string[];
};

export async function fetchRemoteJobs() {
  try {
    const res = await fetch("https://remotive.com/api/remote-jobs");
    const data = await res.json();

    const jobs = data.jobs as RemoteJob[];

    const formattedJobs = jobs.map((job: RemoteJob) => ({
      title: job.title,
      company: job.company_name,
      location:
        job.candidate_required_location || "Remote",
      description: job.description,
      url: job.url,
      category: job.category,
      tags: Array.isArray(job.tags)
        ? job.tags.join(", ")
        : "",
      source: "remotive",
      created_at: new Date(),
    }));

    const { error } = await supabase
      .from("jobs")
      .upsert(formattedJobs, {
        onConflict: "url",
      });

    if (error) {
      console.error(
        "Error insertando jobs:",
        error.message
      );
      return;
    }

    console.log(
      `Jobs insertados: ${formattedJobs.length}`
    );
  } catch (err) {
    console.error("Error fetching jobs:", err);
  }
}