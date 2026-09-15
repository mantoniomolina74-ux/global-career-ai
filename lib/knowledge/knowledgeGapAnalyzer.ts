import type {
  KnowledgeProfile,
  KnowledgeDomainEvaluationResult
} from "./knowledgeTypes";

import {
  professionalCompetencies
} from "./competencies/professionalCompetencies";

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

function getKnowledgeLevel(score: number): KnowledgeLevel {
  if (score >= 0.90) return "expert";
  if (score >= 0.70) return "advanced";
  if (score >= 0.40) return "intermediate";
  return "beginner";
}

function getLearningFactor(gapScore: number): number {
  if (gapScore >= 70) return 0.60;
  if (gapScore >= 40) return 0.50;
  if (gapScore >= 20) return 0.35;
  return 0.25;
}

export function analyzeKnowledgeGaps(
  profile: KnowledgeProfile,
  domainEvaluations: KnowledgeDomainEvaluationResult[]
): KnowledgeGapResult {
  const strengths: KnowledgeStrength[] = [];
  const weaknesses: KnowledgeWeakness[] = [];

  for (const domain of profile.domains) {
    const level = getKnowledgeLevel(domain.score);

    if (domain.score >= 0.70) {
      strengths.push({
        domainId: domain.domain.id,
        domainName: domain.domain.name,
        score: domain.score,
        level,
      });
    } else {
      weaknesses.push({
        domainId: domain.domain.id,
        domainName: domain.domain.name,
        score: domain.score,
        level,
      });
    }
  }

  const gaps: KnowledgeGap[] = [];

  for (const evaluation of domainEvaluations) {
    if (evaluation.domain.competencies.length === 0) continue;

    for (const requiredCompetency of evaluation.domain.competencies) {
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

      if (currentScore >= 40) continue;

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
            professionalCompetencies.find(
              competency =>
                competency.id ===
                requiredCompetency.competencyId
            )?.name ??
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
      .map(gap => ({
        competencyId: gap.competencyId,
        domainId: gap.domainId,
        priorityScore:
          gap.gapScore * gap.importance,
        estimatedImpact:
          gap.importance,
      }))
      .sort(
        (a, b) =>
          b.priorityScore -
          a.priorityScore
      );

  const recommendations: LearningRecommendation[] =
    priorities.map(priority => ({
      id:
        `recommendation-${priority.competencyId}`,
      title:
        `Improve ${priority.competencyId}`,
      description:
        "Recommended learning area based on detected knowledge gap.",
      competencyIds: [
        priority.competencyId
      ],
      domainIds: [
        priority.domainId
      ],
      estimatedScoreImprovement:
        priority.estimatedImpact,
      priority:
        priority.priorityScore,
    }));

  const totalImportance =
    domainEvaluations.reduce(
      (total, evaluation) =>
        total +
        evaluation.domain.competencies.reduce(
          (domainTotal, competency) =>
            domainTotal + competency.weight,
          0
        ),
      0
    );

  const weightedLearningPotential =
    gaps.reduce(
      (total, gap) =>
        total +
        gap.gapScore *
        gap.importance *
        getLearningFactor(gap.gapScore),
      0
    );

  const improvementNormalized =
    totalImportance > 0
      ? weightedLearningPotential /
        (totalImportance * 100)
      : 0;

  const improvement:
    KnowledgeImprovementEstimate =
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