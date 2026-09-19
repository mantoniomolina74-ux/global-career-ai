import type { PremiumAnalyticsInsight } from "./premiumAnalyticsContract";
import type { CareerEvolutionInsight } from "./careerEvolutionContract";
import type { PremiumRecommendationInsight } from "./premiumRecommendationContract";

export interface PremiumDashboardIntelligence {

  ats: ATSPremiumInsight;

  careerHealth: CareerHealthInsight;

  marketReadiness: MarketReadinessInsight;

  knowledge: PremiumKnowledgeInsight;

  analytics: PremiumAnalyticsInsight;

  careerEvolution: CareerEvolutionInsight;

  recommendations: PremiumRecommendationInsight;

}



export interface CareerHealthInsight {

  score: number;

  level:
    | "LOW"
    | "MEDIUM"
    | "HIGH";

  components: {

    ats: number;

    matching: number;

    competency: number;

    knowledge: number;

  };

  weights: {

    ats: number;

    matching: number;

    competency: number;

    knowledge: number;

  };

}



export interface MarketReadinessInsight {

  score: number;

  level:
    | "LOW"
    | "MEDIUM"
    | "HIGH";

  components: {

    ats: number;

    matching: number;

    competency: number;

    knowledge: number;

    profile: number;

  };

  weights: {

    ats: number;

    matching: number;

    competency: number;

    knowledge: number;

    profile: number;

  };

}



export interface ATSPremiumInsight {

  overview: {

    score: number;

    keywordScore: number;

    semanticScore: number;

    recommendation: string;

  } | null;



  opportunity: {

    score: number;

    matchedSkills: string[];

    missingSkills: string[];

  } | null;



  summary: {

    matchedSkillCount: number;

    missingSkillCount: number;

  } | null;

}



export interface PremiumKnowledgeInsight {

  score: number;

  level:
    | "LOW"
    | "MEDIUM"
    | "HIGH";

  dominantDomain: string | null;

  averageConfidence: number;

  domains: PremiumKnowledgeDomain[];

  gaps: PremiumKnowledgeGap[];

  priorities: PremiumKnowledgePriority[];

  learningPotential: number;

  projectedScore: number;

}



export interface PremiumKnowledgeDomain {

  id: string;

  name: string;

  score: number;

  confidence: number;

}



export interface PremiumKnowledgeGap {

  competencyId: string;

  competencyName: string;

  domainId: string;

  currentScore: number;

  targetScore: number;

  gapScore: number;

  importance: number;

}



export interface PremiumKnowledgePriority {

  competencyId: string;

  domainId: string;

  priorityScore: number;

  estimatedImpact: number;

}