import Link from "next/link";

type SearchParams = Promise<{
  jobId?: string;
  demo?: string;
}>;

export default async function PremiumDemoPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const { jobId } = await searchParams;

  const premiumDemoUrl = jobId
    ? `/dashboard/premium?jobId=${encodeURIComponent(jobId)}&demo=true`
    : "/dashboard/premium?demo=true";

  return (
    <main className="min-h-screen bg-slate-950 px-6 py-12 text-white">
      <div className="mx-auto max-w-5xl">
        <div className="mb-10 text-center">
          <p className="mb-3 text-sm font-semibold uppercase tracking-[0.25em] text-emerald-400">
            Global Career AI
          </p>

          <h1 className="text-4xl font-bold tracking-tight md:text-5xl">
            Premium
          </h1>

          <p className="mx-auto mt-4 max-w-2xl text-lg text-slate-300">
            Inteligencia profesional avanzada para analizar tu perfil,
            identificar brechas y evaluar oportunidades internacionales.
          </p>
        </div>

        <section className="mx-auto max-w-3xl rounded-2xl border border-emerald-500/30 bg-slate-900 p-8 shadow-2xl">
          <div className="mb-8 rounded-xl border border-amber-400/30 bg-amber-400/10 p-4">
            <p className="text-sm font-semibold uppercase tracking-wide text-amber-300">
              Entorno de demostración
            </p>

            <p className="mt-2 text-sm leading-6 text-slate-300">
              Este acceso Demo existe temporalmente para continuar la
              construcción y validación funcional de Global Career AI.
              No representa una suscripción Premium activa ni genera un
              cobro.
            </p>
          </div>

          <div className="grid gap-6 md:grid-cols-3">
            <div className="rounded-xl border border-slate-700 bg-slate-950 p-5">
              <p className="text-sm text-slate-400">Mensual</p>
              <p className="mt-2 text-3xl font-bold">$29</p>
              <p className="mt-2 text-sm text-slate-400">por mes</p>
            </div>

            <div className="rounded-xl border border-emerald-400 bg-slate-950 p-5">
              <p className="text-sm font-semibold text-emerald-400">
                RECOMENDADO
              </p>
              <p className="mt-2 text-sm text-slate-400">6 meses</p>
              <p className="mt-2 text-3xl font-bold">$159</p>
              <p className="mt-2 text-sm text-slate-400">
                búsqueda activa
              </p>
            </div>

            <div className="rounded-xl border border-slate-700 bg-slate-950 p-5">
              <p className="text-sm text-slate-400">Anual</p>
              <p className="mt-2 text-3xl font-bold">$249</p>
              <p className="mt-2 text-sm text-slate-400">por año</p>
            </div>
          </div>

          <div className="mt-8">
            <h2 className="text-xl font-semibold">
              Capacidades Premium
            </h2>

            <ul className="mt-4 grid gap-3 text-sm text-slate-300 md:grid-cols-2">
              <li>✓ ATS avanzado</li>
              <li>✓ Opportunity Matching</li>
              <li>✓ Competency Intelligence</li>
              <li>✓ Knowledge Intelligence</li>
              <li>✓ Career Health</li>
              <li>✓ Market Readiness</li>
              <li>✓ Learning Intelligence</li>
              <li>✓ Career Evolution</li>
              <li>✓ Recommendations</li>
              <li>✓ Premium Analytics</li>
            </ul>
          </div>

          <div className="mt-10 flex flex-col gap-3 sm:flex-row">
            <Link
              href={premiumDemoUrl}
              className="flex-1 rounded-xl bg-emerald-500 px-6 py-4 text-center font-bold text-slate-950 transition hover:bg-emerald-400"
            >
              CONTINUAR EN DEMO
            </Link>

            <Link
              href="/empleos"
              className="flex-1 rounded-xl border border-slate-600 px-6 py-4 text-center font-semibold text-slate-200 transition hover:bg-slate-800"
            >
              VOLVER A EMPLEOS
            </Link>
          </div>

          <p className="mt-6 text-center text-xs leading-5 text-slate-500">
            La activación y facturación Premium reales se conectarán
            posteriormente mediante el sistema de pagos de RESOLVIA.
          </p>
        </section>
      </div>
    </main>
  );
}