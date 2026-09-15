/**

* ============================================================
* Global Career AI
* ADR-014.2
* Learning Pattern Engine
* ============================================================
  */

import { LearningSignal } from "./learningIntelligenceTypes";
import {
LearningPattern,
LearningPatternConfidence,
LearningPatternType,
} from "./learningPatternTypes";

/**

* Convert numeric confidence into
* a confidence level.
  */
  function confidenceLevel(
  confidence: number
  ): LearningPatternConfidence {
  if (confidence >= 0.80) return "HIGH";
  if (confidence >= 0.50) return "MEDIUM";
  return "LOW";
  }

/**

* Words that do not contribute meaningfully
* to the identity of a learning pattern.
  */
  const STOP_WORDS = new Set([
  "a",
  "an",
  "and",
  "are",
  "as",
  "at",
  "be",
  "by",
  "for",
  "from",
  "has",
  "have",
  "in",
  "is",
  "it",
  "of",
  "on",
  "or",
  "the",
  "to",
  "with",
  "this",
  "that",
  "candidate",
  "candidate's",
  "profile",
  "opportunity",
  "job",
  "role",
  "experience",
  "required",
  "requirement",
  "requirements",
  "detected",
  "identified",
  "missing",
  "needed",
  "improve",
  "improvement",
  ]);

/**

* Normalize a description into meaningful
* topic tokens used for deterministic grouping.
  */
  function normalizeTopic(description: string): string[] {
  return Array.from(
  new Set(
  description
  .toLowerCase()
  .replace(/[^a-z0-9\s-]/g, " ")
  .split(/\s+/)
  .map((token) => token.trim())
  .filter(
  (token) =>
  token.length >= 3 &&
  !STOP_WORDS.has(token)
  )
  )
  ).sort();
  }

/**

* Determine whether two signals describe
* the same professional phenomenon.
*
* Signals are considered related when they
* share at least one meaningful topic token.
*
* Exact descriptions are therefore naturally
* consolidated, while differently worded
* descriptions can still belong to the same
* pattern when they share meaningful evidence.
  */
  function areRelatedSignals(
  first: LearningSignal,
  second: LearningSignal
  ): boolean {
  const firstTokens = normalizeTopic(first.description);
  const secondTokens = normalizeTopic(second.description);

if (firstTokens.length === 0 || secondTokens.length === 0) {
return (
first.description.trim().toLowerCase() ===
second.description.trim().toLowerCase()
);
}

const secondSet = new Set(secondTokens);

const sharedTokens = firstTokens.filter((token) =>
secondSet.has(token)
);

return sharedTokens.length > 0;
}

/**

* Classify a learning signal into its
* canonical learning pattern type.
  */
  function classifyPattern(
  signal: LearningSignal
  ): LearningPatternType {
  if (signal.type.includes("REJECTION")) {
  return "FAILURE_PATTERN";
  }

if (
signal.type.includes("INTERVIEW") ||
signal.type.includes("OFFER")
) {
return "SUCCESS_PATTERN";
}

if (signal.type.includes("KNOWLEDGE")) {
return "SKILL_GAP";
}

return "IMPROVEMENT";
}

/**

* Base confidence derived from the strongest
* individual signal.
  */
  function signalConfidence(
  signals: LearningSignal[]
  ): number {
  if (
  signals.some((signal) => signal.strength === "HIGH")
  ) {
  return 0.90;
  }

if (
signals.some((signal) => signal.strength === "MEDIUM")
) {
return 0.70;
}

return 0.40;
}

/**

* Consolidate confidence using independent
* supporting signals.
*
* Repeated evidence increases confidence,
* but duplicate signal IDs do not.
  */
  function consolidatedConfidence(
  signals: LearningSignal[]
  ): number {
  const uniqueSignals = Array.from(
  new Map(
  signals.map((signal) => [signal.id, signal])
  ).values()
  );

if (uniqueSignals.length <= 1) {
return signalConfidence(uniqueSignals);
}

if (uniqueSignals.length >= 4) {
return 0.90;
}

if (uniqueSignals.length === 3) {
return 0.80;
}

return Math.max(
0.70,
signalConfidence(uniqueSignals)
);
}

/**

* Create the canonical description for a
* consolidated pattern.
*
* The first signal remains the source description
* so the engine does not invent professional claims
* that are not present in the underlying evidence.
  */
  function patternDescription(
  signals: LearningSignal[]
  ): string {
  return signals[0]?.description ?? "";
  }

/**

* Detect and consolidate learning patterns
* from a collection of learning signals.
*
* Consolidation rule:
*
* same pattern type
* *
* related professional topic
* =
* one Active Pattern
*
* One isolated signal may produce a provisional
* pattern. Two or more related independent signals
* create a consolidated pattern with increased
* confidence.
*
* Duplicate signal IDs are ignored so repeated
* delivery of the same event cannot artificially
* increase pattern confidence.
  */
  export function detectLearningPatterns(
  signals: LearningSignal[]
  ): LearningPattern[] {
  const groups: Array<{
  type: LearningPatternType;
  signals: LearningSignal[];
  }> = [];

for (const signal of signals) {
const type = classifyPattern(signal);

const existingGroup = groups.find(
  (group) =>
    group.type === type &&
    group.signals.some((existingSignal) =>
      areRelatedSignals(existingSignal, signal)
    )
);

if (!existingGroup) {
  groups.push({
    type,
    signals: [signal],
  });
  continue;
}

const duplicate = existingGroup.signals.some(
  (existingSignal) => existingSignal.id === signal.id
);

if (!duplicate) {
  existingGroup.signals.push(signal);
}

}

return groups.map((group, index) => {
const confidence = consolidatedConfidence(
group.signals
);

return {
  id: `pattern-${index + 1}`,
  type: group.type,
  description: patternDescription(group.signals),
  confidence,
  confidenceLevel: confidenceLevel(confidence),
  signals: group.signals,
  createdAt: new Date(),
};


});
}
