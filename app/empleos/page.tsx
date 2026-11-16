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

type JobsMeta = {
  matching: boolean;
  source: string;
  page: number;
  pageSize: number;
  total: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
  search: string;
  country: string;
  category: string;
  countries: string[];
  categories: string[];
};

type JobsResponse = {
  success: boolean;
  jobs?: Job[];
  meta?: JobsMeta;
  error?: string;
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
  const [meta, setMeta] = useState<JobsMeta | null>(null);

  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [country, setCountry] = useState("");
  const [category, setCategory] = useState("");

  const [searchInput, setSearchInput] = useState("");

  const [countries, setCountries] = useState<string[]>([]);
  const [categories, setCategories] = useState<string[]>([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadJobs() {
      try {
        setLoading(true);
        setError(null);

        const params = new URLSearchParams();

        params.set("page", String(page));

        if (search) {
          params.set("search", search);
        }

        if (country) {
          params.set("country", country);
        }

        if (category) {
          params.set("category", category);
        }

        const response = await fetch(`/api/jobs?${params.toString()}`, {
          cache: "no-store",
        });

        const data: JobsResponse = await response.json();

        if (!response.ok || !data.success) {
          throw new Error(
            data.error || "No se pudieron cargar los empleos."
          );
        }

        const realJobs = (data.jobs ?? []).filter(
          (job) => Boolean(job.url)
        );

        setJobs(realJobs);

        if (data.meta) {
          setMeta(data.meta);
          setCountries(data.meta.countries ?? []);
          setCategories(data.meta.categories ?? []);
        } else {
          setMeta(null);
          setCountries([]);
          setCategories([]);
        }
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
  }, [page, search, country, category]);

  function handleSearch(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    setPage(1);
    setSearch(searchInput.trim());
  }

  function handleCountryChange(value: string) {
    setPage(1);
    setCountry(value);
  }

  function handleCategoryChange(value: string) {
    setPage(1);
    setCategory(value);
  }

  function clearFilters() {
    setSearchInput("");
    setSearch("");
    setCountry("");
    setCategory("");
    setPage(1);
  }

  if (loading) {
    return (
      <main className="min-h-screen bg-slate-50 px-6 py-10">
        <div className="mx-auto max-w-7xl">
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
        <div className="mx-auto max-w-7xl">
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
      <div className="mx-auto max-w-7xl">
        <header className="mb-8">
          <h1 className="text-3xl font-bold text-slate-900">
            Oportunidades reales
          </h1>

          <p className="mt-2 text-slate-600">
            Explora oportunidades reales de trabajo internacional.
          </p>
        </header>

        <section className="mb-8 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <form
            onSubmit={handleSearch}
            className="grid gap-4 lg:grid-cols-[1fr_auto_auto_auto]"
          >
            <div>
              <label
                htmlFor="job-search"
                className="mb-2 block text-sm font-semibold text-slate-700"
              >
                Buscar empleo
              </label>

              <input
                id="job-search"
                type="text"
                value={searchInput}
                onChange={(event) =>
                  setSearchInput(event.target.value)
                }
                placeholder="Título o empresa"
                className="w-full rounded-xl border border-slate-300 px-4 py-3 text-slate-900 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
              />
            </div>

            <div>
              <label
                htmlFor="country-filter"
                className="mb-2 block text-sm font-semibold text-slate-700"
              >
                País
              </label>

              <select
                id="country-filter"
                value={country}
                onChange={(event) =>
                  handleCountryChange(event.target.value)
                }
                className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-slate-900 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
              >
                <option value="">Todos los países</option>

                {countries.map((value) => (
                  <option key={value} value={value}>
                    {value}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label
                htmlFor="category-filter"
                className="mb-2 block text-sm font-semibold text-slate-700"
              >
                Categoría
              </label>

              <select
                id="category-filter"
                value={category}
                onChange={(event) =>
                  handleCategoryChange(event.target.value)
                }
                className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-slate-900 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
              >
                <option value="">Todas las categorías</option>

                {categories.map((value) => (
                  <option key={value} value={value}>
                    {value}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex items-end">
              <button
                type="submit"
                className="w-full rounded-xl bg-blue-600 px-6 py-3 font-semibold text-white hover:bg-blue-700 lg:w-auto"
              >
                BUSCAR
              </button>
            </div>
          </form>

          <div className="mt-4 flex flex-col gap-3 border-t border-slate-100 pt-4 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-sm text-slate-600">
              {meta
                ? `${meta.total.toLocaleString("es-MX")} oportunidades encontradas`
                : "Oportunidades disponibles"}
            </p>

            {(search || country || category) && (
              <button
                type="button"
                onClick={clearFilters}
                className="text-sm font-semibold text-blue-600 hover:text-blue-700"
              >
                LIMPIAR FILTROS
              </button>
            )}
          </div>
        </section>

        {jobs.length === 0 ? (
          <section className="rounded-2xl border border-slate-200 bg-white p-10 text-center">
            <h2 className="text-xl font-semibold text-slate-900">
              No hay oportunidades disponibles
            </h2>

            <p className="mt-3 text-slate-600">
              No encontramos ofertas reales que coincidan con los
              criterios seleccionados.
            </p>

            {(search || country || category) && (
              <button
                type="button"
                onClick={clearFilters}
                className="mt-5 rounded-xl bg-blue-600 px-5 py-3 font-semibold text-white hover:bg-blue-700"
              >
                VER TODAS LAS OPORTUNIDADES
              </button>
            )}
          </section>
        ) : (
          <>
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

            {meta && meta.totalPages > 1 && (
              <nav
                aria-label="Paginación de empleos"
                className="mt-10 flex flex-col items-center justify-between gap-4 rounded-2xl border border-slate-200 bg-white p-5 sm:flex-row"
              >
                <button
                  type="button"
                  disabled={!meta.hasPreviousPage}
                  onClick={() =>
                    setPage((current) => Math.max(1, current - 1))
                  }
                  className="w-full rounded-xl border border-slate-300 px-5 py-3 font-semibold text-slate-700 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40 sm:w-auto"
                >
                  ← ANTERIORES
                </button>

                <p className="text-sm font-medium text-slate-600">
                  Página {meta.page} de {meta.totalPages}
                </p>

                <button
                  type="button"
                  disabled={!meta.hasNextPage}
                  onClick={() =>
                    setPage((current) => current + 1)
                  }
                  className="w-full rounded-xl bg-blue-600 px-5 py-3 font-semibold text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-40 sm:w-auto"
                >
                  SIGUIENTES →
                </button>
              </nav>
            )}
          </>
        )}
      </div>
    </main>
  );
}