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


const MATCH_GROUPS = [
  {
    name: "Mining",
    keywords: [
      "mining",
      "mine",
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
      "machinery",
      "maquinaria",
      "equipment",
      "heavy equipment",
      "equipo pesado",
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
      "farm",
      "granja",
      "harvest",
      "cosecha",
      "campo",
      "cultivo",
    ],
  },

  {
    name: "Construction",
    keywords: [
      "construction",
      "construccion",
      "construcción",
      "building",
      "obra",
    ],
  },

  {
    name: "Maintenance",
    keywords: [
      "maintenance",
      "mantenimiento",
      "repair",
      "reparacion",
      "reparación",
      "mecanico",
      "mecánico",
      "mechanic",
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


function normalizeText(
  value: string = ""
): string {

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
): boolean {

  const normalizedText =
    normalizeText(text);

  const normalizedValue =
    normalizeText(value);

  if (!normalizedValue) {
    return false;
  }


  const group =
    MATCH_GROUPS.find(
      (item) =>
        item.keywords.some(
          (keyword) =>
            normalizeText(keyword) ===
            normalizedValue
        )
    );


  if (!group) {

    return normalizedText
      .split(/\s+/)
      .includes(normalizedValue);

  }


  return group.keywords.some(
    (keyword) =>
      normalizedText
        .split(/\s+/)
        .includes(
          normalizeText(keyword)
        )
  );

}


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