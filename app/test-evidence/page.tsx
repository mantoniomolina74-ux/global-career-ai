"use client";

import { useState } from "react";
import { evaluateEvidence } from "@/lib/engine/evidenceEvaluator";
import { CandidateEvidence } from "@/lib/engine/matchingTypes";

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
    details: "Five years of professional welding experience",
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
    details: "Heavy machinery operation in agricultural environment",
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
    details: "Skill unrelated to target position",
  },
];

export default function TestEvidencePage() {
  const [results, setResults] = useState<string>("");

  function runValidation() {
    const evaluationResults = testCases.map((evidence) =>
      evaluateEvidence(evidence)
    );

    setResults(
      JSON.stringify(evaluationResults, null, 2)
    );
  }

  return (
    <div style={{ padding: "20px" }}>
      <h1>Evidence Layer Validation</h1>

      <p>
        ADR-010 Shadow Mode Validation
      </p>

      <button onClick={runValidation}>
        Run Evidence Evaluation
      </button>

      <pre style={{ marginTop: "20px" }}>
        {results}
      </pre>
    </div>
  );
}