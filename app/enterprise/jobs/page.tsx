
import Link from "next/link";
import { redirect } from "next/navigation";

import { createSupabaseServerAuth } from "@/lib/supabase/server";
import { requireEnterprisePermission } from "@/lib/enterprise/enterpriseAuthorization";
import { getUserOrganizations } from "@/lib/enterprise/organizationService";

type EnterpriseJob = {
  id: string;
  title: string | null;
  company: string | null;
  location: string | null;
  country: string | null;
  industry: string | null;
  description: string | null;
  url: string | null;
  source: string | null;
  category: string | null;
  tags: string | null;
  created_at: string | null;
};

function distinctValues(values: Array<string | null>) {
  return new Set(
    values
      .map((value) => value?.trim())
      .filter((value): value is string => Boolean(value))
      .map((value) => value.toLocaleLowerCase())
  ).size;
}

function BriefcaseIcon({ className = "h-6 w-6" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.7"
      className={className}
      aria-hidden="true"
    >
      <rect x="3" y="7" width="18" height="14" rx="2" />
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M8 7V5a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2M3 12h18M10 12v2h4v-2"
      />
    </svg>
  );
}

function GlobeIcon({ className = "h-6 w-6" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.7"
      className={className}
      aria-hidden="true"
    >
      <circle cx="12" cy="12" r="9" />
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M3 12h18M12 3a15 15 0 0 1 0 18M12 3a15 15 0 0 0 0 18"
      />
    </svg>
  );
}

function IndustryIcon({ className = "h-6 w-6" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.7"
      className={className}
      aria-hidden="true"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M3 21V9l6 4V9l6 4V5l6 4v12H3Z"
      />
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M7 17h2m3 0h2m3 0h2"
      />
    </svg>
  );
}

function ArrowIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      className="h-4 w-4 transition-transform group-hover:translate-x-1"
      aria-hidden="true"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M5 12h14m-7-7 7 7-7 7"
      />
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
  value: number;
  description: string;
  tone: "blue" | "violet" | "emerald";
  icon: React.ReactNode;
}) {
  const tones = {
    blue: {
      border: "border-blue-200",
      icon: "bg-blue-100 text-blue-700",
      value: "text-blue-950",
      accent: "bg-blue-600",
    },
    violet: {
      border: "border-violet-200",
      icon: "bg-violet-100 text-violet-700",
      value: "text-violet-950",
      accent: "bg-violet-600",
    },
    emerald: {
      border: "border-emerald-200",
      icon: "bg-emerald-100 text-emerald-700",
      value: "text-emerald-950",
      accent: "bg-emerald-600",
    },
  };

  const style = tones[tone];

  return (
    <article
      className={`relative overflow-hidden rounded-2xl border ${style.border} bg-white p-5 shadow-sm transition-shadow hover:shadow-md sm:p-6`}
    >
      <div className={`absolute inset-x-0 top-0 h-1 ${style.accent}`} />

      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-sm font-medium leading-5 text-slate-500">
            {label}
          </p>
          <p className={`mt-3 text-4xl font-bold tracking-tight tabular-nums ${style.value}`}>
            {value}
          </p>
        </div>

        <div className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl ${style.icon}`}>
          {icon}
        </div>
      </div>

      <p className="mt-4 text-xs leading-5 text-slate-500">
        {description}
      </p>
    </article>
  );
}

function EmptyJobsState() {
  return (
    <section className="rounded-3xl border border-dashed border-slate-300 bg-white px-6 py-16 text-center shadow-sm">
      <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-blue-50 text-blue-700">
        <BriefcaseIcon className="h-8 w-8" />
      </div>

      <h2 className="mt-5 text-xl font-bold text-slate-900">
        No hay empleos disponibles
      </h2>

      <p className="mx-auto mt-2 max-w-lg text-sm leading-6 text-slate-500">
        No existen empleos Hirebase persistidos en los registros obtenidos.
        Cuando haya ofertas disponibles, aparecerán en este directorio.
      </p>

      <Link
        href="/enterprise"
        className="mt-6 inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-5 py-3 text-sm font-semibold text-slate-700 transition-colors hover:bg-slate-50"
      >
        <span aria-hidden="true">←</span>
        Volver a Enterprise
      </Link>
    </section>
  );
}

export default async function EnterpriseJobsPage() {
  const supabase = await createSupabaseServerAuth();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const organizations = await getUserOrganizations(user.id);

  if (organizations.length === 0) {
    redirect("/enterprise");
  }

  const organization = organizations[0];

  await requireEnterprisePermission(
    user.id,
    organization.id,
    "VIEW_CANDIDATE_INTELLIGENCE"
  );

  const { data: jobs, error } = await supabase
    .from("jobs")
    .select(
      `
        id,
        title,
        company,
        location,
        country,
        industry,
        description,
        url,
        source,
        category,
        tags,
        created_at
      `
    )
    .eq("source", "hirebase")
    .order("created_at", { ascending: false })
    .limit(100);

  if (error) {
    throw new Error(
      `Error obteniendo empleos Enterprise: ${error.message}`
    );
  }

  const enterpriseJobs = (jobs ?? []) as EnterpriseJob[];

  const countryCount = distinctValues(
    enterpriseJobs.map((job) => job.country)
  );

  const industryCount = distinctValues(
    enterpriseJobs.map((job) => job.industry)
  );

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
              href="/enterprise"
              className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/5 px-3 py-1.5 text-xs font-semibold text-blue-100 transition-colors hover:bg-white/10"
            >
              <span aria-hidden="true">←</span>
              Enterprise Overview
            </Link>

            <div className="mt-6 flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
              <div className="max-w-2xl">
                <div className="inline-flex items-center gap-2 rounded-full border border-blue-300/30 bg-blue-400/10 px-3 py-1 text-xs font-bold uppercase tracking-[0.18em] text-blue-200">
                  <BriefcaseIcon className="h-4 w-4" />
                  Enterprise Recruiting
                </div>

                <h1 className="mt-5 text-3xl font-bold tracking-tight sm:text-4xl">
                  Jobs Intelligence
                </h1>

                <p className="mt-3 max-w-xl text-sm leading-6 text-blue-100/80 sm:text-base">
                  Explora la demanda laboral disponible y accede a la
                  inteligencia de reclutamiento de cada posición.
                  Información basada en empleos reales persistidos.
                </p>

                <div className="mt-6 flex items-center gap-3">
                  <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-white/15 bg-white/10">
                    <IndustryIcon className="h-6 w-6 text-blue-200" />
                  </div>
                  <div>
                    <p className="text-xs font-medium text-blue-200/70">
                      Active organization
                    </p>
                    <p className="mt-1 text-base font-semibold text-white sm:text-lg">
                      {organization.name}
                    </p>
                  </div>
                </div>
              </div>

              <div className="rounded-2xl border border-white/15 bg-white/[0.07] p-5 backdrop-blur-sm lg:min-w-[220px]">
                <p className="text-xs font-semibold uppercase tracking-[0.16em] text-blue-200/80">
                  Loaded job records
                </p>
                <p className="mt-2 text-5xl font-bold tracking-tight tabular-nums">
                  {enterpriseJobs.length}
                </p>
                <div className="mt-3 flex items-center gap-2 text-xs text-slate-300">
                  <span className="h-2 w-2 rounded-full bg-emerald-400" />
                  Hirebase · Maximum 100 records
                </div>
              </div>
            </div>
          </div>
        </header>

        <section aria-label="Job directory metrics" className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
          <MetricCard
            label="Jobs loaded"
            value={enterpriseJobs.length}
            description="Registros Hirebase obtenidos para esta vista."
            tone="blue"
            icon={<BriefcaseIcon />}
          />

          <MetricCard
            label="Countries represented"
            value={countryCount}
            description="Países distintos indicados en los empleos cargados."
            tone="violet"
            icon={<GlobeIcon />}
          />

          <MetricCard
            label="Industries represented"
            value={industryCount}
            description="Industrias distintas indicadas en los empleos cargados."
            tone="emerald"
            icon={<IndustryIcon />}
          />
        </section>

        <section className="space-y-5">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.18em] text-blue-600">
                Opportunity directory
              </p>
              <h2 className="mt-2 text-2xl font-bold tracking-tight text-slate-900">
                Enterprise Jobs Directory
              </h2>
              <p className="mt-2 text-sm leading-6 text-slate-500">
                Ofertas reales de Hirebase con acceso a la inteligencia
                de reclutamiento por posición.
              </p>
            </div>

            <div className="inline-flex w-fit items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-medium text-slate-600 shadow-sm">
              <span className="h-2 w-2 rounded-full bg-emerald-500" />
              Persisted job data
            </div>
          </div>

          {enterpriseJobs.length === 0 ? (
            <EmptyJobsState />
          ) : (
            <div className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-3">
              {enterpriseJobs.map((job) => (
                <article
                  key={job.id}
                  className="group relative flex h-full flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition-all duration-200 hover:-translate-y-1 hover:border-blue-200 hover:shadow-lg"
                >
                  <div className="h-1 bg-gradient-to-r from-blue-600 via-indigo-500 to-violet-500" />

                  <div className="flex flex-1 flex-col p-5 sm:p-6">
                    <div className="flex items-start justify-between gap-3">
                      <span className="inline-flex items-center gap-2 rounded-full border border-blue-100 bg-blue-50 px-3 py-1 text-xs font-bold text-blue-700">
                        <span className="h-1.5 w-1.5 rounded-full bg-blue-600" />
                        {(job.source ?? "Hirebase").toUpperCase()}
                      </span>

                      {job.category ? (
                        <span className="max-w-[45%] rounded-lg bg-violet-50 px-2.5 py-1 text-right text-xs font-semibold text-violet-700">
                          {job.category}
                        </span>
                      ) : null}
                    </div>

                    <h3 className="mt-5 text-lg font-bold leading-7 text-slate-900 transition-colors group-hover:text-blue-800">
                      {job.title ?? "Untitled position"}
                    </h3>

                    <div className="mt-2 flex items-start gap-2 text-sm font-semibold text-slate-700">
                      <svg
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="1.7"
                        className="mt-0.5 h-4 w-4 shrink-0 text-slate-400"
                        aria-hidden="true"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M3 21h18M5 21V7l7-4 7 4v14M9 10h.01M15 10h.01M9 14h.01M15 14h.01M10 21v-4h4v4"
                        />
                      </svg>
                      <span>{job.company ?? "Company not specified"}</span>
                    </div>

                    <div className="mt-5 space-y-3">
                      {job.location || job.country ? (
                        <div className="flex items-start gap-3 rounded-xl border border-slate-100 bg-slate-50/80 p-3">
                          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-blue-100 text-blue-700">
                            <GlobeIcon className="h-4 w-4" />
                          </div>
                          <div className="min-w-0">
                            <p className="text-xs font-medium text-slate-500">
                              Location
                            </p>
                            <p className="mt-1 break-words text-sm font-semibold text-slate-800">
                              {[job.location, job.country]
                                .filter(Boolean)
                                .filter(
                                  (value, index, array) =>
                                    array.findIndex(
                                      (item) =>
                                        item?.toLowerCase() ===
                                        value?.toLowerCase()
                                    ) === index
                                )
                                .join(", ")}
                            </p>
                          </div>
                        </div>
                      ) : null}

                      {job.industry ? (
                        <div className="flex items-start gap-3 rounded-xl border border-slate-100 bg-slate-50/80 p-3">
                          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-violet-100 text-violet-700">
                            <IndustryIcon className="h-4 w-4" />
                          </div>
                          <div className="min-w-0">
                            <p className="text-xs font-medium text-slate-500">
                              Industry
                            </p>
                            <p className="mt-1 break-words text-sm font-semibold text-slate-800">
                              {job.industry}
                            </p>
                          </div>
                        </div>
                      ) : null}
                    </div>

                    {job.description ? (
                      <div className="mt-5 flex-1">
                        <p className="text-xs font-bold uppercase tracking-[0.14em] text-slate-400">
                          Position overview
                        </p>
                        <p className="mt-2 line-clamp-4 text-sm leading-6 text-slate-600">
                          {job.description}
                        </p>
                      </div>
                    ) : (
                      <div className="mt-5 flex-1">
                        <p className="text-sm italic text-slate-400">
                          No description available for this position.
                        </p>
                      </div>
                    )}

                    {job.tags ? (
                      <div className="mt-4 border-t border-slate-100 pt-4">
                        <p className="text-xs font-semibold text-slate-500">
                          Job tags
                        </p>
                        <p className="mt-1 line-clamp-2 break-words text-xs leading-5 text-slate-600">
                          {job.tags}
                        </p>
                      </div>
                    ) : null}

                    <div className="mt-6 space-y-3 border-t border-slate-100 pt-5">
                      <Link
                        href={`/enterprise/jobs/${job.id}`}
                        className="group/link inline-flex w-full items-center justify-center gap-2 rounded-xl bg-blue-700 px-4 py-3 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-blue-800 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                      >
                        Recruiter Intelligence
                        <ArrowIcon />
                      </Link>

                      {job.url ? (
                        <a
                          href={job.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex w-full items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-700 transition-colors hover:border-slate-300 hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-slate-400 focus:ring-offset-2"
                        >
                          View original job
                          <svg
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="1.8"
                            className="h-4 w-4"
                            aria-hidden="true"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              d="M14 4h6v6m-11 5L20 4M18 13v6a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V7a1 1 0 0 1 1-1h6"
                            />
                          </svg>
                        </a>
                      ) : null}
                    </div>
                  </div>
                </article>
              ))}
            </div>
          )}
        </section>

        <footer className="flex flex-col gap-2 border-t border-slate-200 py-5 text-xs text-slate-500 sm:flex-row sm:items-center sm:justify-between">
          <p>Global Career AI · Enterprise Recruiting Intelligence</p>
          <p>
            {enterpriseJobs.length} loaded records · Hirebase source
          </p>
        </footer>
      </div>
    </main>
  );
}
