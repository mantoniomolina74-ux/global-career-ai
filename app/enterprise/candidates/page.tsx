import { redirect } from "next/navigation";

import {
  getUserOrganizations,
  getOrganizationMembers,
} from "@/lib/enterprise/organizationService";

import {
  requireEnterprisePermission,
} from "@/lib/enterprise/enterpriseAuthorization";

import {
  createSupabaseServerAuth,
} from "@/lib/supabase/server";

const roleStyles: Record<string, string> = {
  OWNER:
    "border-violet-200 bg-violet-50 text-violet-700",
  ADMIN:
    "border-blue-200 bg-blue-50 text-blue-700",
  RECRUITER:
    "border-emerald-200 bg-emerald-50 text-emerald-700",
  VIEWER:
    "border-slate-200 bg-slate-100 text-slate-700",
};

function RoleBadge({ role }: { role: string }) {
  const styles =
    roleStyles[role] ??
    "border-slate-200 bg-slate-100 text-slate-700";

  return (
    <span
      className={`inline-flex items-center rounded-full border px-3 py-1 text-xs font-bold tracking-wide ${styles}`}
    >
      <span className="mr-2 h-2 w-2 rounded-full bg-current" />
      {role}
    </span>
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
    <div className="rounded-2xl border border-dashed border-slate-300 bg-white px-6 py-14 text-center">
      <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-100 text-slate-500">
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.7"
          className="h-7 w-7"
          aria-hidden="true"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M16 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"
          />
          <circle cx="10" cy="7" r="4" />
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M20 8v6m3-3h-6"
          />
        </svg>
      </div>

      <h3 className="mt-4 text-lg font-bold text-slate-900">
        {title}
      </h3>

      <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-slate-500">
        {description}
      </p>
    </div>
  );
}

export default async function EnterpriseCandidatesPage() {
  const supabase = await createSupabaseServerAuth();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const organizations = await getUserOrganizations(user.id);

  if (organizations.length === 0) {
    return (
      <main className="min-h-screen bg-slate-50 px-4 py-8 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <div className="rounded-2xl border border-slate-200 bg-white p-8 shadow-sm">
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-blue-600">
              Global Career AI · Enterprise
            </p>

            <h1 className="mt-3 text-3xl font-bold tracking-tight text-slate-900">
              Candidates
            </h1>

            <p className="mt-3 text-slate-600">
              No tienes una organización Enterprise asociada a tu cuenta.
            </p>
          </div>
        </div>
      </main>
    );
  }

  const organization = organizations[0];

  try {
    await requireEnterprisePermission(
      user.id,
      organization.id,
      "VIEW_CANDIDATE_INTELLIGENCE"
    );
  } catch (error: unknown) {
    const message =
      error instanceof Error
        ? error.message
        : "Enterprise access denied";

    return (
      <main className="min-h-screen bg-slate-50 px-4 py-8 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <div className="rounded-2xl border border-rose-200 bg-white p-8 shadow-sm">
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-blue-600">
              Global Career AI · Enterprise
            </p>

            <h1 className="mt-3 text-3xl font-bold tracking-tight text-slate-900">
              Candidates
            </h1>

            <div className="mt-6 rounded-xl border border-rose-200 bg-rose-50 p-4">
              <p className="text-sm font-semibold text-rose-800">
                Enterprise access denied
              </p>

              <p className="mt-1 text-sm text-rose-700">
                {message}
              </p>
            </div>
          </div>
        </div>
      </main>
    );
  }

  const members = await getOrganizationMembers(
    user.id,
    organization.id
  );

  return (
    <main className="min-h-screen bg-slate-50 px-4 py-8 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl space-y-8">
        <header className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-slate-950 via-blue-950 to-indigo-900 p-7 text-white shadow-xl sm:p-10">
          <div
            aria-hidden="true"
            className="absolute -right-16 -top-20 h-72 w-72 rounded-full bg-blue-400/10 blur-3xl"
          />

          <div
            aria-hidden="true"
            className="absolute -bottom-24 right-1/3 h-56 w-56 rounded-full bg-violet-400/10 blur-3xl"
          />

          <div className="relative">
            <div className="flex flex-wrap items-center gap-2">
              <span className="rounded-full border border-blue-300/30 bg-blue-400/10 px-3 py-1 text-xs font-bold uppercase tracking-[0.18em] text-blue-200">
                Enterprise
              </span>

              <span className="rounded-full border border-white/15 bg-white/5 px-3 py-1 text-xs font-medium text-slate-300">
                Organization directory
              </span>
            </div>

            <div className="mt-6 flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
              <div className="max-w-2xl">
                <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">
                  Candidates
                </h1>

                <p className="mt-3 text-sm leading-6 text-blue-100/80 sm:text-base">
                  Accede al directorio de miembros de tu organización
                  y consulta la inteligencia de candidatos disponible
                  para tu equipo.
                </p>

                <div className="mt-6 flex items-center gap-3">
                  <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-white/15 bg-white/10">
                    <svg
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="1.7"
                      className="h-6 w-6 text-blue-200"
                      aria-hidden="true"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M3 21h18M5 21V7l8-4v18M19 21V11l-6-4"
                      />
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M9 9v.01M9 13v.01M9 17v.01M15 12v.01M15 16v.01"
                      />
                    </svg>
                  </div>

                  <div>
                    <p className="text-xs font-medium text-blue-200/70">
                      Active organization
                    </p>

                    <p className="mt-1 text-base font-semibold text-white sm:text-lg">
                      {organization.name}
                    </p>
                  </div>
                </div>
              </div>

              <div className="grid min-w-[180px] grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-1">
                <div className="rounded-2xl border border-white/15 bg-white/[0.07] p-4 backdrop-blur-sm">
                  <p className="text-xs font-medium text-blue-200/80">
                    Organization members
                  </p>

                  <p className="mt-2 text-3xl font-bold tabular-nums">
                    {members.length}
                  </p>

                  <p className="mt-1 text-xs text-slate-300">
                    Registered members
                  </p>
                </div>

                <div className="rounded-2xl border border-emerald-300/20 bg-emerald-400/10 p-4">
                  <div className="flex items-center gap-2">
                    <span className="flex h-6 w-6 items-center justify-center rounded-full bg-emerald-400/20 text-emerald-300">
                      <svg
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        className="h-4 w-4"
                        aria-hidden="true"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="m5 12 4 4L19 6"
                        />
                      </svg>
                    </span>

                    <p className="text-xs font-semibold text-emerald-200">
                      Access authorized
                    </p>
                  </div>

                  <p className="mt-2 text-xs leading-5 text-emerald-100/80">
                    Candidate Intelligence permission verified.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </header>

        <section className="space-y-5">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.18em] text-blue-600">
                Talent directory
              </p>

              <h2 className="mt-2 text-2xl font-bold tracking-tight text-slate-900">
                Organization Members
              </h2>

              <p className="mt-2 text-sm leading-6 text-slate-500">
                Miembros reales registrados en la organización Enterprise.
                Selecciona un perfil para consultar su inteligencia disponible.
              </p>
            </div>

            <div className="inline-flex w-fit items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-medium text-slate-600 shadow-sm">
              <span className="h-2 w-2 rounded-full bg-emerald-500" />
              Live organization data
            </div>
          </div>

          {members.length === 0 ? (
            <EmptyState
              title="No registered members"
              description="Todavía no hay miembros registrados en esta organización. Cuando existan miembros, aparecerán aquí."
            />
          ) : (
            <div className="grid grid-cols-1 gap-5 xl:grid-cols-2">
              {members.map((member, index) => (
                <article
                  key={member.id}
                  className="group relative overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition-all duration-200 hover:-translate-y-1 hover:border-blue-200 hover:shadow-lg"
                >
                  <div className="h-1 bg-gradient-to-r from-blue-600 via-indigo-500 to-violet-500" />

                  <div className="p-5 sm:p-6">
                    <div className="flex flex-col gap-5 sm:flex-row sm:items-start sm:justify-between">
                      <div className="flex min-w-0 items-start gap-4">
                        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-100 to-indigo-100 text-blue-700 ring-1 ring-blue-200/70">
                          <svg
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="1.7"
                            className="h-6 w-6"
                            aria-hidden="true"
                          >
                            <circle cx="12" cy="8" r="4" />
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              d="M4 21v-2a8 8 0 0 1 16 0v2"
                            />
                          </svg>
                        </div>

                        <div className="min-w-0 flex-1">
                          <p className="text-xs font-semibold uppercase tracking-[0.15em] text-slate-400">
                            Organization member {index + 1}
                          </p>

                          <h3 className="mt-2 break-all text-sm font-bold leading-6 text-slate-900">
                            {member.user_id}
                          </h3>

                          <p className="mt-1 text-xs text-slate-500">
                            User ID
                          </p>
                        </div>
                      </div>

                      <div className="sm:pt-1">
                        <RoleBadge role={member.role} />
                      </div>
                    </div>

                    <div className="mt-6 grid grid-cols-1 gap-3 sm:grid-cols-2">
                      <div className="rounded-xl border border-slate-100 bg-slate-50/80 p-4">
                        <p className="text-xs font-medium text-slate-500">
                          Organization role
                        </p>

                        <p className="mt-2 text-sm font-bold text-slate-800">
                          {member.role}
                        </p>

                        <p className="mt-1 text-xs text-slate-500">
                          Assigned membership role
                        </p>
                      </div>

                      <div className="rounded-xl border border-slate-100 bg-slate-50/80 p-4">
                        <p className="text-xs font-medium text-slate-500">
                          Member since
                        </p>

                        <p className="mt-2 text-sm font-bold text-slate-800">
                          {new Date(
                            member.created_at
                          ).toLocaleDateString("es-MX")}
                        </p>

                        <p className="mt-1 text-xs text-slate-500">
                          Registration date
                        </p>
                      </div>
                    </div>

                    <div className="mt-5 border-t border-slate-100 pt-5">
                      <a
                        href={`/api/enterprise/organizations/${organization.id}/candidates/${member.user_id}/intelligence`}
                        className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-blue-700 px-4 py-3 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-blue-800 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 sm:w-auto"
                      >
                        View Candidate Intelligence

                        <svg
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="1.8"
                          className="h-4 w-4 transition-transform group-hover:translate-x-0.5"
                          aria-hidden="true"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            d="M5 12h14m-7-7 7 7-7 7"
                          />
                        </svg>
                      </a>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          )}
        </section>

        <footer className="flex flex-col gap-2 border-t border-slate-200 py-5 text-xs text-slate-500 sm:flex-row sm:items-center sm:justify-between">
          <p>Global Career AI · Enterprise Talent Intelligence</p>

          <p>
            Organization: {organization.name}
          </p>
        </footer>
      </div>
    </main>
  );
}