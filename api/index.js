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
    const [nonce, createdAtStr, safePath, signature] = parts;
    const createdAt = parseInt(createdAtStr, 10);
    if (isNaN(createdAt)) return null;
    const TEN_MINUTES_MS = 10 * 60 * 1e3;
    if (Date.now() - createdAt > TEN_MINUTES_MS || Date.now() < createdAt - 6e4) {
      console.warn("[GoogleOAuth] State token expired or invalid timestamp.");
      return null;
    }
    const payload = `${nonce}:${createdAtStr}:${safePath}`;
    const expectedSignature = crypto.createHmac("sha256", secret).update(payload).digest("hex");
    const sigBuffer = Buffer.from(signature, "hex");
    const expectedBuffer = Buffer.from(expectedSignature, "hex");
    if (sigBuffer.length !== expectedBuffer.length || !crypto.timingSafeEqual(sigBuffer, expectedBuffer)) {
      console.warn("[GoogleOAuth] State token signature mismatch.");
      return null;
    }
    return decodeURIComponent(safePath);
  } catch (err) {
    console.warn("[GoogleOAuth] State verification failed:", err?.message || err);
    return null;
  }
}
function getOAuth2Client() {
  const { clientId, clientSecret, redirectUri } = config.google;
  if (!clientId || !clientSecret) {
    throw new Error("Google OAuth credentials missing. Set GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET.");
  }
  return new google.auth.OAuth2(clientId, clientSecret, redirectUri);
}
function generateAuthUrl(returnPath = "/admin#settings") {
  const oauth2Client = getOAuth2Client();
  const state = createSignedState(returnPath);
  const url = oauth2Client.generateAuthUrl({
    access_type: "offline",
    prompt: "consent",
    scope: REQUIRED_SCOPES,
    state
  });
  return { url, state };
}
async function handleOAuthCallback(code, stateToken) {
  const verifiedReturnPath = verifySignedState(stateToken);
  if (!verifiedReturnPath) {
    throw new Error("Invalid or expired OAuth state token. Please restart authentication.");
  }
  const oauth2Client = getOAuth2Client();
  const { tokens } = await oauth2Client.getToken(code);
  oauth2Client.setCredentials(tokens);
  storedTokens = tokens;
  let userEmail = null;
  try {
    const oauth2 = google.oauth2({ version: "v2", auth: oauth2Client });
    const userInfo = await oauth2.userinfo.get();
    userEmail = userInfo.data.email || null;
    if (userEmail) {
      storedTokens.email = userEmail;
    }
  } catch (e) {
    console.warn("[GoogleOAuth] Could not fetch user email:", e.message);
  }
  console.log(`[GoogleOAuth] Successfully authorized account: ${userEmail || "unknown"}`);
  if (tokens.refresh_token) {
    console.log("[GoogleOAuth] NOTE: Refresh token received. Configure GOOGLE_REFRESH_TOKEN in Vercel environment variables for persistence.");
  }
  return {
    success: true,
    returnPath: verifiedReturnPath,
    email: userEmail
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
  return null;
}
function isGoogleAuthorized() {
  return Boolean(storedTokens?.access_token || config.google.refreshToken);
}
function getConnectedGoogleEmail() {
  return storedTokens?.email || (config.google.refreshToken ? "Configured via GOOGLE_REFRESH_TOKEN" : null);
}
function disconnectGoogle() {
  storedTokens = null;
}

// server/services/calendarService.ts
import { google as google2 } from "googleapis";
async function checkCalendarAvailability(dateStr) {
  const authClient = getAuthenticatedClient();
  const allSlots = ["09:00 AM", "10:00 AM", "11:00 AM", "01:00 PM", "02:00 PM", "03:00 PM", "04:00 PM"];
  if (!authClient) {
    return {
      date: dateStr,
      availableSlots: allSlots,
      source: "demo_unconnected"
    };
  }
  try {
    const calendar = google2.calendar({ version: "v3", auth: authClient });
    const calendarId = config.google.calendarId;
    const timeMin = new Date(`${dateStr}T00:00:00Z`).toISOString();
    const timeMax = new Date(`${dateStr}T23:59:59Z`).toISOString();
    const freeBusyRes = await calendar.freebusy.query({
      requestBody: {
        timeMin,
        timeMax,
        items: [{ id: calendarId }]
      }
    });
    const busyRanges = freeBusyRes.data.calendars?.[calendarId]?.busy || [];
    const available = allSlots.filter((slot) => {
      const [time, period] = slot.split(" ");
      let [hours, mins] = time.split(":").map(Number);
      if (period === "PM" && hours !== 12) hours += 12;
      if (period === "AM" && hours === 12) hours = 0;
      const slotStart = new Date(`${dateStr}T${String(hours).padStart(2, "0")}:${String(mins).padStart(2, "0")}:00Z`);
      const slotEnd = new Date(slotStart.getTime() + 45 * 60 * 1e3);
      const isOverlap = busyRanges.some((range) => {
        const bStart = new Date(range.start);
        const bEnd = new Date(range.end);
        return slotStart < bEnd && slotEnd > bStart;
      });
      return !isOverlap;
    });
    return {
      date: dateStr,
      availableSlots: available,
      source: "google_calendar"
    };
  } catch (error) {
    console.error("[CalendarService] Availability check failed:", error.message);
    return {
      date: dateStr,
      availableSlots: allSlots,
      source: "fallback_error"
    };
  }
}
async function createCalendarAppointment(appointment) {
  const authClient = getAuthenticatedClient();
  if (!authClient) {
    return { success: false, reason: "google_not_connected" };
  }
  try {
    const calendar = google2.calendar({ version: "v3", auth: authClient });
    const calendarId = config.google.calendarId;
    const [time, period] = appointment.time.split(" ");
    let [hours, mins] = time.split(":").map(Number);
    if (period === "PM" && hours !== 12) hours += 12;
    if (period === "AM" && hours === 12) hours = 0;
    const startDateTime = new Date(`${appointment.date}T${String(hours).padStart(2, "0")}:${String(mins).padStart(2, "0")}:00`);
    const endDateTime = new Date(startDateTime.getTime() + 45 * 60 * 1e3);
    const event = {
      summary: `CarePlus: ${appointment.service} - ${appointment.patientName}`,
      description: `Appointment Details:
Patient: ${appointment.patientName}
Service: ${appointment.service}
Doctor: ${appointment.doctor}
Phone: ${appointment.patientPhone}
Email: ${appointment.patientEmail}
Notes: ${appointment.notes || "None provided"}`,
      start: { dateTime: startDateTime.toISOString() },
      end: { dateTime: endDateTime.toISOString() },
      attendees: appointment.patientEmail ? [{ email: appointment.patientEmail }] : []
    };
    const res = await calendar.events.insert({
      calendarId,
      requestBody: event
    });
    return { success: true, eventId: res.data.id, htmlLink: res.data.htmlLink };
  } catch (error) {
    console.error("[CalendarService] Event creation failed:", error.message);
    return { success: false, reason: error.message };
  }
}

// server/services/sheetsService.ts
import { google as google3 } from "googleapis";
async function appendAppointmentToSheet(appointment) {
  const authClient = getAuthenticatedClient();
  const spreadsheetId = config.google.spreadsheetId;
  if (!authClient || !spreadsheetId) {
    return { success: false, reason: "sheets_not_configured" };
  }
  try {
    const sheets = google3.sheets({ version: "v4", auth: authClient });
    const row = [
      (/* @__PURE__ */ new Date()).toISOString(),
      appointment.patientName,
      appointment.patientPhone,
      appointment.patientEmail || "",
      appointment.date,
      appointment.time,
      appointment.service,
      appointment.doctor,
      appointment.notes || "",
      "CONFIRMED"
    ];
    await sheets.spreadsheets.values.append({
      spreadsheetId,
      range: "Sheet1!A:J",
      valueInputOption: "USER_ENTERED",
      requestBody: {
        values: [row]
      }
    });
    return { success: true };
  } catch (error) {
    console.error("[SheetsService] Failed to append appointment:", error.message);
    return { success: false, reason: error.message };
  }
}
async function testSheetConnection() {
  const authClient = getAuthenticatedClient();
  const spreadsheetId = config.google.spreadsheetId;
  if (!authClient || !spreadsheetId) {
    return { configured: false };
  }
  try {
    const sheets = google3.sheets({ version: "v4", auth: authClient });
    const res = await sheets.spreadsheets.get({ spreadsheetId });
    return { configured: true, title: res.data.properties?.title };
  } catch (error) {
    return { configured: false, error: error.message };
  }
}

// server/services/gmailService.ts
import { google as google4 } from "googleapis";
async function sendAppointmentConfirmationEmail(appointment) {
  const authClient = getAuthenticatedClient();
  if (!authClient || !appointment.patientEmail) {
    return { success: false, reason: "email_not_sent" };
  }
  try {
    const gmail = google4.gmail({ version: "v1", auth: authClient });
    const subject = `CarePlus Clinic: Appointment Confirmed for ${appointment.date}`;
    const bodyText = `Dear ${appointment.patientName},

Your appointment at CarePlus Clinic has been successfully confirmed.

Details:
- Date: ${appointment.date}
- Time: ${appointment.time}
- Service: ${appointment.service}
- Doctor: ${appointment.doctor}

Clinic Location: 124 Healthcare Boulevard, Suite 300
Phone: (555) 234-5678

If you need to reschedule or cancel, please contact us at least 24 hours in advance.

Warm regards,
CarePlus Clinic Patient Coordination`;
    const utf8Subject = `=?utf-8?B?${Buffer.from(subject).toString("base64")}?=`;
    const messageParts = [
      `To: ${appointment.patientEmail}`,
      "Content-Type: text/plain; charset=utf-8",
      "MIME-Version: 1.0",
      `Subject: ${utf8Subject}`,
      "",
      bodyText
    ];
    const message = messageParts.join("\n");
    const encodedMessage = Buffer.from(message).toString("base64").replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
    await gmail.users.messages.send({
      userId: "me",
      requestBody: {
        raw: encodedMessage
      }
    });
    return { success: true };
  } catch (error) {
    console.error("[GmailService] Confirmation email failed:", error.message);
    return { success: false, reason: error.message };
  }
}

// server/services/bookingPipeline.ts
async function processAppointmentBooking(appointment) {
  const errors = [];
  if (!appointment.patientName || !appointment.patientPhone || !appointment.date || !appointment.time || !appointment.service || !appointment.doctor) {
    return {
      success: false,
      confirmationId: "",
      errors: ["Missing required appointment fields."]
    };
  }
  const confirmationId = `CP-${Date.now().toString(36).toUpperCase()}-${Math.floor(1e3 + Math.random() * 9e3)}`;
  const appointmentWithId = {
    ...appointment,
    confirmationId
  };
  let calendarResult = { success: false };
  try {
    calendarResult = await createCalendarAppointment(appointmentWithId);
  } catch (e) {
    errors.push(`Calendar: ${e.message}`);
  }
  let sheetsResult = { success: false };
  try {
    sheetsResult = await appendAppointmentToSheet(appointmentWithId);
  } catch (e) {
    errors.push(`Sheets: ${e.message}`);
  }
  let emailResult = { success: false };
  if (appointment.patientEmail) {
    try {
      emailResult = await sendAppointmentConfirmationEmail(appointmentWithId);
    } catch (e) {
      errors.push(`Email: ${e.message}`);
    }
  }
  return {
    success: true,
    confirmationId,
    details: appointmentWithId,
    integrations: {
      calendar: calendarResult.success,
      calendarLink: calendarResult.htmlLink,
      sheets: sheetsResult.success,
      emailSent: emailResult.success
    },
    errors: errors.length > 0 ? errors : void 0
  };
}

// server/api/routes.ts
import { GoogleGenAI } from "@google/genai";
var apiRouter = Router();
apiRouter.get("/status", (req, res) => {
  const sanitized = getSanitizedConfigStatus();
  res.json({
    ok: true,
    status: "online",
    timestamp: (/* @__PURE__ */ new Date()).toISOString(),
    config: sanitized,
    auth: {
      isGoogleAuthorized: isGoogleAuthorized(),
      connectedEmail: getConnectedGoogleEmail()
    }
  });
});
apiRouter.get("/auth/google/url", (req, res) => {
  try {
    const returnPath = req.query.returnPath || "/admin#settings";
    const { url, state } = generateAuthUrl(returnPath);
    res.json({ ok: true, url, state });
  } catch (error) {
    res.status(400).json({ ok: false, error: error.message });
  }
});
apiRouter.get("/auth/google/callback", async (req, res) => {
  const { code, state, error } = req.query;
  if (error) {
    console.warn("[GoogleOAuth Callback] Error parameter received:", error);
    return res.redirect(`/admin?oauth=error&message=${encodeURIComponent(String(error))}#settings`);
  }
  if (!code || !state) {
    return res.redirect("/admin?oauth=error&message=Missing+code+or+state#settings");
  }
  try {
    const result = await handleOAuthCallback(String(code), String(state));
    const target = result.returnPath.startsWith("/") ? result.returnPath : "/admin#settings";
    const separator = target.includes("?") ? "&" : "?";
    res.redirect(`${target}${separator}oauth=success&email=${encodeURIComponent(result.email || "")}`);
  } catch (err) {
    console.error("[GoogleOAuth Callback Error]:", err?.message || err);
    res.redirect(`/admin?oauth=error&message=${encodeURIComponent(err.message || "OAuth+failed")}#settings`);
  }
});
apiRouter.post("/auth/google/disconnect", (req, res) => {
  disconnectGoogle();
  res.json({ ok: true, message: "Disconnected successfully." });
});
apiRouter.get("/availability", async (req, res) => {
  const date = req.query.date;
  if (!date || typeof date !== "string") {
    return res.status(400).json({ ok: false, error: "Date parameter required (YYYY-MM-DD)." });
  }
  try {
    const availability = await checkCalendarAvailability(date);
    res.json({ ok: true, ...availability });
  } catch (err) {
    res.status(500).json({ ok: false, error: err.message });
  }
});
apiRouter.post("/book", async (req, res) => {
  try {
    const { patientName, patientPhone, patientEmail, date, time, service, doctor, notes } = req.body;
    if (!patientName || !patientPhone || !date || !time || !service || !doctor) {
      return res.status(400).json({
        ok: false,
        error: "Missing required booking details (name, phone, date, time, service, doctor)."
      });
    }
    const bookingResult = await processAppointmentBooking({
      patientName: String(patientName).trim(),
      patientPhone: String(patientPhone).trim(),
      patientEmail: patientEmail ? String(patientEmail).trim() : void 0,
      date: String(date).trim(),
      time: String(time).trim(),
      service: String(service).trim(),
      doctor: String(doctor).trim(),
      notes: notes ? String(notes).trim() : void 0
    });
    res.json({ ok: true, ...bookingResult });
  } catch (err) {
    console.error("[Booking API Error]:", err);
    res.status(500).json({ ok: false, error: "Failed to complete appointment booking." });
  }
});
apiRouter.get("/integrations/sheets/test", async (req, res) => {
  const result = await testSheetConnection();
  res.json({ ok: true, ...result });
});
apiRouter.post("/assistant/chat", async (req, res) => {
  const { message, history } = req.body;
  if (!message || typeof message !== "string") {
    return res.status(400).json({ ok: false, error: "Message is required." });
  }
  const apiKey = config.geminiApiKey;
  if (!apiKey || apiKey.includes("MY_GEMINI_API_KEY")) {
    return res.json({
      ok: true,
      reply: "CarePlus Clinic AI Assistant is in offline preview mode. Please configure GEMINI_API_KEY to enable live clinical assistance."
    });
  }
  try {
    const ai = new GoogleGenAI({ apiKey });
    const systemInstruction = `You are the front-desk coordination assistant for CarePlus Clinic.
Provide helpful, professional, polite information regarding appointments, operating hours (Mon-Fri 8am-6pm, Sat 9am-2pm), general services (Pediatrics, Cardiology, Dental, General Medicine), and clinic directions.
Never provide definitive medical diagnoses; always advise patients to consult a physician for clinical emergencies.`;
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: message,
      config: {
        systemInstruction
      }
    });
    res.json({
      ok: true,
      reply: response.text || "Thank you for reaching out to CarePlus Clinic. How else may we assist you?"
    });
  } catch (error) {
    console.error("[Gemini Assistant Error]:", error.message);
    res.status(500).json({
      ok: false,
      error: "Unable to process message at this time."
    });
  }
});

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
