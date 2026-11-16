import { NextResponse } from "next/server";
import {
  transferOrganizationOwnership,
} from "@/lib/enterprise/organizationService";
import {
  requireOrganizationRole,
} from "@/lib/enterprise/enterpriseAuthorization";
import {
  createSupabaseServerAuth,
} from "@/lib/supabase/server";

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

    await requireOrganizationRole(
      user.id,
      organizationId,
      ["OWNER"]
    );

    const body = await req.json();

    const newOwnerUserId =
      typeof body?.newOwnerUserId === "string"
        ? body.newOwnerUserId.trim()
        : "";

    if (!newOwnerUserId) {
      throw new Error("New owner user ID is required");
    }

    if (newOwnerUserId === user.id) {
      throw new Error(
        "The new owner must be a different organization member"
      );
    }

    await transferOrganizationOwnership(
      organizationId,
      user.id,
      newOwnerUserId
    );

    return NextResponse.json({
      success: true,
      message: "Organization ownership transferred successfully",
    });
  } catch (error: unknown) {
    const message =
      error instanceof Error
        ? error.message
        : "Unknown error";

        const status =
      message === "Authentication required"
        ? 401
        : message.includes("not a member") ||
            message.includes("Insufficient enterprise permission") ||
            message.includes("Insufficient enterprise role") ||
            message.includes("Only the current OWNER")
          ? 403
          : 400;

    return NextResponse.json(
      {
        success: false,
        error: message,
      },
      { status }
    );
  }
}