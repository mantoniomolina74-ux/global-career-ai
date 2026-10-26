
import Link from "next/link";
import { notFound } from "next/navigation";

import ContinueApplicationButton from "@/components/jobs/ContinueApplicationButton";
import { analyzeJobOpportunity } from "@/lib/jobs/analyzeJobOpportunity";
import { getJobById } from "@/lib/jobs/getJobById";

type JobDetailPageProps = {
  params: Promise<{
    id: string;
  }>;
};

function sanitizeHtml(html: string) {
  return html
    .replace(/<script[\s\S]*?>[\s\S]*?<\/script>/gi, "")
    .replace(/<iframe[\s\S]*?>[\s\S]*?<\/iframe>/gi, "")
    .replace(/\son\w+="[^"]*"/gi, "")
    .replace(/\son\w+='[^']*'/gi, "")
    .replace(/javascript:/gi, "");
}

function getRequirementLabel(
  category:
    | "SKILL"
    | "EXPERIENCE"
    | "EDUCATION"
    | "CERTIFICATION"
    | "LANGUAGE"
    | "INDUSTRY"
    | "RESPONSIBILITY"
    | "OTHER"
) {
  switch (category) {
    case "SKILL":
      return "Habilidades";
    case "EXPERIENCE":
      return "Experiencia";
    case "EDUCATION":
      return "Educación";
    case "CERTIFICATION":
      return "Certificaciones";
    case "LANGUAGE":
      return "Idiomas";
    case "INDUSTRY":
      return "Industria";
    case "RESPONSIBILITY":
      return "Responsabilidades";
    default:
      return "Otros requisitos";
  }
}

function getWorkModeLabel(
  workMode: "REMOTE" | "HYBRID" | "IN_PERSON" | "UNKNOWN"
) {
  switch (workMode) {
    case "REMOTE":
      return "Remoto";
    case "HYBRID":
      return "Híbrido";
    case "IN_PERSON":
      return "Presencial";
    default:
      return "No especificado";
  }
}

export default async function JobDetailPage({
  params,
}: JobDetailPageProps) {
  const { id } = await params;

  const job = await getJobById(id);

  if (!job) {
    notFound();
  }

  const opportunity = analyzeJobOpportunity(job);
  const intelligence = opportunity.intelligence;
  const safeDescription = sanitizeHtml(job.description ?? "");

  const groupedRequirements = intelligence.requirements.reduce(
    (groups, requirement) => {
      const label = getRequirementLabel(requirement.category);

      if (!groups[label]) {
        groups[label] = [];
      }

      groups[label].push(requirement);

      return groups;
    },
    {} as Record<
      string,
      typeof intelligence.requirements
    >
  );

  return (
    <main className="min-h-screen bg-slate-50">
      <div className="mx-auto max-w-6xl px-6 py-10">
        <Link
          href="/empleos"
          className="mb-8 inline-flex items-center text-sm font-semibold text-slate-600 transition hover:text-slate-900"
        >
          ← Volver a oportunidades
        </Link>

        <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
          <div className="border-b border-slate-200 p-8">
            <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
              <div className="max-w-4xl">
                <div className="mb-4 flex flex-wrap gap-2">
                  {job.category && (
                    <span className="rounded-full bg-blue-50 px-3 py-1 text-xs font-semibold text-blue-700">
                      {job.category}
                    </span>
                  )}

                  {job.source && (
                    <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-600">
                      {job.source}
                    </span>
                  )}
                </div>

                <h1 className="text-3xl font-bold tracking-tight text-slate-900 md:text-4xl">
                  {job.title}
                </h1>

                <p className="mt-3 text-lg font-semibold text-slate-700">
                  {job.company}
                </p>

                <div className="mt-5 flex flex-wrap gap-4 text-sm text-slate-600">
                  {job.location && (
                    <span className="inline-flex items-center gap-2">
                      <span aria-hidden="true">📍</span>
                      {job.location}
                    </span>
                  )}

                  {job.country && (
                    <span className="inline-flex items-center gap-2">
                      <span aria-hidden="true">🌎</span>
                      {job.country}
                    </span>
                  )}
                </div>
              </div>
            </div>
          </div>

          <div className="grid gap-8 p-8 lg:grid-cols-[minmax(0,1fr)_320px]">
            <article>
              <h2 className="text-xl font-bold text-slate-900">
                Descripción
              </h2>

              <div
                className="prose prose-slate mt-5 max-w-none"
                dangerouslySetInnerHTML={{
                  __html: safeDescription,
                }}
              />

              {job.tags && job.tags.trim().length > 0 && (
                <section className="mt-8">
                  <h2 className="text-xl font-bold text-slate-900">
                    Categorías y habilidades
                  </h2>

                  <div className="mt-4 rounded-xl bg-slate-50 p-4 text-sm text-slate-700">
                    {job.tags}
                  </div>
                </section>
              )}

              {opportunity.requirements.length > 0 && (
                <section className="mt-8">
                  <h2 className="text-xl font-bold text-slate-900">
                    Requisitos identificados
                  </h2>

                  <ul className="mt-4 space-y-2">
                    {opportunity.requirements.map((requirement) => (
                      <li
                        key={requirement}
                        className="flex gap-3 text-sm text-slate-700"
                      >
                        <span
                          className="mt-1 text-emerald-600"
                          aria-hidden="true"
                        >
                          ✓
                        </span>
                        <span>{requirement}</span>
                      </li>
                    ))}
                  </ul>
                </section>
              )}

              {Object.keys(groupedRequirements).length > 0 && (
                <section className="mt-10">
                  <h2 className="text-xl font-bold text-slate-900">
                    Inteligencia de la oportunidad
                  </h2>

                  <p className="mt-2 text-sm leading-6 text-slate-600">
                    Requisitos estructurados a partir de la información
                    publicada por esta oportunidad.
                  </p>

                  <div className="mt-5 space-y-5">
                    {Object.entries(groupedRequirements).map(
                      ([label, requirements]) => (
                        <div
                          key={label}
                          className="rounded-xl border border-slate-200 bg-white p-5"
                        >
                          <h3 className="text-sm font-bold uppercase tracking-wide text-slate-700">
                            {label}
                          </h3>

                          <div className="mt-4 space-y-4">
                            {requirements.map((requirement) => (
                              <div key={`${requirement.category}-${requirement.name}`}>
                                <p className="text-sm font-semibold text-slate-900">
                                  {requirement.name}
                                </p>

                                {requirement.evidence && (
                                  <p className="mt-1 text-sm leading-6 text-slate-600">
                                    {requirement.evidence}
                                  </p>
                                )}
                              </div>
                            ))}
                          </div>
                        </div>
                      )
                    )}
                  </div>
                </section>
              )}
            </article>

            <aside className="h-fit rounded-2xl border border-slate-200 bg-slate-50 p-6">
              <h2 className="text-lg font-bold text-slate-900">
                Análisis de oportunidad
              </h2>

              <p className="mt-3 text-sm leading-6 text-slate-600">
                Información estructurada a partir de los datos reales de la
                oportunidad.
              </p>

              <div className="mt-6 space-y-4">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                    Industria
                  </p>
                  <p className="mt-1 text-sm font-medium text-slate-900">
                    {intelligence.industry || "No especificada"}
                  </p>
                </div>

                <div>
                  <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                    Modalidad
                  </p>
                  <p className="mt-1 text-sm font-medium text-slate-900">
                    {getWorkModeLabel(intelligence.workMode)}
                  </p>
                </div>

                <div>
                  <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                    Ubicación
                  </p>
                  <p className="mt-1 text-sm font-medium text-slate-900">
                    {intelligence.location || "No especificada"}
                  </p>
                </div>

                <div>
                  <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                    País
                  </p>
                  <p className="mt-1 text-sm font-medium text-slate-900">
                    {intelligence.country || "No especificado"}
                  </p>
                </div>

                <div>
                  <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                    Categoría
                  </p>
                  <p className="mt-1 text-sm font-medium text-slate-900">
                    {intelligence.category || "No especificada"}
                  </p>
                </div>
              </div>
            </aside>
          </div>

          <div className="border-t border-slate-200 bg-slate-50 p-8">
            <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h2 className="text-lg font-bold text-slate-900">
                  ¿Qué quieres hacer con esta oportunidad?
                </h2>
                <p className="mt-1 text-sm text-slate-600">
                  Puedes guardar la oportunidad en tu flujo de aplicaciones o
                  analizar tu perfil con Premium.
                </p>
              </div>

              <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
                <ContinueApplicationButton jobId={job.id} />

                <Link
                  href={`/registro?jobId=${encodeURIComponent(job.id)}`}
                  className="inline-flex items-center justify-center rounded-xl border border-slate-300 bg-white px-6 py-3 font-semibold text-slate-800 transition hover:bg-slate-100"
                >
                  ANALIZAR MI PERFIL
                </Link>
              </div>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
