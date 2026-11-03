import { NextRequest, NextResponse } from "next/server";
import { getAppointment, updateAppointment } from "@/lib/db";
import { dispatchAutomationEvent } from "@/lib/automation";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  return NextResponse.redirect(new URL(`/book/${id}`, req.url));
}

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await req.json().catch(() => ({}));
    const { reason = "Patient requested cancellation" } = body;

    const currentApt = await getAppointment(id);
    if (!currentApt) {
      return NextResponse.json({ success: false, error: "Appointment not found" }, { status: 404 });
    }

    if (currentApt.status === "Cancelled") {
      return NextResponse.json({
        success: true,
        appointment: currentApt,
        message: "Appointment was already cancelled",
      });
    }

    const updated = await updateAppointment(id, {
      status: "Cancelled",
      cancellation_reason: reason,
      cancelled_at: new Date().toISOString(),
      reminder_status: "Cancelled", // stops future reminders
    });

    if (!updated) {
      return NextResponse.json({ success: false, error: "Failed to cancel appointment" }, { status: 500 });
    }

    // Trigger cancellation automation (releases slot, stops reminders, notifies)
    await dispatchAutomationEvent("appointment.cancelled", updated);

    return NextResponse.json({
      success: true,
      appointment: updated,
      message: "Your appointment has been cancelled.",
    });
  } catch (err: unknown) {
    return NextResponse.json({ success: false, error: String(err) }, { status: 500 });
  }
}
