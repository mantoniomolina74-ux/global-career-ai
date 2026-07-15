export interface AuthUser {
  userId: string;
  email: string;
  name?: string;
}

export interface AuthSession {
  sessionId: string;
  user: AuthUser;
  expiresAt: string;
}

export interface AuthContext {
  user: AuthUser;
  session: AuthSession;
  isAuthenticated: boolean;
}