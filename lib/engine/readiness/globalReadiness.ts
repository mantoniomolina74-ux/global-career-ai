type CareerReadinessProfileInput = {
  ats_score?: number | string | null;
  skills?: string | string[] | null;
  industry?: string | null;
};

type CertificationInput = {
  id?: string;
  name?: string;
  status?: string;
};

export function calculateGlobalReadiness(
  cv: CareerReadinessProfileInput,
  certifications: CertificationInput[] = []
) {
  const atsScore = Number(cv?.ats_score || 0);

  let skills: string[] = [];

  if (typeof cv?.skills === "string") {
    try {
      const parsedSkills = JSON.parse(cv.skills || "[]");

      skills = Array.isArray(parsedSkills)
        ? parsedSkills
        : [];
    } catch {
      skills = [];
    }
  } else if (Array.isArray(cv?.skills)) {
    skills = cv.skills;
  }

  const skillCount = skills.length;
  const certificationCount = certifications.length;
  const hasIndustry = !!cv?.industry;

  let score = 0;

  // ATS Score (40 puntos)
  score += Math.min(atsScore, 100) * 0.4;

  // Skills (30 puntos)
  score += Math.min(skillCount * 3, 30);

  // Certifications (20 puntos)
  score += Math.min(certificationCount * 5, 20);

  // Industry (10 puntos)
  if (hasIndustry) {
    score += 10;
  }

  score = Math.round(score);

  let level = "Beginner";

  if (score >= 85) {
    level = "Global Ready";
  } else if (score >= 70) {
    level = "International Candidate";
  } else if (score >= 50) {
    level = "Developing Profile";
  }

  const recommendations: string[] = [];

  if (atsScore < 80) {
    recommendations.push(
      `Increase ATS Score from ${atsScore}% to at least 80%`
    );
  }

  if (skillCount < 10) {
    recommendations.push(
      `Add ${10 - skillCount} more professional skills`
    );
  }

  if (certificationCount < 3) {
    recommendations.push(
      `Add ${3 - certificationCount} more certifications`
    );
  }

  if (!hasIndustry) {
    recommendations.push(
      "Define your professional industry specialization"
    );
  }

  if (recommendations.length === 0) {
    recommendations.push(
      "Excellent profile. Ready for international opportunities."
    );
  }

  return {
    score,
    level,
    atsScore,
    skillCount,
    certificationCount,
    recommendations,
  };
}