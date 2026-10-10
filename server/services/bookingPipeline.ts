/**
 * CarePlus Clinic - Booking Pipeline
 * Safe transactional booking orchestration with idempotency protection,
 * availability verification, calendar synchronization, sheet logging,
 * and multi-channel notifications.
 */

import { checkCalendarAvailability, createCalendarAppointment, CalendarEventResult } from './calendarService';
import { appendAppointmentToSheet, SheetAppendResult } from './sheetsService';
import { sendAppointmentEmail, EmailDispatchResult } from './gmailService';
import { config } from '../config';

export interface BookingPayload {
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

export interface BookingResponse {
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
    calendar: CalendarEventResult;
    sheets: SheetAppendResult;
    email: EmailDispatchResult;
    staffAlert?: EmailDispatchResult;
  };
  warnings?: string[];
  duplicatePrevented?: boolean;
}

// In-memory cache for idempotency keys (expires after 15 minutes)
const idempotencyCache = new Map<string, { timestamp: number; response: BookingResponse }>();

setInterval(() => {
  const now = Date.now();
  for (const [key, item] of idempotencyCache.entries()) {
    if (now - item.timestamp > 15 * 60 * 1000) {
      idempotencyCache.delete(key);
    }
  }
}, 5 * 60 * 1000);

export async function processAppointmentBooking(payload: BookingPayload): Promise<BookingResponse> {
  // 1. Input Sanitization & Validation (Only minimum administrative details)
  const trimmedName = (payload.patientName || '').trim();
  const trimmedPhone = (payload.patientPhone || '').trim();
  const trimmedEmail = (payload.patientEmail || '').trim().toLowerCase();
  const trimmedService = (payload.service || '').trim();
  const trimmedDate = (payload.date || '').trim();
  const trimmedTime = (payload.time || '').trim();

  if (!trimmedName || trimmedName.length < 2) {
    throw new Error('Patient name must be at least 2 characters long.');
  }
  if (!trimmedPhone || trimmedPhone.length < 7) {
    throw new Error('Please provide a valid contact phone number.');
  }
  if (!trimmedEmail || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmedEmail)) {
    throw new Error('Please provide a valid email address.');
  }
  if (!trimmedDate || !trimmedTime) {
    throw new Error('Appointment date and time slot must be selected.');
  }

  // 2. Idempotency Check
  const idempotencyKey = payload.idempotencyKey || `${trimmedPhone}-${trimmedDate}-${trimmedTime}`;
  if (idempotencyCache.has(idempotencyKey)) {
    const cached = idempotencyCache.get(idempotencyKey)!;
    console.log(`[BookingPipeline] Duplicate booking submission caught via idempotency key: ${idempotencyKey}`);
    return {
      ...cached.response,
      duplicatePrevented: true,
    };
  }

  const appointmentId = `apt-${Date.now().toString().slice(-6)}`;
  const doctorName = payload.doctorName || (trimmedService.includes('Skin') ? 'Dr. Ananya Mehta' : 'Dr. Rahul Verma');

  // 3. Availability Verification
  const availability = await checkCalendarAvailability(trimmedDate, [trimmedTime]);
  const requestedSlot = availability.slots.find((s) => s.time === trimmedTime);
  if (requestedSlot && !requestedSlot.isAvailable && requestedSlot.status === 'busy') {
    throw new Error(`The requested slot (${trimmedTime} on ${trimmedDate}) is no longer available. Please select another time.`);
  }

  // 4. Create Calendar Event
  const calendarResult = await createCalendarAppointment({
    patientName: trimmedName,
    patientPhone: trimmedPhone,
    patientEmail: trimmedEmail,
    service: trimmedService,
    date: trimmedDate,
    time: trimmedTime,
    doctorName,
    notes: payload.notes,
  });

  // 5. Append to Google Sheets
  const sheetResult = await appendAppointmentToSheet({
    id: appointmentId,
    patientName: trimmedName,
    patientPhone: trimmedPhone,
    patientEmail: trimmedEmail,
    patientType: payload.patientType || 'new',
    service: trimmedService,
    date: trimmedDate,
    time: trimmedTime,
    doctorName,
    status: 'Confirmed',
    idempotencyKey,
  });

  // 6. Dispatch Patient Email via Gmail
  const emailResult = await sendAppointmentEmail(
    {
      id: appointmentId,
      patientName: trimmedName,
      patientEmail: trimmedEmail,
      patientPhone: trimmedPhone,
      service: trimmedService,
      date: trimmedDate,
      time: trimmedTime,
      doctorName,
    },
    trimmedEmail,
    'patient_confirmation'
  );

  // 7. Dispatch Staff Alert (if clinic notification email is configured)
  let staffAlertResult: EmailDispatchResult | undefined;
  if (config.google.clinicNotificationEmail) {
    staffAlertResult = await sendAppointmentEmail(
      {
        id: appointmentId,
        patientName: trimmedName,
        patientEmail: trimmedEmail,
        patientPhone: trimmedPhone,
        service: trimmedService,
        date: trimmedDate,
        time: trimmedTime,
        doctorName,
      },
      config.google.clinicNotificationEmail,
      'clinic_staff_alert'
    );
  }

  // Check for partial failures
  const warnings: string[] = [];
  if (calendarResult.status === 'failed') {
    warnings.push(`Calendar sync failed: ${calendarResult.error}`);
  }
  if (sheetResult.status === 'failed') {
    warnings.push(`Sheets logging failed: ${sheetResult.error}`);
  }
  if (emailResult.status === 'failed') {
    warnings.push(`Email notification failed: ${emailResult.error}`);
  }

  const isSimulated = Boolean(calendarResult.isSimulated || sheetResult.isSimulated || emailResult.isSimulated);

  const response: BookingResponse = {
    success: calendarResult.status !== 'failed',
    appointmentId,
    idempotencyKey,
    isSimulated,
    appointment: {
      id: appointmentId,
      patientName: trimmedName,
      patientPhone: trimmedPhone,
      patientEmail: trimmedEmail,
      patientType: payload.patientType || 'new',
      service: trimmedService,
      date: trimmedDate,
      time: trimmedTime,
      doctorName,
      status: 'Confirmed',
    },
    integrations: {
      calendar: calendarResult,
      sheets: sheetResult,
      email: emailResult,
      staffAlert: staffAlertResult,
    },
    warnings: warnings.length > 0 ? warnings : undefined,
  };

  // Cache response for idempotency
  idempotencyCache.set(idempotencyKey, {
    timestamp: Date.now(),
    response,
  });

  return response;
}
