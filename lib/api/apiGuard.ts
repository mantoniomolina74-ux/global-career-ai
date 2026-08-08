import { z } from "zod";
import { supabaseServer } from "@/lib/supabase-server";

/**
 * =========================================================
 * TYPES
 * =========================================================
 */

export interface AuthContext {
  userId: string;
  email?: string;
}

/**
 * =========================================================
 * AUTH VALIDATION
 * =========================================================
 */

export async function validateRequest(
  req: Request
): Promise<AuthContext> {
  const authHeader = req.headers.get("authorization");

  if (!authHeader) {
    throw new Error("Missing authorization header");
  }

  const token = authHeader.replace("Bearer ", "");

  const {
    data: { user },
    error,
  } = await supabaseServer.auth.getUser(token);

  if (error || !user) {
    throw new Error("Invalid or expired token");
  }

  return {
    userId: user.id,
    email: user.email,
  };
}

/**
 * =========================================================
 * RATE LIMIT
 * =========================================================
 */

const rateMap = new Map<
  string,
  { count: number; last: number }
>();

export function rateLimit(
  userId: string,
  limit = 30
): boolean {
  const now = Date.now();
  const windowMs = 60 * 1000;

  const record = rateMap.get(userId);

  if (!record) {
    rateMap.set(userId, {
      count: 1,
      last: now,
    });

    return true;
  }

  const isSameWindow =
    now - record.last < windowMs;

  if (!isSameWindow) {
    rateMap.set(userId, {
      count: 1,
      last: now,
    });

    return true;
  }

  if (record.count >= limit) {
    return false;
  }

  record.count += 1;

  rateMap.set(userId, record);

  return true;
}

/**
 * =========================================================
 * SAFE WRAPPER (GENERIC)
 * =========================================================
 */

export async function withApiGuard<
  TBody = unknown,
  TResult = unknown
>(
  req: Request,
  handler: (
    ctx: AuthContext,
    body: TBody
  ) => Promise<TResult>
): Promise<TResult> {
  const ctx = await validateRequest(req);

  const allowed = rateLimit(ctx.userId);

  if (!allowed) {
    throw new Error("Rate limit exceeded");
  }

  const body = (await req.json()) as TBody;

  return handler(ctx, body);
}

/**
 * =========================================================
 * SAFE WRAPPER (ZOD ENABLED)
 * =========================================================
 */

export async function withApiGuardZod<
  TBody,
  TResult = unknown
>(
  req: Request,
  schema: z.ZodSchema<TBody>,
  handler: (
    ctx: AuthContext,
    body: TBody
  ) => Promise<TResult>
): Promise<TResult> {
  const ctx = await validateRequest(req);

  const allowed = rateLimit(ctx.userId);

  if (!allowed) {
    throw new Error("Rate limit exceeded");
  }

  const rawBody = await req.json();

  const parsed = schema.safeParse(rawBody);

  if (!parsed.success) {
    throw new Error(
      "Validation error: " +
        JSON.stringify(parsed.error.flatten())
    );
  }

  return handler(ctx, parsed.data);
}