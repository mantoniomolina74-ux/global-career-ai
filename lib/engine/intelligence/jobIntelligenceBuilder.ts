import type {
  ATSRequirement,
  ATSRequirementCategory,
} from "@/lib/engine/contracts/engineContracts";

import type {
  JobDetail,
} from "@/lib/jobs/getJobById";

import type {
  JobIntelligence,
  JobIntelligenceRequirement,
  JobWorkMode,
} from "@/lib/engine/contracts/intelligence/jobIntelligence";

import {
  extractPremiumATSRequirements,
} from "@/lib/engine/applications/premiumATSRequirementExtractor";

/**
 * ============================================================
 * Global Career AI
 * Job Intelligence Builder V1.0
 * ============================================================
 *
 * Builds structured Job Intelligence from a real job opportunity.
 *
 * Responsibilities:
 * - Preserve real job source data.
 * - Reuse the existing Premium ATS requirement extractor.
 * - Transform ATS requirements into Job Intelligence requirements.
 * - Detect work mode only when supported by explicit job evidence.
 *
 * Does NOT:
 * - calculate ATS scores
 * - calculate Matching scores
 * - calculate Ranking
 * - generate opportunities
 * - persist data
 * - invent missing job information
 *
 * ============================================================
 */

function normalizeValue(
  value: string | null | undefined
): string {
  return (value ?? "").trim();
}


function normalizeCategory(
  category: ATSRequirementCategory
): JobIntelligenceRequirement["category"] {
  switch (category) {
    case "technical":
      return "SKILL";
    case "experience":
      return "EXPERIENCE";
    case "education":
      return "EDUCATION";
    case "certification":
      return "CERTIFICATION";
    case "language":
      return "LANGUAGE";
    case "domain":
      return "INDUSTRY";
    case "responsibility":
      return "RESPONSIBILITY";
    case "soft_skill":
    default:
      return "OTHER";
  }
}


function buildRequirement(
  requirement: ATSRequirement
): JobIntelligenceRequirement {
  return {
    name: requirement.requirement,
    category: normalizeCategory(
      requirement.category
    ),
    explicit: true,
    evidence: requirement.context,
  };
}


function detectWorkMode(
  job: JobDetail
): JobWorkMode {
  const location = normalizeValue(job.location);
  const description = normalizeValue(job.description);

  const text = `${location}\n${description}`.toLowerCase();

  const hasRemote =
    /\bremote\b|\bfully remote\b|\bwork from home\b|\bworking remotely\b/.test(
      text
    );

  const hasHybrid =
    /\bhybrid\b|\bhybrid work\b|\bhybrid position\b|\bhybrid role\b/.test(
      text
    );

  const hasInPerson =
    /\bin[\s-]?person\b|\bon[\s-]?site\b|\bonsite\b|\bwork on site\b|\bfully onsite\b/.test(
      text
    );

  if (hasHybrid) {
    return "HYBRID";
  }

  if (hasRemote) {
    return "REMOTE";
  }

  if (hasInPerson) {
    return "IN_PERSON";
  }

  return "UNKNOWN";
}


export function buildJobIntelligence(
  job: JobDetail
): JobIntelligence {
  const requirements =
    extractPremiumATSRequirements(
      normalizeValue(job.description)
    );

  const intelligenceRequirements =
    requirements.map(buildRequirement);

  return {
    id: job.id,
    title: normalizeValue(job.title),
    company: normalizeValue(job.company),
    country: normalizeValue(job.country) || undefined,
    location: normalizeValue(job.location) || undefined,
    workMode: detectWorkMode(job),
    industry:
      normalizeValue(job.industry) || undefined,
    category:
      normalizeValue(job.category) || undefined,
    requiredSkills:
      intelligenceRequirements
        .filter(
          (requirement) =>
            requirement.category === "SKILL"
        )
        .map(
          (requirement) =>
            requirement.name
        ),
    requiredIndustries:
      intelligenceRequirements
        .filter(
          (requirement) =>
            requirement.category === "INDUSTRY"
        )
        .map(
          (requirement) =>
            requirement.name
        ),
    experienceRequirements:
      intelligenceRequirements
        .filter(
          (requirement) =>
            requirement.category === "EXPERIENCE"
        )
        .map(
          (requirement) =>
            requirement.name
        ),
    educationRequirements:
      intelligenceRequirements
        .filter(
          (requirement) =>
            requirement.category === "EDUCATION"
        )
        .map(
          (requirement) =>
            requirement.name
        ),
    certificationRequirements:
      intelligenceRequirements
        .filter(
          (requirement) =>
            requirement.category === "CERTIFICATION"
        )
        .map(
          (requirement) =>
            requirement.name
        ),
    languageRequirements:
      intelligenceRequirements
        .filter(
          (requirement) =>
            requirement.category === "LANGUAGE"
        )
        .map(
          (requirement) =>
            requirement.name
        ),
    requirements:
      intelligenceRequirements,
    description:
      normalizeValue(job.description) ||
      undefined,
    source:
      normalizeValue(job.source),
    url:
      normalizeValue(job.url) ||
      undefined,
  };
}