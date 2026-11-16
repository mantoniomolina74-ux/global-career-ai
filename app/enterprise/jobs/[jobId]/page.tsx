
import type { ReactNode } from "react";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";

import { createSupabaseServerAuth } from "@/lib/supabase/server";
import { getUserOrganizations } from "@/lib/enterprise/organizationService";
import { requireEnterprisePermission } from "@/lib/enterprise/enterpriseAuthorization";
import { getEnterpriseRecruiterIntelligence } from "@/lib/enterprise/enterpriseRecruiterService";

type PageProps = {
  params: Promise<{ jobId: string }>;
};

type Decision = "SHORTLIST" | "REVIEW" | "REJECT" | string;

function Icon({
  name,
  className = "h-5 w-5",
}: {
  name: "briefcase" | "users" | "chart" | "check" | "globe" | "arrow" | "shield" | "file";
  className?: string;
}) {
  const paths: Record<typeof name, ReactNode> = {
    briefcase: (
      <>
        <rect x="3" y="7" width="18" height="14" rx="2" />
        <path d="M8 7V5a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2M3 12h18M10 12v2h4v-2" />
      </>
    ),
    users: (
      <>
        <path d="M16 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
        <circle cx="10" cy="7" r="4" />
        <path d="M20 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75" />
      </>
    ),
    chart: (
      <>
        <path d="M3 3v18h18" />
        <path d="m7 14 4-4 4 3 5-7" />
      </>
    ),
    check: <path d="m5 12 4 4L19 6" />,
    globe: (
      <>
        <circle cx="12" cy="12" r="9" />
        <path d="M3 12h18M12 3a15 15 0 0 1 0 18M12 3a15 15 0 0 0 0 18" />
      </>
    ),
    arrow: <path d="M5 12h14m-7-7 7 7-7 7" />,
    shield: (
      <>
        <path d="M12 22s8-4 8-11V5l-8-3-8 3v6c0 7 8 11 8 11Z" />
        <path d="m9 12 2 2 4-4" />
      </>
    ),
    file: (
      <>
        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8Z" />
        <path d="M14 2v6h6M8 13h8M8 17h8" />
      </>
    ),
  };

  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.7"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
    >
      {paths[name]}
    </svg>
  );
}

function MetricCard({
  label,
  value,
  description,
  tone,
  icon,
}: {
  label: string;
  value: string | number;
  description: string;
  tone: "blue" | "violet" | "cyan" | "emerald" | "amber" | "rose";
  icon: ReactNode;
}) {
  const styles = {
    blue: {
      border: "border-blue-200",
      accent: "bg-blue-600",
      icon: "bg-blue-100 text-blue-700",
      value: "text-blue-950",
    },
    violet: {
      border: "border-violet-200",
      accent: "bg-violet-600",
      icon: "bg-violet-100 text-violet-700",
      value: "text-violet-950",
    },
    cyan: {
      border: "border-cyan-200",
      accent: "bg-cyan-600",
      icon: "bg-cyan-100 text-cyan-700",
      value: "text-cyan-950",
    },
    emerald: {
      border: "border-emerald-200",
      accent: "bg-emerald-600",
      icon: "bg-emerald-100 text-emerald-700",
      value: "text-emerald-950",
    },
    amber: {
      border: "border-amber-200",
      accent: "bg-amber-500",
      icon: "bg-amber-100 text-amber-800",
      value: "text-amber-950",
    },
    rose: {
      border: "border-rose-200",
      accent: "bg-rose-600",
      icon: "bg-rose-100 text-rose-700",
      value: "text-rose-950",
    },
  };

  const style = styles[tone];

  return (
    <article
      className={`relative overflow-hidden rounded-2xl border ${style.border} bg-white p-5 shadow-sm transition-shadow hover:shadow-md`}
    >
      <div className={`absolute inset-x-0 top-0 h-1 ${style.accent}`} />

      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-sm font-medium leading-5 text-slate-500">
            {label}
          </p>
          <p className={`mt-3 text-3xl font-bold tracking-tight tabular-nums ${style.value}`}>
            {value}
          </p>
        </div>
        <div className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl ${style.icon}`}>
          {icon}
        </div>
      </div>

      <p className="mt-4 text-xs leading-5 text-slate-500">
        {description}
      </p>
    </article>
  );
}

function InfoItem({
  label,
  value,
}: {
  label: string;
  value: string | number | null | undefined;
}) {
  return (
    <div className="rounded-xl border border-slate-100 bg-slate-50/80 p-4">
      <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
        {label}
      </p>
      <p className="mt-2 break-words text-sm font-semibold leading-6 text-slate-900">
        {value ?? "Not available"}
      </p>
    </div>
  );
}

function DecisionBadge({ decision }: { decision: Decision }) {
  const normalized = decision.toUpperCase();

  const style =
    normalized === "SHORTLIST"
      ? "border-emerald-200 bg-emerald-50 text-emerald-800"
      : normalized === "REVIEW"
        ? "border-amber-200 bg-amber-50 text-amber-800"
        : normalized === "REJECT"
          ? "border-rose-200 bg-rose-50 text-rose-800"
          : "border-slate-200 bg-slate-100 text-slate-700";

  const dot =
    normalized === "SHORTLIST"
      ? "bg-emerald-500"
      : normalized === "REVIEW"
        ? "bg-amber-500"
        : normalized === "REJECT"
          ? "bg-rose-500"
          : "bg-slate-400";

  return (
    <span className={`inline-flex items-center gap-2 rounded-full border px-3 py-1.5 text-xs font-bold ${style}`}>
      <span className={`h-2 w-2 rounded-full ${dot}`} />
      {decision}
    </span>
  );
}

function MatchBadge({
  match,
}: {
  match: "DIRECT" | "TRANSFERABLE" | "PARTIAL" | "NO_EVIDENCE";
}) {
  const styles = {
    DIRECT: "border-emerald-200 bg-emerald-50 text-emerald-800",
    TRANSFERABLE: "border-blue-200 bg-blue-50 text-blue-800",
    PARTIAL: "border-amber-200 bg-amber-50 text-amber-800",
    NO_EVIDENCE: "border-rose-200 bg-rose-50 text-rose-800",
  };

  const labels = {
    DIRECT: "Direct",
    TRANSFERABLE: "Transferable",
    PARTIAL: "Partial",
    NO_EVIDENCE: "No Evidence",
  };

  return (
    <span className={`inline-flex whitespace-nowrap rounded-full border px-3 py-1 text-xs font-bold ${styles[match]}`}>
      {labels[match]}
    </span>
  );
}

function IntelligenceMetric({
  label,
  value,
  tone,
}: {
  label: string;
  value: number;
  tone: "emerald" | "blue" | "amber" | "rose";
}) {
  const styles = {
    emerald: "border-emerald-200 bg-emerald-50 text-emerald-900",
    blue: "border-blue-200 bg-blue-50 text-blue-900",
    amber: "border-amber-200 bg-amber-50 text-amber-900",
    rose: "border-rose-200 bg-rose-50 text-rose-900",
  };

  return (
    <div className={`rounded-xl border p-4 ${styles[tone]}`}>
      <p className="text-xs font-semibold uppercase tracking-wide opacity-75">
        {label}
      </p>
      <p className="mt-2 text-2xl font-bold tabular-nums">{value}</p>
    </div>
  );
}

function SkillSection({
  title,
  skills,
  tone,
}: {
  title: string;
  skills: string[];
  tone: "emerald" | "rose";
}) {
  const styles = {
    emerald: "border-emerald-200 bg-emerald-50 text-emerald-800",
    rose: "border-rose-200 bg-rose-50 text-rose-800",
  };

  return (
    <div className="mt-6">
      <div className="flex items-center gap-2">
        <span className={`h-2 w-2 rounded-full ${tone === "emerald" ? "bg-emerald-500" : "bg-rose-500"}`} />
        <h4 className="text-sm font-bold text-slate-800">{title}</h4>
        <span className="rounded-full bg-slate-100 px-2 py-0.5 text-xs font-semibold text-slate-600">
          {skills.length}
        </span>
      </div>

      {skills.length === 0 ? (
        <p className="mt-3 text-sm text-slate-500">No data available.</p>
      ) : (
        <div className="mt-3 flex flex-wrap gap-2">
          {skills.map((skill, index) => (
            <span
              key={`${skill}-${index}`}
              className={`rounded-lg border px-3 py-2 text-sm font-medium ${styles[tone]}`}
            >
              {skill}
            </span>
          ))}
        </div>
      )}
    </div>
  );
}

function CandidateJobIntelligenceSection({
  candidateJobIntelligence,
}: {
  candidateJobIntelligence: {
    evaluations: Array<{
      requirement: { name: string; category: string };
      match: "DIRECT" | "TRANSFERABLE" | "PARTIAL" | "NO_EVIDENCE";
      evidence: Array<{
        skill: string;
        evidenceType: string;
        source: string;
        relevance: string;
        transferableStrength?: string;
        confidence: string;
      }>;
    }>;
    matchedRequirements: number;
    transferableRequirements: number;
    partialRequirements: number;
    missingRequirements: number;
  };
}) {
  return (
    <section className="mt-8 border-t border-slate-200 pt-6">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <div className="flex items-center gap-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-indigo-100 text-indigo-700">
              <Icon name="chart" />
            </div>
            <h4 className="text-lg font-bold text-slate-900">
              Candidate ↔ Job Intelligence
            </h4>
          </div>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-500">
            Evaluación por requisito basada en evidencia del perfil real
            del candidato y en los requisitos reales del puesto.
          </p>
        </div>

        <span className="inline-flex w-fit items-center gap-2 rounded-full border border-indigo-200 bg-indigo-50 px-3 py-1.5 text-xs font-semibold text-indigo-700">
          <Icon name="shield" className="h-4 w-4" />
          Evidence-based
        </span>
      </div>

      <div className="mt-5 grid grid-cols-2 gap-3 xl:grid-cols-4">
        <IntelligenceMetric
          label="Direct"
          value={candidateJobIntelligence.matchedRequirements}
          tone="emerald"
        />
        <IntelligenceMetric
          label="Transferable"
          value={candidateJobIntelligence.transferableRequirements}
          tone="blue"
        />
        <IntelligenceMetric
          label="Partial"
          value={candidateJobIntelligence.partialRequirements}
          tone="amber"
        />
        <IntelligenceMetric
          label="No Evidence"
          value={candidateJobIntelligence.missingRequirements}
          tone="rose"
        />
      </div>

      <div className="mt-6 overflow-hidden rounded-2xl border border-slate-200">
        <div className="border-b border-slate-200 bg-slate-50 px-5 py-4">
          <h5 className="font-bold text-slate-800">
            Requirement Evidence Matrix
          </h5>
          <p className="mt-1 text-xs text-slate-500">
            Evidencia registrada para cada requisito evaluado.
          </p>
        </div>

        {candidateJobIntelligence.evaluations.length === 0 ? (
          <div className="p-6 text-sm text-slate-500">
            No requirement evaluations available.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-[760px] w-full divide-y divide-slate-200 text-sm">
              <thead className="bg-white">
                <tr>
                  <th className="px-5 py-4 text-left text-xs font-bold uppercase tracking-wide text-slate-500">
                    Requirement
                  </th>
                  <th className="px-5 py-4 text-left text-xs font-bold uppercase tracking-wide text-slate-500">
                    Category
                  </th>
                  <th className="px-5 py-4 text-left text-xs font-bold uppercase tracking-wide text-slate-500">
                    Match
                  </th>
                  <th className="px-5 py-4 text-left text-xs font-bold uppercase tracking-wide text-slate-500">
                    Evidence
                  </th>
                </tr>
              </thead>

              <tbody className="divide-y divide-slate-100 bg-white">
                {candidateJobIntelligence.evaluations.map(
                  (evaluation, index) => (
                    <tr
                      key={`${evaluation.requirement.name}-${index}`}
                      className="align-top transition-colors hover:bg-slate-50"
                    >
                      <td className="px-5 py-4 font-semibold leading-6 text-slate-900">
                        {evaluation.requirement.name}
                      </td>
                      <td className="px-5 py-4">
                        <span className="inline-flex rounded-lg bg-slate-100 px-2.5 py-1 text-xs font-semibold text-slate-700">
                          {evaluation.requirement.category}
                        </span>
                      </td>
                      <td className="px-5 py-4">
                        <MatchBadge match={evaluation.match} />
                      </td>
                      <td className="px-5 py-4">
                        {evaluation.evidence.length === 0 ? (
                          <span className="text-sm italic text-slate-400">
                            No evidence
                          </span>
                        ) : (
                          <div className="space-y-3">
                            {evaluation.evidence.map((evidence, evidenceIndex) => (
                              <div
                                key={`${evidence.skill}-${evidenceIndex}`}
                                className="rounded-xl border border-slate-100 bg-slate-50 p-3"
                              >
                                <p className="font-semibold text-slate-900">
                                  {evidence.skill}
                                </p>
                                <div className="mt-2 flex flex-wrap gap-1.5">
                                  <span className="rounded-md bg-white px-2 py-1 text-xs text-slate-600 ring-1 ring-slate-200">
                                    {evidence.evidenceType}
                                  </span>
                                  <span className="rounded-md bg-white px-2 py-1 text-xs text-slate-600 ring-1 ring-slate-200">
                                    {evidence.source}
                                  </span>
                                  <span className="rounded-md bg-white px-2 py-1 text-xs text-slate-600 ring-1 ring-slate-200">
                                    Confidence: {evidence.confidence}
                                  </span>
                                </div>
                                {evidence.relevance ? (
                                  <p className="mt-2 text-xs leading-5 text-slate-600">
                                    {evidence.relevance}
                                  </p>
                                ) : null}
                                {evidence.transferableStrength ? (
                                  <p className="mt-2 text-xs leading-5 text-blue-800">
                                    Transferable strength: {evidence.transferableStrength}
                                  </p>
                                ) : null}
                              </div>
                            ))}
                          </div>
                        )}
                      </td>
                    </tr>
                  )
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </section>
  );
}

export default async function EnterpriseJobDetailPage({
  params,
}: PageProps) {
  const { jobId } = await params;

  const supabase = await createSupabaseServerAuth();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const organizations = await getUserOrganizations(user.id);

  if (organizations.length === 0) {
    notFound();
  }

  const organization = organizations[0];

  await requireEnterprisePermission(
    user.id,
    organization.id,
    "VIEW_CANDIDATE_INTELLIGENCE"
  );

  const intelligence = await getEnterpriseRecruiterIntelligence({
    organizationId: organization.id,
    jobId,
  });

  if (!intelligence) {
    notFound();
  }

  const { job, metrics, candidates, meta } = intelligence;

  return (
    <main className="min-h-screen bg-slate-50 px-4 py-8 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl space-y-8">
        <header className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-slate-950 via-blue-950 to-indigo-900 p-7 text-white shadow-xl sm:p-10">
          <div
            aria-hidden="true"
            className="absolute -right-16 -top-20 h-72 w-72 rounded-full bg-blue-400/10 blur-3xl"
          />
          <div
            aria-hidden="true"
            className="absolute -bottom-24 right-1/3 h-56 w-56 rounded-full bg-violet-400/10 blur-3xl"
          />

          <div className="relative">
            <Link
              href="/enterprise/jobs"
              className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/5 px-3 py-1.5 text-xs font-semibold text-blue-100 transition-colors hover:bg-white/10"
            >
              <span aria-hidden="true">←</span>
              Enterprise Jobs
            </Link>

            <div className="mt-6 flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
              <div className="max-w-3xl">
                <div className="inline-flex items-center gap-2 rounded-full border border-blue-300/30 bg-blue-400/10 px-3 py-1 text-xs font-bold uppercase tracking-[0.18em] text-blue-200">
                  <Icon name="chart" className="h-4 w-4" />
                  Recruiting Intelligence
                </div>

                <h1 className="mt-5 text-3xl font-bold tracking-tight sm:text-4xl">
                  Recruiter Intelligence
                </h1>

                <p className="mt-3 max-w-2xl text-sm leading-6 text-blue-100/80 sm:text-base">
                  Inteligencia de selección, resultados ATS y evidencia
                  de capacidades para apoyar decisiones de reclutamiento
                  informadas.
                </p>

                <div className="mt-6 flex items-start gap-3">
                  <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-white/15 bg-white/10">
                    <Icon name="briefcase" className="h-6 w-6 text-blue-200" />
                  </div>
                  <div>
                    <p className="text-xs font-medium text-blue-200/70">
                      Position
                    </p>
                    <h2 className="mt-1 text-lg font-bold text-white sm:text-xl">
                      {job.title}
                    </h2>
                    <p className="mt-1 text-sm text-blue-100/80">
                      {job.company ?? "Company not specified"}
                    </p>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 lg:min-w-[250px]">
                <div className="rounded-2xl border border-white/15 bg-white/[0.07] p-4 backdrop-blur-sm">
                  <p className="text-xs font-medium text-blue-200/80">
                    Candidates
                  </p>
                  <p className="mt-2 text-3xl font-bold tabular-nums">
                    {metrics.candidatesProcessed}
                  </p>
                  <p className="mt-1 text-xs text-slate-300">Processed</p>
                </div>

                <div className="rounded-2xl border border-white/15 bg-white/[0.07] p-4 backdrop-blur-sm">
                  <p className="text-xs font-medium text-blue-200/80">
                    Applications
                  </p>
                  <p className="mt-2 text-3xl font-bold tabular-nums">
                    {metrics.applicationsProcessed}
                  </p>
                  <p className="mt-1 text-xs text-slate-300">Processed</p>
                </div>
              </div>
            </div>

            <div className="mt-7 flex flex-wrap gap-2 border-t border-white/10 pt-5">
              {job.location ? (
                <span className="inline-flex items-center gap-2 rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-xs font-medium text-blue-100">
                  <Icon name="globe" className="h-4 w-4" />
                  {job.location}
                </span>
              ) : null}
              {job.country ? (
                <span className="inline-flex items-center gap-2 rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-xs font-medium text-blue-100">
                  <Icon name="globe" className="h-4 w-4" />
                  {job.country}
                </span>
              ) : null}
              <span className="inline-flex items-center gap-2 rounded-lg border border-emerald-300/20 bg-emerald-400/10 px-3 py-2 text-xs font-semibold text-emerald-200">
                <Icon name="shield" className="h-4 w-4" />
                Authorized Enterprise access
              </span>
            </div>
          </div>
        </header>

        <section>
          <div className="mb-4">
            <p className="text-xs font-bold uppercase tracking-[0.18em] text-blue-600">
              Recruitment performance
            </p>
            <h2 className="mt-2 text-2xl font-bold tracking-tight text-slate-900">
              Recruitment Overview
            </h2>
            <p className="mt-1 text-sm text-slate-500">
              Métricas calculadas por el servicio de inteligencia empresarial.
            </p>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
            <MetricCard
              label="Candidates Processed"
              value={metrics.candidatesProcessed}
              description="Candidatos procesados para esta posición."
              tone="blue"
              icon={<Icon name="users" />}
            />
            <MetricCard
              label="Applications Processed"
              value={metrics.applicationsProcessed}
              description="Solicitudes procesadas por el sistema."
              tone="violet"
              icon={<Icon name="file" />}
            />
            <MetricCard
              label="Average ATS"
              value={metrics.averageATS ?? "N/A"}
              description="Promedio ATS reportado por el servicio."
              tone="cyan"
              icon={<Icon name="chart" />}
            />
            <MetricCard
              label="ATS Applications"
              value={metrics.atsApplicationsProcessed}
              description="Solicitudes con evaluación ATS disponible."
              tone="emerald"
              icon={<Icon name="check" />}
            />
          </div>
        </section>

        <section>
          <div className="mb-4">
            <p className="text-xs font-bold uppercase tracking-[0.18em] text-blue-600">
              Selection outcomes
            </p>
            <h2 className="mt-2 text-2xl font-bold tracking-tight text-slate-900">
              Recruitment Decisions
            </h2>
            <p className="mt-1 text-sm text-slate-500">
              Distribución de decisiones existentes, sin alterar los criterios ATS.
            </p>
          </div>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
            <MetricCard
              label="Shortlisted"
              value={metrics.shortlisted}
              description="Candidaturas clasificadas para shortlist."
              tone="emerald"
              icon={<Icon name="check" />}
            />
            <MetricCard
              label="Review"
              value={metrics.review}
              description="Candidaturas pendientes de revisión."
              tone="amber"
              icon={<Icon name="file" />}
            />
            <MetricCard
              label="Rejected"
              value={metrics.rejected}
              description="Candidaturas clasificadas como rechazadas."
              tone="rose"
              icon={<Icon name="shield" />}
            />
          </div>
        </section>

        <section className="space-y-5">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.18em] text-blue-600">
                Candidate evaluation
              </p>
              <h2 className="mt-2 text-2xl font-bold tracking-tight text-slate-900">
                Candidate Intelligence
              </h2>
              <p className="mt-1 text-sm leading-6 text-slate-500">
                Resultados ATS, decisión, habilidades y evidencia por requisito.
              </p>
            </div>
            <span className="inline-flex w-fit items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-600 shadow-sm">
              <Icon name="users" className="h-4 w-4" />
              {candidates.length} candidate records
            </span>
          </div>

          {candidates.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-slate-300 bg-white px-6 py-14 text-center shadow-sm">
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-100 text-slate-500">
                <Icon name="users" className="h-7 w-7" />
              </div>
              <h3 className="mt-4 text-lg font-bold text-slate-900">
                No candidates found
              </h3>
              <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-slate-500">
                No hay candidaturas disponibles para esta posición en los datos
                devueltos por el servicio.
              </p>
            </div>
          ) : (
            <div className="space-y-5">
              {candidates.map((candidate) => (
                <article
                  key={`${candidate.candidateUserId}-${candidate.applicationId}`}
                  className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm"
                >
                  <div className="h-1 bg-gradient-to-r from-blue-600 via-indigo-500 to-violet-500" />

                  <div className="p-5 sm:p-7">
                    <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
                      <div className="flex min-w-0 items-start gap-4">
                        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-100 to-indigo-100 text-blue-700 ring-1 ring-blue-200/70">
                          <Icon name="users" className="h-6 w-6" />
                        </div>
                        <div className="min-w-0">
                          <p className="text-xs font-bold uppercase tracking-[0.15em] text-slate-400">
                            Candidate profile
                          </p>
                          <h3 className="mt-2 break-all text-base font-bold text-slate-900">
                            {candidate.candidateUserId}
                          </h3>
                          <p className="mt-1 break-all text-xs text-slate-500">
                            Application ID: {candidate.applicationId}
                          </p>
                        </div>
                      </div>

                      <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4 lg:min-w-[180px]">
                        <p className="text-xs font-bold uppercase tracking-wide text-slate-500">
                          Selection decision
                        </p>
                        <div className="mt-3">
                          <DecisionBadge decision={candidate.decision} />
                        </div>
                      </div>
                    </div>

                    <div className="mt-6 grid grid-cols-1 gap-3 sm:grid-cols-3">
                      <InfoItem label="Application status" value={candidate.status} />
                      <InfoItem
                        label="ATS Score"
                        value={candidate.atsScore !== null ? candidate.atsScore : "N/A"}
                      />
                      <InfoItem
                        label="ATS Available"
                        value={candidate.atsAvailable ? "Yes" : "No"}
                      />
                    </div>

                    <div className="mt-6 rounded-xl border border-slate-200 bg-slate-50/80 p-4">
                      <div className="flex items-start gap-3">
                        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-indigo-100 text-indigo-700">
                          <Icon name="file" className="h-4 w-4" />
                        </div>
                        <div>
                          <h4 className="text-sm font-bold text-slate-800">
                            Decision Reason
                          </h4>
                          <p className="mt-2 text-sm leading-6 text-slate-600">
                            {candidate.reason}
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-2">
                      <SkillSection
                        title="Matched Skills"
                        skills={candidate.matchedSkills}
                        tone="emerald"
                      />
                      <SkillSection
                        title="Missing Skills"
                        skills={candidate.missingSkills}
                        tone="rose"
                      />
                    </div>

                    <CandidateJobIntelligenceSection
                      candidateJobIntelligence={candidate.candidateJobIntelligence}
                    />
                  </div>
                </article>
              ))}
            </div>
          )}
        </section>

        <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
          <div className="border-b border-slate-200 bg-slate-50 px-5 py-4 sm:px-6">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-200 text-slate-700">
                <Icon name="shield" />
              </div>
              <div>
                <h2 className="font-bold text-slate-900">
                  Intelligence Metadata
                </h2>
                <p className="mt-1 text-xs text-slate-500">
                  Información de generación proporcionada por el servicio.
                </p>
              </div>
            </div>
          </div>
          <div className="grid gap-4 p-5 sm:grid-cols-2 sm:p-6">
            <InfoItem label="Strategy" value={meta.strategy} />
            <InfoItem label="Generated At" value={meta.generatedAt} />
          </div>
        </section>

        <footer className="flex flex-col gap-2 border-t border-slate-200 py-5 text-xs text-slate-500 sm:flex-row sm:items-center sm:justify-between">
          <p>Global Career AI · Enterprise Recruiting Intelligence</p>
          <Link
            href="/enterprise/jobs"
            className="inline-flex items-center gap-2 font-semibold text-blue-700 hover:text-blue-900"
          >
            Return to Enterprise Jobs
            <Icon name="arrow" className="h-4 w-4" />
          </Link>
        </footer>
      </div>
    </main>
  );
}
