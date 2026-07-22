import {
  CompetencyEvaluationResult
} from "../scoring/competencyTypes";

import {
  KnowledgeDomain,
  KnowledgeDomainEvaluationResult
} from "../knowledgeTypes";


/**
 * Evaluates a knowledge domain from competency evaluation results.
 *
 * Produced by ADR-012 Knowledge Domain Intelligence Engine.
 *
 * Extended by ADR-013.1 Domain Scoring Strategy.
 */
export function evaluateKnowledgeDomain(
  domain: KnowledgeDomain,
  competencyResults: CompetencyEvaluationResult[]
): KnowledgeDomainEvaluationResult {


  const competencies =
    competencyResults.filter(
      competency =>
        domain.competencies.some(
          domainCompetency =>
            domainCompetency.competencyId ===
            competency.competency.id
        )
    );


  if (competencies.length === 0) {

    return {

      domain,

      score: 0,

      evidenceScore: 0,

      confidence: 0,

      competencyCount: 0,

      competencies: []

    };

  }


  const totalWeight =
    competencies.reduce(
      (
        total,
        competency
      ) => {

        const domainCompetency =
          domain.competencies.find(
            item =>
              item.competencyId ===
              competency.competency.id
          );


        return (
          total +
          (
            domainCompetency?.weight ?? 1
          )
        );

      },
      0
    );


  const score =
    competencies.reduce(
      (
        total,
        competency
      ) => {

        const domainCompetency =
          domain.competencies.find(
            item =>
              item.competencyId ===
              competency.competency.id
          );


        const weight =
          domainCompetency?.weight ?? 1;


        return (
          total +
          (
            competency.competency.score *
            weight
          )
        );

      },
      0
    ) / totalWeight;



  const evidenceScore =
    competencies.reduce(
      (
        total,
        competency
      ) => {

        const domainCompetency =
          domain.competencies.find(
            item =>
              item.competencyId ===
              competency.competency.id
          );


        const weight =
          domainCompetency?.weight ?? 1;


        return (
          total +
          (
            competency.evidence.strengthScore *
            weight
          )
        );

      },
      0
    ) / totalWeight;



  const confidence =
    competencies.reduce(
      (
        total,
        competency
      ) => {

        const domainCompetency =
          domain.competencies.find(
            item =>
              item.competencyId ===
              competency.competency.id
          );


        const weight =
          domainCompetency?.weight ?? 1;


        return (
          total +
          (
            competency.evidence.confidence *
            weight
          )
        );

      },
      0
    ) / totalWeight;



  return {

    domain,

    score,

    evidenceScore,

    confidence,

    competencyCount:
      competencies.length,

    competencies

  };

}