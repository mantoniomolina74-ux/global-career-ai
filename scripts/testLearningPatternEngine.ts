import { detectLearningPatterns } from "../lib/engine/learning-intelligence/learningPatternEngine";
import { LearningSignal } from "../lib/engine/learning-intelligence/learningIntelligenceTypes";

const signals: LearningSignal[] = [
  {
    id: "signal-001",
    source: "FEEDBACK",
    type: "REJECTION_RECEIVED",
    description: "Application rejected after interview",
    strength: "MEDIUM",
    context: {
      userId: "test-user",
      industry: "Mining",
      country: "Canada",
    },
    createdAt: new Date(),
  },
  {
    id: "signal-002",
    source: "KNOWLEDGE",
    type: "KNOWLEDGE_GAP_IDENTIFIED",
    description: "Hydraulic systems knowledge gap",
    strength: "HIGH",
    context: {
      userId: "test-user",
      industry: "Mining",
      country: "Canada",
    },
    createdAt: new Date(),
  },
  {
    id: "signal-003",
    source: "FEEDBACK",
    type: "INTERVIEW_RECEIVED",
    description: "Interview invitation received",
    strength: "HIGH",
    context: {
      userId: "test-user",
      industry: "Mining",
      country: "Canada",
    },
    createdAt: new Date(),
  },
];

const patterns = detectLearningPatterns(signals);

console.log(
  JSON.stringify(patterns, null, 2)
);