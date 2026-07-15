import { LearningDomainEvent } from "./learningTypes";

let events: LearningDomainEvent[] = [];

/**
 * ============================================================
 * Learning Memory Store (V2 - STABLE + QUERY ENABLED)
 * ============================================================
 */

/**
 * WRITE
 */
export function pushLearningEvent(event: LearningDomainEvent) {
  events.push({
    ...event,
    timestamp: event.timestamp || new Date().toISOString(),
  });
}

/**
 * READ (FULL)
 */
export function getLearningEvents(): LearningDomainEvent[] {
  return events;
}

/**
 * QUERY API (CRITICAL FOR STEP 6 COMPATIBILITY)
 */
export function queryLearningEvents(filters?: {
  userId?: string;
  type?: string;
  limit?: number;
}): LearningDomainEvent[] {
  let result = [...events];

  if (filters?.userId) {
    result = result.filter((e) => e.userId === filters.userId);
  }

  if (filters?.type) {
    result = result.filter((e) => e.type === filters.type);
  }

  if (filters?.limit) {
    result = result.slice(-filters.limit);
  }

  return result;
}

/**
 * OBSERVABILITY (DEBUG + TRACE)
 */
export function getLearningTrace(userId: string) {
  const trace = events.filter((e) => e.userId === userId);

  return {
    totalEvents: trace.length,
    timeline: trace,
    eventTypes: [...new Set(trace.map((e) => e.type))],
  };
}

/**
 * CLEAR (DEV ONLY)
 */
export function clearLearningEvents() {
  events = [];
}