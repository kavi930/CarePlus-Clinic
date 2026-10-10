/**
 * CarePlus Clinic - Google Sheets Service
 * Logs appointment bookings and lead intake to a configured Google Sheet.
 * Switches between real Google Sheets API and simulated demo mode transparently.
 */

import { google } from 'googleapis';
import { getAuthenticatedClient, isGoogleAuthorized } from '../auth/googleOAuth';
import { config } from '../config';

export interface SheetAppendResult {
  isSimulated: boolean;
  status: 'confirmed' | 'failed' | 'skipped';
  spreadsheetId?: string;
  updatedRange?: string;
  error?: string;
}

export async function appendAppointmentToSheet(appointment: {
  id: string;
  patientName: string;
  patientPhone: string;
  patientEmail: string;
  patientType: string;
  service: string;
  date: string;
  time: string;
  doctorName?: string;
  status: string;
  idempotencyKey?: string;
}): Promise<SheetAppendResult> {
  const authClient = getAuthenticatedClient();
  const spreadsheetId = config.google.spreadsheetId;

  // If not configured or not authorized, operate in simulated demo mode
  if (!authClient || !isGoogleAuthorized() || !spreadsheetId) {
    return {
      isSimulated: true,
      status: 'confirmed',
      spreadsheetId: spreadsheetId || 'demo-simulated-sheet-id',
      updatedRange: 'Sheet1!A10:L10',
    };
  }

  try {
    const sheets = google.sheets({ version: 'v4', auth: authClient });
    const nowIso = new Date().toISOString();

    const rowValues = [
      nowIso,
      appointment.id,
      appointment.patientName,
      appointment.patientPhone,
      appointment.patientEmail,
      appointment.patientType,
      appointment.service,
      appointment.date,
      appointment.time,
      appointment.doctorName || 'Dr. Ananya Mehta',
      appointment.status,
      appointment.idempotencyKey || 'N/A',
    ];

    const response = await sheets.spreadsheets.values.append({
      spreadsheetId,
      range: 'Sheet1!A:L',
      valueInputOption: 'USER_ENTERED',
      insertDataOption: 'INSERT_ROWS',
      requestBody: {
        values: [rowValues],
      },
    });

    return {
      isSimulated: false,
      status: 'confirmed',
      spreadsheetId,
      updatedRange: response.data.updates?.updatedRange || undefined,
    };
  } catch (error: any) {
    console.error('[SheetsService] Error appending appointment to sheet:', error?.message);
    return {
      isSimulated: false,
      status: 'failed',
      spreadsheetId,
      error: error?.message || 'Google Sheets append operation failed',
    };
  }
}

/**
 * Diagnostic utility to test sheet connectivity and permissions.
 */
export async function testSheetConnection(): Promise<{ success: boolean; title?: string; error?: string }> {
  const authClient = getAuthenticatedClient();
  const spreadsheetId = config.google.spreadsheetId;

  if (!authClient || !isGoogleAuthorized()) {
    return { success: false, error: 'Google account is not authorized.' };
  }
  if (!spreadsheetId) {
    return { success: false, error: 'GOOGLE_SPREADSHEET_ID is not configured in environment.' };
  }

  try {
    const sheets = google.sheets({ version: 'v4', auth: authClient });
    const res = await sheets.spreadsheets.get({ spreadsheetId });
    return {
      success: true,
      title: res.data.properties?.title || 'Connected Spreadsheet',
    };
  } catch (err: any) {
    return { success: false, error: err?.message || 'Failed to access spreadsheet' };
  }
}
