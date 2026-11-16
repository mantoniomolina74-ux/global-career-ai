
import { supabaseServer } from "@/lib/supabase-server";

/**
 * =========================================================
 * Global Career AI
 * CV Repository V1.1
 * =========================================================
 *
 * Source of truth:
 * public.cv_analyses
 *
 * Provides the latest real CV analysis required by
 * Enterprise Candidate Intelligence.
 *
 * CV files are referenced exclusively through storagePath.
 * The repository does not expose legacy public file URLs.
 *
 * This repository does NOT:
 * - calculate ATS
 * - calculate Matching
 * - calculate Ranking
 * - extract CV text
 * - build CandidateEvidence
 * =========================================================
 */

export type CandidateCVData = {
  skills: string[];
  industries: string[];
  storagePath: string | null;
};

/**
 * =========================================================
 * NORMALIZE STRING ARRAY
 * =========================================================
 */

function normalizeStringArray(
  value: unknown
): string[] {
  if (Array.isArray(value)) {
    return value
      .filter(
        (item): item is string =>
          typeof item === "string"
      )
      .map((item) => item.trim())
      .filter(Boolean);
  }

  if (typeof value !== "string") {
    return [];
  }

  const normalized = value.trim();

  if (!normalized) {
    return [];
  }

  try {
    const parsed = JSON.parse(normalized);

    if (Array.isArray(parsed)) {
      return parsed
        .filter(
          (item): item is string =>
            typeof item === "string"
        )
        .map((item) => item.trim())
        .filter(Boolean);
    }
  } catch {
    // Fall back to comma-separated values.
  }

  return normalized
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);
}

/**
 * =========================================================
 * FETCH LATEST CV ANALYSIS
 * =========================================================
 *
 * Returns only the latest real persisted CV analysis
 * belonging to the candidate.
 *
 * No artificial candidate data is generated.
 * =========================================================
 */

export async function getLatestCandidateCV(
  userId: string
): Promise<CandidateCVData | null> {
  if (!userId) {
    return null;
  }

  const {
    data,
    error,
  } = await supabaseServer
    .from("cv_analyses")
    .select("skills, industries, storage_path")
    .eq("user_id", userId)
    .order("created_at", {
      ascending: false,
    })
    .limit(1)
    .maybeSingle();

  if (error || !data) {
    console.log(
      "[getLatestCandidateCV]",
      JSON.stringify({
        userId,
        userIdType: typeof userId,
        userIdLength: userId.length,
        error,
        data,
      })
    );

    return null;
  }

  return {
    skills: normalizeStringArray(data.skills),

    industries: normalizeStringArray(data.industries),

    storagePath:
      typeof data.storage_path === "string" &&
      data.storage_path.trim()
        ? data.storage_path.trim()
        : null,
  };
}
