import { runCareerOrchestratorV7 } from "./careerOrchestrator.v7";
import { initLearningSystem } from "@/lib/engine/bootstrap/learning.bootstrap";
import { CareerOrchestratorInput } from "@/lib/engine/contracts/engineContracts";

/**
 * ============================================================
 * Global Career AI
 * SaaS Engine Facade (Stable Export Layer)
 * ============================================================
 */

let initialized = false;

export async function saasEngine(
  ctx: CareerOrchestratorInput
) {
  /**
   * ============================================================
   * BOOTSTRAP (RUN ONCE)
   * ============================================================
   */

  if (!initialized) {
    initLearningSystem();
    initialized = true;
  }

  return runCareerOrchestratorV7(ctx);
}