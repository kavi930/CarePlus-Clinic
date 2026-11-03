import crypto from "crypto";
import { User, AuthSession } from "@/types";

// In-memory session cache backed by token expiration
const activeSessions: Map<string, AuthSession> = new Map();

const SESSION_DURATION_HOURS = 12;

/**
 * Derives a secure PBKDF2 hash using Node's native crypto module.
 */
export function hashPassword(password: string, providedSalt?: string): { hash: string; salt: string } {
  const salt = providedSalt || crypto.randomBytes(16).toString("hex");
  const hash = crypto.pbkdf2Sync(password, salt, 10000, 64, "sha512").toString("hex");
  return { hash, salt };
}

/**
 * Constant-time comparison for password verification.
 */
export function verifyPassword(password: string, storedHash: string, salt: string): boolean {
  const { hash } = hashPassword(password, salt);
  const hashBuffer = Buffer.from(hash, "hex");
  const storedBuffer = Buffer.from(storedHash, "hex");
  if (hashBuffer.length !== storedBuffer.length) {
    return false;
  }
  return crypto.timingSafeEqual(hashBuffer, storedBuffer);
}

/**
 * Creates an authenticated session token for a validated user.
 */
export function createSession(user: User): AuthSession {
  const token = crypto.randomBytes(32).toString("hex");
  const expiresAt = new Date(Date.now() + SESSION_DURATION_HOURS * 60 * 60 * 1000).toISOString();
  const session: AuthSession = {
    token,
    userId: user.id,
    username: user.username,
    role: user.role,
    name: user.name,
    expiresAt,
  };
  activeSessions.set(token, session);
  return session;
}

/**
 * Validates session token and returns active session or null.
 */
export function verifySessionToken(token: string | null | undefined): AuthSession | null {
  if (!token) return null;
  const session = activeSessions.get(token);
  if (!session) return null;

  if (new Date(session.expiresAt) < new Date()) {
    activeSessions.delete(token);
    return null;
  }

  return session;
}

/**
 * Invalidates an active session token.
 */
export function destroySession(token: string): void {
  activeSessions.delete(token);
}
