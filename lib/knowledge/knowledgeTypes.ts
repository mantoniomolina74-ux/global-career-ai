import {
  CompetencyEvaluationResult
} from "./scoring/competencyTypes";


/**
 * Competency weighting inside a knowledge domain.
 *
 * Produced by ADR-013.1 Domain Scoring Strategy.
 */
export interface KnowledgeDomainCompetencyWeight {

  /**
   * Competency identifier.
   */
  competencyId: string;


  /**
   * Relative importance inside the domain.
   *
   * Default reference value:
   * 1.0 = standard importance.
   */
  weight: number;
}


/**
 * Static definition of a knowledge domain.
 *
 * Produced by ADR-013 Knowledge Domain Intelligence Engine.
 *
 * Extended by:
 * - ADR-013.1 Domain Scoring Strategy.
 * - ADR-013.2 Knowledge Domain Hierarchy.
 */
export interface KnowledgeDomain {

  /**
   * Unique domain identifier.
   */
  id: string;


  /**
   * Human-readable domain name.
   */
  name: string;


  /**
   * Parent knowledge domain identifier.
   *
   * Used by ADR-013.2 Knowledge Domain Hierarchy.
   *
   * Root domains do not define a parent.
   */
  parentDomainId?: string;


  /**
   * Weighted competencies belonging to this domain.
   */
  competencies: KnowledgeDomainCompetencyWeight[];
}


/**
 * Runtime evaluation result for a knowledge domain.
 *
 * Produced by ADR-013 Knowledge Domain Intelligence Engine.
 */
export interface KnowledgeDomainEvaluationResult {

  /**
   * Domain evaluated.
   */
  domain: KnowledgeDomain;


  /**
   * Weighted competency score.
   */
  score: number;


  /**
   * Weighted evidence quality.
   */
  evidenceScore: number;


  /**
   * Overall confidence.
   */
  confidence: number;


  /**
   * Number of competencies detected.
   */
  competencyCount: number;


  /**
   * Competencies contributing to this evaluation.
   */
  competencies: CompetencyEvaluationResult[];
}