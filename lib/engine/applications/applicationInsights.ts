import { supabaseServer } from "@/lib/supabase-server";
import {
  getATSResult,
} from "@/lib/db/repositories/atsRepository";

/**
 * ============================================================
 * TYPES
 * ============================================================
 */

export interface ApplicationRecord {
  id: string;
  user_id: string;
  company: string;
  role: string;
  status: string;
  created_at: string;
  updated_at: string;
  country?: string;
  industry?: string;
  required_skills?: string[];
  matched_skills?: string[];
  job_description?: string;
  cv_strength_score?: number;

  atsResult?: AtsResult;
  ats?: AtsResult;
}

interface AtsResult {
  atsScore: number;
  passProbability: number;
  interviewProbability?: number;
  offerProbability?: number;
  matchedSkills: string[];
  missingSkills: string[];
}

interface ApplicationIntelligence {
  atsScore: number | null;
  atsPassProbability: number | null;
  riskLevel: "low" | "medium" | "high" | null;
  matchedSkills: string[];
  missingSkills: string[];
}

/**
 * ============================================================
 * APPLICATION STATUS
 * ============================================================
 *
 * The product currently contains historical records using
 * different status representations.
 *
 * We normalize them inside the intelligence layer instead of
 * changing persisted data blindly.
 *
 * Canonical product statuses:
 *
 * - Saved
 * - Applied
 * - Under Review
 * - Interview Scheduled
 * - Final Interview
 * - Offer Received
 * - Hired
 * - Rejected
 * ============================================================
 */

export type ApplicationStatus =
  | "Saved"
  | "Applied"
  | "Under Review"
  | "Interview Scheduled"
  | "Final Interview"
  | "Offer Received"
  | "Hired"
  | "Rejected";

export function normalizeApplicationStatus(
  status: string
): ApplicationStatus | null {

  const normalized =
    status
      .trim()
      .toLowerCase()
      .replace(/[_-]+/g, " ")
      .replace(/\s+/g, " ");

  switch (normalized) {

    case "saved":
      return "Saved";

    case "applied":
      return "Applied";

    case "under review":
    case "in review":
      return "Under Review";

    case "interview":
    case "interview scheduled":
      return "Interview Scheduled";

    case "final interview":
      return "Final Interview";

    case "offer":
    case "offer received":
      return "Offer Received";

    case "hired":
      return "Hired";

    case "rejected":
      return "Rejected";

    default:
      return null;
  }
}

/**
 * ============================================================
 * DATA ACCESS
 * ============================================================
 */

async function fetchApplications(
  userId: string
): Promise<ApplicationRecord[]> {

  const {
    data,
    error,
  } = await supabaseServer
    .from("applications")
    .select("*")
    .eq("user_id", userId);

  if (error) {
    throw new Error(
      `Failed to fetch applications: ${error.message}`
    );
  }

  return (data || []) as ApplicationRecord[];
}

/**
 * ============================================================
 * FUNNEL ENGINE
 * ============================================================
 */

export function calculateFunnel(
  apps: ApplicationRecord[]
) {

  const safeDiv = (
    a: number,
    b: number
  ) =>
    b === 0
      ? 0
      : a / b;

  const normalizedStatuses =
    apps.map((app) => ({
      ...app,
      normalizedStatus:
        normalizeApplicationStatus(
          app.status
        ),
    }));

  const saved =
    normalizedStatuses.filter(
      (a) =>
        a.normalizedStatus === "Saved"
    ).length;

  const applied =
    normalizedStatuses.filter(
      (a) =>
        a.normalizedStatus === "Applied"
    ).length;

  const inReview =
    normalizedStatuses.filter(
      (a) =>
        a.normalizedStatus === "Under Review"
    ).length;

  const interview =
    normalizedStatuses.filter(
      (a) =>
        a.normalizedStatus === "Interview Scheduled" ||
        a.normalizedStatus === "Final Interview"
    ).length;

  const offer =
    normalizedStatuses.filter(
      (a) =>
        a.normalizedStatus === "Offer Received"
    ).length;

  const rejected =
    normalizedStatuses.filter(
      (a) =>
        a.normalizedStatus === "Rejected"
    ).length;

  return {
    total: apps.length,

    saved,

    applied,

    in_review: inReview,

    interview,

    offer,

    rejected,

    conversionRate:
      safeDiv(
        interview,
        applied
      ),

    offerRate:
      safeDiv(
        offer,
        applied
      ),

    successRate:
      safeDiv(
        offer,
        interview
      ),
  };
}

/**
 * ============================================================
 * PERFORMANCE ENGINE
 * ============================================================
 */

export function calculatePerformance(
  apps: ApplicationRecord[]
) {

  const total =
    apps.length;

  const normalizedStatuses =
    apps.map((app) =>
      normalizeApplicationStatus(
        app.status
      )
    );

  const activePipeline =
    normalizedStatuses.filter(
      (status) =>
        status === "Applied" ||
        status === "Under Review" ||
        status === "Interview Scheduled" ||
        status === "Final Interview"
    ).length;

  const responded =
    normalizedStatuses.filter(
      (status) =>
        status === "Under Review" ||
        status === "Interview Scheduled" ||
        status === "Final Interview" ||
        status === "Offer Received" ||
        status === "Hired" ||
        status === "Rejected"
    ).length;

  const rejected =
    normalizedStatuses.filter(
      (status) =>
        status === "Rejected"
    ).length;

  const responseRate =
    total === 0
      ? 0
      : responded / total;

  const rejectionRate =
    total === 0
      ? 0
      : rejected / total;

  return {
    totalApplications:
      total,

    activePipeline,

    responseRate,

    rejectionRate,
  };
}

/**
 * ============================================================
 * INSIGHTS ENGINE
 * ============================================================
 */

export async function getApplicationInsights(
  userId: string
) {

  const applications =
    await fetchApplications(
      userId
    );

  const funnel =
    calculateFunnel(
      applications
    );

  const performance =
    calculatePerformance(
      applications
    );

  /**
   * Canonical status breakdown.
   *
   * The UI can now consume stable product statuses regardless
   * of how historical records were persisted.
   */

  const statusBreakdown:
    Record<string, number> = {

    Saved: 0,

    Applied: 0,

    "Under Review": 0,

    "Interview Scheduled": 0,

    "Final Interview": 0,

    "Offer Received": 0,

    Hired: 0,

    Rejected: 0,

  };

  const applicationScores:
    Record<string, number> = {};

  const applicationIntelligence:
    Record<
      string,
      ApplicationIntelligence
    > = {};

  for (const app of applications) {

    /**
     * --------------------------------------------------------
     * STATUS
     * --------------------------------------------------------
     */

    const normalizedStatus =
      normalizeApplicationStatus(
        app.status
      );

    if (normalizedStatus) {

      statusBreakdown[
        normalizedStatus
      ] =
        (
          statusBreakdown[
            normalizedStatus
          ] ?? 0
        ) + 1;

    }

    /**
     * --------------------------------------------------------
     * ATS
     * --------------------------------------------------------
     *
     * Source of truth:
     *
     * public.ats_results
     *
     * No persisted ATS means:
     *
     * ats = null
     *
     * We do not invent intelligence.
     * --------------------------------------------------------
     */

    const persistedATS =
      await getATSResult(
        app.id
      );

    const ats =
      persistedATS ??
      app.atsResult ??
      app.ats ??
      null;

    /**
     * Compatibility score.
     *
     * Applications without ATS remain sortable at zero,
     * but applicationIntelligence.atsScore remains null.
     *
     * This allows the UI to distinguish:
     *
     * 0 = real calculated ATS score of zero
     *
     * null = ATS not calculated yet
     */

    applicationScores[
      app.id
    ] =
      ats?.atsScore ?? 0;

    applicationIntelligence[
      app.id
    ] = {

      atsScore:
        ats?.atsScore ?? null,

      atsPassProbability:
        ats?.passProbability ?? null,

      riskLevel:
        ats
          ? ats.atsScore >= 75
            ? "low"
            : ats.atsScore >= 50
              ? "medium"
              : "high"
          : null,

      matchedSkills:
        ats?.matchedSkills ?? [],

      missingSkills:
        ats?.missingSkills ?? [],

    };

  }

  return {

    funnel,

    performance,

    statusBreakdown,

    applicationScores,

    applicationIntelligence,

    meta: {

      generatedAt:
        new Date().toISOString(),

      source:
        "server-engine-v2",

    },

  };

}

/**
 * ============================================================
 * LIGHTWEIGHT HELPERS
 * ============================================================
 */

export async function getFunnelStats(
  userId: string
) {

  const apps =
    await fetchApplications(
      userId
    );

  return calculateFunnel(
    apps
  );

}

export async function getPerformanceMetrics(
  userId: string
) {

  const apps =
    await fetchApplications(
      userId
    );

  return calculatePerformance(
    apps
  );

}