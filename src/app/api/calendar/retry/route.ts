import { NextRequest, NextResponse } from "next/server";
import { getAppointment, updateAppointment, addAuditLog } from "@/lib/db";
import { addCalendarEvent } from "@/lib/calendar";

export async function GET() {
  return NextResponse.json({
    status: "active",
    message: "Calendar retry endpoint expects POST with { appointmentId: string }",
    supportedMethods: ["POST"],
  });
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { appointmentId } = body;

    if (!appointmentId) {
      return NextResponse.json({ success: false, error: "appointmentId is required" }, { status: 400 });
    }

    const apt = await getAppointment(appointmentId);
    if (!apt) {
      return NextResponse.json({ success: false, error: "Appointment not found" }, { status: 404 });
    }

    // Attempt synchronization
    const calResult = await addCalendarEvent(apt);

    const updated = await updateAppointment(
      apt.appointment_id,
      {
        calendar_event_id: calResult.eventId,
        calendar_sync_status: calResult.status,
        calendar_sync_error: calResult.error,
      },
      "staff",
      "Manual calendar sync retry triggered from admin dashboard"
    );

    await addAuditLog({
      actor: "staff",
      action: "calendar_retry",
      targetEntity: "appointment",
      targetId: apt.appointment_id,
      details: `Manual calendar retry result: ${calResult.status}`,
    });

    return NextResponse.json({
      success: true,
      result: calResult,
      appointment: updated,
    });
  } catch (err: unknown) {
    return NextResponse.json({ success: false, error: String(err) }, { status: 500 });
  }
}
