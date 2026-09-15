import Link from "next/link";

export default async function PremiumDemoPage({
  searchParams,
}: {
  searchParams: Promise<{ jobId?: string }>;
}) {
  const { jobId } = await searchParams;

  const premiumUrl = jobId
    ? `/dashboard/premium?jobId=${encodeURIComponent(jobId)}`
    : "/dashboard/premium";

  return (
    <main className="min-h-screen bg-slate-950 px-6 py-10 text-slate-100">
      <div className="mx-auto max-w-5xl">
        <header className="mx-auto max-w-3xl text-center">
          <p className="text-sm font-medium uppercase tracking-[0.18em] text-slate-500">
            Global Career AI
          </p>

          <h1 className="mt-3 text-4xl font-bold tracking-tight">
            Premium Career Intelligence
          </h1>

          <p className="mt-4 text-base leading-7 text-slate-400">
            Lleva el análisis de tu perfil profesional y de tus oportunidades
            reales a un nivel avanzado.
          </p>
        </header>

        <section className="mt-10">
          <div className="mb-6 text-center">
            <h2 className="text-2xl font-semibold">
              Elige tu plan Premium
            </h2>

            <p className="mt-2 text-sm text-slate-500">
              Esta es una demostración del flujo Premium.
            </p>
          </div>

          <div className="grid gap-5 md:grid-cols-3">
            <PlanCard
              name="Monthly"
              price="$29"
              period="/ mes"
              description="Flexibilidad para tu búsqueda profesional."
              premiumUrl={premiumUrl}
            />

            <PlanCard
              name="6 Months"
              price="$159"
              period="/ 6 meses"
              description="La opción recomendada para una búsqueda activa."
              recommended
              premiumUrl={premiumUrl}
            />

            <PlanCard
              name="Annual"
              price="$249"
              period="/ año"
              description="La mejor opción para desarrollo profesional continuo."
              premiumUrl={premiumUrl}
            />
          </div>
        </section>

        <section className="mt-10 rounded-2xl border border-slate-800 bg-slate-900 p-6">
          <h2 className="text-lg font-semibold">
            ¿Qué incluye Premium?
          </h2>

          <div className="mt-5 grid gap-3 sm:grid-cols-2">
            <Feature text="ATS Advanced" />
            <Feature text="Opportunity ATS" />
            <Feature text="Career Health" />
            <Feature text="Advanced opportunity intelligence" />
            <Feature text="Competency intelligence" />
            <Feature text="Knowledge intelligence" />
          </div>
        </section>

        <p className="mt-8 text-center text-xs text-slate-600">
          Modo demostración — no se realizará ningún cargo.
        </p>
      </div>
    </main>
  );
}

function PlanCard({
  name,
  price,
  period,
  description,
  recommended = false,
  premiumUrl,
}: {
  name: string;
  price: string;
  period: string;
  description: string;
  recommended?: boolean;
  premiumUrl: string;
}) {
  return (
    <div
      className={`relative rounded-2xl border p-6 shadow-sm ${
        recommended
          ? "border-white bg-slate-900"
          : "border-slate-800 bg-slate-900/70"
      }`}
    >
      {recommended && (
        <div className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-white px-3 py-1 text-xs font-bold text-slate-950">
          RECOMENDADO
        </div>
      )}

      <p className="text-sm font-medium uppercase tracking-wide text-slate-500">
        {name}
      </p>

      <div className="mt-5 flex items-baseline gap-1">
        <span className="text-4xl font-bold">{price}</span>
        <span className="text-sm text-slate-500">{period}</span>
      </div>

      <p className="mt-4 min-h-12 text-sm leading-6 text-slate-400">
        {description}
      </p>

      <Link
        href={premiumUrl}
        className="mt-6 block w-full rounded-xl bg-white px-5 py-3 text-center text-sm font-semibold text-slate-950 transition hover:bg-slate-200"
      >
        ACTIVAR PREMIUM DEMO
      </Link>
    </div>
  );
}

function Feature({ text }: { text: string }) {
  return (
    <div className="rounded-xl border border-slate-800 bg-slate-950 px-4 py-3 text-sm text-slate-300">
      ✓ {text}
    </div>
  );
}