
import { redirect } from "next/navigation";

import {
  getOrganizationMembers,
  getUserOrganizations,
} from "@/lib/enterprise/organizationService";

import {
  requireEnterprisePermission,
} from "@/lib/enterprise/enterpriseAuthorization";

import {
  createSupabaseServerAuth,
} from "@/lib/supabase/server";

import MemberManagement from "./MemberManagement";

export default async function EnterpriseMembersPage() {
  const supabase =
    await createSupabaseServerAuth();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const organizations =
    await getUserOrganizations(user.id);

  if (organizations.length === 0) {
    return (
      <main className="min-h-screen p-8">
        <div className="mx-auto max-w-7xl">
          <h1 className="text-3xl font-bold">
            Organization Members
          </h1>

          <p className="mt-4 text-gray-600">
            No tienes una organización Enterprise asociada
            a tu cuenta.
          </p>
        </div>
      </main>
    );
  }

  const organization =
    organizations[0];

  try {
    await requireEnterprisePermission(
      user.id,
      organization.id,
      "VIEW_MEMBERS"
    );
  } catch (error: unknown) {
    const message =
      error instanceof Error
        ? error.message
        : "Enterprise access denied";

    return (
      <main className="min-h-screen p-8">
        <div className="mx-auto max-w-7xl">
          <h1 className="text-3xl font-bold">
            Organization Members
          </h1>

          <p className="mt-4 text-red-600">
            {message}
          </p>
        </div>
      </main>
    );
  }

  const members =
    await getOrganizationMembers(
      user.id,
      organization.id
    );

  let canManageMembers = false;

  try {
    await requireEnterprisePermission(
      user.id,
      organization.id,
      "MANAGE_MEMBERS"
    );

    canManageMembers = true;
  } catch {
    canManageMembers = false;
  }

  return (
    <main className="min-h-screen bg-gray-50 p-8">
      <div className="mx-auto max-w-7xl">
        <header className="mb-8">
          <p className="text-sm font-medium text-gray-500">
            Enterprise
          </p>

          <h1 className="mt-1 text-3xl font-bold">
            Organization Members
          </h1>

          <p className="mt-2 text-gray-600">
            {organization.name}
          </p>
        </header>

        <MemberManagement
          organizationId={organization.id}
          members={members}
          canManageMembers={canManageMembers}
        />
      </div>
    </main>
  );
}
