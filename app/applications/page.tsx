import { getDashboardData } from "@/lib/dashboard/dashboardAdapter.v1";
import { createSupabaseServerAuth } from "@/lib/supabase/server";

export default async function DashboardPage() {
  /**
   * ============================================================
   * CAREER INTELLIGENCE DASHBOARD V1.1
   * ============================================================
   *
   * Page layer only.
   *
   * Business intelligence is composed below this layer through
   * the Dashboard Adapter / Product Contract.
   *
   * Sources:
   *
   * - Real CV analysis
   * - Real Hirebase job matches
   * - Real application history
   * - Real persisted ATS results
   *
   * No demo data.
   * No fake scores.
   * No business logic in the page.
   * ============================================================
   */

  const supabase =
    await createSupabaseServerAuth();

  const {
    data: {
      user,
    },
  } =
    await supabase.auth.getUser();

  /**
   * ============================================================
   * AUTHENTICATION
   * ============================================================
   */

  if (!user) {
    return (
      <main className="min-h-screen bg-slate-950 text-white flex items-center justify-center p-6">
        <div className="w-full max-w-xl rounded-2xl border border-slate-800 bg-slate-900 p-8 shadow-2xl">
          <div className="mb-4 text-sm font-medium text-cyan-400">
            GLOBAL CAREER AI
          </div>

          <h1 className="text-3xl font-bold">
            Career Intelligence
          </h1>

          <p className="mt-3 text-slate-400">
            User session required. Please login to access
            your career intelligence.
          </p>
        </div>
      </main>
    );
  }

  /**
   * ============================================================
   * DASHBOARD CONTRACT
   * ============================================================
   */

  const data =
    await getDashboardData(
      user.id
    );

  /**
   * ============================================================
   * DEBUG
   * ============================================================
   */

  console.log(
    "[DASHBOARD PAGE DEBUG]",
    {
      userId: user.id,

      avgATS:
        data?.analytics?.performance?.avgATS,

      performance:
        data?.analytics?.performance,

      funnel:
        data?.analytics?.funnel,

      insights:
        data?.analytics?.insights,
    }
  );

  /**
   * ============================================================
   * EMPTY STATE
   * ============================================================
   */

  if (
    !data ||
    data.empty ||
    !data.analytics
  ) {
    return (
      <main className="min-h-screen bg-slate-950 text-white p-6 md:p-10">
        <div className="mx-auto max-w-7xl">

          <div className="mb-10">
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-cyan-400">
              Global Career AI
            </p>

            <h1 className="mt-3 text-4xl font-bold tracking-tight">
              Career Intelligence
            </h1>

            <p className="mt-3 max-w-2xl text-slate-400">
              Your professional intelligence will appear here
              once the system has real career data to analyze.
            </p>
          </div>

          <div className="rounded-2xl border border-slate-800 bg-slate-900 p-8">
            <h2 className="text-xl font-semibold">
              Intelligence not available yet
            </h2>

            <p className="mt-2 text-slate-400">
              Upload your CV and interact with real
              opportunities to generate career intelligence.
            </p>
          </div>

        </div>
      </main>
    );
  }

  const analytics =
    data.analytics;

  const performance =
    analytics.performance;

  const funnel =
    analytics.funnel;

  const insights =
    analytics.insights ?? [];

  /**
   * ============================================================
   * SAFE PRESENTATION VALUES
   * ============================================================
   *
   * These are presentation fallbacks only.
   *
   * They do NOT create intelligence.
   */

  const atsScore =
    performance?.avgATS ?? 0;

  const rankingScore =
    performance?.avgRanking ?? 0;

  const applications =
    funnel?.applications ?? 0;

  const hireProbability =
    funnel?.estimatedHireProbability ?? 0;

  const status =
    data.ui?.status ?? "UNKNOWN";

  /**
   * ============================================================
   * SCORE HELPERS
   * ============================================================
   */

  const scoreLabel =
    (score: number) => {
      if (score >= 80) return "Strong";
      if (score >= 60) return "Good";
      if (score >= 40) return "Developing";
      return "Needs attention";
    };

  const scoreBar =
    (score: number) => {
      const safeScore =
        Math.max(
          0,
          Math.min(
            100,
            score
          )
        );

      return `${safeScore}%`;
    };

  /**
   * ============================================================
   * UI
   * ============================================================
   */

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
                Career Intelligence
              </h1>

              <p className="mt-4 max-w-2xl text-base leading-7 text-slate-400">
                A real-time view of your CV strength,
                opportunity alignment, and application activity.
              </p>

            </div>

            <div className="rounded-full border border-emerald-500/30 bg-emerald-500/10 px-4 py-2 text-sm font-medium text-emerald-400">
              Intelligence Status: {status}
            </div>

          </div>

        </header>


        {/* =====================================================
            PERFORMANCE
        ===================================================== */}

        <section className="mb-8">

          <div className="mb-4">

            <p className="text-sm font-semibold uppercase tracking-wider text-slate-500">
              Performance
            </p>

            <h2 className="mt-1 text-2xl font-semibold">
              Your professional intelligence
            </h2>

            <p className="mt-1 text-sm text-slate-400">
              Current intelligence from your latest CV and
              real job matches.
            </p>

          </div>


          <div className="grid gap-5 md:grid-cols-2">

            {/* ATS */}

            <div className="rounded-2xl border border-slate-800 bg-slate-900 p-6 shadow-xl">

              <div className="flex items-start justify-between">

                <div>

                  <p className="text-sm font-medium text-slate-400">
                    ATS Score
                  </p>

                  <div className="mt-3 flex items-end gap-2">

                    <span className="text-5xl font-bold">
                      {atsScore}
                    </span>

                    <span className="mb-2 text-sm text-slate-500">
                      / 100
                    </span>

                  </div>

                </div>

                <div className="rounded-xl bg-cyan-400/10 px-3 py-2 text-xs font-semibold text-cyan-400">
                  {scoreLabel(atsScore)}
                </div>

              </div>

              <div className="mt-6 h-2 overflow-hidden rounded-full bg-slate-800">

                <div
                  className="h-full rounded-full bg-cyan-400"
                  style={{
                    width:
                      scoreBar(atsScore),
                  }}
                />

              </div>

              <p className="mt-4 text-sm text-slate-400">
                Based on your latest real CV analysis.
              </p>

            </div>


            {/* MATCHING */}

            <div className="rounded-2xl border border-slate-800 bg-slate-900 p-6 shadow-xl">

              <div className="flex items-start justify-between">

                <div>

                  <p className="text-sm font-medium text-slate-400">
                    Opportunity Matching
                  </p>

                  <div className="mt-3 flex items-end gap-2">

                    <span className="text-5xl font-bold">
                      {rankingScore}
                    </span>

                    <span className="mb-2 text-sm text-slate-500">
                      / 100
                    </span>

                  </div>

                </div>

                <div className="rounded-xl bg-violet-400/10 px-3 py-2 text-xs font-semibold text-violet-400">
                  {scoreLabel(rankingScore)}
                </div>

              </div>

              <div className="mt-6 h-2 overflow-hidden rounded-full bg-slate-800">

                <div
                  className="h-full rounded-full bg-violet-400"
                  style={{
                    width:
                      scoreBar(rankingScore),
                  }}
                />

              </div>

              <p className="mt-4 text-sm text-slate-400">
                Based on your strongest real job matches.
              </p>

            </div>

          </div>

        </section>


        {/* =====================================================
            MAIN INTELLIGENCE GRID
        ===================================================== */}

        <section className="grid gap-8 lg:grid-cols-3">


          {/* ===================================================
              PROFESSIONAL STRENGTHS
          =================================================== */}

          <div className="rounded-2xl border border-slate-800 bg-slate-900 p-6 shadow-xl">

            <div className="mb-5">

              <p className="text-sm font-semibold uppercase tracking-wider text-slate-500">
                Professional Strengths
              </p>

              <h2 className="mt-1 text-xl font-semibold">
                Your capabilities
              </h2>

              <p className="mt-2 text-sm text-slate-400">
                Skills identified from your latest CV analysis.
              </p>

            </div>


            <div className="flex flex-wrap gap-2">

              {(analytics?.ats?.strengths ?? []).map(
                (
                  skill: string,
                  index: number
                ) => (

                  <span
                    key={`${skill}-${index}`}
                    className="rounded-lg border border-slate-700 bg-slate-800 px-3 py-2 text-sm text-slate-200"
                  >
                    {skill}
                  </span>

                )
              )}

            </div>

          </div>


          {/* ===================================================
              OPPORTUNITY ALIGNMENT
          =================================================== */}

          <div className="rounded-2xl border border-slate-800 bg-slate-900 p-6 shadow-xl lg:col-span-2">

            <div className="mb-5">

              <p className="text-sm font-semibold uppercase tracking-wider text-slate-500">
                Opportunity Alignment
              </p>

              <h2 className="mt-1 text-xl font-semibold">
                Real opportunities identified
              </h2>

              <p className="mt-2 text-sm text-slate-400">
                Opportunities identified by the Matching Engine.
              </p>

            </div>


            <div className="grid gap-6 md:grid-cols-2">


              {/* TARGET ROLES */}

              <div>

                <h3 className="mb-3 text-sm font-semibold text-slate-300">
                  Target Roles
                </h3>

                <div className="space-y-2">

                  {(analytics?.matching?.targetRoles ?? []).map(
                    (
                      role: string,
                      index: number
                    ) => (

                      <div
                        key={`${role}-${index}`}
                        className="rounded-xl border border-slate-800 bg-slate-950/60 px-4 py-3"
                      >
                        <p className="text-sm font-medium text-slate-200">
                          {role}
                        </p>
                      </div>

                    )
                  )}

                </div>

              </div>


              {/* MATCHING FACTORS */}

              <div>

                <h3 className="mb-3 text-sm font-semibold text-slate-300">
                  Matching Factors
                </h3>

                <div className="flex flex-wrap gap-2">

                  {(analytics?.matching?.alignmentFactors ?? []).map(
                    (
                      factor: string,
                      index: number
                    ) => (

                      <span
                        key={`${factor}-${index}`}
                        className="rounded-lg bg-violet-400/10 px-3 py-2 text-sm text-violet-300"
                      >
                        {factor}
                      </span>

                    )
                  )}

                </div>

              </div>

            </div>

          </div>


        </section>


        {/* =====================================================
            APPLICATION ACTIVITY
        ===================================================== */}

        <section className="mt-8">

          <div className="mb-4">

            <p className="text-sm font-semibold uppercase tracking-wider text-slate-500">
              Application Activity
            </p>

            <h2 className="mt-1 text-2xl font-semibold">
              Your career pipeline
            </h2>

            <p className="mt-1 text-sm text-slate-400">
              Current activity from your real application history.
            </p>

          </div>


          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">


            {/* APPLICATIONS */}

            <div className="rounded-2xl border border-slate-800 bg-slate-900 p-6 shadow-xl">

              <p className="text-sm text-slate-400">
                Applications
              </p>

              <p className="mt-3 text-4xl font-bold">
                {applications}
              </p>

              <p className="mt-2 text-xs text-slate-500">
                Total applications recorded
              </p>

            </div>


            {/* ACTIVE PIPELINE */}

            <div className="rounded-2xl border border-slate-800 bg-slate-900 p-6 shadow-xl">

              <p className="text-sm text-slate-400">
                Active Pipeline
              </p>

              <p className="mt-3 text-4xl font-bold">
                {analytics?.application?.activePipeline ?? 0}
              </p>

              <p className="mt-2 text-xs text-slate-500">
                Applications currently active
              </p>

            </div>


            {/* RESPONSE RATE */}

            <div className="rounded-2xl border border-slate-800 bg-slate-900 p-6 shadow-xl">

              <p className="text-sm text-slate-400">
                Response Rate
              </p>

              <p className="mt-3 text-4xl font-bold">
                {(
                  (analytics?.application?.responseRate ?? 0) *
                  100
                ).toFixed(1)}
                %
              </p>

              <p className="mt-2 text-xs text-slate-500">
                Based on recorded application responses
              </p>

            </div>


            {/* HIRE PROBABILITY */}

            <div className="rounded-2xl border border-slate-800 bg-slate-900 p-6 shadow-xl">

              <p className="text-sm text-slate-400">
                Hire Probability
              </p>

              <p className="mt-3 text-4xl font-bold">
                {(
                  hireProbability *
                  100
                ).toFixed(1)}
                %
              </p>

              <p className="mt-2 text-xs text-slate-500">
                Derived from current available intelligence
              </p>

            </div>

          </div>

        </section>


        {/* =====================================================
            CAREER INSIGHTS
        ===================================================== */}

        <section className="mt-8 grid gap-8 lg:grid-cols-3">


          {/* INSIGHTS */}

          <div className="rounded-2xl border border-slate-800 bg-slate-900 p-6 shadow-xl lg:col-span-2">

            <div className="mb-5">

              <p className="text-sm font-semibold uppercase tracking-wider text-slate-500">
                Career Insights
              </p>

              <h2 className="mt-1 text-xl font-semibold">
                Professional areas identified
              </h2>

              <p className="mt-2 text-sm text-slate-400">
                Areas currently supported by your real career data.
              </p>

            </div>


            {insights.length > 0 ? (

              <ul className="space-y-3">

                {insights.map(
                  (
                    insight: string,
                    index: number
                  ) => (

                    <li
                      key={index}
                      className="flex items-center gap-3 rounded-xl border border-slate-800 bg-slate-950/60 px-4 py-3"
                    >

                      <span className="h-2 w-2 rounded-full bg-cyan-400" />

                      <span className="text-sm text-slate-200">
                        {insight}
                      </span>

                    </li>

                  )
                )}

              </ul>

            ) : (

              <p className="text-sm text-slate-500">
                No additional insights are available yet.
              </p>

            )}

          </div>


          {/* STATUS */}

          <div className="rounded-2xl border border-emerald-500/20 bg-emerald-500/5 p-6">

            <p className="text-sm font-semibold uppercase tracking-wider text-emerald-400">
              Intelligence Status
            </p>

            <h2 className="mt-3 text-2xl font-bold">
              {status}
            </h2>

            <p className="mt-3 text-sm leading-6 text-slate-400">
              Current state of the dashboard data pipeline.
            </p>

            <div className="mt-6 flex items-center gap-2">

              <span className="h-3 w-3 rounded-full bg-emerald-400" />

              <span className="text-sm font-medium text-emerald-400">
                Real intelligence available
              </span>

            </div>

          </div>

        </section>


        {/* =====================================================
            FOOTER
        ===================================================== */}

        <footer className="mt-12 border-t border-slate-800 pt-6">

          <p className="text-xs text-slate-600">
            Global Career AI · Career Intelligence Dashboard V1.1
          </p>

        </footer>

      </div>

    </main>
  );
}