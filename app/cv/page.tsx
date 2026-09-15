import Link from "next/link";

import { createSupabaseServerAuth } from "@/lib/supabase/server";

type CvAnalysis = {
  id: string;
  user_id: string;
  ats_score?: number | null;
  skills?: string[] | null;
  industries?: string[] | null;
  recommendations?: string[] | null;
  cv_preview?: string | null;
  created_at?: string | null;
};

export default async function CvPage() {
  const supabase = await createSupabaseServerAuth();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return (
      <main className="min-h-screen bg-slate-950 px-6 py-12 text-white">
        <div className="mx-auto max-w-5xl">
          <h1 className="text-3xl font-bold">Mi CV</h1>

          <p className="mt-4 text-slate-400">
            User session required. Please login to access your CV.
          </p>
        </div>
      </main>
    );
  }

  const { data: cvAnalysis, error } = await supabase
    .from("cv_analyses")
    .select(
      "id, user_id, ats_score, skills, industries, recommendations, cv_preview, created_at"
    )
    .eq("user_id", user.id)
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle<CvAnalysis>();

  if (error) {
    return (
      <main className="min-h-screen bg-slate-950 px-6 py-12 text-white">
        <div className="mx-auto max-w-5xl">
          <h1 className="text-3xl font-bold">Mi CV</h1>

          <p className="mt-4 text-slate-400">
            No fue posible cargar el análisis actual de tu CV.
          </p>

          <div className="mt-6 flex gap-3">
            <Link
              href="/subir-cv"
              className="inline-flex rounded-xl bg-white px-5 py-3 text-sm font-semibold text-slate-950 transition hover:bg-slate-200"
            >
              SUBIR CV
            </Link>

            <Link
              href="/dashboard"
              className="inline-flex rounded-xl border border-slate-700 px-5 py-3 text-sm font-semibold text-white transition hover:bg-slate-900"
            >
              VOLVER AL DASHBOARD
            </Link>
          </div>
        </div>
      </main>
    );
  }

  if (!cvAnalysis) {
    return (
      <main className="min-h-screen bg-slate-950 px-6 py-12 text-white">
        <div className="mx-auto max-w-5xl">
          <h1 className="text-3xl font-bold">Mi CV</h1>

          <p className="mt-4 text-slate-400">
            Todavía no tienes un análisis de CV disponible.
          </p>

          <p className="mt-2 text-slate-500">
            Sube tu CV para comenzar tu análisis profesional.
          </p>

          <div className="mt-6">
            <Link
              href="/subir-cv"
              className="inline-flex rounded-xl bg-white px-5 py-3 text-sm font-semibold text-slate-950 transition hover:bg-slate-200"
            >
              SUBIR Y ANALIZAR CV
            </Link>
          </div>
        </div>
      </main>
    );
  }

  const skills = cvAnalysis.skills ?? [];
  const industries = cvAnalysis.industries ?? [];
  const recommendations = cvAnalysis.recommendations ?? [];

  const analyzedAt = cvAnalysis.created_at
    ? new Date(cvAnalysis.created_at).toLocaleDateString()
    : "Fecha no disponible";

  return (
    <main className="min-h-screen bg-slate-950 px-6 py-12 text-white">
      <div className="mx-auto max-w-5xl">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-sm font-semibold uppercase tracking-wider text-slate-500">
              Global Career AI
            </p>

            <h1 className="mt-2 text-3xl font-bold">
              Mi CV
            </h1>

            <p className="mt-3 text-slate-400">
              Tu CV analizado con información real de tu perfil profesional.
            </p>
          </div>

          <Link
            href="/subir-cv"
            className="inline-flex w-fit rounded-xl bg-white px-5 py-3 text-sm font-semibold text-slate-950 transition hover:bg-slate-200"
          >
            ACTUALIZAR CV
          </Link>
        </div>

        <section className="mt-8 rounded-2xl border border-slate-800 bg-slate-900/60 p-6">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="text-xl font-semibold">
                CV analizado
              </h2>

              <p className="mt-1 text-sm text-slate-400">
                Último análisis: {analyzedAt}
              </p>
            </div>

            <span className="w-fit rounded-full border border-emerald-700 px-3 py-1 text-xs font-semibold text-emerald-400">
              READY
            </span>
          </div>
        </section>

        <section className="mt-6 grid gap-6 md:grid-cols-2">
          <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-6">
            <h2 className="text-lg font-semibold">
              Professional Skills
            </h2>

            <p className="mt-2 text-sm text-slate-400">
              Skills identificadas en tu CV.
            </p>

            {skills.length > 0 ? (
              <div className="mt-5 flex flex-wrap gap-2">
                {skills.map((skill) => (
                  <span
                    key={skill}
                    className="rounded-full border border-slate-700 px-3 py-2 text-sm text-slate-200"
                  >
                    {skill}
                  </span>
                ))}
              </div>
            ) : (
              <p className="mt-5 text-sm text-slate-500">
                No se detectaron skills en este análisis.
              </p>
            )}
          </div>

          <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-6">
            <h2 className="text-lg font-semibold">
              Industries
            </h2>

            <p className="mt-2 text-sm text-slate-400">
              Industrias identificadas en tu CV.
            </p>

            {industries.length > 0 ? (
              <div className="mt-5 flex flex-wrap gap-2">
                {industries.map((industry) => (
                  <span
                    key={industry}
                    className="rounded-full border border-slate-700 px-3 py-2 text-sm text-slate-200"
                  >
                    {industry}
                  </span>
                ))}
              </div>
            ) : (
              <p className="mt-5 text-sm text-slate-500">
                No se identificaron industrias en este análisis.
              </p>
            )}
          </div>
        </section>

        <section className="mt-6 rounded-2xl border border-slate-800 bg-slate-900/60 p-6">
          <h2 className="text-lg font-semibold">
            CV Preview
          </h2>

          <p className="mt-2 text-sm text-slate-400">
            Extracto del contenido utilizado para el análisis.
          </p>

          <div className="mt-5 rounded-xl bg-slate-950 p-4">
            <p className="whitespace-pre-wrap text-sm leading-6 text-slate-300">
              {cvAnalysis.cv_preview || "No hay preview disponible."}
            </p>
          </div>
        </section>

        {recommendations.length > 0 && (
          <section className="mt-6 rounded-2xl border border-slate-800 bg-slate-900/60 p-6">
            <h2 className="text-lg font-semibold">
              Recommendations
            </h2>

            <div className="mt-4 space-y-3">
              {recommendations.map((recommendation) => (
                <p
                  key={recommendation}
                  className="rounded-xl border border-slate-800 bg-slate-950 p-4 text-sm text-slate-300"
                >
                  {recommendation}
                </p>
              ))}
            </div>
          </section>
        )}

        <div className="mt-8 flex flex-wrap gap-3">
          <Link
            href="/dashboard"
            className="inline-flex rounded-xl bg-white px-5 py-3 text-sm font-semibold text-slate-950 transition hover:bg-slate-200"
          >
            VOLVER AL DASHBOARD
          </Link>

          <Link
            href="/empleos"
            className="inline-flex rounded-xl border border-slate-700 px-5 py-3 text-sm font-semibold text-white transition hover:bg-slate-900"
          >
            EXPLORAR EMPLEOS
          </Link>
        </div>

        <footer className="mt-12 border-t border-slate-800 pt-6 text-sm text-slate-500">
          Global Career AI · CV Profile V1.0
        </footer>
      </div>
    </main>
  );
}
