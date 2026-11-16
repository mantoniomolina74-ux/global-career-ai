/**
 * ============================================================
 * Global Career AI
 * Enterprise Candidate Intelligence Contract V1.0
 * ============================================================
 *
 * Contract for organization-level candidate intelligence.
 *
 * This contract composes:
 * - real candidate profile intelligence
 * - real application records
 * - real ATS intelligence
 * - real Job Intelligence
 * - real Candidate ↔ Job Intelligence
 *
 * No scoring logic is defined here.
 * ============================================================
 */

import type { ApplicationRecord } from "@/lib/engine/applications/applicationInsights";
import type { ATSResult } from "@/lib/db/repositories/atsRepository";
import type { CandidateJobIntelligence } from "@/lib/engine/contracts/intelligence/candidateJobIntelligence";

export type EnterpriseCandidateProfile = {
  fullName: string | null;
  country: string | null;
  city: string | null;
  profession: string | null;
  experienceYears: number | null;
  englishLevel: string | null;
  targetIndustry: string | null;
};

export type EnterpriseCandidateATS = {
  available: boolean;
  averageScore: number | null;
  matchedSkills: string[];
  missingSkills: string[];
  results: ATSResult[];
};

export type EnterpriseCandidateApplicationIntelligence =
  ApplicationRecord & {
    candidateJobIntelligence: CandidateJobIntelligence | null;
  };

export type EnterpriseCandidateIntelligence = {
  userId: string;

  profile: EnterpriseCandidateProfile;

  careerLevel: string;

  applications: EnterpriseCandidateApplicationIntelligence[];

  ats: EnterpriseCandidateATS;
};