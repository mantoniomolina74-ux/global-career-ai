/**
 * ============================================================
 * Global Career AI
 * Dashboard Contract V1.1
 * ============================================================
 *
 * Stable contract between:
 *
 * Intelligence Layer
 *          ↓
 * Dashboard Aggregation Layer
 *          ↓
 * User Experience
 *
 * This file contains only domain contracts.
 * No business logic belongs here.
 * ============================================================
 */

export interface DashboardContract {
  metadata: DashboardMetadata;

  executiveSummary: DashboardExecutiveSummary;

  intelligence: DashboardIntelligence;

  recommendations: DashboardRecommendations;

  evidence: DashboardEvidence;

  timeline: DashboardTimeline;

  diagnostics: DashboardDiagnostics;
}
export interface DashboardMetadata {
  userId: string;

  tenantId: string;

  generatedAt: string;

  version: string;
}


export interface DashboardExecutiveSummary {
  overallScore: number;

  careerPosition: string;

  mainStrengths: string[];

  improvementAreas: string[];
}
export interface DashboardIntelligence {
  ats: ATSInsight;

  matching: MatchingInsight;

  competency: CompetencyInsight;

  knowledge: KnowledgeInsight;

  learning: LearningInsight;

  decision: DecisionInsight;
}


export interface ATSInsight {
  score: number;

  strengths: string[];

  improvements: string[];
}


export interface MatchingInsight {
  matchScore: number;

  targetRoles: string[];

  alignmentFactors: string[];
}


export interface CompetencyInsight {
  overallScore: number;

  strongestCompetencies: string[];

  competencyGaps: string[];
}


export interface KnowledgeInsight {
  dominantDomains: string[];

  averageScore: number;

  knowledgeGaps: string[];
}


export interface LearningInsight {
  activePatterns: string[];

  learningSignals: string[];

  recommendedActions: string[];
}


export interface DecisionInsight {
  recommendations: string[];

  confidence: number;
}
export interface DashboardRecommendations {
  priorityActions: Recommendation[];

  quickWins: Recommendation[];

  longTermGoals: Recommendation[];
}


export interface Recommendation {
  title: string;

  description: string;

  category: string;

  priority: "high" | "medium" | "low";

  expectedImpact: string;
}


export interface DashboardEvidence {
  items: EvidenceItem[];

  overallConfidence: number;
}


export interface EvidenceItem {
  source: string;

  description: string;

  confidence: number;

  relevance: "direct" | "related" | "transferable";
}
export interface DashboardTimeline {
  snapshots: TimelineSnapshot[];

  milestones: Milestone[];

  improvements: string[];

  evolutionTrend: string;
}


export interface TimelineSnapshot {
  date: string;

  overallScore: number;

  competencies: string[];

  knowledgeAreas: string[];

  achievements: string[];
}


export interface Milestone {
  title: string;

  description: string;

  date: string;

  impact: string;
}
export interface DashboardDiagnostics {
  traceId: string;

  processingTime: number;

  executionStatus: "SUCCESS" | "PARTIAL" | "FAILED";

  engineVersions: Record<string, string>;

  warnings: string[];

  dataQuality: DataQualityStatus;
}


export interface DataQualityStatus {
  completeness: number;

  confidence: number;

  partialData: boolean;
}