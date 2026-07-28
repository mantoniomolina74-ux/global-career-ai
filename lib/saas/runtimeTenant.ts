/**
 * ============================================================
 * Global Career AI
 * Runtime Tenant Resolver V1
 * ============================================================
 *
 * Temporary SaaS identity bridge.
 *
 * Current strategy:
 * userId acts as tenant boundary.
 *
 * Future:
 * Replace implementation with real tenant membership lookup.
 * ============================================================
 */

export interface RuntimeTenantContext {
  userId: string;
  tenantId: string;
}


export function resolveRuntimeTenant(
  userId: string
): RuntimeTenantContext {

  return {
    userId,
    tenantId: userId,
  };
}