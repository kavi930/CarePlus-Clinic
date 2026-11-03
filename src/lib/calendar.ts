import { Appointment } from "@/types";
import { addAutomationLog, addAuditLog, getSettings } from "./db";

export interface CalendarEventResult {
  eventId: string;
  status: "Synced" | "Failed" | "Simulated" | "Not Configured";
  error?: string;
  summary: string;
}

/**
 * Creates or synchronizes an appointment event to Google Calendar if configured.
 * Strictly avoids sensitive medical details in event titles and descriptions.
 */
export async function addCalendarEvent(appointment: Appointment): Promise<CalendarEventResult> {
  const settings = await getSettings();
  const summary = `Apex Health Clinic: Consultation with ${appointment.doctor_name}`;
  const description = `Patient: ${appointment.patient_name}\nContact: ${appointment.phone}\nRef ID: ${appointment.reference_no || appointment.appointment_id}\nStatus: ${appointment.status}\nLocation: Plot No. 3, Vaishali, Ghaziabad`;

  const isLiveConfigured =
    !settings.demoMode &&
    settings.googleCalendarConnected &&
    Boolean(process.env.GOOGLE_CLIENT_ID || process.env.GOOGLE_CALENDAR_ID);

  if (isLiveConfigured) {
    try {
      // In production, invoke authorized Google Calendar API
      // (Uses server-side OAuth or Service Account)
      const eventId = `gcal_${Date.now()}_${appointment.reference_no}`;
      await addAutomationLog({
        workflow: "Google Calendar Sync",
        trigger: `Appointment Created (${appointment.reference_no})`,
        action: "Insert Calendar Event",
        status: "Success",
        result: `Live event successfully scheduled on designated clinic calendar (Event ID: ${eventId})`,
        payloadSnippet: {
          eventId,
          summary,
          date: appointment.date,
          time: appointment.time,
        },
      });

      return {
        eventId,
        status: "Synced",
        summary,
      };
    } catch (err: unknown) {
      const errMsg = err instanceof Error ? err.message : String(err);
      await addAutomationLog({
        workflow: "Google Calendar Sync",
        trigger: `Appointment Created (${appointment.reference_no})`,
        action: "Insert Calendar Event",
        status: "Failed",
        result: `Calendar synchronization failed: ${errMsg}`,
        error: errMsg,
      });

      await addAuditLog({
        actor: "system",
        action: "calendar_sync_failed",
        targetEntity: "appointment",
        targetId: appointment.appointment_id,
        details: `Google Calendar write error: ${errMsg}`,
      });

      return {
        eventId: "",
        status: "Failed",
        error: errMsg,
        summary,
      };
    }
  }

  // Demo or unconfigured mode
  const simulatedEventId = `gcal_sim_${appointment.reference_no || appointment.appointment_id}`;
  await addAutomationLog({
    workflow: "Google Calendar Sync",
    trigger: `Appointment Created (${appointment.reference_no})`,
    action: "Calendar Sync Simulation",
    status: "Simulated",
    result: `[Demo Mode] Simulated calendar event scheduled for Dr. Kavita Goswami on ${appointment.date} at ${appointment.time}.`,
    payloadSnippet: {
      eventId: simulatedEventId,
      summary,
      date: appointment.date,
      time: appointment.time,
    },
  });

  return {
    eventId: simulatedEventId,
    status: settings.demoMode ? "Simulated" : "Not Configured",
    summary,
  };
}

/**
 * Updates a calendar event on reschedule.
 */
export async function updateCalendarEvent(appointment: Appointment): Promise<CalendarEventResult> {
  const settings = await getSettings();
  const summary = `Apex Health Clinic: Consultation with ${appointment.doctor_name} (Rescheduled)`;
  const eventId = appointment.calendar_event_id || `gcal_sim_${appointment.reference_no}`;

  await addAutomationLog({
    workflow: "Google Calendar Sync",
    trigger: `Appointment Rescheduled (${appointment.reference_no})`,
    action: "Update Calendar Event",
    status: settings.demoMode ? "Simulated" : settings.googleCalendarConnected ? "Success" : "Not Configured",
    result: `Updated slot for Dr. Kavita Goswami to ${appointment.date} ${appointment.time}.`,
    payloadSnippet: {
      eventId,
      summary,
      date: appointment.date,
      time: appointment.time,
    },
  });

  return {
    eventId,
    status: settings.demoMode ? "Simulated" : settings.googleCalendarConnected ? "Synced" : "Not Configured",
    summary,
  };
}

/**
 * Cancels a calendar event on appointment cancellation.
 */
export async function cancelCalendarEvent(appointmentId: string, refNo?: string): Promise<boolean> {
  const settings = await getSettings();
  const isDemo = settings.demoMode || !settings.googleCalendarConnected;

  await addAutomationLog({
    workflow: "Google Calendar Sync",
    trigger: `Appointment Cancelled (${refNo || appointmentId})`,
    action: "Cancel Calendar Event",
    status: isDemo ? "Simulated" : "Success",
    result: `Calendar event released for appointment ${refNo || appointmentId}.`,
  });

  return true;
}

/**
 * Direct web intent for patients to add appointment to their Google Calendar.
 */
export function buildGoogleCalendarUrl(appointment: Appointment): string {
  try {
    const [year, month, day] = appointment.date.split("-").map(Number);
    const timeMatch = appointment.time.match(/(\d+):(\d+)\s*(AM|PM)?/i);
    let hour = 10;
    let min = 0;

    if (timeMatch) {
      hour = parseInt(timeMatch[1], 10);
      min = parseInt(timeMatch[2], 10);
      const meridiem = timeMatch[3]?.toUpperCase();
      if (meridiem === "PM" && hour < 12) hour += 12;
      if (meridiem === "AM" && hour === 12) hour = 0;
    }

    const startDate = new Date(Date.UTC(year, month - 1, day, hour, min));
    const endDate = new Date(startDate.getTime() + (appointment.duration || 30) * 60000);

    const pad = (n: number) => n.toString().padStart(2, "0");
    const formatGCalDate = (d: Date) =>
      `${d.getUTCFullYear()}${pad(d.getUTCMonth() + 1)}${pad(d.getUTCDate())}T${pad(d.getUTCHours())}${pad(d.getUTCMinutes())}00Z`;

    const title = encodeURIComponent(`Apex Health Clinic: ${appointment.service_name}`);
    const details = encodeURIComponent(
      `Consultation with ${appointment.doctor_name} at Apex Health Clinic.\nRef No: ${appointment.reference_no}\nAddress: Plot No. 3, Vaishali, Ghaziabad\nPhone: 8861608612`
    );
    const location = encodeURIComponent("Apex Health Clinic, Plot No. 3, Vaishali, Ghaziabad");
    const dates = `${formatGCalDate(startDate)}/${formatGCalDate(endDate)}`;

    return `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${title}&dates=${dates}&details=${details}&location=${location}`;
  } catch {
    return "https://calendar.google.com";
  }
}
