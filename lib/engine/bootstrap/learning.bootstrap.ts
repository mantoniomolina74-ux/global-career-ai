import { registerSemanticProvider } from "@/lib/engine/learning/semantic/semanticMemory.bridge";
import { vectorMemoryProviderV1 } from "@/lib/engine/learning/semantic/semanticMemory.provider.v1";
import { runAdaptiveWeightLearning } from "@/lib/engine/learning/semantic/adaptiveWeightEngine";

/**
 * ============================================================
 * LEARNING BOOTSTRAP
 * ============================================================
 *
 * Initializes semantic memory system at runtime.
 * This runs once when the engine is loaded.
 * ============================================================
 */

export function initLearningSystem() {
  registerSemanticProvider(vectorMemoryProviderV1);

  // 🔥 NEW: auto-learning activation
  runAdaptiveWeightLearning();
}