/**
 * ============================================================
 * Global Career AI
 * Application Intelligence State V1.1
 * ============================================================
 *
 * Domain contract representing application intelligence state.
 *
 * This contract belongs to the Intelligence Core.
 * It does not belong to Dashboard.
 *
 * No business logic.
 * No persistence.
 * ============================================================
 */

export interface ApplicationState {
  totalApplications: number;

  activePipeline: number;

  responseRate: number;

  rejectionRate: number;

  conversionRate: number;

  offerRate: number;

  successRate: number;

  confidence: number;
}