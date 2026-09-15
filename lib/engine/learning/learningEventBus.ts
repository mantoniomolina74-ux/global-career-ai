
import { pushLearningEvent } from "./learningMemory.store";
import { EventEmitter } from "events";
import type { LearningDomainEvent } from "./learningTypes";

/**
 * ============================================================
 * Learning Event Bus (V1)
 * ============================================================
 * - Emits canonical learning events
 * - Stores events in runtime learning memory
 * - Provides a canonical reactive learning:event channel
 * ============================================================
 */

class LearningEventBus extends EventEmitter {
  emitLearning(event: LearningDomainEvent): boolean {
    console.log("[Learning Bus] emitLearning()", {
      instance: this,
      action: event.context?.action,
      userId: event.userId,
    });

    // 1. Runtime learning memory
    pushLearningEvent(event);

    // 2. Canonical learning event channel
    super.emit("learning:event", event);

    // 3. Typed event channel
    return super.emit(event.type, event);
  }

  onEvent(
    eventType: string,
    handler: (
      event: LearningDomainEvent
    ) => void | Promise<void>
  ): this {
    console.log("[Learning Bus] onEvent()", {
      instance: this,
      eventType,
    });

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
 * Public API
 * ============================================================
 */

export function emitLearning(
  event: LearningDomainEvent
): void {
  learningEventBus.emitLearning(event);
}