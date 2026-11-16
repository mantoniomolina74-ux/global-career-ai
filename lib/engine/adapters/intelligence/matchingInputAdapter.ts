/**
 * ============================================================
 * Global Career AI
 * Matching Input Adapter V1.2
 * ============================================================
 *
 * Transforms CareerApplication input into Matching Engine input.
 *
 * Responsibilities:
 * - Normalize application data
 * - Preserve real job information
 * - Preserve candidate profile information
 * - Preserve professional CV text
 * - Preserve domain boundaries
 * - Preserve Job Intelligence derived from the real job
 *
 * No scoring logic.
 * No persistence.
 * No dashboard logic.
 * ============================================================
 */

import type {
  CareerApplication,
} from "@/lib/engine/contracts/engineContracts";

import type {
  JobIntelligence,
} from "@/lib/engine/contracts/intelligence/jobIntelligence";

export interface MatchingInputProfile {
  skills: string[];

  industries: string[];

  candidateCertifications: string[];

  professionalText?: string;
}

export interface MatchingJobInput {
  id: string;

  title?: string;

  description?: string;

  industry?: string;

  country?: string;

  category?: string;

  tags?: string;

  /**
   * ============================================================
   * JOB INTELLIGENCE
   * ============================================================
   *
   * Structured intelligence derived from the real job.
   *
   * The adapter only transports this information.
   * It does not calculate, modify, or interpret it.
   */

  jobIntelligence?: JobIntelligence;
}

export function buildMatchingInput(
  applications: CareerApplication[],
  profile: MatchingInputProfile
): {
  jobs: MatchingJobInput[];

  cv: {
    skills: string[];

    industries: string[];

    candidateCertifications: string[];

    professionalText: string;
  };
} {
  return {
    /**
     * ============================================================
     * REAL JOB INPUT
     * ============================================================
     *
     * Preserve real job information carried by the application.
     *
     * These fields are consumed by the Matching Engine and later
     * become evidence for MatchingState.
     */

    jobs: applications.map(
      (application) => ({
        id:
          application.applicationId,

        title:
          application.title,

        description:
          application.jobDescription ?? "",

        industry:
          application.industry,

        country:
          application.country,

        category:
          application.category,

        tags:
          application.tags,

        /**
         * Preserve the structured intelligence already derived
         * from the real job.
         */
        jobIntelligence:
          application.jobIntelligence,
      })
    ),

    /**
     * ============================================================
     * CANDIDATE PROFILE
     * ============================================================
     */

    cv: {
      skills:
        profile.skills,

      industries:
        profile.industries,

      candidateCertifications:
        profile.candidateCertifications,

      professionalText:
        profile.professionalText ?? "",
    },
  };
}