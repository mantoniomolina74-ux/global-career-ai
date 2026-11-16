
import { notFound, redirect } from "next/navigation";

import { createSupabaseServerAuth } from "@/lib/supabase/server";
import {
  getUserOrganizations,
  getOrganizationMember,
} from "@/lib/enterprise/organizationService";
import { requireEnterprisePermission } from "@/lib/enterprise/enterpriseAuthorization";
import { getCandidateIntelligence } from "@/lib/enterprise/candidateIntelligenceService";

type PageProps = {
  params: Promise<{
    candidateUserId: string;
  }>;
};

export default async function CandidateDetailPage({
  params,
}: PageProps) {
  const { candidateUserId } = await params;

  const supabase = await createSupabaseServerAuth();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const organizations = await getUserOrganizations(user.id);

  if (organizations.length === 0) {
    notFound();
  }

  const organization = organizations[0];

  await requireEnterprisePermission(
    user.id,
    organization.id,
    "VIEW_CANDIDATE_INTELLIGENCE",
  );

  const member = await getOrganizationMember(
    organization.id,
    candidateUserId,
  );

  if (!member) {
    notFound();
  }

  const intelligence = await getCandidateIntelligence(
    candidateUserId,
  );

  if (!intelligence) {
    notFound();
  }

  const { profile, careerLevel, applications, ats } = intelligence;

  return (
    <main className="min-h-screen bg-slate-100 px-4 py-8 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl space-y-8">
        <header className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-slate-950 via-slate-900 to-blue-950 p-6 text-white shadow-xl sm:p-8">
          <div className="pointer-events-none absolute -right-16 -top-24 h-72 w-72 rounded-full bg-blue-500/15 blur-3xl" />
          <div className="pointer-events-none absolute -bottom-24 right-1/3 h-48 w-48 rounded-full bg-violet-500/10 blur-3xl" />

          <div className="relative">
            <div className="flex flex-wrap items-center gap-2">
              <span className="rounded-full border border-blue-300/30 bg-blue-400/10 px-3 py-1 text-xs font-semibold uppercase tracking-widest text-blue-200">
                Enterprise Intelligence
              </span>
              <span className="rounded-full border border-white/15 bg-white/5 px-3 py-1 text-xs font-medium text-slate-300">
                Candidate Profile
              </span>
            </div>

            <div className="mt-7 flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
              <div className="min-w-0">
                <p className="text-sm font-medium text-blue-200">
                  {organization.name}
                </p>

                <h1 className="mt-2 break-words text-3xl font-bold tracking-tight sm:text-4xl">
                  {profile.fullName ?? "Candidate"}
                </h1>

                <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-300">
                  Candidate profile, recruitment history, ATS results
                  and evidence-based candidate-to-job intelligence.
                </p>
              </div>

              <div className="min-w-52 rounded-xl border border-white/15 bg-white/5 p-4 backdrop-blur-sm">
                <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                  Career Level
                </p>
                <p className="mt-2 text-2xl font-bold text-white">
                  {careerLevel}
                </p>
                <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-white/10">
                  <div className="h-full w-full rounded-full bg-gradient-to-r from-blue-400 to-violet-400" />
                </div>
              </div>
            </div>

            <div className="mt-7 border-t border-white/10 pt-4">
              <p className="break-all text-xs text-slate-400">
                Candidate ID: {candidateUserId}
              </p>
            </div>
          </div>
        </header>

        <section className="space-y-4">
          <SectionHeading
            eyebrow="Recruitment intelligence"
            title="ATS Performance"
            description="Current ATS availability and results returned by the existing intelligence service."
          />

          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
            <MetricCard
              label="ATS Availability"
              value={ats.available ? "Available" : "Unavailable"}
              description={
                ats.available
                  ? "ATS results are available"
                  : "No ATS results currently available"
              }
              color={ats.available ? "emerald" : "amber"}
            />

            <MetricCard
              label="Average ATS"
              value={
                ats.averageScore !== null
                  ? String(ats.averageScore)
                  : "N/A"
              }
              description="Average score provided by the ATS service"
              color="blue"
            />

            <MetricCard
              label="ATS Results"
              value={String(ats.results.length)}
              description="Results available for this candidate"
              color="violet"
            />
          </div>
        </section>

        <section className="space-y-4">
          <SectionHeading
            eyebrow="Candidate overview"
            title="Professional Profile"
            description="A structured view of the candidate's available professional information."
          />

          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
            <ProfileCard
              label="Country"
              value={profile.country}
              color="blue"
            />
            <ProfileCard
              label="City"
              value={profile.city}
              color="violet"
            />
            <ProfileCard
              label="Profession"
              value={profile.profession}
              color="emerald"
            />
            <ProfileCard
              label="Experience"
              value={
                profile.experienceYears !== null &&
                profile.experienceYears !== undefined
                  ? `${profile.experienceYears} years`
                  : "Not available"
              }
              color="amber"
            />
            <ProfileCard
              label="English Level"
              value={profile.englishLevel}
              color="blue"
            />
            <ProfileCard
              label="Target Industry"
              value={profile.targetIndustry}
              color="violet"
            />
          </div>
        </section>

        <section className="space-y-4">
          <SectionHeading
            eyebrow="Employment history"
            title="Applications"
            description={`${applications.length} application${applications.length === 1 ? "" : "s"} returned by the current service.`}
          />

          {applications.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-slate-300 bg-white px-6 py-12 text-center">
              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-slate-100 text-xl text-slate-500">
                —
              </div>
              <h3 className="mt-4 font-semibold text-slate-800">
                No applications found
              </h3>
              <p className="mt-1 text-sm text-slate-500">
                No application records are currently available for this candidate.
              </p>
            </div>
          ) : (
            <div className="space-y-5">
              {applications.map((application, index) => (
                <article
                  key={application.id}
                  className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition-shadow hover:shadow-md"
                >
                  <div className="h-1 bg-gradient-to-r from-blue-600 via-violet-500 to-cyan-400" />

                  <div className="p-5 sm:p-7">
                    <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
                      <div className="flex min-w-0 gap-4">
                        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-sm font-bold text-blue-700 ring-1 ring-blue-100">
                          {String(index + 1).padStart(2, "0")}
                        </div>

                        <div className="min-w-0">
                          <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                            Application
                          </p>
                          <h3 className="mt-1 break-words text-xl font-bold text-slate-900">
                            {application.position}
                          </h3>
                          <p className="mt-1 font-medium text-slate-600">
                            {application.company}
                          </p>
                          <p className="mt-2 text-sm text-slate-500">
                            {application.country}
                          </p>
                        </div>
                      </div>

                      <div className="flex shrink-0 flex-col items-start gap-2 lg:items-end">
                        <span className="inline-flex rounded-full border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs font-semibold text-slate-700">
                          {application.status}
                        </span>
                        <p className="text-xs text-slate-500">
                          {application.application_date}
                        </p>
                      </div>
                    </div>

                    <CandidateJobIntelligenceSection
                      intelligence={
                        application.candidateJobIntelligence
                      }
                    />
                  </div>
                </article>
              ))}
            </div>
          )}
        </section>

        <section className="space-y-4">
          <SectionHeading
            eyebrow="Skills assessment"
            title="ATS Skills Intelligence"
            description="Skills identified as matched or missing by the existing ATS results."
          />

          <div className="grid gap-5 xl:grid-cols-2">
            <SkillList
              title="Matched Skills"
              subtitle="Skills reported as matched"
              skills={ats.matchedSkills}
              color="emerald"
            />

            <SkillList
              title="Missing Skills"
              subtitle="Skills reported as missing"
              skills={ats.missingSkills}
              color="rose"
            />
          </div>
        </section>

        <footer className="rounded-xl border border-slate-200 bg-white px-5 py-4">
          <p className="text-xs leading-5 text-slate-500">
            Enterprise candidate intelligence · Information shown is
            derived from the existing candidate profile, applications
            and ATS services.
          </p>
        </footer>
      </div>
    </main>
  );
}

function SectionHeading({
  eyebrow,
  title,
  description,
}: {
  eyebrow: string;
  title: string;
  description: string;
}) {
  return (
    <div>
      <p className="text-xs font-bold uppercase tracking-[0.18em] text-blue-700">
        {eyebrow}
      </p>
      <h2 className="mt-1 text-2xl font-bold tracking-tight text-slate-900">
        {title}
      </h2>
      <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-500">
        {description}
      </p>
    </div>
  );
}

function MetricCard({
  label,
  value,
  description,
  color,
}: {
  label: string;
  value: string;
  description: string;
  color: "blue" | "violet" | "emerald" | "amber";
}) {
  const styles = {
    blue: {
      border: "border-t-blue-500",
      icon: "bg-blue-50 text-blue-700 ring-blue-100",
      glow: "from-blue-500/5",
    },
    violet: {
      border: "border-t-violet-500",
      icon: "bg-violet-50 text-violet-700 ring-violet-100",
      glow: "from-violet-500/5",
    },
    emerald: {
      border: "border-t-emerald-500",
      icon: "bg-emerald-50 text-emerald-700 ring-emerald-100",
      glow: "from-emerald-500/5",
    },
    amber: {
      border: "border-t-amber-500",
      icon: "bg-amber-50 text-amber-700 ring-amber-100",
      glow: "from-amber-500/5",
    },
  }[color];

  return (
    <div
      className={`relative overflow-hidden rounded-2xl border border-t-4 border-slate-200 ${styles.border} bg-gradient-to-br ${styles.glow} to-white p-5 shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md sm:p-6`}
    >
      <div className="flex items-start justify-between gap-3">
        <p className="text-sm font-semibold text-slate-600">
          {label}
        </p>
        <span
          className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl text-sm font-bold ring-1 ${styles.icon}`}
        >
          {color === "blue"
            ? "A"
            : color === "violet"
              ? "R"
              : color === "emerald"
                ? "✓"
                : "!"}
        </span>
      </div>

      <p className="mt-5 break-words text-3xl font-bold tracking-tight text-slate-950">
        {value}
      </p>
      <p className="mt-2 text-xs leading-5 text-slate-500">
        {description}
      </p>
    </div>
  );
}

function ProfileCard({
  label,
  value,
  color,
}: {
  label: string;
  value: string | number | null | undefined;
  color: "blue" | "violet" | "emerald" | "amber";
}) {
  const accent = {
    blue: "bg-blue-500",
    violet: "bg-violet-500",
    emerald: "bg-emerald-500",
    amber: "bg-amber-500",
  }[color];

  return (
    <div className="group flex min-h-28 gap-4 rounded-xl border border-slate-200 bg-white p-5 shadow-sm transition-all duration-200 hover:border-slate-300 hover:shadow-md">
      <div className={`w-1 shrink-0 rounded-full ${accent}`} />
      <div className="min-w-0 flex-1">
        <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">
          {label}
        </p>
        <p className="mt-2 break-words text-base font-semibold leading-6 text-slate-800">
          {value ?? "Not available"}
        </p>
      </div>
    </div>
  );
}

function CandidateJobIntelligenceSection({
  intelligence,
}: {
  intelligence:
    | NonNullable<
        Awaited<
          ReturnType<
            typeof import("@/lib/enterprise/candidateIntelligenceService")
              .getCandidateIntelligence
          >
        >
      >["applications"][number]["candidateJobIntelligence"]
    | null;
}) {
  if (!intelligence) {
    return null;
  }

  return (
    <div className="mt-7 overflow-hidden rounded-2xl border border-slate-200 bg-slate-50">
      <div className="border-b border-slate-200 bg-white p-5 sm:p-6">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <p className="text-xs font-bold uppercase tracking-widest text-violet-700">
              Requirement analysis
            </p>
            <h4 className="mt-1 text-lg font-bold text-slate-900">
              Candidate ↔ Job Intelligence
            </h4>
            <p className="mt-1 text-sm leading-5 text-slate-500">
              Evidence-based evaluation of the requirements for this application.
            </p>
          </div>

          <span className="inline-flex max-w-full self-start break-words rounded-lg border border-violet-100 bg-violet-50 px-3 py-2 text-sm font-semibold text-violet-800">
            {intelligence.job.title ?? "Job"}
          </span>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3 p-4 sm:grid-cols-4 sm:p-5">
        <IntelligenceMetricCard
          label="Direct"
          description="Direct evidence"
          value={intelligence.matchedRequirements}
          color="emerald"
        />
        <IntelligenceMetricCard
          label="Transferable"
          description="Transferable evidence"
          value={intelligence.transferableRequirements}
          color="blue"
        />
        <IntelligenceMetricCard
          label="Partial"
          description="Partial evidence"
          value={intelligence.partialRequirements}
          color="amber"
        />
        <IntelligenceMetricCard
          label="No Evidence"
          description="Evidence not found"
          value={intelligence.missingRequirements}
          color="rose"
        />
      </div>

      <div className="px-4 pb-5 sm:px-5">
        <div className="overflow-hidden rounded-xl border border-slate-200 bg-white">
          <div className="border-b border-slate-200 px-4 py-3">
            <h5 className="font-semibold text-slate-800">
              Requirement evidence
            </h5>
            <p className="mt-1 text-xs text-slate-500">
              Each row shows the requirement, its category, the match classification and supporting evidence.
            </p>
          </div>

          {intelligence.evaluations.length === 0 ? (
            <p className="p-5 text-sm text-slate-500">
              No requirement evaluations are available for this application.
            </p>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-[760px] w-full text-left text-sm">
                <thead className="bg-slate-50">
                  <tr>
                    <th className="px-4 py-3 font-semibold text-slate-600">
                      Requirement
                    </th>
                    <th className="px-4 py-3 font-semibold text-slate-600">
                      Category
                    </th>
                    <th className="px-4 py-3 font-semibold text-slate-600">
                      Match
                    </th>
                    <th className="px-4 py-3 font-semibold text-slate-600">
                      Evidence
                    </th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-slate-100">
                  {intelligence.evaluations.map(
                    (evaluation, index) => (
                      <tr
                        key={`${evaluation.requirement.name}-${index}`}
                        className="transition-colors hover:bg-slate-50/80"
                      >
                        <td className="max-w-xs px-4 py-4 align-top font-semibold text-slate-800">
                          {evaluation.requirement.name}
                        </td>

                        <td className="px-4 py-4 align-top text-slate-600">
                          {evaluation.requirement.category}
                        </td>

                        <td className="px-4 py-4 align-top">
                          <MatchBadge match={evaluation.match} />
                        </td>

                        <td className="max-w-md px-4 py-4 align-top text-slate-600">
                          {evaluation.evidence.length === 0 ? (
                            <span className="inline-flex rounded-lg bg-rose-50 px-2.5 py-1.5 text-xs font-medium text-rose-700 ring-1 ring-rose-100">
                              No evidence
                            </span>
                          ) : (
                            <div className="space-y-2">
                              {evaluation.evidence.map(
                                (evidence, evidenceIndex) => (
                                  <div
                                    key={`${evidence.skill}-${evidenceIndex}`}
                                    className="rounded-lg bg-emerald-50/70 px-3 py-2 ring-1 ring-emerald-100"
                                  >
                                    <p className="font-semibold text-emerald-900">
                                      {evidence.skill}
                                    </p>
                                    {evidence.details ? (
                                      <p className="mt-1 break-words text-xs leading-5 text-slate-600">
                                        {evidence.details}
                                      </p>
                                    ) : null}
                                  </div>
                                ),
                              )}
                            </div>
                          )}
                        </td>
                      </tr>
                    ),
                  )}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function IntelligenceMetricCard({
  label,
  description,
  value,
  color,
}: {
  label: string;
  description: string;
  value: number;
  color: "emerald" | "blue" | "amber" | "rose";
}) {
  const styles = {
    emerald: {
      border: "border-emerald-200",
      background: "bg-emerald-50",
      text: "text-emerald-800",
      number: "text-emerald-950",
      marker: "bg-emerald-500",
    },
    blue: {
      border: "border-blue-200",
      background: "bg-blue-50",
      text: "text-blue-800",
      number: "text-blue-950",
      marker: "bg-blue-500",
    },
    amber: {
      border: "border-amber-200",
      background: "bg-amber-50",
      text: "text-amber-800",
      number: "text-amber-950",
      marker: "bg-amber-500",
    },
    rose: {
      border: "border-rose-200",
      background: "bg-rose-50",
      text: "text-rose-800",
      number: "text-rose-950",
      marker: "bg-rose-500",
    },
  }[color];

  return (
    <div className={`rounded-xl border ${styles.border} ${styles.background} p-4`}>
      <div className="flex items-center gap-2">
        <span className={`h-2 w-2 shrink-0 rounded-full ${styles.marker}`} />
        <p className={`text-xs font-bold uppercase tracking-wider ${styles.text}`}>
          {label}
        </p>
      </div>
      <p className={`mt-3 text-3xl font-bold tracking-tight ${styles.number}`}>
        {value}
      </p>
      <p className="mt-1 text-xs leading-5 text-slate-500">
        {description}
      </p>
    </div>
  );
}

function MatchBadge({ match }: { match: string }) {
  const normalized = match.toLowerCase();

  const styles = normalized.includes("transfer")
    ? "border-blue-200 bg-blue-50 text-blue-800"
    : normalized.includes("partial")
      ? "border-amber-200 bg-amber-50 text-amber-800"
      : normalized.includes("missing") ||
          normalized.includes("no evidence") ||
          normalized.includes("none")
        ? "border-rose-200 bg-rose-50 text-rose-800"
        : normalized.includes("direct") ||
            normalized.includes("matched")
          ? "border-emerald-200 bg-emerald-50 text-emerald-800"
          : "border-slate-200 bg-slate-50 text-slate-700";

  return (
    <span
      className={`inline-flex whitespace-nowrap rounded-full border px-2.5 py-1 text-xs font-semibold ${styles}`}
    >
      {match}
    </span>
  );
}

function SkillList({
  title,
  subtitle,
  skills,
  color,
}: {
  title: string;
  subtitle: string;
  skills: string[];
  color: "emerald" | "rose";
}) {
  const styles = color === "emerald"
    ? {
        border: "border-t-emerald-500",
        badge: "border-emerald-200 bg-emerald-50 text-emerald-800",
        count: "bg-emerald-100 text-emerald-800",
        empty: "bg-emerald-50 text-emerald-800",
      }
    : {
        border: "border-t-rose-500",
        badge: "border-rose-200 bg-rose-50 text-rose-800",
        count: "bg-rose-100 text-rose-800",
        empty: "bg-rose-50 text-rose-800",
      };

  return (
    <div className={`rounded-2xl border border-t-4 ${styles.border} border-slate-200 bg-white p-5 shadow-sm sm:p-6`}>
      <div className="flex items-start justify-between gap-3">
        <div>
          <h3 className="text-lg font-bold text-slate-900">
            {title}
          </h3>
          <p className="mt-1 text-sm text-slate-500">
            {subtitle}
          </p>
        </div>

        <span className={`inline-flex min-w-9 items-center justify-center rounded-lg px-2.5 py-1.5 text-sm font-bold ${styles.count}`}>
          {skills.length}
        </span>
      </div>

      {skills.length === 0 ? (
        <div className={`mt-5 rounded-xl p-4 text-sm ${styles.empty}`}>
          No data available.
        </div>
      ) : (
        <div className="mt-5 flex flex-wrap gap-2">
          {skills.map((skill, index) => (
            <span
              key={`${skill}-${index}`}
              className={`inline-flex max-w-full break-words rounded-lg border px-3 py-2 text-sm font-medium ${styles.badge}`}
            >
              {skill}
            </span>
          ))}
        </div>
      )}
    </div>
  );
}
