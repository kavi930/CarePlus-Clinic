import { NextRequest, NextResponse } from "next/server";
import { getAppointment, updateAppointment, isSlotAvailable } from "@/lib/db";
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
    const body = await req.json();
    const { newDate, newTime, reason } = body;

    if (!newDate || !newTime) {
      return NextResponse.json(
        { success: false, error: "newDate and newTime are required" },
        { status: 400 }
      );
    }

    const currentApt = await getAppointment(id);
    if (!currentApt) {
      return NextResponse.json({ success: false, error: "Appointment not found" }, { status: 404 });
    }

    if (currentApt.status === "Cancelled") {
      return NextResponse.json(
        { success: false, error: "Cannot reschedule an appointment that has already been cancelled" },
        { status: 400 }
      );
    }

    // Check slot availability for the doctor on the new date and time
    const slotFree = await isSlotAvailable(currentApt.doctor_id, newDate, newTime, currentApt.appointment_id);
    if (!slotFree) {
      return NextResponse.json(
        { success: false, error: "Sorry, this time is no longer available. Please select another time." },
        { status: 409 }
      );
    }

    // Perform reschedule update
    const updated = await updateAppointment(id, {
      date: newDate,
      time: newTime,
      status: "Rescheduled",
      rescheduled_from: {
        date: currentApt.date,
        time: currentApt.time,
      },
      notes: reason ? `${currentApt.notes ? currentApt.notes + " | " : ""}Rescheduled reason: ${reason}` : currentApt.notes,
      reminder_status: "Scheduled", // reset reminders for the new date
      confirmation_status: "Simulated",
    });

    if (!updated) {
      return NextResponse.json({ success: false, error: "Failed to update appointment" }, { status: 500 });
    }

    // Trigger automation
    await dispatchAutomationEvent("appointment.rescheduled", updated);

    return NextResponse.json({
      success: true,
      appointment: updated,
      message: "Appointment rescheduled successfully",
    });
  } catch (err: unknown) {
    return NextResponse.json({ success: false, error: String(err) }, { status: 500 });
  }
}
