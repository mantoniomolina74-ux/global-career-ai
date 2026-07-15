import { Subscription, PlanType } from "./billingTypes";
import { canExecuteRequest, incrementUsage } from "./usageTracker";

/**
 * ============================================================
 * Global Career AI
 * Billing Engine V1 (Access Control Layer)
 * ============================================================
 */

const PLAN_LIMITS: Record<PlanType, Subscription["limits"]> = {
  FREE: {
    maxRequestsPerMonth: 20,
    maxApplicationsPerRequest: 3,
  },
  PRO: {
    maxRequestsPerMonth: 200,
    maxApplicationsPerRequest: 20,
  },
  ENTERPRISE: {
    maxRequestsPerMonth: 10000,
    maxApplicationsPerRequest: 100,
  },
};

export function getDefaultSubscription(userId: string): Subscription {
  return {
    userId,
    plan: "FREE",
    usage: {
      requestsThisMonth: 0,
      lastReset: new Date().toISOString(),
    },
    limits: PLAN_LIMITS.FREE,
  };
}

export function authorizeRequest(subscription: Subscription) {
  if (!canExecuteRequest(subscription)) {
    return {
      allowed: false,
      reason: "Monthly quota exceeded",
    };
  }

  return {
    allowed: true,
    subscription: incrementUsage(subscription),
  };
}

export function upgradePlan(
  subscription: Subscription,
  plan: PlanType
): Subscription {
  return {
    ...subscription,
    plan,
    limits: PLAN_LIMITS[plan],
  };
}