import { saveATSResult } from "@/lib/db/repositories/atsRepository";
import { extractJobRequirements } from "@/lib/engine/applications/jobRequirementExtractor";
import { extractPremiumATSRequirements } from "@/lib/engine/applications/premiumATSRequirementExtractor";
import { getLearningWeights } from "@/lib/engine/learning/learningWeights.bridge";
import type {
  ATSEvidence,
  ATSMatchType,
  ATSCriticality,
} from "@/lib/engine/contracts/engineContracts";

/* =========================================================
   HELPERS
========================================================= */

function clamp(n: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, n));
}

function normalizeText(value: string): string {
  return value
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^\w\s+#.&/-]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function tokenize(value: string): string[] {
  return normalizeText(value)
    .split(" ")
    .map((token) => token.trim())
    .filter(Boolean);
}

function semanticSimilarity(a: string, b: string): number {
  const A = normalizeText(a);
  const B = normalizeText(b);

  if (!A || !B) return 0;
  if (A === B) return 1;

  if (A.length > 3 && B.length > 3) {
    if (A.includes(B) || B.includes(A)) return 0.75;
  }

  const aTokens = tokenize(A);
  const bTokens = tokenize(B);

  const overlap = aTokens.filter((token) =>
    bTokens.includes(token)
  ).length;

  const maxLen = Math.max(aTokens.length, bTokens.length);

  return maxLen === 0 ? 0 : overlap / maxLen;
}

function fuzzyMatch(
  skill: string,
  candidateSkills: string[]
): boolean {
  const s = normalizeText(skill);

  return candidateSkills.some((c) => {
    const candidate = normalizeText(c);

    if (!s || !candidate) return false;

    if (s === candidate) return true;

    if (s.length > 3 && candidate.includes(s)) return true;

    if (candidate.length > 3 && s.includes(candidate)) return true;

    return semanticSimilarity(s, candidate) >= 0.72;
  });
}

/* =========================================================
   ATS EVIDENCE
========================================================= */

function containsRequirementEvidence(
  requirement: string,
  professionalText: string
): boolean {
  const normalizedRequirement = normalizeText(requirement);
  const normalizedText = normalizeText(professionalText);

  if (!normalizedRequirement || !normalizedText) {
    return false;
  }

  if (normalizedText.includes(normalizedRequirement)) {
    return true;
  }

  const requirementTokens = tokenize(normalizedRequirement);

  if (requirementTokens.length <= 1) {
    return false;
  }

  const textTokens = new Set(tokenize(normalizedText));

  const matchedTokens = requirementTokens.filter((token) =>
    textTokens.has(token)
  ).length;

  return (
    matchedTokens >= 2 &&
    matchedTokens / requirementTokens.length >= 0.5
  );
}

function classifyEvidence(
  requirement: string,
  candidateSkills: string[],
  professionalText: string
): {
  matchType: ATSMatchType;
  strength: number;
  confidence: number;
  evidence: string | null;
} {
  const normalizedRequirement = normalizeText(requirement);

  if (!normalizedRequirement) {
    return {
      matchType: "missing",
      strength: 0,
      confidence: 0.95,
      evidence: null,
    };
  }

  /*
   * DIRECT EVIDENCE
   *
   * A candidate skill explicitly matching the requirement is the
   * strongest evidence available to this layer.
   */
  const directSkill = candidateSkills.find((skill) =>
    fuzzyMatch(normalizedRequirement, [skill])
  );

  if (directSkill) {
    return {
      matchType: "direct",
      strength: 1,
      confidence: 0.98,
      evidence: directSkill,
    };
  }

  /*
   * DIRECT CV EVIDENCE
   *
   * The professional CV text itself can establish the requirement.
   */
  if (
    professionalText &&
    containsRequirementEvidence(
      normalizedRequirement,
      professionalText
    )
  ) {
    return {
      matchType: "direct",
      strength: 0.9,
      confidence: 0.9,
      evidence: `CV evidence for ${requirement}`,
    };
  }

  const requirementTokens = tokenize(normalizedRequirement);
  const professionalTokens = new Set(tokenize(professionalText));

  /*
   * RELATED EVIDENCE
   *
   * Lexical overlap is accepted only when the requirement itself
   * contains meaningful tokens that are also present in the CV.
   * This prevents unrelated CV capabilities from being attached
   * to arbitrary job requirements.
   */
  if (requirementTokens.length > 1) {
    const overlap = requirementTokens.filter((token) =>
      professionalTokens.has(token)
    ).length;

        if (
      overlap >= 2 &&
      overlap / requirementTokens.length >= 0.5
    ) {
      return {
        matchType: "related",
        strength: 0.65,
        confidence: 0.7,
        evidence: `Related CV evidence for ${requirement}`,
      };
    }
  }

  /*
   * TRANSFERABLE EVIDENCE
   *
   * Transferability must be requirement-specific.
   *
   * A generic management/communication signal in the CV is NOT
   * sufficient to classify an unrelated requirement as transferable.
   * We only allow narrowly defined relationships between a job
   * requirement and adjacent capabilities actually evidenced in
   * the candidate profile.
   */
    const transferableMap: Record<
    string,
    Array<{ signal: string; strength: number }>
  > = {
    business: [
      { signal: "management", strength: 0.55 },
      { signal: "administration", strength: 0.55 },
      { signal: "purchasing", strength: 0.35 },
      { signal: "procurement", strength: 0.35 },
      { signal: "planning", strength: 0.35 },
      { signal: "coordination", strength: 0.35 },
      { signal: "negotiation", strength: 0.35 },
    ],

    strategy: [
      { signal: "management", strength: 0.35 },
      { signal: "planning", strength: 0.55 },
      { signal: "decision making", strength: 0.55 },
      { signal: "coordination", strength: 0.20 },
      { signal: "research", strength: 0.35 },
      { signal: "analysis", strength: 0.35 },
    ],

    "stakeholder management": [
      { signal: "management", strength: 0.35 },
      { signal: "communication", strength: 0.55 },
      { signal: "coordination", strength: 0.55 },
      { signal: "negotiation", strength: 0.55 },
      { signal: "client", strength: 0.55 },
      { signal: "supplier", strength: 0.55 },
    ],

    communication: [
      { signal: "negotiation", strength: 0.55 },
      { signal: "client", strength: 0.35 },
      { signal: "supplier", strength: 0.35 },
      { signal: "customer", strength: 0.55 },
    ],

    consulting: [
      { signal: "analysis", strength: 0.55 },
      { signal: "research", strength: 0.55 },
      { signal: "communication", strength: 0.55 },
      { signal: "problem solving", strength: 0.55 },
      { signal: "management", strength: 0.35 },
    ],

    "project management": [
      { signal: "management", strength: 0.55 },
      { signal: "planning", strength: 0.55 },
      { signal: "coordination", strength: 0.55 },
      { signal: "supervision", strength: 0.35 },
    ],

    "information technology": [
      { signal: "digital tools", strength: 0.35 },
      { signal: "technology", strength: 0.55 },
    ],

    technology: [
      { signal: "digital tools", strength: 0.35 },
    ],

    "data analysis": [
      { signal: "analysis", strength: 0.55 },
      { signal: "research", strength: 0.35 },
    ],

    research: [
      { signal: "analysis", strength: 0.55 },
      { signal: "investigation", strength: 0.55 },
    ],

    "decision making": [
      { signal: "management", strength: 0.35 },
      { signal: "leadership", strength: 0.55 },
      { signal: "supervision", strength: 0.35 },
    ],

    leadership: [
      { signal: "management", strength: 0.55 },
      { signal: "supervision", strength: 0.55 },
      { signal: "coordination", strength: 0.35 },
    ],

    management: [
      { signal: "leadership", strength: 0.55 },
      { signal: "supervision", strength: 0.55 },
      { signal: "coordination", strength: 0.35 },
    ],
  };

  const transferableSignals =
    transferableMap[normalizedRequirement] ?? [];

  const transferableMatches = transferableSignals.filter(
  ({ signal }) => {
    const normalizedSignal = normalizeText(signal);

    return (
      professionalTokens.has(normalizedSignal) ||
      professionalTokens.has(
        normalizedSignal.replace(/\s+/g, "")
      ) ||
      professionalText
        .toLowerCase()
        .includes(normalizedSignal)
    );
  }
);

const transferableMatch = transferableMatches.reduce(
  (best, current) =>
    !best || current.strength > best.strength
      ? current
      : best,
  null as {
    signal: string;
    strength: number;
  } | null
);

  if (transferableMatch) {
    return {
      matchType: "transferable",
      strength: transferableMatch.strength,
      confidence: 0.55,
      evidence: `Transferable CV evidence related to ${requirement}`,
    };
  }

  /*
   * MISSING
   *
   * No direct, related, or requirement-specific transferable
   * evidence was found in the candidate profile.
   */
  return {
    matchType: "missing",
    strength: 0,
    confidence: 0.95,
    evidence: null,
  };
}
function inferCriticality(
  requirement: string,
  jobDescription: string
): ATSCriticality {
  const normalizedRequirement = normalizeText(requirement);
  const normalizedJob = normalizeText(jobDescription);

  if (!normalizedRequirement || !normalizedJob) {
    return "supporting";
  }

  const requirementPosition =
    normalizedJob.indexOf(normalizedRequirement);

  if (requirementPosition === -1) {
    return "supporting";
  }

  const contextStart = Math.max(0, requirementPosition - 180);
  const contextEnd = Math.min(
    normalizedJob.length,
    requirementPosition + normalizedRequirement.length + 180
  );

  const context = normalizedJob.slice(
    contextStart,
    contextEnd
  );

  const criticalSignals = [
    "required",
    "must have",
    "must",
    "minimum",
    "required experience",
    "required qualifications",
    "essential",
  ];

  const importantSignals = [
    "preferred",
    "preferred qualifications",
    "plus",
    "desired",
    "strongly preferred",
    "nice to have",
  ];

  if (
    criticalSignals.some((signal) =>
      context.includes(signal)
    )
  ) {
    return "critical";
  }

  if (
    importantSignals.some((signal) =>
      context.includes(signal)
    )
  ) {
    return "important";
  }

  return "supporting";
}

function calculateEvidenceScore(
  evidence: ATSEvidence[]
): number {
  if (evidence.length === 0) return 0;

  const criticalityWeight: Record<ATSCriticality, number> = {
    critical: 1.4,
    important: 1.15,
    supporting: 1,
  };

  let totalWeight = 0;
  let weightedScore = 0;

  for (const item of evidence) {
    const weight = criticalityWeight[item.criticality];

    totalWeight += weight;
    weightedScore += item.strength * weight;
  }

  if (totalWeight === 0) return 0;

  return Math.round(
    clamp((weightedScore / totalWeight) * 100, 0, 100)
  );
}

/* =========================================================
   ENGINE
========================================================= */

export async function calculateATS(
  requiredSkills: string[] = [],
  candidateSkills: string[] = [],
  jobDescription: string = "",
  cvStrengthScore: number = 50,
  feedback?: {
    outcome?: "hired" | "rejected";
  },
  meta?: {
    userId?: string;
    applicationId?: string;
  },
  professionalText: string = ""
) {
  const startTime = Date.now();

  const required = [
    ...new Set(
      requiredSkills
        .map(normalizeText)
        .filter(Boolean)
    ),
  ];

  const candidate = candidateSkills
    .map(normalizeText)
    .filter(Boolean);

  const premiumRequirements =
  extractPremiumATSRequirements(jobDescription);

const extractedSkills = premiumRequirements.map(
  (requirement) => normalizeText(requirement.requirement)
);

const mergedRequired = [
  ...new Set([
    ...required,
    ...extractedSkills,
  ]),
].slice(0, 20);

  /**
   * =========================================================
   * LEARNING WEIGHTS
   * =========================================================
   */

  const weights = getLearningWeights();

  /**
   * =========================================================
   * REQUIREMENT EVIDENCE
   * =========================================================
   */

  const evidence: ATSEvidence[] = mergedRequired.map(
  (requirement) => {
    const evaluation = classifyEvidence(
      requirement,
      candidate,
      professionalText
    );

    const premiumRequirement =
      premiumRequirements.find(
        (item) =>
          normalizeText(item.requirement) === requirement
      );

    return {
      requirement,
      evidence: evaluation.evidence,
      matchType: evaluation.matchType,
      strength: evaluation.strength,
      confidence: evaluation.confidence,
      criticality:
        premiumRequirement?.criticality ??
        inferCriticality(
          requirement,
          jobDescription
        ),
    };
  }
);

  /**
   * =========================================================
   * LEGACY MATCHED / MISSING FIELDS
   *
   * These remain for compatibility with existing consumers.
   * Only direct evidence counts as a matched skill.
   * =========================================================
   */

  const matchedSkills = evidence
    .filter(
      (item) =>
        item.matchType === "direct"
    )
    .map((item) => item.requirement);

  const missingSkills = evidence
    .filter(
      (item) =>
        item.matchType === "missing"
    )
    .map((item) => item.requirement);

  /**
   * =========================================================
   * KEYWORD SCORE
   *
   * This remains available for compatibility, but now reflects
   * evidence quality rather than simple string presence.
   * =========================================================
   */

  const rawKeywordScore =
    calculateEvidenceScore(evidence);

  const adjustedKeywordScore = Math.min(
    100,
    rawKeywordScore *
      (0.85 +
        (weights.atsMultiplier - 1) * 0.5)
  );

  /**
   * =========================================================
   * OPPORTUNITY ATS SCORE
   *
   * IMPORTANT:
   * cvStrengthScore is NOT added as an automatic 25%.
   *
   * The opportunity score represents compatibility between
   * the candidate evidence and the actual opportunity.
   * =========================================================
   */

  const atsScore = Math.round(
    clamp(adjustedKeywordScore, 0, 100)
  );

  /**
   * =========================================================
   * SEMANTIC SCORE
   * =========================================================
   */

  const semanticScore = Math.round(
    semanticSimilarity(
      mergedRequired.join(" "),
      jobDescription
    ) * 100
  );

  /**
   * =========================================================
   * RECOMMENDATION
   * =========================================================
   */

  let recommendation: string;

  if (evidence.length === 0) {
    recommendation =
      "No structured job requirements available for ATS evaluation.";
  } else if (missingSkills.length > 0) {
    recommendation =
      `Skill gaps detected: ${missingSkills.join(", ")}`;
  } else if (atsScore >= 80) {
    recommendation = "Strong ATS alignment";
  } else if (atsScore >= 60) {
    recommendation = "Moderate ATS alignment";
  } else if (atsScore >= 40) {
    recommendation = "Developing ATS alignment";
  } else {
    recommendation =
      "Low ATS alignment - optimization required";
  }

  /**
   * =========================================================
   * RESULT
   * =========================================================
   */

  const result = {
    atsScore,
    keywordScore: adjustedKeywordScore,
    cvStrengthScore: clamp(
      cvStrengthScore,
      0,
      100
    ),
    semanticScore,
    matchedSkills,
    missingSkills,
    evidence,
    recommendation,
  };

  const metadata = {
    engine: "ATS",
    version: "3.0-evidence",
    generatedAt: new Date().toISOString(),
    executionTimeMs:
      Date.now() - startTime,
  };

  if (meta?.userId && meta?.applicationId) {
    await saveATSResult(
      meta.userId,
      meta.applicationId,
      result
    );
  }

  return {
    data: result,
    metadata,
    success: true,
  };
}
