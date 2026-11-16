
import {
  createSupabaseServerAuth,
} from "@/lib/supabase/server";

import {
  getUserOrganizations,
} from "@/lib/enterprise/organizationService";

import {
  requireEnterprisePermission,
} from "@/lib/enterprise/enterpriseAuthorization";

import {
  getWorkforcePlanning,
} from "@/lib/enterprise/workforcePlanningService";

import type {
  WorkforcePlanningCapability,
  WorkforcePlanningPriority,
  WorkforcePlanningStrategy,
} from "@/lib/engine/contracts/intelligence/workforce/workforcePlanning";

function priorityClasses(
  priority: WorkforcePlanningPriority
) {
  if (priority === "HIGH") {
    return "border-red-200 bg-red-50 text-red-700";
  }

  if (priority === "MEDIUM") {
    return "border-amber-200 bg-amber-50 text-amber-700";
  }

  return "border-emerald-200 bg-emerald-50 text-emerald-700";
}

function strategyLabel(
  strategy: WorkforcePlanningStrategy
) {
  switch (strategy) {
    case "SOURCE":
      return "External Sourcing";
    case "LEVERAGE_TRANSFERABLE":
      return "Leverage Transferable Talent";
    case "DEVELOP":
      return "Develop Capability";
    case "HIRE":
      return "Increase Hiring Capacity";
    case "MONITOR":
      return "Monitor";
    default:
      return strategy;
  }
}

function priorityRank(
  priority: WorkforcePlanningPriority
) {
  if (priority === "HIGH") return 1;
  if (priority === "MEDIUM") return 2;
  return 3;
}

function sortCapabilities(
  capabilities: WorkforcePlanningCapability[]
) {
  return [...capabilities].sort(
    (a, b) =>
      priorityRank(a.priority) - priorityRank(b.priority) ||
      b.demandCount - a.demandCount
  );
}

function StatCard({
  label,
  value,
  description,
  accent,
  icon,
}: {
  label: string;
  value: number;
  description: string;
  accent: "blue" | "red" | "amber" | "emerald";
  icon: string;
}) {
  const accents = {
    blue: {
      border: "border-blue-200",
      icon: "bg-blue-100 text-blue-700",
      number: "text-blue-700",
      glow: "bg-blue-500",
    },
    red: {
      border: "border-red-200",
      icon: "bg-red-100 text-red-700",
      number: "text-red-700",
      glow: "bg-red-500",
    },
    amber: {
      border: "border-amber-200",
      icon: "bg-amber-100 text-amber-700",
      number: "text-amber-700",
      glow: "bg-amber-500",
    },
    emerald: {
      border: "border-emerald-200",
      icon: "bg-emerald-100 text-emerald-700",
      number: "text-emerald-700",
      glow: "bg-emerald-500",
    },
  }[accent];

  return (
    <article
      className={`relative overflow-hidden rounded-2xl border ${accents.border} bg-white p-5 shadow-sm transition duration-200 hover:-translate-y-0.5 hover:shadow-md sm:p-6`}
    >
      <div
        className={`absolute inset-x-0 top-0 h-1 ${accents.glow}`}
      />

      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-sm font-semibold text-slate-600">
            {label}
          </p>

          <p className={`mt-3 text-4xl font-bold tracking-tight ${accents.number}`}>
            {value}
          </p>
        </div>

        <div
          className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-xl text-xl font-bold ${accents.icon}`}
          aria-hidden="true"
        >
          {icon}
        </div>
      </div>

      <p className="mt-4 text-sm leading-5 text-slate-500">
        {description}
      </p>
    </article>
  );
}

function SectionHeading({
  eyebrow,
  title,
  description,
}: {
  eyebrow: string;
  title: string;
  description: string;
}) {
  return (
    <div>
      <p className="text-xs font-bold uppercase tracking-[0.16em] text-blue-600">
        {eyebrow}
      </p>

      <h2 className="mt-2 text-xl font-bold tracking-tight text-slate-900 sm:text-2xl">
        {title}
      </h2>

      <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-500">
        {description}
      </p>
    </div>
  );
}

function AccessMessage({
  title,
  message,
  error = false,
}: {
  title: string;
  message: string;
  error?: boolean;
}) {
  return (
    <main className="min-h-screen bg-slate-100 p-4 sm:p-8">
      <div className="mx-auto max-w-5xl">
        <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
          <div className="bg-gradient-to-r from-slate-950 via-blue-950 to-indigo-900 px-6 py-8 text-white sm:px-9">
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-blue-200">
              Enterprise Intelligence
            </p>

            <h1 className="mt-3 text-2xl font-bold sm:text-3xl">
              {title}
            </h1>
          </div>

          <div className="p-6 sm:p-9">
            <div
              className={`rounded-xl border p-5 ${
                error
                  ? "border-red-200 bg-red-50"
                  : "border-amber-200 bg-amber-50"
              }`}
            >
              <p
                className={`text-sm leading-6 ${
                  error ? "text-red-800" : "text-slate-700"
                }`}
              >
                {message}
              </p>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}

export default async function WorkforcePlanningPage() {
  const supabase = await createSupabaseServerAuth();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return (
      <AccessMessage
        title="Workforce Planning"
        message="Authentication required."
      />
    );
  }

  const organizations = await getUserOrganizations(user.id);
  const organization = organizations[0];

  if (!organization) {
    return (
      <AccessMessage
        title="Workforce Planning"
        message="No enterprise organization is available."
      />
    );
  }
     let workforcePlanning:
    | Awaited<ReturnType<typeof getWorkforcePlanning>>
    | null = null;

  let accessError: string | null = null;

  try {
    await requireEnterprisePermission(
      user.id,
      organization.id,
      "VIEW_TALENT_INTELLIGENCE"
    );

    workforcePlanning = await getWorkforcePlanning(
      user.id,
      organization.id
    );
  } catch (error) {
    accessError =
      error instanceof Error
        ? error.message
        : "Unable to load workforce planning intelligence.";
  }

  if (accessError !== null || workforcePlanning === null) {
    return (
      <AccessMessage
        title="Workforce Planning"
        message={
          accessError ??
          "Unable to load workforce planning intelligence."
        }
        error
      />
    );
  }

    const capabilities = sortCapabilities(
      workforcePlanning.planning.capabilities
    );

    const highPriority = capabilities.filter(
      (item) => item.priority === "HIGH"
    );

    const mediumPriority = capabilities.filter(
      (item) => item.priority === "MEDIUM"
    );

    const sourceStrategies = capabilities.filter(
      (item) => item.strategy === "SOURCE"
    );

    const transferableStrategies = capabilities.filter(
      (item) => item.strategy === "LEVERAGE_TRANSFERABLE"
    );

    const highPrioritySourcing = highPriority.filter(
      (item) => item.strategy === "SOURCE"
    ).length;

    return (
      <main className="min-h-screen bg-slate-100">
        <div className="mx-auto max-w-[1600px] space-y-7 p-4 sm:p-6 lg:p-8">

          {/* Executive hero */}
          <header className="relative isolate overflow-hidden rounded-3xl bg-gradient-to-br from-slate-950 via-blue-950 to-indigo-900 shadow-xl">
            <div
              className="pointer-events-none absolute -right-16 -top-28 -z-10 h-80 w-80 rounded-full bg-blue-400/20 blur-3xl"
              aria-hidden="true"
            />

            <div
              className="pointer-events-none absolute -bottom-36 left-1/3 -z-10 h-72 w-72 rounded-full bg-indigo-400/20 blur-3xl"
              aria-hidden="true"
            />

            <div className="grid gap-8 p-6 sm:p-9 lg:grid-cols-[1fr_auto] lg:items-end lg:p-10">
              <div className="max-w-3xl">
                <div className="inline-flex items-center gap-2 rounded-full border border-blue-300/30 bg-white/10 px-3 py-1.5 text-xs font-semibold uppercase tracking-[0.16em] text-blue-100">
                  <span className="h-2 w-2 rounded-full bg-emerald-400" />
                  Enterprise Intelligence
                </div>

                <h1 className="mt-5 text-3xl font-bold tracking-tight text-white sm:text-4xl lg:text-5xl">
                  Workforce Planning
                </h1>

                <p className="mt-4 max-w-2xl text-sm leading-7 text-blue-100 sm:text-base">
                  Turn real talent supply, job demand, and observable
                  capability gaps into actionable workforce priorities.
                  Identify where external sourcing and transferable talent
                  deserve attention.
                </p>

                <div className="mt-6 flex flex-wrap gap-2">
                  <span className="rounded-lg border border-white/15 bg-white/10 px-3 py-2 text-xs font-medium text-white">
                    Demand intelligence
                  </span>

                  <span className="rounded-lg border border-white/15 bg-white/10 px-3 py-2 text-xs font-medium text-white">
                    Talent supply
                  </span>

                  <span className="rounded-lg border border-white/15 bg-white/10 px-3 py-2 text-xs font-medium text-white">
                    Capability gaps
                  </span>
                </div>
              </div>

              <div className="min-w-0 rounded-2xl border border-white/15 bg-white/10 p-5 backdrop-blur-sm lg:min-w-[260px]">
                <p className="text-xs font-semibold uppercase tracking-[0.16em] text-blue-200">
                  Organization
                </p>

                <p className="mt-2 break-words text-lg font-bold text-white">
                  {organization.name}
                </p>

                <div className="mt-4 border-t border-white/15 pt-4">
                  <p className="text-xs text-blue-200">
                    Planning capabilities
                  </p>

                  <p className="mt-1 text-3xl font-bold text-white">
                    {capabilities.length}
                  </p>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 border-t border-white/15 bg-black/10 sm:grid-cols-4">
              <div className="border-b border-r border-white/10 px-5 py-4 sm:border-b-0">
                <p className="text-xs text-blue-200">High priority</p>
                <p className="mt-1 text-xl font-bold text-white">
                  {highPriority.length}
                </p>
              </div>

              <div className="border-b border-white/10 px-5 py-4 sm:border-b-0 sm:border-r">
                <p className="text-xs text-blue-200">Medium priority</p>
                <p className="mt-1 text-xl font-bold text-white">
                  {mediumPriority.length}
                </p>
              </div>

              <div className="border-r border-white/10 px-5 py-4">
                <p className="text-xs text-blue-200">External sourcing</p>
                <p className="mt-1 text-xl font-bold text-white">
                  {sourceStrategies.length}
                </p>
              </div>

              <div className="px-5 py-4">
                <p className="text-xs text-blue-200">Transferable talent</p>
                <p className="mt-1 text-xl font-bold text-white">
                  {transferableStrategies.length}
                </p>
              </div>
            </div>
          </header>

          {/* KPI cards */}
          <section aria-label="Workforce planning metrics">
            <div className="mb-4">
              <p className="text-xs font-bold uppercase tracking-[0.16em] text-slate-500">
                Workforce overview
              </p>

              <h2 className="mt-1 text-xl font-bold text-slate-900">
                Planning at a glance
              </h2>
            </div>

            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
              <StatCard
                label="Capabilities Planned"
                value={capabilities.length}
                description="Capabilities included in the current planning view."
                accent="blue"
                icon="CP"
              />

              <StatCard
                label="High Priority"
                value={highPriority.length}
                description="Capabilities requiring the greatest workforce attention."
                accent="red"
                icon="!"
              />

              <StatCard
                label="Medium Priority"
                value={mediumPriority.length}
                description="Capabilities requiring additional planning attention."
                accent="amber"
                icon="M"
              />

              <StatCard
                label="External Sourcing"
                value={sourceStrategies.length}
                description="Capabilities assigned to an external sourcing strategy."
                accent="emerald"
                icon="ES"
              />
            </div>
          </section>

          {/* Priorities table */}
          <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
            <div className="flex flex-col gap-4 border-b border-slate-200 p-5 sm:p-7 md:flex-row md:items-end md:justify-between">
              <SectionHeading
                eyebrow="Priority management"
                title="Planning Priorities"
                description="Review capability demand, observable talent supply, priority levels, and recommended strategies."
              />

              <div className="inline-flex w-fit shrink-0 items-center gap-2 rounded-xl bg-slate-100 px-4 py-2.5">
                <span className="text-xl font-bold text-slate-900">
                  {capabilities.length}
                </span>
                <span className="text-sm text-slate-600">
                  capabilities
                </span>
              </div>
            </div>

            <div className="grid gap-3 border-b border-slate-100 bg-slate-50/80 p-4 sm:grid-cols-3 sm:p-5">
              <div className="rounded-xl border border-red-100 bg-white p-4">
                <p className="text-xs font-semibold uppercase tracking-wide text-red-600">
                  High
                </p>
                <p className="mt-1 text-2xl font-bold text-red-700">
                  {highPriority.length}
                </p>
                <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-red-100">
                  <div
                    className="h-full rounded-full bg-red-500"
                    style={{
                      width: `${
                        capabilities.length
                          ? (highPriority.length / capabilities.length) * 100
                          : 0
                      }%`,
                    }}
                  />
                </div>
              </div>

              <div className="rounded-xl border border-amber-100 bg-white p-4">
                <p className="text-xs font-semibold uppercase tracking-wide text-amber-600">
                  Medium
                </p>
                <p className="mt-1 text-2xl font-bold text-amber-700">
                  {mediumPriority.length}
                </p>
                <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-amber-100">
                  <div
                    className="h-full rounded-full bg-amber-500"
                    style={{
                      width: `${
                        capabilities.length
                          ? (mediumPriority.length / capabilities.length) * 100
                          : 0
                      }%`,
                    }}
                  />
                </div>
              </div>

              <div className="rounded-xl border border-emerald-100 bg-white p-4">
                <p className="text-xs font-semibold uppercase tracking-wide text-emerald-600">
                  Other priorities
                </p>
                <p className="mt-1 text-2xl font-bold text-emerald-700">
                  {capabilities.length -
                    highPriority.length -
                    mediumPriority.length}
                </p>
                <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-emerald-100">
                  <div
                    className="h-full rounded-full bg-emerald-500"
                    style={{
                      width: `${
                        capabilities.length
                          ? ((capabilities.length -
                              highPriority.length -
                              mediumPriority.length) /
                              capabilities.length) *
                            100
                          : 0
                      }%`,
                    }}
                  />
                </div>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full min-w-[1050px] text-left text-sm">
                <thead className="bg-slate-50 text-xs uppercase tracking-wider text-slate-500">
                  <tr>
                    <th className="px-5 py-4 font-semibold">Capability</th>
                    <th className="px-4 py-4 font-semibold">Category</th>
                    <th className="px-4 py-4 text-right font-semibold">Demand</th>
                    <th className="px-4 py-4 text-right font-semibold">Supply</th>
                    <th className="px-4 py-4 text-right font-semibold">Direct</th>
                    <th className="px-4 py-4 text-right font-semibold">Transferable</th>
                    <th className="px-4 py-4 font-semibold">Priority</th>
                    <th className="px-5 py-4 font-semibold">Strategy</th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-slate-100">
                  {capabilities.map((item) => (
                    <tr
                      key={`${item.capability}-${item.category}`}
                      className="align-top transition-colors hover:bg-blue-50/50"
                    >
                      <td className="px-5 py-4">
                        <p className="font-semibold text-slate-900">
                          {item.capability}
                        </p>
                      </td>

                      <td className="px-4 py-4 text-slate-600">
                        {item.category}
                      </td>

                      <td className="px-4 py-4 text-right font-bold tabular-nums text-slate-900">
                        {item.demandCount}
                      </td>

                      <td className="px-4 py-4 text-right tabular-nums text-slate-700">
                        {item.supplyCandidateCount}
                      </td>

                      <td className="px-4 py-4 text-right tabular-nums text-slate-700">
                        {item.directSupplyCount}
                      </td>

                      <td className="px-4 py-4 text-right tabular-nums text-slate-700">
                        {item.transferableSupplyCount}
                      </td>

                      <td className="px-4 py-4">
                        <span
                          className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-bold ${priorityClasses(item.priority)}`}
                        >
                          <span className="h-1.5 w-1.5 rounded-full bg-current" />
                          {item.priority}
                        </span>
                      </td>

                      <td className="px-5 py-4">
                        <span className="inline-flex max-w-[230px] rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-xs font-semibold leading-5 text-slate-700">
                          {strategyLabel(item.strategy)}
                        </span>
                      </td>
                    </tr>
                  ))}

                  {capabilities.length === 0 && (
                    <tr>
                      <td
                        colSpan={8}
                        className="px-6 py-12 text-center text-sm text-slate-500"
                      >
                        No workforce planning capabilities are available.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            <div className="border-t border-slate-200 bg-slate-50 px-5 py-3 text-xs text-slate-500">
              Priority order: high, medium, then other priorities. Within each
              priority, capabilities are ordered by observed demand.
            </div>
          </section>

          {/* Strategy and signals */}
          <section className="grid gap-6 xl:grid-cols-[1.35fr_1fr]">
            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-7">
              <SectionHeading
                eyebrow="Recommended actions"
                title="Workforce Strategy"
                description="The leading capability recommendations, ordered by priority and observed demand."
              />

              <div className="mt-6 space-y-3">
                {capabilities.slice(0, 10).map((item, index) => (
                  <article
                    key={`strategy-${item.capability}-${item.category}`}
                    className="rounded-xl border border-slate-200 p-4 transition-colors hover:border-blue-200 hover:bg-blue-50/30 sm:p-5"
                  >
                    <div className="flex items-start gap-3">
                      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-slate-100 text-sm font-bold text-slate-600">
                        {String(index + 1).padStart(2, "0")}
                      </div>

                      <div className="min-w-0 flex-1">
                        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                          <div className="min-w-0">
                            <h3 className="font-bold text-slate-900">
                              {item.capability}
                            </h3>

                            <p className="mt-1 text-xs text-slate-500">
                              {item.category}
                            </p>
                          </div>

                          <span
                            className={`inline-flex w-fit shrink-0 rounded-full border px-2.5 py-1 text-xs font-bold ${priorityClasses(item.priority)}`}
                          >
                            {item.priority}
                          </span>
                        </div>

                        <div className="mt-3 flex flex-wrap gap-2">
                          <span className="rounded-md bg-blue-50 px-2.5 py-1.5 text-xs font-semibold text-blue-800">
                            {item.demandCount} jobs
                          </span>

                          <span className="rounded-md bg-slate-100 px-2.5 py-1.5 text-xs font-semibold text-slate-700">
                            {item.supplyCandidateCount} candidates
                          </span>
                        </div>

                        <div className="mt-3 rounded-lg border border-slate-100 bg-slate-50 p-3">
                          <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                            Recommended strategy
                          </p>
                          <p className="mt-1 text-sm font-semibold leading-5 text-slate-800">
                            {strategyLabel(item.strategy)}
                          </p>
                        </div>

                        <p className="mt-3 text-sm leading-6 text-slate-600">
                          {item.rationale}
                        </p>
                      </div>
                    </div>
                  </article>
                ))}

                {capabilities.length === 0 && (
                  <p className="rounded-xl border border-dashed border-slate-300 p-8 text-center text-sm text-slate-500">
                    No strategy recommendations are currently available.
                  </p>
                )}
              </div>
            </div>

            <div className="space-y-5">
              <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-7">
                <SectionHeading
                  eyebrow="Decision support"
                  title="Planning Signals"
                  description="A concise view of the strongest workforce planning indicators."
                />

                <div className="mt-6 space-y-4">
                  <article className="rounded-xl border border-red-200 bg-gradient-to-br from-red-50 to-white p-5">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <p className="text-sm font-bold text-red-900">
                          High-priority sourcing
                        </p>
                        <p className="mt-1 text-xs leading-5 text-red-700">
                          High-priority capabilities assigned to external sourcing.
                        </p>
                      </div>

                      <span className="rounded-lg bg-red-100 px-3 py-2 text-xs font-bold text-red-800">
                        HIGH
                      </span>
                    </div>

                    <p className="mt-4 text-4xl font-bold tracking-tight text-red-700">
                      {highPrioritySourcing}
                    </p>

                    <p className="mt-1 text-xs text-red-700">
                      capabilities
                    </p>
                  </article>

                  <article className="rounded-xl border border-amber-200 bg-gradient-to-br from-amber-50 to-white p-5">
                    <p className="text-sm font-bold text-amber-900">
                      Medium-priority capabilities
                    </p>

                    <p className="mt-1 text-xs leading-5 text-amber-800">
                      Capabilities requiring additional workforce attention.
                    </p>

                    <p className="mt-4 text-4xl font-bold tracking-tight text-amber-700">
                      {mediumPriority.length}
                    </p>

                    <p className="mt-1 text-xs text-amber-800">
                      capabilities
                    </p>
                  </article>

                  <article className="rounded-xl border border-emerald-200 bg-gradient-to-br from-emerald-50 to-white p-5">
                    <p className="text-sm font-bold text-emerald-900">
                      Transferable talent
                    </p>

                    <p className="mt-1 text-xs leading-5 text-emerald-800">
                      Capabilities assigned to a transferable talent strategy.
                    </p>

                    <p className="mt-4 text-4xl font-bold tracking-tight text-emerald-700">
                      {transferableStrategies.length}
                    </p>

                    <p className="mt-1 text-xs text-emerald-800">
                      capabilities
                    </p>
                  </article>
                </div>
              </div>

              <div className="rounded-2xl border border-blue-200 bg-gradient-to-br from-blue-950 via-blue-900 to-indigo-900 p-6 text-white shadow-sm">
                <p className="text-xs font-bold uppercase tracking-[0.16em] text-blue-200">
                  Planning principle
                </p>

                <h3 className="mt-3 text-xl font-bold">
                  Evidence before assumptions
                </h3>

                <p className="mt-3 text-sm leading-6 text-blue-100">
                  Workforce recommendations reflect observed job demand and
                  candidate supply. A capability gap is a planning signal,
                  not a guarantee of hiring outcomes.
                </p>

                <div className="mt-5 border-t border-white/15 pt-4">
                  <p className="text-xs leading-5 text-blue-200">
                    No ATS, Matching, Ranking, or hiring-probability scores
                    are introduced by this planning view.
                  </p>
                </div>
              </div>
            </div>
          </section>

          {/* Executive insight */}
          <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
            <div className="flex flex-col gap-3 border-b border-slate-200 p-5 sm:p-7 md:flex-row md:items-end md:justify-between">
              <SectionHeading
                eyebrow="Executive interpretation"
                title="Executive Planning Insight"
                description="A summary of the current workforce planning results and their evidence base."
              />

              <div className="rounded-lg bg-slate-100 px-3 py-2 text-xs text-slate-600">
                Generated{" "}
                {new Date(
                  workforcePlanning.scope.generatedAt
                ).toLocaleString()}
              </div>
            </div>

            <div className="grid gap-5 p-5 sm:p-7 lg:grid-cols-[1fr_auto] lg:items-start">
              <div className="rounded-xl border border-blue-100 bg-gradient-to-br from-blue-50 to-white p-5 sm:p-6">
                <div className="flex items-start gap-3">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-blue-100 text-lg font-bold text-blue-800">
                    i
                  </div>

                  <div>
                    <h3 className="font-bold text-slate-900">
                      Current workforce assessment
                    </h3>

                    <p className="mt-3 text-sm leading-7 text-slate-700">
                      The current workforce planning view identifies{" "}
                      <strong>{highPriority.length}</strong>{" "}
                      high-priority capabilities and{" "}
                      <strong>{sourceStrategies.length}</strong>{" "}
                      capabilities requiring external sourcing. Planning
                      recommendations are derived from observed job demand
                      and real candidate supply, without introducing ATS,
                      Matching, Ranking, or hiring-probability scores.
                    </p>
                  </div>
                </div>
              </div>

              <div className="rounded-xl border border-slate-200 p-5 lg:min-w-[250px]">
                <p className="text-xs font-bold uppercase tracking-[0.14em] text-slate-500">
                  Planning scope
                </p>

                <p className="mt-3 text-sm font-semibold text-slate-800">
                  Organization
                </p>

                <p className="mt-1 break-all text-xs leading-5 text-slate-500">
                  {workforcePlanning.scope.organizationId}
                </p>

                <div className="mt-4 border-t border-slate-100 pt-4">
                  <p className="text-sm font-semibold text-slate-800">
                    Data provenance
                  </p>
                  <p className="mt-1 text-xs leading-5 text-slate-500">
                    Observed demand and candidate supply from the existing
                    workforce planning service.
                  </p>
                </div>
              </div>
            </div>
          </section>

          <footer className="flex flex-col gap-2 border-t border-slate-200 px-1 pt-5 text-xs text-slate-500 sm:flex-row sm:items-center sm:justify-between">
            <p>Global Career AI Enterprise · Workforce Planning</p>
            <p>Organization scope: {workforcePlanning.scope.organizationId}</p>
          </footer>
        </div>
      </main>
    );
}