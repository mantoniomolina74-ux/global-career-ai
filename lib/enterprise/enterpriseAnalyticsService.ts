/**
 * ============================================================
 * Global Career AI
 * Enterprise Analytics Service V1.0
 * ============================================================
 *
 * Builds organizational analytics from real persisted
 * Enterprise intelligence.
 *
 * No fake candidates.
 * No artificial scores.
 * No Premium dashboard dependency.
 * No authorization logic.
 * ============================================================
 */

import {
  createSupabaseServerAuth,
} from "@/lib/supabase/server";

import {
  getATSResult,
} from "@/lib/db/repositories/atsRepository";

import {
  getJobById,
} from "@/lib/jobs/getJobById";

import type {
  EnterpriseAnalyticsContract,
} from "./enterpriseAnalyticsContract";


interface EnterpriseAnalyticsInput {
  organizationId: string;
}


interface EnterpriseMemberRecord {
  user_id: string;
}


interface EnterpriseApplicationRecord {
  id: number;
  user_id: string;
  job_id: string | null;
}


interface EnterpriseDecisionCounts {
  shortlisted: number;
  review: number;
  rejected: number;
}


function calculateDecision(
  atsScore: number
): keyof EnterpriseDecisionCounts {

  if (atsScore >= 75) {
    return "shortlisted";
  }

  if (atsScore >= 50) {
    return "review";
  }

  return "rejected";
}


function calculateAverage(
  scores: number[]
): number | null {

  if (scores.length === 0) {
    return null;
  }

  const total =
    scores.reduce(
      (sum, score) => sum + score,
      0
    );

  return Math.round(
    total / scores.length
  );
}


export async function getEnterpriseAnalytics(
  input: EnterpriseAnalyticsInput
): Promise<EnterpriseAnalyticsContract> {

  const organizationId =
    input.organizationId?.trim();

  if (!organizationId) {
    throw new Error(
      "organizationId is required"
    );
  }


  const supabase =
    await createSupabaseServerAuth();


  const {
    data: members,
    error: membersError,
  } = await supabase
    .from("organization_members")
    .select("user_id")
    .eq(
      "organization_id",
      organizationId
    );

  if (membersError) {
    throw new Error(
      `Failed to fetch organization members: ${membersError.message}`
    );
  }


  const candidateUserIds =
    Array.from(
      new Set(
        ((members || []) as EnterpriseMemberRecord[])
          .map(
            (member) =>
              member.user_id
          )
          .filter(Boolean)
      )
    );


  if (candidateUserIds.length === 0) {
    return {
      organizationId,

      candidates: {
        candidatesProcessed: 0,
      },

      applications: {
        applicationsProcessed: 0,
        atsApplicationsProcessed: 0,
        atsCoverageRate: 0,
      },

      ats: {
        averageScore: null,
      },

      decisions: {
        shortlisted: 0,
        review: 0,
        rejected: 0,
      },

      ranking: {
        available: false,
      },

      meta: {
        generatedAt:
          new Date().toISOString(),

        strategy:
          "enterprise-analytics-v1",
      },
    };
  }


  const {
    data: applications,
    error: applicationsError,
  } = await supabase
    .from("applications")
    .select(
      "id, user_id, job_id"
    )
    .in(
      "user_id",
      candidateUserIds
    );


  if (applicationsError) {
    throw new Error(
      `Failed to fetch organization applications: ${applicationsError.message}`
    );
  }


  const applicationRecords =
    (applications || []) as EnterpriseApplicationRecord[];


  const decisionCounts: EnterpriseDecisionCounts = {
    shortlisted: 0,
    review: 0,
    rejected: 0,
  };


  const atsScores: number[] = [];


  let atsApplicationsProcessed = 0;


  for (
    const application
    of applicationRecords
  ) {

    if (!application.job_id) {
      continue;
    }


    const job =
      await getJobById(
        application.job_id
      );


    if (!job) {
      continue;
    }


    const ats =
      await getATSResult(
        application.id
      );


    if (!ats) {
      continue;
    }


    atsApplicationsProcessed += 1;

    atsScores.push(
      ats.atsScore
    );


    const decision =
      calculateDecision(
        ats.atsScore
      );

    decisionCounts[decision] += 1;
  }


  const applicationsProcessed =
    applicationRecords.length;


  const atsCoverageRate =
    applicationsProcessed === 0
      ? 0
      : Math.round(
          (
            atsApplicationsProcessed /
            applicationsProcessed
          ) *
            100
        );


  return {

    organizationId,

    candidates: {
      candidatesProcessed:
        candidateUserIds.length,
    },

    applications: {
      applicationsProcessed,

      atsApplicationsProcessed,

      atsCoverageRate,
    },

    ats: {
      averageScore:
        calculateAverage(
          atsScores
        ),
    },

    decisions: {
      shortlisted:
        decisionCounts.shortlisted,

      review:
        decisionCounts.review,

      rejected:
        decisionCounts.rejected,
    },

    ranking: {
      available:
        atsApplicationsProcessed > 0,
    },

    meta: {
      generatedAt:
        new Date().toISOString(),

      strategy:
        "enterprise-analytics-v1",
    },
  };
}