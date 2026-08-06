import { createSupabaseServerAuth } from "@/lib/supabase-server-auth";
import { buildSaaSContext } from "@/lib/saas/saasContext";

/**
 * ============================================================
 * Global Career AI
 * SaaS Guard V3 (Supabase Auth + Tenant Enforcement Layer)
 * ============================================================
 */

export interface RequestContext {

  userId: string;

  email?: string;

  name?: string;

  tenantId?: string;

  tenantName?: string;

}


/**
 * ============================================================
 * AUTHENTICATED REQUEST CONTEXT
 * ============================================================
 *
 * Production flow:
 *
 * Supabase Session
 *        ↓
 * User Identity
 *        ↓
 * SaaS Context
 *
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



  return {

    userId:
      user.id,


    email:
      user.email,


    name:
      user.user_metadata?.name ??
      user.email,


    /**
     * Future multi-tenant resolution
     *
     * Current default tenant
     */
    tenantId:
      "default-tenant",


    tenantName:
      "Default Org",

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