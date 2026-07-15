import { OrchestratorResult } from "../contracts/engineContracts";

/**
 * ============================================================
 * Global Career AI
 * Career Orchestrator V6
 * Compatibility Wrapper
 * ============================================================
 *
 * V6 delegates to the unified orchestrator while preserving
 * the public API expected by existing routes.
 * ============================================================
 */

export async function runCareerOrchestratorV6(
  _input: unknown
): Promise<OrchestratorResult> {
  throw new Error("V6 deprecated — use V7");
}