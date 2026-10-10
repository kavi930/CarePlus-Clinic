/**
 * CarePlus Clinic - Client-Side API Abstraction Layer
 * Interfaces with server-side endpoints for OAuth status, booking pipeline,
 * calendar availability, and AI assistant.
 * Transparently reflects Real vs. Simulated states.
 */

export interface ServerStatusResponse {
  ok: boolean;
  status: string;
  config: {
    environment: string;
    appUrl: string;
    redirectUri: string;
    googleOAuth: {
      configured: boolean;
      hasClientId: boolean;
      hasClientSecret: boolean;
      hasSpreadsheetId: boolean;
      calendarId: string;
      hasNotificationEmail: boolean;
    };
    aiAssistant: {
      hasGeminiApiKey: boolean;
    };
  };
  auth: {
    isGoogleAuthorized: boolean;
    connectedEmail: string | null;
  };
}

export interface BookingApiPayload {
  patientName: string;
  patientPhone: string;
  patientEmail: string;
  patientType: 'new' | 'existing';
  service: string;
  date: string;
  time: string;
  doctorName?: string;
  notes?: string;
  idempotencyKey?: string;
}

export interface BookingApiResponse {
  ok: boolean;
  success: boolean;
  appointmentId: string;
  idempotencyKey: string;
  isSimulated: boolean;
  appointment: {
    id: string;
    patientName: string;
    patientPhone: string;
    patientEmail: string;
    patientType: 'new' | 'existing';
    service: string;
    date: string;
    time: string;
    doctorName: string;
    status: 'Confirmed' | 'Pending';
  };
  integrations: {
    calendar: {
      isSimulated: boolean;
      eventId?: string;
      htmlLink?: string;
      summary: string;
      status: 'confirmed' | 'failed';
      error?: string;
    };
    sheets: {
      isSimulated: boolean;
      status: 'confirmed' | 'failed' | 'skipped';
      spreadsheetId?: string;
      updatedRange?: string;
      error?: string;
    };
    email: {
      isSimulated: boolean;
      status: 'confirmed' | 'failed' | 'skipped';
      recipient: string;
      messageId?: string;
      error?: string;
    };
  };
  warnings?: string[];
  duplicatePrevented?: boolean;
}

export async function fetchServerStatus(): Promise<ServerStatusResponse | null> {
  try {
    const res = await fetch('/api/status');
    if (!res.ok) return null;
    return await res.json();
  } catch (err) {
    console.warn('[ApiClient] Failed to fetch server status:', err);
    return null;
  }
}

export async function getGoogleOAuthUrl(returnPath = '/admin#settings'): Promise<string | null> {
  try {
    const res = await fetch(`/api/auth/google/url?returnPath=${encodeURIComponent(returnPath)}`);
    const data = await res.json();
    if (data.ok && data.url) {
      return data.url;
    }
    throw new Error(data.error || 'Failed to generate Google OAuth URL');
  } catch (err: any) {
    console.error('[ApiClient] Error getting OAuth URL:', err.message);
    throw err;
  }
}

export async function disconnectGoogleAccount(): Promise<boolean> {
  try {
    const res = await fetch('/api/auth/google/disconnect', { method: 'POST' });
    const data = await res.json();
    return data.ok === true;
  } catch (err) {
    console.error('[ApiClient] Error disconnecting Google account:', err);
    return false;
  }
}

export async function checkServerAvailability(date: string, timeSlots?: string[]) {
  try {
    const res = await fetch('/api/appointments/check-availability', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ date, timeSlots }),
    });
    return await res.json();
  } catch (err) {
    console.error('[ApiClient] Error checking availability:', err);
    return { ok: false, isSimulated: true, slots: [] };
  }
}

export async function submitServerBooking(payload: BookingApiPayload): Promise<BookingApiResponse> {
  const res = await fetch('/api/appointments/book', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });

  const data = await res.json();
  if (!res.ok || !data.ok) {
    throw new Error(data.error || 'Booking request failed on server');
  }
  return data;
}

export async function sendServerChatMessage(message: string, history: any[] = []) {
  try {
    const res = await fetch('/api/chat/message', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message, conversationHistory: history }),
    });
    return await res.json();
  } catch (err: any) {
    console.error('[ApiClient] Error in chat message endpoint:', err);
    return {
      ok: false,
      reply: "I can help with appointments and general clinic information, but I couldn't reach the server. Would you like me to connect you with clinic staff?",
    };
  }
}

export async function runServerDiagnostics() {
  try {
    const res = await fetch('/api/admin/test-connections', { method: 'POST' });
    return await res.json();
  } catch (err: any) {
    return { ok: false, error: err.message };
  }
}
