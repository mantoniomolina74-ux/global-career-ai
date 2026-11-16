
"use client";

import { useState } from "react";

type EnterpriseRole =
  | "OWNER"
  | "ADMIN"
  | "RECRUITER"
  | "VIEWER";

type OrganizationMember = {
  id: string;
  user_id: string;
  role: EnterpriseRole;
  created_at: string;
};

interface MemberManagementProps {
  organizationId: string;
  members: OrganizationMember[];
  canManageMembers: boolean;
}

const roleStyles: Record<EnterpriseRole, string> = {
  OWNER:
    "border-violet-200 bg-violet-50 text-violet-800",
  ADMIN:
    "border-blue-200 bg-blue-50 text-blue-800",
  RECRUITER:
    "border-emerald-200 bg-emerald-50 text-emerald-800",
  VIEWER:
    "border-slate-200 bg-slate-100 text-slate-700",
};

const roleDescriptions: Record<EnterpriseRole, string> = {
  OWNER: "Propietario de la organización",
  ADMIN: "Administración de la organización",
  RECRUITER: "Acceso a funciones de reclutamiento",
  VIEWER: "Acceso de consulta autorizado",
};

function RoleBadge({ role }: { role: EnterpriseRole }) {
  return (
    <span
      className={`inline-flex items-center rounded-full border px-3 py-1 text-xs font-bold tracking-wide ${roleStyles[role]}`}
    >
      {role}
    </span>
  );
}

export default function MemberManagement({
  organizationId,
  members: initialMembers,
  canManageMembers,
}: MemberManagementProps) {
  const [members, setMembers] =
    useState<OrganizationMember[]>(initialMembers);

  const [userId, setUserId] = useState("");
  const [role, setRole] =
    useState<EnterpriseRole>("VIEWER");

  const [loading, setLoading] = useState(false);
  const [updatingUserId, setUpdatingUserId] =
    useState<string | null>(null);
  const [removingUserId, setRemovingUserId] =
    useState<string | null>(null);

  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const ownerCount = members.filter(
    (member) => member.role === "OWNER"
  ).length;

  const administratorCount = members.filter(
    (member) => member.role === "ADMIN"
  ).length;

  const recruiterCount = members.filter(
    (member) => member.role === "RECRUITER"
  ).length;

  const viewerCount = members.filter(
    (member) => member.role === "VIEWER"
  ).length;

  async function handleAddMember(
    event: React.FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();

    setError(null);
    setSuccess(null);

    const trimmedUserId = userId.trim();

    if (!trimmedUserId) {
      setError("Debes proporcionar un User ID.");
      return;
    }

    setLoading(true);

    try {
      const response = await fetch(
        `/api/enterprise/organizations/${organizationId}/members`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            userId: trimmedUserId,
            role,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data?.error ||
            data?.message ||
            "No se pudo agregar el miembro."
        );
      }

      const member =
        data?.member ?? data?.data?.member;

      if (!member) {
        throw new Error(
          "La API no devolvió el miembro creado."
        );
      }

      setMembers((current) => [...current, member]);
      setUserId("");
      setRole("VIEWER");

      setSuccess("Miembro agregado correctamente.");
    } catch (error: unknown) {
      setError(
        error instanceof Error
          ? error.message
          : "Ocurrió un error al agregar el miembro."
      );
    } finally {
      setLoading(false);
    }
  }

  async function handleRoleChange(
    memberUserId: string,
    newRole: EnterpriseRole
  ) {
    setError(null);
    setSuccess(null);
    setUpdatingUserId(memberUserId);

    try {
      const response = await fetch(
        `/api/enterprise/organizations/${organizationId}/members`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            userId: memberUserId,
            role: newRole,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data?.error ||
            data?.message ||
            "No se pudo actualizar el rol."
        );
      }

      const updatedMember =
        data?.member ?? data?.data?.member;

      if (!updatedMember) {
        throw new Error(
          "La API no devolvió el miembro actualizado."
        );
      }

      setMembers((current) =>
        current.map((member) =>
          member.user_id === memberUserId
            ? updatedMember
            : member
        )
      );

      setSuccess("Rol actualizado correctamente.");
    } catch (error: unknown) {
      setError(
        error instanceof Error
          ? error.message
          : "Ocurrió un error al actualizar el rol."
      );
    } finally {
      setUpdatingUserId(null);
    }
  }

  async function handleRemoveMember(
    memberUserId: string
  ) {
    setError(null);
    setSuccess(null);

    const confirmed = window.confirm(
      `¿Deseas eliminar al usuario ${memberUserId} de la organización?`
    );

    if (!confirmed) {
      return;
    }

    setRemovingUserId(memberUserId);

    try {
      const response = await fetch(
        `/api/enterprise/organizations/${organizationId}/members`,
        {
          method: "DELETE",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            userId: memberUserId,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data?.error ||
            data?.message ||
            "No se pudo eliminar el miembro."
        );
      }

      setMembers((current) =>
        current.filter(
          (member) => member.user_id !== memberUserId
        )
      );

      setSuccess("Miembro eliminado correctamente.");
    } catch (error: unknown) {
      setError(
        error instanceof Error
          ? error.message
          : "Ocurrió un error al eliminar el miembro."
      );
    } finally {
      setRemovingUserId(null);
    }
  }

  return (
    <section className="space-y-8">
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-slate-950 via-blue-950 to-indigo-900 p-6 text-white shadow-xl sm:p-8">
        <div className="absolute -right-12 -top-16 h-56 w-56 rounded-full bg-blue-400/10 blur-3xl" />
        <div className="absolute -bottom-20 right-1/3 h-48 w-48 rounded-full bg-violet-400/10 blur-3xl" />

        <div className="relative">
          <div className="flex flex-col gap-5 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.2em] text-blue-300">
                Enterprise · Access Management
              </p>

              <h2 className="mt-3 text-3xl font-bold tracking-tight sm:text-4xl">
                Organization Members
              </h2>

              <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-300 sm:text-base">
                Administra los miembros de tu organización y
                consulta sus roles de acceso en un solo lugar.
              </p>
            </div>

            <div className="flex w-fit items-center gap-3 rounded-xl border border-white/15 bg-white/10 px-4 py-3 backdrop-blur-sm">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-400/20 text-blue-200">
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.7"
                  className="h-6 w-6"
                  aria-hidden="true"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2m16-13a4 4 0 0 1 0 8m4 5v-2a4 4 0 0 0-3-3.87M9 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8Z"
                  />
                </svg>
              </div>

              <div>
                <p className="text-xs text-slate-300">
                  Total members
                </p>
                <p className="text-2xl font-bold tabular-nums">
                  {members.length}
                </p>
              </div>
            </div>
          </div>

          <div className="mt-7 flex flex-wrap gap-2">
            <span className="rounded-full border border-white/15 bg-white/10 px-3 py-1.5 text-xs font-medium text-slate-200">
              {ownerCount} Owner{ownerCount !== 1 ? "s" : ""}
            </span>
            <span className="rounded-full border border-blue-300/25 bg-blue-400/15 px-3 py-1.5 text-xs font-medium text-blue-100">
              {administratorCount} Admin
              {administratorCount !== 1 ? "s" : ""}
            </span>
            <span className="rounded-full border border-emerald-300/25 bg-emerald-400/15 px-3 py-1.5 text-xs font-medium text-emerald-100">
              {recruiterCount} Recruiter
              {recruiterCount !== 1 ? "s" : ""}
            </span>
            <span className="rounded-full border border-slate-300/20 bg-slate-400/15 px-3 py-1.5 text-xs font-medium text-slate-200">
              {viewerCount} Viewer{viewerCount !== 1 ? "s" : ""}
            </span>
          </div>
        </div>
      </div>

      {canManageMembers && (
        <div className="overflow-hidden rounded-2xl border border-blue-100 bg-white shadow-sm">
          <div className="flex items-start gap-4 border-b border-blue-100 bg-gradient-to-r from-blue-50 via-white to-indigo-50 px-5 py-5 sm:px-7">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-blue-600 text-white shadow-md shadow-blue-600/20">
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.8"
                className="h-6 w-6"
                aria-hidden="true"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M12 5v14m-7-7h14"
                />
              </svg>
            </div>

            <div>
              <h3 className="text-lg font-bold text-slate-900">
                Add Member
              </h3>
              <p className="mt-1 text-sm leading-5 text-slate-600">
                Agrega un usuario existente y define su rol
                dentro de la organización Enterprise.
              </p>
            </div>
          </div>

          <form
            onSubmit={handleAddMember}
            className="grid gap-5 p-5 sm:grid-cols-2 sm:p-7"
          >
            <div>
              <label
                htmlFor="userId"
                className="block text-sm font-semibold text-slate-700"
              >
                User ID
              </label>

              <input
                id="userId"
                type="text"
                value={userId}
                onChange={(event) =>
                  setUserId(event.target.value)
                }
                placeholder="UUID del usuario existente"
                autoComplete="off"
                disabled={loading}
                className="mt-2 block w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-500/10 disabled:cursor-not-allowed disabled:opacity-60"
              />

              <p className="mt-2 text-xs text-slate-500">
                Introduce el identificador del usuario que
                deseas incorporar.
              </p>
            </div>

            <div>
              <label
                htmlFor="memberRole"
                className="block text-sm font-semibold text-slate-700"
              >
                Initial role
              </label>

              <select
                id="memberRole"
                value={role}
                onChange={(event) =>
                  setRole(
                    event.target.value as EnterpriseRole
                  )
                }
                disabled={loading}
                className="mt-2 block w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-500/10 disabled:cursor-not-allowed disabled:opacity-60"
              >
                <option value="VIEWER">VIEWER</option>
                <option value="RECRUITER">RECRUITER</option>
                <option value="ADMIN">ADMIN</option>

              </select>

              <p className="mt-2 text-xs text-slate-500">
                {roleDescriptions[role]}
              </p>
            </div>

            <div className="sm:col-span-2">
              <button
                type="submit"
                disabled={loading}
                className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-blue-700 to-indigo-700 px-5 py-3 text-sm font-bold text-white shadow-md shadow-blue-700/20 transition hover:from-blue-800 hover:to-indigo-800 focus:outline-none focus:ring-4 focus:ring-blue-500/20 disabled:cursor-not-allowed disabled:opacity-50 sm:w-auto"
              >
                {loading ? (
                  <>
                    <svg
                      className="h-4 w-4 animate-spin"
                      viewBox="0 0 24 24"
                      fill="none"
                      aria-hidden="true"
                    >
                      <circle
                        cx="12"
                        cy="12"
                        r="9"
                        stroke="currentColor"
                        strokeWidth="3"
                        className="opacity-25"
                      />
                      <path
                        d="M21 12a9 9 0 0 0-9-9"
                        stroke="currentColor"
                        strokeWidth="3"
                        strokeLinecap="round"
                      />
                    </svg>
                    Agregando miembro...
                  </>
                ) : (
                  <>
                    <span aria-hidden="true">+</span>
                    Add Member
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      )}

      {error && (
        <div
          role="alert"
          className="flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-800"
        >
          <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-red-100 font-bold text-red-700">
            !
          </span>
          <div>
            <p className="font-bold">No se pudo completar la operación</p>
            <p className="mt-1 leading-5">{error}</p>
          </div>
        </div>
      )}

      {success && (
        <div
          role="status"
          className="flex items-start gap-3 rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-800"
        >
          <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-emerald-100 font-bold text-emerald-700">
            ✓
          </span>
          <div>
            <p className="font-bold">Operación completada</p>
            <p className="mt-1 leading-5">{success}</p>
          </div>
        </div>
      )}

      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="flex flex-col gap-3 border-b border-slate-200 bg-gradient-to-r from-slate-50 to-white px-5 py-5 sm:flex-row sm:items-center sm:justify-between sm:px-7">
          <div>
            <h3 className="text-xl font-bold tracking-tight text-slate-900">
              Members Directory
            </h3>
            <p className="mt-1 text-sm text-slate-600">
              Miembros registrados y sus niveles de acceso.
            </p>
          </div>

          <span className="inline-flex w-fit items-center gap-2 rounded-full border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-600">
            <span className="h-2 w-2 rounded-full bg-emerald-500" />
            {members.length} registro
            {members.length !== 1 ? "s" : ""}
          </span>
        </div>

        {members.length > 0 ? (
          <div className="divide-y divide-slate-100">
            {members.map((member) => {
              const isUpdating =
                updatingUserId === member.user_id;

              const isRemoving =
                removingUserId === member.user_id;

              const isBusy = isUpdating || isRemoving;

              return (
                <article
                  key={member.id}
                  className="px-5 py-5 transition-colors hover:bg-slate-50/80 sm:px-7"
                >
                  <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                    <div className="flex min-w-0 items-start gap-4">
                      <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl border border-indigo-100 bg-gradient-to-br from-indigo-50 to-blue-100 text-lg font-bold text-indigo-700">
                        {member.role === "OWNER"
                          ? "O"
                          : member.role === "ADMIN"
                            ? "A"
                            : member.role === "RECRUITER"
                              ? "R"
                              : "V"}
                      </div>

                      <div className="min-w-0 flex-1">
                        <p className="break-all text-sm font-bold leading-6 text-slate-900">
                          {member.user_id}
                        </p>

                        <p className="mt-1 text-xs leading-5 text-slate-500">
                          User ID
                        </p>

                        <div className="mt-3 flex flex-wrap items-center gap-2">
                          <RoleBadge role={member.role} />
                          <span className="text-xs text-slate-500">
                            {roleDescriptions[member.role]}
                          </span>
                        </div>

                        <p className="mt-3 text-xs text-slate-500">
                          <span className="font-semibold text-slate-600">
                            Member since:
                          </span>{" "}
                          {new Date(
                            member.created_at
                          ).toLocaleDateString()}
                        </p>
                      </div>
                    </div>

                    {canManageMembers ? (
                      <div className="flex flex-col gap-2 sm:flex-row sm:items-center lg:shrink-0">
                        <label
                          htmlFor={`role-${member.id}`}
                          className="sr-only"
                        >
                          Role for {member.user_id}
                        </label>

                        <select
                          id={`role-${member.id}`}
                          value={member.role}
                          onChange={(event) =>
                            handleRoleChange(
                              member.user_id,
                              event.target.value as EnterpriseRole
                            )
                          }
                          disabled={isBusy}
                          aria-label={`Role for ${member.user_id}`}
                          className="min-w-36 rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm font-semibold text-slate-700 outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 disabled:cursor-not-allowed disabled:opacity-50"
                        >
                          <option value="VIEWER">VIEWER</option>
                          <option value="RECRUITER">RECRUITER</option>
                          <option value="ADMIN">ADMIN</option>

                        </select>

                        <button
                          type="button"
                          onClick={() =>
                            handleRemoveMember(member.user_id)
                          }
                          disabled={isBusy}
                          className="inline-flex items-center justify-center gap-2 rounded-xl border border-red-200 bg-white px-4 py-2.5 text-sm font-semibold text-red-700 transition hover:border-red-300 hover:bg-red-50 focus:outline-none focus:ring-4 focus:ring-red-500/10 disabled:cursor-not-allowed disabled:opacity-50"
                        >
                          {isRemoving
                            ? "Eliminando..."
                            : isUpdating
                              ? "Actualizando..."
                              : "Remove"}
                        </button>
                      </div>
                    ) : (
                      <div className="lg:shrink-0">
                        <p className="text-xs font-medium text-slate-500">
                          Assigned role
                        </p>
                        <div className="mt-2">
                          <RoleBadge role={member.role} />
                        </div>
                      </div>
                    )}
                  </div>
                </article>
              );
            })}
          </div>
        ) : (
          <div className="px-6 py-14 text-center">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-slate-100 text-slate-500">
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.5"
                className="h-8 w-8"
                aria-hidden="true"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2m16-13a4 4 0 0 1 0 8m4 5v-2a4 4 0 0 0-3-3.87M9 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8Z"
                />
              </svg>
            </div>

            <h4 className="mt-4 text-base font-bold text-slate-900">
              No organization members
            </h4>
            <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-slate-500">
              No hay miembros registrados para mostrar.
              {canManageMembers
                ? " Puedes agregar un usuario existente desde el formulario superior."
                : ""}
            </p>
          </div>
        )}
      </div>
    </section>
  );
}
