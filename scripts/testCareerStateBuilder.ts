/**
 * ============================================================
 * Global Career AI
 * CareerState Builder Validation
 * ============================================================
 *
 * Validates:
 *
 * OrchestratorResult
 *        â†“
 * CareerStateBuilder
 *        â†“
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
      matchedSkills: [
        "typescript",
      ],
      missingSkills: [],
      recommendation: "Proceed",
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


  decision: {
    applicationId: "app-1",
    decision: "INTERVIEW",
    priority: "HIGH",
    score: 88,
    reasoning: [
      "Strong match",
    ],
  },


  context: {
    atsMultiplier: 1,
    rankingMultiplier: 1,
    decisionSensitivity: 1,
  },

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
  "âœ… CareerState Builder validation passed"
);

