import { scoreJobs } from "@/lib/engine/jobScoring";

import type {
  MatchingResult,
  MatchingResultItem,
} from "@/lib/engine/contracts/matchingContracts";

type JobMatchInput = {
  id: string;
  title?: string;
  description?: string;
  industry?: string;
  country?: string;
  category?: string;
  tags?: string;
  company?: string | null;
  location?: string | null;
  url?: string | null;
  source?: string | null;
  requires_whmis?: boolean;
  requires_csts?: boolean;
  requires_first_aid?: boolean;
};

type CandidateProfile = {
  skills?: string[];
  industries?: string[];
};

export function runJobMatchEngine(
  jobs: JobMatchInput[],
  candidate: CandidateProfile
): MatchingResult {
  const items = scoreJobs(jobs, {
    skills: candidate.skills ?? [],
    industries: candidate.industries ?? [],
  });

  return {
    items: items as MatchingResultItem[],
  };
}
