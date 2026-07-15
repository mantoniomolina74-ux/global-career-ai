import { saveATSResult } from "@/lib/db/repositories/atsRepository";
import { getLearningWeights } from "@/lib/engine/learning/learningWeights.bridge";

/* =========================================================
   SKILL EXTRACTION
========================================================= */

function extractSkills(text: string): string[] {
  if (!text) return [];

  const keywords = [
    "javascript",
    "typescript",
    "react",
    "reactjs",
    "nextjs",
    "node",
    "nodejs",
    "python",
    "sql",
    "aws",
    "docker",
    "kubernetes",
    "machine learning",
    "data analysis",
    "project management",
    "git",
    "ci/cd",
  ];

  const lower = text.toLowerCase();

  return keywords.filter((skill) =>
    lower.includes(skill.toLowerCase())
  );
}

/* =========================================================
   HELPERS
========================================================= */

function clamp(n: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, n));
}

function semanticSimilarity(a: string, b: string): number {
  const A = a.toLowerCase();
  const B = b.toLowerCase();

  if (A === B) return 1;

  if (A.length > 3 && B.length > 3) {
    if (A.includes(B) || B.includes(A)) return 0.75;
  }

  const aTokens = A.split(" ");
  const bTokens = B.split(" ");

  const overlap = aTokens.filter((t) => bTokens.includes(t)).length;
  const maxLen = Math.max(aTokens.length, bTokens.length);

  return maxLen === 0 ? 0 : overlap / maxLen;
}

function fuzzyMatch(skill: string, candidateSkills: string[]): boolean {
  const s = skill.toLowerCase().trim();

  return candidateSkills.some((c) => {
    const candidate = c.toLowerCase().trim();

    if (s === candidate) return true;
    if (s.length > 3 && candidate.includes(s)) return true;
    if (candidate.length > 3 && s.includes(candidate)) return true;

    return semanticSimilarity(s, candidate) >= 0.72;
  });
}

/* =========================================================
   ENGINE
========================================================= */

export async function calculateATS(
  requiredSkills: string[] = [],
  candidateSkills: string[] = [],
  jobDescription: string = "",
  cvStrengthScore: number = 50,
  feedback?: {
    outcome?: "hired" | "rejected";
  },
  meta?: {
    userId?: string;
    applicationId?: string;
  }
) {
  const startTime = Date.now();

  const required = [...new Set(requiredSkills.map((s) => s.toLowerCase()))];
  const candidate = candidateSkills.map((s) => s.toLowerCase());

  const extractedSkills = extractSkills(jobDescription);
  const mergedRequired = [...new Set([...required, ...extractedSkills])].slice(0, 20);

  /**
   * =========================================================
   * LEARNING WEIGHTS (GLOBAL BOUNDARY SYSTEM)
   * =========================================================
   */
  const weights = getLearningWeights();

  let weightedTotal = 0;
  let weightedMatched = 0;

  const matchedSkills: string[] = [];
  const missingSkills: string[] = [];

  for (const skill of mergedRequired) {
    const weight = 1; // skill-level weighting disabled for stability
    weightedTotal += weight;

    if (fuzzyMatch(skill, candidate)) {
      matchedSkills.push(skill);
      weightedMatched += weight;
    } else {
      missingSkills.push(skill);
    }
  }

  const rawKeywordScore =
    weightedTotal > 0
      ? Math.round((weightedMatched / weightedTotal) * 100)
      : 0;

  /**
   * =========================================================
   * STABLE LEARNING ADJUSTMENT (NO EXPLOSION RISK)
   * =========================================================
   */
  const adjustedKeywordScore = Math.min(
    100,
    rawKeywordScore * (0.85 + (weights.atsMultiplier - 1) * 0.5)
  );

  const cvFactor = clamp(cvStrengthScore, 0, 100);

  const atsScore = Math.round(
    adjustedKeywordScore * 0.75 + cvFactor * 0.25
  );

  const semanticScore = Math.round(
    semanticSimilarity(mergedRequired.join(" "), jobDescription) * 100
  );

  const interviewProbability = Math.round(
    clamp(atsScore * 0.6 + semanticScore * 0.4, 0, 100)
  );

  const offerProbability = Math.round(interviewProbability * 0.75);

  const hiringScore = Math.round(
    atsScore * 0.4 + interviewProbability * 0.4 + offerProbability * 0.2
  );

  const learningSignal = Math.round((hiringScore + semanticScore) / 2);

  const result = {
    atsScore,
    keywordScore: adjustedKeywordScore,
    cvStrengthScore: cvFactor,
    semanticScore,
    interviewProbability,
    offerProbability,
    hiringScore,
    passProbability: clamp(Math.round(atsScore * 0.85), 0, 100),
    matchedSkills,
    missingSkills,
    recommendation:
      missingSkills.length > 0
        ? `Skill gaps detected: ${missingSkills.join(", ")}`
        : hiringScore >= 80
        ? "High hiring probability"
        : hiringScore >= 60
        ? "Moderate profile"
        : hiringScore >= 40
        ? "Developing candidate"
        : "Low probability - optimization required",
    learningSignal,
  };

  const metadata = {
    engine: "ATS",
    version: "2.0-learning",
    generatedAt: new Date().toISOString(),
    executionTimeMs: Date.now() - startTime,
  };

  if (meta?.userId && meta?.applicationId) {
    await saveATSResult(meta.userId, meta.applicationId, result);
  }

  return {
    data: result,
    metadata,
    success: true,
  };
}