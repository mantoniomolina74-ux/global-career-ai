/**
 * ============================================================
 * Global Career AI
 * Matching Input Adapter V1.1
 * ============================================================
 *
 * Transforms CareerApplication input into Matching Engine input.
 *
 * Responsibilities:
 * - Normalize application data
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
    jobs: applications.map(
      (application) => ({
        id: application.applicationId,

        description:
          application.jobDescription ?? "",
      })
    ),

    cv: {
      skills: profile.skills,

      industries: profile.industries,
    },
  };
}