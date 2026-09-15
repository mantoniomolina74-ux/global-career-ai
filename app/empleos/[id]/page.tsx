import Link from "next/link";
import { notFound } from "next/navigation";

import { analyzeJobOpportunity } from "@/lib/jobs/analyzeJobOpportunity";
import { getJobById } from "@/lib/jobs/getJobById";

type JobDetailPageProps = {
  params: Promise<{
    id: string;
  }>;
};

function stripUnsafeHtml(html: string): string {
  return html
    .replace(/<script[\s\S]*?>[\s\S]*?<\/script>/gi, "")
    .replace(/<iframe[\s\S]*?>[\s\S]*?<\/iframe>/gi, "")
    .replace(/\son\w+="[^"]*"/gi, "")
    .replace(/\son\w+='[^']*'/gi, "")
    .replace(/javascript:/gi, "");
}

export default async function JobDetailPage({
  params,
}: JobDetailPageProps) {
  const { id } = await params;

  const job = await getJobById(id);

  if (!job) {
    notFound();
  }

  const analysis = analyzeJobOpportunity(job);

  const description = analysis.description
    ? stripUnsafeHtml(analysis.description)
    : null;

  return (
    <main className="min-h-screen bg-slate-50 px-6 py-10">
      <div className="mx-auto max-w-4xl">
        <Link
          href="/empleos"
          className="inline-flex items-center text-sm font-medium text-blue-600 hover:text-blue-700"
        >
          ? Volver a oportunidades
        </Link>

        <article className="mt-6 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
          <header className="border-b border-slate-200 p-8">
            <h1 className="text-3xl font-bold text-slate-900">
              {job.title ?? "Oportunidad de trabajo"}
            </h1>

            {job.company && (
              <p className="mt-3 text-lg font-medium text-slate-700">
                {job.company}
              </p>
            )}

            <div className="mt-6 space-y-2 text-sm text-slate-600">
              {job.location && <p>?? {job.location}</p>}
              {job.country && <p>?? {job.country}</p>}
              {job.category && <p>??? {job.category}</p>}
              {job.tags && <p>Etiquetas: {job.tags}</p>}
            </div>
          </header>

          <section className="p-8">
            <h2 className="text-2xl font-semibold text-slate-900">
              DescripciÃ³n de la oportunidad
            </h2>

            {description ? (
              <div
                className="prose prose-slate mt-6 max-w-none text-slate-700"
                dangerouslySetInnerHTML={{
                  __html: description,
                }}
              />
            ) : (
              <p className="mt-6 text-slate-600">
                La descripciÃ³n de esta oportunidad no estÃ¡ disponible.
              </p>
            )}
          </section>

          <section className="border-t border-slate-200 p-8">
            <h2 className="text-2xl font-semibold text-slate-900">
              AnÃ¡lisis gratuito de esta oportunidad
            </h2>

            <p className="mt-3 text-slate-600">
              Revisa los aspectos principales de esta oportunidad antes de
              decidir si quieres analizar tu perfil.
            </p>

            <div className="mt-6 grid gap-4 sm:grid-cols-2">
              {analysis.company && (
                <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
                  <p className="text-sm font-medium text-slate-500">
                    Empresa
                  </p>
                  <p className="mt-1 font-semibold text-slate-900">
                    {analysis.company}
                  </p>
                </div>
              )}

              {analysis.location && (
                <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
                  <p className="text-sm font-medium text-slate-500">
                    UbicaciÃ³n
                  </p>
                  <p className="mt-1 font-semibold text-slate-900">
                    {analysis.location}
                  </p>
                </div>
              )}

              {analysis.country && (
                <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
                  <p className="text-sm font-medium text-slate-500">
                    PaÃ­s
                  </p>
                  <p className="mt-1 font-semibold text-slate-900">
                    {analysis.country}
                  </p>
                </div>
              )}

              {analysis.category && (
                <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
                  <p className="text-sm font-medium text-slate-500">
                    CategorÃ­a
                  </p>
                  <p className="mt-1 font-semibold text-slate-900">
                    {analysis.category}
                  </p>
                </div>
              )}
            </div>

            {analysis.requirements.length > 0 && (
              <div className="mt-6 rounded-xl border border-slate-200 bg-white p-5">
                <h3 className="font-semibold text-slate-900">
                  Requisitos detectados
                </h3>

                <ul className="mt-4 grid gap-2 sm:grid-cols-2">
                  {analysis.requirements.map((requirement) => (
                    <li
                      key={requirement}
                      className="rounded-lg bg-slate-50 px-4 py-3 text-sm text-slate-700"
                    >
                      {requirement}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {analysis.requirements.length === 0 && (
              <div className="mt-6 rounded-xl border border-slate-200 bg-slate-50 p-5">
                <p className="text-sm text-slate-600">
                  No se detectaron requisitos tÃ©cnicos del catÃ¡logo actual en
                  la informaciÃ³n disponible de esta oportunidad.
                </p>
              </div>
            )}
          </section>

          <footer className="border-t border-slate-200 bg-slate-50 p-8">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="text-sm font-semibold text-slate-900">
                  Â¿Quieres saber quÃ© tan compatible es tu perfil?
                </p>

                <p className="mt-1 text-sm text-slate-500">
                  RegÃ­strate para continuar con el anÃ¡lisis personalizado de
                  tu perfil frente a esta oportunidad.
                </p>
              </div>

              <Link
                href={`/registro?jobId=${encodeURIComponent(job.id)}`}
                className="inline-flex items-center justify-center rounded-xl bg-blue-600 px-6 py-3 font-semibold text-white transition hover:bg-blue-700"
              >
                ANALIZAR MI PERFIL
              </Link>
            </div>
          </footer>
        </article>
      </div>
    </main>
  );
}

