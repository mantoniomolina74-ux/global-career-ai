
import { SCORING_WEIGHTS, SCORE_LIMITS } from "./weights";
import { buildMatchReasons } from "./matchReasons";
import { buildCandidateEvidence } from "./evidenceAdapter";
import { buildTransferableEvidence } from "./matchingTransferableEvidence";
import { accumulateEvidence } from "./evidenceAccumulator";
import { evaluateEvidence } from "./evidenceEvaluator";
import { matchesConcept, normalizeText } from "./matchingConcepts";

import type {
  MatchingResultItem,
} from "@/lib/engine/contracts/matchingContracts";

import type {
  JobIntelligence,
} from "@/lib/engine/contracts/intelligence/jobIntelligence";

import type {
  CandidateEvidence,
} from "./matchingTypes";


type JobScoreInput = {
  id: string;

  title?: string;

  description?: string;

  industry?: string;

  country?: string;

  category?: string;

  tags?: string;

  /**
   * Structured intelligence derived from the real job.
   *
   * This information is preserved through the Matching Engine
   * but does not participate in score calculation.
   */
  jobIntelligence?: JobIntelligence;

  match_score?: number;

  requires_whmis?: boolean;

  requires_csts?: boolean;

  requires_first_aid?: boolean;
};


type CvScoreInput = {
  skills?: string[];

  industries?: string[];

  candidateCertifications?: string[];

  professionalText?: string;
};


const CERTIFICATION_ALIASES = {
  whmis: [
    "whmis",
    "whmis 2015",
    "workplace hazardous materials information system",
  ],

  csts: [
    "csts",
    "csts 2020",
    "construction safety training system",
  ],

  firstAid: [
    "first aid",
    "standard first aid",
    "emergency first aid",
  ],
} as const;


function hasCandidateCertification(
  candidateCertifications: string[],
  aliases: readonly string[]
): boolean {
  const normalizedAliases =
    new Set(
      aliases.map((alias) => normalizeText(alias))
    );

  return candidateCertifications.some((certification) => {
    if (
      typeof certification !== "string" ||
      certification.trim().length === 0
    ) {
      return false;
    }

    return normalizedAliases.has(
      normalizeText(certification)
    );
  });
}


/**
 * Two labels represent the same concept when they normalize
 * identically or matchingConcepts recognizes them as aliases.
 */
function isSameConcept(
  left: string,
  right: string
): boolean {
  if (
    normalizeText(left) === normalizeText(right)
  ) {
    return true;
  }

  return (
    matchesConcept(left, right) ||
    matchesConcept(right, left)
  );
}


/**
 * Removes repeated labels and equivalent concept aliases,
 * preserving the first occurrence.
 */
function uniqueConcepts(
  values: string[]
): string[] {
  const unique: string[] = [];

  values.forEach((value) => {
    if (
      typeof value !== "string" ||
      value.trim().length === 0
    ) {
      return;
    }

    const alreadyIncluded = unique.some((existing) =>
      isSameConcept(existing, value)
    );

    if (!alreadyIncluded) {
      unique.push(value.trim());
    }
  });

  return unique;
}


/**
 * Converts the evaluator's score from 0–100 to a multiplier.
 * The evaluator remains the single source of truth for
 * relevance, evidence level, experience, transferable strength
 * and confidence.
 */
function getEvidenceMultiplier(
  evidence: CandidateEvidence
): number {
  return evaluateEvidence(evidence).score / 100;
}


export function scoreJobs(
  jobs: JobScoreInput[],
  cv: CvScoreInput
): MatchingResultItem[] {
  const rawSkills = Array.isArray(cv.skills)
    ? cv.skills
    : [];

  const rawIndustries = Array.isArray(cv.industries)
    ? cv.industries
    : [];

  const skills = uniqueConcepts(rawSkills);

  // Skills take precedence when the same concept appears
  // in both candidate lists, preventing cross-category duplication.
  const industries = uniqueConcepts(rawIndustries)
    .filter((industry) =>
      !skills.some((skill) =>
        isSameConcept(skill, industry)
      )
    );

  const candidateCertifications =
    Array.isArray(cv.candidateCertifications)
      ? cv.candidateCertifications
      : [];

  const normalizedCv: CvScoreInput = {
    ...cv,
    skills,
    industries,
    candidateCertifications,
  };

  const candidateEvidences =
    buildCandidateEvidence(normalizedCv);

  return jobs
    .map((job) => {
      let score = 0;

      const fields = {
        title: normalizeText(job.title ?? ""),
        description: normalizeText(job.description ?? ""),
        industry: normalizeText(job.industry ?? ""),
        category: normalizeText(job.category ?? ""),
        tags: normalizeText(job.tags ?? ""),
      };

      const text = Object.values(fields).join(" ");

      const transferableEvidences =
        buildTransferableEvidence({
          candidateSkills: skills,
          professionalText: cv.professionalText ?? "",
          jobText: text,
        });

      const skillFieldMultiplier = (skill: string): number => {
        if (matchesConcept(fields.title, skill)) {
          return SCORING_WEIGHTS.context.title;
        }

        if (matchesConcept(fields.industry, skill)) {
          return SCORING_WEIGHTS.context.industry;
        }

        if (matchesConcept(fields.category, skill)) {
          return SCORING_WEIGHTS.context.category;
        }

        if (matchesConcept(fields.tags, skill)) {
          return SCORING_WEIGHTS.context.tags;
        }

        if (matchesConcept(fields.description, skill)) {
          return SCORING_WEIGHTS.context.description;
        }

        return 0;
      };

      const industryFieldMultiplier = (industry: string): number => {
        if (matchesConcept(fields.title, industry)) {
          return SCORING_WEIGHTS.context.title;
        }

        if (matchesConcept(fields.industry, industry)) {
          return SCORING_WEIGHTS.context.industry;
        }

        if (matchesConcept(fields.category, industry)) {
          return SCORING_WEIGHTS.context.category;
        }

        if (matchesConcept(fields.tags, industry)) {
          return SCORING_WEIGHTS.context.tags;
        }

        if (matchesConcept(fields.description, industry)) {
          return SCORING_WEIGHTS.context.description;
        }

        return 0;
      };

      const scoredDirectConcepts: string[] = [];

      /**
       * ========================================================
       * DIRECT SKILL MATCHING
       * ========================================================
       *
       * Direct skill contributions retain their original
       * context multipliers and incorporate the complete
       * evidence quality multiplier.
       */

      skills.forEach((skill) => {
        const contextMultiplier =
          skillFieldMultiplier(skill);

        if (contextMultiplier <= 0) {
          return;
        }

        const evidence = candidateEvidences.find(
          (item) =>
            item.skill === skill &&
            item.evidenceType === "skill"
        );

        if (!evidence) {
          return;
        }

        const evidenceMultiplier =
          getEvidenceMultiplier(evidence);

        score +=
          SCORING_WEIGHTS.skillsMatch *
          contextMultiplier *
          evidenceMultiplier;

        scoredDirectConcepts.push(skill);
      });

      /**
       * ========================================================
       * DIRECT INDUSTRY MATCHING
       * ========================================================
       *
       * Industry contributions retain their original
       * context multipliers and incorporate the evaluator's
       * evidence quality multiplier.
       */

      industries.forEach((industry) => {
        const contextMultiplier =
          industryFieldMultiplier(industry);

        if (contextMultiplier <= 0) {
          return;
        }

        const evidence = candidateEvidences.find(
          (item) =>
            item.skill === industry &&
            item.evidenceType === "experience"
        );

        if (!evidence) {
          return;
        }

        const evidenceMultiplier =
          getEvidenceMultiplier(evidence);

        score +=
          SCORING_WEIGHTS.industryMatch *
          contextMultiplier *
          evidenceMultiplier;

        scoredDirectConcepts.push(industry);
      });

      /**
       * ========================================================
       * TRANSFERABLE MATCHING
       * ========================================================
       *
       * evaluateEvidence already incorporates:
       * - Transferable relationship strength (strong/moderate).
       * - Evidence level.
       * - Professional experience when contextually supported.
       * - Confidence.
       *
       * Its complete score is used directly. Applying another
       * 0.70 / 0.35 multiplier here would penalize the same
       * relationship twice.
       *
       * A transferable target already scored directly is
       * excluded to prevent double counting.
       *
       * When multiple relationships point to one target,
       * the highest effective contribution is retained.
       */

      const transferableByTarget = new Map<
        string,
        {
          target: string;
          contribution: number;
          evidence: CandidateEvidence;
        }
      >();

      transferableEvidences.forEach((evidence) => {
        if (!evidence.transferableStrength) {
          return;
        }

        const target = normalizeText(evidence.skill);

        if (!target) {
          return;
        }

        const overlapsDirectMatch =
          scoredDirectConcepts.some((concept) =>
            isSameConcept(concept, evidence.skill)
          );

        if (overlapsDirectMatch) {
          return;
        }

        // Transferable strength is already included by evaluateEvidence.
        const contribution =
          getEvidenceMultiplier(evidence);

        const existing =
          transferableByTarget.get(target);

        if (
          !existing ||
          contribution > existing.contribution
        ) {
          transferableByTarget.set(target, {
            target: evidence.skill,
            contribution,
            evidence,
          });
        }
      });

      transferableByTarget.forEach((item) => {
        score +=
          SCORING_WEIGHTS.skillsMatch *
          item.contribution;
      });

      /**
       * ========================================================
       * EVIDENCE ANALYSIS — SHADOW / TRANSPARENCY
       * ========================================================
       *
       * Only the selected transferable evidence is included.
       * This avoids presenting duplicate transfer relationships
       * as separate evidence contributions.
       *
       * This analysis does not replace the official score.
       */

      const selectedTransferableEvidences =
        Array.from(transferableByTarget.values())
          .map((item) => item.evidence);

      const allCandidateEvidences = [
        ...candidateEvidences,
        ...selectedTransferableEvidences,
      ];

      const evidenceAnalysis =
        allCandidateEvidences.length > 0
          ? accumulateEvidence(
              "career_profile",
              allCandidateEvidences
            )
          : null;

      /**
       * ========================================================
       * VERIFIED CERTIFICATION MATCHING
       * ========================================================
       *
       * Certification points are awarded only when:
       *
       * 1. The real job explicitly requires the certification.
       * 2. The candidate has a matching active certification.
       *
       * Candidate certification validity is checked upstream.
       *
       * Exact normalized aliases are used to avoid awarding
       * points for unrelated or ambiguous certifications.
       */

      if (
        job.requires_whmis === true &&
        hasCandidateCertification(
          candidateCertifications,
          CERTIFICATION_ALIASES.whmis
        )
      ) {
        score += SCORING_WEIGHTS.certifications.whmis;
      }

      if (
        job.requires_csts === true &&
        hasCandidateCertification(
          candidateCertifications,
          CERTIFICATION_ALIASES.csts
        )
      ) {
        score += SCORING_WEIGHTS.certifications.csts;
      }

      if (
        job.requires_first_aid === true &&
        hasCandidateCertification(
          candidateCertifications,
          CERTIFICATION_ALIASES.firstAid
        )
      ) {
        score += SCORING_WEIGHTS.certifications.firstAid;
      }

      /**
       * Geography remains excluded from scoring.
       *
       * A job requirement alone never constitutes candidate
       * evidence. Certification points require both the
       * explicit job requirement and verified candidate data.
       */

      return {
        ...job,

        match_score: Math.min(
          score,
          SCORE_LIMITS.maxScore
        ),

        evidence_analysis: evidenceAnalysis,

        match_reasons: buildMatchReasons(
          job,
          normalizedCv
        ),

        match_explanation: {
          matched_skills: skills.filter((skill) =>
            matchesConcept(text, skill)
          ),

          matched_industries: industries.filter((industry) =>
            matchesConcept(text, industry)
          ),

          certifications: {
            whmis: job.requires_whmis,
            csts: job.requires_csts,
            first_aid: job.requires_first_aid,
          },
        },
      };
    })
    .sort(
      (a, b) =>
        b.match_score - a.match_score
    );
}
