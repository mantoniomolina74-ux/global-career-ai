import { NextResponse } from "next/server";
import {
  addOrganizationMember,
  getOrganizationMember,
  getOrganizationMembers,
  removeOrganizationMember,
  updateOrganizationMemberRole,
  type EnterpriseRole,
} from "@/lib/enterprise/organizationService";
import {
  requireEnterprisePermission,
} from "@/lib/enterprise/enterpriseAuthorization";
import { createSupabaseServerAuth } from "@/lib/supabase/server";

interface RouteContext {
  params: Promise<{
    organizationId: string;
  }>;
}

async function getAuthenticatedUser() {
  const supabase = await createSupabaseServerAuth();

  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  if (error || !user) {
    throw new Error("Authentication required");
  }

  return user;
}

type AssignableEnterpriseRole = Exclude<
  EnterpriseRole,
  "OWNER"
>;

function isAssignableEnterpriseRole(
  role: unknown
): role is AssignableEnterpriseRole {
  return (
    role === "ADMIN" ||
    role === "RECRUITER" ||
    role === "VIEWER"
  );
}

function getErrorStatus(message: string): number {
  if (message === "Authentication required") {
    return 401;
  }

  if (
    message.startsWith("Forbidden:") ||
    message.includes("not a member") ||
    message.includes("Insufficient enterprise permission")
  ) {
    return 403;
  }

  return 400;
}

function errorResponse(error: unknown) {
  const message =
    error instanceof Error
      ? error.message
      : "Unknown error";

  return NextResponse.json(
    {
      success: false,
      error: message,
    },
    { status: getErrorStatus(message) }
  );
}

export async function GET(
  _req: Request,
  context: RouteContext
) {
  try {
    const user = await getAuthenticatedUser();
    const { organizationId } = await context.params;

    if (!organizationId) {
      throw new Error("Organization ID is required");
    }

    await requireEnterprisePermission(
      user.id,
      organizationId,
      "VIEW_MEMBERS"
    );

    const members = await getOrganizationMembers(
      user.id,
      organizationId
    );

    return NextResponse.json({
      success: true,
      members,
    });
  } catch (error: unknown) {
    return errorResponse(error);
  }
}

export async function POST(
  req: Request,
  context: RouteContext
) {
  try {
    const user = await getAuthenticatedUser();
    const { organizationId } = await context.params;

    if (!organizationId) {
      throw new Error("Organization ID is required");
    }

    const requester = await requireEnterprisePermission(
      user.id,
      organizationId,
      "MANAGE_MEMBERS"
    );

    const body = await req.json();

    const userId =
      typeof body?.userId === "string"
        ? body.userId.trim()
        : "";

    const role = body?.role;

    if (!userId) {
      throw new Error("User ID is required");
    }

    if (!isAssignableEnterpriseRole(role)) {
      throw new Error("Invalid enterprise role");
    }

    if (userId === user.id) {
      throw new Error(
        "Forbidden: You cannot manage your own membership through this operation"
      );
    }

    if (requester.role === "ADMIN" && role === "ADMIN") {
      throw new Error(
        "Forbidden: ADMIN cannot add another ADMIN"
      );
    }

    const member = await addOrganizationMember(
      user.id,
      organizationId,
      userId,
      role
    );

    return NextResponse.json(
      {
        success: true,
        member,
      },
      { status: 201 }
    );
  } catch (error: unknown) {
    return errorResponse(error);
  }
}

export async function PATCH(
  req: Request,
  context: RouteContext
) {
  try {
    const user = await getAuthenticatedUser();
    const { organizationId } = await context.params;

    if (!organizationId) {
      throw new Error("Organization ID is required");
    }

    const requester = await requireEnterprisePermission(
      user.id,
      organizationId,
      "MANAGE_MEMBERS"
    );

    const body = await req.json();

    const userId =
      typeof body?.userId === "string"
        ? body.userId.trim()
        : "";

    const role = body?.role;

    if (!userId) {
      throw new Error("User ID is required");
    }

    if (!isAssignableEnterpriseRole(role)) {
      throw new Error("Invalid enterprise role");
    }

    if (userId === user.id) {
      throw new Error(
        "Forbidden: You cannot change your own role through member management"
      );
    }

    const target = await getOrganizationMember(
      organizationId,
      userId
    );

    if (!target) {
      throw new Error("Organization member not found");
    }

    if (target.role === "OWNER") {
      throw new Error(
        "Forbidden: OWNER changes require the ownership transfer operation"
      );
    }

    if (
      requester.role === "ADMIN" &&
      target.role === "ADMIN"
    ) {
      throw new Error(
        "Forbidden: ADMIN cannot modify another ADMIN"
      );
    }

    const member = await updateOrganizationMemberRole(
      organizationId,
      userId,
      role
    );

    return NextResponse.json({
      success: true,
      member,
    });
  } catch (error: unknown) {
    return errorResponse(error);
  }
}

export async function DELETE(
  req: Request,
  context: RouteContext
) {
  try {
    const user = await getAuthenticatedUser();
    const { organizationId } = await context.params;

    if (!organizationId) {
      throw new Error("Organization ID is required");
    }

    const requester = await requireEnterprisePermission(
      user.id,
      organizationId,
      "MANAGE_MEMBERS"
    );

    const body = await req.json();

    const userId =
      typeof body?.userId === "string"
        ? body.userId.trim()
        : "";

    if (!userId) {
      throw new Error("User ID is required");
    }

    if (userId === user.id) {
      throw new Error(
        "Forbidden: You cannot remove your own membership through this operation"
      );
    }

    const target = await getOrganizationMember(
      organizationId,
      userId
    );

    if (!target) {
      throw new Error("Organization member not found");
    }

    if (target.role === "OWNER") {
      throw new Error(
        "Forbidden: OWNER changes require the ownership transfer operation"
      );
    }

    if (
      requester.role === "ADMIN" &&
      target.role === "ADMIN"
    ) {
      throw new Error(
        "Forbidden: ADMIN cannot remove another ADMIN"
      );
    }

    const member = await removeOrganizationMember(
      organizationId,
      userId
    );

    return NextResponse.json({
      success: true,
      member,
    });
  } catch (error: unknown) {
    return errorResponse(error);
  }
}
