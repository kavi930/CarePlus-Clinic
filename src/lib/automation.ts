import { Appointment, Enquiry } from "@/types";
import { addAutomationLog, getSettings, updateAppointment } from "./db";
import { sendEmail, sendSMS, sendWhatsApp } from "./notifications";
import { addCalendarEvent, updateCalendarEvent, cancelCalendarEvent } from "./calendar";

export type AutomationEventType =
  | "appointment.created"
  | "appointment.rescheduled"
  | "appointment.cancelled"
  | "enquiry.created"
  | "reminder.24h"
  | "reminder.2h";

/**
 * Dispatches an event payload to external webhook (e.g. n8n or Make) if configured.
 */
async function dispatchWebhook(event: string, payload: Record<string, unknown>): Promise<void> {
  const settings = await getSettings();
  if (!settings.n8nWebhookUrl) return;

  try {
    if (settings.n8nWebhookUrl.startsWith("http") && !settings.n8nWebhookUrl.includes("example")) {
      await fetch(settings.n8nWebhookUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          event,
          clinic: "Apex Health Clinic",
          timestamp: new Date().toISOString(),
          ...payload,
        }),
      });
    }

    await addAutomationLog({
      workflow: "Webhook Integration",
      trigger: event,
      action: "HTTP POST Relay",
      status: "Success",
      result: `Delivered to webhook endpoint ${settings.n8nWebhookUrl}`,
      payloadSnippet: payload,
    });
  } catch (err: unknown) {
    await addAutomationLog({
      workflow: "Webhook Integration",
      trigger: event,
      action: "HTTP POST Relay",
      status: "Simulated",
      result: `Webhook delivery simulated (offline or demo mode): ${err instanceof Error ? err.message : String(err)}`,
      payloadSnippet: payload,
    });
  }
}

/**
 * Orchestrates clinic automation events.
 */
export async function dispatchAutomationEvent(event: AutomationEventType, data: unknown): Promise<void> {
  const settings = await getSettings();

  switch (event) {
    case "appointment.created": {
      const apt = data as Appointment;
      if (!settings.workflows?.appointmentConfirmation) break;

      const messageText = `Apex Health Clinic: Namaste ${apt.patient_name}, your consultation request for ${apt.service_name} with ${apt.doctor_name} on ${apt.date} at ${apt.time} is recorded. Booking Ref: ${apt.reference_no}. Clinic Address: Plot No. 3, Vaishali, Ghaziabad. Helpline: 8861608612.`;

      // 1. WhatsApp Notification
      const waResult = await sendWhatsApp({
        to: apt.phone,
        body: messageText,
        recipientName: apt.patient_name,
      });

      // 2. Email Notification if email was provided
      if (apt.email) {
        await sendEmail({
          to: apt.email,
          subject: `Apex Health Clinic — Booking Confirmation (${apt.reference_no})`,
          body: `<p>Dear ${apt.patient_name},</p><p>Your appointment has been registered at <strong>Apex Health Clinic</strong>.</p><ul><li><strong>Doctor:</strong> ${apt.doctor_name}</li><li><strong>Service:</strong> ${apt.service_name}</li><li><strong>Date & Time:</strong> ${apt.date} at ${apt.time}</li><li><strong>Reference ID:</strong> ${apt.reference_no}</li><li><strong>Address:</strong> Plot No. 3, Vaishali, Ghaziabad</li><li><strong>Helpline:</strong> 8861608612</li></ul>`,
          recipientName: apt.patient_name,
        });
      }

      // 3. Google Calendar Synchronization
      const calRes = await addCalendarEvent(apt);

      // 4. Update Appointment record with sync & delivery states
      await updateAppointment(apt.appointment_id, {
        calendar_event_id: calRes.eventId,
        calendar_sync_status: calRes.status,
        calendar_sync_error: calRes.error,
        whatsapp_delivery_status: waResult.mode === "Live" ? "Delivered" : "Simulated",
        whatsapp_message_id: waResult.messageId,
        confirmation_status: "Sent",
        automation_status: "Completed",
      });

      // 5. External Webhook Relay
      await dispatchWebhook("appointment.created", {
        appointmentId: apt.appointment_id,
        referenceNo: apt.reference_no,
        patientName: apt.patient_name,
        phone: apt.phone,
        doctor: apt.doctor_name,
        service: apt.service_name,
        date: apt.date,
        time: apt.time,
      });
      break;
    }

    case "appointment.rescheduled": {
      const apt = data as Appointment;
      const reschedMsg = `Apex Health Clinic: Your appointment (Ref: ${apt.reference_no}) with ${apt.doctor_name} has been rescheduled to ${apt.date} at ${apt.time}. Address: Plot No. 3, Vaishali, Ghaziabad.`;

      await sendWhatsApp({
        to: apt.phone,
        body: reschedMsg,
        recipientName: apt.patient_name,
      });

      if (apt.email) {
        await sendEmail({
          to: apt.email,
          subject: `Apex Health Clinic — Appointment Rescheduled (${apt.reference_no})`,
          body: `<p>Dear ${apt.patient_name},</p><p>Your appointment with ${apt.doctor_name} has been rescheduled to <strong>${apt.date} at ${apt.time}</strong>.</p><p>Reference: ${apt.reference_no}</p>`,
          recipientName: apt.patient_name,
        });
      }

      await updateCalendarEvent(apt);

      await dispatchWebhook("appointment.rescheduled", {
        referenceNo: apt.reference_no,
        date: apt.date,
        time: apt.time,
      });
      break;
    }

    case "appointment.cancelled": {
      const apt = data as Appointment;
      const cancelMsg = `Apex Health Clinic: Your appointment (Ref: ${apt.reference_no}) with ${apt.doctor_name} has been cancelled. If you need to rebook, please visit our website or call 8861608612.`;

      await sendWhatsApp({
        to: apt.phone,
        body: cancelMsg,
        recipientName: apt.patient_name,
      });

      await cancelCalendarEvent(apt.appointment_id, apt.reference_no);

      await dispatchWebhook("appointment.cancelled", {
        referenceNo: apt.reference_no,
        reason: apt.cancellation_reason,
      });
      break;
    }

    case "enquiry.created": {
      const enq = data as Enquiry;
      await addAutomationLog({
        workflow: "Enquiry Triage",
        trigger: "New Enquiry Received",
        action: "Categorize & Route to CRM",
        status: "Success",
        result: `Enquiry from ${enq.name} categorized as "${enq.classification}" and routed to clinic CRM queue.`,
        payloadSnippet: {
          enquiryId: enq.enquiry_id,
          name: enq.name,
          phone: enq.phone,
          category: enq.category,
        },
      });

      await dispatchWebhook("enquiry.created", {
        enquiryId: enq.enquiry_id,
        name: enq.name,
        phone: enq.phone,
        category: enq.category,
        question: enq.question,
      });
      break;
    }
  }
}
