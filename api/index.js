// server/vercel.ts
import express from "express";

// server/api/routes.ts
import { Router } from "express";

// server/config.ts
import dotenv from "dotenv";
dotenv.config();
var PORT = parseInt(process.env.PORT || "3000", 10);
var getBaseAppUrl = () => {
  if (process.env.APP_URL) {
    return process.env.APP_URL.replace(/\/$/, "");
  }
  if (process.env.VERCEL_PROJECT_PRODUCTION_URL) {
    return `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL.replace(/\/$/, "")}`;
  }
  if (process.env.VERCEL_URL) {
    return `https://${process.env.VERCEL_URL.replace(/\/$/, "")}`;
  }
  return `http://localhost:${PORT}`;
};
var APP_URL = getBaseAppUrl();
var DEFAULT_REDIRECT_URI = `${APP_URL}/api/auth/google/callback`;
var GOOGLE_REDIRECT_URI = process.env.GOOGLE_REDIRECT_URI || DEFAULT_REDIRECT_URI;
var config = {
  port: PORT,
  appUrl: APP_URL,
  geminiApiKey: process.env.GEMINI_API_KEY,
  google: {
    clientId: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    redirectUri: GOOGLE_REDIRECT_URI,
    refreshToken: process.env.GOOGLE_REFRESH_TOKEN,
    calendarId: process.env.GOOGLE_CALENDAR_ID || "primary",
    spreadsheetId: process.env.GOOGLE_SPREADSHEET_ID,
    clinicNotificationEmail: process.env.CLINIC_NOTIFICATION_EMAIL,
    isOAuthConfigured: Boolean(
      process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET && !process.env.GOOGLE_CLIENT_ID.includes("YOUR_GOOGLE_CLIENT_ID")
    )
  }
};
function getSanitizedConfigStatus() {
  return {
    environment: process.env.NODE_ENV || "development",
    appUrl: config.appUrl,
    redirectUri: config.google.redirectUri,
    googleOAuth: {
      configured: config.google.isOAuthConfigured,
      hasClientId: Boolean(config.google.clientId && !config.google.clientId.includes("YOUR_GOOGLE_CLIENT_ID")),
      hasClientSecret: Boolean(config.google.clientSecret && !config.google.clientSecret.includes("YOUR_GOOGLE_CLIENT_SECRET")),
      hasSpreadsheetId: Boolean(config.google.spreadsheetId && !config.google.spreadsheetId.includes("YOUR_GOOGLE_SPREADSHEET_ID")),
      calendarId: config.google.calendarId,
      hasNotificationEmail: Boolean(config.google.clinicNotificationEmail)
    },
    aiAssistant: {
      hasGeminiApiKey: Boolean(config.geminiApiKey && !config.geminiApiKey.includes("MY_GEMINI_API_KEY"))
    }
  };
}

// server/auth/googleOAuth.ts
import { google } from "googleapis";
import crypto from "crypto";
var REQUIRED_SCOPES = [
  "https://www.googleapis.com/auth/calendar.events",
  "https://www.googleapis.com/auth/spreadsheets",
  "https://www.googleapis.com/auth/gmail.send",
  "https://www.googleapis.com/auth/userinfo.email"
];
var storedTokens = null;
function getStateSecret() {
  const secret = process.env.OAUTH_STATE_SECRET || config.google.clientSecret || process.env.SESSION_SECRET;
  if (!secret) {
    throw new Error("Server configuration error: OAUTH_STATE_SECRET or GOOGLE_CLIENT_SECRET must be set for secure OAuth state signing.");
  }
  return secret;
}
function createSignedState(returnPath) {
  const secret = getStateSecret();
  const nonce = crypto.randomBytes(16).toString("hex");
  const createdAt = Date.now();
  const safePath = encodeURIComponent(returnPath);
  const payload = `${nonce}:${createdAt}:${safePath}`;
  const signature = crypto.createHmac("sha256", secret).update(payload).digest("hex");
  return Buffer.from(`${payload}:${signature}`).toString("base64url");
}
function verifySignedState(stateToken) {
  if (!stateToken || typeof stateToken !== "string") {
    return null;
  }
  try {
    const secret = getStateSecret();
    const decoded = Buffer.from(stateToken, "base64url").toString("utf8");
    const parts = decoded.split(":");
    if (parts.length !== 4) return null;
    const [nonce, createdAtStr, safePath, receivedSignature] = parts;
    const createdAt = parseInt(createdAtStr, 10);
    if (isNaN(createdAt)) return null;
    if (Date.now() - createdAt > 10 * 60 * 1e3) {
      console.warn("[OAuth State Token Expired] Creation timestamp was older than 10 minutes.");
      return null;
    }
    const payload = `${nonce}:${createdAtStr}:${safePath}`;
    const expectedSignature = crypto.createHmac("sha256", secret).update(payload).digest("hex");
    const expectedBuf = Buffer.from(expectedSignature, "utf8");
    const receivedBuf = Buffer.from(receivedSignature, "utf8");
    if (expectedBuf.length !== receivedBuf.length) {
      return null;
    }
    if (!crypto.timingSafeEqual(expectedBuf, receivedBuf)) {
      return null;
    }
    return decodeURIComponent(safePath);
  } catch (err) {
    console.error("[OAuth State Verification Error]:", err?.message || err);
    return null;
  }
}
function getOAuth2Client() {
  if (!config.google.clientId || !config.google.clientSecret) {
    throw new Error("Google OAuth credentials missing: GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET must be configured.");
  }
  return new google.auth.OAuth2(
    config.google.clientId,
    config.google.clientSecret,
    config.google.redirectUri
  );
}
function generateAuthUrl(returnPath = "/admin") {
  const oauth2Client = getOAuth2Client();
  const stateToken = createSignedState(returnPath);
  const authUrl = oauth2Client.generateAuthUrl({
    access_type: "offline",
    prompt: "consent",
    scope: REQUIRED_SCOPES,
    state: stateToken
  });
  return { authUrl, state: stateToken };
}
async function handleOAuthCallback(code, stateToken) {
  const returnPath = verifySignedState(stateToken);
  if (!returnPath) {
    throw new Error("Invalid, tampered, or expired OAuth state parameter. Please try authorizing again.");
  }
  const oauth2Client = getOAuth2Client();
  const { tokens } = await oauth2Client.getToken(code);
  storedTokens = tokens;
  oauth2Client.setCredentials(tokens);
  let userEmail;
  try {
    const oauth2 = google.oauth2({ version: "v2", auth: oauth2Client });
    const userInfo = await oauth2.userinfo.get();
    userEmail = userInfo.data.email;
  } catch (err) {
    console.warn("Could not retrieve user info after OAuth callback:", err?.message || err);
  }
  return {
    tokens,
    userEmail,
    returnPath
  };
}
function getAuthenticatedClient() {
  const oauth2Client = getOAuth2Client();
  if (storedTokens) {
    oauth2Client.setCredentials(storedTokens);
    return oauth2Client;
  }
  if (config.google.refreshToken) {
    oauth2Client.setCredentials({
      refresh_token: config.google.refreshToken
    });
    return oauth2Client;
  }
  throw new Error("No active Google OAuth credentials. Clinic admin must authorize via /api/auth/google/url or set GOOGLE_REFRESH_TOKEN.");
}

// server/services/googleCalendar.ts
import { google as google2 } from "googleapis";
async function createCalendarEvent(appointment) {
  try {
    const auth = getAuthenticatedClient();
    const calendar = google2.calendar({ version: "v3", auth });
    const appointmentDate = new Date(`${appointment.date}T${appointment.time}:00`);
    const endDate = new Date(appointmentDate.getTime() + 45 * 60 * 1e3);
    const event = {
      summary: `CarePlus Clinic: ${appointment.serviceName} - ${appointment.patientName}`,
      description: `Appointment Details:
- Patient: ${appointment.patientName}
- Phone: ${appointment.patientPhone}
- Email: ${appointment.patientEmail}
- Doctor: ${appointment.doctorName || "Assigned Physician"}
- Service: ${appointment.serviceName}
- Notes: ${appointment.notes || "None provided"}
Reference ID: ${appointment.id}`,
      start: {
        dateTime: appointmentDate.toISOString(),
        timeZone: "UTC"
      },
      end: {
        dateTime: endDate.toISOString(),
        timeZone: "UTC"
      },
      attendees: [
        { email: appointment.patientEmail, displayName: appointment.patientName }
      ],
      reminders: {
        useDefault: false,
        overrides: [
          { method: "email", minutes: 24 * 60 },
          { method: "popup", minutes: 30 }
        ]
      }
    };
    const response = await calendar.events.insert({
      calendarId: config.google.calendarId,
      requestBody: event
    });
    return {
      success: true,
      eventId: response.data.id || void 0,
      htmlLink: response.data.htmlLink || void 0
    };
  } catch (error) {
    console.error("Google Calendar API Error:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to create Google Calendar event"
    };
  }
}
async function checkAvailability(date, time) {
  try {
    const auth = getAuthenticatedClient();
    const calendar = google2.calendar({ version: "v3", auth });
    const requestedStart = new Date(`${date}T${time}:00`);
    const requestedEnd = new Date(requestedStart.getTime() + 45 * 60 * 1e3);
    const dayStart = new Date(`${date}T00:00:00Z`);
    const dayEnd = new Date(`${date}T23:59:59Z`);
    const response = await calendar.events.list({
      calendarId: config.google.calendarId,
      timeMin: dayStart.toISOString(),
      timeMax: dayEnd.toISOString(),
      singleEvents: true,
      orderBy: "startTime"
    });
    const events = response.data.items || [];
    const hasConflict = events.some((event) => {
      const eventStart = new Date(event.start?.dateTime || event.start?.date || "");
      const eventEnd = new Date(event.end?.dateTime || event.end?.date || "");
      return requestedStart < eventEnd && requestedEnd > eventStart;
    });
    return {
      available: !hasConflict,
      conflicts: hasConflict ? 1 : 0
    };
  } catch (error) {
    console.error("Calendar availability check fallback:", error);
    return {
      available: true,
      conflicts: 0
    };
  }
}

// server/services/googleSheets.ts
import { google as google3 } from "googleapis";
async function appendAppointmentRow(appointment) {
  try {
    if (!config.google.spreadsheetId) {
      console.warn("GOOGLE_SPREADSHEET_ID is not configured. Skipping Google Sheets row append.");
      return {
        success: false,
        error: "GOOGLE_SPREADSHEET_ID is not configured"
      };
    }
    const auth = getAuthenticatedClient();
    const sheets = google3.sheets({ version: "v4", auth });
    const rowValues = [
      appointment.id,
      (/* @__PURE__ */ new Date()).toISOString(),
      appointment.patientName,
      appointment.patientEmail,
      appointment.patientPhone,
      appointment.serviceName,
      appointment.doctorName || "Assigned Physician",
      appointment.date,
      appointment.time,
      appointment.status || "confirmed",
      appointment.notes || ""
    ];
    const response = await sheets.spreadsheets.values.append({
      spreadsheetId: config.google.spreadsheetId,
      range: "Appointments!A:K",
      valueInputOption: "USER_ENTERED",
      insertDataOption: "INSERT_ROWS",
      requestBody: {
        values: [rowValues]
      }
    });
    return {
      success: true,
      updatedRange: response.data.updates?.updatedRange || void 0
    };
  } catch (error) {
    console.error("Google Sheets API Error:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to append to Google Sheets"
    };
  }
}

// server/services/gmail.ts
import { google as google4 } from "googleapis";
function createMimeMessage({
  to,
  from,
  subject,
  htmlBody
}) {
  const boundary = `__careplus_mime_boundary_${Date.now()}__`;
  const messageParts = [
    `From: CarePlus Clinic <${from}>`,
    `To: ${to}`,
    `Subject: =?UTF-8?B?${Buffer.from(subject).toString("base64")}?=`,
    "MIME-Version: 1.0",
    `Content-Type: multipart/alternative; boundary="${boundary}"`,
    "",
    `--${boundary}`,
    "Content-Type: text/plain; charset=UTF-8",
    "Content-Transfer-Encoding: 7bit",
    "",
    htmlBody.replace(/<[^>]*>/g, ""),
    "",
    `--${boundary}`,
    "Content-Type: text/html; charset=UTF-8",
    "Content-Transfer-Encoding: 7bit",
    "",
    htmlBody,
    "",
    `--${boundary}--`
  ];
  const rawMessage = messageParts.join("\r\n");
  return Buffer.from(rawMessage).toString("base64url");
}
async function sendAppointmentConfirmation(appointment) {
  try {
    const auth = getAuthenticatedClient();
    const gmail = google4.gmail({ version: "v1", auth });
    const clinicSender = config.google.clinicNotificationEmail || "appointments@careplusclinic.com";
    const subject = `Confirmed: Your CarePlus Clinic Appointment (${appointment.date} at ${appointment.time})`;
    const htmlBody = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 24px; color: #1e293b;">
        <div style="background: linear-gradient(135deg, #0284c7, #0369a1); padding: 24px; border-radius: 12px 12px 0 0; color: white;">
          <h1 style="margin: 0; font-size: 24px;">CarePlus Clinic</h1>
          <p style="margin: 8px 0 0 0; opacity: 0.9;">Appointment Confirmation</p>
        </div>
        <div style="border: 1px solid #e2e8f0; border-top: none; padding: 24px; border-radius: 0 0 12px 12px;">
          <p>Dear <strong>${appointment.patientName}</strong>,</p>
          <p>Your appointment has been successfully scheduled. Here are the details:</p>
          <div style="background-color: #f8fafc; border-left: 4px solid #0284c7; padding: 16px; margin: 20px 0;">
            <p style="margin: 4px 0;"><strong>Service:</strong> ${appointment.serviceName}</p>
            <p style="margin: 4px 0;"><strong>Doctor:</strong> ${appointment.doctorName || "Assigned Physician"}</p>
            <p style="margin: 4px 0;"><strong>Date:</strong> ${appointment.date}</p>
            <p style="margin: 4px 0;"><strong>Time:</strong> ${appointment.time}</p>
            <p style="margin: 4px 0;"><strong>Appointment ID:</strong> <code>${appointment.id}</code></p>
          </div>
          <p style="color: #64748b; font-size: 14px;">
            Please arrive 10 minutes prior to your scheduled time. If you need to reschedule or cancel, please contact the clinic at least 24 hours in advance.
          </p>
          <div style="margin-top: 32px; padding-top: 16px; border-top: 1px solid #e2e8f0; font-size: 12px; color: #94a3b8; text-align: center;">
            CarePlus Clinic &bull; 100 Healthcare Blvd, Suite 400 &bull; (555) 019-2834
          </div>
        </div>
      </div>
    `;
    const raw = createMimeMessage({
      to: appointment.patientEmail,
      from: clinicSender,
      subject,
      htmlBody
    });
    const response = await gmail.users.messages.send({
      userId: "me",
      requestBody: { raw }
    });
    return {
      success: true,
      messageId: response.data.id || void 0
    };
  } catch (error) {
    console.error("Gmail API Error:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to send confirmation email via Gmail"
    };
  }
}

// server/api/routes.ts
var router = Router();
router.get("/status", (req, res) => {
  const sanitized = getSanitizedConfigStatus();
  return res.json({
    ok: true,
    service: "CarePlus Clinic API",
    timestamp: (/* @__PURE__ */ new Date()).toISOString(),
    config: sanitized
  });
});
router.get("/health", (req, res) => {
  return res.json({
    ok: true,
    status: "healthy",
    uptime: process.uptime()
  });
});
router.get("/auth/google/url", (req, res) => {
  try {
    if (!config.google.clientId || !config.google.clientSecret) {
      return res.status(503).json({
        ok: false,
        error: "Google OAuth credentials (GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET) are not configured."
      });
    }
    const returnPath = typeof req.query.returnTo === "string" ? req.query.returnTo : "/admin";
    const { authUrl } = generateAuthUrl(returnPath);
    return res.json({
      ok: true,
      authUrl
    });
  } catch (error) {
    console.error("Error generating OAuth authorization URL:", error);
    return res.status(500).json({
      ok: false,
      error: error instanceof Error ? error.message : "Failed to generate Google authorization URL"
    });
  }
});
router.get("/auth/google/callback", async (req, res) => {
  const code = req.query.code;
  const state = req.query.state;
  const errorParam = req.query.error;
  if (errorParam) {
    console.error("[OAuth Provider Error]:", errorParam);
    return res.redirect(`/admin?oauth_error=${encodeURIComponent(String(errorParam))}`);
  }
  if (!code || !state) {
    return res.status(400).json({
      ok: false,
      error: "Missing required authorization code or state token in callback."
    });
  }
  try {
    const result = await handleOAuthCallback(code, state);
    console.log(`[Google OAuth Success] Authenticated account: ${result.userEmail || "unknown"}`);
    const redirectTarget = `${result.returnPath || "/admin"}?oauth_success=1`;
    return res.redirect(redirectTarget);
  } catch (error) {
    console.error("OAuth exchange failed:", error);
    const errorMsg = error instanceof Error ? error.message : "OAuth authorization failed";
    return res.redirect(`/admin?oauth_error=${encodeURIComponent(errorMsg)}`);
  }
});
router.get("/appointments/check-availability", async (req, res) => {
  const { date, time } = req.query;
  if (!date || !time) {
    return res.status(400).json({
      ok: false,
      error: "Both 'date' (YYYY-MM-DD) and 'time' (HH:MM) parameters are required."
    });
  }
  try {
    const availability = await checkAvailability(String(date), String(time));
    return res.json({
      ok: true,
      date,
      time,
      ...availability
    });
  } catch (error) {
    console.error("Availability check endpoint error:", error);
    return res.status(500).json({
      ok: false,
      error: "Failed to verify appointment slot availability"
    });
  }
});
router.post("/appointments", async (req, res) => {
  const body = req.body || {};
  const { patientName, patientEmail, patientPhone, serviceName, doctorName, date, time, notes } = body;
  if (!patientName || !patientEmail || !patientPhone || !serviceName || !date || !time) {
    return res.status(400).json({
      ok: false,
      error: "Missing required appointment fields: patientName, patientEmail, patientPhone, serviceName, date, and time are required."
    });
  }
  const appointmentId = `APT-${Date.now().toString(36).toUpperCase()}-${Math.random().toString(36).substring(2, 6).toUpperCase()}`;
  const appointment = {
    id: appointmentId,
    patientName,
    patientEmail,
    patientPhone,
    serviceName,
    doctorName,
    date,
    time,
    notes,
    status: "confirmed"
  };
  const integrations = {
    calendar: { attempted: false, success: false },
    sheets: { attempted: false, success: false },
    gmail: { attempted: false, success: false }
  };
  try {
    integrations.calendar.attempted = true;
    const calResult = await createCalendarEvent(appointment);
    integrations.calendar.success = calResult.success;
    if (calResult.error) integrations.calendar.error = calResult.error;
    if (calResult.eventId) integrations.calendar.eventId = calResult.eventId;
  } catch (err) {
    console.error("Calendar task error:", err);
    integrations.calendar.error = err instanceof Error ? err.message : "Calendar integration error";
  }
  try {
    integrations.sheets.attempted = true;
    const sheetsResult = await appendAppointmentRow(appointment);
    integrations.sheets.success = sheetsResult.success;
    if (sheetsResult.error) integrations.sheets.error = sheetsResult.error;
  } catch (err) {
    console.error("Sheets task error:", err);
    integrations.sheets.error = err instanceof Error ? err.message : "Sheets integration error";
  }
  try {
    integrations.gmail.attempted = true;
    const gmailResult = await sendAppointmentConfirmation(appointment);
    integrations.gmail.success = gmailResult.success;
    if (gmailResult.error) integrations.gmail.error = gmailResult.error;
  } catch (err) {
    console.error("Gmail task error:", err);
    integrations.gmail.error = err instanceof Error ? err.message : "Gmail integration error";
  }
  return res.status(201).json({
    ok: true,
    message: "Appointment successfully booked",
    appointment,
    integrations
  });
});
var apiRouter = router;

// server/vercel.ts
var app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use((req, res, next) => {
  const sanitizedMethod = req.method;
  const sanitizedPath = req.path;
  console.log(`[Vercel Serverless API] ${sanitizedMethod} ${sanitizedPath}`);
  next();
});
app.use("/api", apiRouter);
app.use("/", apiRouter);
app.use((err, req, res, next) => {
  console.error("[API Server Error]:", err?.message || err);
  if (res.headersSent) {
    return next(err);
  }
  res.status(500).json({
    ok: false,
    error: "An internal server error occurred while processing the request."
  });
});
var vercel_default = app;
export {
  vercel_default as default
};
