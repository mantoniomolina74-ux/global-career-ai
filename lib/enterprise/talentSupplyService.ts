import {
  getOrganizationMembers,
  type EnterpriseOrganizationMember,
} from "@/lib/enterprise/organizationService";

import { getLatestCandidateCV } from "@/lib/db/repositories/cvRepository";
import {
  getActiveCandidateCertificationNames,
} from "@/lib/enterprise/certificationService";

import {
  buildCandidateEvidence,
} from "@/lib/engine/evidenceAdapter";

import type {
  CandidateEvidence,
} from "@/lib/engine/matchingTypes";

import type {
  TalentSupplyCapability,
  TalentSupplyIntelligence,
} from "@/lib/engine/contracts/intelligence/talentIntelligence";

/**
 * ============================================================
 * Global Career AI
 * Talent Supply Intelligence V1.0
 * ============================================================
 *
 * Aggregates real candidate capability supply for one
 * Enterprise organization.
 *
 * Sources:
 * - organization_members
 * - cv_analyses
 * - existing CandidateEvidence builder
 *
 * Responsibilities:
 * - Analyze real organization members.
 * - Build evidence from real persisted CV analysis.
 * - Aggregate candidate capability supply.
 * - Preserve evidence semantics from CandidateEvidence.
 *
 * Does NOT:
 * - calculate ATS
 * - calculate Matching
 * - calculate Ranking
 * - calculate Talent Score
 * - calculate Market Score
 * - calculate Talent Risk
 * - invent candidate data
 *
 * ============================================================
 */

/**
 * Internal candidate evidence container.
 */
type CandidateSupplyRecord = {
  userId: string;
  evidence: CandidateEvidence[];
};

/**
 * Internal aggregate adds candidate-level traceability
 * required to distinguish unique candidates from evidence
 * counts.
 */
type TalentSupplyAggregate =
  TalentSupplyCapability & {
    candidateIds: Set<string>;
    directCandidateIds: Set<string>;
    transferableCandidateIds: Set<string>;
  };

/**
 * Normalizes a capability name for aggregation.
 */
function normalizeCapability(
  value: string
): string {
  return value.trim();
}

/**
 * Creates a stable comparison key.
 */
function capabilityKey(
  value: string
): string {
  return normalizeCapability(value)
    .toLowerCase();
}

/**
 * Adds a unique string to an array.
 */
function addUnique(
  values: string[],
  value: string
): void {
  const normalized =
    value.trim();

  if (!normalized) {
    return;
  }

  if (
    !values.some(
      (item) =>
        item.toLowerCase() ===
        normalized.toLowerCase()
    )
  ) {
    values.push(normalized);
  }
}

/**
 * Builds evidence for one real organization member.
 *
 * Members without a persisted CV analysis produce no evidence.
 * No synthetic capability is created.
 */
async function buildMemberSupplyRecord(
  member: EnterpriseOrganizationMember
): Promise<CandidateSupplyRecord> {
  const candidateCV =
    await getLatestCandidateCV(
      member.user_id
    );

  if (!candidateCV) {
    return {
      userId: member.user_id,
      evidence: [],
    };
  }

  const candidateCertifications =
    await getActiveCandidateCertificationNames(
      member.user_id
    );

  const evidence =
    buildCandidateEvidence({
      skills:
        candidateCV.skills,
      industries:
        candidateCV.industries,
      candidateCertifications,
    });

  return {
    userId: member.user_id,
    evidence,
  };
}

/**
 * Aggregates candidate evidence into capability supply.
 */
function aggregateSupply(
  records: CandidateSupplyRecord[]
): TalentSupplyCapability[] {
  const capabilityMap =
    new Map<
      string,
      TalentSupplyAggregate
    >();

  for (const record of records) {
    const candidateCapabilities =
      new Set<string>();

    for (const evidence of record.evidence) {
      const capability =
        normalizeCapability(
          evidence.skill
        );

      if (!capability) {
        continue;
      }

      const key =
        capabilityKey(
          capability
        );

      if (
        candidateCapabilities.has(
          key
        )
      ) {
        continue;
      }

      candidateCapabilities.add(
        key
      );

      let aggregate =
        capabilityMap.get(key);

      if (!aggregate) {
        aggregate = {
          capability,
          candidateCount: 0,
          directCandidateCount: 0,
          transferableCandidateCount: 0,
          evidenceCount: 0,
          evidence: {
            direct: 0,
            related: 0,
            transferable: 0,
            irrelevant: 0,
          },
          confidence: {
            high: 0,
            medium: 0,
            low: 0,
          },
          industries: [],
          roles: [],
          candidateIds:
            new Set<string>(),
          directCandidateIds:
            new Set<string>(),
          transferableCandidateIds:
            new Set<string>(),
        };

        capabilityMap.set(
          key,
          aggregate
        );
      }

      aggregate.candidateCount +=
        1;

      aggregate.candidateIds.add(
        record.userId
      );

      for (const candidateEvidence of record.evidence) {
        const evidenceCapability =
          normalizeCapability(
            candidateEvidence.skill
          );

        if (
          capabilityKey(
            evidenceCapability
          ) !== key
        ) {
          continue;
        }

        if (
          candidateEvidence.relevance ===
          "direct"
        ) {
          aggregate.directCandidateIds.add(
            record.userId
          );
        }

        if (
          candidateEvidence.relevance ===
          "transferable"
        ) {
          aggregate.transferableCandidateIds.add(
            record.userId
          );
        }
      }
    }

    for (const evidence of record.evidence) {
      const capability =
        normalizeCapability(
          evidence.skill
        );

      if (!capability) {
        continue;
      }

      const key =
        capabilityKey(
          capability
        );

      const aggregate =
        capabilityMap.get(key);

      if (!aggregate) {
        continue;
      }

      aggregate.evidenceCount +=
        1;

      aggregate.evidence[
        evidence.relevance
      ] += 1;

      aggregate.confidence[
        evidence.confidence
      ] += 1;

      if (evidence.industry) {
        addUnique(
          aggregate.industries,
          evidence.industry
        );
      }

      if (evidence.role) {
        addUnique(
          aggregate.roles,
          evidence.role
        );
      }
    }
  }

  return Array.from(
    capabilityMap.values()
  )
    .map(
      ({
        candidateIds,
        directCandidateIds,
        transferableCandidateIds,
        ...capability
      }) => ({
        ...capability,
        directCandidateCount:
          directCandidateIds.size,
        transferableCandidateCount:
          transferableCandidateIds.size,
      })
    )
    .sort(
      (a, b) =>
        b.candidateCount -
        a.candidateCount
    );
}

/**
 * Builds Talent Supply Intelligence
 * for one Enterprise organization.
 */
export async function getTalentSupplyIntelligence(
  requestingUserId: string,
  organizationId: string
): Promise<TalentSupplyIntelligence> {
  if (
    !requestingUserId ||
    !organizationId
  ) {
    throw new Error(
      "User and organization context are required"
    );
  }

  const members =
    await getOrganizationMembers(
      requestingUserId,
      organizationId
    );

  const records =
    await Promise.all(
      members.map(
        (member) =>
          buildMemberSupplyRecord(
            member
          )
      )
    );

  return {
    candidatesAnalyzed:
      records.length,

    capabilities:
      aggregateSupply(
        records
      ),
  };
}
