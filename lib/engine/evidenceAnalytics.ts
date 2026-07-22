import {
  EvidenceAccumulationResult,
  EvidenceAnalyticsResult,
  EvidenceStrength,
  EvidenceTransparency
} from "./matchingTypes";

/**
 * Calculates the average evidence score.
 */
function calculateAverageEvidenceScore(
  evidence: EvidenceAccumulationResult[]
): number {
  if (evidence.length === 0) {
    return 0;
  }

  const totalScore = evidence.reduce(
    (total, item) => total + item.totalScore,
    0
  );

  return Math.round(totalScore / evidence.length);
}

/**
 * Calculates overall evidence coverage.
 */
function calculateCoverage(
  evidence: EvidenceAccumulationResult[],
  requiredSkills: string[]
): number {
  if (requiredSkills.length === 0) {
    return 0;
  }

  const supportedSkills = new Set(
    evidence
      .filter((item) => item.evidenceCount > 0)
      .map((item) => item.skill.toLowerCase())
  );

  const coveredSkills = requiredSkills.filter(
    (skill) =>
      supportedSkills.has(skill.toLowerCase())
  );

  return Math.round(
    (coveredSkills.length / requiredSkills.length) * 100
  );
}

/**
 * Calculates overall confidence.
 */
function calculateConfidence(
  transparency: EvidenceTransparency
): number {
  const {
    high,
    medium,
    low
  } = transparency.confidenceBreakdown;

  const totalEvidence =
    high + medium + low;

  if (totalEvidence === 0) {
    return 0;
  }

  const weightedScore =
    (high * 1) +
    (medium * 0.75) +
    (low * 0.5);

  return Math.round(
    (weightedScore / totalEvidence) * 100
  );
}

/**
 * Calculates the evidence gap.
 */
function calculateEvidenceGap(
  requiredSkills: string[],
  evidence: EvidenceAccumulationResult[]
): number {
  if (requiredSkills.length === 0) {
    return 0;
  }

  const supportedSkills = new Set(
    evidence
      .filter((item) => item.evidenceCount > 0)
      .map((item) => item.skill.toLowerCase())
  );

  const uncoveredSkills = requiredSkills.filter(
    (skill) =>
      !supportedSkills.has(skill.toLowerCase())
  );

  return Math.round(
    (uncoveredSkills.length / requiredSkills.length) * 100
  );
}

/**
 * Determines the overall evidence strength.
 */
function determineEvidenceStrength(
  score: number
): EvidenceStrength {
  if (score >= 70) {
    return "high";
  }

  if (score >= 40) {
    return "medium";
  }

  return "low";
}

/**
 * Extracts strongest supported skills.
 */
function extractStrongestSkills(
  evidence: EvidenceAccumulationResult[]
): string[] {
  return evidence
    .filter((item) => item.evidenceCount > 0)
    .sort(
      (a, b) => b.totalScore - a.totalScore
    )
    .slice(0, 5)
    .map((item) => item.skill);
}

/**
 * Extracts weakest supported skills.
 */
function extractWeakestSkills(
  evidence: EvidenceAccumulationResult[]
): string[] {
  return evidence
    .filter((item) => item.evidenceCount > 0)
    .sort(
      (a, b) => a.totalScore - b.totalScore
    )
    .slice(0, 5)
    .map((item) => item.skill);
}

/**
 * Extracts required skills without evidence.
 */
function extractMissingEvidence(
  requiredSkills: string[],
  evidence: EvidenceAccumulationResult[]
): string[] {
  const supportedSkills = new Set(
    evidence
      .filter((item) => item.evidenceCount > 0)
      .map((item) => item.skill.toLowerCase())
  );

  return requiredSkills.filter(
    (skill) =>
      !supportedSkills.has(skill.toLowerCase())
  );
}

/**
 * Builds the aggregated analytics for the Evidence Layer.
 */
export function buildEvidenceAnalytics(
  evidence: EvidenceAccumulationResult[],
  transparency: EvidenceTransparency,
  requiredSkills: string[]
): EvidenceAnalyticsResult {
  const averageEvidenceScore =
    calculateAverageEvidenceScore(evidence);

  const evidenceCoverage =
    calculateCoverage(evidence, requiredSkills);

  const confidenceScore =
    calculateConfidence(transparency);

  const evidenceGap =
    calculateEvidenceGap(requiredSkills, evidence);

  const strongestSkills =
    extractStrongestSkills(evidence);

  const weakestSkills =
    extractWeakestSkills(evidence);

  const missingEvidence =
    extractMissingEvidence(requiredSkills, evidence);

  const evidenceStrength =
    determineEvidenceStrength(averageEvidenceScore);

  return {
    totalSkillsEvaluated: evidence.length,

    totalEvidenceItems: evidence.reduce(
      (total, item) => total + item.evidenceCount,
      0
    ),

    averageEvidenceScore,

    evidenceCoverage,

    confidenceScore,

    evidenceGap,

    strongestSkills,

    weakestSkills,

    missingEvidence,

    evidenceStrength
  };
}