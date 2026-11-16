import { supabaseServer } from "@/lib/supabase-server";

import {
  buildJobIntelligence,
} from "@/lib/engine/intelligence/jobIntelligenceBuilder";

import type {
  JobDetail,
} from "@/lib/jobs/getJobById";

import type {
  TalentDemandCapability,
  TalentDemandIntelligence,
} from "@/lib/engine/contracts/intelligence/talentIntelligence";

/**
 * ============================================================
 * Global Career AI
 * Talent Demand Intelligence V1.0
 * ============================================================
 *
 * Aggregates real organizational job demand.
 *
 * Source:
 * - public.jobs
 * - Hirebase active jobs only
 * - Job Intelligence V1.0
 *
 * Responsibilities:
 * - Load real persisted Hirebase jobs.
 * - Exclude inactive jobs.
 * - Reuse Job Intelligence extraction.
 * - Aggregate capability demand.
 * - Preserve requirement categories.
 *
 * Does NOT:
 * - call the Hirebase API
 * - calculate ATS
 * - calculate Matching
 * - calculate Ranking
 * - calculate Talent Score
 * - calculate Market Score
 * - invent job data
 *
 * ============================================================
 */

function normalizeCapability(value: string): string {
  return value.trim();
}

function capabilityKey(value: string): string {
  return normalizeCapability(value).toLowerCase();
}

function addUnique(
  values: string[],
  value: string
): void {
  const normalized = value.trim();

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

function mapJobRowToJobDetail(
  row: Record<string, unknown>
): JobDetail {
  return {
    id: String(row.id ?? ""),
    title:
      typeof row.title === "string"
        ? row.title
        : null,
    company:
      typeof row.company === "string"
        ? row.company
        : null,
    location:
      typeof row.location === "string"
        ? row.location
        : null,
    country:
      typeof row.country === "string"
        ? row.country
        : null,
    industry:
      typeof row.industry === "string"
        ? row.industry
        : null,
    description:
      typeof row.description === "string"
        ? row.description
        : null,
    url:
      typeof row.url === "string"
        ? row.url
        : null,
    source:
      typeof row.source === "string"
        ? row.source
        : null,
    category:
      typeof row.category === "string"
        ? row.category
        : null,
    tags:
      typeof row.tags === "string"
        ? row.tags
        : null,
    created_at:
      typeof row.created_at === "string"
        ? row.created_at
        : null,
  };
}

export async function getTalentDemandIntelligence(
  organizationId: string
): Promise<TalentDemandIntelligence> {
  if (!organizationId) {
    throw new Error(
      "Organization context is required"
    );
  }

  /**
   * Organization context is intentionally required
   * by the public contract.
   *
   * V1.0 demand is based on the real Hirebase
   * job catalog available to the Enterprise system.
   *
   * The organization does not yet restrict the
   * global Hirebase demand dataset to a private
   * organization-specific job pool.
   */

  const {
    data: jobs,
    error,
  } = await supabaseServer
    .from("jobs")
    .select("*")
    .eq("source", "hirebase")
    .eq("is_active", true);

  if (error) {
    throw new Error(
      `Error obteniendo empleos para Talent Demand: ${error.message}`
    );
  }

  if (!jobs || jobs.length === 0) {
    return {
      jobsAnalyzed: 0,
      capabilities: [],
    };
  }

  const capabilityMap =
    new Map<
      string,
      TalentDemandCapability
    >();

  for (const row of jobs) {
    const job =
      mapJobRowToJobDetail(
        row as Record<string, unknown>
      );

    if (!job.id) {
      continue;
    }

    const intelligence =
      buildJobIntelligence(job);

    const seenRequirements =
      new Set<string>();

    for (const requirement of intelligence.requirements) {
      const capability =
        normalizeCapability(
          requirement.name
        );

      if (!capability) {
        continue;
      }

      const key =
        capabilityKey(capability);

      const requirementKey =
        `${key}|${requirement.category}`;

      if (
        seenRequirements.has(
          requirementKey
        )
      ) {
        continue;
      }

      seenRequirements.add(
        requirementKey
      );

      let aggregate =
        capabilityMap.get(key);

      if (!aggregate) {
        aggregate = {
          capability,
          category:
            requirement.category,
          jobCount: 0,
          requirementCount: 0,
          companies: [],
          countries: [],
        };

        capabilityMap.set(
          key,
          aggregate
        );
      }

      aggregate.requirementCount += 1;

      addUnique(
        aggregate.companies,
        job.company ?? ""
      );

      addUnique(
        aggregate.countries,
        job.country ?? ""
      );
    }

    const countedCapabilities =
      new Set<string>();

    for (const requirement of intelligence.requirements) {
      const capability =
        normalizeCapability(
          requirement.name
        );

      if (!capability) {
        continue;
      }

      const key =
        capabilityKey(capability);

      if (
        countedCapabilities.has(
          key
        )
      ) {
        continue;
      }

      countedCapabilities.add(
        key
      );

      const aggregate =
        capabilityMap.get(key);

      if (!aggregate) {
        continue;
      }

      aggregate.jobCount += 1;
    }
  }

  return {
    jobsAnalyzed: jobs.length,
    capabilities:
      Array.from(
        capabilityMap.values()
      ).sort(
        (a, b) =>
          b.jobCount -
            a.jobCount ||
          b.requirementCount -
            a.requirementCount ||
          a.capability.localeCompare(
            b.capability
          )
      ),
  };
}