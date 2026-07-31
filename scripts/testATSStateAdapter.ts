import { buildATSState } from "@/lib/engine/adapters/intelligence/atsStateAdapter";

const result = buildATSState([
  {
    atsScore: 85,
    keywordScore: 90,
    cvStrengthScore: 80,
    semanticScore: 82,
    interviewProbability: 0.7,
    offerProbability: 0.4,
    hiringScore: 78,
    passProbability: 0.8,
    matchedSkills: [
      "typescript",
      "react",
    ],
    missingSkills: [
      "aws",
    ],
    recommendation: "Proceed",
    learningSignal: 0.9,
  },
]);


console.log(
  "ATSState Adapter Validation:",
  JSON.stringify(
    result,
    null,
    2
  )
);


if (
  result.score !== 85 ||
  result.keywordScore !== 90 ||
  result.matchedSkills.length !== 2
) {
  throw new Error(
    "ATSState adapter validation failed"
  );
}


console.log(
  "✅ ATSState adapter validation passed"
);