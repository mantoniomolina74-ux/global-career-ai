"use client";

import Link from "next/link";

export default function Home() {
  return (
    <main className="min-h-screen bg-slate-50 text-slate-900">
      {/* HEADER */}
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto max-w-6xl px-6 py-5">
          <h1 className="text-2xl font-extrabold tracking-tight text-slate-900">
            GLOBAL CAREER AI
          </h1>
        </div>
      </header>

      {/* DISCOVERY HERO */}
      <section className="bg-[#EFF6FF] px-6 py-20 text-center md:py-28">
        <div className="mx-auto max-w-4xl">
          <p className="mb-5 text-sm font-semibold uppercase tracking-[0.2em] text-blue-600">
            Descubre tu próxima oportunidad
          </p>

          <h2 className="text-4xl font-extrabold tracking-tight text-slate-900 md:text-6xl">
            Oportunidades reales de trabajo internacional.
          </h2>
        </div>
      </section>

      {/* WHAT IS GLOBAL CAREER AI */}
      <section className="border-y border-slate-200 bg-white px-6 py-16">
        <div className="mx-auto max-w-4xl text-center">
          <h2 className="text-3xl font-bold text-slate-900">
            ¿Qué es Global Career AI?
          </h2>

          <p className="mx-auto mt-6 max-w-3xl text-lg leading-8 text-slate-600">
            Una plataforma que te ayuda a explorar oportunidades reales de
            trabajo internacional y entender qué necesitas para acercarte a
            ellas.
          </p>
        </div>
      </section>

      {/* HOW WE HELP */}
      <section className="bg-[#F1F5F9] px-6 py-16 md:py-20">
        <div className="mx-auto max-w-6xl">
          <div className="text-center">
            <h2 className="text-3xl font-bold text-slate-900">
              ¿Cómo te ayudamos?
            </h2>
          </div>

          <div className="mt-10 grid gap-6 md:grid-cols-3">
            <article className="rounded-2xl border border-slate-200 bg-white p-7 shadow-sm">
              <div className="text-3xl text-blue-600">🌎</div>

              <h3 className="mt-5 text-xl font-bold text-slate-900">
                Encuentra
              </h3>

              <p className="mt-3 leading-7 text-slate-600">
                Explora oportunidades reales de trabajo internacional.
              </p>
            </article>

            <article className="rounded-2xl border border-slate-200 bg-white p-7 shadow-sm">
              <div className="text-3xl">📋</div>

              <h3 className="mt-5 text-xl font-bold text-slate-900">
                Comprende
              </h3>

              <p className="mt-3 leading-7 text-slate-600">
                Conoce el puesto, la empresa, la ubicación y las condiciones
                disponibles.
              </p>
            </article>

            <article className="rounded-2xl border border-slate-200 bg-white p-7 shadow-sm">
              <div className="text-3xl text-teal-700">🧠</div>

              <h3 className="mt-5 text-xl font-bold text-slate-900">
                Prepárate
              </h3>

              <p className="mt-3 leading-7 text-slate-600">
                Analiza tu perfil frente a una oportunidad y descubre
                fortalezas, brechas y próximos pasos.
              </p>
            </article>
          </div>
        </div>
      </section>

      {/* ROLE OF AI */}
      <section className="border-y border-slate-200 bg-[#E0F2FE] px-6 py-16 md:py-20">
        <div className="mx-auto max-w-4xl text-center">
          <h2 className="text-3xl font-bold text-slate-900">
            ¿Qué papel tiene la IA?
          </h2>

          <p className="mx-auto mt-6 max-w-3xl text-lg leading-8 text-slate-600">
            La IA convierte la información del empleo y de tu perfil en
            inteligencia para ayudarte a tomar mejores decisiones.
          </p>

          <div className="mt-8 flex flex-wrap justify-center gap-3">
            <span className="rounded-full bg-white px-4 py-2 text-sm font-semibold text-slate-700 shadow-sm">
              Fortalezas
            </span>

            <span className="rounded-full bg-white px-4 py-2 text-sm font-semibold text-slate-700 shadow-sm">
              Brechas
            </span>

            <span className="rounded-full bg-white px-4 py-2 text-sm font-semibold text-slate-700 shadow-sm">
              Preparación
            </span>

            <span className="rounded-full bg-white px-4 py-2 text-sm font-semibold text-slate-700 shadow-sm">
              Próximos pasos
            </span>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="px-6 py-20 text-center md:py-24">
        <div className="mx-auto max-w-3xl">
          <h2 className="text-3xl font-bold text-slate-900">
            Empieza explorando oportunidades reales.
          </h2>

          <p className="mt-4 text-lg text-slate-600">
            Descubre empleos internacionales y decide cuál puede ser tu
            próximo paso.
          </p>

          <Link
            href="/empleos"
            className="mt-8 inline-flex rounded-xl bg-blue-600 px-8 py-4 text-base font-bold text-white shadow-lg transition hover:bg-blue-700"
          >
            EXPLORAR OPORTUNIDADES →
          </Link>
        </div>
      </section>
    </main>
  );
}

