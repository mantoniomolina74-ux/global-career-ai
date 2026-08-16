import { supabaseServer } from "@/lib/supabase-server";

type HirebaseLocation = {
  city?: string;
  region?: string;
  country?: string;
};

type HirebaseJob = {
  _id: string;
  company_name?: string;
  job_title?: string;
  description?: string;
  application_link?: string;
  location_type?: string;
  locations?: HirebaseLocation[];
  job_categories?: string[];
  requirements_summary?: string;
  expired?: boolean;
};

type HirebaseResponse = {
  jobs?: HirebaseJob[];
  total_count?: number;
};

function getLocation(job: HirebaseJob): {
  location: string;
  country: string | null;
} {
  const first = job.locations?.[0];

  if (!first) {
    return {
      location: job.location_type ?? "Remote",
      country: null,
    };
  }

  const parts = [
    first.city,
    first.region,
    first.country,
  ].filter(Boolean);

  return {
    location:
      parts.length > 0
        ? parts.join(", ")
        : job.location_type ?? "Remote",
    country: first.country ?? null,
  };
}

export async function fetchHirebaseJobs() {
  const apiKey = process.env.HIREBASE_API_KEY;

  if (!apiKey) {
    throw new Error(
      "HIREBASE_API_KEY no está configurada."
    );
  }

  const response = await fetch(
    "https://api.hirebase.org/v2/jobs/search",
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": apiKey,
      },
      body: JSON.stringify({
        location_types: [
          "Remote",
          "Hybrid",
          "In-Person",
        ],
        include_expired: "false",
        filter_incomplete_jobs: "true",
        sort_by: "date_posted",
        sort_order: "desc",
        page: 1,
        limit: 100,
      }),
      cache: "no-store",
    }
  );

  if (!response.ok) {
    const body = await response.text();

    throw new Error(
      `Hirebase API error ${response.status}: ${body}`
    );
  }

  const data =
    (await response.json()) as HirebaseResponse;

  const jobs = Array.isArray(data.jobs)
    ? data.jobs
    : [];

  const formattedJobs = jobs
    .filter(
      (job) =>
        job._id &&
        job.job_title &&
        job.application_link
    )
    .map((job) => {
      const location = getLocation(job);

      return {
        title: job.job_title,
        company: job.company_name ?? null,
        location: location.location,
        country: location.country,
        description:
          job.description ??
          job.requirements_summary ??
          null,
        url: job.application_link,
        source: "hirebase",
        category:
          job.job_categories?.[0] ?? null,
        tags: Array.isArray(job.job_categories)
          ? job.job_categories.join(", ")
          : null,
        industry: null,
        created_at: new Date().toISOString(),
      };
    });

  if (formattedJobs.length === 0) {
    throw new Error(
      "Hirebase no devolvió empleos utilizables."
    );
  }

  const { error } = await supabaseServer
    .from("jobs")
    .upsert(formattedJobs, {
      onConflict: "url",
    });

  if (error) {
    throw new Error(
      `Error guardando empleos Hirebase: ${error.message}`
    );
  }

  return {
    fetched: jobs.length,
    stored: formattedJobs.length,
    total_count:
      data.total_count ?? jobs.length,
  };
}