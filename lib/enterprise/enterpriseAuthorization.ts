
import {
  assertOrganizationMembership,
  type EnterpriseOrganizationMember,
  type EnterpriseRole,
} from "@/lib/enterprise/organizationService";

export type EnterpriseAuthorizationContext =
  EnterpriseOrganizationMember;

export type EnterprisePermission =
  | "VIEW_MEMBERS"
  | "MANAGE_MEMBERS"
  | "VIEW_CANDIDATE_INTELLIGENCE"
  | "VIEW_TALENT_INTELLIGENCE";

const ENTERPRISE_ROLE_PERMISSIONS: Record<
  EnterpriseRole,
  readonly EnterprisePermission[]
> = {
  OWNER: [
    "VIEW_MEMBERS",
    "MANAGE_MEMBERS",
    "VIEW_CANDIDATE_INTELLIGENCE",
    "VIEW_TALENT_INTELLIGENCE",
  ],
  ADMIN: [
    "VIEW_MEMBERS",
    "MANAGE_MEMBERS",
    "VIEW_CANDIDATE_INTELLIGENCE",
    "VIEW_TALENT_INTELLIGENCE",
  ],
  RECRUITER: [
    "VIEW_MEMBERS",
    "VIEW_CANDIDATE_INTELLIGENCE",
    "VIEW_TALENT_INTELLIGENCE",
  ],
  VIEWER: [
    "VIEW_MEMBERS",
  ],
};

export async function requireOrganizationMembership(
  userId: string,
  organizationId: string
): Promise<EnterpriseAuthorizationContext> {
  return assertOrganizationMembership(
    userId,
    organizationId
  );
}

export async function requireOrganizationRole(
  userId: string,
  organizationId: string,
  allowedRoles: EnterpriseRole[]
): Promise<EnterpriseAuthorizationContext> {
  const membership =
    await requireOrganizationMembership(
      userId,
      organizationId
    );

  if (
    !allowedRoles.includes(
      membership.role
    )
  ) {
    throw new Error(
      `Insufficient enterprise role: ${membership.role}`
    );
  }

  return membership;
}

export function hasEnterpriseRole(
  role: EnterpriseRole,
  allowedRoles: EnterpriseRole[]
): boolean {
  return allowedRoles.includes(role);
}

export function hasEnterprisePermission(
  role: EnterpriseRole,
  permission: EnterprisePermission
): boolean {
  return ENTERPRISE_ROLE_PERMISSIONS[
    role
  ].includes(permission);
}

export async function requireEnterprisePermission(
  userId: string,
  organizationId: string,
  permission: EnterprisePermission
): Promise<EnterpriseAuthorizationContext> {
  const membership =
    await requireOrganizationMembership(
      userId,
      organizationId
    );

  if (
    !hasEnterprisePermission(
      membership.role,
      permission
    )
  ) {
    throw new Error(
      `Insufficient enterprise permission: ${permission}`
    );
  }

  return membership;
}
