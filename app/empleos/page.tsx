"use client";

import { useEffect, useState } from "react";

type Job = {
  id: string;
  title?: string;
  company?: string | null;
  location?: string | null;
  country?: string | null;
  description?: string | null;
  url?: string | null;
  source?: string | null;
  category?: string | null;
  tags?: string | null;
};

function stripHtml(html: string): string {
  return html
    .replace(/<[^>]*>/g, " ")
    .replace(/&nbsp;/gi, " ")
    .replace(/&amp;/gi, "&")
    .replace(/&lt;/gi, "<")
    .replace(/&gt;/gi, ">")
    .replace(/&quot;/gi, '"')
    .replace(/&#39;/gi, "'")
    .replace(/\s+/g, " ")
    .trim();
}

export default function EmpleosPage() {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadJobs() {
      try {
        setLoading(true);
        setError(null);

        const response = await fetch("/api/jobs", {
          cache: "no-store",
        });

        const data = await response.json();

        if (!response.ok || !data.success) {
          throw new Error(
            data.error || "No se pudieron cargar los empleos."
          );
        }

        const realJobs = (data.jobs ?? []).filter(
          (job: Job) => Boolean(job.url)
        );

        setJobs(realJobs);
      } catch (err) {
        console.error("Error cargando empleos:", err);

        setError(
          err instanceof Error
            ? err.message
            : "No se pudieron cargar los empleos."
        );
      } finally {
        setLoading(false);
      }
    }

    void loadJobs();
  }, []);

  if (loading) {
    return (
      <main className="min-h-screen bg-slate-50 px-6 py-10">
        <div className="mx-auto max-w-6xl">
          <h1 className="text-3xl font-bold text-slate-900">
            Oportunidades reales
          </h1>

          <p className="mt-4 text-slate-600">
            Cargando oportunidades de trabajo internacional...
          </p>
        </div>
      </main>
    );
  }

  if (error) {
    return (
      <main className="min-h-screen bg-slate-50 px-6 py-10">
        <div className="mx-auto max-w-6xl">
          <h1 className="text-3xl font-bold text-slate-900">
            Oportunidades reales
          </h1>

          <div className="mt-6 rounded-xl border border-red-200 bg-red-50 p-6 text-red-700">
            {error}
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-slate-50 px-6 py-10">
      <div className="mx-auto max-w-6xl">
        <header className="mb-8">
          <h1 className="text-3xl font-bold text-slate-900">
            Oportunidades reales
          </h1>

          <p className="mt-2 text-slate-600">
            Explora oportunidades reales de trabajo internacional.
          </p>
        </header>

        {jobs.length === 0 ? (
          <section className="rounded-2xl border border-slate-200 bg-white p-10 text-center">
            <h2 className="text-xl font-semibold text-slate-900">
              No hay oportunidades disponibles
            </h2>

            <p className="mt-3 text-slate-600">
              No encontramos ofertas reales disponibles para
              mostrar en este momento.
            </p>
          </section>
        ) : (
          <section className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {jobs.map((job) => (
              <article
                key={job.id}
                className="flex flex-col rounded-2xl border border-slate-200 bg-white p-6 shadow-sm"
              >
                <div className="flex-1">
                  <div className="mb-4">
                    <h2 className="text-xl font-bold text-slate-900">
                      {job.title ?? "Puesto sin título"}
                    </h2>

                    <p className="mt-1 font-medium text-slate-700">
                      {job.company ?? "Empresa no especificada"}
                    </p>
                  </div>

                  <div className="mb-4 space-y-1 text-sm text-slate-600">
                    {job.location && (
                      <p>📍 {job.location}</p>
                    )}

                    {job.country && (
                      <p>🌎 {job.country}</p>
                    )}

                    {job.category && (
                      <p>🏷️ {job.category}</p>
                    )}
                  </div>

                  <p className="mb-5 line-clamp-5 text-sm leading-6 text-slate-600">
                    {job.description
                      ? stripHtml(job.description)
                      : "Descripción no disponible."}
                  </p>
                </div>

                <div className="mt-6">
                  <a
                    href={`/empleos/${job.id}`}
                    className="block w-full rounded-xl bg-blue-600 py-3 text-center font-semibold text-white hover:bg-blue-700"
                  >
                    VER OPORTUNIDAD →
                  </a>
                </div>
              </article>
            ))}
          </section>
        )}
      </div>
    </main>
  );
}