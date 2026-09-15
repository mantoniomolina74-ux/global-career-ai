import Link from "next/link";

import { getDashboardData } from "@/lib/dashboard/dashboardAdapter.v1";
import { createSupabaseServerAuth } from "@/lib/supabase/server";

export default async function DashboardPage() {
  const supabase = await createSupabaseServerAuth();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return (
      <main className="min-h-screen bg-slate-950 px-6 py-12 text-white">
        <div className="mx-auto max-w-6xl">
          <h1 className="text-3xl font-bold">
            Career Intelligence
          </h1>

          <p className="mt-4 text-slate-400">
            User session required. Please login to access your career
            intelligence.
          </p>
        </div>
      </main>
    );
  }

  const data = await getDashboardData(user.id);

  if (!data || data.empty || !data.analytics) {
    return (
      <main className="min-h-screen bg-slate-950 px-6 py-12 text-white">
        <div className="mx-auto max-w-6xl">
          <h1 className="text-3xl font-bold">
            Career Intelligence
          </h1>

          <p className="mt-4 text-slate-400">
            No career intelligence is available yet. Start by analyzing
            your CV.
          </p>

          <div className="mt-6">
            <Link
              href="/cv"
              className="inline-flex rounded-xl bg-white px-5 py-3 text-sm font-semibold text-slate-950 transition hover:bg-slate-200"
            >
              VER MI CV
            </Link>
          </div>
        </div>
      </main>
    );
  }

  const analytics = data.analytics;

  const matchingScore = analytics.matching?.matchScore ?? 0;

  const strengths = analytics.ats?.strengths ?? [];

  const improvements = analytics.ats?.improvements ?? [];

  const targetRoles = analytics.matching?.targetRoles ?? [];

  const alignmentFactors =
    analytics.matching?.alignmentFactors ?? [];

      const opportunities =
    analytics.matching?.opportunities ?? [];

  const totalApplications =
    analytics.application?.totalApplications ?? 0;

  const activePipeline =
    analytics.application?.activePipeline ?? 0;

  const responseRate =
    analytics.application?.responseRate ?? 0;

  const offerRate =
    analytics.application?.offerRate ?? 0;

  const insights = analytics.insights ?? [];

  const uniqueStrengths = [
    ...new Set(
      strengths.filter(
        (item): item is string =>
          typeof item === "string" && item.trim().length > 0
      )
    ),
  ];

  const uniqueTargetRoles = [
    ...new Set(
      targetRoles.filter(
        (item): item is string =>
          typeof item === "string" && item.trim().length > 0
      )
    ),
  ];

  const uniqueAlignmentFactors = [
    ...new Set(
      alignmentFactors.filter(
        (item): item is string =>
          typeof item === "string" && item.trim().length > 0
      )
    ),
  ];

  const nextOpportunity = opportunities[0] ?? null;

  const uniqueInsights = [
    ...new Set(
      insights.filter(
        (item): item is string =>
          typeof item === "string" && item.trim().length > 0
      )
    ),
  ];

  return (
    <main className="min-h-screen bg-slate-950 px-4 py-8 text-white sm:px-6 lg:px-8">
      <div className="mx-auto max-w-6xl">

        {/* HEADER */}
        <header className="mb-10">
          <div className="mb-3 inline-flex rounded-full border border-slate-700 bg-slate-900 px-3 py-1 text-xs font-medium uppercase tracking-wider text-slate-400">
            Career Intelligence
          </div>

          <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">
            Your professional intelligence
          </h1>

          <p className="mt-3 max-w-2xl text-base leading-7 text-slate-400">
            A real-time view of your CV strength, opportunity alignment,
            and application activity.
          </p>
        </header>

                          {/* PERFORMANCE */}
        <section className="mb-8">
          <div className="mb-4">
            <h2 className="text-xl font-semibold">
              Performance
            </h2>

            <p className="mt-1 text-sm text-slate-500">
              Current intelligence from your latest CV and real job matches.
            </p>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">

            {/* MATCHING */}
            <div className="rounded-2xl border border-slate-700 bg-slate-900 p-6">
              <p className="text-sm font-medium uppercase tracking-wide text-slate-400">
                Opportunity Matching
              </p>

              <div className="mt-3 flex items-end gap-2">
                <span className="text-5xl font-bold">
                  {matchingScore}
                </span>

                <span className="mb-1 text-slate-500">
                  / 100
                </span>
              </div>

              <p className="mt-3 text-sm leading-6 text-slate-400">
  Your profile currently has a limited match with the available
  opportunities. Explore the opportunities below to see where your
  professional profile aligns and why.
               </p>


              <Link
                href="/empleos"
                className="mt-5 inline-flex rounded-lg bg-white px-4 py-2 text-sm font-semibold text-slate-950 transition hover:bg-slate-200"
              >
                EXPLORAR EMPLEOS
              </Link>
            </div>

            {/* NEXT STEP */}
            <section className="mb-8">
              <div className="rounded-2xl border border-slate-800 bg-slate-900 p-6">
                <div className="mb-5">
                  <h2 className="text-xl font-semibold">
                    Recommended Next Step
                  </h2>

                  <p className="mt-1 text-sm text-slate-500">
                    A practical action based on your current real opportunity matching.
                  </p>
                </div>

                {nextOpportunity ? (
                  <div className="rounded-xl border border-slate-800 bg-slate-950 p-5">
                    <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                      <div>
                        <p className="text-lg font-semibold text-slate-200">
                          Review your strongest opportunity
                        </p>

                        <p className="mt-2 text-sm text-slate-400">
                          {nextOpportunity.title}
                        </p>

                        {nextOpportunity.country && (
                          <p className="mt-1 text-sm text-slate-500">
                            {nextOpportunity.country}
                          </p>
                        )}
                      </div>

                      <div className="shrink-0">
                        <span className="text-2xl font-bold text-white">
                          {nextOpportunity.matchScore}
                        </span>

                        <span className="ml-1 text-sm text-slate-500">
                          / 100
                        </span>
                      </div>
                    </div>

                    <p className="mt-4 max-w-3xl text-sm leading-6 text-slate-400">
                      This is currently one of the strongest real opportunities
                      identified for your professional profile. Review the
                      opportunity to understand the match and decide whether
                      to continue with the application.
                    </p>

                    <Link
                      href={`/empleos/${nextOpportunity.id}`}
                      className="mt-5 inline-flex rounded-lg bg-white px-4 py-2 text-sm font-semibold text-slate-950 transition hover:bg-slate-200"
                    >
                      REVISAR OPORTUNIDAD
                    </Link>
                  </div>
                ) : (
                  <div className="rounded-xl border border-slate-800 bg-slate-950 p-5">
                    <p className="text-sm leading-6 text-slate-400">
                      No real opportunity matches are available yet.
                      Explore current opportunities to find where your profile
                      may align.
                    </p>

                    <Link
                      href="/empleos"
                      className="mt-5 inline-flex rounded-lg bg-white px-4 py-2 text-sm font-semibold text-slate-950 transition hover:bg-slate-200"
                    >
                      EXPLORAR EMPLEOS
                    </Link>
                  </div>
                )}
              </div>
            </section>

            {/* PROFESSIONAL PROFILE */}
<div className="rounded-2xl border border-slate-800 bg-slate-900 p-6">
  <p className="text-sm font-medium uppercase tracking-wide text-slate-500">
    Professional Profile
  </p>

  <div className="mt-3">
    <span className="text-2xl font-bold text-white">
      Profile analyzed
    </span>
  </div>

  <p className="mt-3 text-sm text-slate-400">
    Your professional profile has been analyzed from your latest CV.
  </p>

  <Link
    href="/cv"
    className="mt-5 inline-flex rounded-lg border border-slate-700 bg-slate-800 px-4 py-2 text-sm font-semibold text-white transition hover:bg-slate-700"
  >
    VER MI CV
  </Link>
</div>

          </div>
        </section>
        {/* PROFESSIONAL STRENGTHS */}
        <section className="mb-8">
          <div className="rounded-2xl border border-slate-800 bg-slate-900 p-6">
            <div className="mb-5">
              <h2 className="text-xl font-semibold">
                Professional Strengths
              </h2>

              <p className="mt-1 text-sm text-slate-500">
                Skills identified from your latest CV analysis.
              </p>
            </div>

            {uniqueStrengths.length > 0 ? (
              <div className="flex flex-wrap gap-2">
                {uniqueStrengths.map((strength) => (
                  <span
                    key={strength}
                    className="rounded-full border border-slate-700 bg-slate-800 px-3 py-2 text-sm text-slate-200"
                  >
                    {strength}
                  </span>
                ))}
              </div>
            ) : (
              <p className="text-sm text-slate-500">
                No professional strengths available yet.
              </p>
            )}

                                {improvements.length > 0 && (
              <div className="mt-6 border-t border-slate-800 pt-5">
                <h3 className="text-sm font-semibold text-slate-300">
                  What Could Improve Your Opportunities
                </h3>

                <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-500">
                  These areas were identified from your current CV analysis.
                  Strengthening them may help your profile align with a wider
                  range of relevant opportunities.
                </p>

                <div className="mt-4 flex flex-wrap gap-2">
                  {improvements.map((item) => (
                    <span
                      key={item}
                      className="rounded-full border border-slate-700 bg-slate-950 px-3 py-2 text-sm text-slate-400"
                    >
                      {item}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        </section>
                {/* TARGET ROLES */}
        <section className="mb-8">
          <div className="rounded-2xl border border-slate-800 bg-slate-900 p-6">
            <div className="mb-5">
              <h2 className="text-xl font-semibold">
                Target Roles
              </h2>

              <p className="mt-1 text-sm text-slate-500">
                Roles identified as relevant to your current professional profile.
              </p>
            </div>

            {uniqueTargetRoles.length > 0 ? (
              <div className="grid gap-3 sm:grid-cols-2">
                {uniqueTargetRoles.map((role) => (
                  <div
                    key={role}
                    className="rounded-xl border border-slate-800 bg-slate-950 p-4 text-slate-300"
                  >
                    {role}
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-slate-500">
                No target roles identified yet.
              </p>
            )}
          </div>
        </section>

                {/* OPPORTUNITY ALIGNMENT */}
        <section className="mb-8">
          <div className="rounded-2xl border border-slate-800 bg-slate-900 p-6">

            <div className="mb-5">
              <h2 className="text-xl font-semibold">
                Opportunity Alignment
              </h2>

              <p className="mt-1 text-sm text-slate-500">
                Real opportunities identified by the Matching Engine.
              </p>
            </div>


            {opportunities.length > 0 ? (

              <div>

                <h3 className="text-sm font-semibold uppercase tracking-wide text-slate-500">
                  Strongest Real Opportunities
                </h3>


                <div className="mt-4 grid gap-4">

                  {opportunities.map(
                    (opportunity) => (

                      <div
                        key={opportunity.id}
                        className="rounded-xl border border-slate-800 bg-slate-950 p-5"
                      >

                        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">

                          <div>

                            <p className="text-lg font-semibold text-slate-200">
                              {opportunity.title}
                            </p>


                            {opportunity.country && (
                              <p className="mt-1 text-sm text-slate-500">
                                {opportunity.country}
                              </p>
                            )}

                          </div>


                          <div className="shrink-0">

                            <span className="text-2xl font-bold text-white">
                              {opportunity.matchScore}
                            </span>

                            <span className="ml-1 text-sm text-slate-500">
                              / 100
                            </span>

                          </div>

                        </div>

                                                 <div className="mt-3">
                          <p className="text-sm leading-6 text-slate-400">
                            This score represents how closely your current
                            professional profile aligns with this specific
                            opportunity, based on matching evidence identified
                            by the Matching Engine.
                          </p>
                        </div>

                        {opportunity.reasons.length > 0 && (
                          <div className="mt-4">
                            <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                               Match Evidence
                            </p>

                            <div className="mt-2 space-y-2">
                              {opportunity.reasons.map(
                                (reason) => (
                                  <p
                                    key={`${opportunity.id}-reason-${reason}`}
                                    className="text-sm leading-6 text-slate-300"
                                  >
                                    {reason}
                                  </p>
                                )
                              )}
                            </div>
                          </div>
                        )}
                        {(opportunity.matchedSkills.length > 0 ||
                          opportunity.matchedIndustries.length > 0) && (

                          <div className="mt-5 border-t border-slate-800 pt-4">

                            <p className="text-sm font-semibold text-slate-300">
                              Why this opportunity matches
                            </p>


                            {opportunity.matchedSkills.length > 0 && (
                              <div className="mt-3">

                                <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                                  Matching Skills
                                </p>

                                <div className="mt-2 flex flex-wrap gap-2">

                                  {opportunity.matchedSkills.map(
                                    (skill) => (

                                      <span
                                        key={`${opportunity.id}-skill-${skill}`}
                                        className="rounded-full border border-slate-700 bg-slate-800 px-3 py-1.5 text-sm text-slate-300"
                                      >
                                        {skill}
                                      </span>

                                    )
                                  )}

                                </div>

                              </div>
                            )}


                            {opportunity.matchedIndustries.length > 0 && (
                              <div className="mt-4">

                                <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                                  Matching Industries
                                </p>

                                <div className="mt-2 flex flex-wrap gap-2">

                                  {opportunity.matchedIndustries.map(
                                    (industry) => (

                                      <span
                                        key={`${opportunity.id}-industry-${industry}`}
                                        className="rounded-full border border-slate-700 bg-slate-950 px-3 py-1.5 text-sm text-slate-400"
                                      >
                                        {industry}
                                      </span>

                                    )
                                  )}

                                </div>

                              </div>
                            )}

                          </div>

                        )}
                          {(
                            opportunity.certifications.whmis ||
                            opportunity.certifications.csts ||
                            opportunity.certifications.firstAid
                          ) && (
                           <div className="mt-5 border-t border-slate-800 pt-4">

                          <p className="text-sm font-semibold text-slate-300">
                            Certification Requirements
                            </p>

                            <div className="mt-3 flex flex-wrap gap-2">

                            {opportunity.certifications.whmis && (
                            <span className="rounded-full border border-slate-700 bg-slate-800 px-3 py-1.5 text-sm text-slate-300">
                               WHMIS
                            </span>
                          )}

                            {opportunity.certifications.csts && (
                            <span className="rounded-full border border-slate-700 bg-slate-800 px-3 py-1.5 text-sm text-slate-300">
                              CSTS
                            </span>
                          )}

                            {opportunity.certifications.firstAid && (
                            <span className="rounded-full border border-slate-700 bg-slate-800 px-3 py-1.5 text-sm text-slate-300">
                            First Aid
                            </span>
                          )}

                            </div>

                            </div>
                          )}

                        <div className="mt-5">

                          <Link
                            href={`/empleos/${opportunity.id}`}
                            className="inline-flex rounded-lg bg-white px-4 py-2 text-sm font-semibold text-slate-950 transition hover:bg-slate-200"
                          >
                            VER OPORTUNIDAD
                          </Link>

                        </div>

                      </div>

                    )
                  )}

                </div>

              </div>

            ) : (

              <p className="text-sm text-slate-500">
                No real opportunities available yet.
              </p>

            )}


            {uniqueAlignmentFactors.length > 0 && (
              <div className="mt-6 border-t border-slate-800 pt-5">

                <h3 className="text-sm font-semibold uppercase tracking-wide text-slate-500">
                  Overall Matching Factors
                </h3>

                <div className="mt-3 flex flex-wrap gap-2">

                  {uniqueAlignmentFactors.map(
                    (factor) => (

                      <span
                        key={factor}
                        className="rounded-full border border-slate-700 bg-slate-800 px-3 py-2 text-sm text-slate-300"
                      >
                        {factor}
                      </span>

                    )
                  )}

                </div>

              </div>
            )}

          </div>
        </section>

        {/* APPLICATION FUNNEL */}
        <section className="mb-8">
          <div className="mb-4">
            <h2 className="text-xl font-semibold">
              Application Activity
            </h2>

            <p className="mt-1 text-sm text-slate-500">
              Current activity from your application history.
            </p>
          </div>

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">

            <div className="rounded-2xl border border-slate-800 bg-slate-900 p-5">
              <p className="text-sm text-slate-500">
                Applications
              </p>

              <p className="mt-2 text-3xl font-bold">
                {totalApplications}
              </p>
            </div>

            <div className="rounded-2xl border border-slate-800 bg-slate-900 p-5">
              <p className="text-sm text-slate-500">
                Active Pipeline
              </p>

              <p className="mt-2 text-3xl font-bold">
                {activePipeline}
              </p>
            </div>

            <div className="rounded-2xl border border-slate-800 bg-slate-900 p-5">
              <p className="text-sm text-slate-500">
                Response Rate
              </p>

              <p className="mt-2 text-3xl font-bold">
                {responseRate.toFixed(1)}%
              </p>
            </div>

            <div className="rounded-2xl border border-slate-800 bg-slate-900 p-5">
              <p className="text-sm text-slate-500">
                Offer Rate
              </p>

              <p className="mt-2 text-3xl font-bold">
                {offerRate.toFixed(1)}%
              </p>
            </div>

          </div>

          <div className="mt-5">
            <Link
              href="/applications"
              className="inline-flex rounded-lg border border-slate-700 bg-slate-900 px-4 py-2 text-sm font-semibold text-white transition hover:bg-slate-800"
            >
              VER MIS POSTULACIONES
            </Link>
          </div>
        </section>

        {/* INSIGHTS */}
        <section className="mb-8">
          <div className="rounded-2xl border border-slate-800 bg-slate-900 p-6">
            <div className="mb-5">
              <h2 className="text-xl font-semibold">
                Career Insights
              </h2>

              <p className="mt-1 text-sm text-slate-500">
                Professional areas identified from your current intelligence.
              </p>
            </div>

            {uniqueInsights.length > 0 ? (
              <ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {uniqueInsights.map((insight) => (
                  <li
                    key={insight}
                    className="rounded-xl border border-slate-800 bg-slate-950 p-4 text-slate-300"
                  >
                    {insight}
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-sm text-slate-500">
                No career insights available yet.
              </p>
            )}
          </div>
        </section>

        {/* STATUS */}
        <footer className="border-t border-slate-800 pt-6">
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="text-sm font-medium text-slate-300">
                Intelligence Status
              </p>

              <p className="mt-1 text-xs text-slate-500">
                Current state of the dashboard data pipeline.
              </p>
            </div>

            <span className="rounded-full border border-slate-700 bg-slate-900 px-4 py-2 text-sm font-semibold text-slate-300">
              {data.ui?.status ?? "UNKNOWN"}
            </span>
          </div>
        </footer>

      </div>
    </main>
  );
}

