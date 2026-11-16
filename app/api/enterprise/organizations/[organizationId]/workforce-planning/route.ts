/**
 * ============================================================
 * Global Career AI
 * Enterprise Workforce Planning API V1.0
 * ============================================================
 */

import {
  createSupabaseServerAuth,
} from "@/lib/supabase/server";

import {
  getWorkforcePlanning,
} from "@/lib/enterprise/workforcePlanningService";

import {
  requireEnterprisePermission,
} from "@/lib/enterprise/enterpriseAuthorization";


type RouteContext = {
  params: Promise<{
    organizationId: string;
  }>;
};


export async function GET(
  request: Request,
  context: RouteContext
) {

  try {

    const {
      organizationId,
    } = await context.params;


    if (!organizationId) {
      return Response.json(
        {
          success: false,
          error: "Organization ID is required",
        },
        {
          status: 400,
        }
      );
    }


    const supabase =
      await createSupabaseServerAuth();


    const {
      data: {
        user,
      },
    } = await supabase.auth.getUser();


    if (!user) {
      return Response.json(
        {
          success: false,
          error: "Authentication required",
        },
        {
          status: 401,
        }
      );
    }


    await requireEnterprisePermission(
      user.id,
      organizationId,
      "VIEW_TALENT_INTELLIGENCE"
    );


    const workforcePlanning =
      await getWorkforcePlanning(
        user.id,
        organizationId
      );


    return Response.json(
      {
        success: true,
        data: workforcePlanning,
      },
      {
        status: 200,
      }
    );

  } catch (error) {

    console.error(
      "Enterprise Workforce Planning API error:",
      error
    );


    const message =
      error instanceof Error
        ? error.message
        : "Failed to generate workforce planning intelligence";


    if (
      message ===
      "Authentication required"
    ) {
      return Response.json(
        {
          success: false,
          error: message,
        },
        {
          status: 401,
        }
      );
    }


    if (
      message.startsWith(
        "Insufficient enterprise permission:"
      ) ||
      message.startsWith(
        "Insufficient enterprise role:"
      )
    ) {
      return Response.json(
        {
          success: false,
          error: message,
        },
        {
          status: 403,
        }
      );
    }


    return Response.json(
      {
        success: false,
        error: message,
      },
      {
        status: 400,
      }
    );
  }
}