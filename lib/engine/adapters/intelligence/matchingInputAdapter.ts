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
 * - Preserve domain boundaries
 *
 * No scoring logic.
 * No persistence.
 * No dashboard logic.
 * ============================================================
 */

import type {
  CareerApplication,
} from "@/lib/engine/contracts/engineContracts";


export interface MatchingInputProfile {

  skills: string[];

  industries: string[];

}


export interface MatchingJobInput {

  id: string;

  title?: string;

  description?: string;

  industry?: string;

  country?: string;

}


export function buildMatchingInput(

  applications: CareerApplication[],

  profile: MatchingInputProfile

): {

  jobs: MatchingJobInput[];

  cv: {

    skills: string[];

    industries: string[];

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

    },

  };

}