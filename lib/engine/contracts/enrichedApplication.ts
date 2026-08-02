/**
 * ============================================================
 * Global Career AI
 * Enriched Application Contract V1.1
 * ============================================================
 *
 * Domain contract representing an application after
 * intelligence enrichment.
 *
 * Source:
 * CareerApplication + ATS Intelligence
 *
 * This contract belongs to the Engine Core.
 *
 * No business logic.
 * No persistence.
 * ============================================================
 */

import type {
  CareerApplication,
  ATSResult,
} from "./engineContracts";


export interface EnrichedApplication
  extends CareerApplication {

  atsResult: ATSResult;

  atsScore: number;

  hiringScore: number;

  semanticScore: number;
}