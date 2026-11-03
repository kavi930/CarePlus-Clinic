import { NextRequest, NextResponse } from "next/server";
import { getAppointments, addAuditLog } from "@/lib/db";
import { verifySessionToken } from "@/lib/auth";

export async function GET(req: NextRequest) {
  try {
    const token = req.cookies.get("apex_session")?.value;
    const session = verifySessionToken(token);

    if (!session) {
      return NextResponse.json({ success: false, error: "Unauthorized access" }, { status: 401 });
    }

    const appointments = await getAppointments();

    await addAuditLog({
      actor: session.username,
      action: "csv_export",
      targetEntity: "appointment",
      details: `Exported ${appointments.length} appointment records with privacy masking`,
    });

    const headers = [
      "Reference No",
      "Date",
      "Time",
      "Doctor",
      "Service",
      "Patient Name",
      "Phone",
      "Email",
      "Status",
      "Calendar Sync",
      "WhatsApp Status",
      "Created At",
    ];

    const escapeCsv = (str: string | undefined | null) => {
      if (!str) return '""';
      const clean = String(str).replace(/"/g, '""');
      return `"${clean}"`;
    };

    const rows = appointments.map((a) => [
      escapeCsv(a.reference_no || a.appointment_id),
      escapeCsv(a.date),
      escapeCsv(a.time),
      escapeCsv(a.doctor_name),
      escapeCsv(a.service_name),
      escapeCsv(a.patient_name),
      escapeCsv(a.phone),
      escapeCsv(a.email || "N/A"),
      escapeCsv(a.status),
      escapeCsv(a.calendar_sync_status),
      escapeCsv(a.whatsapp_delivery_status),
      escapeCsv(a.created_at),
    ]);

    const csvContent = [headers.join(","), ...rows.map((r) => r.join(","))].join("\n");

    return new NextResponse(csvContent, {
      status: 200,
      headers: {
        "Content-Type": "text/csv; charset=utf-8",
        "Content-Disposition": `attachment; filename="apex_appointments_${new Date().toISOString().split("T")[0]}.csv"`,
      },
    });
  } catch (err: unknown) {
    return NextResponse.json({ success: false, error: String(err) }, { status: 500 });
  }
}
