
import { SCORING_WEIGHTS, SCORE_LIMITS } from "./weights";
import { buildMatchReasons } from "./matchReasons";
import { buildCandidateEvidence } from "./evidenceAdapter";
import { accumulateEvidence } from "./evidenceAccumulator";

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
};


const MATCH_GROUPS = [
  {
    name: "Mining",
    keywords: [
      "mining",
      "mina",
      "mineria",
      "minero",
      "miner",
      "underground",
      "subterranea",
    ],
  },
  {
    name: "Heavy Equipment",
    keywords: [
      "heavy equipment",
      "equipo pesado",
      "machinery",
      "maquinaria",
      "operator",
      "operador",
      "forklift",
      "montacargas",
      "tractor",
    ],
  },
  {
    name: "Agriculture",
    keywords: [
      "agriculture",
      "agricultura",
      "farming",
      "agricultural",
      "farmer",
      "cultivo",
      "cosecha",
    ],
  },
  {
    name: "Construction",
    keywords: [
      "construction",
      "construccion",
      "building construction",
      "obra",
      "edificacion",
    ],
  },
  {
    name: "Maintenance",
    keywords: [
      "maintenance",
      "mantenimiento",
      "repair",
      "reparacion",
      "mechanic",
      "mecanico",
    ],
  },
  {
    name: "Welding",
    keywords: [
      "welding",
      "soldadura",
      "welder",
      "soldador",
    ],
  },
];


function normalizeText(value: string = "") {
  return value
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^\p{L}\p{N}\s]/gu, " ")
    .replace(/\s+/g, " ")
    .trim();
}


function matchesConcept(
  text: string,
  value: string
) {
  const normalizedText = normalizeText(text);
  const normalizedValue = normalizeText(value);

  const group = MATCH_GROUPS.find((item) =>
    item.keywords.some(
      (keyword) =>
        normalizeText(keyword) === normalizedValue
    )
  );

  if (!group) {
    return normalizedText
      .split(/\s+/)
      .includes(normalizedValue);
  }

  return group.keywords.some((keyword) => {
    const normalizedKeyword = normalizeText(keyword);

    if (
      normalizedText
        .split(/\s+/)
        .includes(normalizedKeyword)
    ) {
      return true;
    }

    return normalizedText.includes(
      ` ${normalizedKeyword} `
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


  const candidateEvidences =
    buildCandidateEvidence(cv);


  const evidenceAnalysis =
    candidateEvidences.length > 0
      ? accumulateEvidence(
          "career_profile",
          candidateEvidences
        )
      : null;


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


      skills.forEach((skill) => {
        if (matchesConcept(text, skill)) {
          score += SCORING_WEIGHTS.skillsMatch;
        }
      });


      industries.forEach((industry) => {
        if (matchesConcept(text, industry)) {
          score += SCORING_WEIGHTS.industryMatch;
        }
      });


      /**
 * Certifications and geography are intentionally excluded
 * until candidate-side evidence is available.
 *
 * We must never award points merely because a job:
 * - requires a certification, or
 * - has a country.
 *
 * Matching scores must be based on verified candidate evidence.
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
