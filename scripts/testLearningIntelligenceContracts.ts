import {
  LearningContext,
  LearningSignal,
  LearningPattern,
  LearningInsight,
} from "../lib/engine/learning-intelligence/learningIntelligenceTypes";


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
  type: "GAP",
  description:
    "Technical certification gaps reduce job compatibility",
  confidence: 0.87,
  signals: [signal],
};


const insight: LearningInsight = {
  id: "insight-001",
  type: "RECOMMENDATION",
  title:
    "Improve hydraulic systems knowledge",
  description:
    "Completing hydraulic training may improve career compatibility",
  confidence: 0.91,
  pattern,
};


console.log(
  JSON.stringify(
    {
      context,
      signal,
      pattern,
      insight,
    },
    null,
    2,
  ),
);