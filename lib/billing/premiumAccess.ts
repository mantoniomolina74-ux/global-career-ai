import { supabaseServer } from "@/lib/supabase-server";

/**
 * ============================================================
 * GLOBAL CAREER AI V1.0
 * Premium Subscription Access
 * ============================================================
 *
 * APERTURA: 28/09/2026
 *
 * Purpose:
 * Centralize persisted Premium access validation.
 *
 * Rules:
 * - Access requires a real premium_subscriptions row.
 * - user_id must match the authenticated user.
 * - status must indicate an active subscription.
 * - current_period_end must exist and not be expired.
 * - No Premium access is granted when no subscription exists.
 *
 * This service does NOT create subscriptions.
 * Activation/billing will be connected separately.
 *
 * ============================================================
 */

export type PremiumPlan =
  | "monthly"
  | "six_months"
  | "annual";

export type PremiumAccessResult = {
  hasAccess: boolean;
  plan?: PremiumPlan;
  status?: string;
  currentPeriodStart?: string | null;
  currentPeriodEnd?: string | null;
};

const ACTIVE_STATUS = "active";

export async function getPremiumAccess(
  userId: string
): Promise<PremiumAccessResult> {
  const { data, error } = await supabaseServer
    .from("premium_subscriptions")
    .select(
      `
        plan,
        status,
        current_period_start,
        current_period_end
      `
    )
    .eq("user_id", userId)
    .maybeSingle();

  if (error) {
    throw new Error(
      `Error verificando acceso Premium: ${error.message}`
    );
  }

  if (!data) {
    return {
      hasAccess: false,
    };
  }

  const currentPeriodEnd = data.current_period_end
    ? new Date(data.current_period_end)
    : null;

  const periodIsValid =
    currentPeriodEnd !== null &&
    !Number.isNaN(currentPeriodEnd.getTime()) &&
    currentPeriodEnd.getTime() > Date.now();

  const hasAccess =
    data.status === ACTIVE_STATUS &&
    periodIsValid;

  return {
    hasAccess,
    plan: data.plan as PremiumPlan,
    status: data.status,
    currentPeriodStart: data.current_period_start,
    currentPeriodEnd: data.current_period_end,
  };
}

export async function requirePremiumAccess(
  userId: string
): Promise<PremiumAccessResult> {
  const access = await getPremiumAccess(userId);

  if (!access.hasAccess) {
    throw new Error("Premium access required");
  }

  return access;
}