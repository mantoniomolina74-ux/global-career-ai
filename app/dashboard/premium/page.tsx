import { redirect } from "next/navigation";

import { createSupabaseServerAuth } from "@/lib/supabase/server";
import { getPremiumDashboardData } from "@/lib/dashboard/services/premiumATSService";
import { getLearningDashboardInsight } from "@/lib/dashboard/services/learningDashboardService";
import { initLearningEventConsumer } from "@/lib/engine/events/learningEventConsumer";
import { getPremiumAccess } from "@/lib/billing/premiumAccess";

export default async function PremiumDashboardPage({
  searchParams,
}: {
  searchParams: Promise<{
    jobId?: string;
    demo?: string;
  }>;
}) {
  const supabase = await createSupabaseServerAuth();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const { jobId, demo } = await searchParams;

  const isDemo = demo === "true";

  if (!isDemo) {
    const premiumAccess = await getPremiumAccess(user.id);

    if (!premiumAccess.hasAccess) {
      redirect("/premium/demo");
    }
  }

  initLearningEventConsumer();

  const premiumData =
    await getPremiumDashboardData(
      user.id,
      jobId
    );

  const learning: {
    activePatterns: string[];
    learningSignals: string[];
    recommendedActions: string[];
  } =
    (premiumData.careerState?.intelligence.learning as {
      activePatterns: string[];
      learningSignals: string[];
      recommendedActions: string[];
    } | undefined) ?? {
      activePatterns: [],
      learningSignals: [],
      recommendedActions: [],
    };

  const premiumATS = premiumData.insight;
  const careerHealth = premiumData.careerHealth;
  const marketReadiness = premiumData.marketReadiness;
  const knowledge = premiumData.knowledge;
  const analytics = premiumData.analytics;
  const careerEvolution = premiumData.careerEvolution;
  const recommendations = premiumData.recommendations;

  const matchingOpportunities =
    premiumData.careerState?.intelligence.matching?.opportunities ?? [];

  const {
    overview,
    opportunity,
    summary,
  } = premiumATS;

  return (
    <main className="min-h-screen bg-background px-6 py-10">
      <div className="mx-auto max-w-7xl space-y-8">
        <header className="space-y-2">
          <p className="text-sm font-medium uppercase tracking-wide text-muted-foreground">
            Global Career AI
          </p>

          <h1 className="text-3xl font-bold tracking-tight">
            Premium Career Intelligence
          </h1>

          <p className="max-w-2xl text-muted-foreground">
            Advanced ATS, career health, and opportunity intelligence based on
            your real professional data.
          </p>
        </header>

        <section className="space-y-4">
          <div>
            <h2 className="text-xl font-semibold">
              ATS Advanced
            </h2>

            <p className="text-sm text-muted-foreground">
              Detailed analysis of your professional profile.
            </p>
          </div>

          {overview ? (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
              <MetricCard
                label="ATS Score"
                value={overview.score}
              />

              <MetricCard
                label="Keyword Score"
                value={overview.keywordScore}
              />

              <MetricCard
                label="Semantic Score"
                value={overview.semanticScore}
              />

              <div className="rounded-xl border bg-card p-5 shadow-sm">
                <p className="text-sm text-muted-foreground">
                  Recommendation
                </p>

                <p className="mt-2 font-medium">
                  {overview.recommendation}
                </p>
              </div>
            </div>
          ) : (
            <EmptyState
              title="ATS Advanced unavailable"
              description="No advanced ATS intelligence is currently available for your profile."
            />
          )}
        </section>

        <section className="space-y-4">
          <div>
            <h2 className="text-xl font-semibold">
              Career Health
            </h2>

            <p className="text-sm text-muted-foreground">
              Overall career health based on ATS, matching, competency, and
              knowledge intelligence.
            </p>
          </div>

          {premiumData.careerStateAvailable ? (
            <>
              <div className="grid gap-4 md:grid-cols-2">
                <MetricCard
                  label="Career Health Score"
                  value={careerHealth.score}
                />

                <div className="rounded-xl border bg-card p-5 shadow-sm">
                  <p className="text-sm text-muted-foreground">
                    Career Health Level
                  </p>

                  <p className="mt-2 text-3xl font-bold">
                    {careerHealth.level}
                  </p>
                </div>
              </div>

              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <MetricCard
                  label={`ATS (${careerHealth.weights.ats * 100}%)`}
                  value={careerHealth.components.ats}
                />

                <MetricCard
                  label={`Matching (${careerHealth.weights.matching * 100}%)`}
                  value={careerHealth.components.matching}
                />

                <MetricCard
                  label={`Competency (${careerHealth.weights.competency * 100}%)`}
                  value={careerHealth.components.competency}
                />

                <MetricCard
                  label={`Knowledge (${careerHealth.weights.knowledge * 100}%)`}
                  value={careerHealth.components.knowledge}
                />
              </div>
            </>
          ) : (
            <EmptyState
              title="Career Health unavailable"
              description="No complete career intelligence is currently available for your profile."
            />
          )}
        </section>

        <section className="space-y-4">
          <div>
            <h2 className="text-xl font-semibold">
              Market Readiness
            </h2>

            <p className="text-sm text-muted-foreground">
              Readiness to compete for real international career
              opportunities.
            </p>
          </div>

          {premiumData.careerStateAvailable ? (
            <>
              <div className="grid gap-4 md:grid-cols-2">
                <MetricCard
                  label="Market Readiness Score"
                  value={marketReadiness.score}
                />

                <div className="rounded-xl border bg-card p-5 shadow-sm">
                  <p className="text-sm text-muted-foreground">
                    Market Readiness Level
                  </p>

                  <p className="mt-2 text-3xl font-bold">
                    {marketReadiness.level}
                  </p>
                </div>
              </div>

              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
                <MetricCard
                  label={`ATS (${marketReadiness.weights.ats * 100}%)`}
                  value={marketReadiness.components.ats}
                />

                <MetricCard
                  label={`Matching (${marketReadiness.weights.matching * 100}%)`}
                  value={marketReadiness.components.matching}
                />

                <MetricCard
                  label={`Competency (${marketReadiness.weights.competency * 100}%)`}
                  value={Math.round(
                    marketReadiness.components.competency
                  )}
                />

                <MetricCard
                  label={`Knowledge (${marketReadiness.weights.knowledge * 100}%)`}
                  value={Math.round(
                    marketReadiness.components.knowledge
                  )}
                />

                <MetricCard
                  label={`Profile (${marketReadiness.weights.profile * 100}%)`}
                  value={marketReadiness.components.profile}
                />
              </div>
            </>
          ) : (
            <EmptyState
              title="Market Readiness unavailable"
              description="No complete market readiness intelligence is currently available for your profile."
            />
          )}
        </section>

        <section className="space-y-4">
          <div>
            <h2 className="text-xl font-semibold">
              Knowledge Intelligence
            </h2>

            <p className="text-sm text-muted-foreground">
              Your professional knowledge profile, identified gaps, and
              learning potential.
            </p>
          </div>

          {knowledge ? (
            <>
              <div className="grid gap-4 md:grid-cols-2">
                <MetricCard
                  label="Knowledge Score"
                  value={Math.round(knowledge.score)}
                />

                <div className="rounded-xl border bg-card p-5 shadow-sm">
                  <p className="text-sm text-muted-foreground">
                    Knowledge Level
                  </p>

                  <p className="mt-2 text-3xl font-bold">
                    {knowledge.level}
                  </p>
                </div>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <div className="rounded-xl border bg-card p-5 shadow-sm">
                  <p className="text-sm text-muted-foreground">
                    Dominant Domain
                  </p>

                  <p className="mt-2 text-xl font-semibold">
                    {knowledge.dominantDomain ?? "Not available"}
                  </p>
                </div>

                <MetricCard
                  label="Average Confidence"
                  value={Math.round(
                    knowledge.averageConfidence * 100
                  )}
                />
              </div>

              <div>
                <h3 className="mb-3 text-lg font-semibold">
                  Knowledge Domains
                </h3>

                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                  {knowledge.domains.map((domain) => (
                    <div
                      key={domain.id}
                      className="rounded-xl border bg-card p-5 shadow-sm"
                    >
                      <p className="font-semibold">
                        {domain.name}
                      </p>

                      <p className="mt-2 text-2xl font-bold">
                        {Math.round(domain.score)}
                      </p>

                      <p className="mt-1 text-sm text-muted-foreground">
                        Confidence:{" "}
                        {Math.round(
                          domain.confidence * 100
                        )}
                      </p>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <h3 className="mb-3 text-lg font-semibold">
                  Knowledge Gaps
                </h3>

                {knowledge.gaps.length > 0 ? (
                  <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                    {knowledge.gaps.map((gap) => (
                      <div
                        key={gap.competencyId}
                        className="rounded-xl border bg-card p-5 shadow-sm"
                      >
                        <p className="font-semibold">
                          {gap.competencyName}
                        </p>

                        <p className="mt-2 text-sm text-muted-foreground">
                          Current:{" "}
                          {Math.round(gap.currentScore)}
                        </p>

                        <p className="text-sm text-muted-foreground">
                          Target:{" "}
                          {Math.round(gap.targetScore)}
                        </p>

                        <p className="mt-2 font-medium">
                          Gap:{" "}
                          {Math.round(gap.gapScore)}
                        </p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <EmptyState
                    title="No knowledge gaps detected"
                    description="No competency currently meets the defined Knowledge Gap threshold."
                  />
                )}
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <MetricCard
                  label="Learning Potential"
                  value={Math.round(
                    knowledge.learningPotential
                  )}
                />

                <MetricCard
                  label="Projected Knowledge Score"
                  value={Math.round(
                    knowledge.projectedScore
                  )}
                />
              </div>
            </>
          ) : (
            <EmptyState
              title="Knowledge Intelligence unavailable"
              description="No complete knowledge intelligence is currently available for your profile."
            />
          )}
        </section>

        <section className="space-y-4">
          <div>
            <h2 className="text-xl font-semibold">
              Learning Intelligence
            </h2>

            <p className="text-sm text-muted-foreground">
              Learning patterns, signals, and recommended actions derived
              from your real career activity.
            </p>
          </div>

          <div className="grid gap-4 lg:grid-cols-3">
            <ListCard
              title="Active Patterns"
              items={learning.activePatterns}
            />

            <ListCard
              title="Learning Signals"
              items={learning.learningSignals}
            />

            <ListCard
              title="Recommended Actions"
              items={learning.recommendedActions}
            />
          </div>
        </section>

        <section className="space-y-4">
          <div>
            <h2 className="text-xl font-semibold">
              Career Evolution
            </h2>

            <p className="text-sm text-muted-foreground">
              Your current career position, direction, strengths, development
              areas, and next professional actions based on your real career
              intelligence.
            </p>
          </div>

          <div className="space-y-6">
            <div>
              <h3 className="mb-3 text-lg font-semibold">
                Current Position
              </h3>

              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                <div className="rounded-xl border bg-card p-5 shadow-sm">
                  <p className="text-sm text-muted-foreground">
                    Career Level
                  </p>

                  <p className="mt-2 text-2xl font-semibold">
                    {careerEvolution.currentPosition.careerLevel ||
                      "Not available"}
                  </p>
                </div>

                <MetricCard
                  label="Market Fit"
                  value={Math.round(
                    careerEvolution.currentPosition.marketFit
                  )}
                />

                <MetricCard
                  label="Readiness Score"
                  value={Math.round(
                    careerEvolution.currentPosition.readinessScore
                  )}
                />
              </div>
            </div>

            <div>
              <h3 className="mb-3 text-lg font-semibold">
                Career Direction
              </h3>

              <div className="space-y-4">
                <div className="rounded-xl border bg-card p-5 shadow-sm">
                  <p className="text-sm text-muted-foreground">
                    Next Career Step
                  </p>

                  <p className="mt-2 font-medium">
                    {careerEvolution.careerDirection.nextCareerStep ||
                      "Not available"}
                  </p>
                </div>

                <div className="grid gap-4 md:grid-cols-2">
                  <ListCard
                    title="Target Roles"
                    items={careerEvolution.careerDirection.targetRoles}
                  />

                  <ListCard
                    title="Target Industries"
                    items={
                      careerEvolution.careerDirection.targetIndustries
                    }
                  />
                </div>
              </div>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <ListCard
                title="Strengths"
                items={careerEvolution.strengths}
              />

              <ListCard
                title="Development Areas"
                items={careerEvolution.developmentAreas}
              />

              <ListCard
                title="Priority Skills"
                items={careerEvolution.prioritySkills}
              />

              <ListCard
                title="Recommended Actions"
                items={careerEvolution.recommendedActions}
              />
            </div>
          </div>
        </section>

        <section className="space-y-4">
          <div>
            <h2 className="text-xl font-semibold">
              Recommendations
            </h2>

            <p className="text-sm text-muted-foreground">
              Actionable career recommendations based on your real
              professional intelligence.
            </p>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <ListCard
              title="Priority Recommendations"
              items={recommendations.recommendations.map(
                (recommendation) =>
                  `${recommendation.title}: ${recommendation.description}`
              )}
            />

            <ListCard
              title="Skill Gaps"
              items={recommendations.skillGaps}
            />

            <ListCard
              title="Opportunity Strategy"
              items={
                recommendations.strategy
                  ? [recommendations.strategy]
                  : []
              }
            />
          </div>
        </section>

        <section className="space-y-4">
          <div>
            <h2 className="text-xl font-semibold">
              Premium Analytics
            </h2>

            <p className="text-sm text-muted-foreground">
              Career performance, application performance, opportunity
              performance, and career signals based on your real professional
              data.
            </p>
          </div>

          <div className="space-y-6">
            <div>
              <h3 className="mb-3 text-lg font-semibold">
                Career Performance
              </h3>

              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                <MetricCard
                  label="ATS"
                  value={analytics.careerPerformance.ats}
                />

                <MetricCard
                  label="Matching"
                  value={analytics.careerPerformance.matching}
                />

                <MetricCard
                  label="Competency"
                  value={Math.round(
                    analytics.careerPerformance.competency
                  )}
                />

                <MetricCard
                  label="Knowledge"
                  value={Math.round(
                    analytics.careerPerformance.knowledge
                  )}
                />

                <MetricCard
                  label="Career Health"
                  value={Math.round(
                    analytics.careerPerformance.careerHealth
                  )}
                />

                <MetricCard
                  label="Market Readiness"
                  value={Math.round(
                    analytics.careerPerformance.marketReadiness
                  )}
                />
              </div>
            </div>

            <div>
              <h3 className="mb-3 text-lg font-semibold">
                Application Performance
              </h3>

              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <MetricCard
                  label="Total Applications"
                  value={analytics.applicationPerformance.totalApplications}
                />

                <MetricCard
                  label="Active Pipeline"
                  value={analytics.applicationPerformance.activePipeline}
                />

                <MetricCard
                  label="Response Rate"
                  value={Math.round(
                    analytics.applicationPerformance.responseRate
                  )}
                />

                <MetricCard
                  label="Rejection Rate"
                  value={Math.round(
                    analytics.applicationPerformance.rejectionRate
                  )}
                />

                <MetricCard
                  label="Conversion Rate"
                  value={Math.round(
                    analytics.applicationPerformance.conversionRate
                  )}
                />

                <MetricCard
                  label="Offer Rate"
                  value={Math.round(
                    analytics.applicationPerformance.offerRate
                  )}
                />

                <MetricCard
                  label="Success Rate"
                  value={Math.round(
                    analytics.applicationPerformance.successRate
                  )}
                />
              </div>
            </div>

            <div>
              <h3 className="mb-3 text-lg font-semibold">
                Opportunity Performance
              </h3>

              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                <MetricCard
                  label="Evaluated Opportunities"
                  value={
                    analytics.opportunityPerformance
                      .evaluatedOpportunities
                  }
                />

                <MetricCard
                  label="Average Score"
                  value={Math.round(
                    analytics.opportunityPerformance.averageScore
                  )}
                />

                <MetricCard
                  label="Top Score"
                  value={Math.round(
                    analytics.opportunityPerformance.topScore
                  )}
                />
              </div>

              <div className="mt-4 grid gap-4 lg:grid-cols-2">
                <ListCard
                  title="Top Opportunities"
                  items={analytics.opportunityPerformance.topOpportunities.map(
                    (item) =>
                      `${item.title} — ${Math.round(item.score)}`
                  )}
                />

                <ListCard
                  title="Target Roles"
                  items={
                    analytics.opportunityPerformance.targetRoles
                  }
                />

                <ListCard
                  title="Matched Skills"
                  items={
                    analytics.opportunityPerformance.matchedSkills
                  }
                />

                <ListCard
                  title="Matched Industries"
                  items={
                    analytics.opportunityPerformance.matchedIndustries
                  }
                />
              </div>
            </div>

            <div>
              <h3 className="mb-3 text-lg font-semibold">
                Career Signals
              </h3>

              <div className="grid gap-4 lg:grid-cols-2">
                <ListCard
                  title="Strengths"
                  items={analytics.careerSignals.strengths}
                />

                <ListCard
                  title="Gaps"
                  items={analytics.careerSignals.gaps}
                />

                <ListCard
                  title="Improvement Areas"
                  items={
                    analytics.careerSignals.improvementAreas
                  }
                />

                <ListCard
                  title="Recommendations"
                  items={
                    analytics.careerSignals.recommendations
                  }
                />
              </div>
            </div>
          </div>
        </section>

        <section className="space-y-4">
          <div>
            <h2 className="text-xl font-semibold">
              Job Intelligence
            </h2>

            <p className="text-sm text-muted-foreground">
              Structured intelligence extracted from the real job
              opportunities evaluated for your profile.
            </p>
          </div>

          {matchingOpportunities.length > 0 ? (
            <div className="space-y-6">
              {matchingOpportunities.map((opportunity) => {
                const intelligence =
                  opportunity.jobIntelligence;

                if (!intelligence) {
                  return null;
                }

                const groupedRequirements =
                  intelligence.requirements.reduce<
                    Record<string, typeof intelligence.requirements>
                  >(
                    (groups, requirement) => {
                      const key = requirement.category;

                      if (!groups[key]) {
                        groups[key] = [];
                      }

                      groups[key].push(requirement);

                      return groups;
                    },
                    {}
                  );

                return (
                  <div
                    key={intelligence.id}
                    className="rounded-xl border bg-card p-6 shadow-sm"
                  >
                    <div className="space-y-4">
                      <div>
                        <h3 className="text-xl font-semibold">
                          {intelligence.title}
                        </h3>

                        <p className="mt-1 text-sm text-muted-foreground">
                          {intelligence.company}
                        </p>
                      </div>

                      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                        <InfoCard
                          label="Country"
                          value={
                            intelligence.country ??
                            "Not specified"
                          }
                        />

                        <InfoCard
                          label="Location"
                          value={
                            intelligence.location ??
                            "Not specified"
                          }
                        />

                        <InfoCard
                          label="Work Mode"
                          value={getWorkModeLabel(
                            intelligence.workMode
                          )}
                        />

                        <InfoCard
                          label="Industry"
                          value={
                            intelligence.industry ??
                            "Not specified"
                          }
                        />
                      </div>

                      <InfoCard
                        label="Category"
                        value={
                          intelligence.category ??
                          "Not specified"
                        }
                      />

                      {intelligence.description ? (
                        <div className="rounded-lg border p-4">
                          <p className="text-sm font-medium">
                            Intelligence Source
                          </p>

                          <p className="mt-2 text-sm text-muted-foreground">
                            Original job description available as
                            intelligence evidence.
                          </p>
                        </div>
                      ) : null}

                      {intelligence.requirements.length > 0 ? (
                        <div className="space-y-5">
                          <div>
                            <h4 className="text-lg font-semibold">
                              Structured Requirements
                            </h4>

                            <p className="mt-1 text-sm text-muted-foreground">
                              Requirements identified directly from the
                              published job information.
                            </p>
                          </div>

                          {Object.entries(
                            groupedRequirements
                          ).map(
                            ([
                              category,
                              requirements,
                            ]) => (
                              <div
                                key={category}
                                className="space-y-3"
                              >
                                <h5 className="font-semibold">
                                  {getRequirementLabel(
                                    category
                                  )}
                                </h5>

                                <div className="space-y-3">
                                  {requirements.map(
                                    (
                                      requirement,
                                      index
                                    ) => (
                                      <div
                                        key={`${requirement.name}-${index}`}
                                        className="rounded-lg border p-4"
                                      >
                                        <p className="font-medium">
                                          {requirement.name}
                                        </p>

                                        <p className="mt-2 text-sm text-muted-foreground">
                                          {requirement.evidence}
                                        </p>
                                      </div>
                                    )
                                  )}
                                </div>
                              </div>
                            )
                          )}
                        </div>
                      ) : (
                        <EmptyState
                          title="No structured requirements available"
                          description="No explicit requirements were identified from the available job information."
                        />
                      )}

                      <div className="grid gap-4 md:grid-cols-2">
                        <RequirementList
                          title="Required Skills"
                          items={
                            intelligence.requiredSkills
                          }
                        />

                        <RequirementList
                          title="Experience Requirements"
                          items={
                            intelligence.experienceRequirements
                          }
                        />

                        <RequirementList
                          title="Education Requirements"
                          items={
                            intelligence.educationRequirements
                          }
                        />

                        <RequirementList
                          title="Certification Requirements"
                          items={
                            intelligence.certificationRequirements
                          }
                        />

                        <RequirementList
                          title="Language Requirements"
                          items={
                            intelligence.languageRequirements
                          }
                        />

                        <RequirementList
                          title="Required Industries"
                          items={
                            intelligence.requiredIndustries
                          }
                        />
                      </div>

                      <div className="rounded-lg border p-4">
                        <p className="text-sm text-muted-foreground">
                          Source
                        </p>

                        <p className="mt-1 font-medium">
                          {intelligence.source}
                        </p>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <EmptyState
              title="No Job Intelligence available"
              description="No evaluated opportunity currently contains structured job intelligence."
            />
          )}
        </section>

        <section className="space-y-4">
          <div>
            <h2 className="text-xl font-semibold">
              Opportunity ATS
            </h2>

            <p className="text-sm text-muted-foreground">
              ATS evidence for a specific job opportunity.
            </p>
          </div>

          {opportunity ? (
            <div className="grid gap-4 md:grid-cols-3">
              <MetricCard
                label="Opportunity ATS Score"
                value={opportunity.score}
              />

              <SkillList
                title="Matched Skills"
                skills={opportunity.matchedSkills}
              />

              <SkillList
                title="Missing Skills"
                skills={opportunity.missingSkills}
              />
            </div>
          ) : (
            <EmptyState
              title="No opportunity selected"
              description="Select or analyze a specific opportunity to view its Premium ATS evidence."
            />
          )}
        </section>

        <section className="space-y-4">
          <div>
            <h2 className="text-xl font-semibold">
              ATS Skill Summary
            </h2>

            <p className="text-sm text-muted-foreground">
              Summary of the available opportunity-level evidence.
            </p>
          </div>

          {summary ? (
            <div className="grid gap-4 md:grid-cols-2">
              <MetricCard
                label="Matched Skills"
                value={summary.matchedSkillCount}
              />

              <MetricCard
                label="Missing Skills"
                value={summary.missingSkillCount}
              />
            </div>
          ) : (
            <EmptyState
              title="No ATS summary available"
              description="There is not enough real opportunity-level ATS evidence to display this summary."
            />
          )}
        </section>
      </div>
    </main>
  );
}

function MetricCard({
  label,
  value,
}: {
  label: string;
  value: number;
}) {
  return (
    <div className="rounded-xl border bg-card p-5 shadow-sm">
      <p className="text-sm text-muted-foreground">
        {label}
      </p>

      <p className="mt-2 text-3xl font-bold">
        {value}
      </p>
    </div>
  );
}

function InfoCard({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-xl border bg-card p-5 shadow-sm">
      <p className="text-sm text-muted-foreground">
        {label}
      </p>

      <p className="mt-2 font-medium">
        {value}
      </p>
    </div>
  );
}

function RequirementList({
  title,
  items,
}: {
  title: string;
  items: string[];
}) {
  return (
    <div className="rounded-xl border bg-card p-5 shadow-sm">
      <p className="font-semibold">
        {title}
      </p>

      {items.length > 0 ? (
        <ul className="mt-3 space-y-2">
          {items.map((item, index) => (
            <li
              key={`${item}-${index}`}
              className="text-sm"
            >
              {item}
            </li>
          ))}
        </ul>
      ) : (
        <p className="mt-3 text-sm text-muted-foreground">
          No evidence available.
        </p>
      )}
    </div>
  );
}

function SkillList({
  title,
  skills,
}: {
  title: string;
  skills: string[];
}) {
  return (
    <div className="rounded-xl border bg-card p-5 shadow-sm">
      <p className="text-sm text-muted-foreground">
        {title}
      </p>

      {skills.length > 0 ? (
        <ul className="mt-3 space-y-2">
          {skills.map((skill) => (
            <li
              key={skill}
              className="text-sm"
            >
              {skill}
            </li>
          ))}
        </ul>
      ) : (
        <p className="mt-3 text-sm text-muted-foreground">
          No evidence available.
        </p>
      )}
    </div>
  );
}

function ListCard({
  title,
  items,
}: {
  title: string;
  items: string[];
}) {
  return (
    <div className="rounded-xl border bg-card p-5 shadow-sm">
      <p className="text-sm text-muted-foreground">
        {title}
      </p>

      {items.length > 0 ? (
        <ul className="mt-3 space-y-2">
          {items.map((item, index) => (
            <li
              key={`${item}-${index}`}
              className="text-sm"
            >
              {item}
            </li>
          ))}
        </ul>
      ) : (
        <p className="mt-3 text-sm text-muted-foreground">
          No evidence available.
        </p>
      )}
    </div>
  );
}

function EmptyState({
  title,
  description,
}: {
  title: string;
  description: string;
}) {
  return (
    <div className="rounded-xl border border-dashed p-6">
      <h3 className="font-semibold">
        {title}
      </h3>

      <p className="mt-1 text-sm text-muted-foreground">
        {description}
      </p>
    </div>
  );
}

function getWorkModeLabel(
  workMode:
    | "REMOTE"
    | "HYBRID"
    | "IN_PERSON"
    | "UNKNOWN"
): string {
  switch (workMode) {
    case "REMOTE":
      return "Remote";

    case "HYBRID":
      return "Hybrid";

    case "IN_PERSON":
      return "In person";

    default:
      return "Not specified";
  }
}

function getRequirementLabel(
  category: string
): string {
  switch (category) {
    case "SKILL":
      return "Skills";

    case "EXPERIENCE":
      return "Experience";

    case "EDUCATION":
      return "Education";

    case "CERTIFICATION":
      return "Certifications";

    case "LANGUAGE":
      return "Languages";

    case "INDUSTRY":
      return "Industry";

    case "OTHER":
      return "Other requirements";

    default:
      return category;
  }
}