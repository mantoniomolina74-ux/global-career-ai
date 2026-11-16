
import { redirect } from "next/navigation";

import {
  getEnterpriseAnalytics,
} from "@/lib/enterprise/enterpriseAnalyticsService";

import {
  getTalentIntelligence,
} from "@/lib/enterprise/talentIntelligenceService";

import {
  requireEnterprisePermission,
} from "@/lib/enterprise/enterpriseAuthorization";

import {
  getUserOrganizations,
} from "@/lib/enterprise/organizationService";

import {
  createSupabaseServerAuth,
} from "@/lib/supabase/server";

function MetricCard({
  label,
  value,
  description,
  color = "blue",
}: {
  label: string;
  value: string | number;
  description: string;
  color?: "blue" | "violet" | "amber" | "emerald";
}) {
  const colors = {
    blue: "border-blue-200 bg-blue-50 text-blue-700",
    violet: "border-violet-200 bg-violet-50 text-violet-700",
    amber: "border-amber-200 bg-amber-50 text-amber-700",
    emerald: "border-emerald-200 bg-emerald-50 text-emerald-700",
  };

  return (
    <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
      <p className="text-sm font-medium text-gray-500">
        {label}
      </p>

      <p className="mt-3 text-3xl font-bold tracking-tight text-gray-950">
        {value}
      </p>

      <div className="mt-4">
        <span
          className={`inline-flex rounded-full border px-2.5 py-1 text-xs font-semibold ${colors[color]}`}
        >
          {description}
        </span>
      </div>
    </div>
  );
}

function ModuleCard({
  eyebrow,
  title,
  description,
  href,
  color,
}: {
  eyebrow: string;
  title: string;
  description: string;
  href: string;
  color: "blue" | "violet" | "emerald" | "amber";
}) {
  const accents = {
    blue: "border-t-blue-500",
    violet: "border-t-violet-500",
    emerald: "border-t-emerald-500",
    amber: "border-t-amber-500",
  };

  return (
    <a
      href={href}
      className={`group rounded-xl border border-t-4 ${accents[color]} bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md`}
    >
      <p className="text-xs font-semibold uppercase tracking-wider text-gray-500">
        {eyebrow}
      </p>

      <h3 className="mt-3 text-lg font-semibold text-gray-950 group-hover:text-blue-700">
        {title}
      </h3>

      <p className="mt-2 text-sm leading-6 text-gray-600">
        {description}
      </p>

      <p className="mt-5 text-sm font-semibold text-gray-700 group-hover:text-blue-700">
        Open module →
      </p>
    </a>
  );
}

export default async function EnterprisePage() {
  const supabase = await createSupabaseServerAuth();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const organizations = await getUserOrganizations(user.id);

  if (organizations.length === 0) {
    return (
      <main className="min-h-screen bg-gray-50 p-8">
        <div className="mx-auto max-w-7xl rounded-xl border bg-white p-8">
          <p className="text-sm font-semibold uppercase tracking-wider text-gray-500">
            Global Career AI
          </p>

          <h1 className="mt-2 text-3xl font-bold text-gray-950">
            Enterprise Overview
          </h1>

          <p className="mt-4 text-gray-600">
            No tienes una organización Enterprise asociada a tu cuenta.
          </p>
        </div>
      </main>
    );
  }

  const organization = organizations[0];

  try {
    await requireEnterprisePermission(
      user.id,
      organization.id,
      "VIEW_CANDIDATE_INTELLIGENCE"
    );
  } catch (error) {
    const message =
      error instanceof Error
        ? error.message
        : "Enterprise access denied";

    return (
      <main className="min-h-screen bg-gray-50 p-8">
        <div className="mx-auto max-w-7xl rounded-xl border bg-white p-8">
          <p className="text-sm font-semibold uppercase tracking-wider text-gray-500">
            Enterprise
          </p>

          <h1 className="mt-2 text-3xl font-bold text-gray-950">
            Access restricted
          </h1>

          <p className="mt-4 text-red-700">
            {message}
          </p>
        </div>
      </main>
    );
  }

  const analytics = await getEnterpriseAnalytics({
    organizationId: organization.id,
  });

  let canViewTalentIntelligence = false;

  try {
    await requireEnterprisePermission(
      user.id,
      organization.id,
      "VIEW_TALENT_INTELLIGENCE"
    );

    canViewTalentIntelligence = true;
  } catch (error) {
    const message =
      error instanceof Error
        ? error.message
        : "Enterprise authorization failed";

    if (
      !message.includes("Insufficient enterprise permission") &&
      !message.includes("User is not a member of this organization")
    ) {
      throw error;
    }
  }

  const talentIntelligence = canViewTalentIntelligence
    ? await getTalentIntelligence(user.id, organization.id)
    : null;

  const gapCounts = talentIntelligence
    ? {
        noDirectSupply: talentIntelligence.gaps.gaps.filter(
          (gap) => gap.gapType === "NO_DIRECT_SUPPLY"
        ).length,
        lowSupply: talentIntelligence.gaps.gaps.filter(
          (gap) => gap.gapType === "LOW_SUPPLY"
        ).length,
        transferable: talentIntelligence.gaps.gaps.filter(
          (gap) => gap.gapType === "TRANSFERABLE_SUPPLY"
        ).length,
        balanced: talentIntelligence.gaps.gaps.filter(
          (gap) => gap.gapType === "BALANCED"
        ).length,
      }
    : null;

  return (
    <main className="min-h-screen bg-gray-50 px-4 py-8 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <header className="overflow-hidden rounded-2xl bg-slate-950 p-6 text-white shadow-sm sm:p-8">
          <div className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.2em] text-blue-300">
                Global Career AI · Enterprise
              </p>

              <h1 className="mt-3 text-3xl font-bold tracking-tight sm:text-4xl">
                Executive Overview
              </h1>

              <p className="mt-3 text-slate-300">
                {organization.name}
              </p>

              <p className="mt-1 max-w-2xl text-sm leading-6 text-slate-400">
                Organizational intelligence for talent supply, labor demand
                and recruitment decision support.
              </p>
            </div>

            <div className="rounded-xl border border-white/15 bg-white/5 px-4 py-3">
              <p className="text-xs uppercase tracking-wider text-slate-400">
                Analytics strategy
              </p>
              <p className="mt-1 font-semibold">
                Enterprise Analytics V1.0
              </p>
            </div>
          </div>
        </header>

        <section className="mt-8">
          <div className="mb-4">
            <h2 className="text-xl font-bold text-gray-950">
              Executive Summary
            </h2>
            <p className="mt-1 text-sm text-gray-600">
              Persisted candidate, application and ATS intelligence.
            </p>
          </div>

          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            <MetricCard
              label="Candidates Processed"
              value={analytics.candidates.candidatesProcessed}
              description="Organization scope"
              color="blue"
            />

            <MetricCard
              label="Applications Processed"
              value={analytics.applications.applicationsProcessed}
              description="Persisted applications"
              color="violet"
            />

            <MetricCard
              label="ATS Coverage"
              value={`${analytics.applications.atsCoverageRate}%`}
              description={`${analytics.applications.atsApplicationsProcessed} applications with ATS`}
              color="emerald"
            />

            <MetricCard
              label="Average ATS"
              value={analytics.ats.averageScore ?? "—"}
              description={
                analytics.ats.averageScore === null
                  ? "No ATS results available"
                  : "Existing ATS results"
              }
              color="amber"
            />
          </div>
        </section>

        <section className="mt-8 rounded-xl border bg-white p-5 shadow-sm sm:p-6">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <h2 className="text-xl font-bold text-gray-950">
                Recruitment Decision Support
              </h2>
              <p className="mt-1 text-sm text-gray-600">
                Existing ATS decision thresholds. These are decision counts,
                not independent hiring predictions.
              </p>
            </div>

            <span
              className={`inline-flex w-fit rounded-full px-3 py-1 text-xs font-semibold ${
                analytics.ranking.available
                  ? "bg-emerald-100 text-emerald-800"
                  : "bg-gray-100 text-gray-600"
              }`}
            >
              Ranking data:{" "}
              {analytics.ranking.available ? "Available" : "Not available"}
            </span>
          </div>

          <div className="mt-5 grid gap-4 sm:grid-cols-3">
            <div className="rounded-lg border border-emerald-200 bg-emerald-50 p-4">
              <p className="text-sm font-medium text-emerald-800">
                Shortlisted
              </p>
              <p className="mt-2 text-3xl font-bold text-emerald-950">
                {analytics.decisions.shortlisted}
              </p>
              <p className="mt-1 text-xs text-emerald-800">
                ATS ≥ 75
              </p>
            </div>

            <div className="rounded-lg border border-amber-200 bg-amber-50 p-4">
              <p className="text-sm font-medium text-amber-800">
                Review
              </p>
              <p className="mt-2 text-3xl font-bold text-amber-950">
                {analytics.decisions.review}
              </p>
              <p className="mt-1 text-xs text-amber-800">
                ATS ≥ 50 and below 75
              </p>
            </div>

            <div className="rounded-lg border border-red-200 bg-red-50 p-4">
              <p className="text-sm font-medium text-red-800">
                Rejected
              </p>
              <p className="mt-2 text-3xl font-bold text-red-950">
                {analytics.decisions.rejected}
              </p>
              <p className="mt-1 text-xs text-red-800">
                ATS below 50
              </p>
            </div>
          </div>
        </section>

        {talentIntelligence && gapCounts && (
          <section className="mt-8">
            <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <p className="text-sm font-semibold uppercase tracking-wider text-violet-700">
                  Strategic Intelligence
                </p>
                <h2 className="mt-1 text-xl font-bold text-gray-950">
                  Talent Intelligence
                </h2>
                <p className="mt-1 text-sm text-gray-600">
                  Observed candidate supply, active job demand and capability gaps.
                </p>
              </div>

              <a
                href="/enterprise/talent-intelligence"
                className="inline-flex w-fit items-center rounded-lg border border-violet-200 bg-violet-50 px-4 py-2 text-sm font-semibold text-violet-800 hover:bg-violet-100"
              >
                Explore Talent Intelligence →
              </a>
            </div>

            <div className="grid gap-4 sm:grid-cols-3">
              <MetricCard
                label="Candidates Analyzed"
                value={talentIntelligence.supply.candidatesAnalyzed}
                description="Analyzed candidate supply"
                color="blue"
              />

              <MetricCard
                label="Jobs Analyzed"
                value={talentIntelligence.demand.jobsAnalyzed}
                description="Active Hirebase demand"
                color="violet"
              />

              <MetricCard
                label="Capability Gaps"
                value={talentIntelligence.gaps.gaps.length}
                description="Identified capability gaps"
                color="amber"
              />
            </div>

            <div className="mt-4 rounded-xl border bg-white p-5 shadow-sm sm:p-6">
              <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <h3 className="font-semibold text-gray-950">
                    Capability Gap Overview
                  </h3>
                  <p className="mt-1 text-sm text-gray-600">
                    Distribution of observed capability gaps, not open vacancy counts.
                  </p>
                </div>

                <p className="text-xs text-gray-500">
                  Generated{" "}
                  {new Date(
                    talentIntelligence.scope.generatedAt
                  ).toLocaleString()}
                </p>
              </div>

              <div className="mt-5 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
                <div className="rounded-lg border border-red-200 bg-red-50 p-4">
                  <p className="text-sm text-red-800">
                    No Direct Supply
                  </p>
                  <p className="mt-2 text-2xl font-bold text-red-950">
                    {gapCounts.noDirectSupply}
                  </p>
                </div>

                <div className="rounded-lg border border-amber-200 bg-amber-50 p-4">
                  <p className="text-sm text-amber-800">
                    Low Supply
                  </p>
                  <p className="mt-2 text-2xl font-bold text-amber-950">
                    {gapCounts.lowSupply}
                  </p>
                </div>

                <div className="rounded-lg border border-blue-200 bg-blue-50 p-4">
                  <p className="text-sm text-blue-800">
                    Transferable Supply
                  </p>
                  <p className="mt-2 text-2xl font-bold text-blue-950">
                    {gapCounts.transferable}
                  </p>
                </div>

                <div className="rounded-lg border border-emerald-200 bg-emerald-50 p-4">
                  <p className="text-sm text-emerald-800">
                    Balanced
                  </p>
                  <p className="mt-2 text-2xl font-bold text-emerald-950">
                    {gapCounts.balanced}
                  </p>
                </div>
              </div>
            </div>
          </section>
        )}

        {!canViewTalentIntelligence && (
          <section className="mt-8 rounded-xl border bg-white p-5">
            <h2 className="font-semibold text-gray-950">
              Talent Intelligence
            </h2>
            <p className="mt-2 text-sm text-gray-600">
              Your current role does not grant access to this module.
              Its metrics are not displayed.
            </p>
          </section>
        )}

        <section className="mt-10">
          <div className="mb-4">
            <h2 className="text-xl font-bold text-gray-950">
              Strategic Actions
            </h2>
            <p className="mt-1 text-sm text-gray-600">
              Open the existing Enterprise modules to investigate evidence
              and plan next steps.
            </p>
          </div>

          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {canViewTalentIntelligence && (
              <ModuleCard
                eyebrow="Supply · Demand · Gaps"
                title="Talent Intelligence"
                description="Explore capability supply, active job demand and identified gaps."
                href="/enterprise/talent-intelligence"
                color="violet"
              />
            )}

            {canViewTalentIntelligence && (
              <ModuleCard
                eyebrow="Workforce Strategy"
                title="Workforce Planning"
                description="Review existing capability priorities and sourcing or development strategies."
                href="/enterprise/workforce-planning"
                color="emerald"
              />
            )}

            <ModuleCard
              eyebrow="Candidate Evidence"
              title="Candidates"
              description="Review candidate intelligence and the professional evidence available to the organization."
              href="/enterprise/candidates"
              color="blue"
            />

            <ModuleCard
              eyebrow="Labor Market"
              title="Jobs"
              description="Explore job records and the intelligence associated with each position."
              href="/enterprise/jobs"
              color="amber"
            />

            <ModuleCard
              eyebrow="Organization Access"
              title="Members"
              description="Review organization membership and the roles assigned to members."
              href="/enterprise/members"
              color="blue"
            />
          </div>
        </section>

        <footer className="mt-10 border-t pt-5 text-xs text-gray-500">
          <p>
            Enterprise Analytics V1.0 · Organization scope:{" "}
            {organization.id}
          </p>
          <p className="mt-1">
            Analytics generated{" "}
            {new Date(analytics.meta.generatedAt).toLocaleString()}
          </p>
        </footer>
      </div>
    </main>
  );
}
