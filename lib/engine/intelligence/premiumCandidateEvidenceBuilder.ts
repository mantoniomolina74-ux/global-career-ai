
import type {
  CandidateEvidence,
} from "@/lib/engine/matchingTypes";

/**
 * ============================================================
 * Global Career AI
 * Premium Candidate Evidence Builder
 * ============================================================
 *
 * Builds traceable candidate evidence from a persisted
 * CV analysis and its extracted professional text.
 *
 * Important:
 * - Persisted CV skills remain declared evidence.
 * - A detected skill does not prove professional experience.
 * - No role, organization, page or experience years are invented.
 * - The CV analysis ID is used as the source record.
 * ============================================================
 */

export interface PremiumCandidateEvidenceInput {
  cvAnalysisId: string;
  candidateSkills: string[];
  professionalText?: string;
}

function normalizeSkill(value: string): string {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLocaleLowerCase()
    .trim();
}

function escapeRegExp(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

/**
 * Returns a real excerpt only when the complete skill
 * can be located safely in the original CV text.
 */
function findSkillExcerpt(
  professionalText: string,
  skill: string,
): string | undefined {
  const normalizedSkill = normalizeSkill(skill);

  if (!professionalText || !normalizedSkill) {
    return undefined;
  }

  const escapedSkill = escapeRegExp(skill.trim());

  const expression = new RegExp(
    `(^|[^\\p{L}\\p{N}])(${escapedSkill})(?=$|[^\\p{L}\\p{N}])`,
    "iu",
  );

  const match = expression.exec(professionalText);

  if (!match || match.index === undefined) {
    return undefined;
  }

  const matchedText = match[2];
  const start = match.index + match[1].length;
  const excerptStart = Math.max(0, start - 100);
  const excerptEnd = Math.min(
    professionalText.length,
    start + matchedText.length + 100,
  );

  return professionalText
    .slice(excerptStart, excerptEnd)
    .trim();
}

export function buildPremiumCandidateEvidence(
  input: PremiumCandidateEvidenceInput,
): CandidateEvidence[] {
  const cvAnalysisId = input.cvAnalysisId.trim();

  if (!cvAnalysisId) {
    return [];
  }

  const seenSkills = new Set<string>();

  return input.candidateSkills
    .filter((skill) => typeof skill === "string")
    .map((skill) => skill.trim())
    .filter((skill) => {
      if (!skill) {
        return false;
      }

      const normalized = normalizeSkill(skill);

      if (!normalized || seenSkills.has(normalized)) {
        return false;
      }

      seenSkills.add(normalized);

      return true;
    })
    .map((skill): CandidateEvidence => {
      const excerpt = findSkillExcerpt(
        input.professionalText ?? "",
        skill,
      );

      return {
        skill,
        evidenceType: "skill",
        evidenceLevel: "declared",
        source: "other",
        relevance: "direct",
        confidence: "medium",
        details: excerpt
          ? "Skill detected in the persisted CV analysis and located in the extracted CV text."
          : "Skill obtained from the persisted CV analysis. No exact text excerpt was located.",
        traceability: {
          recordId: cvAnalysisId,
          ...(excerpt ? { excerpt } : {}),
        },
      };
    });
}
