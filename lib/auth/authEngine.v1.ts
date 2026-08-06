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
 * Production:
 * Supabase Auth
 *
 * Testing:
 * createMockSession()
 *
 * ============================================================
 */


/**
 * ============================================================
 * MOCK SESSION
 * ============================================================
 *
 * Used only for tests/local development.
 */

export function createMockSession(
  userId: string
): AuthSession {

  return {

    sessionId:
      crypto.randomUUID(),

    user: {

      userId,

      email:
        `${userId}@career.ai`,

      name:
        "Demo User",

    },

    expiresAt:
      new Date(
        Date.now() +
        1000 * 60 * 60
      ).toISOString(),

  };

}



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