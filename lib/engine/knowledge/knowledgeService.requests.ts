/**
 * ============================================================
 * Global Career AI
 * Knowledge Service
 * Application Requests
 * ------------------------------------------------------------
 * Public request contracts exposed to the
 * Application Layer.
 *
 * These contracts intentionally hide the
 * internal KnowledgeQuery implementation.
 * ============================================================
 */

export interface CareerKnowledgeRequest {
  candidateSkills: string[];

  industry?: string;

  country?: string;

  minimumConfidence?: number;

  limit?: number;
}

export interface SimilarProfilesRequest {
  applicationId: string;

  limit?: number;
}