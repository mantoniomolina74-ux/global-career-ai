export type PlanType = "FREE" | "PRO" | "ENTERPRISE";

export interface UsageLimits {
  maxRequestsPerMonth: number;
  maxApplicationsPerRequest: number;
}

export interface Subscription {
  userId: string;
  tenantId?: string;

  plan: PlanType;
  usage: {
    requestsThisMonth: number;
    lastReset: string;
  };

  limits: UsageLimits;
}