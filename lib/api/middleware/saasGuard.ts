import { buildSaaSContext } from "@/lib/saas/saasContext";

/**

* ============================================================
* Global Career AI
* SaaS Guard V2 (Auth + Tenant Enforcement Layer)
* ============================================================
  */

export interface RequestContext {
userId: string;
email?: string;
name?: string;

tenantId?: string;
tenantName?: string;
}

/**

* In real production:
* * JWT decode
* * session validation
* * RBAC checks
*
* V2 keeps it lightweight but enforceable
  */
  export function buildRequestContext(_req: Request): RequestContext {
  // TEMP MOCK (replace later with auth provider)
  return {
  userId: "demo-user",
  email: "[demo@career.ai](mailto:demo@career.ai)",
  name: "Demo User",
  tenantId: "default-tenant",
  tenantName: "Default Org",
  };
  }

/**

* Builds full SaaS context (single source of truth)
  */
  export function buildSaaSRequestContext(req: Request) {
  const ctx = buildRequestContext(req);

return buildSaaSContext({
userId: ctx.userId,
email: ctx.email,
name: ctx.name,
tenantId: ctx.tenantId,
tenantName: ctx.tenantName,
});
}