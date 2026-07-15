type CvGapProfile = {
  skills?: string[];
};

type JobGapProfile = {
  title?: string;
  description?: string;
  industry?: string;
};

export function analyzeCvGap(
  cv: CvGapProfile,
  job: JobGapProfile
) {
  const cvSkills = Array.isArray(cv.skills)
    ? cv.skills.map((s) => s.toLowerCase())
    : [];

  const jobText = `
    ${job.title || ""}
    ${job.description || ""}
    ${job.industry || ""}
  `.toLowerCase();

  const matchedSkills = cvSkills.filter((skill) =>
    jobText.includes(skill.toLowerCase())
  );

  const missingSkills = cvSkills.filter(
    (skill) => !jobText.includes(skill.toLowerCase())
  );

  const matchPercentage = Math.round(
    (matchedSkills.length / (cvSkills.length || 1)) * 100
  );

  return {
    matchPercentage,
    matchedSkills,
    missingSkills,
    recommendation:
      missingSkills.length > 0
        ? `Improve: ${missingSkills.slice(0, 3).join(", ")}`
        : "Excellent match. You meet most requirements.",
  };
}