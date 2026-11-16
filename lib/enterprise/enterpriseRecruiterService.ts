
import { getProfile } from "@/lib/engine/profile/getProfile";
import { supabaseServer } from "@/lib/supabase-server";
import {
  type ApplicationRecord,
} from "@/lib/engine/applications/applicationInsights";
import {
  getATSResult,
  type ATSResult,
} from "@/lib/db/repositories/atsRepository";
import {
  getJobById,
  type JobDetail,
} from "@/lib/jobs/getJobById";
import { getLatestCandidateCV } from "@/lib/db/repositories/cvRepository";
import {
  extractPrivateCVText,
} from "@/lib/cv/privateCVService";
import { buildJobIntelligence } from "@/lib/engine/intelligence/jobIntelligenceBuilder";
import { buildCandidateEvidenceForJob } from "@/lib/engine/intelligence/candidateEvidenceBuilder";
import { evaluateCandidateJobIntelligence } from "@/lib/engine/intelligence/candidateJobIntelligenceEvaluator";
import type {
  CandidateJobIntelligence,
} from "@/lib/engine/contracts/intelligence/candidateJobIntelligence";
import type {
  EnterpriseCandidateIntelligence,
} from "@/lib/engine/contracts/intelligence/candidateIntelligence";
import type {
  JobIntelligence,
} from "@/lib/engine/contracts/intelligence/jobIntelligence";
import {
  getOrganizationMember,
} from "@/lib/enterprise/organizationService";

/**
 * =========================================================
 * ENTERPRISE RECRUITER INTELLIGENCE
 * =========================================================
 */

export type EnterpriseRecruiterInput = {
  organizationId: string;
  jobId: string;
};

export type EnterpriseRecruiterResult = {
  organizationId: string;
  job: JobDetail | null;
  candidate: EnterpriseCandidateIntelligence | null;
  candidateJobIntelligence: CandidateJobIntelligence | null;
  decision: string;
  decisionReason: string;
  ats: ATSResult | null;
  applicationId: number | null;
  applicationStatus: string | null;
  candidateUserId: string | null;
};

async function buildCandidateJobIntelligence(
  candidateUserId: string,
  jobIntelligence: JobIntelligence
): Promise<CandidateJobIntelligence> {
  const candidateCV =
    await getLatestCandidateCV(
      candidateUserId
    );

  const profile =
    await getProfile(
      candidateUserId
    );

  const experienceYearsRaw =
    profile?.experience_years;

  const experienceYears =
    experienceYearsRaw === null ||
    experienceYearsRaw === undefined ||
    experienceYearsRaw === ""
      ? null
      : Number(experienceYearsRaw);

  const normalizedExperienceYears =
    Number.isFinite(experienceYears)
      ? experienceYears
      : null;

  let professionalText = "";

  if (candidateCV?.storagePath) {
    professionalText =
      await extractPrivateCVText(
        candidateUserId,
        candidateCV.storagePath
      );
  }

  const candidateEvidence =
    buildCandidateEvidenceForJob({
      candidateSkills:
        candidateCV?.skills ?? [],

      candidateIndustries:
        candidateCV?.industries ?? [],

      professionalText,

      candidateCertifications: [],

      jobText:
        jobIntelligence.description ?? "",

      experienceYears:
        normalizedExperienceYears,
    });

  return evaluateCandidateJobIntelligence(
    candidateUserId,
    jobIntelligence,
    candidateEvidence
  );
}

/**
 * =========================================================
 * RECRUITER DECISION
 * =========================================================
 */

function buildDecision(
  ats: ATSResult | null
): {
  decision: string;
  reason: string;
} {
  if (!ats) {
    return {
      decision: "review",
      reason:
        "ATS intelligence is not available for this application.",
    };
  }

  if (ats.atsScore >= 75) {
    return {
      decision: "shortlist",
      reason:
        "High ATS compatibility.",
    };
  }

  if (ats.atsScore >= 50) {
    return {
      decision: "review",
      reason:
        "Moderate ATS compatibility.",
    };
  }

  return {
    decision: "reject",
    reason:
      "Low ATS compatibility.",
  };
}

/**
 * =========================================================
 * MAIN SERVICE
 * =========================================================
 */

export async function getEnterpriseRecruiterIntelligence(
  input: EnterpriseRecruiterInput
) {
  const {
    organizationId,
    jobId,
  } = input;

  if (!organizationId) {
    throw new Error(
      "Organization context is required"
    );
  }

  if (!jobId) {
    throw new Error(
      "Job context is required"
    );
  }

  const job =
    await getJobById(jobId);

  if (!job) {
    throw new Error(
      "Job not found"
    );
  }

  const jobIntelligence =
    buildJobIntelligence(job);

  const { data: members, error: membersError } =
    await supabaseServer
      .from("organization_members")
      .select("user_id")
      .eq(
        "organization_id",
        organizationId
      );

  if (membersError) {
    throw new Error(
      membersError.message
    );
  }

  const memberIds =
    (members ?? []).map(
      (member) => member.user_id
    );

  const applications =
    await getApplicationRecordsForJob(
      jobId
    );

  const organizationApplications =
    applications.filter(
      (application) =>
        memberIds.includes(
          application.user_id
        )
    );

  const candidates: Array<{
    candidateUserId: string;
    applicationId: number;
    company: string;
    position: string;
    status: string;
    atsAvailable: boolean;
    atsScore: number | null;
    matchedSkills: string[];
    missingSkills: string[];
    candidateJobIntelligence: CandidateJobIntelligence;
    decision: string;
    reason: string;
  }> = [];

  let applicationsProcessed = 0;
  let atsApplicationsProcessed = 0;

  for (const application of organizationApplications) {
    applicationsProcessed += 1;

    const member =
      await getOrganizationMember(
        organizationId,
        application.user_id
      );

    if (!member) {
      continue;
    }

    const ats =
      await getATSResult(
        application.id
      );

    if (ats) {
      atsApplicationsProcessed += 1;
    }

    const decision =
      buildDecision(ats);

    const candidateJobIntelligence =
      await buildCandidateJobIntelligence(
        application.user_id,
        jobIntelligence
      );

    candidates.push({
      candidateUserId:
        application.user_id,

      applicationId:
        application.id,

      company:
        application.company,

      position:
        application.position,

      status:
        application.status,

      atsAvailable:
        ats !== null,

      atsScore:
        ats?.atsScore ?? null,

      matchedSkills:
        ats?.matchedSkills ?? [],

      missingSkills:
        ats?.missingSkills ?? [],

      candidateJobIntelligence,

      decision:
        decision.decision,

      reason:
        decision.reason,
    });
  }

  candidates.sort(
    (a, b) =>
      (b.atsScore ?? -1) -
      (a.atsScore ?? -1)
  );

  const shortlisted =
    candidates.filter(
      (candidate) =>
        candidate.decision ===
        "shortlist"
    ).length;

  const review =
    candidates.filter(
      (candidate) =>
        candidate.decision ===
        "review"
    ).length;

  const rejected =
    candidates.filter(
      (candidate) =>
        candidate.decision ===
        "reject"
    ).length;

  const atsScores =
    candidates
      .map(
        (candidate) =>
          candidate.atsScore
      )
      .filter(
        (
          score
        ): score is number =>
          typeof score ===
          "number"
      );

  const averageATS =
    atsScores.length === 0
      ? null
      : Math.round(
          atsScores.reduce(
            (total, score) =>
              total + score,
            0
          ) /
            atsScores.length
        );

  return {
    organizationId,

    job: {
      ...job,
      intelligence:
        jobIntelligence,
    },

    candidates,

    metrics: {
      candidatesProcessed:
        candidates.length,

      applicationsProcessed,

      atsApplicationsProcessed,

      shortlisted,

      review,

      rejected,

      averageATS,
    },

    meta: {
      generatedAt:
        new Date().toISOString(),

      strategy:
        "enterprise-recruiter-v1",
    },
  };
}

async function getApplicationRecordsForJob(
  jobId: string
): Promise<ApplicationRecord[]> {
  const {
    data,
    error,
  } = await supabaseServer
    .from("applications")
    .select("*")
    .eq(
      "job_id",
      jobId
    );

  if (error) {
    throw new Error(
      error.message
    );
  }

  return (data ?? []) as ApplicationRecord[];
}
