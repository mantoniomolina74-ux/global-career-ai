import { scoringPipelineV2 } from "../domain/applications/scoringPipeline";
import { runRankingEngine } from "../engine/applications/rankingEngine";
import {
  runRecruiterAgent,
  type RecruiterCandidate,
} from "../engine/ai/recruiterAgent";
import { eventBus } from "@/lib/events/core/eventBus";

import { initLearningEventConsumer } from "@/lib/engine/events/learningEventConsumer";
import { initLearningEngineV1 } from "@/lib/engine/learning/learningEngine.v1";

initLearningEventConsumer();
initLearningEngineV1();

type ApplicationStatus =
  | "rejected"
  | "applied"
  | "in_review"
  | "interview"
  | "offer";

type RankingStrategy = "default" | "ats" | "hybrid";

type GenericRecord = Record<string, unknown>;

type ScoringApplication = GenericRecord & {
  applicationId?: string;
  id?: string;
  score?: number;
  atsScore?: number;
  breakdown?: GenericRecord;
  signals?: unknown[];
};

export interface SaaSRequestContext {
  userId: string;
  tenantId?: string;
  jobId?: string;
  mode: "score" | "rank" | "recruit";
  payload: unknown;
  organizationId?: string;
}

type ScorePayload = {
  applicationId?: string;
  company?: string;
  position?: string;
  jobDescription: string;
  requiredSkills?: string[];
  candidateSkills?: string[];
  cvStrengthScore?: number;
  status?: ApplicationStatus;
};

type RankPayload = {
  applications: ScoringApplication[];
  rankingStrategy?: RankingStrategy;
  topK?: number;
};

type RecruitPayload = {
  jobTitle?: string;
  jobDescription: string;
  candidates: GenericRecord[];
};

export interface SaaSResponse {
  success: boolean;
  mode: string;
  data: unknown;
  meta: {
    processedAt: string;
    engineVersion: string;
  };
}

function normalizeBreakdown(
  breakdown?: GenericRecord
): Record<string, number> {
  if (!breakdown) return {};

  return Object.fromEntries(
    Object.entries(breakdown).map(([key, value]) => [
      key,
      typeof value === "number" ? value : Number(value) || 0,
    ])
  );
}
function normalizeSignals(
  signals?: unknown[]
): string[] {
  if (!signals) return [];

  return signals.filter(
    (signal): signal is string => typeof signal === "string"
  );
}

function buildScoringResult(applications: ScoringApplication[]) {
  return {
    items: applications.map((app) => ({
      applicationId: String(app.applicationId ?? app.id),
      score: Number(app.score ?? app.atsScore ?? 0),
      breakdown: normalizeBreakdown(app.breakdown),
      signals: normalizeSignals(app.signals),
    })),
    metadata: {
      processedAt: new Date().toISOString(),
      modelVersion: "saas-adapter-v1",
    },
  };
}

export async function saasEngine(
  ctx: SaaSRequestContext
): Promise<SaaSResponse> {
  const { mode, payload, userId, jobId, organizationId } = ctx;

  if (!organizationId) {
    throw new Error("Missing organizationId - organization context required");
  }

  let result: unknown;

  if (mode === "score") {
    const p = payload as ScorePayload;

    result = await scoringPipelineV2({
      userId,
      organizationId,
      applicationId: p.applicationId,
      company: p.company,
      position: p.position,
      jobDescription: p.jobDescription,
      requiredSkills: p.requiredSkills,
      candidateSkills: p.candidateSkills,
      cvStrengthScore: p.cvStrengthScore,
    });

    try {
      eventBus.emit("learning:event", {
        userId,
        organizationId,
        applicationId: p.applicationId!,
        atsScore: (result as GenericRecord).atsScore,
        status:
          p.status &&
          [
            "rejected",
            "applied",
            "in_review",
            "interview",
            "offer",
          ].includes(p.status)
            ? p.status
            : "applied",
        matchedSkills: (result as GenericRecord).matchedSkills,
        missingSkills: (result as GenericRecord).missingSkills,
      });
    } catch (err) {
      console.error("[eventBus learning:event error]", err);
    }
  } else if (mode === "rank") {
    const p = payload as RankPayload;

    const scoring = buildScoringResult(p.applications || []);

    result = await runRankingEngine(scoring);
  } else if (mode === "recruit") {
    const p = payload as RecruitPayload;

    const candidates: RecruiterCandidate[] = p.candidates.map((candidate) => ({
  applicationId: String(candidate.applicationId ?? candidate.id ?? ""),
  company:
    typeof candidate.company === "string"
      ? candidate.company
      : undefined,
  position:
    typeof candidate.position === "string"
      ? candidate.position
      : undefined,
  jobDescription:
    typeof candidate.jobDescription === "string"
      ? candidate.jobDescription
      : p.jobDescription,
  requiredSkills: Array.isArray(candidate.requiredSkills)
    ? candidate.requiredSkills.filter(
        (skill): skill is string => typeof skill === "string"
      )
    : undefined,
  candidateSkills: Array.isArray(candidate.candidateSkills)
    ? candidate.candidateSkills.filter(
        (skill): skill is string => typeof skill === "string"
      )
    : undefined,
  cvStrengthScore:
    typeof candidate.cvStrengthScore === "number"
      ? candidate.cvStrengthScore
      : undefined,
}));

result = await runRecruiterAgent({
  userId,
  organizationId,
  jobId,
  jobTitle: p.jobTitle,
  jobDescription: p.jobDescription,
  candidates,
});
  } else {
    throw new Error(`Invalid SaaS mode: ${mode}`);
  }

  return {
    success: true,
    mode,
    data: result,
    meta: {
      processedAt: new Date().toISOString(),
      engineVersion: "saas-engine-org-v2",
    },
  };
}