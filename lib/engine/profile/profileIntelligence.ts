export interface ProfileIntelligenceResult {
  careerLevel: string;
  marketFit: number;
  improvementAreas: string[];
}

export function buildProfileIntelligence(profile: any): ProfileIntelligenceResult {
  const years = Number(profile.experience_years || 0);

  let careerLevel = "Beginner";

  if (years >= 2) careerLevel = "Junior";
  if (years >= 5) careerLevel = "Intermediate";
  if (years >= 8) careerLevel = "Senior";
  if (years >= 12) careerLevel = "Expert";

  let marketFit = 40;

  if (profile.profession) marketFit += 15;
  if (profile.target_industry) marketFit += 15;
  if (profile.cv_url) marketFit += 15;
  if (
    profile.english_level === "Advanced" ||
    profile.english_level === "Fluent"
  ) {
    marketFit += 15;
  }

  if (marketFit > 100) {
    marketFit = 100;
  }

  const improvementAreas: string[] = [];

  if (!profile.target_industry) {
    improvementAreas.push("Define a clear target industry");
  }

  if (!profile.cv_url) {
    improvementAreas.push("Upload or link your CV");
  }

  if (
    !profile.english_level ||
    profile.english_level === "Basic"
  ) {
    improvementAreas.push("Improve English proficiency");
  }

  if (!profile.profession) {
    improvementAreas.push("Define your professional field");
  }

  return {
    careerLevel,
    marketFit,
    improvementAreas,
  };
}