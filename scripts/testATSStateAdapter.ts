import { buildATSState } from "@/lib/engine/adapters/intelligence/atsStateAdapter";

const result = buildATSState([
  {
    atsScore: 85,
    keywordScore: 90,
    cvStrengthScore: 80,
    semanticScore: 82,
    matchedSkills: [
      "typescript",
      "react",
    ],
    missingSkills: [
      "aws",
    ],
    recommendation: "Proceed",
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
  "âœ… ATSState adapter validation passed"
);
