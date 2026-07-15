import {
  DecisionOutput,
  RankingResultItem,
} from "../engineContracts";

/**
 * ============================================================
 * Decision Resolver V2 (Rank-Aware + Stable Logic)
 * ============================================================
 */

export type DecisionInput = RankingResultItem & {
  rank?: number;
  total?: number;
  contextScore?: number;
  missingSkills?: string[];
};

/**
 * ============================================================
 * CORE DECISION ENGINE
 * ============================================================
 */

export function resolveDecision(input: DecisionInput): DecisionOutput {
  const score = Number(input.finalScore);

  const rankWeight = input.rank && input.total
    ? 1 - (input.rank - 1) / input.total
    : 0.5;

  const contextBonus = input.contextScore || 0;

  /**
   * ============================================================
   * GLOBAL SCORE (RANK-AWARE FUSION)
   * ============================================================
   */
  const globalScore = Math.round(
    score * 0.7 +
    rankWeight * 100 * 0.2 +
    contextBonus * 0.1
  );

  /**
   * ============================================================
   * DECISION LOGIC (STABLE THRESHOLDS)
   * ============================================================
   */

  let decision: DecisionOutput["decision"] = "REJECT";
  let priority: DecisionOutput["priority"] = "LOW";
  const reasoning: string[] = [];

  if (globalScore >= 85) {
    decision = "INTERVIEW";
    priority = "HIGH";
    reasoning.push("Top tier candidate in ranking distribution");
  } else if (globalScore >= 70) {
    decision = "SHORTLIST";
    priority = "MEDIUM";
    reasoning.push("Competitive candidate with strong alignment");
  } else {
    decision = "REJECT";
    priority = "LOW";
    reasoning.push("Below hiring threshold after ranking normalization");
  }

  /**
   * ============================================================
   * SIGNAL ENHANCEMENT
   * ============================================================
   */

  if (input.missingSkills?.length) {
    reasoning.push(
      `Skill gaps: ${input.missingSkills.slice(0, 3).join(", ")}`
    );
  }

  /**
   * ============================================================
   * OUTPUT
   * ============================================================
   */

  return {
    applicationId: String(input.applicationId),
    decision,
    priority,
    score: globalScore,
    reasoning,
  };
}