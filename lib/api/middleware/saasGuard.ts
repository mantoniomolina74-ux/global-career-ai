import { createSupabaseServerAuth } from "@/lib/supabase-server-auth";
import { buildSaaSContext } from "@/lib/saas/saasContext";

/**
 * ============================================================
 * Global Career AI
 * SaaS Guard V4
 * Supabase Auth + Tenant Enforcement Layer
 * ============================================================
 *
 * Identity flow:
 *
 * Supabase User
 *        ↓
 * Request Context
 *        ↓
 * Tenant Context
 *        ↓
 * SaaS Engine
 *
 * ============================================================
 */

export interface RequestContext {

  userId: string;

  email?: string;

  name?: string;

  tenantId: string;

  tenantName?: string;

}


/**
 * ============================================================
 * AUTHENTICATED REQUEST CONTEXT
 * ============================================================
 */

export async function buildRequestContext(
  _req: Request
): Promise<RequestContext> {


  const supabase =
    await createSupabaseServerAuth();



  const {
    data: {
      user,
    },
  } =
    await supabase.auth.getUser();



  if (!user) {

    throw new Error(
      "Unauthorized: Missing authenticated user"
    );

  }



  /**
   * ============================================================
   * Tenant Resolution V1.1
   *
   * Until Organization module exists:
   *
   * User identity = Tenant boundary
   *
   * Future:
   * user → organization → tenant
   *
   * ============================================================
   */

  const tenantId =
    user.id;



  return {

    userId:
      user.id,


    email:
      user.email,


    name:
      user.user_metadata?.name ??
      user.email ??
      "User",


    tenantId,


    tenantName:
      "Personal Workspace",

  };

}



/**
 * ============================================================
 * SaaS CONTEXT BUILDER
 * ============================================================
 */

export async function buildSaaSRequestContext(
  req: Request
) {


  const ctx =
    await buildRequestContext(req);



  return buildSaaSContext({

    userId:
      ctx.userId,


    email:
      ctx.email,


    name:
      ctx.name,


    tenantId:
      ctx.tenantId,


    tenantName:
      ctx.tenantName,

  });

}