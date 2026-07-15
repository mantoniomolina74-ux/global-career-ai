import { AuthContext, AuthSession } from "./authTypes";

/**

* ============================================================
* Global Career AI
* Auth Engine V1 (Pluggable Identity Layer)
* ============================================================
  */

export function createMockSession(userId: string): AuthSession {
return {
sessionId: crypto.randomUUID(),
user: {
userId,
email: `${userId}@career.ai`,
name: "Demo User",
},
expiresAt: new Date(Date.now() + 1000 * 60 * 60).toISOString(),
};
}

export function buildAuthContext(session: AuthSession): AuthContext {
return {
user: session.user,
session,
isAuthenticated: true,
};
}

/**

* Future upgrade point:
* * verify JWT
* * validate Clerk session
* * check DB session store
    */
    export function authenticateRequest(_req: Request): AuthContext {
    // MOCK AUTH (replace later with real provider)
    const session = createMockSession("demo-user");

return buildAuthContext(session);
}