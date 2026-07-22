"use client";

import { useState } from "react";
import { accumulateEvidence } from "@/lib/engine/evidenceAccumulator";
import { CandidateEvidence } from "@/lib/engine/matchingTypes";

export default function TestEvidenceAccumulationPage() {
  const [result, setResult] = useState("");

  function runTest() {
    const evidences: CandidateEvidence[] = [
      
        {
  skill: "welding",
  evidenceType: "experience",
  source: "work_experience",
  details: "5 years welding experience",
  yearsOfExperience: 5,
  role: "welder",
  confidence: "high",
  relevance: "direct",
},
      {
        skill: "welding",
        evidenceType: "certification",
        source: "certifications",
        details: "Welding certification",
        confidence: "medium",
        relevance: "direct",
      },
      {
        skill: "welding",
        evidenceType: "keyword",
        source: "other",
        details: "Mentioned welding keyword",
        confidence: "low",
        relevance: "direct",
      }
    ];

    const evaluation = accumulateEvidence(
      "welding",
      evidences
    );

    setResult(
      JSON.stringify(evaluation, null, 2)
    );
  }

  return (
    <div style={{ padding: "20px" }}>
      <h1>Evidence Accumulation Validation</h1>

      <h2>
        ADR-010 Diminishing Returns Test
      </h2>

      <button onClick={runTest}>
        Run Accumulation Evaluation
      </button>

      <pre>{result}</pre>
    </div>
  );
}