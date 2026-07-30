/**
 * ============================================================
 * Global Career AI
 * Career State Contract V1.1
 * ============================================================
 *
 * Single Source of Truth for Career Intelligence.
 *
 * This contract represents the complete professional state
 * of a candidate after all intelligence engines have been
 * composed.
 *
 * This is a Domain Contract.
 * No business logic belongs here.
 * ============================================================
 */

export interface CareerState {
  readiness: CareerReadiness;

  metrics: CareerMetrics;

  gapAnalysis: CareerGapAnalysis;

  profileIntelligence: CareerProfileIntelligence;

  intelligence: CareerIntelligence;
}

export interface CareerReadiness {
  score: number;

  level: string;

  atsScore: number;

  skillCount: number;

  certificationCount: number;

  recommendations: string[];
}

export interface CareerMetrics {
  averageMatch: number;

  topMatches: number;

  skillsCount: number;

  atsScore: number;
}

export interface CareerGapAnalysis {
  readiness: string;

  nextCareerStep: string;

  missingSkills: string[];

  recommendedCertifications: string[];
}

export interface CareerProfileIntelligence {
  careerLevel: string;

  marketFit: number;

  improvementAreas: string[];
}

export interface CareerIntelligence {
  ats?: unknown;

  matching?: unknown;

  competency?: unknown;

  knowledge?: unknown;

  learning?: unknown;

  decision?: unknown;
}