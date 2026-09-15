import type {
  ATSPremiumInsight,
  CareerHealthInsight,
  MarketReadinessInsight,
  PremiumKnowledgeInsight,
} from "../contracts/premiumDashboardContract";

import type {
  PremiumAnalyticsInsight,
} from "../contracts/premiumAnalyticsContract";

import {
  buildPremiumAnalyticsInsight,
} from "./premiumAnalyticsService";

import type { ATSState } from "@/lib/engine/contracts/intelligence/atsState";
import type { CareerState } from "@/lib/engine/contracts/careerState";

import type {
  CareerApplication,
  CareerOrchestratorInput,
} from "@/lib/engine/contracts/engineContracts";

import {
  getApplicationRecords,
} from "@/lib/engine/applications/applicationInsights";

import {
  runCareerOrchestratorV7,
} from "@/lib/engine/orchestration/careerOrchestrator.v7";

import {
  buildCareerState,
} from "@/lib/engine/builders/careerStateBuilder";

import {
  getLearningDashboardInsight,
} from "./learningDashboardService";

import {
  calculateCareerOverallHealth,
} from "@/lib/engine/intelligence/calculators/career/careerOverallHealthCalculator";

import {
  calculateMarketReadiness,
} from "@/lib/engine/intelligence/calculators/market/marketReadinessCalculator";

import {
  CAREER_INSIGHTS_WEIGHTS,
} from "@/lib/engine/intelligence/weights/careerInsightsWeights";

import {
  getJobById,
} from "@/lib/jobs/getJobById";

import {
  supabaseServer,
} from "@/lib/supabase-server";

import {
  extractCVText,
} from "@/lib/extract-cv";

import {
  calculateATS,
} from "@/lib/engine/applications/atsEngine";

import {
  extractJobRequirements,
} from "@/lib/engine/applications/jobRequirementExtractor";

import {
  analyzeKnowledgeProfile,
} from "@/lib/knowledge/services/knowledgeProfileService";


export interface PremiumATSOpportunitySource {

  atsScore: number;

  matchedSkills: string[];

  missingSkills: string[];

}


export interface PremiumATSContext {

  atsState?: ATSState;

  opportunityATS?: PremiumATSOpportunitySource | null;

}


export interface PremiumATSData {

  insight: ATSPremiumInsight;

  careerState: CareerState | null;

  careerHealth: CareerHealthInsight;

  marketReadiness: MarketReadinessInsight;

  knowledge?: PremiumKnowledgeInsight;

  analytics: PremiumAnalyticsInsight;

  careerStateAvailable: boolean;

  applicationsProcessed: number;

}


type CVAnalysisRecord = {

  ats_score?: number | null;

  file_url?: string | null;

  skills?: string[] | string | null;

  industries?: string[] | string | null;

};


function normalizeStringArray(
  value: string[] | string | null | undefined
): string[] {

  if (Array.isArray(value)) {
    return value.filter(
      (item): item is string =>
        typeof item === "string" &&
        item.trim().length > 0
    );
  }

  if (typeof value === "string") {

    try {

      const parsed =
        JSON.parse(value);

      if (Array.isArray(parsed)) {

        return parsed.filter(
          (item): item is string =>
            typeof item === "string" &&
            item.trim().length > 0
        );

      }

    } catch {
      return value
        .split(",")
        .map((item) => item.trim())
        .filter(Boolean);
    }

  }

  return [];

}


async function getLatestCVAnalysis(
  userId: string
): Promise<CVAnalysisRecord | null> {

  const {
    data,
    error,
  } = await supabaseServer
    .from("cv_analyses")
    .select("ats_score, skills, industries, file_url")
    .eq("user_id", userId)
    .order("created_at", {
      ascending: false,
    })
    .limit(1)
    .maybeSingle();

  if (error) {

    throw new Error(
      `Failed to fetch latest CV analysis: ${error.message}`
    );

  }

  return data
    ? (data as CVAnalysisRecord)
    : null;

}


async function buildCareerApplications(
  userId: string,
  candidateSkills: string[],
  cvStrengthScore: number
): Promise<CareerApplication[]> {

  const applications =
    await getApplicationRecords(
      userId
    );

  const careerApplications:
    CareerApplication[] = [];

  for (const application of applications) {

    if (!application.job_id) {
      continue;
    }

    const job =
      await getJobById(
        application.job_id
      );

    if (!job) {
      continue;
    }

    careerApplications.push({

      applicationId:
        String(application.id),

      title:
        job.title ??
        application.position,

      industry:
        job.industry ??
        application.industry,

      country:
        job.country ??
        application.country,

      category: job.category ?? undefined,

      tags: job.tags ?? undefined,

      candidateSkills,

      jobDescription:
        [job.title, job.description]
          .filter(Boolean)
          .join("\n"),

      cvStrengthScore,

    });

  }

  return careerApplications;

}


async function runPremiumCareerIntelligence(
  userId: string
) {

  const cv =
    await getLatestCVAnalysis(
      userId
    );

  if (!cv) {

    return {
      careerState: null,
      applicationsProcessed: 0,
    };

  }

  const candidateSkills =
    normalizeStringArray(
      cv.skills
    );

  const cvStrengthScore =
    typeof cv.ats_score === "number"
      ? cv.ats_score
      : 50;

  const applications =
    await buildCareerApplications(
      userId,
      candidateSkills,
      cvStrengthScore
    );

  if (applications.length === 0) {

    return {
      careerState: null,
      applicationsProcessed: 0,
    };

  }

  let professionalText = "";

  if (cv.file_url) {

    const response = await fetch(cv.file_url);

    if (!response.ok) {
      throw new Error(
        `Failed to download CV: ${response.status} ${response.statusText}`
      );
    }

    const arrayBuffer = await response.arrayBuffer();

    professionalText =
      await extractCVText(
        Buffer.from(arrayBuffer)
      );

  }

  const orchestratorInput:
    CareerOrchestratorInput = {

      userId,

      tenantId:
        userId,

      profile: {
        professionalText,
      },

      applications,

      candidateSkills,

      candidateCertifications: [],

      requiredSkills: [],

      jobDescription:
        applications[0]?.jobDescription ??
        "",

      cvStrengthScore,

    };

  const orchestratorResult =
    await runCareerOrchestratorV7(
      orchestratorInput
    );

  const careerState =
    buildCareerState(
      orchestratorResult
    );
      const learningInsight =
  await getLearningDashboardInsight({
    userId,
    tenantId: userId,
  });
  
console.log(
  "=== LEARNING INSIGHT BEFORE ASSIGNMENT ===",
  JSON.stringify(learningInsight, null, 2)
);
careerState.intelligence.learning =
  learningInsight;

  console.log(
    "=== PREMIUM KNOWLEDGE DEBUG ===",
    JSON.stringify({
      fileUrlExists: Boolean(cv.file_url),
      professionalTextLength:
        orchestratorResult.profile?.professionalText?.length ?? 0,
      knowledge:
        careerState.intelligence.knowledge,
    }, null, 2)
  );

  return {
    careerState,
    applicationsProcessed:
      applications.length,
    professionalText,
  };

}


function buildCareerHealthInsight(
  careerState: NonNullable<
    Awaited<
      ReturnType<typeof runPremiumCareerIntelligence>
    >["careerState"]
  >
): CareerHealthInsight {

  const score =
    calculateCareerOverallHealth(
      careerState
    );

  const components = {

    ats:
      careerState.intelligence.ats?.score ?? 0,

    matching:
      careerState.intelligence.matching?.score ?? 0,

    competency:
      (careerState.intelligence.competency?.overallScore ?? 0) * 100,

    knowledge:
      (careerState.intelligence.knowledge?.averageScore ?? 0) * 100,

  };

  return {

    score,

    level:
      score >= 80
        ? "HIGH"
        : score >= 60
          ? "MEDIUM"
          : "LOW",

    components,

    weights:
      CAREER_INSIGHTS_WEIGHTS,

  };

}


function calculateProfileReadiness(
  state: CareerState
): number {

  const readiness =
    state.readiness;

  const skillsScore =
    Math.min(
      readiness.skillCount * 10,
      100
    );

  const certificationScore =
    Math.min(
      readiness.certificationCount * 20,
      100
    );

  const hasProfessionalProfile =
    Boolean(
      state.profileIntelligence.careerLevel
    );

  const profileCompleteness =
    hasProfessionalProfile
      ? 100
      : 0;

  return Math.round(
    skillsScore * 0.50 +
    certificationScore * 0.25 +
    profileCompleteness * 0.25
  );

}


function buildMarketReadinessInsight(
  careerState: CareerState
): MarketReadinessInsight {

  const score =
    calculateMarketReadiness(
      careerState
    );

  const components = {

    ats:
      careerState.intelligence.ats?.score ??
      careerState.readiness.atsScore ??
      0,

    matching:
      careerState.intelligence.matching?.score ??
      0,

    competency:
      (careerState.intelligence.competency?.overallScore ?? 0) * 100,

    knowledge:
      (careerState.intelligence.knowledge?.averageScore ?? 0) * 100,

    profile:
      calculateProfileReadiness(
        careerState
      ),

  };

  return {

    score,

    level:
      score >= 80
        ? "HIGH"
        : score >= 60
          ? "MEDIUM"
          : "LOW",

    components,

    weights: {

      ats: 0.25,

      matching: 0.25,

      competency: 0.20,

      knowledge: 0.15,

      profile: 0.15,

    },

  };

}


function buildPremiumKnowledgeInsight(
  professionalText: string
): PremiumKnowledgeInsight {

  const result = analyzeKnowledgeProfile(
    professionalText
  );

  const score =
    result.profile.averageScore * 100;

  return {

    score,

    level:
      score >= 80
        ? "HIGH"
        : score >= 60
          ? "MEDIUM"
          : "LOW",

    dominantDomain:
      result.profile.dominantDomainId
        ? result.profile.domains.find(
            domain =>
              domain.domain.id ===
              result.profile.dominantDomainId
          )?.domain.name ?? null
        : null,

    averageConfidence:
      result.profile.averageConfidence,

    domains:
      result.profile.domains.map(
        domain => ({
          id: domain.domain.id,
          name: domain.domain.name,
          score: domain.score * 100,
          confidence: domain.confidence,
        })
      ),

    gaps:
      result.analysis.gaps.map(
        gap => ({
          competencyId:
            gap.competencyId,
          competencyName:
            gap.competencyName,
          domainId:
            gap.domainId,
          currentScore:
            gap.currentScore,
          targetScore:
            gap.targetScore,
          gapScore:
            gap.gapScore,
          importance:
            gap.importance,
        })
      ),

    priorities:
      result.analysis.priorities.map(
        priority => ({
          competencyId:
            priority.competencyId,
          domainId:
            priority.domainId,
          priorityScore:
            priority.priorityScore,
          estimatedImpact:
            priority.estimatedImpact,
        })
      ),

    learningPotential:
      result.analysis.improvement.improvement *
      100,

    projectedScore:
      result.analysis.improvement.projectedScore *
      100,
  };

}


export async function getPremiumDashboardData(
  userId: string,
  jobId?: string
): Promise<PremiumATSData> {

  const {
    careerState,
    applicationsProcessed,
    professionalText,
  } =
    await runPremiumCareerIntelligence(
      userId
    );

  const knowledge =
    professionalText
      ? buildPremiumKnowledgeInsight(
          professionalText
        )
      : undefined;

  const atsState =
    careerState?.intelligence?.ats;

  const insight =
    await getPremiumATSInsight(
      userId,
      atsState,
      jobId
    );

  const careerHealth =
    careerState
      ? buildCareerHealthInsight(
          careerState
        )
      : {
          score: 0,
          level: "LOW" as const,
          components: {
            ats: 0,
            matching: 0,
            competency: 0,
            knowledge: 0,
          },
          weights:
            CAREER_INSIGHTS_WEIGHTS,
        };

  const marketReadiness =
    careerState
      ? buildMarketReadinessInsight(
          careerState
        )
      : {
          score: 0,
          level: "LOW" as const,
          components: {
            ats: 0,
            matching: 0,
            competency: 0,
            knowledge: 0,
            profile: 0,
          },
          weights: {
            ats: 0.25,
            matching: 0.25,
            competency: 0.20,
            knowledge: 0.15,
            profile: 0.15,
          },
        };

  const analytics =
    careerState
      ? await buildPremiumAnalyticsInsight(
          userId,
          careerState,
          careerHealth.score,
          marketReadiness.score
        )
      : {
          careerPerformance: {
            ats: 0,
            matching: 0,
            competency: 0,
            knowledge: 0,
            careerHealth: 0,
            marketReadiness: 0,
          },
          applicationPerformance: {
            totalApplications: 0,
            activePipeline: 0,
            responseRate: 0,
            rejectionRate: 0,
            conversionRate: 0,
            offerRate: 0,
            successRate: 0,
            statusBreakdown: {},
          },
          opportunityPerformance: {
            evaluatedOpportunities: 0,
            averageScore: 0,
            topScore: 0,
            topOpportunities: [],
            targetRoles: [],
            matchedSkills: [],
            matchedIndustries: [],
          },
          careerSignals: {
            strengths: [],
            gaps: [],
            improvementAreas: [],
            recommendations: [],
          },
        };

  return {
  insight,
  careerHealth,
  marketReadiness,
  knowledge,
  analytics,
  careerState,
  careerStateAvailable: Boolean(careerState),
  applicationsProcessed,
};

}


export async function getPremiumATSInsight(
  userId: string,
  atsState?: ATSState,
  jobId?: string
): Promise<ATSPremiumInsight> {

  let opportunityATS:
    PremiumATSOpportunitySource | null = null;

  if (jobId) {

    const job =
      await getJobById(jobId);

    const cv =
      await getLatestCVAnalysis(userId);

    if (job && cv) {

      const candidateSkills =
        normalizeStringArray(
          cv.skills
        );

      const cvStrengthScore =
        typeof cv.ats_score === "number"
          ? cv.ats_score
          : 50;

      let professionalText = "";

      if (cv.file_url) {

        const response = await fetch(cv.file_url);

        if (!response.ok) {
          throw new Error(
            `Failed to download CV: ${response.status} ${response.statusText}`
          );
        }

        const arrayBuffer =
          await response.arrayBuffer();

        professionalText =
          await extractCVText(
            Buffer.from(arrayBuffer)
          );

      }

      const requiredSkills =
        extractJobRequirements(
          job.description ?? ""
        );

      const ats =
        await calculateATS(
          requiredSkills,
          candidateSkills,
          job.description ?? "",
          cvStrengthScore,
          undefined,
          undefined,
          professionalText
        );

      console.log(
        "=== OPPORTUNITY ATS DEBUG ===",
        JSON.stringify(
          {
            jobId,
            jobTitle: job.title,
            candidateSkills,
            cvStrengthScore,
            professionalTextLength: professionalText.length,
            requiredSkills,
            evidence: ats.data.evidence,
          },
          null,
          2
        )
      );

      opportunityATS = {

        atsScore:
          ats.data.atsScore,

        matchedSkills:
          ats.data.matchedSkills,

        missingSkills:
          ats.data.missingSkills,

      };

    }

  }

  return buildPremiumATSInsight({

    atsState,

    opportunityATS,

  });

}


export function buildPremiumATSInsight(
  context: PremiumATSContext
): ATSPremiumInsight {

  const ats =
    context.atsState;

  const opportunityATS =
    context.opportunityATS ?? null;

  const matchedSkills =
    opportunityATS?.matchedSkills ?? [];

  const missingSkills =
    opportunityATS?.missingSkills ?? [];

  return {

    overview:
      ats
        ? {

            score:
              ats.score,

            keywordScore:
              ats.keywordScore,

            semanticScore:
              ats.semanticScore,

            recommendation:
              ats.recommendation,

          }

        : null,

    opportunity:
      opportunityATS
        ? {

            score:
              opportunityATS.atsScore,

            matchedSkills,

            missingSkills,

          }

        : null,

    summary:
      opportunityATS
        ? {

            matchedSkillCount:
              matchedSkills.length,
            missingSkillCount:
              missingSkills.length,

          }

        : null,

  };

}