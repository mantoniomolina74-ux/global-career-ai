import {
  KnowledgeDomainEvaluationResult
} from "../knowledgeTypes";

import {
  KnowledgeDomainAggregationResult
} from "./aggregationTypes";


/**
 * Aggregates multiple knowledge domain evaluations.
 *
 * Produced by ADR-013.3 Knowledge Domain Aggregation Layer.
 *
 * Structural domains without evaluated competencies
 * are excluded from aggregation.
 */
export function aggregateKnowledgeDomains(
  domains: KnowledgeDomainEvaluationResult[]
): KnowledgeDomainAggregationResult {


  const evaluatedDomains =
    domains.filter(
      domain =>
        domain.competencyCount > 0
    );


  if (evaluatedDomains.length === 0) {

    return {

      domains: [],

      dominantDomainId:
        null,

      averageScore:
        0,

      averageConfidence:
        0

    };

  }


  const sortedDomains =
    [...evaluatedDomains].sort(
      (
        a,
        b
      ) =>
        b.score - a.score
    );


  const totalScore =
    evaluatedDomains.reduce(
      (
        total,
        domain
      ) =>
        total + domain.score,
      0
    );


  const totalConfidence =
    evaluatedDomains.reduce(
      (
        total,
        domain
      ) =>
        total + domain.confidence,
      0
    );


  return {

    domains:
      evaluatedDomains,

    dominantDomainId:
      sortedDomains[0].domain.id,

    averageScore:
      totalScore / evaluatedDomains.length,

    averageConfidence:
      totalConfidence /
      evaluatedDomains.length

  };

}