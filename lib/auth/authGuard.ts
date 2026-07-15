import { AuthContext } from "./authTypes";

/**
 * ============================================================
 * Global Career AI
 * Auth Guard V1 (Access Control Layer)
 * ============================================================
 */

export function requireAuth(auth: AuthContext) {
  if (!auth.isAuthenticated) {
    throw new Error("Unauthorized");
  }

  return auth.user;
}

export function getUserId(auth: AuthContext): string {
  return auth.user.userId;
}