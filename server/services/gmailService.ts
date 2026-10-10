/**
 * CarePlus Clinic - Gmail Notification Service
 * Dispatches confirmation emails to patients and alerts to clinic staff.
 * Switches between real Gmail API and simulated demo mode transparently.
 */

import { google } from 'googleapis';
import { getAuthenticatedClient, isGoogleAuthorized } from '../auth/googleOAuth';
import { config } from '../config';

export interface EmailDispatchResult {
  isSimulated: boolean;
  status: 'confirmed' | 'failed' | 'skipped';
  recipient: string;
  messageId?: string;
  error?: string;
}

export async function sendAppointmentEmail(
  appointment: {
    id: string;
    patientName: string;
    patientEmail: string;
    patientPhone: string;
    service: string;
    date: string;
    time: string;
    doctorName?: string;
  },
  recipientEmail: string,
  type: 'patient_confirmation' | 'clinic_staff_alert' = 'patient_confirmation'
): Promise<EmailDispatchResult> {
  const authClient = getAuthenticatedClient();

  // If not authorized, return simulated delivery
  if (!authClient || !isGoogleAuthorized()) {
    return {
      isSimulated: true,
      status: 'confirmed',
      recipient: recipientEmail,
      messageId: `sim-gmail-${Date.now()}`,
    };
  }

  try {
    const gmail = google.gmail({ version: 'v1', auth: authClient });

    const subject =
      type === 'patient_confirmation'
        ? `Appointment Confirmation: CarePlus Clinic - ${appointment.service}`
        : `🔔 New Appointment Alert: ${appointment.patientName} (${appointment.service})`;

    const emailLines = [
      `To: ${recipientEmail}`,
      `Subject: ${subject}`,
      `Content-Type: text/html; charset=utf-8`,
      `MIME-Version: 1.0`,
      ``,
      `<!DOCTYPE html>`,
      `<html>`,
      `<body style="font-family: sans-serif; background-color: #080B12; color: #F8FAFC; padding: 24px;">`,
      `  <div style="max-width: 600px; margin: 0 auto; background-color: #111827; border: 1px solid #1E293B; border-radius: 16px; padding: 28px;">`,
      `    <h2 style="color: #22D3EE; margin-top: 0;">CarePlus Clinic</h2>`,
      `    <h3 style="color: #F8FAFC;">${type === 'patient_confirmation' ? 'Your Appointment is Confirmed' : 'New Appointment Booked'}</h3>`,
      `    <div style="background-color: #0F172A; border-radius: 12px; padding: 18px; margin: 20px 0; border: 1px solid #334155;">`,
      `      <p style="margin: 6px 0;"><strong>Patient:</strong> ${appointment.patientName}</p>`,
      `      <p style="margin: 6px 0;"><strong>Service:</strong> ${appointment.service}</p>`,
      `      <p style="margin: 6px 0;"><strong>Date & Time:</strong> ${appointment.date} at ${appointment.time}</p>`,
      `      <p style="margin: 6px 0;"><strong>Attending:</strong> ${appointment.doctorName || 'Dr. Ananya Mehta'}</p>`,
      `      <p style="margin: 6px 0;"><strong>Clinic Address:</strong> Suite 400, Medical Plaza Blvd, Metro Health District</p>`,
      `    </div>`,
      `    <p style="font-size: 13px; color: #94A3B8;">Please arrive 10 minutes prior to your scheduled time. Validated parking is available on Level P2.</p>`,
      `    <p style="font-size: 12px; color: #64748B; margin-top: 24px; border-top: 1px solid #1E293B; padding-top: 12px;">This message was generated automatically by the CarePlus Smart Appointment System.</p>`,
      `  </div>`,
      `</body>`,
      `</html>`,
    ];

    const rawMessage = Buffer.from(emailLines.join('\r\n'))
      .toString('base64')
      .replace(/\+/g, '-')
      .replace(/\//g, '_')
      .replace(/=+$/, '');

    const res = await gmail.users.messages.send({
      userId: 'me',
      requestBody: {
        raw: rawMessage,
      },
    });

    return {
      isSimulated: false,
      status: 'confirmed',
      recipient: recipientEmail,
      messageId: res.data.id || undefined,
    };
  } catch (error: any) {
    console.error('[GmailService] Error sending email via Gmail API:', error?.message);
    return {
      isSimulated: false,
      status: 'failed',
      recipient: recipientEmail,
      error: error?.message || 'Gmail dispatch failed',
    };
  }
}
