/**
 * ============================================================
 * Global Career AI
 * Learning Event Schema (Persistence Layer)
 * ============================================================
 */

export interface StoredLearningEvent {
  id: string;

  userId: string;

  type: string;

  timestamp: string;

  payload: Record<string, unknown>;

  metadata?: {
    source: string;
    confidence?: number;
  };

  /**
   * Persistence metadata
   */
  storedAt: string;
}