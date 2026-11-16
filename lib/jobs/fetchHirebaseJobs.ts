
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
  date_posted?: string;
  expired?: boolean;
};

type HirebaseResponse = {
  jobs?: HirebaseJob[];
  total_count?: number;
};

type FormattedJob = {
  title: string;
  external_id: string;
  company: string | null;
  location: string;
  country: string | null;
  description: string | null;
  url: string;
  source: "hirebase";
  category: string | null;
  tags: string | null;
  industry: null;
  posted_at: string | null;
  first_seen_at?: string;
  last_seen_at: string;
  is_active: boolean;
  expired_at: string | null;
};

type ExistingJob = {
  external_id: string;
};

type HirebaseSyncState = {
  id: string;
  source: "hirebase";
  period_start: string;
  jobs_consumed: number;
  last_posted_at: string | null;
  last_successful_sync_at: string | null;
};

class HirebaseQuotaExceededError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "HirebaseQuotaExceededError";
  }
}

const HIREBASE_API_URL =
  "https://api.hirebase.org/v2/jobs/search";

const HIREBASE_SOURCE = "hirebase";

const MONTHLY_QUOTA = 500;

const PAGE_SIZE = 100;

/*
 * Hirebase Search incremental synchronization.
 *
 * Page numbers are execution state only.
 * last_posted_at is the persistent checkpoint.
 */
const MAX_PAGES_PER_SYNC = 5;

/*
 * Small overlap protects the checkpoint against inclusive/exclusive
 * posted_after behavior and multiple jobs sharing the same timestamp.
 *
 * Duplicate results are harmless because jobs.external_id is unique
 * per source.
 */
const CHECKPOINT_OVERLAP_SECONDS = 1;

function getCurrentPeriodStart(date: Date): string {
  const year = date.getUTCFullYear();
  const month = date.getUTCMonth();

  return new Date(
    Date.UTC(year, month, 1)
  )
    .toISOString()
    .slice(0, 10);
}

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

async function fetchHirebasePage(
  apiKey: string,
  page: number,
  limit: number,
  postedAfter: string | null
): Promise<HirebaseResponse> {
  const body: Record<string, unknown> = {
    location_types: [
      "Remote",
      "Hybrid",
      "In-Person",
    ],
    include_expired: "false",
    filter_incomplete_jobs: "true",
    sort_by: "date_posted",
    sort_order: "desc",
    page,
    limit,
  };

  if (postedAfter) {
    body.posted_after = postedAfter;
  }

  const response = await fetch(HIREBASE_API_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-api-key": apiKey,
    },
    body: JSON.stringify(body),
    cache: "no-store",
  });

  if (!response.ok) {
    const responseBody = await response.text();

    if (
      response.status === 429 &&
      responseBody.includes(
        "reached your plan's included usage"
      )
    ) {
      throw new HirebaseQuotaExceededError(
        `Hirebase quota agotada: ${responseBody}`
      );
    }

    throw new Error(
      `Hirebase API error ${response.status}: ${responseBody}`
    );
  }

  return (await response.json()) as HirebaseResponse;
}

function formatJob(
  job: HirebaseJob,
  now: string
): FormattedJob {
  const location = getLocation(job);

  return {
    title: job.job_title!,
    external_id: job._id,
    company: job.company_name ?? null,
    location: location.location,
    country: location.country,
    description:
      job.description ??
      job.requirements_summary ??
      null,
    url: job.application_link!,
    source: "hirebase",
    category:
      job.job_categories?.[0] ?? null,
    tags: Array.isArray(job.job_categories)
      ? job.job_categories.join(", ")
      : null,
    industry: null,
    posted_at: job.date_posted
      ? new Date(job.date_posted).toISOString()
      : null,
    last_seen_at: now,
    is_active: !job.expired,
    expired_at: job.expired
      ? now
      : null,
  };
}

async function persistHirebaseJobs(
  jobs: FormattedJob[],
  now: string
): Promise<number> {
  if (jobs.length === 0) {
    return 0;
  }

  const externalIds = jobs.map(
    (job) => job.external_id
  );

  const {
    data: existingRows,
    error: existingError,
  } = await supabaseServer
    .from("jobs")
    .select("external_id")
    .eq("source", HIREBASE_SOURCE)
    .in("external_id", externalIds);

  if (existingError) {
    throw new Error(
      `Error consultando empleos Hirebase existentes: ${existingError.message}`
    );
  }

  const existingIds = new Set(
    ((existingRows ?? []) as ExistingJob[]).map(
      (job) => job.external_id
    )
  );

  const newJobs = jobs.filter(
    (job) => !existingIds.has(job.external_id)
  );

  const existingJobs = jobs.filter(
    (job) => existingIds.has(job.external_id)
  );

  if (newJobs.length > 0) {
    const { error: insertError } =
      await supabaseServer
        .from("jobs")
        .insert(
          newJobs.map((job) => ({
            ...job,
            first_seen_at: now,
          }))
        );

    if (insertError) {
      throw new Error(
        `Error insertando empleos Hirebase: ${insertError.message}`
      );
    }
  }

  for (const job of existingJobs) {
    const { error: updateError } =
      await supabaseServer
        .from("jobs")
        .update({
          title: job.title,
          company: job.company,
          location: job.location,
          country: job.country,
          description: job.description,
          url: job.url,
          category: job.category,
          tags: job.tags,
          industry: job.industry,
          posted_at: job.posted_at,
          last_seen_at: job.last_seen_at,
          is_active: job.is_active,
          expired_at: job.expired_at,
        })
        .eq("source", HIREBASE_SOURCE)
        .eq(
          "external_id",
          job.external_id
        );

    if (updateError) {
      throw new Error(
        `Error actualizando empleo Hirebase ${job.external_id}: ${updateError.message}`
      );
    }
  }

  return jobs.length;
}

async function getOrCreateSyncState(
  periodStart: string
): Promise<HirebaseSyncState> {
  const {
    data: existingState,
    error: stateError,
  } = await supabaseServer
    .from("hirebase_sync_state")
    .select(
      "id, source, period_start, jobs_consumed, last_posted_at, last_successful_sync_at"
    )
    .eq("source", HIREBASE_SOURCE)
    .maybeSingle();

  if (stateError) {
    throw new Error(
      `Error consultando estado de sincronización Hirebase: ${stateError.message}`
    );
  }

  if (existingState) {
    const state =
      existingState as HirebaseSyncState;

    if (state.period_start === periodStart) {
      return state;
    }

    const {
      data: resetState,
      error: resetError,
    } = await supabaseServer
      .from("hirebase_sync_state")
      .update({
        period_start: periodStart,
        jobs_consumed: 0,
        updated_at: new Date().toISOString(),
      })
      .eq("id", state.id)
      .select(
        "id, source, period_start, jobs_consumed, last_posted_at, last_successful_sync_at"
      )
      .single();

    if (resetError || !resetState) {
      throw new Error(
        `Error reiniciando cuota mensual Hirebase: ${
          resetError?.message ??
          "estado no encontrado"
        }`
      );
    }

    return resetState as HirebaseSyncState;
  }

  const {
    data: createdState,
    error: createError,
  } = await supabaseServer
    .from("hirebase_sync_state")
    .insert({
      source: HIREBASE_SOURCE,
      period_start: periodStart,
      jobs_consumed: 0,
      last_posted_at: null,
      last_successful_sync_at: null,
    })
    .select(
      "id, source, period_start, jobs_consumed, last_posted_at, last_successful_sync_at"
    )
    .single();

  if (createError || !createdState) {
    throw new Error(
      `Error creando estado de sincronización Hirebase: ${
        createError?.message ??
        "estado no creado"
      }`
    );
  }

  return createdState as HirebaseSyncState;
}

async function updateSyncState(
  stateId: string,
  values: {
    jobs_consumed?: number;
    last_posted_at?: string | null;
    last_successful_sync_at?: string | null;
  }
): Promise<void> {
  const { error } = await supabaseServer
    .from("hirebase_sync_state")
    .update({
      ...values,
      updated_at: new Date().toISOString(),
    })
    .eq("id", stateId);

  if (error) {
    throw new Error(
      `Error actualizando estado de sincronización Hirebase: ${error.message}`
    );
  }
}

function getSafeCheckpoint(
  jobs: FormattedJob[]
): string | null {
  const postedDates = jobs
    .map((job) => job.posted_at)
    .filter(
      (value): value is string =>
        typeof value === "string" &&
        !Number.isNaN(
          new Date(value).getTime()
        )
    );

  if (postedDates.length === 0) {
    return null;
  }

  return postedDates.reduce(
    (latest, current) =>
      new Date(current).getTime() >
      new Date(latest).getTime()
        ? current
        : latest
  );
}

function applyCheckpointOverlap(
  checkpoint: string | null
): string | null {
  if (!checkpoint) {
    return null;
  }

  const timestamp =
    new Date(checkpoint).getTime();

  if (Number.isNaN(timestamp)) {
    return null;
  }

  return new Date(
    timestamp -
      CHECKPOINT_OVERLAP_SECONDS * 1000
  ).toISOString();
}

export async function fetchHirebaseJobs() {
  const apiKey = process.env.HIREBASE_API_KEY;

  if (!apiKey) {
    throw new Error(
      "HIREBASE_API_KEY no está configurada."
    );
  }

  const now = new Date();
  const nowIso = now.toISOString();
  const periodStart =
    getCurrentPeriodStart(now);

  const state =
    await getOrCreateSyncState(
      periodStart
    );

  const remainingQuota =
    Math.max(
      MONTHLY_QUOTA -
        state.jobs_consumed,
      0
    );

  if (remainingQuota === 0) {
    return {
      fetched: 0,
      stored: 0,
      total_count: 0,
      pages: 0,
      max_pages: MAX_PAGES_PER_SYNC,
      quota: {
        monthly_limit:
          MONTHLY_QUOTA,
        consumed:
          state.jobs_consumed,
        remaining: 0,
      },
      incremental: {
        checkpoint:
          state.last_posted_at,
        applied: Boolean(
          state.last_posted_at
        ),
        completed: false,
      },
      message:
        "Cuota mensual Hirebase agotada.",
    };
  }

  let page = 1;
  let fetched = 0;
  let stored = 0;
  let totalCount = 0;

  let latestPostedAt =
    state.last_posted_at;

  const maxResultsThisSync =
    Math.min(
      remainingQuota,
      MAX_PAGES_PER_SYNC *
        PAGE_SIZE
    );

  const postedAfter =
    applyCheckpointOverlap(
      state.last_posted_at
    );

  let syncCompleted = false;

  try {
    while (
      page <= MAX_PAGES_PER_SYNC &&
      fetched < maxResultsThisSync
    ) {
      const remainingForSync =
        maxResultsThisSync -
        fetched;

      const requestLimit =
        Math.min(
          PAGE_SIZE,
          remainingForSync
        );

      const data =
        await fetchHirebasePage(
          apiKey,
          page,
          requestLimit,
          postedAfter
        );

      const jobs = Array.isArray(
        data.jobs
      )
        ? data.jobs
        : [];

      totalCount =
        data.total_count ??
        totalCount;

      if (jobs.length === 0) {
        syncCompleted = true;
        break;
      }

      fetched += jobs.length;

      const formattedJobs =
        jobs
          .filter(
            (job) =>
              job._id &&
              job.job_title &&
              job.application_link
          )
          .map((job) =>
            formatJob(job, nowIso)
          );

      const pageCheckpoint =
        getSafeCheckpoint(
          formattedJobs
        );

      if (
        pageCheckpoint &&
        (!latestPostedAt ||
          new Date(
            pageCheckpoint
          ).getTime() >
            new Date(
              latestPostedAt
            ).getTime())
      ) {
        latestPostedAt =
          pageCheckpoint;
      }

      stored +=
        await persistHirebaseJobs(
          formattedJobs,
          nowIso
        );

      if (
  jobs.length < requestLimit
) {
  syncCompleted = true;
  break;
}

if (
  totalCount > 0 &&
  fetched >= totalCount
) {
  syncCompleted = true;
  break;
}

if (
  fetched >=
  maxResultsThisSync
) {
  break;
}

      page += 1;
    }
  } catch (error: unknown) {
    if (
      error instanceof
      HirebaseQuotaExceededError
    ) {
      /*
       * Hirebase has explicitly confirmed that the plan quota
       * is exhausted. Persist the known monthly limit so future
       * executions stop before calling the API again.
       *
       * No checkpoint is advanced because this sync did not
       * complete successfully.
       */
      await updateSyncState(
        state.id,
        {
          jobs_consumed:
            MONTHLY_QUOTA,
        }
      );

      return {
        fetched,
        stored,
        total_count:
          totalCount || fetched,
        pages: page,
        max_pages:
          MAX_PAGES_PER_SYNC,
        quota: {
          monthly_limit:
            MONTHLY_QUOTA,
          consumed:
            MONTHLY_QUOTA,
          remaining: 0,
        },
        incremental: {
          checkpoint:
            state.last_posted_at,
          applied: Boolean(
            postedAfter
          ),
          completed: false,
        },
        message:
          "Cuota mensual Hirebase agotada.",
      };
    }

    throw error;
  }

  const newConsumed =
    state.jobs_consumed +
    fetched;

  if (
    newConsumed >
    MONTHLY_QUOTA
  ) {
    throw new Error(
      "La sincronización Hirebase excedería la cuota mensual."
    );
  }

  if (syncCompleted) {
    await updateSyncState(
      state.id,
      {
        jobs_consumed:
          newConsumed,
        last_posted_at:
          latestPostedAt ??
          state.last_posted_at,
        last_successful_sync_at:
          nowIso,
      }
    );
  } else {
    await updateSyncState(
      state.id,
      {
        jobs_consumed:
          newConsumed,
      }
    );
  }

  return {
    fetched,
    stored,
    total_count:
      totalCount || fetched,
    pages: page,
    max_pages:
      MAX_PAGES_PER_SYNC,
    quota: {
      monthly_limit:
        MONTHLY_QUOTA,
      consumed:
        newConsumed,
      remaining:
        MONTHLY_QUOTA -
        newConsumed,
    },
    incremental: {
      checkpoint:
        syncCompleted
          ? latestPostedAt ??
            state.last_posted_at
          : state.last_posted_at,
      applied: Boolean(
        postedAfter
      ),
      completed:
        syncCompleted,
    },
  };
}
