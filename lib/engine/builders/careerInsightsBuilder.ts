import { CareerState } from "../contracts/careerState";
import {
  CareerAction,
  CareerGap,
  CareerInsights,
  CareerRiskLevel,
} from "../contracts/intelligence/careerInsights";

import { calculateCareerOverallHealth } from "../intelligence/calculators/career/careerOverallHealthCalculator";

export function buildCareerInsights(
  state: CareerState
): CareerInsights {
  return {
    overallHealth: calculateCareerOverallHealth(state),
    marketReadiness: buildMarketReadiness(state),
    applicationReadiness: buildApplicationReadiness(state),
    careerMomentum: buildCareerMomentum(state),
    riskLevel: buildRiskLevel(state),
    confidence: buildConfidence(state),
    priorityGaps: buildPriorityGaps(state),
    recommendedActions: buildRecommendedActions(state),
  };
}

function buildMarketReadiness(state: CareerState): number {
  void state;
  return 0;
}

function buildApplicationReadiness(state: CareerState): number {
  void state;
  return 0;
}

function buildCareerMomentum(state: CareerState): number {
  void state;
  return 0;
}

function buildRiskLevel(
  state: CareerState
): CareerRiskLevel {
  void state;
  return "LOW";
}

function buildConfidence(state: CareerState): number {
  void state;
  return 0;
}

function buildPriorityGaps(
  state: CareerState
): CareerGap[] {
  void state;
  return [];
}

function buildRecommendedActions(
  state: CareerState
): CareerAction[] {
  void state;
  return [];
}