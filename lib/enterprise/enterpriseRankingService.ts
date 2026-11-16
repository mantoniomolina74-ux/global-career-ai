
import {
  getApplicationRecords,
  type ApplicationRecord,
} from "@/lib/engine/applications/applicationInsights";

import {
  getATSResult,
  type ATSResult,
} from "@/lib/db/repositories/atsRepository";

import {
  runRankingEngine,
} from "@/lib/engine/applications/rankingEngine";

import type {
  ScoringResult,
} from "@/lib/engine/contracts/engineContracts";

/**
 * ============================================================
 * Global Career AI
 * Enterprise V1.0
 * Candidate Ranking Service
 * ============================================================
 *
 * Enterprise ranking is built from real persisted candidate
 * applications and application-specific ATS intelligence.
 *
 * This service does NOT perform authorization.
 *
 * Authorization and organization membership must be enforced
 * by the Enterprise API route before calling this service.
 *
 * Ranking remains application-based internally so every ranked
 * result is traceable to:
 *
 * candidateUserId -> applicationId -> persisted ATS evidence
 *
 * No artificial candidate score is generated.
 * ============================================================
 */

export interface EnterpriseRankingInput {
  candidateUserIds: string[];
}

export interface EnterpriseRankingItem {
  candidateUserId: string;
  applicationId: string;
  finalScore: number;
  rank: number;
}

export interface EnterpriseRankingResult {
  items: EnterpriseRankingItem[];

  meta: {
    candidatesProcessed: number;
    applicationsProcessed: number;
    atsApplicationsRanked: number;
    generatedAt: string;
    strategy: "score_desc" | "weighted" | "hybrid";
  };
}

interface RankingApplication {
  candidateUserId: string;
  application: ApplicationRecord;
  ats: ATSResult;
}

/**
 * Builds the scoring input consumed by the existing Ranking V3
 * engine.
 *
 * Only applications with persisted ATS intelligence are ranked.
 *
 * Applications without ATS are excluded rather than converted
 * into artificial zero scores.
 */
function buildScoringResult(
  applications: RankingApplication[]
): ScoringResult {
  return {
    items: applications.map(
      ({
        candidateUserId: _candidateUserId,
        application,
        ats,
      }) => ({
        applicationId: String(application.id),
        score: ats.atsScore,
        breakdown: {
          atsScore: ats.atsScore,
        },
        signals: [
          ...ats.matchedSkills.map(
            (skill) =>
              `matched:${skill}`
          ),
          ...ats.missingSkills.map(
            (skill) =>
              `missing:${skill}`
          ),
        ],
      })
    ),

    metadata: {
      processedAt:
        new Date().toISOString(),

      modelVersion:
        "enterprise-ranking-v1",
    },
  };
}

/**
 * ============================================================
 * ENTERPRISE CANDIDATE RANKING
 * ============================================================
 */

export async function getEnterpriseCandidateRanking(
  input: EnterpriseRankingInput
): Promise<EnterpriseRankingResult> {

  if (
    !input ||
    !Array.isArray(
      input.candidateUserIds
    )
  ) {
    throw new Error(
      "Candidate user IDs are required"
    );
  }

  const uniqueCandidateUserIds =
    Array.from(
      new Set(
        input.candidateUserIds
          .filter(
            (
              userId
            ): userId is string =>
              typeof userId === "string"
          )
          .map(
            (userId) =>
              userId.trim()
          )
          .filter(Boolean)
      )
    );

  if (
    uniqueCandidateUserIds.length === 0
  ) {
    return {
      items: [],

      meta: {
        candidatesProcessed: 0,
        applicationsProcessed: 0,
        atsApplicationsRanked: 0,
        generatedAt:
          new Date().toISOString(),
        strategy: "hybrid",
      },
    };
  }

  const rankingApplications:
    RankingApplication[] = [];

  let applicationsProcessed = 0;

  /**
   * ----------------------------------------------------------
   * CANDIDATE APPLICATIONS
   * ----------------------------------------------------------
   *
   * Each candidate's applications are loaded through the
   * existing persisted application reader.
   * ----------------------------------------------------------
   */

  for (
    const candidateUserId
    of uniqueCandidateUserIds
  ) {

    const applications =
      await getApplicationRecords(
        candidateUserId
      );

    applicationsProcessed +=
      applications.length;

    /**
     * --------------------------------------------------------
     * APPLICATION ATS
     * --------------------------------------------------------
     *
     * ATS is loaded from the application-specific persistence
     * layer. Missing ATS means the application is not ranked.
     * --------------------------------------------------------
     */

    for (
      const application
      of applications
    ) {

      const ats =
        await getATSResult(
          application.id
        );

      if (!ats) {
        continue;
      }

      rankingApplications.push({
        candidateUserId,
        application,
        ats,
      });
    }
  }

  /**
   * ----------------------------------------------------------
   * RANKING
   * ----------------------------------------------------------
   *
   * Reuses the existing Ranking V3 engine.
   * ----------------------------------------------------------
   */

  if (
    rankingApplications.length === 0
  ) {
    return {
      items: [],

      meta: {
        candidatesProcessed:
          uniqueCandidateUserIds.length,

        applicationsProcessed,

        atsApplicationsRanked: 0,

        generatedAt:
          new Date().toISOString(),

        strategy: "hybrid",
      },
    };
  }

  const scoringResult =
    buildScoringResult(
      rankingApplications
    );

  const rankingResult =
    runRankingEngine(
      scoringResult
    );

  /**
   * ----------------------------------------------------------
   * ENTERPRISE RESULT
   * ----------------------------------------------------------
   *
   * Restore candidate identity after the shared ranking engine
   * has ranked application IDs.
   * ----------------------------------------------------------
   */

  const candidateByApplicationId =
    new Map<
      string,
      string
    >(
      rankingApplications.map(
        ({
          candidateUserId,
          application,
        }) => [
          String(application.id),
          candidateUserId,
        ]
      )
    );

  const items =
    rankingResult.items
      .map(
        (item) => {

          const candidateUserId =
            candidateByApplicationId.get(
              item.applicationId
            );

          if (!candidateUserId) {
            return null;
          }

          return {
            candidateUserId,
            applicationId:
              item.applicationId,
            finalScore:
              item.finalScore,
            rank:
              item.rank,
          };
        }
      )
      .filter(
        (
          item
        ): item is EnterpriseRankingItem =>
          item !== null
      );

  return {
    items,

    meta: {
      candidatesProcessed:
        uniqueCandidateUserIds.length,

      applicationsProcessed,

      atsApplicationsRanked:
        rankingApplications.length,

      generatedAt:
        new Date().toISOString(),

      strategy:
        rankingResult.metadata.strategy,
    },
  };
}