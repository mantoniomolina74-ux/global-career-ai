import { scoringPipelineV2 } from "@/lib/domain/applications/scoringPipeline";

/**
 * =========================================================
 * TYPES
 * =========================================================
 */

export interface RecruiterCandidate {
  applicationId: string;
  company?: string;
  position?: string;
  jobDescription: string;
  requiredSkills?: string[];
  candidateSkills?: string[];
  cvStrengthScore?: number;
}

export interface RecruiterInput {
  userId: string;
  organizationId: string;

  jobId?: string;

  jobTitle?: string;
  jobDescription: string;

  candidates: RecruiterCandidate[];
}

export interface CandidateDecision {
  applicationId: string;
  score: number;

  decision: "shortlist" | "review" | "reject";

  reason: string;
  details?: unknown;
}

export interface RecruiterOutput {
  jobId?: string;

  shortlisted: CandidateDecision[];
  review: CandidateDecision[];
  rejected: CandidateDecision[];

  topCandidate: CandidateDecision | null;

  metrics: {
    total: number;
    avgScore: number;
    shortlistRate: number;
  };
}

/**
 * =========================================================
 * RECRUITER AGENT (V2 CLEAN + ORGANIZATION SCOPED)
 * =========================================================
 */

export async function runRecruiterAgent(
  input: RecruiterInput
): Promise<RecruiterOutput> {
  const {
    userId,
    organizationId: _organizationId,
    jobId,
    jobDescription,
    candidates,
  } = input;

  const scored: CandidateDecision[] = [];

  /**
   * =====================================================
   * STEP 1 — SCORE ALL CANDIDATES (ROBUST PIPELINE)
   * =====================================================
   */

  for (const c of candidates) {
    try {
      const result = await scoringPipelineV2({
        userId,
        applicationId: c.applicationId,
        company: c.company,
        position: c.position,
        jobDescription: jobDescription || c.jobDescription,
        requiredSkills: c.requiredSkills,
        candidateSkills: c.candidateSkills,
        cvStrengthScore: c.cvStrengthScore,
      });

      const score = result.atsScore;

      let decision: CandidateDecision["decision"] = "review";
      let reason = "Moderate fit";

      if (score >= 75) {
        decision = "shortlist";
        reason = "High ATS match";
      } else if (score < 50) {
        decision = "reject";
        reason = "Low compatibility";
      }

      scored.push({
        applicationId: c.applicationId,
        score,
        decision,
        reason,
        details: result,
      });
    } catch (err) {
      console.error(
        "[recruiterAgent] scoring failed:",
        c.applicationId,
        err
      );
    }
  }

  /**
   * =====================================================
   * STEP 2 — SORT BY SCORE
   * =====================================================
   */

  const sorted = scored.sort((a, b) => b.score - a.score);

  const shortlisted = sorted.filter((c) => c.decision === "shortlist");
  const review = sorted.filter((c) => c.decision === "review");
  const rejected = sorted.filter((c) => c.decision === "reject");

  /**
   * =====================================================
   * STEP 3 — TOP CANDIDATE
   * =====================================================
   */

  const topCandidate = sorted.length > 0 ? sorted[0] : null;

  /**
   * =====================================================
   * STEP 4 — METRICS
   * =====================================================
   */

  const total = sorted.length;

  const avgScore =
    total === 0
      ? 0
      : sorted.reduce((acc, c) => acc + c.score, 0) / total;

  const shortlistRate =
    total === 0 ? 0 : shortlisted.length / total;

  /**
   * =====================================================
   * OUTPUT
   * =====================================================
   */

  return {
    jobId,

    shortlisted,
    review,
    rejected,

    topCandidate,

    metrics: {
      total,
      avgScore: Math.round(avgScore),
      shortlistRate,
    },
  };
}