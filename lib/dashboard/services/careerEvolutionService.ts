/**
 * ============================================================
 * Global Career AI
 * Career Evolution Service V1.0
 * ============================================================
 *
 * Builds Career Evolution from existing real professional
 * intelligence.
 *
 * This service does not execute intelligence engines.
 * It does not generate historical trends.
 * It does not invent candidate evidence.
 *
 * Career Evolution is a derived Premium intelligence view
 * describing the candidate's current position, direction,
 * strengths, development areas, priority skills, and actions.
 * ============================================================
 */

import type { CareerState } from "@/lib/engine/contracts/careerState";
import type { PremiumKnowledgeInsight } from "../contracts/premiumDashboardContract";
import type { CareerEvolutionInsight } from "../contracts/careerEvolutionContract";

function uniqueStrings(
  values: string[]
): string[] {
  return Array.from(
    new Set(
      values
        .map((value) => value.trim())
        .filter(Boolean)
    )
  );
}

function buildTargetIndustries(
  careerState: CareerState
): string[] {
  return uniqueStrings(
    (
      careerState.intelligence.matching?.opportunities ?? []
    ).flatMap(
      (opportunity) =>
        opportunity.matchedIndustries
    )
  );
}

function buildStrengths(
  careerState: CareerState
): string[] {
  return uniqueStrings([
    ...(careerState.intelligence.matching?.strengths ?? []),
    ...(careerState.intelligence.competency?.strengths ?? []),
  ]);
}

function buildDevelopmentAreas(
  careerState: CareerState,
  knowledge?: PremiumKnowledgeInsight
): string[] {
  return uniqueStrings([
    ...(careerState.intelligence.matching?.weaknesses ?? []),
    ...(careerState.intelligence.competency?.gaps ?? []),
    ...(careerState.gapAnalysis.missingSkills ?? []),
    ...(knowledge?.gaps.map(
      (gap) => gap.competencyName
    ) ?? []),
  ]);
}

function buildPrioritySkills(
  knowledge?: PremiumKnowledgeInsight
): string[] {
  if (!knowledge) {
    return [];
  }

  const priorityIds =
    new Set(
      knowledge.priorities.map(
        (priority) =>
          priority.competencyId
      )
    );

  return uniqueStrings(
    knowledge.gaps
      .filter(
        (gap) =>
          priorityIds.has(
            gap.competencyId
          )
      )
      .sort(
        (a, b) =>
          b.importance - a.importance
      )
      .map(
        (gap) =>
          gap.competencyName
      )
  );
}

function buildRecommendedActions(
  careerState: CareerState
): string[] {
  return uniqueStrings([
    ...(careerState.intelligence.learning &&
    typeof careerState.intelligence.learning === "object" &&
    "recommendedActions" in
      careerState.intelligence.learning &&
    Array.isArray(
      (
        careerState.intelligence.learning as {
          recommendedActions?: unknown;
        }
      ).recommendedActions
    )
      ? (
          careerState.intelligence.learning as {
            recommendedActions: unknown[];
          }
        ).recommendedActions.filter(
          (action): action is string =>
            typeof action === "string"
        )
      : []),
    ...(careerState.readiness.recommendations ?? []),
    ...(careerState.intelligence.matching?.recommendations ?? []),
  ]);
}

export function buildCareerEvolutionInsight(
  careerState: CareerState,
  knowledge?: PremiumKnowledgeInsight
): CareerEvolutionInsight {
  return {
    currentPosition: {
      careerLevel:
        careerState.profileIntelligence.careerLevel,

      marketFit:
        careerState.profileIntelligence.marketFit,

      readinessScore:
        careerState.readiness.score,
    },

    careerDirection: {
      nextCareerStep:
        careerState.gapAnalysis.nextCareerStep,

      targetRoles:
        uniqueStrings(
          careerState.intelligence.matching?.targetRoles ?? []
        ),

      targetIndustries:
        buildTargetIndustries(
          careerState
        ),
    },

    strengths:
      buildStrengths(
        careerState
      ),

    developmentAreas:
      buildDevelopmentAreas(
        careerState,
        knowledge
      ),

    prioritySkills:
      buildPrioritySkills(
        knowledge
      ),

    recommendedActions:
      buildRecommendedActions(
        careerState
      ),
  };
}
