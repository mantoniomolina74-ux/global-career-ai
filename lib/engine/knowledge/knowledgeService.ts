/**
 * ============================================================
 * Global Career AI
 * Knowledge Service
 * Application Layer
 * ------------------------------------------------------------
 * Official entry point for consuming Knowledge insights.
 *
 * This service acts as the public boundary between the
 * Application Layer and the Knowledge Layer.
 * ============================================================
 */

import { KnowledgeEngine } from "../learning/knowledge/knowledgeEngine";

import type {
  KnowledgeQuery,
  KnowledgeResult,
} from "../learning/knowledge/contracts/knowledge.contracts";

import type {
  CareerKnowledgeInsights,
  KnowledgeHealth,
  SimilarProfile,
} from "./knowledgeService.contracts";

import type {
  CareerKnowledgeRequest,
} from "./knowledgeService.requests";

export class KnowledgeService {
  constructor(
    private readonly engine: KnowledgeEngine = new KnowledgeEngine()
  ) {}

  /**
   * ------------------------------------------------------------
   * Career Insights
   * ------------------------------------------------------------
   */
  getCareerInsights(
    request: CareerKnowledgeRequest
  ): CareerKnowledgeInsights {

    const query: KnowledgeQuery = {
      skills: request.candidateSkills,
      industry: request.industry,
      country: request.country,
      minimumScore: request.minimumConfidence,
      limit: request.limit,
    };

    const results: KnowledgeResult[] = this.engine.query(query);

    const topSkills = new Set<string>();
    const industries = new Set<string>();
    const countries = new Set<string>();

    let confidence = 0;

    for (const result of results) {
      confidence += result.confidence ?? 0;

      result.entry.semantic.skills.forEach(skill =>
        topSkills.add(skill)
      );

      if (result.entry.semantic.industry) {
        industries.add(result.entry.semantic.industry);
      }

      if (result.entry.semantic.country) {
        countries.add(result.entry.semantic.country);
      }
    }

    return {
      totalMatches: results.length,

      averageConfidence:
        results.length === 0
          ? 0
          : confidence / results.length,

      topSkills: [...topSkills],

      industries: [...industries],

      countries: [...countries],

      recommendationsFound: results.length > 0,
    };
  }

  /**
   * ------------------------------------------------------------
   * Similar Profiles
   * ------------------------------------------------------------
   */
  getSimilarProfiles(
    id: string,
    limit: number = 5
  ): SimilarProfile[] {

    return this.engine
      .similar(id, limit)
      .map(result => ({
        applicationId: result.entry.metadata.applicationId,
        similarity: result.similarity ?? 0,
        confidence: result.confidence ?? 0,
      }));
  }

  /**
   * ------------------------------------------------------------
   * Knowledge Health
   * ------------------------------------------------------------
   */
  getKnowledgeHealth(): KnowledgeHealth {

    const stats = this.engine.statistics();

    return {
      totalEntries: stats.totalEntries,
      averageConfidence: stats.averageConfidence,
      averageScore: stats.averageScore,
      lastUpdated: stats.lastUpdated,
    };
  }
}