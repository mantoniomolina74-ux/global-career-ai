import { SaaSContext, User, Tenant } from "./saasTypes";

/**
 * ============================================================
 * Global Career AI
 * SaaS Core V1 (Identity + Context Layer)
 * ============================================================
 */

export function buildSaaSContext(input: {
  userId: string;
  email?: string;
  name?: string;

  tenantId?: string;
  tenantName?: string;
}): SaaSContext {

  const user: User = {
    userId: input.userId,
    email: input.email,
    name: input.name,
  };

  const tenant: Tenant | undefined = input.tenantId
    ? {
        tenantId: input.tenantId,
        name: input.tenantName,
      }
    : undefined;

  return {
    user,
    tenant,
    requestId: crypto.randomUUID(),
    timestamp: new Date().toISOString(),
  };
}