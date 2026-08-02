/**
 * ============================================================
 * Global Career AI
 * CareerState Builder Validation
 * ============================================================
 *
 * Validates:
 *
 * OrchestratorResult
 *        ↓
 * CareerStateBuilder
 *        ↓
 * CareerState
 *
 * No external dependencies.
 * ============================================================
 */

import { buildCareerState } from "@/lib/engine/builders/careerStateBuilder";

import {
  OrchestratorResult,
} from "@/lib/engine/contracts/engineContracts";


const mockResult: OrchestratorResult = {
  userId: "test-user",

  applications: [],

  ats: [
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
      ],
      missingSkills: [],
      recommendation: "Proceed",
      learningSignal: 0.9,
    },
  ],


  ranking: {
    items: [
      {
        applicationId: "app-1",
        finalScore: 88,
        rank: 1,
      },
    ],

    metadata: {
      strategy: "weighted",
      processedAt:
        new Date().toISOString(),
    },
  },


  matching: {
    items: [],
  },


  recommendations: {},


  knowledge: {},


  decision: {
    applicationId: "app-1",
    decision: "INTERVIEW",
    priority: "HIGH",
    score: 88,
    reasoning: [
      "Strong match",
    ],
  },


  context: {},


  summary: {
    totalApplications: 1,
    averageATS: 85,
    topScore: 88,
    systemConfidence: 0.9,
  },


  generatedAt:
    new Date().toISOString(),


  traceId:
    "test-trace",
};


const careerState =
  buildCareerState(
    mockResult
  );


console.log(
  "CareerState Builder Validation:",
  JSON.stringify(
    careerState,
    null,
    2
  )
);


if (!careerState.readiness) {
  throw new Error(
    "Missing readiness state"
  );
}


if (!careerState.metrics) {
  throw new Error(
    "Missing metrics state"
  );
}


if (!careerState.intelligence.ats) {
  throw new Error(
    "Missing ATS intelligence"
  );
}


console.log(
  "✅ CareerState Builder validation passed"
);