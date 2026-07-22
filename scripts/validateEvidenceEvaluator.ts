import { evaluateEvidence } from "../lib/engine/evidenceEvaluator";
import { CandidateEvidence } from "../lib/engine/matchingTypes";

const testCases: CandidateEvidence[] = [
  {
    skill: "welding",
    evidenceType: "experience",
    source: "work_experience",
    relevance: "direct",
    yearsOfExperience: 5,
    role: "Industrial Welder",
    industry: "Manufacturing",
    confidence: "high",
    details: "Five years of professional welding experience"
  },

  {
    skill: "heavy equipment operation",
    evidenceType: "experience",
    source: "work_experience",
    relevance: "transferable",
    yearsOfExperience: 5,
    role: "Agricultural Equipment Operator",
    industry: "Agriculture",
    confidence: "high",
    details: "Operated heavy machinery in agricultural operations"
  },

  {
    skill: "electrical installation",
    evidenceType: "skill",
    source: "skills_section",
    relevance: "irrelevant",
    yearsOfExperience: 5,
    role: "Office Administrator",
    industry: "Administration",
    confidence: "high",
    details: "Skill not related to target occupation"
  }
];

console.log("=== Evidence Layer Validation ===");

for (const evidence of testCases) {
  const result = evaluateEvidence(evidence);

  console.log("\nInput Evidence:");
  console.log(evidence);

  console.log("\nEvaluation Result:");
  console.log(result);
}

console.log("\n=== Validation Complete ===");