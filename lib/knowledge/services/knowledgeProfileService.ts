import {
  scoreCompetencies
} from "../scoring/competencyScorer";

import {
  evaluateKnowledgeDomain
} from "../evaluation/knowledgeDomainEvaluator";

import {
  aggregateKnowledgeDomains
} from "../aggregation/domainAggregator";

import {
  knowledgeDomainCatalog
} from "../knowledgeDomainCatalog";


export function analyzeKnowledgeProfile(
  professionalText: string
) {

  const competencyResults =
    scoreCompetencies(
      professionalText
    );


  const domainEvaluations =
    knowledgeDomainCatalog.map(
      domain =>
        evaluateKnowledgeDomain(
          domain,
          competencyResults
        )
    );


  const aggregation =
    aggregateKnowledgeDomains(
      domainEvaluations
    );


  return {

    dominantDomainId:
      aggregation.dominantDomainId,


    averageScore:
      aggregation.averageScore,


    averageConfidence:
      aggregation.averageConfidence,


    domains:
      aggregation.domains

  };

}