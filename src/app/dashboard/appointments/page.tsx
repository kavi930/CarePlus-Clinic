"use client";

import React, { useEffect, useState } from "react";
import {
  RefreshCw,
  Search,
  Eye,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Calendar,
  Download,
  Loader2,
  Clock,
  RotateCw,
  Send,
  MessageCircle,
} from "lucide-react";
import { Appointment } from "@/types";

const STATUS_FILTERS = ["All", "Confirmed", "Pending", "Completed", "Cancelled", "Rescheduled", "No-show"];

export default function AppointmentsAdminPage() {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("All");
  const [search, setSearch] = useState("");
  const [selectedApt, setSelectedApt] = useState<Appointment | null>(null);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  // Cancellation modal state
  const [showCancelModal, setShowCancelModal] = useState<Appointment | null>(null);
  const [cancelReason, setCancelReason] = useState("");

  // Reschedule modal state
  const [showRescheduleModal, setShowRescheduleModal] = useState<Appointment | null>(null);
  const [rescheduleDate, setRescheduleDate] = useState("");
  const [rescheduleSlot, setRescheduleSlot] = useState("");
  const [availableSlots, setAvailableSlots] = useState<string[]>([]);
  const [slotsLoading, setSlotsLoading] = useState(false);

  const loadAppointments = () => {
    setLoading(true);
    fetch("/api/appointments")
      .then((r) => r.json())
      .then((d) => {
        if (d.success) setAppointments(d.appointments || []);
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadAppointments();
  }, []);

  // Slot checking for reschedule
  useEffect(() => {
    if (!showRescheduleModal || !rescheduleDate) return;

    const fetchSlots = async () => {
      setSlotsLoading(true);
      setRescheduleSlot("");
      try {
        const res = await fetch(
          `/api/availability?doctorId=${showRescheduleModal.doctor_id}&date=${rescheduleDate}`
        );
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
  }, [showRescheduleModal, rescheduleDate]);

  // Action dispatcher
  const handleUpdateStatus = async (id: string, status: string, reason?: string) => {
    setActionLoading(id + status);
    try {
      const res = await fetch(`/api/appointments/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status, cancellation_reason: reason }),
      });
      const data = await res.json();
      if (data.success && data.appointment) {
        setAppointments((prev) =>
          prev.map((a) => (a.appointment_id === id ? data.appointment : a))
        );
        if (selectedApt?.appointment_id === id) {
          setSelectedApt(data.appointment);
        }
      }
    } catch (e) {
      console.error("Status update error:", e);
    } finally {
      setActionLoading(null);
    }
  };

  // Google Calendar retry
  const handleCalendarRetry = async (id: string) => {
    setActionLoading(id + "cal_retry");
    try {
      const res = await fetch("/api/calendar/retry", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ appointmentId: id }),
      });
      const data = await res.json();
      if (data.success && data.appointment) {
        setAppointments((prev) =>
          prev.map((a) => (a.appointment_id === id ? data.appointment : a))
        );
        if (selectedApt?.appointment_id === id) {
          setSelectedApt(data.appointment);
        }
      }
    } catch (e) {
      console.error("Calendar retry error:", e);
    } finally {
      setActionLoading(null);
    }
  };

  // Reschedule submission
  const handleConfirmReschedule = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!showRescheduleModal || !rescheduleDate || !rescheduleSlot) return;

    setActionLoading("reschedule_modal");
    try {
      const res = await fetch(`/api/appointments/${showRescheduleModal.appointment_id}/reschedule`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          newDate: rescheduleDate,
          newTime: rescheduleSlot,
          reason: "Staff rescheduled via CRM",
        }),
      });
      const data = await res.json();
      if (data.success && data.appointment) {
        setAppointments((prev) =>
          prev.map((a) => (a.appointment_id === showRescheduleModal.appointment_id ? data.appointment : a))
        );
        setShowRescheduleModal(null);
      }
    } catch (e) {
      console.error("Reschedule failed:", e);
    } finally {
      setActionLoading(null);
    }
  };

  // Cancellation submission
  const handleConfirmCancel = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!showCancelModal) return;

    setActionLoading("cancel_modal");
    try {
      const res = await fetch(`/api/appointments/${showCancelModal.appointment_id}/cancel`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ reason: cancelReason.trim() || "Staff cancellation via CRM" }),
      });
      const data = await res.json();
      if (data.success && data.appointment) {
        setAppointments((prev) =>
          prev.map((a) => (a.appointment_id === showCancelModal.appointment_id ? data.appointment : a))
        );
        setShowCancelModal(null);
        setCancelReason("");
      }
    } catch (e) {
      console.error("Cancellation failed:", e);
    } finally {
      setActionLoading(null);
    }
  };

  const filtered = appointments.filter((a) => {
    const matchesFilter = filter === "All" || a.status.toLowerCase() === filter.toLowerCase();
    const term = search.toLowerCase().trim();
    const matchesSearch =
      term === "" ||
      a.patient_name.toLowerCase().includes(term) ||
      a.phone.includes(term) ||
      (a.reference_no && a.reference_no.toLowerCase().includes(term)) ||
      a.appointment_id.toLowerCase().includes(term) ||
      a.doctor_name.toLowerCase().includes(term);
    return matchesFilter && matchesSearch;
  });

  return (
    <div className="space-y-6">
      {/* Title & Actions Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
            Appointments Management
          </h1>
          <p className="text-xs text-slate-500">
            Real patient bookings, confirmation status, and schedule modifications.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={loadAppointments}
            disabled={loading}
            className="inline-flex items-center gap-1.5 px-3 py-2 bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 text-xs font-semibold rounded-xl transition shadow-2xs"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin text-teal-600" : ""}`} />
            Refresh
          </button>

          <a
            href="/api/admin/export"
            download
            className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-blue-900 hover:bg-blue-950 text-white text-xs font-semibold rounded-xl transition shadow-2xs"
          >
            <Download className="w-3.5 h-3.5 text-teal-300" />
            Export CSV
          </a>
        </div>
      </div>

      {/* Filter Tabs & Search Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs flex flex-col md:flex-row gap-3 items-center justify-between">
        {/* Search */}
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search patient, phone, ref..."
            className="w-full pl-9 pr-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-hidden focus:ring-1 focus:ring-teal-500"
          />
        </div>

        {/* Filter Chips */}
        <div className="flex flex-wrap gap-1.5 w-full md:w-auto">
          {STATUS_FILTERS.map((st) => (
            <button
              key={st}
              onClick={() => setFilter(st)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition ${
                filter === st
                  ? "bg-blue-900 text-white shadow-2xs"
                  : "bg-slate-50 text-slate-600 hover:bg-slate-100 border border-slate-200"
              }`}
            >
              {st}
            </button>
          ))}
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-2xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-500 border-b border-slate-200">
              <tr>
                <th className="py-3 px-4 font-semibold">Ref & Created</th>
                <th className="py-3 px-4 font-semibold">Scheduled Date & Time</th>
                <th className="py-3 px-4 font-semibold">Patient & Phone</th>
                <th className="py-3 px-4 font-semibold">Doctor & Service</th>
                <th className="py-3 px-4 font-semibold">Status</th>
                <th className="py-3 px-4 font-semibold">Sync & Channel</th>
                <th className="py-3 px-4 font-semibold text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={7} className="text-center py-12 text-slate-400 text-xs">
                    No appointments found matching current filters.
                  </td>
                </tr>
              ) : (
                filtered.map((apt) => (
                  <tr key={apt.appointment_id} className="hover:bg-slate-50/70 transition">
                    <td className="py-3.5 px-4">
                      <div className="font-mono font-bold text-slate-900">
                        {apt.reference_no || apt.appointment_id}
                      </div>
                      <div className="text-[10px] text-slate-400">
                        {new Date(apt.created_at).toLocaleDateString()}
                      </div>
                    </td>

                    <td className="py-3.5 px-4">
                      <div className="font-bold text-slate-900">{apt.date}</div>
                      <div className="text-teal-700 font-semibold text-[11px]">{apt.time}</div>
                    </td>

                    <td className="py-3.5 px-4">
                      <div className="font-semibold text-slate-900">{apt.patient_name}</div>
                      <div className="text-[11px] text-slate-500">{apt.phone}</div>
                    </td>

                    <td className="py-3.5 px-4">
                      <div className="text-slate-800 font-medium">{apt.service_name}</div>
                      <div className="text-[11px] text-slate-500">{apt.doctor_name}</div>
                    </td>

                    <td className="py-3.5 px-4">
                      <span
                        className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${
                          apt.status === "Confirmed"
                            ? "bg-emerald-50 text-emerald-800 border-emerald-200"
                            : apt.status === "Cancelled"
                            ? "bg-red-50 text-red-800 border-red-200"
                            : apt.status === "Pending"
                            ? "bg-amber-50 text-amber-800 border-amber-200"
                            : apt.status === "Completed"
                            ? "bg-blue-50 text-blue-800 border-blue-200"
                            : "bg-slate-100 text-slate-700 border-slate-200"
                        }`}
                      >
                        {apt.status}
                      </span>
                    </td>

                    <td className="py-3.5 px-4 space-y-1">
                      <div className="flex items-center gap-1.5 text-[10px]">
                        <span className="text-slate-400">Cal:</span>
                        <span
                          className={`font-semibold ${
                            apt.calendar_sync_status === "Synced"
                              ? "text-emerald-700"
                              : apt.calendar_sync_status === "Failed"
                              ? "text-red-600 font-bold"
                              : "text-slate-500"
                          }`}
                        >
                          {apt.calendar_sync_status}
                        </span>
                        {apt.calendar_sync_status === "Failed" && (
                          <button
                            onClick={() => handleCalendarRetry(apt.appointment_id)}
                            className="text-red-700 underline text-[10px] ml-1"
                            title="Retry calendar synchronization"
                          >
                            Retry
                          </button>
                        )}
                      </div>
                      <div className="flex items-center gap-1.5 text-[10px] text-slate-500">
                        <span>WA:</span>
                        <span className="font-medium text-emerald-700">{apt.whatsapp_delivery_status}</span>
                      </div>
                    </td>

                    <td className="py-3.5 px-4 text-right space-x-2">
                      <button
                        onClick={() => setSelectedApt(apt)}
                        className="px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium text-xs transition"
                      >
                        Detail
                      </button>

                      {apt.status === "Pending" && (
                        <button
                          onClick={() => handleUpdateStatus(apt.appointment_id, "Confirmed")}
                          disabled={actionLoading === apt.appointment_id + "Confirmed"}
                          className="px-2.5 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-medium text-xs transition"
                        >
                          Confirm
                        </button>
                      )}

                      {apt.status === "Confirmed" && (
                        <button
                          onClick={() => handleUpdateStatus(apt.appointment_id, "Completed")}
                          disabled={actionLoading === apt.appointment_id + "Completed"}
                          className="px-2.5 py-1 rounded-lg bg-blue-900 hover:bg-blue-950 text-white font-medium text-xs transition"
                        >
                          Complete
                        </button>
                      )}

                      {apt.status !== "Cancelled" && (
                        <button
                          onClick={() => setShowRescheduleModal(apt)}
                          className="px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium text-xs transition"
                        >
                          Reschedule
                        </button>
                      )}

                      {apt.status !== "Cancelled" && (
                        <button
                          onClick={() => setShowCancelModal(apt)}
                          className="px-2.5 py-1 rounded-lg bg-red-50 hover:bg-red-100 text-red-700 font-medium text-xs transition"
                        >
                          Cancel
                        </button>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* ─── APPOINTMENT DETAIL MODAL ─── */}
      {selectedApt && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-lg w-full max-h-[85vh] overflow-y-auto space-y-5">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200">
              <div>
                <span className="text-xs text-teal-700 font-bold uppercase tracking-wider">
                  Appointment Audit & Record
                </span>
                <h3 className="text-xl font-bold text-slate-900">
                  {selectedApt.reference_no}
                </h3>
              </div>
              <button
                onClick={() => setSelectedApt(null)}
                className="p-1 rounded-lg hover:bg-slate-100 text-slate-500"
              >
                ✕
              </button>
            </div>

            <div className="grid grid-cols-2 gap-3 text-xs">
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                <span className="text-slate-400 block">Patient Name</span>
                <span className="font-bold text-slate-900 text-sm">{selectedApt.patient_name}</span>
              </div>
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                <span className="text-slate-400 block">Phone</span>
                <span className="font-bold text-slate-900 text-sm">{selectedApt.phone}</span>
              </div>
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                <span className="text-slate-400 block">Doctor</span>
                <span className="font-bold text-slate-900 text-sm">{selectedApt.doctor_name}</span>
              </div>
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                <span className="text-slate-400 block">Scheduled Slot</span>
                <span className="font-bold text-blue-900 text-sm">{selectedApt.date} at {selectedApt.time}</span>
              </div>
            </div>

            {selectedApt.notes && (
              <div className="p-3 bg-slate-50 rounded-xl text-xs text-slate-600 border border-slate-100">
                <span className="font-semibold text-slate-800">Patient Notes:</span> {selectedApt.notes}
              </div>
            )}

            {/* Status History Trail */}
            <div>
              <div className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                Status History Trail:
              </div>
              <div className="space-y-2">
                {(selectedApt.status_history || []).map((h, i) => (
                  <div
                    key={i}
                    className="p-2.5 rounded-lg bg-slate-50 border border-slate-100 text-xs flex items-start justify-between gap-2"
                  >
                    <div>
                      <span className="font-bold text-slate-800">{h.status}</span>
                      <span className="text-slate-500 text-[11px] block">{h.reason}</span>
                    </div>
                    <div className="text-right text-[10px] text-slate-400 shrink-0">
                      <div>{new Date(h.changed_at).toLocaleString()}</div>
                      <div>by {h.changed_by}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Integrations detail */}
            <div className="bg-slate-50 rounded-xl p-3 border border-slate-100 space-y-1.5 text-xs text-slate-600">
              <div className="flex justify-between">
                <span>Google Calendar ID:</span>
                <span className="font-mono text-[11px]">{selectedApt.calendar_event_id || "N/A"}</span>
              </div>
              <div className="flex justify-between">
                <span>Calendar Sync Status:</span>
                <span className="font-semibold">{selectedApt.calendar_sync_status}</span>
              </div>
              <div className="flex justify-between">
                <span>WhatsApp Delivery:</span>
                <span className="font-semibold">{selectedApt.whatsapp_delivery_status}</span>
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-slate-200">
              <button
                onClick={() => setSelectedApt(null)}
                className="px-4 py-2 rounded-xl bg-slate-100 text-slate-700 text-xs font-semibold hover:bg-slate-200"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ─── RESCHEDULE MODAL ─── */}
      {showRescheduleModal && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
          <form
            onSubmit={handleConfirmReschedule}
            className="bg-white rounded-3xl p-6 sm:p-8 max-w-md w-full space-y-4"
          >
            <div className="flex items-center justify-between pb-2 border-b border-slate-200">
              <h3 className="font-bold text-slate-900 text-base">
                Reschedule {showRescheduleModal.reference_no}
              </h3>
              <button
                type="button"
                onClick={() => setShowRescheduleModal(null)}
                className="text-slate-400 hover:text-slate-600"
              >
                ✕
              </button>
            </div>

            <p className="text-xs text-slate-500">
              Patient: <strong>{showRescheduleModal.patient_name}</strong> • Doctor: {showRescheduleModal.doctor_name}
            </p>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Select New Date</label>
              <input
                type="date"
                required
                value={rescheduleDate}
                onChange={(e) => setRescheduleDate(e.target.value)}
                className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl"
              />
            </div>

            {rescheduleDate && (
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Available Slots</label>
                {slotsLoading ? (
                  <div className="text-xs text-slate-400 flex items-center gap-1.5">
                    <Loader2 className="w-3.5 h-3.5 animate-spin" /> Checking slots...
                  </div>
                ) : availableSlots.length === 0 ? (
                  <div className="text-xs text-amber-700">No slots available on {rescheduleDate}.</div>
                ) : (
                  <div className="grid grid-cols-3 gap-2">
                    {availableSlots.map((s) => (
                      <button
                        key={s}
                        type="button"
                        onClick={() => setRescheduleSlot(s)}
                        className={`py-1.5 px-2 text-xs font-semibold rounded-lg border ${
                          rescheduleSlot === s
                            ? "bg-blue-900 text-white border-blue-900"
                            : "bg-slate-50 text-slate-700 border-slate-200 hover:bg-teal-50"
                        }`}
                      >
                        {s}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )}

            <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setShowRescheduleModal(null)}
                className="px-3 py-1.5 text-xs text-slate-600 hover:bg-slate-100 rounded-lg"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={!rescheduleDate || !rescheduleSlot || actionLoading === "reschedule_modal"}
                className="px-4 py-2 text-xs font-semibold bg-blue-900 hover:bg-blue-950 text-white rounded-xl disabled:opacity-40"
              >
                {actionLoading === "reschedule_modal" ? "Rescheduling..." : "Confirm Reschedule"}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* ─── CANCEL MODAL ─── */}
      {showCancelModal && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
          <form
            onSubmit={handleConfirmCancel}
            className="bg-white rounded-3xl p-6 max-w-sm w-full space-y-3.5"
          >
            <div className="font-bold text-red-900 text-sm">Cancel Appointment</div>
            <p className="text-xs text-slate-600">
              Cancel booking <strong>{showCancelModal.reference_no}</strong> for {showCancelModal.patient_name}?
            </p>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Reason</label>
              <input
                type="text"
                required
                placeholder="Reason for cancellation..."
                value={cancelReason}
                onChange={(e) => setCancelReason(e.target.value)}
                className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl"
              />
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setShowCancelModal(null)}
                className="px-3 py-1.5 text-xs text-slate-600"
              >
                Back
              </button>
              <button
                type="submit"
                disabled={actionLoading === "cancel_modal"}
                className="px-4 py-1.5 text-xs font-semibold bg-red-600 hover:bg-red-700 text-white rounded-xl"
              >
                {actionLoading === "cancel_modal" ? "Cancelling..." : "Confirm Cancellation"}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
