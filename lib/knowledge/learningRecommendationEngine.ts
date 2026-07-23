import {
  KnowledgeGapResult,
  LearningRecommendation,
  LearningPriority,
} from "./gapAnalysisTypes";

/**
 * ADR-013.5
 * Learning Recommendation Engine
 */
export function generateLearningRecommendations(
  analysis: KnowledgeGapResult
): KnowledgeGapResult {

  const priorities: LearningPriority[] = analysis.gaps
    .map((gap) => ({
      competencyId: gap.competencyId,
      priorityScore: Math.round(gap.gapScore * gap.importance),
      estimatedImpact: gap.importance,
    }))
    .sort((a, b) => b.priorityScore - a.priorityScore);

  const recommendations: LearningRecommendation[] = priorities.map(
    (priority) => ({
      id: `recommendation-${priority.competencyId}`,

      title: `Improve ${priority.competencyId}`,

      description:
        "Recommended to strengthen this competency based on your current knowledge profile.",

      competencyIds: [priority.competencyId],

      domainIds: [],

      estimatedScoreImprovement: priority.estimatedImpact,

      priority: priority.priorityScore,
    })
  );

  return {
    ...analysis,
    priorities,
    recommendations,
  };
}