import {
  KnowledgeDomain
} from "./knowledgeTypes";

import {
  procurementDomain
} from "./domains/procurementDomain";

import {
  supplyChainDomain
} from "./domains/supplyChain";


/**
 * Knowledge domain registry.
 *
 * Produced by ADR-013 Knowledge Domain Intelligence Engine.
 *
 * Extended by:
 * - ADR-013.1 Domain Scoring Strategy.
 * - ADR-013.2 Knowledge Domain Hierarchy.
 */
export const knowledgeDomainCatalog: KnowledgeDomain[] = [

  supplyChainDomain,

  procurementDomain

];


export function getKnowledgeDomains(): KnowledgeDomain[] {

  return knowledgeDomainCatalog;

}


export function getKnowledgeDomainById(
  id: string
): KnowledgeDomain | undefined {

  return knowledgeDomainCatalog.find(
    domain =>
      domain.id === id
  );

}