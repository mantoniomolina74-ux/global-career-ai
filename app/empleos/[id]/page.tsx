import Link from "next/link";
import { notFound } from "next/navigation";

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

  const description = job.description
    ? stripUnsafeHtml(job.description)
    : null;

  return (
    <main className="min-h-screen bg-slate-50 px-6 py-10">
      <div className="mx-auto max-w-4xl">
        <Link
          href="/empleos"
          className="inline-flex items-center text-sm font-medium text-blue-600 hover:text-blue-700"
        >
          ← Volver a oportunidades
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
              {job.location && <p>📍 {job.location}</p>}

              {job.country && <p>🌎 {job.country}</p>}

              {job.category && <p>🏷️ {job.category}</p>}

              {job.tags && <p>Etiquetas: {job.tags}</p>}
            </div>
          </header>

          <section className="p-8">
            <h2 className="text-2xl font-semibold text-slate-900">
              Descripción de la oportunidad
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
                La descripción de esta oportunidad no está disponible.
              </p>
            )}
          </section>

          <footer className="border-t border-slate-200 bg-slate-50 p-8">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="text-sm font-medium text-slate-900">
                  Fuente: Hirebase
                </p>

                {job.url && (
                  <p className="mt-1 text-sm text-slate-500">
                    Esta oportunidad proviene de una fuente externa.
                  </p>
                )}
              </div>

              <Link
                href={`/registro?jobId=${encodeURIComponent(job.id)}`}
                className="inline-flex items-center justify-center rounded-xl bg-blue-600 px-6 py-3 font-semibold text-white transition hover:bg-blue-700"
              >
                CONTINUAR CON LA APLICACIÓN
              </Link>
            </div>
          </footer>
        </article>
      </div>
    </main>
  );
}