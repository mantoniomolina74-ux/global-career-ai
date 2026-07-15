/**
 * ============================================================
 * Global Career AI
 * Core Engine
 * Result Contracts
 * Contract Freeze V1
 * ============================================================
 */

import { EngineMetadata } from "./types";

export type EngineStatus =
  | "SUCCESS"
  | "WARNING"
  | "FAILED";

export interface EngineWarning {
  code: string;
  message: string;
}

export interface EngineError {
  code: string;
  message: string;
}

export interface EngineResult<T> {
  readonly status: EngineStatus;

  readonly metadata: EngineMetadata;

  readonly data: T;

  readonly warnings?: readonly EngineWarning[];

  readonly errors?: readonly EngineError[];
}

export function success<T>(
  metadata: EngineMetadata,
  data: T
): EngineResult<T> {
  return Object.freeze({
    status: "SUCCESS" as const,
    metadata,
    data,
  });
}

export function warning<T>(
  metadata: EngineMetadata,
  data: T,
  warnings: EngineWarning[]
): EngineResult<T> {
  return Object.freeze({
    status: "WARNING" as const,
    metadata,
    data,
    warnings,
  });
}

export function failure<T>(
  metadata: EngineMetadata,
  errors: EngineError[],
  data: T
): EngineResult<T> {
  return Object.freeze({
    status: "FAILED" as const,
    metadata,
    data,
    errors,
  });
}