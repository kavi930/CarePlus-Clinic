import { NextRequest, NextResponse } from "next/server";
import {
  getAppointments,
  createAppointment,
  createEnquiry,
  updateAppointment,
} from "@/lib/db";
import { dispatchAutomationEvent } from "@/lib/automation";

export async function GET() {
  return NextResponse.json({
    status: "active",
    message: "Simulation endpoint expects POST with { action: 'simulate_enquiry' | 'simulate_appointment' | 'simulate_24h_reminder' }",
    supportedMethods: ["POST"],
  });
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { action } = body;

    const timestamp = new Date().toISOString();
    const randomSuffix = Math.floor(100 + Math.random() * 900);

    if (action === "simulate_enquiry") {
      const sampleNames = ["Jordan Hayes", "Maya Robinson", "Liam Vance", "Nora Brooks", "Ethan Zhang"];
      const sampleServices = ["Dermatology Consultation", "Dental Consultation", "Physiotherapy", "General Consultation"];
      const sampleQuestions = [
        "I'd like to check if you have afternoon availability with Dr. Arjun Kapoor next Tuesday for skin allergies.",
        "Could you clarify if first-time physiotherapy consults require a prior referral from a GP?",
        "Are routine teeth cleanings covered under basic preventive care plans?",
        "I need a general health checkup before starting a new corporate sports team.",
      ];

      const idx = Math.floor(Math.random() * sampleNames.length);
      const enq = await createEnquiry({
        name: `Demo Patient (${sampleNames[idx]})`,
        phone: `+1 555-01${randomSuffix.toString().slice(0, 2)}-${randomSuffix}`,
        email: `demo.${sampleNames[idx].toLowerCase().replace(/\s+/g, ".")}@example.com`,
        question: sampleQuestions[idx % sampleQuestions.length],
        service: sampleServices[idx % sampleServices.length],
        preferred_contact: "Email",
        source: "Demo Simulation",
        status: "New",
        classification: idx % 2 === 0 ? "Appointment Ready" : "Needs Information",
        follow_up_status: "Pending",
        assigned_to: "Front Desk Triage",
        consent: true,
      });

      await dispatchAutomationEvent("enquiry.created", enq);

      return NextResponse.json({
        success: true,
        message: "Enquiry simulation generated successfully",
        data: enq,
      });
    }

    if (action === "simulate_appointment") {
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      const tomorrowStr = new Intl.DateTimeFormat("en-CA", { timeZone: "Asia/Kolkata" }).format(tomorrow);

      const aptRes = await createAppointment({
        patient_name: `Demo Patient (Simulated #${randomSuffix})`,
        phone: `98765${randomSuffix.toString().padStart(5, "0")}`,
        email: `patient.${randomSuffix}@example.com`,
        service_id: "srv-gen-consult",
        service_name: "General Medical Consultation",
        doctor_id: "doc-kavita-goswami",
        doctor_name: "Dr. Kavita Goswami",
        date: tomorrowStr,
        time: "10:30 AM",
        duration: 30,
        status: "Confirmed",
        notes: "Automated simulation test for Apex Health Clinic demonstration.",
        preferred_contact: "WhatsApp",
        source: "Demo Simulation",
        consent: true,
        confirmation_status: "Pending",
        reminder_status: "Scheduled",
        calendar_sync_status: "Pending",
        whatsapp_delivery_status: "Pending",
        automation_status: "Pending",
      });

      if (!aptRes.success || !aptRes.appointment) {
        return NextResponse.json({ success: false, error: aptRes.error || "Simulation failed" }, { status: 409 });
      }

      await dispatchAutomationEvent("appointment.created", aptRes.appointment);

      return NextResponse.json({
        success: true,
        message: "Appointment simulation created and workflows triggered",
        data: aptRes.appointment,
      });
    }

    if (action === "simulate_reminder") {
      const appointments = await getAppointments();
      const active = appointments.find((a) => a.status === "Confirmed") || appointments[0];

      if (!active) {
        return NextResponse.json({ success: false, error: "No appointment available to simulate reminder" }, { status: 400 });
      }

      await dispatchAutomationEvent("reminder.24h", active);

      return NextResponse.json({
        success: true,
        message: `24-hour reminder simulation executed for appointment ${active.appointment_id}`,
        data: active,
      });
    }

    if (action === "simulate_cancellation") {
      const appointments = await getAppointments();
      const target = appointments.find((a) => a.status === "Confirmed" && a.source === "Demo Simulation") ||
                     appointments.find((a) => a.status === "Confirmed");

      if (!target) {
        return NextResponse.json({ success: false, error: "No active appointment found to cancel" }, { status: 400 });
      }

      const updated = await updateAppointment(target.appointment_id, {
        status: "Cancelled",
        cancellation_reason: "Demo interactive cancellation test",
        cancelled_at: timestamp,
        reminder_status: "Cancelled",
      });

      if (updated) {
        await dispatchAutomationEvent("appointment.cancelled", updated);
      }

      return NextResponse.json({
        success: true,
        message: `Appointment ${target.appointment_id} cancelled and slot released`,
        data: updated,
      });
    }

    if (action === "simulate_reschedule") {
      const appointments = await getAppointments();
      const target = appointments.find((a) => a.status === "Confirmed");

      if (!target) {
        return NextResponse.json({ success: false, error: "No confirmed appointment found to reschedule" }, { status: 400 });
      }

      const updated = await updateAppointment(target.appointment_id, {
        date: "2026-10-14",
        time: "11:30 AM",
        status: "Rescheduled",
        rescheduled_from: {
          date: target.date,
          time: target.time,
        },
        notes: `${target.notes || ""} | Rescheduled via Demo Simulator`,
        reminder_status: "Scheduled",
      });

      if (updated) {
        await dispatchAutomationEvent("appointment.rescheduled", updated);
      }

      return NextResponse.json({
        success: true,
        message: `Appointment ${target.appointment_id} moved to new slot`,
        data: updated,
      });
    }

    return NextResponse.json({ success: false, error: "Unknown simulation action" }, { status: 400 });
  } catch (err: unknown) {
    return NextResponse.json({ success: false, error: String(err) }, { status: 500 });
  }
}
