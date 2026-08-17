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
      "mecanico",
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

function normalizeText(value: string = "") {
  return value
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");
}

function matchesConcept(
  text: string,
  value: string
) {
  const normalizedValue = normalizeText(value);

  const group = MATCH_GROUPS.find((item) =>
    item.keywords.includes(normalizedValue)
  );

  if (!group) {
    return text.includes(normalizedValue);
  }

  return group.keywords.some((keyword) =>
    text.includes(normalizeText(keyword))
  );
}

export function buildMatchReasons(
  job: MatchJobInput,
  cv: MatchCvInput
): string[] {
  const reasons: string[] = [];

  const skills = Array.isArray(cv.skills)
    ? cv.skills
    : [];

  const industries = Array.isArray(cv.industries)
    ? cv.industries
    : [];

  const text = normalizeText(
    `${job.title || ""}
    ${job.description || ""}
    ${job.industry || ""}
    ${job.category || ""}
    ${job.tags || ""}`
  );

  const matchedSkills = skills.filter((skill) =>
    matchesConcept(text, skill)
  );

  if (matchedSkills.length > 0) {
    reasons.push(
      `Coincide con habilidades detectadas en tu CV (${matchedSkills.join(", ")})`
    );
  }

  const matchedIndustries = industries.filter((industry) =>
    matchesConcept(text, industry)
  );

  if (matchedIndustries.length > 0) {
    reasons.push(
      `Coincide con tu experiencia en la industria ${matchedIndustries.join(", ")}`
    );
  }

  if (job.requires_whmis) {
    reasons.push(
      "El puesto valora certificación WHMIS"
    );
  }

  if (job.requires_csts) {
    reasons.push(
      "El puesto valora certificación CSTS"
    );
  }

  if (job.requires_first_aid) {
    reasons.push(
      "El puesto valora capacitación en First Aid"
    );
  }

  if (job.country) {
    reasons.push(
      `Oportunidad ubicada en ${job.country}`
    );
  }

  return reasons;
}