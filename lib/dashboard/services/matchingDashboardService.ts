/**
 * ============================================================
 * Global Career AI
 * Matching Dashboard Service V1.2
 * ============================================================
 *
 * Source of truth:
 *
 * cv_analyses
 *      +
 * public.jobs (Hirebase)
 *
 * Responsibilities:
 * - Load the user's latest real CV analysis
 * - Load real Hirebase jobs
 * - Execute the Matching Engine
 * - Transform Matching Engine output into Dashboard contract
 *
 * No demo data.
 * No fake scores.
 * No persistence.
 * No dashboard business logic.
 * ============================================================
 */

import { supabaseServer } from "@/lib/supabase-server";

import {
  runJobMatchEngine,
} from "@/lib/engine/jobs/jobMatchEngine";

import type {
  MatchingInsight,
} from "../contracts/dashboardContract";


export interface MatchingDashboardContext {

  userId: string;

  tenantId: string;

}


export async function getMatchingDashboardInsight(
  context: MatchingDashboardContext
): Promise<MatchingInsight> {

  /**
   * ============================================================
   * STEP 1 — Latest real CV analysis
   * ============================================================
   */

  const {
    data: cv,
    error: cvError,
  } = await supabaseServer
    .from("cv_analyses")
    .select(
      "id, skills, industries"
    )
    .eq(
      "user_id",
      context.userId
    )
    .order(
      "created_at",
      {
        ascending: false,
      }
    )
    .limit(1)
    .maybeSingle();

  console.log("[MATCHING CV DEBUG]", {
    userId: context.userId,
    cvFound: !!cv,
    cvId: cv?.id ?? null,
    skills: cv?.skills ?? null,
    industries: cv?.industries ?? null,
  });

  if (cvError) {

    throw new Error(
      `Error obteniendo CV para Matching: ${cvError.message}`
    );

  }


  /**
   * No CV means no Matching yet.
   *
   * We do not invent a profile.
   */

  if (!cv) {

    return {
      matchScore: 0,
      targetRoles: [],
      alignmentFactors: [],
    };

  }


  const skills =
    Array.isArray(cv.skills)
      ? cv.skills.filter(
          (value): value is string =>
            typeof value === "string"
        )
      : [];


  const industries =
    Array.isArray(cv.industries)
      ? cv.industries.filter(
          (value): value is string =>
            typeof value === "string"
        )
      : [];


  /**
   * ============================================================
   * STEP 2 — Real Hirebase jobs
   * ============================================================
   */

  const {
    data: jobs,
    error: jobsError,
  } = await supabaseServer
    .from("jobs")
    .select("*")
    .eq(
      "source",
      "hirebase"
    );

  console.log("[MATCHING JOBS DEBUG]", {
    userId: context.userId,
    jobsFound: jobs?.length ?? 0,
    firstJob: jobs?.[0]
      ? {
          id: jobs[0].id,
          title: jobs[0].title,
          country: jobs[0].country,
          source: jobs[0].source,
        }
      : null,
  });

  if (jobsError) {

    throw new Error(
      `Error obteniendo empleos para Matching: ${jobsError.message}`
    );

  }


  if (!jobs || jobs.length === 0) {

    return {
      matchScore: 0,
      targetRoles: [],
      alignmentFactors: [],
    };

  }


  /**
   * ============================================================
   * STEP 3 — Matching Engine
   * ============================================================
   */

  const result =
    runJobMatchEngine(
      jobs,
      {
        skills,
        industries,
      }
    );

  console.log("[MATCHING DASHBOARD DEBUG]", {
    userId: context.userId,
    cvId: cv.id,
    skills,
    industries,
    jobsCount: jobs.length,
    firstJob: jobs[0]
      ? {
          id: jobs[0].id,
          title: jobs[0].title,
          country: jobs[0].country,
          source: jobs[0].source,
        }
      : null,
    resultCount: result.items.length,
    firstResults: result.items.slice(0, 5).map((item) => ({
      id: item.id,
      title: item.title,
      country: item.country,
      match_score: item.match_score,
    })),
  });

  if (
    !result.items ||
    result.items.length === 0
  ) {

    return {
      matchScore: 0,
      targetRoles: [],
      alignmentFactors: [],
    };

  }


  /**
   * ============================================================
   * STEP 4 — Dashboard projection
   * ============================================================
   *
   * The Matching Engine evaluates all real jobs.
   *
   * The Dashboard score represents the quality of the
   * strongest real opportunities, not the average across
   * every available job.
   *
   * Therefore the score is calculated from the top 5 matches.
   */

  const topMatches =
    result.items.slice(0, 5);


  const matchScore =
    Math.round(
      topMatches.reduce(
        (sum, item) =>
          sum + item.match_score,
        0
      ) /
      topMatches.length
    );


  const targetRoles =
    topMatches
      .map(
        (item) =>
          item.title
      )
      .filter(
        (title): title is string =>
          typeof title === "string" &&
          title.trim().length > 0
      );


  const alignmentFactors =
    [
      ...new Set(
        topMatches.flatMap(
          (item) =>
            item.match_explanation
              ?.matched_skills ?? []
        )
      ),
    ];


  return {

    matchScore,

    targetRoles,

    alignmentFactors,

  };

}
