import {
  KnowledgeDomain
} from "../knowledgeTypes";


/**
 * Root knowledge domain.
 *
 * Produced by ADR-013 Knowledge Domain Intelligence Engine.
 *
 * Extended by:
 * - ADR-013.1 Domain Scoring Strategy.
 * - ADR-013.2 Knowledge Domain Hierarchy.
 */
export const supplyChainDomain: KnowledgeDomain = {

  id: "supply_chain",

  name: "Supply Chain",

  /**
   * Root domains do not define a parent.
   */
  competencies: []

};