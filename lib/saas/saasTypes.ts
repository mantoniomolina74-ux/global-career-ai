export interface User {
  userId: string;
  email?: string;
  name?: string;
}

export interface Tenant {
  tenantId: string;
  name?: string;
}

export interface SaaSContext {
  user: User;
  tenant?: Tenant;

  requestId: string;
  timestamp: string;
}