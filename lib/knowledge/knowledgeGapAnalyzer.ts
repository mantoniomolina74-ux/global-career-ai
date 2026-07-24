import type {
  KnowledgeProfile,
  KnowledgeDomainEvaluationResult
} from "./knowledgeTypes";

import {
  KnowledgeGapResult,
  KnowledgeStrength,
  KnowledgeWeakness,
  KnowledgeGap,
  LearningPriority,
  LearningRecommendation,
  KnowledgeImprovementEstimate,
  KnowledgeLevel,
} from "./gapAnalysisTypes";


/**
 * Converts a numeric score into a knowledge level.
 */
function getKnowledgeLevel(
  score: number
): KnowledgeLevel {

  if (score >= 90) return "expert";

  if (score >= 70) return "advanced";

  if (score >= 40) return "intermediate";

  return "beginner";
}


/**
 * ADR-013.5
 *
 * Knowledge Gap Detection Engine.
 */
export function analyzeKnowledgeGaps(
  profile: KnowledgeProfile,
  domainEvaluations: KnowledgeDomainEvaluationResult[]
): KnowledgeGapResult {


  const strengths: KnowledgeStrength[] = [];

  const weaknesses: KnowledgeWeakness[] = [];


  for (const domain of profile.domains) {

    const level =
      getKnowledgeLevel(
        domain.score
      );


    if (domain.score >= 70) {

      strengths.push({
        domainId:
          domain.domain.id,

        domainName:
          domain.domain.name,

        score:
          domain.score,

        level,
      });

    } else {

      weaknesses.push({
        domainId:
          domain.domain.id,

        domainName:
          domain.domain.name,

        score:
          domain.score,

        level,
      });

    }

  }


  const gaps: KnowledgeGap[] = [];


  for (const evaluation of domainEvaluations) {


    if (
      evaluation.domain.competencies.length === 0
    ) {
      continue;
    }


    for (
      const requiredCompetency
      of evaluation.domain.competencies
    ) {


      const competencyResult =
        evaluation.competencies.find(
          result =>
            result.competency.id ===
            requiredCompetency.competencyId
        );


      const currentScore =
        competencyResult
          ? competencyResult.competency.score * 100
          : 0;


      const targetScore = 100;


      const gapScore =
        Math.max(
          targetScore - currentScore,
          0
        );


      if (gapScore > 0) {

        gaps.push({

          competencyId:
            requiredCompetency.competencyId,

          competencyName:
            requiredCompetency.competencyId,

          domainId:
            evaluation.domain.id,

          importance:
            requiredCompetency.weight,

          currentScore,

          targetScore,

          gapScore,

        });

      }

    }

  }


  const priorities: LearningPriority[] =
    gaps
      .map(
        gap => ({
          competencyId:
            gap.competencyId,

          priorityScore:
            gap.gapScore *
            gap.importance,

          estimatedImpact:
            gap.importance,
        })
      )
      .sort(
        (a,b) =>
          b.priorityScore -
          a.priorityScore
      );


  const recommendations: LearningRecommendation[] =
    priorities.map(
      priority => ({
        id:
          `recommendation-${priority.competencyId}`,

        title:
          `Improve ${priority.competencyId}`,

        description:
          "Recommended learning area based on detected knowledge gap.",

        competencyIds:
          [
            priority.competencyId
          ],

        domainIds:
          [],

        estimatedScoreImprovement:
          priority.estimatedImpact,

        priority:
          priority.priorityScore,

      })
    );


  const improvementValue =
    gaps.length > 0
      ? gaps.reduce(
          (total,gap)=>
            total + gap.gapScore,
          0
        ) / gaps.length
      : 0;


  const improvementNormalized =
  improvementValue / 100;


const improvement: KnowledgeImprovementEstimate =
{
  currentScore:
    profile.averageScore,

  projectedScore:
    Math.min(
      profile.averageScore +
      improvementNormalized,
      1
    ),

  improvement:
    improvementNormalized,
};


  return {

    strengths,

    weaknesses,

    gaps,

    priorities,

    recommendations,

    improvement,

  };

}