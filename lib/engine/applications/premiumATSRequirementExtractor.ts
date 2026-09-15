import type {
  ATSRequirement,
  ATSRequirementCategory,
  ATSCriticality,
} from "@/lib/engine/contracts/engineContracts";

import { extractJobRequirements } from "./jobRequirementExtractor";

/* =========================================================
   HELPERS
========================================================= */

function normalizeText(value: string): string {
  return value
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^\p{L}\p{N}\s+#.&/-]+/gu, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function cleanRequirement(value: string): string {
  return value
    .replace(/<[^>]+>/g, " ")
    .replace(/^[\s•\-–—*]+/, "")
    .replace(/\s+/g, " ")
    .trim()
    .replace(/[.;:,]+$/, "");
}

function stripHtml(value: string): string {
  return value
    .replace(/<li[^>]*>/gi, "\n")
    .replace(/<\/li>/gi, "\n")
    .replace(/<p[^>]*>/gi, "\n")
    .replace(/<\/p>/gi, "\n")
    .replace(/<h[1-6][^>]*>/gi, "\n")
    .replace(/<\/h[1-6]>/gi, "\n")
    .replace(/<br\s*\/?>/gi, "\n")
    .replace(/<[^>]+>/g, " ")
    .replace(/\r/g, "")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

function uniqueRequirements(
  requirements: ATSRequirement[]
): ATSRequirement[] {
  const seen = new Set<string>();
  const result: ATSRequirement[] = [];

  for (const requirement of requirements) {
    const key = normalizeText(requirement.requirement);

    if (!key || seen.has(key)) {
      continue;
    }

    seen.add(key);
    result.push(requirement);
  }

  return result;
}

/* =========================================================
   CONCEPT NORMALIZATION
========================================================= */

function canonicalRequirement(
  requirement: string
): string {
  const normalized = normalizeText(requirement);

  if (
    normalized === "english fluency" ||
    normalized === "english"
  ) {
    return "english";
  }

  if (
    normalized === "senior stakeholder management" ||
    normalized === "stakeholder management"
  ) {
    return "stakeholder management";
  }

  return normalized;
}

function isAlreadyRepresented(
  requirements: ATSRequirement[],
  requirement: string
): boolean {
  const canonical =
    canonicalRequirement(requirement);

  return requirements.some(
    (existing) =>
      canonicalRequirement(
        existing.requirement
      ) === canonical
  );
}

/* =========================================================
   CATEGORY
========================================================= */

function classifyCategory(
  requirement: string
): ATSRequirementCategory {
  const normalizedRequirement =
    normalizeText(requirement);

  if (
    normalizedRequirement === "university degree" ||
    normalizedRequirement.includes("degree") ||
    /\b(bachelor|master|phd|doctorate|qualification|education)\b/.test(
      normalizedRequirement
    )
  ) {
    return "education";
  }

  if (
    normalizedRequirement === "relevant experience" ||
    /\b(experience|years|background)\b/.test(
      normalizedRequirement
    )
  ) {
    return "experience";
  }

  if (
    /\b(english|german|french|spanish|language|fluency|fluent)\b/.test(
      normalizedRequirement
    )
  ) {
    return "language";
  }

  if (
    /\b(certification|certified|license|licence|credential)\b/.test(
      normalizedRequirement
    )
  ) {
    return "certification";
  }

  if (
    normalizedRequirement === "artificial intelligence" ||
    normalizedRequirement === "practical ai fluency" ||
    normalizedRequirement === "technology" ||
    normalizedRequirement === "ai transformation" ||
    /\b(machine learning|software|technical|data|analytics|digital|sap|erp)\b/.test(
      normalizedRequirement
    )
  ) {
    return "technical";
  }

  if (
    normalizedRequirement === "stakeholder management" ||
    normalizedRequirement === "senior stakeholder management" ||
    /\b(management|leadership|coordination|planning|ownership|supervision|responsibility|manage)\b/.test(
      normalizedRequirement
    )
  ) {
    return "responsibility";
  }

  if (
    normalizedRequirement === "communication" ||
    normalizedRequirement === "analytical ability" ||
    normalizedRequirement === "structured problem-solving" ||
    normalizedRequirement === "organizational skills" ||
    normalizedRequirement === "attention to detail" ||
    normalizedRequirement === "learning agility" ||
    normalizedRequirement === "ownership mindset" ||
    normalizedRequirement === "collaborative approach" ||
    normalizedRequirement === "adaptability"
  ) {
    return "soft_skill";
  }

  if (
    /\b(consulting|business|life sciences|strategy)\b/.test(
      normalizedRequirement
    )
  ) {
    return "domain";
  }

  return "domain";
}

/* =========================================================
   CRITICALITY
========================================================= */

function inferRequirementCriticality(
  context: string,
  section: string
): ATSCriticality {
  const contextText = normalizeText(context);
  const sectionText = normalizeText(section);

  const criticalSignals = [
    "required",
    "must have",
    "must",
    "minimum",
    "essential",
    "mandatory",
  ];

  if (
    criticalSignals.some((signal) =>
      contextText.includes(signal)
    )
  ) {
    return "critical";
  }

  const importantSignals = [
    "preferred",
    "desired",
    "plus",
    "nice to have",
    "advantageous",
    "ideally",
  ];

  if (
    importantSignals.some((signal) =>
      contextText.includes(signal)
    )
  ) {
    return "important";
  }

  if (
    /\b(requirements|qualifications|minimum qualifications|what you bring)\b/.test(
      sectionText
    )
  ) {
    return "important";
  }

  return "supporting";
}

/* =========================================================
   EVIDENCE EXPECTATIONS
========================================================= */

function buildEvidenceRequired(
  category: ATSRequirementCategory
): string[] {
  switch (category) {
    case "technical":
      return [
        "candidate skills",
        "professional experience",
        "CV evidence",
      ];

    case "experience":
      return [
        "years of experience",
        "professional experience",
      ];

    case "education":
      return [
        "education",
        "qualification",
      ];

    case "domain":
      return [
        "industry experience",
        "professional experience",
        "CV evidence",
      ];

    case "responsibility":
      return [
        "professional experience",
        "responsibilities",
      ];

    case "language":
      return [
        "language proficiency",
        "CV evidence",
      ];

    case "certification":
      return [
        "certification",
        "credential",
      ];

    case "soft_skill":
      return [
        "professional experience",
        "CV evidence",
      ];

    default:
      return ["CV evidence"];
  }
}

/* =========================================================
   CONTEXT
========================================================= */

function getContext(
  lines: string[],
  index: number
): string {
  const previous = lines[index - 1] ?? "";
  const current = lines[index] ?? "";
  const next = lines[index + 1] ?? "";

  return [previous, current, next]
    .filter(Boolean)
    .join(" ")
    .replace(/\s+/g, " ")
    .trim();
}

/* =========================================================
   SECTION DETECTION
========================================================= */

function isSectionHeading(line: string): boolean {
  const normalized = normalizeText(line);

  const sectionHeadings = new Set([
    "role overview",
    "what you will do",
    "why it might be a fit",
    "requirements",
    "qualifications",
    "minimum qualifications",
    "what you bring",
    "responsibilities",
    "experience",
    "benefits",
  ]);

  return sectionHeadings.has(normalized);
}

function getSectionForLine(
  lines: string[],
  index: number
): string {
  let currentSection = "";

  for (let i = 0; i <= index; i += 1) {
    const line = cleanRequirement(lines[i] ?? "");

    if (isSectionHeading(line)) {
      currentSection = line;
    }
  }

  return currentSection;
}

function isRequirementsSection(
  section: string
): boolean {
  return /\b(requirements|qualifications|minimum qualifications|what you bring)\b/.test(
    normalizeText(section)
  );
}

/* =========================================================
   REQUIREMENT ALIASES
========================================================= */

const requirementAliases: Record<
  string,
  string[]
> = {
  "artificial intelligence": [
    "artificial intelligence",
    "data/ai",
    "ai transformation",
    "ai fluency",
    "practical ai",
  ],

  business: [
    "business",
    "business support",
    "business environment",
  ],

  technology: [
    "technology",
    "technologies",
    "technical environment",
  ],

  "life sciences": [
    "life sciences",
    "life science",
  ],

  consulting: [
    "consulting",
    "consultancy",
  ],

  "ai transformation": [
    "ai transformation",
    "artificial intelligence transformation",
  ],

  strategy: [
    "strategy",
    "strategic",
    "strategic priorities",
  ],

  "stakeholder management": [
    "stakeholder management",
    "stakeholders",
    "senior stakeholders",
  ],

  communication: [
    "communication",
    "communications",
    "communication skills",
  ],

  english: [
    "english",
    "fluency in written and spoken english",
    "fluent in english",
  ],
};

/* =========================================================
   REQUIREMENT LOCATION
========================================================= */

function requirementMatchesLine(
  requirement: string,
  line: string
): boolean {
  const normalizedRequirement =
    normalizeText(requirement);

  const normalizedLine =
    normalizeText(line);

  if (!normalizedRequirement || !normalizedLine) {
    return false;
  }

  const aliases =
    requirementAliases[normalizedRequirement] ?? [
      normalizedRequirement,
    ];

  return aliases.some((alias) => {
    const normalizedAlias =
      normalizeText(alias);

    return (
      normalizedAlias.length > 0 &&
      normalizedLine.includes(normalizedAlias)
    );
  });
}

function findRequirementLine(
  lines: string[],
  requirement: string
): number {
  /*
   * First preference:
   * search inside Requirements / Qualifications.
   */
  for (let i = 0; i < lines.length; i += 1) {
    const section =
      getSectionForLine(lines, i);

    if (!isRequirementsSection(section)) {
      continue;
    }

    if (
      requirementMatchesLine(
        requirement,
        lines[i] ?? ""
      )
    ) {
      return i;
    }
  }

  /*
   * Second preference:
   * search the full document only when
   * Requirements does not contain the concept.
   */
  for (let i = 0; i < lines.length; i += 1) {
    if (
      requirementMatchesLine(
        requirement,
        lines[i] ?? ""
      )
    ) {
      return i;
    }
  }

  return -1;
}

/* =========================================================
   CONTEXTUAL REQUIREMENT PATTERNS
========================================================= */

interface RequirementPattern {
  requirement: string;
  category: ATSRequirementCategory;
  patterns: RegExp[];
}

const contextualPatterns: RequirementPattern[] = [
  {
    requirement: "university degree",
    category: "education",
    patterns: [
      /\buniversity degree\b/i,
      /\bbachelor'?s?\s+(degree|or)\b/i,
      /\bmaster'?s?\s+(degree|level|or)\b/i,
      /\bcollege degree\b/i,
    ],
  },
  {
    requirement: "relevant experience",
    category: "experience",
    patterns: [
      /\brelevant experience\b/i,
      /\brelevant professional experience\b/i,
      /\bexperience from\b/i,
      /\bexperience in\b/i,
      /\b\d+\+?\s+years?\b/i,
    ],
  },
  {
    requirement: "analytical ability",
    category: "soft_skill",
    patterns: [
      /\banalytical ability\b/i,
      /\banalytical skills\b/i,
      /\bstrong analytical\b/i,
    ],
  },
  {
    requirement: "structured problem-solving",
    category: "soft_skill",
    patterns: [
      /\bstructured problem-solving\b/i,
      /\bstructured problem solving\b/i,
      /\bproblem-solving skills\b/i,
      /\bproblem solving skills\b/i,
    ],
  },
  {
    requirement: "practical AI fluency",
    category: "technical",
    patterns: [
      /\bpractical AI fluency\b/i,
      /\bAI fluency\b/i,
      /\bartificial intelligence fluency\b/i,
    ],
  },
  {
    requirement: "organizational skills",
    category: "soft_skill",
    patterns: [
      /\borganizational skills\b/i,
      /\borganisational skills\b/i,
      /\bstrong organizational\b/i,
      /\bstrong organisational\b/i,
    ],
  },
  {
    requirement: "attention to detail",
    category: "soft_skill",
    patterns: [
      /\battention to detail\b/i,
    ],
  },
  {
    requirement: "learning agility",
    category: "soft_skill",
    patterns: [
      /\blearning agility\b/i,
      /\blearning agile\b/i,
    ],
  },
  {
    requirement: "ownership mindset",
    category: "soft_skill",
    patterns: [
      /\bownership mindset\b/i,
      /\bproactive ownership\b/i,
      /\bownership\b/i,
    ],
  },
  {
    requirement: "senior stakeholder management",
    category: "responsibility",
    patterns: [
      /\bsenior stakeholders?\b/i,
      /\bstakeholder management\b/i,
      /\bwork with senior stakeholders\b/i,
    ],
  },
  {
    requirement: "communication",
    category: "soft_skill",
    patterns: [
      /\bexcellent written and verbal communication\b/i,
      /\bstrong communication skills\b/i,
      /\bcommunication skills\b/i,
    ],
  },
  {
    requirement: "English fluency",
    category: "language",
    patterns: [
      /\bfluency in written and spoken English\b/i,
      /\bfluent in English\b/i,
      /\bEnglish fluency\b/i,
    ],
  },
  {
    requirement: "collaborative approach",
    category: "soft_skill",
    patterns: [
      /\bcollaborative and adaptable approach\b/i,
      /\bcollaborative approach\b/i,
      /\bcollaborative\b/i,
    ],
  },
  {
    requirement: "adaptability",
    category: "soft_skill",
    patterns: [
      /\badaptable\b/i,
      /\badaptability\b/i,
    ],
  },
];

/* =========================================================
   PREMIUM REQUIREMENT EXTRACTION
========================================================= */

export function extractPremiumATSRequirements(
  jobDescription: string = ""
): ATSRequirement[] {
  if (!jobDescription.trim()) {
    return [];
  }

  const plainText = stripHtml(jobDescription);

  if (!plainText) {
    return [];
  }

  const lines = plainText
    .split(/\n+/)
    .map((line) => cleanRequirement(line))
    .filter(Boolean);

  const requirements: ATSRequirement[] = [];

  /* =======================================================
     BASELINE REQUIREMENTS
  ======================================================= */

  const baselineRequirements =
    extractJobRequirements(jobDescription);

  for (const requirement of baselineRequirements) {
    const category =
      classifyCategory(requirement);

    const matchingIndex =
      findRequirementLine(
        lines,
        requirement
      );

    const context =
      matchingIndex >= 0
        ? getContext(lines, matchingIndex)
        : requirement;

    const section =
      matchingIndex >= 0
        ? getSectionForLine(
            lines,
            matchingIndex
          )
        : "";

    requirements.push({
      requirement,
      category,
      criticality:
        inferRequirementCriticality(
          context,
          section
        ),
      evidenceRequired:
        buildEvidenceRequired(category),
      context,
    });
  }

  /* =======================================================
     CONTEXTUAL REQUIREMENTS
  ======================================================= */

  for (const pattern of contextualPatterns) {
    /*
     * Do not add a second requirement when the contextual
     * pattern represents an existing baseline concept.
     */
    if (
      isAlreadyRepresented(
        requirements,
        pattern.requirement
      )
    ) {
      continue;
    }

    let matchingIndex = -1;

    /*
     * Prefer a match in Requirements / Qualifications.
     */
    for (let i = 0; i < lines.length; i += 1) {
      const section =
        getSectionForLine(lines, i);

      if (!isRequirementsSection(section)) {
        continue;
      }

      if (
        pattern.patterns.some((regex) =>
          regex.test(lines[i] ?? "")
        )
      ) {
        matchingIndex = i;
        break;
      }
    }

    /*
     * Fall back to the full document only when necessary.
     */
    if (matchingIndex === -1) {
      matchingIndex = lines.findIndex(
        (line) =>
          pattern.patterns.some((regex) =>
            regex.test(line)
          )
      );
    }

    if (matchingIndex === -1) {
      continue;
    }

    const context = getContext(
      lines,
      matchingIndex
    );

    const section =
      getSectionForLine(
        lines,
        matchingIndex
      );

    requirements.push({
      requirement: pattern.requirement,
      category: pattern.category,
      criticality:
        inferRequirementCriticality(
          context,
          section
        ),
      evidenceRequired:
        buildEvidenceRequired(
          pattern.category
        ),
      context,
    });
  }

  return uniqueRequirements(requirements);
}