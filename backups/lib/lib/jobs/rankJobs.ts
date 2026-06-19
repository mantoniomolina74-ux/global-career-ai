export function rankJobs(jobs: any[], cvSkills: string[], cvIndustries: string[]) {
  return jobs
    .map((job) => {
      let score = 0;

      const text = `${job.title} ${job.description} ${job.industry}`.toLowerCase();

      // 🔥 MATCH POR SKILLS REALES DEL USUARIO
      cvSkills.forEach((skill) => {
        if (text.includes(skill.toLowerCase())) {
          score += 25;
        }
      });

      // 🔥 MATCH POR INDUSTRIA REAL DEL CV
      cvIndustries.forEach((industry) => {
        if (text.includes(industry.toLowerCase())) {
          score += 30;
        }
      });

      // BONUS CERTIFICACIONES
      if (job.requires_whmis) score += 10;
      if (job.requires_csts) score += 10;
      if (job.requires_first_aid) score += 5;

      // BONUS PAÍS
      if (job.country === "Canada") score += 5;
      if (job.country === "Australia") score += 5;

      return {
        ...job,
        match_score: Math.min(score, 100)
      };
    })
    .sort((a, b) => b.match_score - a.match_score);
}