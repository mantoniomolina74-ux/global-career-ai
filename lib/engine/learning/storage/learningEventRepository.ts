import { StoredLearningEvent } from "./learningEventSchema";

/**
 * ============================================================
 * Global Career AI
 * Learning Event Repository (v1 Memory Store)
 * ============================================================
 *
 * Future upgrade:
 * - Supabase (pgvector)
 * - Redis streams
 * - Kafka / event sourcing
 * ============================================================
 */

class LearningEventRepository {
  private store: StoredLearningEvent[] = [];

  /**
   * Save event to persistent layer
   */
  save(event: StoredLearningEvent) {
    this.store.push(event);
  }

  /**
   * Get all events
   */
  getAll(): StoredLearningEvent[] {
    return this.store;
  }

  /**
   * Query by user
   */
  getByUser(userId: string): StoredLearningEvent[] {
    return this.store.filter((e) => e.userId === userId);
  }

  /**
   * Query by type
   */
  getByType(type: string): StoredLearningEvent[] {
    return this.store.filter((e) => e.type === type);
  }

  /**
   * Clear (testing only)
   */
  clear() {
    this.store = [];
  }
}

export const learningEventRepository = new LearningEventRepository();