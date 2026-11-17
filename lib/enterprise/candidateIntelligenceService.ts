import { getProfile } from "@/lib/engine/profile/getProfile";
import {
  getApplicationRecords,
  type ApplicationRecord,
} from "@/lib/engine/applications/applicationInsights";
import {
  getATSResultsByUser,
  type ATSResult,
} from "@/lib/db/repositories/atsRepository";
import {
  getJobById,
  type JobDetail,
} from "@/lib/jobs/getJobById";
import { getLatestCandidateCV } from "@/lib/db/repositories/cvRepository";
import {
  getActiveCandidateCertificationNames,
} from "@/lib/enterprise/certificationService";
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
  EnterpriseCandidateApplicationIntelligence,
} from "@/lib/engine/contracts/intelligence/candidateIntelligence";

/**
 * ============================================================
 * ENTERPRISE CANDIDATE INTELLIGENCE
 * ============================================================
 *
 * Composition layer for Enterprise candidate intelligence.
 *
 * This service composes real persisted candidate data from:
 *
 * - profiles
 * - applications
 * - ATS results
 * - real jobs
 * - Job Intelligence
 * - Candidate ↔ Job Intelligence
 *
 * Existing engines remain the source of their own intelligence.
 * ============================================================
 */

/**
 * Derives a descriptive career level from real experience data.
 *
 * No artificial score is generated.
 */
function deriveCareerLevel(
  experienceYears: number | null
): string {
  if (experienceYears === null) {
    return "Unknown";
  }

  if (experienceYears >= 12) {
    return "Expert";
  }

  if (experienceYears >= 8) {
    return "Senior";
  }

  if (experienceYears >= 5) {
    return "Intermediate";
  }

  if (experienceYears >= 2) {
    return "Junior";
  }

  return "Beginner";
}

/**
 * Builds Candidate ↔ Job Intelligence for one real application.
 *
 * Applications without a valid job_id or without a resolvable
 * real job remain valid applications but receive null
 * Candidate ↔ Job Intelligence.
 */
async function buildApplicationIntelligence(
  application: ApplicationRecord,
  candidateSkills: string[],
  candidateIndustries: string[],
  candidateProfessionalText: string,
  experienceYears: number | null
): Promise<EnterpriseCandidateApplicationIntelligence> {
  if (!application.job_id) {
    return {
      ...application,
      candidateJobIntelligence: null,
    };
  }

  const job = await getJobById(
    application.job_id
  );

  if (!job) {
    return {
      ...application,
      candidateJobIntelligence: null,
    };
  }

  const jobIntelligence =
    buildJobIntelligence(job);

  const candidateCertifications =
    await getActiveCandidateCertificationNames(
      application.user_id
    );

  const candidateEvidence =
    buildCandidateEvidenceForJob({
      candidateSkills,
      candidateIndustries,
      professionalText:
        candidateProfessionalText,
      candidateCertifications,
      jobText:
        jobIntelligence.description ?? "",
      experienceYears,
    });

  const candidateJobIntelligence =
    evaluateCandidateJobIntelligence(
      application.user_id,
      jobIntelligence,
      candidateEvidence
    );

  return {
    ...application,
    candidateJobIntelligence,
  };
}

/**
 * Builds Candidate Intelligence for one real user.
 *
 * Data is loaded from existing application/profile/ATS
 * persistence layers. No mock or synthetic candidate data
 * is introduced.
 */
export async function getCandidateIntelligence(
  userId: string
): Promise<EnterpriseCandidateIntelligence> {
  if (!userId) {
    throw new Error("User context is required");
  }

  const [
    profile,
    applications,
    atsResults,
    candidateCV,
  ] = await Promise.all([
    getProfile(userId),
    getApplicationRecords(userId),
    getATSResultsByUser(userId),
    getLatestCandidateCV(userId),
  ]);

  let candidateProfessionalText = "";

  if (candidateCV?.storagePath) {
    candidateProfessionalText =
      await extractPrivateCVText(
        userId,
        candidateCV.storagePath
      );
  }

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

  const atsScores =
    atsResults.map(
      (result) => result.atsScore
    );

  const averageScore =
    atsScores.length === 0
      ? null
      : Math.round(
          atsScores.reduce(
            (total, score) =>
              total + score,
            0
          ) / atsScores.length
        );

  const matchedSkills =
    Array.from(
      new Set(
        atsResults.flatMap(
          (result) =>
            result.matchedSkills
        )
      )
    );

  const missingSkills =
    Array.from(
      new Set(
        atsResults.flatMap(
          (result) =>
            result.missingSkills
        )
      )
    );

  const applicationIntelligence =
    await Promise.all(
      applications.map(
        (application) =>
          buildApplicationIntelligence(
            application,
            candidateCV?.skills ?? [],
            candidateCV?.industries ?? [],
            candidateProfessionalText,
            normalizedExperienceYears
          )
      )
    );

  return {
    userId,

    profile: {
      fullName:
        typeof profile?.full_name === "string"
          ? profile.full_name
          : null,

      country:
        typeof profile?.country === "string"
          ? profile.country
          : null,

      city:
        typeof profile?.city === "string"
          ? profile.city
          : null,

      profession:
        typeof profile?.profession === "string"
          ? profile.profession
          : null,

      experienceYears:
        normalizedExperienceYears,

      englishLevel:
        typeof profile?.english_level === "string"
          ? profile.english_level
          : null,

      targetIndustry:
        typeof profile?.target_industry === "string"
          ? profile.target_industry
          : null,
    },

    careerLevel:
      deriveCareerLevel(
        normalizedExperienceYears
      ),

    applications:
      applicationIntelligence,

    ats: {
      available:
        atsResults.length > 0,

      averageScore,

      matchedSkills,

      missingSkills,

      results:
        atsResults,
    },
  };
}
