import { Subscription } from "./billingTypes";

/**
 * ============================================================
 * Global Career AI
 * Usage Tracker V1 (Metering Layer)
 * ============================================================
 */

export function canExecuteRequest(subscription: Subscription): boolean {
  const limit = subscription.limits.maxRequestsPerMonth;
  return subscription.usage.requestsThisMonth < limit;
}

export function incrementUsage(subscription: Subscription): Subscription {
  return {
    ...subscription,
    usage: {
      ...subscription.usage,
      requestsThisMonth: subscription.usage.requestsThisMonth + 1,
    },
  };
}