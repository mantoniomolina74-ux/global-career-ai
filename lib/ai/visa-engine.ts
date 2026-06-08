export function visaEngine(score: number, missing: string[]) {
  return {
    visaType: score > 160 ? "Skilled Worker" : "Training Path",
    readinessScore: score,
    topGaps: missing.slice(0, 5),
  };
}