import { SCORING_WEIGHTS, SCORE_LIMITS } from "./weights";
import { buildMatchReasons } from "./matchReasons";

export function scoreJobs(jobs: any[], cv: any) {
  const skills = cv.skills || [];
  const industries = cv.industries || [];

  return jobs
    .map((job) => {
      let score = 0;

      const text =
        `${job.title} ${job.description} ${job.industry}`.toLowerCase();

      // Skills
      skills.forEach((skill: string) => {
        if (text.includes(skill.toLowerCase())) {
          score += SCORING_WEIGHTS.skillsMatch;
        }
      });

      // Industries
      industries.forEach((industry: string) => {
        if (text.includes(industry.toLowerCase())) {
          score += SCORING_WEIGHTS.industryMatch;
        }
      });

      // Certifications
      if (job.requires_whmis) {
        score += SCORING_WEIGHTS.certifications.whmis;
      }

      if (job.requires_csts) {
        score += SCORING_WEIGHTS.certifications.csts;
      }

      if (job.requires_first_aid) {
        score += SCORING_WEIGHTS.certifications.firstAid;
      }

      // Country bonus
      if (
        job.country &&
        SCORING_WEIGHTS.countries[
          job.country as keyof typeof SCORING_WEIGHTS.countries
        ]
      ) {
        score +=
          SCORING_WEIGHTS.countries[
            job.country as keyof typeof SCORING_WEIGHTS.countries
          ];
      }

      return {
        ...job,

        match_score: Math.min(score, SCORE_LIMITS.maxScore),

        match_reasons: buildMatchReasons(job, cv),

        match_explanation: {
          matched_skills: skills.filter((skill: string) =>
            text.includes(skill.toLowerCase())
          ),

          matched_industries: industries.filter((industry: string) =>
            text.includes(industry.toLowerCase())
          ),

          certifications: {
            whmis: job.requires_whmis,
            csts: job.requires_csts,
            first_aid: job.requires_first_aid
          }
        }
      };
    })
    .sort((a, b) => b.match_score - a.match_score);
}