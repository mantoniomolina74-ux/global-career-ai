/**
 * Career Insights Weights V1.1
 *
 * Defines the relative contribution of each intelligence domain
 * when computing high-level career insights.
 *
 * The weights must always sum to 1.0 (100%).
 */

export const CAREER_INSIGHTS_WEIGHTS = {
  ats: 0.30,
  matching: 0.30,
  competency: 0.25,
  knowledge: 0.15,
} as const;

/**
 * Validation constant.
 * Used to verify weight consistency during development.
 */
export const CAREER_INSIGHTS_TOTAL_WEIGHT =
  Object.values(CAREER_INSIGHTS_WEIGHTS)
    .reduce((sum, weight) => sum + weight, 0);