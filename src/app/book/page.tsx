"use client";

import React, { useState, useEffect, Suspense } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import {
  Calendar,
  Clock,
  User,
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  Loader2,
  AlertCircle,
  Phone,
  Mail,
  ShieldCheck,
  MapPin,
  MessageCircle,
  ExternalLink,
} from "lucide-react";
import { Doctor, Treatment, Appointment } from "@/types";

interface PatientForm {
  patient_name: string;
  phone: string;
  email: string;
  notes: string;
  preferred_contact: "WhatsApp" | "Phone" | "Email";
  consent: boolean;
}

function BookingContent() {
  const searchParams = useSearchParams();

  const [step, setStep] = useState(1);
  const [services, setServices] = useState<Treatment[]>([]);
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [selectedService, setSelectedService] = useState<Treatment | null>(null);
  const [selectedDoctor, setSelectedDoctor] = useState<Doctor | null>(null);
  const [selectedDate, setSelectedDate] = useState<string>("");
  const [selectedSlot, setSelectedSlot] = useState<string>("");

  const [slots, setSlots] = useState<string[]>([]);
  const [bookedSlots, setBookedSlots] = useState<string[]>([]);
  const [slotsLoading, setSlotsLoading] = useState(false);
  const [slotError, setSlotError] = useState<string | null>(null);

  const [form, setForm] = useState<PatientForm>({
    patient_name: "",
    phone: "",
    email: "",
    notes: "",
    preferred_contact: "WhatsApp",
    consent: true,
  });

  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [confirmedBooking, setConfirmedBooking] = useState<Appointment | null>(null);

  // Today & Max advance date in Asia/Kolkata
  const [todayStr, setTodayStr] = useState("");
  const [maxDateStr, setMaxDateStr] = useState("");

  // 1. Load services & doctors on mount
  useEffect(() => {
    const today = new Intl.DateTimeFormat("en-CA", { timeZone: "Asia/Kolkata" }).format(new Date());
    setTodayStr(today);
    const d = new Date();
    d.setDate(d.getDate() + 30);
    setMaxDateStr(new Intl.DateTimeFormat("en-CA", { timeZone: "Asia/Kolkata" }).format(d));

    const fetchData = async () => {
      try {
        const [srvRes, docRes] = await Promise.all([
          fetch("/api/services").then((r) => r.json()),
          fetch("/api/doctors").then((r) => r.json()),
        ]);

        if (srvRes.success) setServices(srvRes.services || []);
        if (docRes.success) {
          const docList = docRes.doctors || [];
          setDoctors(docList);
          // Default to Dr. Kavita Goswami if only one or primary
          if (docList.length > 0) {
            setSelectedDoctor(docList[0]);
          }
        }
      } catch (e) {
        console.error("Failed to load initial booking data:", e);
      }
    };

    fetchData();
  }, []);

  // 2. Handle URL parameters pre-selection
  useEffect(() => {
    if (services.length > 0) {
      const srvParam = searchParams.get("service");
      if (srvParam) {
        const matched = services.find((s) => s.id === srvParam || s.slug === srvParam);
        if (matched) {
          setSelectedService(matched);
          setStep(2);
        }
      }
    }
  }, [searchParams, services]);

  // 3. Load slots whenever selectedDoctor and selectedDate change
  useEffect(() => {
    if (!selectedDoctor || !selectedDate) {
      setSlots([]);
      return;
    }

    const fetchSlots = async () => {
      setSlotsLoading(true);
      setSlotError(null);
      setSelectedSlot("");

      try {
        const res = await fetch(`/api/availability?doctorId=${selectedDoctor.id}&date=${selectedDate}`);
        const data = await res.json();

        if (data.success) {
          if (!data.available) {
            setSlotError(data.message || "No slots available on this date.");
            setSlots([]);
            setBookedSlots([]);
          } else {
            setSlots(data.slots || []);
            setBookedSlots(data.bookedSlots || []);
            if ((data.slots || []).length === 0) {
              setSlotError("All consultation slots for this date have been filled.");
            }
          }
        } else {
          setSlotError(data.error || "Unable to check availability.");
          setSlots([]);
        }
      } catch {
        setSlotError("Network error while checking slot availability.");
        setSlots([]);
      } finally {
        setSlotsLoading(false);
      }
    };

    fetchSlots();
  }, [selectedDoctor, selectedDate]);

  // 4. Handle final appointment booking submission
  const handleBookingSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!selectedService || !selectedDoctor || !selectedDate || !selectedSlot) {
      setSubmitError("Please ensure all booking steps (service, doctor, date, and slot) are complete.");
      return;
    }

    if (!form.patient_name.trim()) {
      setSubmitError("Please provide the patient full name.");
      return;
    }

    const cleanPhone = form.phone.replace(/\D/g, "");
    if (!form.phone.trim() || cleanPhone.length < 10) {
      setSubmitError("Please provide a valid 10-digit phone number.");
      return;
    }

    if (!form.consent) {
      setSubmitError("Please accept the clinic booking consent to proceed.");
      return;
    }

    setSubmitting(true);
    setSubmitError(null);

    try {
      const res = await fetch("/api/appointments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          patient_name: form.patient_name.trim(),
          phone: form.phone.trim(),
          email: form.email.trim() || undefined,
          service_id: selectedService.id,
          doctor_id: selectedDoctor.id,
          date: selectedDate,
          time: selectedSlot,
          notes: form.notes.trim() || undefined,
          preferred_contact: form.preferred_contact,
          source: "Website Booking",
          consent: true,
        }),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        throw new Error(data.error || "The requested slot is no longer available. Please select another slot.");
      }

      setConfirmedBooking(data.appointment);
    } catch (err: unknown) {
      setSubmitError(err instanceof Error ? err.message : "Failed to record booking. Please try another slot or call 8861608612.");
    } finally {
      setSubmitting(false);
    }
  };

  // Google Calendar helper link for confirmed state
  const getGoogleCalendarUrl = (apt: Appointment) => {
    try {
      const [year, month, day] = apt.date.split("-").map(Number);
      const timeMatch = apt.time.match(/(\d+):(\d+)\s*(AM|PM)?/i);
      let hour = 10;
      let min = 0;
      if (timeMatch) {
        hour = parseInt(timeMatch[1], 10);
        min = parseInt(timeMatch[2], 10);
        const meridiem = timeMatch[3]?.toUpperCase();
        if (meridiem === "PM" && hour < 12) hour += 12;
        if (meridiem === "AM" && hour === 12) hour = 0;
      }
      const start = new Date(Date.UTC(year, month - 1, day, hour, min));
      const end = new Date(start.getTime() + 30 * 60000);
      const pad = (n: number) => n.toString().padStart(2, "0");
      const fmt = (d: Date) =>
        `${d.getUTCFullYear()}${pad(d.getUTCMonth() + 1)}${pad(d.getUTCDate())}T${pad(d.getUTCHours())}${pad(d.getUTCMinutes())}00Z`;

      const title = encodeURIComponent(`Apex Health Clinic: ${apt.service_name}`);
      const details = encodeURIComponent(
        `Consultation with ${apt.doctor_name} at Apex Health Clinic.\nRef: ${apt.reference_no}\nAddress: Plot No. 3, Vaishali, Ghaziabad\nPhone: 8861608612`
      );
      const location = encodeURIComponent("Apex Health Clinic, Plot No. 3, Vaishali, Ghaziabad");
      return `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${title}&dates=${fmt(start)}/${fmt(end)}&details=${details}&location=${location}`;
    } catch {
      return "https://calendar.google.com";
    }
  };

  // ─── CONFIRMATION SUCCESS VIEW ───
  if (confirmedBooking) {
    return (
      <div className="max-w-2xl mx-auto py-12 px-4">
        <div className="bg-white rounded-3xl p-8 sm:p-10 border border-slate-200/90 shadow-lg text-center space-y-6">
          <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-700 mx-auto flex items-center justify-center">
            <CheckCircle2 className="w-10 h-10" />
          </div>

          <div className="space-y-1">
            <span className="px-3 py-1 rounded-full bg-emerald-50 text-emerald-800 text-xs font-bold border border-emerald-200">
              Booking {confirmedBooking.status}
            </span>
            <h1 className="text-3xl font-extrabold text-slate-900 pt-2">Appointment Reserved</h1>
            <p className="text-sm text-slate-600">
              Your consultation has been registered in the Apex Health Clinic system.
            </p>
          </div>

          {/* Reference Card */}
          <div className="bg-slate-50 rounded-2xl p-6 border border-slate-200 text-left space-y-3.5 text-sm">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200">
              <span className="text-xs font-semibold text-slate-500 uppercase">Booking Reference</span>
              <span className="font-mono font-bold text-base text-blue-950 bg-blue-50 px-2.5 py-1 rounded-md border border-blue-200">
                {confirmedBooking.reference_no}
              </span>
            </div>

            <div className="grid sm:grid-cols-2 gap-3 text-xs">
              <div>
                <span className="text-slate-500 block">Doctor:</span>
                <span className="font-bold text-slate-900 text-sm">{confirmedBooking.doctor_name}</span>
                <span className="text-slate-500 block text-[11px]">MBBS, MD • Consultant Physician</span>
              </div>
              <div>
                <span className="text-slate-500 block">Service:</span>
                <span className="font-bold text-slate-900 text-sm">{confirmedBooking.service_name}</span>
              </div>
              <div>
                <span className="text-slate-500 block">Date & Time:</span>
                <span className="font-bold text-slate-900 text-sm">{confirmedBooking.date} at {confirmedBooking.time}</span>
              </div>
              <div>
                <span className="text-slate-500 block">Patient Name:</span>
                <span className="font-bold text-slate-900 text-sm">{confirmedBooking.patient_name}</span>
              </div>
              <div>
                <span className="text-slate-500 block">Contact Phone:</span>
                <span className="font-semibold text-slate-800">{confirmedBooking.phone}</span>
              </div>
              <div>
                <span className="text-slate-500 block">Location:</span>
                <span className="font-semibold text-slate-800">Plot No. 3, Vaishali, Ghaziabad</span>
              </div>
            </div>
          </div>

          {/* Action CTAs */}
          <div className="space-y-3 pt-2">
            <a
              href={getGoogleCalendarUrl(confirmedBooking)}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-blue-900 hover:bg-blue-950 text-white font-semibold text-sm transition shadow-xs"
            >
              <Calendar className="w-4 h-4 text-teal-300" />
              <span>Add to Google Calendar</span>
              <ExternalLink className="w-3.5 h-3.5 ml-1 opacity-70" />
            </a>

            <a
              href={`https://wa.me/918861608612?text=${encodeURIComponent(
                `Hello Apex Health Clinic, I have booked appointment ref: ${confirmedBooking.reference_no} for ${confirmedBooking.date} at ${confirmedBooking.time}.`
              )}`}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-800 font-semibold text-sm transition border border-emerald-200"
            >
              <MessageCircle className="w-4 h-4 text-emerald-600" />
              <span>Send Reference on WhatsApp (8861608612)</span>
            </a>

            <div className="flex justify-center gap-4 text-xs text-slate-500 pt-2">
              <Link href="/" className="hover:text-blue-900">
                ← Return to Home
              </Link>
              <span>•</span>
              <button
                onClick={() => {
                  setConfirmedBooking(null);
                  setSelectedSlot("");
                  setSelectedDate("");
                  setStep(1);
                }}
                className="hover:text-blue-900"
              >
                Book Another Appointment
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto py-12 px-4">
      {/* Page Header */}
      <div className="text-center mb-8 space-y-2">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-teal-50 text-teal-800 text-xs font-semibold border border-teal-200">
          <ShieldCheck className="w-3.5 h-3.5 text-teal-600" />
          Apex Health Clinic • Verified Online Booking
        </div>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900">
          Book Doctor Consultation
        </h1>
        <p className="text-sm text-slate-600 max-w-xl mx-auto">
          Consultation with Dr. Kavita Goswami (MBBS, MD) at Plot No. 3, Vaishali, Ghaziabad.
        </p>
      </div>

      {/* Stepper Header */}
      <div className="grid grid-cols-4 gap-2 mb-8 text-center text-xs font-semibold">
        {[
          { num: 1, title: "1. Service" },
          { num: 2, title: "2. Doctor" },
          { num: 3, title: "3. Date & Slot" },
          { num: 4, title: "4. Details" },
        ].map((s) => (
          <div
            key={s.num}
            className={`py-2.5 px-2 rounded-xl border transition-all ${
              step === s.num
                ? "bg-blue-900 text-white border-blue-900 shadow-xs"
                : step > s.num
                ? "bg-teal-50 text-teal-900 border-teal-200"
                : "bg-slate-50 text-slate-400 border-slate-200"
            }`}
          >
            {s.title}
          </div>
        ))}
      </div>

      {submitError && (
        <div className="mb-6 bg-red-50 border border-red-200 text-red-700 rounded-2xl p-4 text-xs flex items-start gap-2.5">
          <AlertCircle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
          <span>{submitError}</span>
        </div>
      )}

      {/* ─── STEP 1: SELECT SERVICE ─── */}
      {step === 1 && (
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-xs space-y-6">
          <div>
            <h2 className="text-lg font-bold text-slate-900">Step 1: Select Consultation or Treatment</h2>
            <p className="text-xs text-slate-500">Choose the outpatient service you require.</p>
          </div>

          <div className="grid sm:grid-cols-2 gap-4">
            {services.map((srv) => (
              <button
                key={srv.id}
                type="button"
                onClick={() => {
                  setSelectedService(srv);
                  setStep(2);
                }}
                className={`p-5 rounded-2xl border text-left transition flex flex-col justify-between ${
                  selectedService?.id === srv.id
                    ? "bg-teal-50/50 border-teal-600 ring-2 ring-teal-500/20"
                    : "bg-slate-50/60 border-slate-200 hover:border-teal-300 hover:bg-slate-50"
                }`}
              >
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[11px] font-bold uppercase tracking-wider text-teal-700">
                      {srv.departmentName}
                    </span>
                    <span className="text-xs text-slate-500">{srv.durationMinutes || 30} mins</span>
                  </div>
                  <div className="font-bold text-slate-900 text-base mb-1.5">{srv.name}</div>
                  <p className="text-xs text-slate-600 leading-relaxed">{srv.description}</p>
                </div>
                <div className="pt-3 border-t border-slate-200/60 mt-3 flex items-center justify-between text-xs font-semibold text-blue-900">
                  <span>Select Consultation</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </div>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* ─── STEP 2: SELECT DOCTOR ─── */}
      {step === 2 && (
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-xs space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-bold text-slate-900">Step 2: Select Consulting Physician</h2>
              <p className="text-xs text-slate-500">Consultant leading care for {selectedService?.name}.</p>
            </div>
            <button
              onClick={() => setStep(1)}
              className="text-xs text-slate-500 hover:text-slate-800 flex items-center gap-1 font-medium"
            >
              <ArrowLeft className="w-3.5 h-3.5" /> Back
            </button>
          </div>

          <div className="space-y-4">
            {doctors.map((doc) => (
              <div
                key={doc.id}
                onClick={() => {
                  setSelectedDoctor(doc);
                  setStep(3);
                }}
                className={`p-6 rounded-2xl border cursor-pointer transition flex flex-col sm:flex-row sm:items-center justify-between gap-4 ${
                  selectedDoctor?.id === doc.id
                    ? "bg-teal-50/50 border-teal-600 ring-2 ring-teal-500/20"
                    : "bg-slate-50/60 border-slate-200 hover:border-teal-300"
                }`}
              >
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 rounded-2xl bg-blue-900 text-teal-300 flex items-center justify-center font-bold text-lg shrink-0">
                    {doc.name.split(" ").map((n) => n[0]).join("")}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="font-bold text-slate-900 text-base">{doc.name}</h3>
                      <span className="px-2 py-0.5 rounded bg-blue-100 text-blue-900 font-bold text-xs">
                        {doc.credentials}
                      </span>
                    </div>
                    <div className="text-xs text-teal-700 font-medium">{doc.title} • {doc.specialty}</div>
                    <div className="text-xs text-slate-500 mt-1">
                      Consulting: {doc.workingDaysText} (9:30 AM – 6:30 PM) • {doc.slotDurationMinutes} min slots
                    </div>
                  </div>
                </div>

                <button
                  type="button"
                  className="px-4 py-2 rounded-xl bg-blue-900 text-white font-semibold text-xs shrink-0 flex items-center gap-1.5"
                >
                  <span>Select & Continue</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ─── STEP 3: DATE & SLOT ─── */}
      {step === 3 && (
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-xs space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-bold text-slate-900">Step 3: Select Date & Available Time Slot</h2>
              <p className="text-xs text-slate-500">
                Checking live availability for {selectedDoctor?.name} ({selectedService?.name}).
              </p>
            </div>
            <button
              onClick={() => setStep(2)}
              className="text-xs text-slate-500 hover:text-slate-800 flex items-center gap-1 font-medium"
            >
              <ArrowLeft className="w-3.5 h-3.5" /> Back
            </button>
          </div>

          {/* Date Picker Input */}
          <div className="bg-slate-50 p-5 rounded-2xl border border-slate-200 space-y-3">
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wide">
              Choose Consultation Date
            </label>
            <input
              type="date"
              min={todayStr}
              max={maxDateStr}
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="w-full sm:w-64 px-4 py-2.5 bg-white border border-slate-300 rounded-xl text-sm font-medium text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-teal-500"
            />
            <div className="text-[11px] text-slate-500">
              Note: Clinic consultations are held Monday to Saturday. Sundays and clinic holidays are unavailable.
            </div>
          </div>

          {/* Available Slots */}
          {selectedDate && (
            <div className="space-y-3 pt-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-700 uppercase tracking-wide">
                  Available Slots for {selectedDate}
                </span>
                {slotsLoading && (
                  <span className="text-xs text-teal-700 flex items-center gap-1.5 font-medium">
                    <Loader2 className="w-3.5 h-3.5 animate-spin" /> Checking server slots...
                  </span>
                )}
              </div>

              {slotError && (
                <div className="bg-amber-50 border border-amber-200 text-amber-800 rounded-xl p-3.5 text-xs flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 text-amber-600 shrink-0" />
                  <span>{slotError}</span>
                </div>
              )}

              {!slotsLoading && slots.length > 0 && (
                <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-2.5 pt-1">
                  {slots.map((slot) => (
                    <button
                      key={slot}
                      type="button"
                      onClick={() => setSelectedSlot(slot)}
                      className={`py-2.5 px-3 rounded-xl text-xs font-semibold border transition ${
                        selectedSlot === slot
                          ? "bg-blue-900 text-white border-blue-900 shadow-xs ring-2 ring-blue-500/30"
                          : "bg-slate-50 text-slate-700 hover:bg-teal-50 hover:border-teal-300 border-slate-200"
                      }`}
                    >
                      {slot}
                    </button>
                  ))}
                </div>
              )}

              {/* Booked / Unavailable Slots indicator */}
              {!slotsLoading && bookedSlots.length > 0 && (
                <div className="pt-2">
                  <span className="text-[11px] text-slate-400 block mb-1.5">Already reserved slots:</span>
                  <div className="flex flex-wrap gap-1.5">
                    {bookedSlots.map((bs) => (
                      <span
                        key={bs}
                        className="py-1 px-2.5 rounded-lg text-[11px] bg-slate-100 text-slate-400 line-through border border-slate-200"
                      >
                        {bs}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Continue button */}
          <div className="pt-4 flex justify-end">
            <button
              type="button"
              disabled={!selectedDate || !selectedSlot}
              onClick={() => setStep(4)}
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-blue-900 hover:bg-blue-950 text-white font-semibold text-sm transition disabled:opacity-40"
            >
              <span>Continue with {selectedSlot || "Selected Slot"}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* ─── STEP 4: PATIENT DETAILS & CONFIRMATION ─── */}
      {step === 4 && (
        <form onSubmit={handleBookingSubmit} className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-xs space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-bold text-slate-900">Step 4: Patient Information & Review</h2>
              <p className="text-xs text-slate-500">Review your appointment selection and enter your contact details.</p>
            </div>
            <button
              type="button"
              onClick={() => setStep(3)}
              className="text-xs text-slate-500 hover:text-slate-800 flex items-center gap-1 font-medium"
            >
              <ArrowLeft className="w-3.5 h-3.5" /> Back
            </button>
          </div>

          {/* Selected Booking Summary */}
          <div className="bg-teal-50/60 rounded-2xl p-4 sm:p-5 border border-teal-200/80 grid sm:grid-cols-3 gap-3 text-xs">
            <div>
              <span className="text-slate-500 block">Service:</span>
              <span className="font-bold text-slate-900 text-sm">{selectedService?.name}</span>
            </div>
            <div>
              <span className="text-slate-500 block">Consulting Doctor:</span>
              <span className="font-bold text-slate-900 text-sm">{selectedDoctor?.name}</span>
              <span className="text-[11px] text-teal-800 font-medium">({selectedDoctor?.credentials})</span>
            </div>
            <div>
              <span className="text-slate-500 block">Scheduled Slot:</span>
              <span className="font-bold text-blue-900 text-sm">{selectedDate} at {selectedSlot}</span>
            </div>
          </div>

          {/* Patient Form Fields */}
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Patient Full Name <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <User className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  required
                  value={form.patient_name}
                  onChange={(e) => setForm({ ...form, patient_name: e.target.value })}
                  placeholder="e.g. Anjali Sharma"
                  className="w-full pl-9 pr-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-teal-500 focus:bg-white transition"
                />
              </div>
            </div>

            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Contact Phone Number <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <Phone className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="tel"
                    required
                    value={form.phone}
                    onChange={(e) => setForm({ ...form, phone: e.target.value })}
                    placeholder="e.g. 9876543210"
                    className="w-full pl-9 pr-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-teal-500 focus:bg-white transition"
                  />
                </div>
                <span className="text-[10px] text-slate-400 mt-0.5 block">10-digit number for SMS/WhatsApp confirmations</span>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Email Address <span className="text-slate-400">(Optional)</span>
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="email"
                    value={form.email}
                    onChange={(e) => setForm({ ...form, email: e.target.value })}
                    placeholder="e.g. anjali@example.com"
                    className="w-full pl-9 pr-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-teal-500 focus:bg-white transition"
                  />
                </div>
              </div>
            </div>

            {/* Notes / Reason */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Reason for Visit or Symptoms <span className="text-slate-400">(Optional)</span>
              </label>
              <textarea
                rows={2}
                value={form.notes}
                onChange={(e) => setForm({ ...form, notes: e.target.value })}
                placeholder="Brief notes for Dr. Kavita Goswami (e.g. routine checkup, persistent cough, blood pressure follow-up)..."
                className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-teal-500 focus:bg-white transition"
              />
            </div>

            {/* Preferred Confirmation Channel */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Preferred Notification Channel
              </label>
              <div className="grid grid-cols-3 gap-2">
                {(["WhatsApp", "Phone", "Email"] as const).map((ch) => (
                  <label
                    key={ch}
                    className={`flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl border text-xs font-medium cursor-pointer transition ${
                      form.preferred_contact === ch
                        ? "bg-teal-50 border-teal-500 text-teal-900 font-bold"
                        : "bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100"
                    }`}
                  >
                    <input
                      type="radio"
                      name="preferred_contact"
                      value={ch}
                      checked={form.preferred_contact === ch}
                      onChange={() => setForm({ ...form, preferred_contact: ch })}
                      className="sr-only"
                    />
                    <span>{ch}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Consent Checkbox */}
            <div className="pt-2">
              <label className="flex items-start gap-2.5 cursor-pointer">
                <input
                  type="checkbox"
                  required
                  checked={form.consent}
                  onChange={(e) => setForm({ ...form, consent: e.target.checked })}
                  className="mt-0.5 rounded text-teal-600 focus:ring-teal-500"
                />
                <span className="text-xs text-slate-500 leading-relaxed">
                  I understand that this consultation is held in person at Apex Health Clinic, Plot No. 3, Vaishali, Ghaziabad. I consent to my booking details being saved to verify my appointment slot.
                </span>
              </label>
            </div>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={submitting}
            className="w-full py-3.5 px-6 rounded-xl bg-blue-900 hover:bg-blue-950 text-white font-semibold text-sm transition shadow-sm flex items-center justify-center gap-2 disabled:opacity-50"
          >
            {submitting ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin text-teal-300" />
                <span>Reserving & Confirming Slot...</span>
              </>
            ) : (
              <span>Confirm & Book Appointment</span>
            )}
          </button>
        </form>
      )}
    </div>
  );
}

export default function BookPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-[50vh] flex items-center justify-center">
          <Loader2 className="w-8 h-8 animate-spin text-teal-600" />
        </div>
      }
    >
      <BookingContent />
    </Suspense>
  );
}
