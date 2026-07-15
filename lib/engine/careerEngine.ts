// ================= CAREER BRAIN ENGINE =================

interface CareerEngineInput {
  profile?: unknown;
  cvAnalysis?: {
    skills?: string | string[];
    ats_score?: number;
  };
  jobs?: CareerJob[];
  certifications?: unknown[];
  applications?: unknown[];
}

interface CareerJob {
  match_score?: number;
  description?: string;
}

export function buildCareerState({
  profile: _profile,
  cvAnalysis,
  jobs,
  certifications,
}: CareerEngineInput) {
  // ================= SAFETY DEFAULTS =================
  const safeCV = cvAnalysis || {};
  const safeJobs = jobs || [];
  const safeCerts = certifications || [];

  // ================= BASIC METRICS =================
  const skills: string[] =
  typeof safeCV.skills === "string"
    ? JSON.parse(safeCV.skills || "[]")
    : Array.isArray(safeCV.skills)
    ? safeCV.skills.filter(
        (skill): skill is string => typeof skill === "string"
      )
    : [];

  const skillsCount = skills.length;

  const atsScore = safeCV.ats_score || 0;

  const jobMatches = safeJobs.map(
    (job) => job.match_score || 0
  );

  const averageMatch =
    jobMatches.length > 0
      ? Math.round(
          jobMatches.reduce(
            (a, b) => a + b,
            0
          ) / jobMatches.length
        )
      : 0;

  const topMatches = jobMatches.filter((m) => m >= 80).length;

  // ================= READINESS SCORE =================
  const readinessScore = Math.round(
    atsScore * 0.5 +
      skillsCount * 2 +
      safeCerts.length * 3 +
      averageMatch * 0.3
  );

  const readinessLevel =
    readinessScore >= 80
      ? "Advanced"
      : readinessScore >= 60
      ? "Intermediate"
      : "Beginner";

  // ================= GAP ANALYSIS =================
  const missingSkills = safeJobs
    .slice(0, 5)
    .map((job) => job.description || "")
    .filter((d) => !skills.some((s) => d.includes(s)));

  const gapAnalysis = {
    readiness: readinessLevel,
    nextCareerStep:
      readinessScore >= 80
        ? "Apply for international senior roles"
        : readinessScore >= 60
        ? "Strengthen certifications and ATS score"
        : "Build foundational skills and experience",
    missingSkills,
    recommendedCertifications:
      safeCerts.length === 0
        ? ["AWS Fundamentals", "Project Management Basics"]
        : [],
  };

  // ================= PROFILE INTELLIGENCE =================
  const profileIntelligence = {
    careerLevel: readinessLevel,
    marketFit: Math.min(100, atsScore + skillsCount * 3),
    improvementAreas: [
      atsScore < 70 ? "Improve ATS optimization" : null,
      skillsCount < 5 ? "Expand technical skills" : null,
      safeCerts.length === 0 ? "Obtain certifications" : null,
    ].filter(Boolean),
  };

  // ================= GLOBAL READINESS =================
  const readiness = {
    score: readinessScore,
    level: readinessLevel,
    atsScore,
    skillCount: skillsCount,
    certificationCount: safeCerts.length,
    recommendations: [
      atsScore < 70 ? "Optimize CV for ATS systems" : null,
      skillsCount < 5 ? "Add more technical skills" : null,
      safeCerts.length < 2 ? "Obtain 1–2 certifications" : null,
    ].filter(Boolean),
  };

  // ================= RETURN SINGLE SOURCE OF TRUTH =================
  return {
    readiness,
    gapAnalysis,
    profileIntelligence,
    metrics: {
      averageMatch,
      topMatches,
      skillsCount,
      atsScore,
    },
  };
}