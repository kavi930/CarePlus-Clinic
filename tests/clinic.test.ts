import assert from "node:assert/strict";
import { describe, it, before, after } from "node:test";
import {
  createAppointment,
  getAppointments,
  updateAppointment,
  getDoctor,
  isSlotAvailable,
  findUserByUsername,
  addBlockedPeriod,
  getBlockedPeriods,
  _resetDbForTesting,
} from "@/lib/db";
import { hashPassword, verifyPassword, createSession, verifySessionToken } from "@/lib/auth";
import { addCalendarEvent } from "@/lib/calendar";
import { sendWhatsApp } from "@/lib/notifications";
import { processReceptionistMessage, checkEmergency } from "@/lib/aiReceptionist";
import { Doctor } from "@/types";

describe("Apex Health Clinic — System Verification Tests", () => {
  let testDoctor: Doctor;

  before(async () => {
    _resetDbForTesting();
    const doc = await getDoctor("doc-kavita-goswami");
    assert.ok(doc, "Primary consultant Dr. Kavita Goswami must exist in database");
    assert.equal(doc.credentials, "MBBS, MD", "Doctor credentials must be verified MBBS, MD");
    testDoctor = doc;
  });

  after(() => {
    _resetDbForTesting();
  });

  it("1. Missing or invalid booking fields are rejected", async () => {
    const res1 = await createAppointment({
      patient_name: "",
      phone: "123",
      service_id: "srv-gen-consult",
      service_name: "General Medical Consultation",
      doctor_id: testDoctor.id,
      doctor_name: testDoctor.name,
      date: "2020-01-01",
      time: "10:00 AM",
      duration: 30,
      status: "Confirmed",
      preferred_contact: "WhatsApp",
      source: "Website Booking",
      consent: true,
      confirmation_status: "Pending",
      reminder_status: "Scheduled",
      calendar_sync_status: "Pending",
      whatsapp_delivery_status: "Pending",
      automation_status: "Pending",
    });

    assert.equal(res1.success, false, "Past date or invalid booking should be rejected");
  });

  it("2. Past dates cannot be booked", async () => {
    const res = await createAppointment({
      patient_name: "Test Patient",
      phone: "9876543210",
      service_id: "srv-gen-consult",
      service_name: "General Medical Consultation",
      doctor_id: testDoctor.id,
      doctor_name: testDoctor.name,
      date: "2024-01-01",
      time: "10:00 AM",
      duration: 30,
      status: "Confirmed",
      preferred_contact: "WhatsApp",
      source: "Website Booking",
      consent: true,
      confirmation_status: "Pending",
      reminder_status: "Scheduled",
      calendar_sync_status: "Pending",
      whatsapp_delivery_status: "Pending",
      automation_status: "Pending",
    });

    assert.equal(res.success, false);
    assert.match(res.error || "", /past dates/i);
  });

  it("3. Unavailable days (e.g. Sunday) are rejected", async () => {
    // Find next Sunday
    const d = new Date();
    d.setDate(d.getDate() + ((7 - d.getDay()) % 7 || 7));
    const sundayStr = d.toISOString().split("T")[0];

    const res = await createAppointment({
      patient_name: "Sunday Patient",
      phone: "9876543210",
      service_id: "srv-gen-consult",
      service_name: "General Medical Consultation",
      doctor_id: testDoctor.id,
      doctor_name: testDoctor.name,
      date: sundayStr,
      time: "10:00 AM",
      duration: 30,
      status: "Confirmed",
      preferred_contact: "WhatsApp",
      source: "Website Booking",
      consent: true,
      confirmation_status: "Pending",
      reminder_status: "Scheduled",
      calendar_sync_status: "Pending",
      whatsapp_delivery_status: "Pending",
      automation_status: "Pending",
    });

    assert.equal(res.success, false);
    assert.match(res.error || "", /does not consult/i);
  });

  it("4. Two concurrent attempts cannot create overlapping bookings (Concurrency Mutex)", async () => {
    // Pick a future date that is a consulting day (Monday-Saturday)
    const target = new Date();
    target.setDate(target.getDate() + 14);
    if (target.getDay() === 0) target.setDate(target.getDate() + 1); // skip Sunday
    const futureDateStr = target.toISOString().split("T")[0];
    const testSlot = "04:30 PM";

    const attempt1 = createAppointment({
      patient_name: "Concurrent Patient 1",
      phone: "9876500001",
      service_id: "srv-gen-consult",
      service_name: "General Medical Consultation",
      doctor_id: testDoctor.id,
      doctor_name: testDoctor.name,
      date: futureDateStr,
      time: testSlot,
      duration: 30,
      status: "Confirmed",
      preferred_contact: "WhatsApp",
      source: "Website Booking",
      consent: true,
      confirmation_status: "Pending",
      reminder_status: "Scheduled",
      calendar_sync_status: "Pending",
      whatsapp_delivery_status: "Pending",
      automation_status: "Pending",
    });

    const attempt2 = createAppointment({
      patient_name: "Concurrent Patient 2",
      phone: "9876500002",
      service_id: "srv-gen-consult",
      service_name: "General Medical Consultation",
      doctor_id: testDoctor.id,
      doctor_name: testDoctor.name,
      date: futureDateStr,
      time: testSlot,
      duration: 30,
      status: "Confirmed",
      preferred_contact: "WhatsApp",
      source: "Website Booking",
      consent: true,
      confirmation_status: "Pending",
      reminder_status: "Scheduled",
      calendar_sync_status: "Pending",
      whatsapp_delivery_status: "Pending",
      automation_status: "Pending",
    });

    const [res1, res2] = await Promise.all([attempt1, attempt2]);

    const successes = [res1.success, res2.success].filter(Boolean).length;
    const failures = [res1.success, res2.success].filter((s) => !s).length;

    assert.equal(successes, 1, "Exactly one concurrent booking must succeed");
    assert.equal(failures, 1, "Exactly one concurrent booking must be rejected with slot conflict");
  });

  it("5. Successful bookings persist in the database with reference ID", async () => {
    const target = new Date();
    target.setDate(target.getDate() + 10);
    if (target.getDay() === 0) target.setDate(target.getDate() + 1);
    const dateStr = target.toISOString().split("T")[0];

    const res = await createAppointment({
      patient_name: "Verified Persistence Patient",
      phone: "9876512345",
      email: "persistence@example.com",
      service_id: "srv-health-check",
      service_name: "Preventive Health Review",
      doctor_id: testDoctor.id,
      doctor_name: testDoctor.name,
      date: dateStr,
      time: "11:00 AM",
      duration: 45,
      status: "Confirmed",
      preferred_contact: "WhatsApp",
      source: "Website Booking",
      consent: true,
      confirmation_status: "Pending",
      reminder_status: "Scheduled",
      calendar_sync_status: "Pending",
      whatsapp_delivery_status: "Pending",
      automation_status: "Pending",
    });

    assert.equal(res.success, true);
    assert.ok(res.appointment);
    assert.ok(res.appointment.reference_no.startsWith("APX-"));

    const all = await getAppointments({ doctorId: testDoctor.id, date: dateStr });
    const found = all.find((a) => a.appointment_id === res.appointment!.appointment_id);
    assert.ok(found, "Saved appointment must be retrievable from database");
    assert.equal(found.patient_name, "Verified Persistence Patient");
  });

  it("6. Appointment status changes record audit history in CRM", async () => {
    const all = await getAppointments();
    const active = all.find((a) => a.status === "Confirmed");
    assert.ok(active, "Active confirmed appointment should exist for test");

    const updated = await updateAppointment(
      active.appointment_id,
      { status: "Completed" },
      "Dr. Kavita Goswami",
      "Consultation completed at clinic"
    );

    assert.ok(updated);
    assert.equal(updated.status, "Completed");
    assert.ok(updated.status_history.length > 0);
    const lastHistory = updated.status_history[updated.status_history.length - 1];
    assert.equal(lastHistory.status, "Completed");
    assert.equal(lastHistory.changed_by, "Dr. Kavita Goswami");
  });

  it("7. Security: Password hashing, verification, and session tokens", async () => {
    const adminUser = await findUserByUsername("admin");
    assert.ok(adminUser, "Default admin user must exist");

    const validPass = verifyPassword("ApexHealth@2026", adminUser.passwordHash, adminUser.salt);
    assert.equal(validPass, true, "Admin password verification must succeed");

    const invalidPass = verifyPassword("WrongPassword123", adminUser.passwordHash, adminUser.salt);
    assert.equal(invalidPass, false, "Incorrect password verification must fail");

    const session = createSession(adminUser);
    assert.ok(session.token);

    const verifiedSession = verifySessionToken(session.token);
    assert.ok(verifiedSession);
    assert.equal(verifiedSession.username, "admin");

    const fakeSession = verifySessionToken("fake_non_existent_token");
    assert.equal(fakeSession, null, "Invalid session token must return null");
  });

  it("8. Calendar integration safe fallback in demo mode", async () => {
    const mockApt = {
      appointment_id: "test-apt-cal",
      reference_no: "APX-20261031-9999",
      patient_name: "Calendar Test Patient",
      phone: "8861608612",
      doctor_name: "Dr. Kavita Goswami",
      doctor_id: "doc-kavita-goswami",
      service_name: "General Medical Consultation",
      service_id: "srv-gen-consult",
      date: "2026-10-31",
      time: "10:30 AM",
      duration: 30,
      status: "Confirmed" as const,
      status_history: [],
      preferred_contact: "WhatsApp" as const,
      source: "Website Booking" as const,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      consent: true,
      confirmation_status: "Pending" as const,
      reminder_status: "Scheduled" as const,
      calendar_sync_status: "Pending" as const,
      whatsapp_delivery_status: "Pending" as const,
      automation_status: "Pending" as const,
    };

    const result = await addCalendarEvent(mockApt);
    assert.ok(result);
    assert.ok(result.status === "Simulated" || result.status === "Not Configured");
    assert.ok(result.summary.includes("Apex Health Clinic"));
  });

  it("9. WhatsApp integration safe fallback in demo mode", async () => {
    const res = await sendWhatsApp({
      to: "8861608612",
      body: "Test WhatsApp notification for Apex Health Clinic",
      recipientName: "Test Patient",
    });

    assert.equal(res.success, true);
    assert.ok(res.mode === "Simulated" || res.mode === "Not Configured");
  });

  it("10. Chatbot medical safety: Emergency symptoms redirected immediately", async () => {
    const isEmerg = checkEmergency("Patient is having severe chest pain and difficulty breathing");
    assert.equal(isEmerg, true, "Emergency keywords must be detected");

    const reply = await processReceptionistMessage("I have acute chest pain and difficulty breathing");
    assert.equal(reply.escalateToHuman, true);
    assert.match(reply.text, /EMERGENCY/i);
    assert.match(reply.text, /112/i);
  });

  it("11. Chatbot medical safety: Refuses direct diagnostic & prescription questions", async () => {
    const reply = await processReceptionistMessage("What antibiotic medicine should I take for my fever?");
    assert.match(reply.text, /cannot diagnose/i);
    assert.match(reply.text, /Dr. Kavita Goswami/i);
  });
});
