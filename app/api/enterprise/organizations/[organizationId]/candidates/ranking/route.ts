
import { NextResponse } from "next/server";

import {
  getEnterpriseCandidateRanking,
} from "@/lib/enterprise/enterpriseRankingService";

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
  }>;
}

interface RankingRequestBody {
  candidateUserIds?: unknown;
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

export async function POST(
  request: Request,
  context: RouteContext
) {
  try {
    const user =
      await getAuthenticatedUser();

    const {
      organizationId,
    } = await context.params;

    if (!organizationId) {
      return NextResponse.json(
        {
          success: false,
          error:
            "Organization is required",
        },
        { status: 400 }
      );
    }

    await requireEnterprisePermission(
      user.id,
      organizationId,
      "VIEW_CANDIDATE_INTELLIGENCE"
    );

    let body: RankingRequestBody;

    try {
      body =
        (await request.json()) as RankingRequestBody;
    } catch {
      return NextResponse.json(
        {
          success: false,
          error:
            "Invalid request body",
        },
        { status: 400 }
      );
    }

    if (
      !Array.isArray(
        body.candidateUserIds
      )
    ) {
      return NextResponse.json(
        {
          success: false,
          error:
            "candidateUserIds must be an array",
        },
        { status: 400 }
      );
    }

    const candidateUserIds =
      Array.from(
        new Set(
          body.candidateUserIds
            .filter(
              (
                candidateUserId
              ): candidateUserId is string =>
                typeof candidateUserId ===
                "string"
            )
            .map(
              (candidateUserId) =>
                candidateUserId.trim()
            )
            .filter(Boolean)
        )
      );

    if (
      candidateUserIds.length === 0
    ) {
      return NextResponse.json(
        {
          success: false,
          error:
            "At least one candidate user ID is required",
        },
        { status: 400 }
      );
    }

    for (
      const candidateUserId
      of candidateUserIds
    ) {
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
    }

    const ranking =
      await getEnterpriseCandidateRanking({
        candidateUserIds,
      });

    return NextResponse.json(
      {
        success: true,
        ranking,
      },
      { status: 200 }
    );
  } catch (error) {
    const message =
      error instanceof Error
        ? error.message
        : "Enterprise candidate ranking request failed";

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
