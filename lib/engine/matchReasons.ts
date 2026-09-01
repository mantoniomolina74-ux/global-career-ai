/**
 * ============================================================
 * Global Career AI
 * Match Reasons V1.2.1
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
};





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
   * SCORE CONSISTENCY
   * ============================================================
   *
   * Certifications and geography are intentionally excluded.
   *
   * They may be useful metadata for the opportunity, but they
   * do not currently contribute points to the official
   * match_score and therefore must not be presented as reasons
   * for the score.
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
