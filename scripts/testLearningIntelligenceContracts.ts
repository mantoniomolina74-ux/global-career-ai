import {
  LearningContext,
  LearningSignal,
} from "../lib/engine/learning-intelligence/learningIntelligenceTypes";

import {
  LearningPattern,
} from "../lib/engine/learning-intelligence/learningPatternTypes";


const context: LearningContext = {
  userId: "test-user",
  careerGoal: "Heavy Equipment Operator",
  industry: "Mining",
  country: "Canada",
  role: "Equipment Operator",
};


const signal: LearningSignal = {
  id: "signal-001",
  source: "KNOWLEDGE",
  type: "KNOWLEDGE_GAP_IDENTIFIED",
  description:
    "Hydraulic systems knowledge gap detected",
  strength: "HIGH",
  context,
  createdAt: new Date(),
};


const pattern: LearningPattern = {
  id: "pattern-001",
  type: "SKILL_GAP",
  description:
    "Technical certification gaps reduce job compatibility",
  confidence: 0.87,
  confidenceLevel: "HIGH",
  signals: [signal],
  createdAt: new Date(),
};


console.log(
  JSON.stringify(
    {
      context,
      signal,
      pattern,
    },
    null,
    2,
  ),
);
