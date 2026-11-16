import { NextResponse } from "next/server";
import { createSupabaseServerAuth } from "@/lib/supabase/server";
import { requireOrganizationMembership } from "@/lib/enterprise/enterpriseAuthorization";
import { runCareerEngineV2 } from "./engine";

/**
 * ============================================================
 * Global Career AI
 * Career AI API V2 Route
 * Enterprise Tenant Isolation V1
 * ============================================================
 *
 * Security flow:
 *
 * Supabase Auth
 *      ↓
 * Authenticated User
 *      ↓
 * Organization Membership
 *      ↓
 * Validated organizationId
 *      ↓
 * Career Engine V2
 *
 * The client cannot choose the user identity.
 * organizationId is accepted only after membership validation.
 *
 * ============================================================
 */

export async function POST(req: Request) {
  try {
    const supabase = await createSupabaseServerAuth();

    const {
      data: {
        user,
      },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json(
        {
          success: false,
          error: "Unauthorized",
        },
        { status: 401 }
      );
    }

    const body = await req.json();

    if (
      !body ||
      typeof body !== "object" ||
      Array.isArray(body)
    ) {
      return NextResponse.json(
        {
          success: false,
          error: "Invalid request body",
        },
        { status: 400 }
      );
    }

    const organizationId =
      typeof body.organizationId === "string"
        ? body.organizationId.trim()
        : "";

    if (!organizationId) {
      return NextResponse.json(
        {
          success: false,
          error: "Organization context is required",
        },
        { status: 400 }
      );
    }

    await requireOrganizationMembership(
      user.id,
      organizationId
    );

    const result = await runCareerEngineV2({
      userId: user.id,
      organizationId,
      mode: body.mode,
      payload: body.payload,
    });

    return NextResponse.json(result);
  } catch (error: unknown) {
    const message =
      error instanceof Error
        ? error.message
        : "Internal server error";

    const status =
      message === "Unauthorized"
        ? 401
        : message.includes(
            "not a member"
          )
          ? 403
          : 500;

    return NextResponse.json(
      {
        success: false,
        error: message,
      },
      { status }
    );
  }
}