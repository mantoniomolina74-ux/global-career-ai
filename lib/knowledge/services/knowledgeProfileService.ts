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

import type {
  KnowledgeProfile
} from "../knowledgeTypes";

import {
  analyzeKnowledgeGaps
} from "../knowledgeGapAnalyzer";

import {
  generateLearningRecommendations
} from "../learningRecommendationEngine";


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


  const profile: KnowledgeProfile = {

    dominantDomainId:
      aggregation.dominantDomainId,

    averageScore:
      aggregation.averageScore,

    averageConfidence:
      aggregation.averageConfidence,

    domains:
      aggregation.domains.map(
        domain => ({
          domain: {
            id: domain.domain.id,
            name: domain.domain.name
          },

          score:
            domain.score,

          confidence:
            domain.confidence
        })
      )

  };


  const gapAnalysis =
  analyzeKnowledgeGaps(
    profile,
    domainEvaluations
  );


  const learning =
    generateLearningRecommendations(
      gapAnalysis
    );


  return {

    profile,

    analysis:
      learning

  };

}