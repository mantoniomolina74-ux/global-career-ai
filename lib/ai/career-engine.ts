export type CareerJob = {
  country: string;
  score: number;
};

export function careerEngine(jobs: CareerJob[]) {
  let canada = 0;
  let australia = 0;

  jobs.forEach((j) => {
    if (j.country === "Canada") canada += j.score;
    if (j.country === "Australia") australia += j.score;
  });

  return {
    country: canada >= australia ? "Canada" : "Australia",
    strength: Math.max(canada, australia),
  };
}