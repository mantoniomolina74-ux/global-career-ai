
import { redirect } from "next/navigation";

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

import type {
  TalentGapType,
} from "@/lib/engine/contracts/intelligence/talentIntelligence";

const gapLabels: Record<TalentGapType, string> = {
  NO_DIRECT_SUPPLY: "No Direct Supply",
  LOW_SUPPLY: "Low Supply",
  TRANSFERABLE_SUPPLY: "Transferable Supply",
  BALANCED: "Balanced",
};

const gapStyles: Record<
  TalentGapType,
  { badge: string; dot: string; row: string }
> = {
  NO_DIRECT_SUPPLY: {
    badge: "border-rose-200 bg-rose-50 text-rose-700",
    dot: "bg-rose-500",
    row: "border-l-rose-500",
  },
  LOW_SUPPLY: {
    badge: "border-amber-200 bg-amber-50 text-amber-700",
    dot: "bg-amber-500",
    row: "border-l-amber-500",
  },
  TRANSFERABLE_SUPPLY: {
    badge: "border-sky-200 bg-sky-50 text-sky-700",
    dot: "bg-sky-500",
    row: "border-l-sky-500",
  },
  BALANCED: {
    badge: "border-emerald-200 bg-emerald-50 text-emerald-700",
    dot: "bg-emerald-500",
    row: "border-l-emerald-500",
  },
};

function MetricCard({
  label,
  value,
  description,
  tone,
  icon,
}: {
  label: string;
  value: number | string;
  description: string;
  tone: "blue" | "violet" | "cyan" | "rose";
  icon: string;
}) {
  const styles = {
    blue: {
      card: "border-blue-200/80 from-blue-50 via-white to-white",
      icon: "bg-blue-100 text-blue-700",
      value: "text-blue-950",
      accent: "bg-blue-500",
    },
    violet: {
      card: "border-violet-200/80 from-violet-50 via-white to-white",
      icon: "bg-violet-100 text-violet-700",
      value: "text-violet-950",
      accent: "bg-violet-500",
    },
    cyan: {
      card: "border-cyan-200/80 from-cyan-50 via-white to-white",
      icon: "bg-cyan-100 text-cyan-700",
      value: "text-cyan-950",
      accent: "bg-cyan-500",
    },
    rose: {
      card: "border-rose-200/80 from-rose-50 via-white to-white",
      icon: "bg-rose-100 text-rose-700",
      value: "text-rose-950",
      accent: "bg-rose-500",
    },
  };

  const style = styles[tone];

  return (
    <article
      className={`relative overflow-hidden rounded-2xl border bg-gradient-to-br p-5 shadow-sm transition duration-200 hover:-translate-y-0.5 hover:shadow-md sm:p-6 ${style.card}`}
    >
      <div
        className={`absolute inset-x-0 top-0 h-1 ${style.accent}`}
      />

      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0">
          <p className="text-sm font-semibold text-slate-600">
            {label}
          </p>

          <p
            className={`mt-3 text-4xl font-extrabold tracking-tight ${style.value}`}
          >
            {value}
          </p>
        </div>

        <div
          className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-xl text-xl font-bold ${style.icon}`}
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
  count,
  tone = "slate",
}: {
  eyebrow: string;
  title: string;
  description: string;
  count?: string;
  tone?: "blue" | "violet" | "cyan" | "rose" | "slate";
}) {
  const colors = {
    blue: "bg-blue-100 text-blue-700",
    violet: "bg-violet-100 text-violet-700",
    cyan: "bg-cyan-100 text-cyan-700",
    rose: "bg-rose-100 text-rose-700",
    slate: "bg-slate-100 text-slate-700",
  };

  return (
    <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
      <div className="flex items-start gap-3">
        <div
          className={`mt-1 h-10 w-1.5 shrink-0 rounded-full ${
            tone === "blue"
              ? "bg-blue-500"
              : tone === "violet"
                ? "bg-violet-500"
                : tone === "cyan"
                  ? "bg-cyan-500"
                  : tone === "rose"
                    ? "bg-rose-500"
                    : "bg-slate-400"
          }`}
        />

        <div>
          <p className="text-xs font-bold uppercase tracking-[0.16em] text-slate-500">
            {eyebrow}
          </p>

          <h2 className="mt-1 text-xl font-bold tracking-tight text-slate-900 sm:text-2xl">
            {title}
          </h2>

          <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-500">
            {description}
          </p>
        </div>
      </div>

      {count !== undefined && (
        <span
          className={`inline-flex w-fit shrink-0 items-center rounded-full px-3 py-1.5 text-xs font-bold ${colors[tone]}`}
        >
          {count}
        </span>
      )}
    </div>
  );
}

function EmptyState({
  title,
  description,
}: {
  title: string;
  description: string;
}) {
  return (
    <div className="rounded-xl border border-dashed border-slate-300 bg-slate-50 px-5 py-10 text-center">
      <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-200 text-xl font-bold text-slate-500">
        —
      </div>

      <h3 className="mt-4 font-semibold text-slate-800">
        {title}
      </h3>

      <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-slate-500">
        {description}
      </p>
    </div>
  );
}

export default async function TalentIntelligencePage() {
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
      <main className="min-h-screen bg-slate-50 px-4 py-8 sm:px-8">
        <div className="mx-auto max-w-7xl">
          <div className="rounded-2xl border border-amber-200 bg-amber-50 p-6 sm:p-8">
            <p className="text-sm font-semibold uppercase tracking-wider text-amber-700">
              Enterprise access
            </p>

            <h1 className="mt-2 text-3xl font-extrabold text-slate-900">
              Talent Intelligence
            </h1>

            <p className="mt-4 text-slate-600">
              No tienes una organización Enterprise asociada
              a tu cuenta.
            </p>
          </div>
        </div>
      </main>
    );
  }

  const organization = organizations[0];

  try {
    await requireEnterprisePermission(
      user.id,
      organization.id,
      "VIEW_TALENT_INTELLIGENCE"
    );
  } catch (error) {
    const message =
      error instanceof Error
        ? error.message
        : "Enterprise access denied";

    return (
      <main className="min-h-screen bg-slate-50 px-4 py-8 sm:px-8">
        <div className="mx-auto max-w-7xl">
          <div className="rounded-2xl border border-rose-200 bg-white p-6 shadow-sm sm:p-8">
            <p className="text-sm font-semibold uppercase tracking-wider text-rose-600">
              Access control
            </p>

            <h1 className="mt-2 text-3xl font-extrabold text-slate-900">
              Talent Intelligence
            </h1>

            <p className="mt-4 rounded-xl bg-rose-50 p-4 text-sm text-rose-700">
              {message}
            </p>
          </div>
        </div>
      </main>
    );
  }

  const intelligence = await getTalentIntelligence(
    user.id,
    organization.id
  );

  const { supply, demand, gaps } = intelligence;

  const topSupply = supply.capabilities.slice(0, 10);
  const topDemand = demand.capabilities.slice(0, 10);
  const topGaps = gaps.gaps.slice(0, 15);

  const noDirectSupply = gaps.gaps.filter(
    (gap) => gap.gapType === "NO_DIRECT_SUPPLY"
  ).length;

  const lowSupply = gaps.gaps.filter(
    (gap) => gap.gapType === "LOW_SUPPLY"
  ).length;

  const transferableSupply = gaps.gaps.filter(
    (gap) => gap.gapType === "TRANSFERABLE_SUPPLY"
  ).length;

  const balanced = gaps.gaps.filter(
    (gap) => gap.gapType === "BALANCED"
  ).length;

  const maxSupply = Math.max(
    1,
    ...topSupply.map((item) => item.candidateCount)
  );

  const maxDemand = Math.max(
    1,
    ...topDemand.map((item) => item.jobCount)
  );

  const gapSummary = [
    {
      label: "No Direct Supply",
      value: noDirectSupply,
      description: "Sin oferta directa identificada",
      color: "rose",
      icon: "!",
    },
    {
      label: "Low Supply",
      value: lowSupply,
      description: "Oferta directa limitada",
      color: "amber",
      icon: "↓",
    },
    {
      label: "Transferable Supply",
      value: transferableSupply,
      description: "Capacidades transferibles",
      color: "blue",
      icon: "↗",
    },
    {
      label: "Balanced",
      value: balanced,
      description: "Oferta y demanda equilibradas",
      color: "emerald",
      icon: "✓",
    },
  ] as const;

  return (
    <main className="min-h-screen bg-slate-50 px-4 py-6 sm:px-8 sm:py-8">
      <div className="mx-auto max-w-7xl">
        <header className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-slate-950 via-blue-950 to-indigo-900 p-6 text-white shadow-xl sm:p-9">
          <div className="absolute -right-16 -top-20 h-64 w-64 rounded-full bg-blue-400/10 blur-2xl" />
          <div className="absolute -bottom-28 right-1/4 h-64 w-64 rounded-full bg-violet-400/10 blur-3xl" />

          <div className="relative">
            <div className="flex flex-wrap items-center gap-2">
              <span className="rounded-full border border-blue-300/30 bg-blue-300/10 px-3 py-1 text-xs font-bold uppercase tracking-[0.16em] text-blue-100">
                Enterprise Intelligence
              </span>

              <span className="rounded-full border border-white/15 bg-white/5 px-3 py-1 text-xs font-medium text-slate-200">
                V1.0
              </span>
            </div>

            <div className="mt-6 grid gap-6 lg:grid-cols-[1fr_auto] lg:items-end">
              <div>
                <h1 className="text-3xl font-extrabold tracking-tight sm:text-4xl lg:text-5xl">
                  Talent Intelligence
                </h1>

                <p className="mt-4 max-w-2xl text-sm leading-7 text-blue-100/90 sm:text-base">
                  Inteligencia organizacional sobre oferta de
                  talento, demanda laboral y brechas de
                  capacidades para apoyar decisiones
                  estratégicas de workforce planning.
                </p>

                <div className="mt-6 flex flex-wrap items-center gap-3 text-sm">
                  <span className="inline-flex items-center gap-2 rounded-xl border border-white/15 bg-white/10 px-3 py-2 text-blue-50">
                    <span
                      className="h-2 w-2 rounded-full bg-emerald-400"
                      aria-hidden="true"
                    />
                    Datos del servicio Enterprise
                  </span>

                  <span className="rounded-xl border border-white/15 bg-white/10 px-3 py-2 text-blue-50">
                    {organization.name}
                  </span>
                </div>
              </div>

              <div className="rounded-2xl border border-white/15 bg-white/10 p-5 backdrop-blur-sm lg:min-w-52">
                <p className="text-xs font-semibold uppercase tracking-wider text-blue-200">
                  Capabilities identified
                </p>

                <p className="mt-2 text-4xl font-extrabold tabular-nums">
                  {gaps.gaps.length}
                </p>

                <p className="mt-2 text-sm text-blue-100/80">
                  Brechas registradas por el servicio
                </p>
              </div>
            </div>
          </div>
        </header>

        <section className="mt-7">
          <div className="mb-4">
            <p className="text-xs font-bold uppercase tracking-[0.16em] text-slate-500">
              Executive overview
            </p>

            <h2 className="mt-1 text-xl font-bold text-slate-900">
              Workforce intelligence at a glance
            </h2>
          </div>

          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
            <MetricCard
              label="Candidates Analyzed"
              value={supply.candidatesAnalyzed}
              description="Población de candidatos analizada por el servicio."
              tone="blue"
              icon="◎"
            />

            <MetricCard
              label="Jobs Analyzed"
              value={demand.jobsAnalyzed}
              description="Empleos activos considerados en la demanda laboral."
              tone="violet"
              icon="▤"
            />

            <MetricCard
              label="Capability Gaps"
              value={gaps.gaps.length}
              description="Capacidades con brechas identificadas entre oferta y demanda."
              tone="rose"
              icon="△"
            />
          </div>
        </section>

        <section className="mt-8 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
          <div className="border-b border-slate-100 bg-gradient-to-r from-slate-50 to-white p-5 sm:p-7">
            <SectionHeading
              eyebrow="Strategic assessment"
              title="Talent Gap Overview"
              description="Distribución de las brechas según la clasificación calculada por el servicio de inteligencia."
              count={`${gaps.gaps.length} gaps`}
              tone="rose"
            />

            <p className="mt-5 text-xs text-slate-400">
              Generated{" "}
              {new Date(
                intelligence.scope.generatedAt
              ).toLocaleString()}
            </p>
          </div>

          <div className="grid gap-4 p-5 sm:grid-cols-2 sm:p-7 xl:grid-cols-4">
            {gapSummary.map((item) => {
              const style = {
                rose: {
                  card: "border-rose-200 bg-rose-50/70",
                  number: "text-rose-800",
                  icon: "bg-rose-100 text-rose-700",
                  bar: "bg-rose-500",
                },
                amber: {
                  card: "border-amber-200 bg-amber-50/70",
                  number: "text-amber-800",
                  icon: "bg-amber-100 text-amber-700",
                  bar: "bg-amber-500",
                },
                blue: {
                  card: "border-sky-200 bg-sky-50/70",
                  number: "text-sky-800",
                  icon: "bg-sky-100 text-sky-700",
                  bar: "bg-sky-500",
                },
                emerald: {
                  card: "border-emerald-200 bg-emerald-50/70",
                  number: "text-emerald-800",
                  icon: "bg-emerald-100 text-emerald-700",
                  bar: "bg-emerald-500",
                },
              }[item.color];

              const share =
                gaps.gaps.length > 0
                  ? (item.value / gaps.gaps.length) * 100
                  : 0;

              return (
                <article
                  key={item.label}
                  className={`rounded-2xl border p-5 ${style.card}`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <p className="text-sm font-semibold text-slate-600">
                      {item.label}
                    </p>

                    <span
                      className={`flex h-9 w-9 items-center justify-center rounded-xl text-lg font-bold ${style.icon}`}
                      aria-hidden="true"
                    >
                      {item.icon}
                    </span>
                  </div>

                  <p
                    className={`mt-4 text-3xl font-extrabold tabular-nums ${style.number}`}
                  >
                    {item.value}
                  </p>

                  <p className="mt-1 text-xs text-slate-500">
                    {item.description}
                  </p>

                  <div className="mt-4 h-1.5 overflow-hidden rounded-full bg-white/80">
                    <div
                      className={`h-full rounded-full ${style.bar}`}
                      style={{ width: `${share}%` }}
                    />
                  </div>

                  <p className="mt-2 text-right text-xs font-semibold text-slate-500">
                    {share.toFixed(1)}% of identified gaps
                  </p>
                </article>
              );
            })}
          </div>
        </section>

        <section className="mt-8 grid items-start gap-6 xl:grid-cols-2">
          <div className="overflow-hidden rounded-2xl border border-blue-200 bg-white shadow-sm">
            <div className="border-b border-blue-100 bg-gradient-to-r from-blue-50 to-white p-5 sm:p-6">
              <SectionHeading
                eyebrow="Talent supply"
                title="Available Capabilities"
                description="Capacidades representadas en la población de candidatos analizada."
                count={`${supply.capabilities.length} capabilities`}
                tone="blue"
              />
            </div>

            <div className="space-y-3 p-4 sm:p-6">
              {topSupply.length === 0 ? (
                <EmptyState
                  title="No candidate capabilities"
                  description="El servicio no ha devuelto capacidades de candidatos para esta organización."
                />
              ) : (
                topSupply.map((capability) => {
                  const share =
                    (capability.candidateCount / maxSupply) * 100;

                  return (
                    <article
                      key={capability.capability}
                      className="rounded-xl border border-slate-200 bg-white p-4 transition hover:border-blue-200 hover:bg-blue-50/30"
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0">
                          <h3 className="break-words font-semibold text-slate-800">
                            {capability.capability}
                          </h3>

                          <p className="mt-1 text-xs text-slate-500">
                            Candidate capability evidence
                          </p>
                        </div>

                        <span className="shrink-0 rounded-lg bg-blue-100 px-2.5 py-1.5 text-sm font-bold tabular-nums text-blue-800">
                          {capability.candidateCount}
                        </span>
                      </div>

                      <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-slate-100">
                        <div
                          className="h-full rounded-full bg-gradient-to-r from-blue-500 to-cyan-400"
                          style={{ width: `${share}%` }}
                        />
                      </div>

                      <div className="mt-4 grid grid-cols-3 gap-2">
                        <div className="rounded-lg bg-blue-50 p-2">
                          <p className="text-[11px] font-medium text-blue-600">
                            Direct
                          </p>

                          <p className="mt-1 text-lg font-bold text-blue-900">
                            {capability.directCandidateCount}
                          </p>
                        </div>

                        <div className="rounded-lg bg-violet-50 p-2">
                          <p className="text-[11px] font-medium text-violet-600">
                            Transferable
                          </p>

                          <p className="mt-1 text-lg font-bold text-violet-900">
                            {capability.transferableCandidateCount}
                          </p>
                        </div>

                        <div className="rounded-lg bg-slate-100 p-2">
                          <p className="text-[11px] font-medium text-slate-500">
                            Evidence
                          </p>

                          <p className="mt-1 text-lg font-bold text-slate-800">
                            {capability.evidenceCount}
                          </p>
                        </div>
                      </div>
                    </article>
                  );
                })
              )}
            </div>

            {supply.capabilities.length > 10 && (
              <div className="border-t border-slate-100 bg-slate-50 px-5 py-3 text-xs text-slate-500">
                Showing 10 of {supply.capabilities.length} capabilities.
              </div>
            )}
          </div>

          <div className="overflow-hidden rounded-2xl border border-violet-200 bg-white shadow-sm">
            <div className="border-b border-violet-100 bg-gradient-to-r from-violet-50 to-white p-5 sm:p-6">
              <SectionHeading
                eyebrow="Market demand"
                title="Required Capabilities"
                description="Capacidades solicitadas con mayor frecuencia en los empleos activos analizados."
                count={`${demand.capabilities.length} capabilities`}
                tone="violet"
              />
            </div>

            <div className="space-y-3 p-4 sm:p-6">
              {topDemand.length === 0 ? (
                <EmptyState
                  title="No job demand capabilities"
                  description="El servicio no ha devuelto requisitos de capacidades para los empleos analizados."
                />
              ) : (
                topDemand.map((capability) => {
                  const share =
                    (capability.jobCount / maxDemand) * 100;

                  return (
                    <article
                      key={`${capability.category}-${capability.capability}`}
                      className="rounded-xl border border-slate-200 bg-white p-4 transition hover:border-violet-200 hover:bg-violet-50/30"
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0">
                          <h3 className="break-words font-semibold text-slate-800">
                            {capability.capability}
                          </h3>

                          <p className="mt-1 text-xs text-slate-500">
                            Category: {capability.category}
                          </p>
                        </div>

                        <span className="shrink-0 rounded-lg bg-violet-100 px-2.5 py-1.5 text-sm font-bold tabular-nums text-violet-800">
                          {capability.jobCount} jobs
                        </span>
                      </div>

                      <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-slate-100">
                        <div
                          className="h-full rounded-full bg-gradient-to-r from-violet-500 to-fuchsia-400"
                          style={{ width: `${share}%` }}
                        />
                      </div>

                      <div className="mt-3 flex items-center justify-between gap-3 text-xs">
                        <span className="text-slate-500">
                          Requirement occurrences
                        </span>

                        <span className="font-semibold text-violet-800">
                          {capability.requirementCount} requirements
                        </span>
                      </div>
                    </article>
                  );
                })
              )}
            </div>

            {demand.capabilities.length > 10 && (
              <div className="border-t border-slate-100 bg-slate-50 px-5 py-3 text-xs text-slate-500">
                Showing 10 of {demand.capabilities.length} capabilities.
              </div>
            )}
          </div>
        </section>

        <section className="mt-8 overflow-hidden rounded-2xl border border-rose-200 bg-white shadow-sm">
          <div className="border-b border-rose-100 bg-gradient-to-r from-rose-50 via-white to-white p-5 sm:p-7">
            <SectionHeading
              eyebrow="Strategic capability analysis"
              title="Talent Gap Analysis"
              description="Comparación de la demanda laboral con la oferta de talento identificada. Los indicadores reflejan las clasificaciones calculadas por el servicio."
              count={`${topGaps.length} displayed`}
              tone="rose"
            />
          </div>

          {topGaps.length === 0 ? (
            <div className="p-5 sm:p-7">
              <EmptyState
                title="No capability gaps identified"
                description="El servicio no ha devuelto brechas de capacidades para el análisis actual."
              />
            </div>
          ) : (
            <>
              <div className="grid gap-3 border-b border-slate-100 bg-slate-50/70 p-4 sm:grid-cols-3">
                <div className="rounded-xl border border-slate-200 bg-white p-4">
                  <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                    Demand
                  </p>

                  <p className="mt-2 text-2xl font-extrabold text-slate-900">
                    {topGaps.reduce(
                      (total, gap) => total + gap.demandCount,
                      0
                    )}
                  </p>

                  <p className="mt-1 text-xs text-slate-500">
                    Across displayed gaps
                  </p>
                </div>

                <div className="rounded-xl border border-slate-200 bg-white p-4">
                  <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                    Candidate supply
                  </p>

                  <p className="mt-2 text-2xl font-extrabold text-slate-900">
                    {topGaps.reduce(
                      (total, gap) =>
                        total + gap.supplyCandidateCount,
                      0
                    )}
                  </p>

                  <p className="mt-1 text-xs text-slate-500">
                    Across displayed gaps
                  </p>
                </div>

                <div className="rounded-xl border border-rose-200 bg-rose-50 p-4">
                  <p className="text-xs font-semibold uppercase tracking-wider text-rose-600">
                    No direct supply
                  </p>

                  <p className="mt-2 text-2xl font-extrabold text-rose-800">
                    {topGaps.filter(
                      (gap) =>
                        gap.gapType === "NO_DIRECT_SUPPLY"
                    ).length}
                  </p>

                  <p className="mt-1 text-xs text-rose-700">
                    Among displayed gaps
                  </p>
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full min-w-[920px] text-left text-sm">
                  <thead className="bg-slate-50">
                    <tr className="border-b border-slate-200 text-xs uppercase tracking-wider text-slate-500">
                      <th className="px-5 py-4 font-bold">
                        Capability
                      </th>

                      <th className="px-4 py-4 font-bold">
                        Category
                      </th>

                      <th className="px-4 py-4 text-right font-bold">
                        Demand
                      </th>

                      <th className="px-4 py-4 text-right font-bold">
                        Supply
                      </th>

                      <th className="px-4 py-4 text-right font-bold">
                        Direct
                      </th>

                      <th className="px-4 py-4 text-right font-bold">
                        Transferable
                      </th>

                      <th className="px-5 py-4 font-bold">
                        Gap status
                      </th>
                    </tr>
                  </thead>

                  <tbody className="divide-y divide-slate-100">
                    {topGaps.map((gap) => {
                      const style = gapStyles[gap.gapType];

                      return (
                        <tr
                          key={`${gap.category}-${gap.capability}`}
                          className={`border-l-4 transition hover:bg-slate-50 ${style.row}`}
                        >
                          <td className="px-5 py-4">
                            <p className="max-w-64 font-semibold text-slate-800">
                              {gap.capability}
                            </p>
                          </td>

                          <td className="px-4 py-4 text-slate-600">
                            {gap.category}
                          </td>

                          <td className="px-4 py-4 text-right font-semibold tabular-nums text-slate-800">
                            {gap.demandCount}
                          </td>

                          <td className="px-4 py-4 text-right tabular-nums text-slate-700">
                            {gap.supplyCandidateCount}
                          </td>

                          <td className="px-4 py-4 text-right tabular-nums text-blue-700">
                            {gap.directSupplyCount}
                          </td>

                          <td className="px-4 py-4 text-right tabular-nums text-violet-700">
                            {gap.transferableSupplyCount}
                          </td>

                          <td className="px-5 py-4">
                            <span
                              className={`inline-flex items-center gap-2 whitespace-nowrap rounded-full border px-3 py-1.5 text-xs font-bold ${style.badge}`}
                            >
                              <span
                                className={`h-1.5 w-1.5 rounded-full ${style.dot}`}
                                aria-hidden="true"
                              />

                              {gapLabels[gap.gapType]}
                            </span>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              <div className="flex flex-col gap-2 border-t border-slate-100 bg-slate-50 px-5 py-4 text-xs text-slate-500 sm:flex-row sm:items-center sm:justify-between">
                <span>
                  Showing up to 15 gaps from the service response.
                </span>

                <span>
                  Total identified gaps: {gaps.gaps.length}
                </span>
              </div>
            </>
          )}
        </section>

        <footer className="mt-8 rounded-2xl border border-slate-200 bg-white p-5 sm:p-6">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-sm font-bold text-slate-800">
                Global Career AI
              </p>

              <p className="mt-1 text-xs text-slate-500">
                Enterprise Talent Intelligence · V1.0
              </p>
            </div>

            <div className="text-xs leading-5 text-slate-400 sm:text-right">
              <p>Organization scope</p>

              <p className="break-all font-mono text-slate-500">
                {intelligence.scope.organizationId}
              </p>
            </div>
          </div>
        </footer>
      </div>
    </main>
  );
}
