import {
  ScoringResult,
  ScoringResultItem,
} from "../contracts/engineContracts";

interface ScoringPipelineInput {
  applications?: ScoringApplication[];
  knowledgeContext?: unknown;
}

interface ScoringApplication {
  applicationId?: string | number;
  id?: string | number;
  score?: number | string;
  atsScore?: number | string;
  breakdown?: Record<string, unknown>;
  signals?: unknown[];
}

export function runScoringPipeline(
  input: ScoringPipelineInput
): ScoringResult {
  if (!input?.applications || !Array.isArray(input.applications)) {
    throw new Error(
      "Invalid input: applications array is required for scoring pipeline"
    );
  }

  const items: ScoringResultItem[] = input.applications.map(
    (app): ScoringResultItem => {
      return {
        applicationId: String(app.applicationId ?? app.id),
        score: normalizeScore(app),
        breakdown: normalizeBreakdown(app.breakdown),
        signals: normalizeSignals(app.signals),
      };
    }
  );

  return {
    items,
    metadata: {
      processedAt: new Date().toISOString(),
      modelVersion: "v1.0",
    },
  };
}

function normalizeScore(app: ScoringApplication): number {
  const raw = app?.score ?? app?.atsScore ?? 0;

  const value = Number(raw);

  if (isNaN(value)) return 0;

  return Math.max(0, Math.min(100, value));
}

function normalizeBreakdown(
  breakdown: Record<string, unknown> | undefined
): Record<string, number> {
  if (!breakdown || typeof breakdown !== "object") {
    return {};
  }

  const result: Record<string, number> = {};

  for (const key of Object.keys(breakdown)) {
    const value = Number(breakdown[key]);
    result[key] = isNaN(value) ? 0 : value;
  }

  return result;
}

function normalizeSignals(
  signals: unknown[] | undefined
): string[] {
  if (!Array.isArray(signals)) return [];

  return signals
    .filter((s) => s !== null && s !== undefined)
    .map((s) => String(s));
}