
import { supabaseServer } from "@/lib/supabase-server";

export type EnterpriseRole =
  | "OWNER"
  | "ADMIN"
  | "RECRUITER"
  | "VIEWER";

export interface EnterpriseOrganization {
  id: string;
  name: string;
  created_at: string;
  updated_at: string;
}

export interface EnterpriseOrganizationMember {
  id: string;
  organization_id: string;
  user_id: string;
  role: EnterpriseRole;
  created_at: string;
  updated_at: string;
}

function normalizeOrganizationName(name: string): string {
  const normalized = name.trim();

  if (!normalized) {
    throw new Error("Organization name is required");
  }

  if (normalized.length > 120) {
    throw new Error(
      "Organization name must be 120 characters or less"
    );
  }

  return normalized;
}

function assertValidRole(
  role: string
): asserts role is EnterpriseRole {
  if (
    ![
      "OWNER",
      "ADMIN",
      "RECRUITER",
      "VIEWER",
    ].includes(role)
  ) {
    throw new Error("Invalid enterprise role");
  }
}

type AssignableEnterpriseRole = Exclude<
  EnterpriseRole,
  "OWNER"
>;

function assertAssignableRole(
  role: EnterpriseRole
): asserts role is AssignableEnterpriseRole {
  if (role === "OWNER") {
    throw new Error(
      "OWNER role requires a separate ownership transfer operation"
    );
  }
}

export async function createEnterpriseOrganization(
  userId: string,
  name: string
): Promise<EnterpriseOrganization> {
  if (!userId) {
    throw new Error("User context is required");
  }

  const organizationName =
    normalizeOrganizationName(name);

  const {
    data: organization,
    error: organizationError,
  } = await supabaseServer
    .from("organizations")
    .insert({
      name: organizationName,
    })
    .select(
      "id, name, created_at, updated_at"
    )
    .single();

  if (organizationError || !organization) {
    throw new Error(
      organizationError?.message ??
        "Failed to create organization"
    );
  }

  const { error: membershipError } =
    await supabaseServer
      .from("organization_members")
      .insert({
        organization_id: organization.id,
        user_id: userId,
        role: "OWNER",
      });

  if (membershipError) {
    await supabaseServer
      .from("organizations")
      .delete()
      .eq("id", organization.id);

    throw new Error(
      membershipError.message ??
        "Failed to create organization membership"
    );
  }

  return organization as EnterpriseOrganization;
}

export async function getUserOrganizations(
  userId: string
): Promise<EnterpriseOrganization[]> {
  if (!userId) {
    throw new Error("User context is required");
  }

  const { data, error } =
    await supabaseServer
      .from("organization_members")
      .select(
        `
        organization_id,
        organizations (
          id,
          name,
          created_at,
          updated_at
        )
      `
      )
      .eq("user_id", userId);

  if (error) {
    throw new Error(
      error.message ??
        "Failed to retrieve user organizations"
    );
  }

  return (data ?? [])
    .map(
      (membership) =>
        membership.organizations
    )
    .filter(Boolean) as unknown as EnterpriseOrganization[];
}

export async function getOrganizationMembers(
  userId: string,
  organizationId: string
): Promise<EnterpriseOrganizationMember[]> {
  if (!userId || !organizationId) {
    throw new Error(
      "User and organization context are required"
    );
  }

  const {
    data: membership,
    error: membershipError,
  } = await supabaseServer
    .from("organization_members")
    .select(
      "id, organization_id, user_id, role, created_at, updated_at"
    )
    .eq("organization_id", organizationId)
    .eq("user_id", userId)
    .maybeSingle();

  if (membershipError) {
    throw new Error(
      membershipError.message ??
        "Failed to verify organization membership"
    );
  }

  if (!membership) {
    throw new Error(
      "User is not a member of this organization"
    );
  }

  const { data, error } =
    await supabaseServer
      .from("organization_members")
      .select(
        "id, organization_id, user_id, role, created_at, updated_at"
      )
      .eq(
        "organization_id",
        organizationId
      )
      .order("created_at", {
        ascending: true,
      });

  if (error) {
    throw new Error(
      error.message ??
        "Failed to retrieve organization members"
    );
  }

  return (data ??
    []) as EnterpriseOrganizationMember[];
}

/**
 * Resolves one specific member inside an organization.
 *
 * Used by Enterprise features that operate on a
 * candidate/member belonging to the requesting organization.
 *
 * This function does not grant authorization by itself.
 * The requesting user's organization membership and
 * permissions must be validated separately.
 */
export async function getOrganizationMember(
  organizationId: string,
  userId: string
): Promise<EnterpriseOrganizationMember | null> {
  if (!organizationId || !userId) {
    throw new Error(
      "Organization and user context are required"
    );
  }

  const { data, error } =
    await supabaseServer
      .from("organization_members")
      .select(
        "id, organization_id, user_id, role, created_at, updated_at"
      )
      .eq(
        "organization_id",
        organizationId
      )
      .eq("user_id", userId)
      .maybeSingle();

  if (error) {
    throw new Error(
      error.message ??
        "Failed to retrieve organization member"
    );
  }

  if (!data) {
    return null;
  }

  const role = String(data.role);
  assertValidRole(role);

  return {
    ...data,
    role,
  } as EnterpriseOrganizationMember;
}

export async function getOrganizationMemberRole(
  userId: string,
  organizationId: string
): Promise<EnterpriseRole | null> {
  if (!userId || !organizationId) {
    throw new Error(
      "User and organization context are required"
    );
  }

  const { data, error } =
    await supabaseServer
      .from("organization_members")
      .select("role")
      .eq("organization_id", organizationId)
      .eq("user_id", userId)
      .maybeSingle();

  if (error) {
    throw new Error(
      error.message ??
        "Failed to retrieve organization role"
    );
  }

  if (!data) {
    return null;
  }

  const role = String(data.role);
  assertValidRole(role);

  return role;
}

export async function assertOrganizationMembership(
  userId: string,
  organizationId: string
): Promise<EnterpriseOrganizationMember> {
  if (!userId || !organizationId) {
    throw new Error(
      "User and organization context are required"
    );
  }

  const { data, error } =
    await supabaseServer
      .from("organization_members")
      .select(
        "id, organization_id, user_id, role, created_at, updated_at"
      )
      .eq("organization_id", organizationId)
      .eq("user_id", userId)
      .maybeSingle();

  if (error) {
    throw new Error(
      error.message ??
        "Failed to verify organization membership"
    );
  }

  if (!data) {
    throw new Error(
      "User is not a member of this organization"
    );
  }

  const role = String(data.role);
  assertValidRole(role);

  return {
    ...data,
    role,
  } as EnterpriseOrganizationMember;
}

export async function addOrganizationMember(
  requestingUserId: string,
  organizationId: string,
  userId: string,
  role: EnterpriseRole
): Promise<EnterpriseOrganizationMember> {
  if (
    !requestingUserId ||
    !organizationId ||
    !userId
  ) {
    throw new Error(
      "User and organization context are required"
    );
  }

  assertValidRole(role);
  assertAssignableRole(role);

  const {
    data: membership,
    error,
  } = await supabaseServer
    .from("organization_members")
    .insert({
      organization_id: organizationId,
      user_id: userId,
      role,
    })
    .select(
      "id, organization_id, user_id, role, created_at, updated_at"
    )
    .single();

  if (error || !membership) {
    throw new Error(
      error?.message ??
        "Failed to add organization member"
    );
  }

  return {
    ...membership,
    role: String(
      membership.role
    ) as EnterpriseRole,
  } as EnterpriseOrganizationMember;
}

export async function updateOrganizationMemberRole(
  organizationId: string,
  userId: string,
  role: EnterpriseRole
): Promise<EnterpriseOrganizationMember> {
  if (!organizationId || !userId) {
    throw new Error(
      "Organization and user context are required"
    );
  }

  assertValidRole(role);
  assertAssignableRole(role);

  const {
    data: membership,
    error,
  } = await supabaseServer
    .from("organization_members")
    .update({
      role,
      updated_at:
        new Date().toISOString(),
    })
    .eq(
      "organization_id",
      organizationId
    )
    .eq("user_id", userId)
    .select(
      "id, organization_id, user_id, role, created_at, updated_at"
    )
    .maybeSingle();

  if (error) {
    throw new Error(
      error.message ??
        "Failed to update organization member role"
    );
  }

  if (!membership) {
    throw new Error(
      "Organization member not found"
    );
  }

  return {
    ...membership,
    role: String(
      membership.role
    ) as EnterpriseRole,
  } as EnterpriseOrganizationMember;
}


export async function removeOrganizationMember(
  organizationId: string,
  userId: string
): Promise<EnterpriseOrganizationMember> {
  if (!organizationId || !userId) {
    throw new Error(
      "Organization and user context are required"
    );
  }

  const member = await getOrganizationMember(
    organizationId,
    userId
  );

  if (!member) {
    throw new Error(
      "Organization member not found"
    );
  }

  if (member.role === "OWNER") {
    throw new Error(
      "Cannot remove an OWNER through ordinary member management. Use the ownership transfer operation."
    );
  }

  const {
    data: membership,
    error,
  } = await supabaseServer
    .from("organization_members")
    .delete()
    .eq("organization_id", organizationId)
    .eq("user_id", userId)
    .select(
      "id, organization_id, user_id, role, created_at, updated_at"
    )
    .maybeSingle();

  if (error) {
    throw new Error(
      error.message ??
        "Failed to remove organization member"
    );
  }

  if (!membership) {
    throw new Error(
      "Organization member not found"
    );
  }

    return {
    ...membership,
    role: String(
      membership.role
    ) as EnterpriseRole,
  } as EnterpriseOrganizationMember;
}
export async function transferOrganizationOwnership(
  organizationId: string,
  actorUserId: string,
  newOwnerUserId: string
): Promise<void> {
  if (
    !organizationId ||
    !actorUserId ||
    !newOwnerUserId
  ) {
    throw new Error(
      "Organization, actor, and new owner are required"
    );
  }

  if (actorUserId === newOwnerUserId) {
    throw new Error(
      "The new owner must be a different organization member"
    );
  }

  const { error } = await supabaseServer.rpc(
    "transfer_organization_ownership",
    {
      p_organization_id: organizationId,
      p_actor_user_id: actorUserId,
      p_new_owner_user_id: newOwnerUserId,
    }
  );

  if (error) {
    throw new Error(
      error.message ??
        "Failed to transfer organization ownership"
    );
  }
}