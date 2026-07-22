import {
  KnowledgeDomainEvaluationResult
} from "../knowledgeTypes";


/**
 * Aggregated knowledge intelligence result.
 *
 * Produced by ADR-013.3 Knowledge Domain Aggregation Layer.
 */
export interface KnowledgeDomainAggregationResult {

  /**
   * Evaluated knowledge domains.
   */
  domains:
    KnowledgeDomainEvaluationResult[];


  /**
   * Domain with highest knowledge score.
   */
  dominantDomainId:
    string | null;


  /**
   * Average domain score.
   */
  averageScore:
    number;


  /**
   * Average confidence across domains.
   */
  averageConfidence:
    number;

}