
import { NextResponse } from "next/server";

import {
  getCandidateIntelligence,
} from "@/lib/enterprise/candidateIntelligenceService";

import {
  getOrganizationMember,
} from "@/lib/enterprise/organizationService";

import {
  requireEnterprisePermission,
} from "@/lib/enterprise/enterpriseAuthorization";

import {
  createSupabaseServerAuth,
} from "@/lib/supabase/server";

interface RouteContext {
  params: Promise<{
    organizationId: string;
    candidateUserId: string;
  }>;
}

async function getAuthenticatedUser() {
  const supabase =
    await createSupabaseServerAuth();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    throw new Error(
      "Authentication required"
    );
  }

  return user;
}

export async function GET(
  _request: Request,
  context: RouteContext
) {
  try {
    const user =
      await getAuthenticatedUser();

    const {
      organizationId,
      candidateUserId,
    } = await context.params;

    if (
      !organizationId ||
      !candidateUserId
    ) {
      return NextResponse.json(
        {
          success: false,
          error:
            "Organization and candidate are required",
        },
        { status: 400 }
      );
    }

    await requireEnterprisePermission(
      user.id,
      organizationId,
      "VIEW_CANDIDATE_INTELLIGENCE"
    );

    const candidateMember =
      await getOrganizationMember(
        organizationId,
        candidateUserId
      );

    if (!candidateMember) {
      return NextResponse.json(
        {
          success: false,
          error:
            "Candidate is not a member of this organization",
        },
        { status: 403 }
      );
    }

    const intelligence =
      await getCandidateIntelligence(
        candidateUserId
      );

    return NextResponse.json(
      {
        success: true,
        intelligence,
      },
      { status: 200 }
    );
  } catch (error) {
    const message =
      error instanceof Error
        ? error.message
        : "Enterprise candidate intelligence request failed";

    if (
      message ===
      "Authentication required"
    ) {
      return NextResponse.json(
        {
          success: false,
          error: message,
        },
        { status: 401 }
      );
    }

    if (
      message.includes(
        "User is not a member of this organization"
      ) ||
      message.includes(
        "Insufficient enterprise permission"
      )
    ) {
      return NextResponse.json(
        {
          success: false,
          error: message,
        },
        { status: 403 }
      );
    }

    return NextResponse.json(
      {
        success: false,
        error: message,
      },
      { status: 400 }
    );
  }
}
