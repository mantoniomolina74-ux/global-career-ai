import { evaluateEvidence } from "./evidenceEvaluator";
import {
  CandidateEvidence,
  EvidenceAccumulationResult
} from "./matchingTypes";
import { EVIDENCE_WEIGHTS } from "./weights";

export function accumulateEvidence(
  skill: string,
  evidences: CandidateEvidence[]
): EvidenceAccumulationResult {
  let totalScore = 0;

  let contributingEvidence = 0;

  const transparency = {
    relevanceBreakdown: {
      direct: 0,
      related: 0,
      transferable: 0,
      irrelevant: 0
    },

    confidenceBreakdown: {
      high: 0,
      medium: 0,
      low: 0
    },

    sourceBreakdown: {} as Record<string, number>,

    evidenceTypeBreakdown: {} as Record<string, number>
  };

  evidences.forEach((evidence, index) => {
    const evaluation = evaluateEvidence(evidence);

    transparency.relevanceBreakdown[evidence.relevance]++;

    transparency.confidenceBreakdown[evidence.confidence]++;

    transparency.sourceBreakdown[evidence.source] =
      (transparency.sourceBreakdown[evidence.source] || 0) + 1;

    transparency.evidenceTypeBreakdown[evidence.evidenceType] =
      (transparency.evidenceTypeBreakdown[evidence.evidenceType] || 0) + 1;

    const diminishingFactor =
      Math.pow(
        EVIDENCE_WEIGHTS.accumulation.diminishingReturns,
        index
      );

    const adjustedScore =
      evaluation.score * diminishingFactor;

    if (adjustedScore > 0) {
      contributingEvidence++;
    }

    totalScore += adjustedScore;
  });

  const finalScore = Math.min(
    Math.round(totalScore),
    EVIDENCE_WEIGHTS.limits.maxSkillEvidenceScore
  );

  return {
    skill,

    totalScore: finalScore,

    evidenceCount: evidences.length,

    contributingEvidence,

    explanation:
      `${contributingEvidence} contributing evidences ` +
      `from ${evidences.length} evaluated items`,

    transparency
  };
}