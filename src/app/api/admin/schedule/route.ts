import { NextRequest, NextResponse } from "next/server";
import {
  getBlockedPeriods,
  addBlockedPeriod,
  removeBlockedPeriod,
  getHolidays,
  updateDoctor,
  getDoctor,
  addAuditLog,
} from "@/lib/db";
import { verifySessionToken } from "@/lib/auth";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const doctorId = searchParams.get("doctorId") || undefined;
    const blockedPeriods = await getBlockedPeriods(doctorId);
    const holidays = await getHolidays();
    const doctor = doctorId ? await getDoctor(doctorId) : null;

    return NextResponse.json({
      success: true,
      blockedPeriods,
      holidays,
      doctor,
    });
  } catch (err: unknown) {
    return NextResponse.json({ success: false, error: String(err) }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const token = req.cookies.get("apex_session")?.value;
    const session = verifySessionToken(token);

    if (!session) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { action, doctorId, date, reason, startTime, endTime, allDay = true, doctorUpdates } = body;

    if (action === "block_period") {
      if (!date || !reason) {
        return NextResponse.json({ success: false, error: "Date and reason are required" }, { status: 400 });
      }

      const blocked = await addBlockedPeriod({
        doctorId: doctorId || "all",
        date,
        reason,
        startTime,
        endTime,
        allDay,
      });

      await addAuditLog({
        actor: session.username,
        action: "block_period_added",
        targetEntity: "schedule",
        details: `Blocked date ${date} for ${doctorId || "all"} (${reason})`,
      });

      return NextResponse.json({ success: true, blocked });
    }

    if (action === "remove_block") {
      const { blockId } = body;
      await removeBlockedPeriod(blockId);

      await addAuditLog({
        actor: session.username,
        action: "block_period_removed",
        targetEntity: "schedule",
        details: `Removed blocked period ${blockId}`,
      });

      return NextResponse.json({ success: true });
    }

    if (action === "update_doctor_hours" && doctorId && doctorUpdates) {
      const updated = await updateDoctor(doctorId, doctorUpdates);

      await addAuditLog({
        actor: session.username,
        action: "doctor_schedule_updated",
        targetEntity: "doctor",
        targetId: doctorId,
        details: `Updated working hours/days for doctor ${doctorId}`,
      });

      return NextResponse.json({ success: true, doctor: updated });
    }

    return NextResponse.json({ success: false, error: "Invalid action" }, { status: 400 });
  } catch (err: unknown) {
    return NextResponse.json({ success: false, error: String(err) }, { status: 500 });
  }
}
