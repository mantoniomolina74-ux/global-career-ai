import { scoreJobs } from "../jobScoring";

type ScoreJobsInput = Parameters<typeof scoreJobs>;

type JobScoreInput = ScoreJobsInput[0];

type CvScoreInput = ScoreJobsInput[1];

export interface MatchingProfile {
  averageMatchScore: number;

  bestMatches: ReturnType<typeof scoreJobs>;
}

export function analyzeMatchingProfile(
  jobs: JobScoreInput,
  cv: CvScoreInput
): MatchingProfile {

  const matches =
    scoreJobs(
      jobs,
      cv
    );

  const averageMatchScore =
    matches.length > 0
      ? matches.reduce(
          (sum, job) =>
            sum + job.match_score,
          0
        ) / matches.length
      : 0;

  return {
    averageMatchScore,
    bestMatches: matches,
  };
}