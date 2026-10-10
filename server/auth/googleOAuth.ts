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

// In-memory token store for the server instance
let storedTokens: StoredTokens | null = null;

// Track active OAuth state tokens with 10-minute expiry to protect against CSRF attacks
const pendingStates = new Map<string, { createdAt: number; redirectUrl?: string }>();

// Clean up expired state tokens periodically
setInterval(() => {
  const now = Date.now();
  for (const [state, data] of pendingStates.entries()) {
    if (now - data.createdAt > 10 * 60 * 1000) {
      pendingStates.delete(state);
    }
  }
}, 5 * 60 * 1000);

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

  // Use stored tokens if available
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
 * Generates an authorization URL with a secure cryptographic state parameter.
 */
export function generateAuthUrl(returnPath = '/admin#settings') {
  const client = createOAuth2Client();
  if (!client) {
    throw new Error('Google OAuth is not configured. Missing GOOGLE_CLIENT_ID or GOOGLE_CLIENT_SECRET.');
  }

  const state = crypto.randomBytes(24).toString('hex');
  pendingStates.set(state, { createdAt: Date.now(), redirectUrl: returnPath });

  const url = client.generateAuthUrl({
    access_type: 'offline', // Requests refresh_token for persistent background execution
    scope: REQUIRED_SCOPES,
    include_granted_scopes: true,
    prompt: 'consent', // Ensures refresh_token is returned on consent
    state: state,
  });

  return { url, state };
}

/**
 * Exchanges the authorization code for tokens, validates state, and retrieves user profile email.
 */
export async function handleOAuthCallback(code: string, state: string) {
  const stateRecord = pendingStates.get(state);
  if (!stateRecord) {
    throw new Error('Invalid or expired OAuth state parameter. Please retry the authorization flow.');
  }
  pendingStates.delete(state);

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
