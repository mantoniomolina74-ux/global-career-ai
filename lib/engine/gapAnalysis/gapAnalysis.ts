type CareerProfileInput = {
  ats_score?: number | string | null;
  skills?: string | string[] | null;
  industry?: string | null;
};

export function calculateGapAnalysis(
  cv: CareerProfileInput,
  _certifications: unknown[] = []
) {
  const atsScore = Number(cv?.ats_score || 0);

  let skills: string[] = [];

  if (typeof cv?.skills === "string") {
    try {
      const parsedSkills = JSON.parse(cv.skills || "[]");

      skills = Array.isArray(parsedSkills) ? parsedSkills : [];
    } catch {
      skills = [];
    }
  } else if (Array.isArray(cv?.skills)) {
    skills = cv.skills;
  }

  const industry = cv?.industry || "";

  const missingSkills: string[] = [];
  const recommendedCertifications: string[] = [];

  if (skills.length < 5) {
    missingSkills.push(
      "Leadership",
      "Communication",
      "Problem Solving"
    );
  }

  if (skills.length < 10) {
    missingSkills.push(
      "Project Management",
      "Data Analysis"
    );
  }

  if (industry.toLowerCase().includes("construction")) {
    recommendedCertifications.push(
      "OSHA 30",
      "PMP",
      "Lean Six Sigma"
    );
  }

  if (industry.toLowerCase().includes("agriculture")) {
    recommendedCertifications.push(
      "Food Safety",
      "ISO 22000",
      "Agricultural Operations"
    );
  }

  if (recommendedCertifications.length === 0) {
    recommendedCertifications.push(
      "Google Project Management",
      "Lean Six Sigma"
    );
  }

  let readiness = "Weak";

  if (atsScore >= 80) {
    readiness = "Strong";
  } else if (atsScore >= 60) {
    readiness = "Moderate";
  }

  let nextCareerStep = "Professional Specialist";

  if (industry.toLowerCase().includes("construction")) {
    nextCareerStep = "Construction Supervisor";
  }

  if (industry.toLowerCase().includes("agriculture")) {
    nextCareerStep = "Agricultural Operations Manager";
  }

  return {
    readiness,
    nextCareerStep,
    missingSkills: [...new Set(missingSkills)],
    recommendedCertifications: [
      ...new Set(recommendedCertifications),
    ],
  };
}