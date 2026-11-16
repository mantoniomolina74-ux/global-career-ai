import { evaluateEvidence } from "../lib/engine/evidenceEvaluator";
import { CandidateEvidence } from "../lib/engine/matchingTypes";

function assertEqual(
  actual: number | string,
  expected: number | string,
  description: string
): void {
  if (actual !== expected) {
    throw new Error(
      `${description}. Expected: ${expected}; received: ${actual}`
    );
  }

  console.log(`PASS: ${description}`);
}

function assertTrue(
  condition: boolean,
  description: string
): void {
  if (!condition) {
    throw new Error(`FAIL: ${description}`);
  }

  console.log(`PASS: ${description}`);
}

const baseEvidence: CandidateEvidence = {
  skill: "welding",
  evidenceType: "experience",
  evidenceLevel: "experience_backed",
  source: "work_experience",
  relevance: "direct",
  role: "Industrial Welder",
  industry: "Manufacturing",
  confidence: "high",
};

console.log("=== Evidence Evaluator Validation ===");

// 1. Comparar los tres niveles con las mismas condiciones.

const declaredResult = evaluateEvidence({
  ...baseEvidence,
  evidenceLevel: "declared",
});

const experienceBackedResult = evaluateEvidence({
  ...baseEvidence,
  evidenceLevel: "experience_backed",
});

const demonstratedResult = evaluateEvidence({
  ...baseEvidence,
  evidenceLevel: "demonstrated",
});

assertEqual(
  declaredResult.score,
  40,
  "Declared evidence receives the 0.40 multiplier"
);

assertEqual(
  experienceBackedResult.score,
  75,
  "Experience-backed evidence receives the 0.75 multiplier"
);

assertEqual(
  demonstratedResult.score,
  100,
  "Demonstrated evidence receives the 1.00 multiplier"
);

assertTrue(
  declaredResult.score < experienceBackedResult.score &&
  experienceBackedResult.score < demonstratedResult.score,
  "Evidence scores increase according to evidence level"
);

// 2. Los años generales no deben aumentar una habilidad declarada.

const declaredWithoutYears = evaluateEvidence({
  ...baseEvidence,
  evidenceLevel: "declared",
});

const declaredWithYears = evaluateEvidence({
  ...baseEvidence,
  evidenceLevel: "declared",
  yearsOfExperience: 5,
});

assertEqual(
  declaredWithYears.score,
  declaredWithoutYears.score,
  "General experience years do not increase declared evidence"
);

// 3. La ausencia de años no debe penalizar experiencia contextualizada.

const contextualWithoutYears = evaluateEvidence({
  ...baseEvidence,
  evidenceLevel: "experience_backed",
});

const contextualWithTwoYears = evaluateEvidence({
  ...baseEvidence,
  evidenceLevel: "experience_backed",
  yearsOfExperience: 2,
});

assertEqual(
  contextualWithoutYears.score,
  75,
  "Missing experience years use a neutral multiplier"
);

assertEqual(
  contextualWithTwoYears.score,
  53,
  "Contextual professional experience applies the years multiplier"
);

assertTrue(
  contextualWithoutYears.explanation.includes(
    "contextual professional experience"
  ),
  "Explanation identifies contextual professional experience"
);

// 4. Las explicaciones deben identificar el nivel de respaldo.

assertTrue(
  declaredResult.explanation.includes("declared evidence"),
  "Explanation identifies declared evidence"
);

assertTrue(
  experienceBackedResult.explanation.includes(
    "experience_backed evidence"
  ),
  "Explanation identifies experience-backed evidence"
);

assertTrue(
  demonstratedResult.explanation.includes(
    "demonstrated evidence"
  ),
  "Explanation identifies demonstrated evidence"
);

// 5. La evidencia irrelevante debe conservar puntuación cero.

const irrelevantResult = evaluateEvidence({
  ...baseEvidence,
  relevance: "irrelevant",
});

assertEqual(
  irrelevantResult.score,
  0,
  "Irrelevant evidence receives zero score"
);

console.log("\n=== All Evidence Evaluator Validations Passed ===");
