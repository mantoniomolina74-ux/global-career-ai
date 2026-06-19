type CV = {
  skills: string[];
  industry?: string;
  ats_score?: number;
  experience_level?: string;
};

type Job = {
  id: string;
  title?: string;
  skills: string[];
  industry?: string;
  level?: string;
};

export function calculateJobMatch(cv: CV, job: Job) {
  const cvSkills = (cv.skills || []).map(s => s.toLowerCase());
  const jobSkills = (job.skills || []).map(s => s.toLowerCase());

  const matchedSkills = cvSkills.filter(skill =>
    jobSkills.includes(skill)
  );

  const skillScore =
    jobSkills.length > 0
      ? matchedSkills.length / jobSkills.length
      : 0;

  const industryScore =
    cv.industry &&
    job.industry &&
    cv.industry.toLowerCase() === job.industry.toLowerCase()
      ? 0.25
      : 0;

  const levelScore =
    cv.experience_level &&
    job.level &&
    cv.experience_level.toLowerCase() === job.level.toLowerCase()
      ? 0.15
      : 0;

  const atsBoost = ((cv.ats_score || 0) / 100) * 0.2;

  const matchScore = Math.min(
    1,
    skillScore * 0.55 +
    industryScore +
    levelScore +
    atsBoost
  );

  return {
    matchScore: Number(matchScore.toFixed(2)),
    matchedSkills,
    breakdown: {
      skillScore: Number(skillScore.toFixed(2)),
      industryScore,
      levelScore,
      atsBoost: Number(atsBoost.toFixed(2))
    }
  };
}