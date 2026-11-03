import { NextRequest, NextResponse } from "next/server";
import { getAppointments, createAppointment, getDoctor, getService, getSettings } from "@/lib/db";
import { dispatchAutomationEvent } from "@/lib/automation";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const doctorId = searchParams.get("doctorId") || undefined;
    const date = searchParams.get("date") || undefined;
    const status = searchParams.get("status") || undefined;
    const search = searchParams.get("search") || undefined;

    const appointments = await getAppointments({ doctorId, date, status, search });
    return NextResponse.json({ success: true, appointments });
  } catch (err: unknown) {
    return NextResponse.json({ success: false, error: String(err) }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      patient_name,
      phone,
      email,
      service_id,
      doctor_id,
      date,
      time,
      notes,
      preferred_contact = "WhatsApp",
      source = "Website Booking",
      consent = true,
    } = body;

    // Strict Server-side Validation
    if (!patient_name || !patient_name.trim()) {
      return NextResponse.json(
        { success: false, error: "Patient name is required." },
        { status: 400 }
      );
    }

    if (!phone || !phone.trim() || phone.replace(/\D/g, "").length < 10) {
      return NextResponse.json(
        { success: false, error: "A valid contact phone number (at least 10 digits) is required." },
        { status: 400 }
      );
    }

    if (!service_id || !doctor_id || !date || !time) {
      return NextResponse.json(
        { success: false, error: "Missing required booking details (department/service, doctor, date, or time slot)." },
        { status: 400 }
      );
    }

    const doctor = await getDoctor(doctor_id);
    if (!doctor) {
      return NextResponse.json({ success: false, error: "Selected doctor was not found." }, { status: 404 });
    }

    const service = await getService(service_id);
    if (!service) {
      return NextResponse.json({ success: false, error: "Selected service/treatment was not found." }, { status: 404 });
    }

    const settings = await getSettings();
    const initialStatus = settings.confirmationPolicy === "pending_staff_approval" ? "Pending" : "Confirmed";

    // Atomic creation with double booking lock and schedule validation
    const result = await createAppointment({
      patient_name: patient_name.trim(),
      phone: phone.trim(),
      email: email ? email.trim().toLowerCase() : undefined,
      service_id: service.id,
      service_name: service.name,
      doctor_id: doctor.id,
      doctor_name: doctor.name,
      date: date.trim(),
      time: time.trim(),
      duration: doctor.slotDurationMinutes || service.durationMinutes || 30,
      status: initialStatus,
      notes: notes ? notes.trim() : undefined,
      preferred_contact,
      source,
      consent: Boolean(consent),
      confirmation_status: "Pending",
      reminder_status: "Scheduled",
      calendar_sync_status: "Pending",
      whatsapp_delivery_status: "Pending",
      automation_status: "Pending",
    });

    if (!result.success || !result.appointment) {
      return NextResponse.json(
        { success: false, error: result.error || "Unable to reserve slot. It may have just been booked by another patient." },
        { status: 409 }
      );
    }

    // Trigger asynchronous automation pipeline (WhatsApp, Email, Calendar sync)
    // Runs after atomic confirmation
    dispatchAutomationEvent("appointment.created", result.appointment).catch((err) => {
      console.error("Background automation dispatch error:", err);
    });

    return NextResponse.json(
      {
        success: true,
        appointment: result.appointment,
        reference_no: result.appointment.reference_no,
        message:
          initialStatus === "Confirmed"
            ? "Your appointment has been confirmed successfully!"
            : "Your appointment request has been recorded and is awaiting staff confirmation.",
      },
      { status: 201 }
    );
  } catch (err: unknown) {
    return NextResponse.json({ success: false, error: String(err) }, { status: 500 });
  }
}
