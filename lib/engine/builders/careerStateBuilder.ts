/**
 * ============================================================
 * Global Career AI
 * Career State Builder V1.2
 * ============================================================
 *
 * Domain adapter between OrchestratorResult and CareerState.
 *
 * No business logic.
 * No persistence.
 * No engine execution.
 *
 * Responsibility:
 * Compose the Career Intelligence domain state
 * from verified engine outputs.
 * ============================================================
 */

import {
  OrchestratorResult,
} from "@/lib/engine/contracts/engineContracts";

import {
  CareerState,
} from "@/lib/engine/contracts/careerState";

import {
  buildATSState,
} from "@/lib/engine/adapters/intelligence/atsStateAdapter";

import {
  buildMatchingState,
} from "@/lib/engine/adapters/intelligence/matchingStateAdapter";

import {
  buildCompetencyState,
} from "@/lib/engine/adapters/intelligence/competencyStateAdapter";

import {
  analyzeCompetencyProfile,
} from "@/lib/knowledge/services/competencyProfileService";

import {
  buildKnowledgeState,
} from "@/lib/engine/adapters/intelligence/knowledgeStateAdapter";

import {
  analyzeKnowledgeProfile,
} from "@/lib/knowledge/services/knowledgeProfileService";

import {
  buildApplicationState,
} from "@/lib/engine/adapters/intelligence/applicationStateAdapter";

export function buildCareerState(
  result: OrchestratorResult
): CareerState {

  const competencyProfile =
    result.profile?.professionalText
      ? analyzeCompetencyProfile(
          result.profile.professionalText
        )
      : undefined;

  const knowledgeProfile =
    result.profile?.professionalText
      ? analyzeKnowledgeProfile(
          result.profile.professionalText
        ).profile
      : undefined;

  const atsState =
    buildATSState(
      result.ats
    );

  const matchingState =
    buildMatchingState(
      result.matching.items
    );

  const competencyState =
    competencyProfile
      ? buildCompetencyState(
          competencyProfile
        )
      : undefined;

  const knowledgeState =
    knowledgeProfile
      ? buildKnowledgeState(
          knowledgeProfile
        )
      : undefined;

  const applicationState =
    result.applicationInsights
      ? buildApplicationState(
          result.applicationInsights
        )
      : undefined;

  const matchedSkills = [
    ...new Set(
      atsState.matchedSkills.filter(
        (skill) =>
          typeof skill === "string" &&
          skill.trim().length > 0
      )
    ),
  ];

  const missingSkills = [
    ...new Set([
      ...atsState.missingSkills,
      ...(competencyState?.gaps ?? []),
    ].filter(
      (skill) =>
        typeof skill === "string" &&
        skill.trim().length > 0
    )),
  ];

  const recommendations = [
    ...new Set([
      atsState.recommendation,
      ...matchingState.recommendations,
    ].filter(
      (recommendation) =>
        typeof recommendation === "string" &&
        recommendation.trim().length > 0
    )),
  ];

  const requiredCertifications = [
    ...new Set(
      matchingState.opportunities.flatMap(
        (opportunity) =>
          opportunity.jobIntelligence
            ?.certificationRequirements ?? []
      ).filter(
        (certification) =>
          typeof certification === "string" &&
          certification.trim().length > 0
      )
    ),
  ];

  const improvementAreas = [
    ...new Set([
      ...atsState.missingSkills,
      ...(competencyState?.gaps ?? []),
    ].filter(
      (area) =>
        typeof area === "string" &&
        area.trim().length > 0
    )),
  ];

  const averageMatch =
    result.matching.items.length > 0
      ? Math.round(
          result.matching.items.reduce(
            (sum, item) =>
              sum + (item.match_score || 0),
            0
          ) /
          result.matching.items.length
        )
      : 0;

  return {

    readiness: {
      score: result.summary.averageATS,

      level:
        result.summary.averageATS >= 80
          ? "HIGH"
          : result.summary.averageATS >= 60
          ? "MEDIUM"
          : "LOW",

      atsScore: result.summary.averageATS,

      skillCount:
        matchedSkills.length,

      certificationCount:
      result.candidateCertificationCount,

      recommendations,
    },

    metrics: {
      averageMatch,

      topMatches:
        result.summary.topScore,

      skillsCount:
        matchedSkills.length,

      atsScore:
        result.summary.averageATS,
    },

    gapAnalysis: {
      readiness:
        result.summary.averageATS >= 80
          ? "HIGH"
          : result.summary.averageATS >= 60
          ? "MEDIUM"
          : "LOW",

      nextCareerStep:
        "UNKNOWN",

      missingSkills,

      recommendedCertifications:
        requiredCertifications,
    },

    profileIntelligence: {
      careerLevel:
        "UNKNOWN",

      marketFit:
        matchingState.score,

      improvementAreas,
    },

    intelligence: {

      ats:
        atsState,

      matching:
        matchingState,

      competency:
        competencyState,

      knowledge:
        knowledgeState,

      application:
        applicationState,

      decision:
        result.decision,

      learning:
        result.context,
    },

  };
}