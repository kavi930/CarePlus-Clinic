/**
 * CarePlus Clinic - Server Configuration
 * Loads environment variables and provides sanitized configuration state.
 * Never exposes secrets to frontend or logs.
 */

import dotenv from 'dotenv';
dotenv.config();

export interface ServerConfig {
  port: number;
  appUrl: string;
  geminiApiKey: string | undefined;
  google: {
    clientId: string | undefined;
    clientSecret: string | undefined;
    redirectUri: string;
    refreshToken: string | undefined;
    calendarId: string;
    spreadsheetId: string | undefined;
    clinicNotificationEmail: string | undefined;
    isOAuthConfigured: boolean;
  };
}

const PORT = parseInt(process.env.PORT || '3000', 10);
const APP_URL = process.env.APP_URL || `http://localhost:${PORT}`;

// Compute default redirect URI if not explicitly provided
const DEFAULT_REDIRECT_URI = `${APP_URL.replace(/\/$/, '')}/api/auth/google/callback`;
const GOOGLE_REDIRECT_URI = process.env.GOOGLE_REDIRECT_URI || DEFAULT_REDIRECT_URI;

export const config: ServerConfig = {
  port: PORT,
  appUrl: APP_URL,
  geminiApiKey: process.env.GEMINI_API_KEY,
  google: {
    clientId: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    redirectUri: GOOGLE_REDIRECT_URI,
    refreshToken: process.env.GOOGLE_REFRESH_TOKEN,
    calendarId: process.env.GOOGLE_CALENDAR_ID || 'primary',
    spreadsheetId: process.env.GOOGLE_SPREADSHEET_ID,
    clinicNotificationEmail: process.env.CLINIC_NOTIFICATION_EMAIL,
    isOAuthConfigured: Boolean(
      process.env.GOOGLE_CLIENT_ID && 
      process.env.GOOGLE_CLIENT_SECRET &&
      !process.env.GOOGLE_CLIENT_ID.includes('YOUR_GOOGLE_CLIENT_ID')
    ),
  },
};

/**
 * Returns a sanitized diagnostic overview safe to share with client or dashboard.
 * Zero secrets or tokens are returned.
 */
export function getSanitizedConfigStatus() {
  return {
    environment: process.env.NODE_ENV || 'development',
    appUrl: config.appUrl,
    redirectUri: config.google.redirectUri,
    googleOAuth: {
      configured: config.google.isOAuthConfigured,
      hasClientId: Boolean(config.google.clientId && !config.google.clientId.includes('YOUR_GOOGLE_CLIENT_ID')),
      hasClientSecret: Boolean(config.google.clientSecret && !config.google.clientSecret.includes('YOUR_GOOGLE_CLIENT_SECRET')),
      hasSpreadsheetId: Boolean(config.google.spreadsheetId && !config.google.spreadsheetId.includes('YOUR_GOOGLE_SPREADSHEET_ID')),
      calendarId: config.google.calendarId,
      hasNotificationEmail: Boolean(config.google.clinicNotificationEmail),
    },
    aiAssistant: {
      hasGeminiApiKey: Boolean(config.geminiApiKey && !config.geminiApiKey.includes('MY_GEMINI_API_KEY')),
    },
  };
}
