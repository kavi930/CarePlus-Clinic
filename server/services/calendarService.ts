/**
 * CarePlus Clinic - Calendar Service
 * Handles checking availability and scheduling appointments.
 * Switches between real Google Calendar API and simulated demo mode transparently.
 */

import { google } from 'googleapis';
import { getAuthenticatedClient, isGoogleAuthorized } from '../auth/googleOAuth';
import { config } from '../config';

export interface SlotAvailability {
  time: string;
  isAvailable: boolean;
  status: 'available' | 'busy' | 'simulated';
}

export interface CalendarEventResult {
  isSimulated: boolean;
  eventId?: string;
  htmlLink?: string;
  summary: string;
  startTime: string;
  endTime: string;
  status: 'confirmed' | 'failed';
  error?: string;
}

/**
 * Standard clinic demo time slots
 */
export const DEFAULT_DEMO_SLOTS = ['10:00 AM', '11:30 AM', '2:00 PM', '4:00 PM'];

/**
 * Checks availability for a specific clinic date and set of time slots.
 */
export async function checkCalendarAvailability(
  dateStr: string,
  timeSlots: string[] = DEFAULT_DEMO_SLOTS
): Promise<{ isSimulated: boolean; slots: SlotAvailability[]; calendarId: string }> {
  const authClient = getAuthenticatedClient();

  // If not authorized or OAuth not configured, return safe simulated availability
  if (!authClient || !isGoogleAuthorized()) {
    return {
      isSimulated: true,
      calendarId: 'demo-simulated-calendar',
      slots: timeSlots.map((time) => ({
        time,
        isAvailable: true,
        status: 'simulated',
      })),
    };
  }

  // Real Google Calendar Query
  try {
    const calendar = google.calendar({ version: 'v3', auth: authClient });
    const calendarId = config.google.calendarId;

    // Parse date into ISO range for the target day
    // We assume incoming dates in formats like "Monday, 12 October" or "2026-10-12"
    const parsedDate = parseDateString(dateStr);
    const startOfDay = new Date(parsedDate);
    startOfDay.setHours(8, 0, 0, 0);

    const endOfDay = new Date(parsedDate);
    endOfDay.setHours(19, 0, 0, 0);

    // Query freebusy from Google Calendar
    const freeBusyRes = await calendar.freebusy.query({
      requestBody: {
        timeMin: startOfDay.toISOString(),
        timeMax: endOfDay.toISOString(),
        items: [{ id: calendarId }],
      },
    });

    const busyRanges = freeBusyRes.data.calendars?.[calendarId]?.busy || [];

    // Evaluate each requested slot against busy intervals
    const evaluatedSlots: SlotAvailability[] = timeSlots.map((timeSlot) => {
      const slotStartTime = parseSlotDateTime(parsedDate, timeSlot);
      const slotEndTime = new Date(slotStartTime.getTime() + 45 * 60 * 1000); // 45 minute consultation

      const isConflict = busyRanges.some((range) => {
        if (!range.start || !range.end) return false;
        const busyStart = new Date(range.start).getTime();
        const busyEnd = new Date(range.end).getTime();
        return slotStartTime.getTime() < busyEnd && slotEndTime.getTime() > busyStart;
      });

      return {
        time: timeSlot,
        isAvailable: !isConflict,
        status: isConflict ? 'busy' : 'available',
      };
    });

    return {
      isSimulated: false,
      calendarId,
      slots: evaluatedSlots,
    };
  } catch (error: any) {
    console.error('[CalendarService] Error checking Google Calendar availability:', error?.message);
    // If authorization expired or network issue, fail transparently without fabricating false data
    return {
      isSimulated: true,
      calendarId: 'fallback-simulated',
      slots: timeSlots.map((time) => ({
        time,
        isAvailable: true,
        status: 'simulated',
      })),
    };
  }
}

/**
 * Creates a calendar appointment event.
 */
export async function createCalendarAppointment(appointment: {
  patientName: string;
  patientPhone: string;
  patientEmail: string;
  service: string;
  date: string;
  time: string;
  doctorName?: string;
  notes?: string;
}): Promise<CalendarEventResult> {
  const authClient = getAuthenticatedClient();

  const parsedDate = parseDateString(appointment.date);
  const startTime = parseSlotDateTime(parsedDate, appointment.time);
  const endTime = new Date(startTime.getTime() + 45 * 60 * 1000); // 45-min duration

  const summary = `CarePlus Clinic: ${appointment.service} - ${appointment.patientName}`;
  const description = [
    `CarePlus Clinic Appointment`,
    `Patient: ${appointment.patientName}`,
    `Phone: ${appointment.patientPhone}`,
    `Email: ${appointment.patientEmail}`,
    `Service: ${appointment.service}`,
    `Attending: ${appointment.doctorName || 'Dr. Ananya Mehta'}`,
    appointment.notes ? `Administrative Note: ${appointment.notes}` : '',
    `Booked via CarePlus Smart Appointment System`,
  ].filter(Boolean).join('\n');

  // If not authenticated, return clearly marked simulated result
  if (!authClient || !isGoogleAuthorized()) {
    const demoEventId = `sim-event-${Date.now()}`;
    return {
      isSimulated: true,
      eventId: demoEventId,
      summary,
      startTime: startTime.toISOString(),
      endTime: endTime.toISOString(),
      status: 'confirmed',
    };
  }

  // Real Google Calendar creation
  try {
    const calendar = google.calendar({ version: 'v3', auth: authClient });
    const calendarId = config.google.calendarId;

    const event = await calendar.events.insert({
      calendarId,
      requestBody: {
        summary,
        description,
        location: 'CarePlus Clinic, Suite 400, Medical Plaza Blvd',
        start: {
          dateTime: startTime.toISOString(),
        },
        end: {
          dateTime: endTime.toISOString(),
        },
        attendees: appointment.patientEmail ? [{ email: appointment.patientEmail }] : undefined,
        reminders: {
          useDefault: false,
          overrides: [
            { method: 'popup', minutes: 60 },
            { method: 'email', minutes: 24 * 60 },
          ],
        },
      },
    });

    return {
      isSimulated: false,
      eventId: event.data.id || undefined,
      htmlLink: event.data.htmlLink || undefined,
      summary,
      startTime: startTime.toISOString(),
      endTime: endTime.toISOString(),
      status: 'confirmed',
    };
  } catch (error: any) {
    console.error('[CalendarService] Error creating calendar event:', error?.message);
    return {
      isSimulated: false,
      summary,
      startTime: startTime.toISOString(),
      endTime: endTime.toISOString(),
      status: 'failed',
      error: error?.message || 'Google Calendar event creation failed',
    };
  }
}

// Helpers for date/time parsing
function parseDateString(dateStr: string): Date {
  // If it's already an ISO or standard date
  const parsed = new Date(dateStr);
  if (!isNaN(parsed.getTime())) return parsed;

  // Handle format like "Monday, 12 October" or "12 October"
  const currentYear = 2026;
  const cleaned = dateStr.replace(/^[A-Za-z]+,\s*/, '');
  const testDate = new Date(`${cleaned} ${currentYear}`);
  if (!isNaN(testDate.getTime())) return testDate;

  return new Date();
}

function parseSlotDateTime(baseDate: Date, timeStr: string): Date {
  const d = new Date(baseDate);
  const match = timeStr.match(/(\d+):(\d+)\s*(AM|PM)/i);
  if (match) {
    let hours = parseInt(match[1], 10);
    const minutes = parseInt(match[2], 10);
    const ampm = match[3].toUpperCase();
    if (ampm === 'PM' && hours < 12) hours += 12;
    if (ampm === 'AM' && hours === 12) hours = 0;
    d.setHours(hours, minutes, 0, 0);
  } else {
    d.setHours(10, 0, 0, 0);
  }
  return d;
}
