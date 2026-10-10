/**
 * CarePlus Clinic - Server-Side Google OAuth Handler
 * Implements OAuth2 authorization code flow with secure state verification,
 * least-privilege scopes, server-side token storage, and graceful error handling.
 * Never stores or exposes secrets in client-side code.
 */

import { google } from 'googleapis';
import crypto from 'crypto';
import { config } from '../config';

// Least privilege scopes for appointment operations
export const REQUIRED_SCOPES = [
  'https://www.googleapis.com/auth/calendar.events', // Manage clinic calendar events
  'https://www.googleapis.com/auth/spreadsheets',    // Append appointment logs
  'https://www.googleapis.com/auth/gmail.send',       // Dispatch confirmation & reminder emails
  'https://www.googleapis.com/auth/userinfo.email',   // Identify connected account
];

interface StoredTokens {
  access_token?: string | null;
  refresh_token?: string | null;
  scope?: string;
  token_type?: string | null;
  expiry_date?: number | null;
  user_email?: string | null;
}

/**
 * TEMPORARY RUNTIME TOKEN STORAGE (NOTICE):
 * `storedTokens` is an in-memory variable scoped only to the currently executing
 * serverless or Node.js process instance.
 *
 * In serverless environments like Vercel:
 * - Each request may execute in an isolated container or instance.
 * - In-memory state is wiped whenever an instance recycles or goes cold.
 * - This in-memory store is temporary and unsuitable for persistent multi-user production.
 *
 * For resilient production usage across serverless invocations:
 * 1. Pre-configure GOOGLE_REFRESH_TOKEN in your environment variables (supported below), OR
 * 2. Persist tokens into an encrypted database or secure key-value store (e.g., Firestore, PostgreSQL).
 */
let storedTokens: StoredTokens | null = null;

/**
 * Resolves the server-side signing secret for OAuth state tokens.
 * Strictly uses OAUTH_STATE_SECRET or GOOGLE_CLIENT_SECRET from server environment variables.
 * Never exposes or falls back to public or client-side keys.
 */
function getStateSecret(): string {
  const secret = process.env.OAUTH_STATE_SECRET || config.google.clientSecret || process.env.SESSION_SECRET;
  if (!secret) {
    throw new Error('Server configuration error: OAUTH_STATE_SECRET or GOOGLE_CLIENT_SECRET must be set for secure OAuth state signing.');
  }
  return secret;
}

/**
 * Generates an HMAC-SHA256 signed, expiring OAuth state token.
 * Contains a cryptographic nonce, a timestamp (10-minute expiry), and the safe return path.
 * Because it is self-verifying and stateless, it functions reliably across Vercel serverless
 * function cold starts, instances, and server restarts without requiring a shared in-memory Map.
 */
function createSignedState(returnPath: string): string {
  const secret = getStateSecret();
  const nonce = crypto.randomBytes(16).toString('hex');
  const createdAt = Date.now();
  const safePath = encodeURIComponent(returnPath);
  const payload = `${nonce}:${createdAt}:${safePath}`;
  const signature = crypto.createHmac('sha256', secret).update(payload).digest('hex');
  return Buffer.from(`${payload}:${signature}`).toString('base64url');
}

/**
 * Safely validates an HMAC-signed OAuth state token.
 * - Verifies payload structure (nonce, timestamp, path, signature)
 * - Compares buffer lengths safely before invoking crypto.timingSafeEqual to prevent errors
 * - Enforces a strict 10-minute expiration window to protect against CSRF attacks
 */
function verifySignedState(stateToken: string): { createdAt: number; redirectUrl: string } | null {
  if (!stateToken || typeof stateToken !== 'string') {
    return null;
  }

  try {
    const secret = getStateSecret();
    const decoded = Buffer.from(stateToken, 'base64url').toString('utf8');
    const parts = decoded.split(':');
    if (parts.length !== 4) return null;

    const [nonce, createdAtStr, safePath, receivedSig] = parts;
    if (!nonce || !createdAtStr || !safePath || !receivedSig) {
      return null;
    }

    const payload = `${nonce}:${createdAtStr}:${safePath}`;
    const expectedSig = crypto.createHmac('sha256', secret).update(payload).digest('hex');

    const receivedBuf = Buffer.from(receivedSig, 'hex');
    const expectedBuf = Buffer.from(expectedSig, 'hex');

    // Prevent throwing RangeError: timingSafeEqual requires buffers of identical length
    if (receivedBuf.length === 0 || receivedBuf.length !== expectedBuf.length) {
      return null;
    }

    if (!crypto.timingSafeEqual(receivedBuf, expectedBuf)) {
      return null;
    }

    const createdAt = parseInt(createdAtStr, 10);
    const tenMinutesMs = 10 * 60 * 1000;
    if (isNaN(createdAt) || Date.now() - createdAt > tenMinutesMs || createdAt > Date.now() + 60 * 1000) {
      return null; // Expired or future timestamp
    }

    const decodedPath = decodeURIComponent(safePath);
    return {
      createdAt,
      redirectUrl: decodedPath || '/admin#settings',
    };
  } catch {
    return null;
  }
}

/**
 * Initializes and returns a Google OAuth2 client with server credentials.
 */
export function createOAuth2Client(customRedirectUri?: string) {
  if (!config.google.isOAuthConfigured) {
    return null;
  }

  const redirectUri = customRedirectUri || config.google.redirectUri;
  return new google.auth.OAuth2(
    config.google.clientId,
    config.google.clientSecret,
    redirectUri
  );
}

/**
 * Returns an authenticated OAuth2Client if tokens are available, or null.
 */
export function getAuthenticatedClient() {
  const client = createOAuth2Client();
  if (!client) return null;

  // Use stored in-memory tokens if available in this process instance
  if (storedTokens && (storedTokens.access_token || storedTokens.refresh_token)) {
    client.setCredentials({
      access_token: storedTokens.access_token || undefined,
      refresh_token: storedTokens.refresh_token || undefined,
      expiry_date: storedTokens.expiry_date || undefined,
    });
    return client;
  }

  // Fallback to pre-configured GOOGLE_REFRESH_TOKEN env var if provided
  if (config.google.refreshToken) {
    client.setCredentials({
      refresh_token: config.google.refreshToken,
    });
    return client;
  }

  return null;
}

/**
 * Generates an authorization URL with a secure cryptographic stateless HMAC state parameter.
 */
export function generateAuthUrl(returnPath = '/admin#settings') {
  const client = createOAuth2Client();
  if (!client) {
    throw new Error('Google OAuth is not configured. Missing GOOGLE_CLIENT_ID or GOOGLE_CLIENT_SECRET.');
  }

  const state = createSignedState(returnPath);

  const url = client.generateAuthUrl({
    access_type: 'offline', // Requests refresh_token for background execution
    scope: REQUIRED_SCOPES,
    include_granted_scopes: true,
    prompt: 'consent', // Ensures refresh_token is returned on consent
    state: state,
  });

  return { url, state };
}

/**
 * Exchanges the authorization code for tokens, validates state statelessly, and retrieves user profile email.
 */
export async function handleOAuthCallback(code: string, state: string) {
  // Statistically and cryptographically validate the signed state token across serverless instances
  const stateRecord = verifySignedState(state);
  if (!stateRecord) {
    throw new Error('Invalid or expired OAuth state parameter. Please retry the authorization flow.');
  }

  const client = createOAuth2Client();
  if (!client) {
    throw new Error('Google OAuth client configuration is missing.');
  }

  const { tokens } = await client.getToken(code);
  client.setCredentials(tokens);

  // Retrieve authorized user's email address
  let userEmail: string | null = null;
  try {
    const oauth2 = google.oauth2({ version: 'v2', auth: client });
    const userInfo = await oauth2.userinfo.get();
    userEmail = userInfo.data.email || null;
  } catch (err) {
    console.warn('[GoogleOAuth] Could not fetch user email:', err);
  }

  storedTokens = {
    ...tokens,
    user_email: userEmail,
  };

  return {
    success: true,
    userEmail,
    returnUrl: stateRecord.redirectUrl || '/admin#settings',
  };
}

/**
 * Checks if the server currently possesses valid Google authorization.
 */
export function isGoogleAuthorized(): boolean {
  if (storedTokens?.refresh_token || storedTokens?.access_token) {
    return true;
  }
  if (config.google.refreshToken) {
    return true;
  }
  return false;
}

/**
 * Returns the email of the currently connected Google account, if available.
 */
export function getConnectedGoogleEmail(): string | null {
  return storedTokens?.user_email || null;
}

/**
 * Disconnects the current Google account and clears stored tokens.
 */
export async function disconnectGoogle(): Promise<void> {
  if (storedTokens?.access_token) {
    try {
      const client = createOAuth2Client();
      if (client) {
        client.setCredentials({ access_token: storedTokens.access_token });
        await client.revokeToken(storedTokens.access_token);
      }
    } catch (err) {
      console.warn('[GoogleOAuth] Error during token revocation:', err);
    }
  }
  storedTokens = null;
}
