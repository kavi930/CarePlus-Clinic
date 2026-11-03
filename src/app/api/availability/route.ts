import { NextRequest, NextResponse } from "next/server";
import { getDoctor, getAppointments, getBlockedPeriods, getHolidays } from "@/lib/db";

function parseTimeToMinutes(tStr: string): number {
  const [h, m] = tStr.split(":").map(Number);
  return h * 60 + m;
}

function formatMinutesToTime(mins: number): string {
  const h = Math.floor(mins / 60);
  const m = mins % 60;
  const meridiem = h >= 12 ? "PM" : "AM";
  const displayH = h % 12 === 0 ? 12 : h % 12;
  const displayM = m.toString().padStart(2, "0");
  return `${displayH.toString().padStart(2, "0")}:${displayM} ${meridiem}`;
}

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const doctorId = searchParams.get("doctorId");
    const date = searchParams.get("date"); // YYYY-MM-DD

    if (!doctorId || !date) {
      return NextResponse.json(
        { success: false, error: "doctorId and date parameters are required" },
        { status: 400 }
      );
    }

    // 1. Check past dates in Asia/Kolkata
    const todayStr = new Intl.DateTimeFormat("en-CA", { timeZone: "Asia/Kolkata" }).format(new Date());
    if (date < todayStr) {
      return NextResponse.json({
        success: true,
        available: false,
        message: "Cannot check availability for past dates.",
        slots: [],
      });
    }

    const doctor = await getDoctor(doctorId);
    if (!doctor) {
      return NextResponse.json({ success: false, error: "Doctor not found" }, { status: 404 });
    }

    // 2. Check clinic holiday
    const holidays = await getHolidays();
    const holiday = holidays.find((h) => h.date === date);
    if (holiday) {
      return NextResponse.json({
        success: true,
        available: false,
        message: `Clinic is closed on this date: ${holiday.title}.`,
        slots: [],
      });
    }

    // 3. Check doctor day of week: Sunday = 0, Monday = 1, ...
    const targetDate = new Date(`${date}T12:00:00Z`);
    const dayOfWeek = targetDate.getUTCDay();

    if (!doctor.workingDays.includes(dayOfWeek)) {
      return NextResponse.json({
        success: true,
        available: false,
        message: `${doctor.name} does not have clinic hours on this day. Consulting days: ${doctor.workingDaysText}.`,
        slots: [],
      });
    }

    // 4. Check doctor blocked periods
    const blockedPeriods = await getBlockedPeriods(doctorId, date);
    if (blockedPeriods.some((b) => b.allDay)) {
      const reason = blockedPeriods.find((b) => b.allDay)?.reason || "Unavailable";
      return NextResponse.json({
        success: true,
        available: false,
        message: `${doctor.name} is unavailable on this date (${reason}).`,
        slots: [],
      });
    }

    const startMins = parseTimeToMinutes(doctor.workingHours.start);
    const endMins = parseTimeToMinutes(doctor.workingHours.end);
    const duration = doctor.slotDurationMinutes || 30;

    let breakStartMins = -1;
    let breakEndMins = -1;
    if (doctor.breakHours) {
      breakStartMins = parseTimeToMinutes(doctor.breakHours.start);
      breakEndMins = parseTimeToMinutes(doctor.breakHours.end);
    }

    // Fetch existing appointments on this date
    const bookedApts = await getAppointments({ doctorId, date });
    const activeBookedTimes = bookedApts
      .filter((a) => a.status !== "Cancelled")
      .map((a) => a.time.toLowerCase().trim());

    const allSlots: string[] = [];
    const availableSlots: string[] = [];
    const bookedSlots: string[] = [];

    for (let m = startMins; m + duration <= endMins; m += duration) {
      // Exclude lunch/break hours
      if (breakStartMins >= 0 && breakEndMins >= 0) {
        if (m >= breakStartMins && m < breakEndMins) {
          continue; // break slot
        }
      }

      // Check partial blocked period
      const isPartiallyBlocked = blockedPeriods.some((b) => {
        if (b.allDay) return true;
        if (b.startTime && b.endTime) {
          const bStart = parseTimeToMinutes(b.startTime);
          const bEnd = parseTimeToMinutes(b.endTime);
          return m >= bStart && m < bEnd;
        }
        return false;
      });

      if (isPartiallyBlocked) {
        continue;
      }

      const slotTime = formatMinutesToTime(m);
      allSlots.push(slotTime);

      if (activeBookedTimes.includes(slotTime.toLowerCase().trim())) {
        bookedSlots.push(slotTime);
      } else {
        availableSlots.push(slotTime);
      }
    }

    return NextResponse.json({
      success: true,
      available: true,
      doctor: {
        id: doctor.id,
        name: doctor.name,
        credentials: doctor.credentials,
        specialty: doctor.specialty,
        workingHours: doctor.workingHours,
        breakHours: doctor.breakHours,
        slotDurationMinutes: duration,
      },
      date,
      slots: availableSlots,
      bookedSlots,
      totalSlotsCount: allSlots.length,
      availableSlotsCount: availableSlots.length,
    });
  } catch (err: unknown) {
    return NextResponse.json({ success: false, error: String(err) }, { status: 500 });
  }
}
