"use client";

import React, { useState, useEffect, Suspense } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import {
  Calendar,
  Clock,
  User,
  MapPin,
  CheckCircle2,
  AlertCircle,
  Loader2,
  XCircle,
  RefreshCw,
  ExternalLink,
  Phone,
  MessageCircle,
} from "lucide-react";
import { Appointment } from "@/types";

function AppointmentManageContent() {
  const params = useParams();
  const id = params?.id as string;

  const [appointment, setAppointment] = useState<Appointment | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Reschedule state
  const [showReschedule, setShowReschedule] = useState(false);
  const [newDate, setNewDate] = useState("");
  const [newSlot, setNewSlot] = useState("");
  const [availableSlots, setAvailableSlots] = useState<string[]>([]);
  const [slotsLoading, setSlotsLoading] = useState(false);
  const [rescheduleReason, setRescheduleReason] = useState("");
  const [rescheduling, setRescheduling] = useState(false);
  const [rescheduleMsg, setRescheduleMsg] = useState<string | null>(null);

  // Cancel state
  const [showCancel, setShowCancel] = useState(false);
  const [cancelReason, setCancelReason] = useState("");
  const [cancelling, setCancelling] = useState(false);

  // Today in Asia/Kolkata
  const [todayStr, setTodayStr] = useState("");

  const fetchAppointment = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/appointments/${id}`);
      const data = await res.json();
      if (data.success && data.appointment) {
        setAppointment(data.appointment);
      } else {
        setError(data.error || "Appointment not found.");
      }
    } catch {
      setError("Failed to fetch appointment record.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    setTodayStr(new Intl.DateTimeFormat("en-CA", { timeZone: "Asia/Kolkata" }).format(new Date()));
    if (id) {
      fetchAppointment();
    }
  }, [id]);

  // Load slots for reschedule date
  useEffect(() => {
    if (!appointment || !newDate) return;

    const fetchSlots = async () => {
      setSlotsLoading(true);
      setNewSlot("");
      try {
        const res = await fetch(`/api/availability?doctorId=${appointment.doctor_id}&date=${newDate}`);
        const data = await res.json();
        if (data.success) {
          setAvailableSlots(data.slots || []);
        } else {
          setAvailableSlots([]);
        }
      } catch {
        setAvailableSlots([]);
      } finally {
        setSlotsLoading(false);
      }
    };

    fetchSlots();
  }, [appointment, newDate]);

  const handleReschedule = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!appointment || !newDate || !newSlot) return;

    setRescheduling(true);
    setRescheduleMsg(null);

    try {
      const res = await fetch(`/api/appointments/${appointment.appointment_id}/reschedule`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          newDate,
          newTime: newSlot,
          reason: rescheduleReason.trim() || undefined,
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || "Failed to reschedule appointment.");
      }

      setAppointment(data.appointment);
      setShowReschedule(false);
      setRescheduleMsg("Your appointment has been rescheduled successfully.");
    } catch (err: unknown) {
      setRescheduleMsg(err instanceof Error ? err.message : "Reschedule failed.");
    } finally {
      setRescheduling(false);
    }
  };

  const handleCancel = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!appointment) return;

    setCancelling(true);
    try {
      const res = await fetch(`/api/appointments/${appointment.appointment_id}/cancel`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          reason: cancelReason.trim() || "Patient requested cancellation via portal",
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || "Failed to cancel appointment.");
      }

      setAppointment(data.appointment);
      setShowCancel(false);
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : "Cancellation failed.");
    } finally {
      setCancelling(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-[50vh] flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-teal-600" />
      </div>
    );
  }

  if (error || !appointment) {
    return (
      <div className="max-w-xl mx-auto py-16 px-4 text-center space-y-4">
        <div className="w-12 h-12 rounded-full bg-red-100 text-red-600 mx-auto flex items-center justify-center">
          <AlertCircle className="w-6 h-6" />
        </div>
        <h1 className="text-2xl font-bold text-slate-900">Appointment Not Found</h1>
        <p className="text-sm text-slate-600">{error || "Could not locate this reference ID."}</p>
        <Link
          href="/book"
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-blue-900 text-white text-xs font-semibold"
        >
          Book a New Appointment
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto py-12 px-4 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <span className="text-xs font-semibold text-teal-700 uppercase tracking-wider">
            Appointment Status & Management
          </span>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900">
            Reference: {appointment.reference_no}
          </h1>
        </div>
        <span
          className={`px-3 py-1 rounded-full text-xs font-bold border ${
            appointment.status === "Confirmed"
              ? "bg-emerald-50 text-emerald-800 border-emerald-200"
              : appointment.status === "Cancelled"
              ? "bg-red-50 text-red-800 border-red-200"
              : appointment.status === "Rescheduled"
              ? "bg-violet-50 text-violet-800 border-violet-200"
              : "bg-amber-50 text-amber-800 border-amber-200"
          }`}
        >
          {appointment.status}
        </span>
      </div>

      {rescheduleMsg && (
        <div className="bg-teal-50 border border-teal-200 text-teal-800 rounded-xl p-3.5 text-xs">
          {rescheduleMsg}
        </div>
      )}

      {/* Appointment Detail Card */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-xs space-y-6">
        <div className="grid sm:grid-cols-2 gap-4 text-xs">
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-100 space-y-1">
            <span className="text-slate-400 block uppercase tracking-wide">Doctor</span>
            <span className="font-bold text-slate-900 text-sm block">{appointment.doctor_name}</span>
            <span className="text-slate-500">MBBS, MD • Senior Consultant</span>
          </div>

          <div className="p-4 rounded-xl bg-slate-50 border border-slate-100 space-y-1">
            <span className="text-slate-400 block uppercase tracking-wide">Service</span>
            <span className="font-bold text-slate-900 text-sm block">{appointment.service_name}</span>
            <span className="text-slate-500">Duration: {appointment.duration} minutes</span>
          </div>

          <div className="p-4 rounded-xl bg-slate-50 border border-slate-100 space-y-1">
            <span className="text-slate-400 block uppercase tracking-wide">Date & Time</span>
            <span className="font-bold text-blue-900 text-sm block">
              {appointment.date} at {appointment.time}
            </span>
            <span className="text-slate-500">Clinic Time Zone: Asia/Kolkata</span>
          </div>

          <div className="p-4 rounded-xl bg-slate-50 border border-slate-100 space-y-1">
            <span className="text-slate-400 block uppercase tracking-wide">Patient Information</span>
            <span className="font-bold text-slate-900 text-sm block">{appointment.patient_name}</span>
            <span className="text-slate-500">Phone: {appointment.phone}</span>
          </div>
        </div>

        {appointment.notes && (
          <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-100 text-xs text-slate-600">
            <span className="font-semibold text-slate-700">Patient Notes:</span> {appointment.notes}
          </div>
        )}

        {appointment.cancellation_reason && (
          <div className="p-3.5 rounded-xl bg-red-50 border border-red-200 text-xs text-red-700">
            <span className="font-semibold">Cancellation Reason:</span> {appointment.cancellation_reason}
          </div>
        )}

        {/* Action Controls */}
        {appointment.status !== "Cancelled" && (
          <div className="flex flex-wrap items-center gap-3 pt-2 border-t border-slate-100">
            <button
              onClick={() => {
                setShowReschedule(!showReschedule);
                setShowCancel(false);
              }}
              className="px-4 py-2 rounded-xl bg-blue-900 hover:bg-blue-950 text-white font-semibold text-xs transition"
            >
              Reschedule Appointment
            </button>

            <button
              onClick={() => {
                setShowCancel(!showCancel);
                setShowReschedule(false);
              }}
              className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-red-50 hover:text-red-700 text-slate-700 font-semibold text-xs transition"
            >
              Cancel Appointment
            </button>
          </div>
        )}
      </div>

      {/* Reschedule Drawer */}
      {showReschedule && (
        <form onSubmit={handleReschedule} className="bg-slate-50 rounded-2xl p-6 border border-slate-200 space-y-4">
          <div className="font-bold text-slate-900 text-sm">Select New Date & Time Slot</div>

          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">New Date</label>
              <input
                type="date"
                min={todayStr}
                required
                value={newDate}
                onChange={(e) => setNewDate(e.target.value)}
                className="w-full px-3 py-2 text-sm bg-white border border-slate-200 rounded-xl"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Reason for Rescheduling</label>
              <input
                type="text"
                placeholder="e.g. Schedule conflict, travel"
                value={rescheduleReason}
                onChange={(e) => setRescheduleReason(e.target.value)}
                className="w-full px-3 py-2 text-sm bg-white border border-slate-200 rounded-xl"
              />
            </div>
          </div>

          {newDate && (
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Available Slots on {newDate}
              </label>
              {slotsLoading ? (
                <div className="text-xs text-slate-500 flex items-center gap-1.5">
                  <Loader2 className="w-3.5 h-3.5 animate-spin text-teal-600" /> Checking slots...
                </div>
              ) : availableSlots.length === 0 ? (
                <div className="text-xs text-amber-700">No slots available on this date.</div>
              ) : (
                <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-2">
                  {availableSlots.map((slot) => (
                    <button
                      key={slot}
                      type="button"
                      onClick={() => setNewSlot(slot)}
                      className={`py-2 px-2.5 rounded-lg text-xs font-semibold border ${
                        newSlot === slot
                          ? "bg-blue-900 text-white border-blue-900"
                          : "bg-white text-slate-700 border-slate-200 hover:bg-teal-50"
                      }`}
                    >
                      {slot}
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}

          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={() => setShowReschedule(false)}
              className="px-3.5 py-2 text-xs text-slate-600 hover:bg-slate-200 rounded-lg"
            >
              Close
            </button>
            <button
              type="submit"
              disabled={!newDate || !newSlot || rescheduling}
              className="px-4 py-2 text-xs font-semibold bg-blue-900 hover:bg-blue-950 text-white rounded-xl disabled:opacity-50"
            >
              {rescheduling ? "Saving..." : "Confirm Reschedule"}
            </button>
          </div>
        </form>
      )}

      {/* Cancel Confirmation */}
      {showCancel && (
        <form onSubmit={handleCancel} className="bg-red-50/60 rounded-2xl p-6 border border-red-200 space-y-3">
          <div className="font-bold text-red-900 text-sm">Cancel Appointment</div>
          <p className="text-xs text-red-700">
            Are you sure you wish to cancel this appointment? This slot will immediately be made available for other patients.
          </p>
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Reason for Cancellation</label>
            <input
              type="text"
              required
              placeholder="e.g. Symptoms resolved, personal emergency"
              value={cancelReason}
              onChange={(e) => setCancelReason(e.target.value)}
              className="w-full px-3 py-2 text-sm bg-white border border-slate-200 rounded-xl"
            />
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={() => setShowCancel(false)}
              className="px-3 py-1.5 text-xs text-slate-600 rounded-lg"
            >
              Keep Appointment
            </button>
            <button
              type="submit"
              disabled={cancelling}
              className="px-4 py-1.5 text-xs font-semibold bg-red-600 hover:bg-red-700 text-white rounded-xl"
            >
              {cancelling ? "Cancelling..." : "Confirm Cancellation"}
            </button>
          </div>
        </form>
      )}
    </div>
  );
}

export default function AppointmentManagePage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-slate-50 flex items-center justify-center">
          <Loader2 className="w-8 h-8 animate-spin text-teal-600" />
        </div>
      }
    >
      <AppointmentManageContent />
    </Suspense>
  );
}
