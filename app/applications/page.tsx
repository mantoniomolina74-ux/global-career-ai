import Link from "next/link";
import {
  getApplicationsPageData,
  normalizeApplicationStatus,
} from "@/lib/engine/applications/applicationInsights";
import { createSupabaseServerAuth } from "@/lib/supabase/server";

export default async function ApplicationsPage() {
  const supabase =
    await createSupabaseServerAuth();

  const {
    data: {
      user,
    },
  } =
    await supabase.auth.getUser();

  if (!user) {
    return (
      <main className="min-h-screen bg-slate-950 text-white flex items-center justify-center p-6">
        <div className="w-full max-w-xl rounded-2xl border border-slate-800 bg-slate-900 p-8 shadow-2xl">
          <div className="mb-4 text-sm font-medium text-cyan-400">
            GLOBAL CAREER AI
          </div>

          <h1 className="text-3xl font-bold">
            Postulaciones
          </h1>

          <p className="mt-3 text-slate-400">
            User session required. Please login to access
            your applications.
          </p>
        </div>
      </main>
    );
  }

  const {
    applications,
    funnel,
    performance,
  } =
    await getApplicationsPageData(
      user.id
    );

  const applicationRows =
    applications.map((application) => ({
      ...application,
      normalizedStatus:
        normalizeApplicationStatus(
          application.status
        ),
    }));

  return (
    <main className="min-h-screen bg-slate-950 text-white">

      <div className="mx-auto max-w-7xl px-6 py-8 md:px-10 md:py-10">

        {/* =====================================================
            HEADER
        ===================================================== */}

        <header className="mb-10">

          <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">

            <div>

              <p className="text-sm font-semibold uppercase tracking-[0.2em] text-cyan-400">
                Global Career AI
              </p>

              <h1 className="mt-3 text-4xl font-bold tracking-tight md:text-5xl">
                Postulaciones
              </h1>

              <p className="mt-4 max-w-2xl text-base leading-7 text-slate-400">
                Manage your real job applications and track
                their current progress.
              </p>

            </div>

            <Link
              href="/empleos"
              className="inline-flex items-center justify-center rounded-xl border border-cyan-400/30 bg-cyan-400/10 px-5 py-3 text-sm font-semibold text-cyan-300 transition hover:bg-cyan-400/20"
            >
              EXPLORAR OPORTUNIDADES
            </Link>

          </div>

        </header>


        {/* =====================================================
            PIPELINE SUMMARY
        ===================================================== */}

        <section className="mb-8">

          <div className="mb-4">

            <p className="text-sm font-semibold uppercase tracking-wider text-slate-500">
              Application Pipeline
            </p>

            <h2 className="mt-1 text-2xl font-semibold">
              Your application activity
            </h2>

            <p className="mt-1 text-sm text-slate-400">
              Current status of your real applications.
            </p>

          </div>

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-6">

            <div className="rounded-2xl border border-slate-800 bg-slate-900 p-5">
              <p className="text-sm text-slate-400">
                Total
              </p>
              <p className="mt-2 text-3xl font-bold">
                {performance.totalApplications}
              </p>
            </div>

            <div className="rounded-2xl border border-slate-800 bg-slate-900 p-5">
              <p className="text-sm text-slate-400">
                Saved
              </p>
              <p className="mt-2 text-3xl font-bold">
                {funnel.saved}
              </p>
            </div>

            <div className="rounded-2xl border border-slate-800 bg-slate-900 p-5">
              <p className="text-sm text-slate-400">
                Applied
              </p>
              <p className="mt-2 text-3xl font-bold">
                {funnel.applied}
              </p>
            </div>

            <div className="rounded-2xl border border-slate-800 bg-slate-900 p-5">
              <p className="text-sm text-slate-400">
                In Review
              </p>
              <p className="mt-2 text-3xl font-bold">
                {funnel.in_review}
              </p>
            </div>

            <div className="rounded-2xl border border-slate-800 bg-slate-900 p-5">
              <p className="text-sm text-slate-400">
                Interview
              </p>
              <p className="mt-2 text-3xl font-bold">
                {funnel.interview}
              </p>
            </div>

            <div className="rounded-2xl border border-slate-800 bg-slate-900 p-5">
              <p className="text-sm text-slate-400">
                Offers
              </p>
              <p className="mt-2 text-3xl font-bold">
                {funnel.offer}
              </p>
            </div>

          </div>

        </section>


        {/* =====================================================
            APPLICATION LIST
        ===================================================== */}

        <section>

          <div className="mb-5">

            <p className="text-sm font-semibold uppercase tracking-wider text-slate-500">
              Your Applications
            </p>

            <h2 className="mt-1 text-2xl font-semibold">
              Application history
            </h2>

          </div>


          {applicationRows.length > 0 ? (

            <div className="space-y-4">

              {applicationRows.map(
                (application) => (

                  <article
                    key={application.id}
                    className="rounded-2xl border border-slate-800 bg-slate-900 p-6 shadow-xl"
                  >

                    <div className="flex flex-col gap-5 md:flex-row md:items-start md:justify-between">

                      <div className="min-w-0">

                        <h3 className="text-xl font-semibold text-white">
                          {application.position}
                        </h3>

                        <p className="mt-2 text-sm text-slate-300">
                          {application.company}
                          {application.country
                            ? ` · ${application.country}`
                            : ""}
                        </p>

                        <div className="mt-4 flex flex-wrap items-center gap-2">

                          <span className="rounded-lg border border-violet-400/20 bg-violet-400/10 px-3 py-1.5 text-xs font-semibold text-violet-300">
                            {application.normalizedStatus ??
                              application.status}
                          </span>

                          {application.application_date && (
                            <span className="rounded-lg border border-slate-700 bg-slate-950 px-3 py-1.5 text-xs text-slate-400">
                              {application.application_date}
                            </span>
                          )}

                          {application.source && (
                            <span className="rounded-lg border border-slate-700 bg-slate-950 px-3 py-1.5 text-xs text-slate-400">
                              {application.source}
                            </span>
                          )}

                        </div>

                      </div>


                      <div className="flex shrink-0 items-center">

                        {application.job_id ? (

                          <div className="flex flex-wrap items-center justify-end gap-2">

                            <Link
                              href={`/empleos/${application.job_id}`}
                              className="inline-flex items-center justify-center rounded-xl border border-slate-700 bg-slate-950 px-4 py-2.5 text-sm font-semibold text-slate-200 transition hover:border-cyan-400/40 hover:text-cyan-300"
                            >
                              VER OPORTUNIDAD
                            </Link>

                            <Link
                              href={`/dashboard/premium?jobId=${encodeURIComponent(application.job_id)}`}
                              className="inline-flex items-center justify-center rounded-xl bg-cyan-400 px-4 py-2.5 text-sm font-semibold text-slate-950 transition hover:bg-cyan-300"
                            >
                              ANALIZAR CON PREMIUM ATS
                            </Link>

                          </div>

                        ) : (

                          <span className="text-xs text-slate-600">
                            Opportunity unavailable
                          </span>

                        )}

                      </div>

                    </div>

                  </article>

                )
              )}

            </div>

          ) : (

            <div className="rounded-2xl border border-slate-800 bg-slate-900 p-8">

              <h3 className="text-xl font-semibold">
                No applications yet
              </h3>

              <p className="mt-2 max-w-xl text-sm leading-6 text-slate-400">
                Explore real opportunities and save an
                application when you find a position worth pursuing.
              </p>

              <Link
                href="/empleos"
                className="mt-6 inline-flex items-center justify-center rounded-xl bg-cyan-400 px-5 py-3 text-sm font-semibold text-slate-950 transition hover:bg-cyan-300"
              >
                EXPLORAR OPORTUNIDADES
              </Link>

            </div>

          )}

        </section>


        {/* =====================================================
            PIPELINE STATUS
        ===================================================== */}

        <section className="mt-8 grid gap-6 md:grid-cols-2">

          <div className="rounded-2xl border border-slate-800 bg-slate-900 p-6">

            <p className="text-sm font-semibold uppercase tracking-wider text-slate-500">
              Active Pipeline
            </p>

            <p className="mt-2 text-4xl font-bold">
              {performance.activePipeline}
            </p>

            <p className="mt-2 text-sm text-slate-400">
              Applications currently moving through the
              application process.
            </p>

          </div>


          <div className="rounded-2xl border border-slate-800 bg-slate-900 p-6">

            <p className="text-sm font-semibold uppercase tracking-wider text-slate-500">
              Response Rate
            </p>

            <p className="mt-2 text-4xl font-bold">
              {(performance.responseRate * 100).toFixed(1)}%
            </p>

            <p className="mt-2 text-sm text-slate-400">
              Based on recorded application responses.
            </p>

          </div>

        </section>


        {/* =====================================================
            FOOTER
        ===================================================== */}

        <footer className="mt-12 border-t border-slate-800 pt-6">

          <p className="text-xs text-slate-600">
            Global Career AI · Application Management V1.0
          </p>

        </footer>

      </div>

    </main>
  );
}
