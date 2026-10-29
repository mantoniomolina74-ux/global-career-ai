
import { SCORING_WEIGHTS, SCORE_LIMITS } from "./weights";
import { buildMatchReasons } from "./matchReasons";
import { buildCandidateEvidence } from "./evidenceAdapter";
import { buildTransferableEvidence } from "./matchingTransferableEvidence";
import { accumulateEvidence } from "./evidenceAccumulator";
import { matchesConcept, normalizeText } from "./matchingConcepts";

import type {
  MatchingResultItem,
} from "@/lib/engine/contracts/matchingContracts";

type JobScoreInput = {
  id: string;
  title?: string;
  description?: string;
  industry?: string;
  country?: string;
  category?: string;
  tags?: string;
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


export function scoreJobs(
  jobs: JobScoreInput[],
  cv: CvScoreInput
): MatchingResultItem[] {
  const skills = Array.isArray(cv.skills)
    ? cv.skills
    : [];

  const industries = Array.isArray(cv.industries)
    ? cv.industries
    : [];

  const candidateCertifications =
    Array.isArray(cv.candidateCertifications)
      ? cv.candidateCertifications
      : [];

  const candidateEvidences =
    buildCandidateEvidence(cv);

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

      const allCandidateEvidences = [
        ...candidateEvidences,
        ...transferableEvidences,
      ];

      const evidenceAnalysis =
        allCandidateEvidences.length > 0
          ? accumulateEvidence(
              "career_profile",
              allCandidateEvidences
            )
          : null;

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

      skills.forEach((skill) => {
        const multiplier = skillFieldMultiplier(skill);

        if (multiplier > 0) {
          score +=
            SCORING_WEIGHTS.skillsMatch *
            multiplier;
        }
      });

      industries.forEach((industry) => {
        const multiplier = industryFieldMultiplier(industry);

        if (multiplier > 0) {
          score +=
            SCORING_WEIGHTS.industryMatch *
            multiplier;
        }
      });

      /**
       * ========================================================
       * TRANSFERABLE MATCHING
       * ========================================================
       *
       * Transferable evidence contributes to the official
       * match_score without replacing direct skill matching.
       *
       * Strong transferable:
       *   70% of the direct skill base value.
       *
       * Moderate transferable:
       *   35% of the direct skill base value.
       *
       * Multiple transferable relationships pointing to the
       * same target are collapsed to the strongest relationship
       * to avoid double counting.
       */

      const transferableStrengthByTarget =
        new Map<
          string,
          "strong" | "moderate"
        >();

      transferableEvidences.forEach((evidence) => {
        if (!evidence.transferableStrength) {
          return;
        }

        const target =
          normalizeText(evidence.skill);

        const existing =
          transferableStrengthByTarget.get(target);

        if (
          !existing ||
          (
            evidence.transferableStrength === "strong" &&
            existing === "moderate"
          )
        ) {
          transferableStrengthByTarget.set(
            target,
            evidence.transferableStrength
          );
        }
      });

      transferableStrengthByTarget.forEach(
        (strength) => {
          const transferableMultiplier =
            strength === "strong"
              ? 0.70
              : 0.35;

          score +=
            SCORING_WEIGHTS.skillsMatch *
            transferableMultiplier;
        }
      );

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
          cv
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