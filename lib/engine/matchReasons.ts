type MatchJobInput = {
  title?: string;
  description?: string;
  industry?: string;
  country?: string;
  requires_whmis?: boolean;
  requires_csts?: boolean;
  requires_first_aid?: boolean;
};

type MatchCvInput = {
  skills?: string[];
  industries?: string[];
};

export function buildMatchReasons(
  job: MatchJobInput,
  cv: MatchCvInput
): string[] {
  const reasons: string[] = [];

  const skills = Array.isArray(cv.skills) ? cv.skills : [];
  const industries = Array.isArray(cv.industries)
    ? cv.industries
    : [];

  const text =
    `${job.title || ""} ${job.description || ""} ${job.industry || ""}`.toLowerCase();

  // Coincidencia de habilidades
  const matchedSkills = skills.filter((skill) =>
    text.includes(skill.toLowerCase())
  );

  if (matchedSkills.length > 0) {
    reasons.push(
      `Coincide con habilidades detectadas en tu CV (${matchedSkills.join(", ")})`
    );
  }

  // Coincidencia de industria
  const matchedIndustries = industries.filter((industry) =>
    text.includes(industry.toLowerCase())
  );

  if (matchedIndustries.length > 0) {
    reasons.push(
      `Coincide con tu experiencia en la industria ${matchedIndustries.join(", ")}`
    );
  }

  // Certificaciones
  if (job.requires_whmis) {
    reasons.push("El puesto valora certificación WHMIS");
  }

  if (job.requires_csts) {
    reasons.push("El puesto valora certificación CSTS");
  }

  if (job.requires_first_aid) {
    reasons.push("El puesto valora capacitación en First Aid");
  }

  // País
  if (job.country) {
    reasons.push(`Oportunidad ubicada en ${job.country}`);
  }

  return reasons;
}