/**
 * ============================================================
 * Global Career AI
 * Core Engine
 * Shared Types
 * ============================================================
 *
 * Base contracts shared across every engine.
 *
 * This file MUST NOT import from any engine.
 * Every engine imports from here.
 *
 * ============================================================
 */

export type EngineName =
  | "ATS"
  | "SCORING"
  | "RANKING"
  | "LEARNING"
  | "RECRUITER"
  | "RECOMMENDATION"
  | "DECISION"
  | "CONTEXT"
  | "ORCHESTRATOR"
  | "ANALYTICS"
  | "DASHBOARD";

export interface EngineMetadata {
  version: string; // semantic engine version
  engine: EngineName;
  generatedAt: string;
  executionTimeMs?: number;
}

export interface EngineInput {
  userId?: string;
  organizationId?: string;
}

export interface EngineOutput {
  score: number;
  confidence: number;
}

export interface EngineContext {
  userId?: string;

  organizationId?: string;

  country?: string;

  industry?: string;

  language?: string;
}

export interface EngineSignal {
  id: string;

  source: EngineName;

  type: string;

  value: unknown;

  confidence: number;

  timestamp: string;
}

export interface RecommendationItem {
  id: string;

  title: string;

  description: string;

  priority: number;
}

export interface EngineExecution<
  TInput extends EngineInput,
  TResult
> {
  input: TInput;

  metadata: EngineMetadata;

  result: TResult;
}