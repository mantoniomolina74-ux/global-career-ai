import { scoreCompetencies } from "../scoring/competencyScorer";
import { evaluateKnowledgeDomain } from "../evaluation/knowledgeDomainEvaluator";
import { aggregateKnowledgeDomains } from "../aggregation/domainAggregator";
import { knowledgeDomainCatalog } from "../knowledgeDomainCatalog";
import type { KnowledgeProfile } from "../knowledgeTypes";
import { analyzeKnowledgeGaps } from "../knowledgeGapAnalyzer";
import { generateLearningRecommendations } from "../learningRecommendationEngine";
import { emitKnowledgeLearningEvent } from "../adapters/knowledgeLearningAdapter";

export function analyzeKnowledgeProfile(
  professionalText: string,
  options?: { userId?: string; tenantId?: string; }
): {
  profile: KnowledgeProfile;
  analysis: ReturnType<typeof generateLearningRecommendations>;
} {
  const competencyResults = scoreCompetencies(professionalText);

  const domainEvaluations = knowledgeDomainCatalog.map(
    domain => evaluateKnowledgeDomain(domain, competencyResults)
  );

  const aggregation = aggregateKnowledgeDomains(domainEvaluations);

  const profile: KnowledgeProfile = {
    dominantDomainId: aggregation.dominantDomainId,
    averageScore: aggregation.averageScore,
    averageConfidence: aggregation.averageConfidence,
    domains: aggregation.domains.map(domain => ({
      domain: {
        id: domain.domain.id,
        name: domain.domain.name,
      },
      score: domain.score,
      confidence: domain.confidence,
    })),
  };

  const gapAnalysis = analyzeKnowledgeGaps(
    profile,
    domainEvaluations
  );

  console.log(
    "=== KNOWLEDGE GAPS DEBUG ===",
    JSON.stringify(
      {
        profile: {
          dominantDomainId: profile.dominantDomainId,
          averageScore: profile.averageScore,
          averageConfidence: profile.averageConfidence,
        },

        gaps: gapAnalysis.gaps.map(gap => {
          const evaluation = domainEvaluations.find(
            domainEvaluation =>
              domainEvaluation.domain.id === gap.domainId
          );

          const competencyResult =
            evaluation?.competencies.find(
              result =>
                result.competency.id === gap.competencyId
            );

          return {
            domainId: gap.domainId,
            competencyId: gap.competencyId,
            competencyName: gap.competencyName,
            currentScore: gap.currentScore,
            targetScore: gap.targetScore,
            gapScore: gap.gapScore,
            importance: gap.importance,
            priorityScore:
              gap.gapScore * gap.importance,
            evidence: competencyResult
              ? {
                  strengthScore:
                    competencyResult.evidence.strengthScore,
                  strengthLevel:
                    competencyResult.evidence.strengthLevel,
                  confidence:
                    competencyResult.evidence.confidence,
                  evidenceType:
                    competencyResult.evidence.evidenceType,
                  matchedPatterns:
                    competencyResult.evidence.matchedPatterns,
                }
              : null,
          };
        }),

        priorities: gapAnalysis.priorities,

        recommendations: gapAnalysis.recommendations,

        improvement: gapAnalysis.improvement,
      },
      null,
      2
    )
  );

  const learning = generateLearningRecommendations(
    gapAnalysis
  );

  if (options?.userId && options?.tenantId) {
    emitKnowledgeLearningEvent(
      options.userId,
      options.tenantId,
      {
        ...gapAnalysis,
        ...learning,
      }
    );
  }

  return {
    profile,
    analysis: learning,
  };
}
