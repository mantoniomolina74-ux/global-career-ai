/**
 * ============================================================
 * Global Career AI
 * Job Intelligence Contract V1.0
 * ============================================================
 *
 * Domain contract representing structured intelligence
 * extracted from a real job opportunity.
 *
 * This contract belongs to the Intelligence Core.
 * It does not belong to Dashboard.
 *
 * No business logic.
 * No persistence.
 * No generated opportunities.
 * ============================================================
 */

export type JobWorkMode =
  | "REMOTE"
  | "HYBRID"
  | "IN_PERSON"
  | "UNKNOWN";

export interface JobIntelligenceRequirement {
  name: string;

  /**
   * Requirement category as identified from the real job.
   */
    category:
    | "SKILL"
    | "EXPERIENCE"
    | "EDUCATION"
    | "CERTIFICATION"
    | "LANGUAGE"
    | "INDUSTRY"
    | "RESPONSIBILITY"
    | "OTHER";

  /**
   * Whether the requirement is explicitly stated
   * by the real job source.
   */
  explicit: boolean;

  /**
   * Source evidence supporting the requirement.
   */
  evidence: string;
}

export interface JobIntelligence {

  /**
   * Real job identifier.
   */
  id: string;

  /**
   * Real job title.
   */
  title: string;

  /**
   * Company associated with the real job.
   */
  company: string;

  /**
   * Country associated with the real job, when available.
   */
  country?: string;

  /**
   * Location associated with the real job, when available.
   */
  location?: string;

  /**
   * Work mode declared by the real job.
   */
  workMode: JobWorkMode;

  /**
   * Industry associated with the real job, when available.
   */
  industry?: string;

  /**
   * Job category associated with the real job, when available.
   */
  category?: string;

  /**
   * Skills explicitly identified from the real job.
   */
  requiredSkills: string[];

  /**
   * Industries explicitly associated with the real job.
   */
  requiredIndustries: string[];

  /**
   * Experience requirements identified from the real job.
   */
  experienceRequirements: string[];

  /**
   * Education requirements identified from the real job.
   */
  educationRequirements: string[];

  /**
   * Certification requirements identified from the real job.
   */
  certificationRequirements: string[];

  /**
   * Language requirements identified from the real job.
   */
  languageRequirements: string[];

  /**
   * Structured requirements with source evidence.
   */
  requirements: JobIntelligenceRequirement[];

  /**
   * Original job description used as intelligence evidence,
   * when available.
   */
  description?: string;

  /**
   * Original source of the real job.
   */
  source: string;

  /**
   * Original external job URL, when available.
   */
  url?: string;
}