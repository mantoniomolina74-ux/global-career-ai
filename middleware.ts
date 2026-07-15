import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

/**
 * =========================================================
 * SAAS SECURITY MIDDLEWARE (NEXT 16 SAFE VERSION)
 * =========================================================
 *
 * IMPORTANT:
 * Supabase auth-helpers middleware is deprecated in Next 16.
 * Auth is now handled in API layer (saasEngine + JWT verification).
 */

export async function middleware(req: NextRequest) {
  const isSaaSRoute = req.nextUrl.pathname.startsWith("/api/saas");

  /**
   * =====================================================
   * SAAS ROUTE GUARD (LIGHTWEIGHT LAYER)
   * =====================================================
   *
   * NOTE:
   * Real authentication is handled in:
   * - /app/api/auth/*
   * - saasEngine (userId + tenantId validated from token)
   */

  if (isSaaSRoute) {
    const authHeader = req.headers.get("authorization");

    if (!authHeader) {
      return NextResponse.json(
        {
          success: false,
          error: "Unauthorized - Missing Authorization header",
        },
        { status: 401 }
      );
    }

    /**
     * Optional: token structure validation (light check only)
     */
    const token = authHeader.replace("Bearer ", "");

    if (!token || token.length < 10) {
      return NextResponse.json(
        {
          success: false,
          error: "Unauthorized - Invalid token",
        },
        { status: 401 }
      );
    }
  }

  return NextResponse.next();
}

/**
 * =========================================================
 * MATCHER CONFIG
 * =========================================================
 */

export const config = {
  matcher: ["/api/saas/:path*"],
};