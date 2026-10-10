import dotenv from 'dotenv';
dotenv.config();

export interface ServerConfig {
  port: number;
  nodeEnv: string;
  appUrl: string;
  google: {
    clientId?: string;
    clientSecret?: string;
    redirectUri: string;
    refreshToken?: string;
    calendarId?: string;
    spreadsheetId?: string;
    clinicEmail?: string;
  };
  gemini: {
    apiKey?: string;
  };
}

/**
 * Determine the base application URL with intelligent environment detection:
 * 1. APP_URL if explicitly specified.
 * 2. VERCEL_PROJECT_PRODUCTION_URL (native Vercel production system env).
 * 3. VERCEL_URL (native Vercel preview/deployment system env).
 * 4. Fall back to local development URL.
 * Trailing slashes are cleanly removed.
 */
function resolveAppUrl(port: number): string {
  let url = '';
  if (process.env.APP_URL && process.env.APP_URL.trim() !== '') {
    url = process.env.APP_URL.trim();
  } else if (process.env.VERCEL_PROJECT_PRODUCTION_URL && process.env.VERCEL_PROJECT_PRODUCTION_URL.trim() !== '') {
    const raw = process.env.VERCEL_PROJECT_PRODUCTION_URL.trim();
    url = raw.startsWith('http') ? raw : `https://${raw}`;
  } else if (process.env.VERCEL_URL && process.env.VERCEL_URL.trim() !== '') {
    const raw = process.env.VERCEL_URL.trim();
    url = raw.startsWith('http') ? raw : `https://${raw}`;
  } else {
    url = `http://localhost:${port}`;
  }

  // Remove any trailing slash for consistent endpoint resolution
  return url.replace(/\/+$/, '');
}

const parsedPort = parseInt(process.env.PORT || '3000', 10);
const effectivePort = Number.isNaN(parsedPort) ? 3000 : parsedPort;
const effectiveAppUrl = resolveAppUrl(effectivePort);

export const config: ServerConfig = {
  port: effectivePort,
  nodeEnv: process.env.NODE_ENV || 'development',
  appUrl: effectiveAppUrl,
  google: {
    clientId: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    redirectUri: process.env.GOOGLE_REDIRECT_URI || `${effectiveAppUrl}/api/auth/google/callback`,
    refreshToken: process.env.GOOGLE_REFRESH_TOKEN,
    calendarId: process.env.GOOGLE_CALENDAR_ID || 'primary',
    spreadsheetId: process.env.GOOGLE_SPREADSHEET_ID,
    clinicEmail: process.env.CLINIC_NOTIFICATION_EMAIL,
  },
  gemini: {
    apiKey: process.env.GEMINI_API_KEY || process.env.VITE_GEMINI_API_KEY,
  },
};

/**
 * Diagnostic overview without exposing client secrets or access tokens.
 * Safe to return from public/admin health check endpoints.
 */
export function getSanitizedConfigStatus() {
  const isGoogleOAuthConfigured = Boolean(
    config.google.clientId &&
    config.google.clientSecret
  );

  const isGoogleConnected = Boolean(
    isGoogleOAuthConfigured &&
    config.google.refreshToken
  );

  return {
    environment: config.nodeEnv,
    appUrl: config.appUrl,
    integrations: {
      googleOAuth: {
        configured: isGoogleOAuthConfigured,
        connected: isGoogleConnected,
        redirectUri: config.google.redirectUri,
        hasCalendarId: Boolean(config.google.calendarId),
        hasSpreadsheetId: Boolean(config.google.spreadsheetId),
        hasClinicEmail: Boolean(config.google.clinicEmail),
      },
      gemini: {
        configured: Boolean(config.gemini.apiKey),
      },
    },
  };
}
