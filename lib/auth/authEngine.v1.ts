import {
  AuthContext,
  AuthSession,
} from "./authTypes";

import {
  createSupabaseServerAuth,
} from "@/lib/supabase-server-auth";


/**
 * ============================================================
 * Global Career AI
 * Auth Engine V2 (Supabase Identity Layer)
 * ============================================================
 *
 * Identity abstraction layer.
 *
 * Provider:
 * Supabase Auth
 *
 * Flow:
 *
 * Request
 *   ↓
 * Supabase Identity
 *   ↓
 * AuthSession
 *   ↓
 * AuthContext
 *
 * ============================================================
 */


/**
 * ============================================================
 * AUTH CONTEXT BUILDER
 * ============================================================
 */

export function buildAuthContext(
  session: AuthSession
): AuthContext {

  return {

    user:
      session.user,

    session,

    isAuthenticated:
      true,

  };

}


/**
 * ============================================================
 * REAL AUTHENTICATION
 * ============================================================
 *
 * Supabase Session
 *        ↓
 * AuthContext
 *
 */

export async function authenticateRequest(
  _req: Request
): Promise<AuthContext> {


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
      "Unauthorized"
    );

  }



  const session: AuthSession = {

    sessionId:
      crypto.randomUUID(),


    user: {

      userId:
        user.id,


      email:
        user.email ?? "",


      name:
        user.user_metadata?.name ??
        user.email ??
        "User",

    },


    expiresAt:
      new Date(
        Date.now() +
        1000 * 60 * 60
      ).toISOString(),

  };



  return buildAuthContext(
    session
  );

}