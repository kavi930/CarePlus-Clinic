/**
 * CarePlus Clinic - Express API Routes
 * Implements server-side endpoints for status, OAuth, availability,
 * safe booking, and administrative AI chat assistant.
 */

import { Router, Request, Response } from 'express';
import { getSanitizedConfigStatus, config } from '../config';
import { 
  generateAuthUrl, 
  handleOAuthCallback, 
  isGoogleAuthorized, 
  getConnectedGoogleEmail, 
  disconnectGoogle 
} from '../auth/googleOAuth';
import { checkCalendarAvailability } from '../services/calendarService';
import { processAppointmentBooking } from '../services/bookingPipeline';
import { testSheetConnection } from '../services/sheetsService';
import { GoogleGenAI } from '@google/genai';

export const apiRouter = Router();

// 1. System Health & Integration Status (Zero secrets exposed)
apiRouter.get('/status', (req: Request, res: Response) => {
  const sanitized = getSanitizedConfigStatus();
  res.json({
    ok: true,
    status: 'online',
    timestamp: new Date().toISOString(),
    config: sanitized,
    auth: {
      isGoogleAuthorized: isGoogleAuthorized(),
      connectedEmail: getConnectedGoogleEmail(),
    },
  });
});

// 2. Google OAuth Initiation
apiRouter.get('/auth/google/url', (req: Request, res: Response) => {
  try {
    const returnPath = (req.query.returnPath as string) || '/admin#settings';
    const { url, state } = generateAuthUrl(returnPath);
    res.json({ ok: true, url, state });
  } catch (error: any) {
    res.status(400).json({ ok: false, error: error.message });
  }
});

// 3. Google OAuth Callback
apiRouter.get('/auth/google/callback', async (req: Request, res: Response) => {
  const { code, state, error } = req.query;

  if (error) {
    console.warn('[GoogleOAuth Callback] Error parameter received:', error);
    return res.redirect(`/admin?oauth=error&message=${encodeURIComponent(String(error))}#settings`);
  }

  if (!code || !state) {
    return res.redirect('/admin?oauth=error&message=Missing+code+or+state#settings');
  }

  try {
    const result = await handleOAuthCallback(String(code), String(state));
    console.log(`[GoogleOAuth Callback] Successfully authorized account: ${result.userEmail || 'unknown'}`);
    res.redirect(`${result.returnUrl}?oauth=success&email=${encodeURIComponent(result.userEmail || '')}`);
  } catch (err: any) {
    console.error('[GoogleOAuth Callback] Token exchange failed:', err.message);
    res.redirect(`/admin?oauth=error&message=${encodeURIComponent(err.message)}#settings`);
  }
});

// 4. Google OAuth Disconnect
apiRouter.post('/auth/google/disconnect', async (req: Request, res: Response) => {
  try {
    await disconnectGoogle();
    res.json({ ok: true, message: 'Google account disconnected successfully.' });
  } catch (error: any) {
    res.status(500).json({ ok: false, error: error.message });
  }
});

// 5. Check Slot Availability
apiRouter.post('/appointments/check-availability', async (req: Request, res: Response) => {
  try {
    const { date, timeSlots } = req.body;
    if (!date) {
      return res.status(400).json({ ok: false, error: 'Target date is required.' });
    }
    const availability = await checkCalendarAvailability(date, timeSlots);
    res.json({ ok: true, ...availability });
  } catch (error: any) {
    res.status(500).json({ ok: false, error: error.message });
  }
});

// 6. Safe Transactional Appointment Booking
apiRouter.post('/appointments/book', async (req: Request, res: Response) => {
  try {
    const payload = req.body;
    const result = await processAppointmentBooking(payload);
    res.json({ ok: true, ...result });
  } catch (error: any) {
    console.warn('[Booking Error]:', error.message);
    res.status(400).json({ ok: false, error: error.message });
  }
});

// 7. Diagnostics / Test Integration Connections
apiRouter.post('/admin/test-connections', async (req: Request, res: Response) => {
  const isAuthorized = isGoogleAuthorized();
  if (!isAuthorized) {
    return res.json({
      ok: true,
      authorized: false,
      message: 'Google OAuth not authorized. Running in safe simulated mode.',
    });
  }

  const results: any = {
    authorized: true,
    calendar: { tested: false },
    sheets: { tested: false },
  };

  try {
    const calTest = await checkCalendarAvailability(new Date().toISOString().split('T')[0]);
    results.calendar = {
      tested: true,
      success: !calTest.isSimulated,
      calendarId: calTest.calendarId,
    };
  } catch (e: any) {
    results.calendar = { tested: true, success: false, error: e.message };
  }

  try {
    const sheetTest = await testSheetConnection();
    results.sheets = {
      tested: true,
      ...sheetTest,
    };
  } catch (e: any) {
    results.sheets = { tested: true, success: false, error: e.message };
  }

  res.json({ ok: true, results });
});

// 8. Server-Side Administrative AI Chat Assistant
apiRouter.post('/chat/message', async (req: Request, res: Response) => {
  const { message, conversationHistory } = req.body;
  if (!message || typeof message !== 'string') {
    return res.status(400).json({ ok: false, error: 'Message text is required.' });
  }

  const lower = message.toLowerCase().trim();

  // Safety Gate 1: Urgent Life-Threatening Emergency
  if (
    lower.includes('chest pain') ||
    lower.includes('heart attack') ||
    lower.includes("can't breathe") ||
    lower.includes('shortness of breath') ||
    lower.includes('unconscious') ||
    lower.includes('severe bleeding') ||
    lower.includes('overdose') ||
    lower.includes('stroke')
  ) {
    return res.json({
      ok: true,
      isEmergency: true,
      isClinical: false,
      reply:
        '🚨 URGENT MEDICAL EMERGENCY NOTICE:\n\nIf you or someone with you is experiencing a medical emergency, please do not wait for clinic chat. Call emergency services (911 / 112) immediately or go to the nearest hospital emergency room.\n\nOur system is an administrative assistant only and cannot provide emergency medical care.',
      quickActions: [{ label: 'Emergency Guidance' }],
    });
  }

  // Safety Gate 2: Medical Advice, Clinical Diagnosis, Medication, or Lab Interpretation
  const medicalKeywords = [
    'diagnose', 'diagnosis', 'symptom', 'rash', 'pain', 'fever', 'swelling',
    'lump', 'pill', 'medicine', 'medication', 'dosage', 'antibiotic',
    'steroid', 'infection', 'blood test', 'lab result', 'biopsy', 'cure',
    'treatment recommendation', 'allergy', 'allergic reaction', 'prescribe'
  ];

  const isMedicalQuery = medicalKeywords.some((kw) => lower.includes(kw));
  if (isMedicalQuery) {
    return res.json({
      ok: true,
      isEmergency: false,
      isClinical: true,
      reply:
        "I can help with appointments and general clinic information, but I can't provide medical advice or diagnosis. Would you like me to connect you with clinic staff?",
      quickActions: [
        { label: 'Talk to Staff' },
        { label: 'Book Appointment' },
      ],
    });
  }

  // Attempt server-side Gemini generation if GEMINI_API_KEY is available
  if (config.geminiApiKey && !config.geminiApiKey.includes('MY_GEMINI_API_KEY')) {
    try {
      const ai = new GoogleGenAI();
      const prompt = `You are the administrative assistant for CarePlus Clinic (Dermatology & Skin Care).
STRICT RULES:
1. You are NOT a doctor. You must NEVER provide medical advice, diagnosis, treatment plans, or medication recommendations.
2. If asked anything medical, decline politely and suggest speaking with clinic staff or booking a consultation.
3. Help only with clinic hours (Mon-Sat 9 AM - 7 PM), location (Suite 400, Medical Plaza Blvd), doctors (Dr. Ananya Mehta, Dr. Rahul Verma), fees ($75 General, $85 Skin Consultation), and booking appointments.
4. Keep answers concise, welcoming, and administrative.

Patient query: "${message}"`;

      const geminiResponse = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: prompt,
      });

      const text = geminiResponse.text?.trim() || '';
      if (text) {
        return res.json({
          ok: true,
          reply: text,
          isAiPowered: true,
        });
      }
    } catch (geminiError: any) {
      console.warn('[Gemini Chat Error]:', geminiError.message);
      // Fallback to rule-based administrative response below
    }
  }

  // Rule-based administrative responses
  if (lower.includes('fee') || lower.includes('cost') || lower.includes('price')) {
    return res.json({
      ok: true,
      reply:
        'Our consultation fees are:\n• General Consultation: $75\n• Skin Consultation (Dr. Ananya Mehta): $85\n• Specialist Consultation: $110\n• Follow-up Visit: $45\n\nWould you like to book a consultation slot?',
      quickActions: [{ label: 'Book Appointment' }, { label: 'Talk to Staff' }],
    });
  }

  if (lower.includes('hour') || lower.includes('time') || lower.includes('open')) {
    return res.json({
      ok: true,
      reply:
        'CarePlus Clinic is open Monday through Saturday from 9:00 AM to 7:00 PM. Closed on Sundays. Attending physicians: Dr. Ananya Mehta and Dr. Rahul Verma.',
      quickActions: [{ label: 'Book Appointment' }, { label: 'Clinic Information' }],
    });
  }

  if (lower.includes('where') || lower.includes('address') || lower.includes('location')) {
    return res.json({
      ok: true,
      reply:
        'CarePlus Clinic is located at Suite 400, Medical Plaza Blvd, Metro Health District. Free validated patient parking is available on Level P2.',
      quickActions: [{ label: 'Book Appointment' }, { label: 'Services' }],
    });
  }

  return res.json({
    ok: true,
    reply:
      "👋 Welcome to CarePlus Clinic. I can help with appointments and general clinic information. What would you like to do?",
    quickActions: [
      { label: 'Book Appointment' },
      { label: 'Clinic Information' },
      { label: 'Services' },
      { label: 'Talk to Staff' },
    ],
  });
});
