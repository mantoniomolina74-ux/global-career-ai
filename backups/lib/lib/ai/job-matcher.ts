export function matchJob(cvSkills: string[], job: any) {
  const required = job.skills || [];

  let score = 0;
  const missing: string[] = [];

  required.forEach((skill: string) => {
    const found = cvSkills.some((c) =>
      c.toLowerCase().includes(skill.toLowerCase())
    );

    if (found) {
      score += 100 / required.length;
    } else {
      missing.push(skill);
    }
  });

  return {
    ...job,
    score: Math.round(score),
    missing,
  };
}