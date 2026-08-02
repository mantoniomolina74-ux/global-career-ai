import type { KnowledgeProfile } from "@/lib/knowledge/knowledgeTypes";

import type { KnowledgeState } from "../../contracts/intelligence/knowledgeState";

/**
 * ============================================================
 * Knowledge State Adapter (V1.1)
 * ============================================================
 * Maps KnowledgeProfile output into the CareerState
 * knowledge domain contract.
 * ============================================================
 */
export function buildKnowledgeState(
  profile: KnowledgeProfile
): KnowledgeState {
  return {
    dominantDomainId: profile.dominantDomainId,

    averageScore: profile.averageScore,

    averageConfidence: profile.averageConfidence,

    domains: profile.domains.map(domain => ({
      domain: {
        id: domain.domain.id,
        name: domain.domain.name,
      },

      score: domain.score,

      confidence: domain.confidence,
    })),
  };
}