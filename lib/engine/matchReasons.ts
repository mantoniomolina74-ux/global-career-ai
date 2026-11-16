/**
 * ============================================================
 * Global Career AI
 * Match Reasons V1.2.2
 * ============================================================
 *
 * Generates transparent explanations for Matching Engine scores.
 *
 * Responsibilities:
 * - Explain verified matching signals
 * - Identify the job field where the signal was found
 * - Keep explanations aligned with score calculation
 *
 * No scoring logic.
 * No persistence.
 * No dashboard logic.
 * ============================================================
 */

import { matchesConcept, normalizeText } from "./matchingConcepts";

type MatchJobInput = {
  title?: string;
  description?: string;
  industry?: string;
  country?: string;
  category?: string;
  tags?: string;
  requires_whmis?: boolean;
  requires_csts?: boolean;
  requires_first_aid?: boolean;
};

type MatchCvInput = {
  skills?: string[];
  industries?: string[];
  candidateCertifications?: string[];
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


function findMatchingField(
  job: MatchJobInput,
  value: string
): string | null {

  const fields = [

    {
      key: "title",
      label: "título del puesto",
      text:
        normalizeText(
          job.title ?? ""
        ),
    },

    {
      key: "industry",
      label: "industria",
      text:
        normalizeText(
          job.industry ?? ""
        ),
    },

    {
      key: "category",
      label: "categoría",
      text:
        normalizeText(
          job.category ?? ""
        ),
    },

    {
      key: "tags",
      label: "etiquetas",
      text:
        normalizeText(
          job.tags ?? ""
        ),
    },

    {
      key: "description",
      label: "descripción del puesto",
      text:
        normalizeText(
          job.description ?? ""
        ),
    },

  ];


  const match =
    fields.find(
      (field) =>
        matchesConcept(
          field.text,
          value
        )
    );


  return match?.label ?? null;

}


function hasCandidateCertification(
  candidateCertifications: string[],
  aliases: readonly string[]
): boolean {

  const normalizedAliases =
    new Set(
      aliases.map(
        (alias) => normalizeText(alias)
      )
    );


  return candidateCertifications.some(
    (certification) => {

      if (
        typeof certification !== "string" ||
        certification.trim().length === 0
      ) {
        return false;
      }

      return normalizedAliases.has(
        normalizeText(certification)
      );

    }
  );

}


export function buildMatchReasons(
  job: MatchJobInput,
  cv: MatchCvInput
): string[] {

  const reasons: string[] = [];


  const skills =
    Array.isArray(cv.skills)
      ? cv.skills
      : [];


  const industries =
    Array.isArray(cv.industries)
      ? cv.industries
      : [];


  const candidateCertifications =
    Array.isArray(cv.candidateCertifications)
      ? cv.candidateCertifications
      : [];


  /**
   * ============================================================
   * SKILL MATCH REASONS
   * ============================================================
   *
   * Field priority intentionally mirrors jobScoring.ts:
   *
   * title
   * industry
   * category
   * tags
   * description
   *
   * This ensures the explanation corresponds to the field
   * that determines the scoring multiplier.
   */

  skills.forEach(
    (skill) => {

      const matchedField =
        findMatchingField(
          job,
          skill
        );


      if (!matchedField) {
        return;
      }


      reasons.push(
        `Coincidencia de habilidad: ${skill} aparece en ${matchedField}.`
      );

    }
  );


  /**
   * ============================================================
   * INDUSTRY MATCH REASONS
   * ============================================================
   */

  industries.forEach(
    (industry) => {

      const matchedField =
        findMatchingField(
          job,
          industry
        );


      if (!matchedField) {
        return;
      }


      reasons.push(
        `Coincidencia de industria: ${industry} aparece en ${matchedField}.`
      );

    }
  );


  /**
   * ============================================================
   * VERIFIED CERTIFICATION REASONS
   * ============================================================
   *
   * A reason is generated only when:
   *
   * 1. The job explicitly requires the certification.
   * 2. The candidate has a matching certification.
   *
   * Candidate validity is checked by the dashboard service.
   * Alias matching mirrors the scoring engine.
   */

  if (
    job.requires_whmis === true &&
    hasCandidateCertification(
      candidateCertifications,
      CERTIFICATION_ALIASES.whmis
    )
  ) {

    reasons.push(
      "Certificación coincidente: WHMIS requerida por el empleo y acreditada por el candidato."
    );

  }


  if (
    job.requires_csts === true &&
    hasCandidateCertification(
      candidateCertifications,
      CERTIFICATION_ALIASES.csts
    )
  ) {

    reasons.push(
      "Certificación coincidente: CSTS requerida por el empleo y acreditada por el candidato."
    );

  }


  if (
    job.requires_first_aid === true &&
    hasCandidateCertification(
      candidateCertifications,
      CERTIFICATION_ALIASES.firstAid
    )
  ) {

    reasons.push(
      "Certificación coincidente: First Aid requerida por el empleo y acreditada por el candidato."
    );

  }


  /**
   * ============================================================
   * SCORE CONSISTENCY
   * ============================================================
   *
   * Geography remains excluded.
   *
   * Certification reasons require verified candidate evidence
   * and an explicit job requirement.
   */

  return [
    ...new Set(
      reasons.filter(
        (reason) =>
          reason.trim().length > 0
      )
    ),
  ];

}
