/**
 * ============================================================
 * Global Career AI
 * Dashboard Aggregator V1.1
 * ============================================================
 *
 * Responsible for coordinating Dashboard data generation.
 *
 * Responsibilities:
 * - Coordinate Dashboard services
 * - Build Dashboard response flow
 * - Preserve tenant context
 *
 * This layer does not contain intelligence logic.
 * ============================================================
 */

import type { DashboardContract } from "../contracts/dashboardContract";


export interface DashboardContext {
  userId: string;

  tenantId: string;
}


export async function aggregateDashboard(
  context: DashboardContext
): Promise<DashboardContract> {

  throw new Error(
    "Dashboard aggregation not implemented yet"
  );
}