export function analyzeCvGap(cv: any, job: any) {
  const cvSkills = (cv.skills || []).map((s: string) =>
    s.toLowerCase()
  );

  const jobText = `
    ${job.title} 
    ${job.description} 
    ${job.industry}
  `.toLowerCase();

  const matchedSkills = cvSkills.filter((skill: string) =>
    jobText.includes(skill.toLowerCase())
  );

  const missingSkills = cvSkills.filter(
    (skill: string) => !jobText.includes(skill.toLowerCase())
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
        : "Excellent match. You meet most requirements."
  };
}