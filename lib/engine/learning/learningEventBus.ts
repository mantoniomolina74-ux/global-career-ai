import { pushLearningEvent } from "./learningMemory.store";
import { EventEmitter } from "events";
import type { LearningDomainEvent } from "./learningTypes";

/**
 * ============================================================
 * Learning Event Bus (V1)
 * ============================================================
 * - Emits events for reactive systems
 * - Stores events for learning layer
 * ============================================================
 */

class LearningEventBus extends EventEmitter {
  emitLearning(event: LearningDomainEvent): boolean {
    // 1. persist event in memory store
    pushLearningEvent(event);

    // 2. emit event for reactive subscribers
    return super.emit(event.type, event);
  }

  onEvent(
    eventType: string,
    handler: (event: LearningDomainEvent) => void
  ): this {
    super.on(eventType, handler);
    return this;
  }
}

/**
 * Singleton instance
 */
export const learningEventBus = new LearningEventBus();

/**
 * ============================================================
 * Public API (safe wrapper)
 * ============================================================
 */

export function emitLearning(event: LearningDomainEvent) {
  learningEventBus.emitLearning(event);
}