/**
 * ============================================================
 * Global Career AI
 * Core Engine
 * ============================================================
 *
 * Base class shared by every intelligence engine.
 *
 * Responsibilities:
 * - Metadata generation
 * - Execution timing
 * - Standardized lifecycle
 * - Error handling
 * ============================================================
 */

import {
  EngineInput,
  EngineMetadata,
  EngineName,
} from "./types";

import {
  EngineResult,
  success,
  warning,
  failure,
  EngineWarning,
  EngineError,
} from "./result";

export abstract class BaseEngine<
  TInput extends EngineInput,
  TResult
> {
  protected abstract readonly engineName: EngineName;

  protected abstract readonly version: string;

  /**
   * Main domain logic.
   */
  protected abstract execute(
    input: TInput
  ): Promise<TResult> | TResult;

  /**
   * Default result used when execution fails.
   */
  protected abstract createEmptyResult(): TResult;

  /**
   * Standard execution entry point.
   */
  async run(
    input: TInput
  ): Promise<EngineResult<TResult>> {
    const startedAt = Date.now();

    try {
      const data = await this.execute(input);

      return success(
        this.createMetadata(startedAt),
        data
      );
    } catch (error) {
      const engineError: EngineError = {
        code: "ENGINE_EXECUTION_ERROR",
        message:
          error instanceof Error
            ? error.message
            : "Unknown engine error",
      };

      return failure(
        this.createMetadata(startedAt),
        [engineError],
        this.createEmptyResult()
      );
    }
  }

  /**
   * Standard warning response.
   */
  protected warningResult(
    data: TResult,
    warnings: EngineWarning[],
    startedAt: number
  ): EngineResult<TResult> {
    return warning(
      this.createMetadata(startedAt),
      data,
      warnings
    );
  }

  /**
   * Metadata factory.
   */
  protected createMetadata(
    startedAt: number
  ): EngineMetadata {
    return {
      engine: this.engineName,
      version: this.version,
      generatedAt: new Date().toISOString(),
      executionTimeMs: Date.now() - startedAt,
    };
  }
}