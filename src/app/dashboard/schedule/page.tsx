"use client";

import React, { useEffect, useState } from "react";
import { Clock, Calendar, ShieldCheck, AlertCircle, CheckCircle2, Loader2, Plus, Trash2 } from "lucide-react";
import { Doctor, BlockedPeriod, ClinicHoliday } from "@/types";

export default function ScheduleManagementPage() {
  const [doctor, setDoctor] = useState<Doctor | null>(null);
  const [blockedPeriods, setBlockedPeriods] = useState<BlockedPeriod[]>([]);
  const [holidays, setHolidays] = useState<ClinicHoliday[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // Form states
  const [startTime, setStartTime] = useState("09:30");
  const [endTime, setEndTime] = useState("18:30");
  const [breakStart, setBreakStart] = useState("13:30");
  const [breakEnd, setBreakEnd] = useState("14:30");
  const [slotDuration, setSlotDuration] = useState(30);

  // New Block Period state
  const [newBlockDate, setNewBlockDate] = useState("");
  const [newBlockReason, setNewBlockReason] = useState("");

  const loadData = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/schedule?doctorId=doc-kavita-goswami");
      const data = await res.json();
      if (data.success) {
        setDoctor(data.doctor);
        setBlockedPeriods(data.blockedPeriods || []);
        setHolidays(data.holidays || []);

        if (data.doctor) {
          setStartTime(data.doctor.workingHours.start);
          setEndTime(data.doctor.workingHours.end);
          if (data.doctor.breakHours) {
            setBreakStart(data.doctor.breakHours.start);
            setBreakEnd(data.doctor.breakHours.end);
          }
          setSlotDuration(data.doctor.slotDurationMinutes || 30);
        }
      }
    } catch (e) {
      console.error("Failed to load schedule data:", e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleSaveHours = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setSuccessMsg(null);

    try {
      const res = await fetch("/api/admin/schedule", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "update_doctor_hours",
          doctorId: "doc-kavita-goswami",
          doctorUpdates: {
            workingHours: { start: startTime, end: endTime },
            breakHours: { start: breakStart, end: breakEnd },
            slotDurationMinutes: Number(slotDuration),
          },
        }),
      });

      const data = await res.json();
      if (data.success) {
        setSuccessMsg("Doctor consulting hours and lunch break updated successfully.");
      }
    } catch {
      alert("Failed to update hours.");
    } finally {
      setSaving(false);
    }
  };

  const handleAddBlock = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newBlockDate || !newBlockReason) return;

    try {
      const res = await fetch("/api/admin/schedule", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "block_period",
          doctorId: "doc-kavita-goswami",
          date: newBlockDate,
          reason: newBlockReason,
          allDay: true,
        }),
      });

      const data = await res.json();
      if (data.success && data.blocked) {
        setBlockedPeriods((prev) => [...prev, data.blocked]);
        setNewBlockDate("");
        setNewBlockReason("");
      }
    } catch {
      alert("Failed to add blocked period.");
    }
  };

  const handleRemoveBlock = async (id: string) => {
    try {
      const res = await fetch("/api/admin/schedule", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "remove_block", blockId: id }),
      });
      if (res.ok) {
        setBlockedPeriods((prev) => prev.filter((b) => b.id !== id));
      }
    } catch {
      alert("Failed to remove blocked period.");
    }
  };

  if (loading) {
    return (
      <div className="min-h-[50vh] flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-teal-600" />
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto space-y-8">
      <div>
        <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
          Doctor Schedule & Unavailability
        </h1>
        <p className="text-xs text-slate-500">
          Configure working hours, lunch break, slot duration, and block holiday or leave periods.
        </p>
      </div>

      {successMsg && (
        <div className="bg-teal-50 border border-teal-200 text-teal-800 rounded-xl p-3 text-xs flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-teal-600 shrink-0" />
          <span>{successMsg}</span>
        </div>
      )}

      {/* Form: Doctor Working Hours */}
      <form onSubmit={handleSaveHours} className="bg-white rounded-2xl p-6 sm:p-8 border border-slate-200 shadow-2xs space-y-6">
        <div className="flex items-center gap-3 pb-4 border-b border-slate-100">
          <Clock className="w-5 h-5 text-teal-600" />
          <div>
            <h2 className="text-base font-bold text-slate-900">Dr. Kavita Goswami — Regular Schedule</h2>
            <p className="text-xs text-slate-500">Default consulting days: Monday to Saturday (Sundays closed).</p>
          </div>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Clinic Start Time</label>
            <input
              type="time"
              value={startTime}
              onChange={(e) => setStartTime(e.target.value)}
              className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Clinic End Time</label>
            <input
              type="time"
              value={endTime}
              onChange={(e) => setEndTime(e.target.value)}
              className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Slot Duration (Minutes)</label>
            <select
              value={slotDuration}
              onChange={(e) => setSlotDuration(Number(e.target.value))}
              className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl"
            >
              <option value={15}>15 Minutes</option>
              <option value={20}>20 Minutes</option>
              <option value={30}>30 Minutes (Standard)</option>
              <option value={45}>45 Minutes</option>
              <option value={60}>60 Minutes</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Lunch Break Start</label>
            <input
              type="time"
              value={breakStart}
              onChange={(e) => setBreakStart(e.target.value)}
              className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Lunch Break End</label>
            <input
              type="time"
              value={breakEnd}
              onChange={(e) => setBreakEnd(e.target.value)}
              className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl"
            />
          </div>
        </div>

        <div className="flex justify-end pt-2">
          <button
            type="submit"
            disabled={saving}
            className="px-5 py-2.5 bg-blue-900 hover:bg-blue-950 text-white rounded-xl text-xs font-semibold transition disabled:opacity-50"
          >
            {saving ? "Saving Changes..." : "Save Working Hours"}
          </button>
        </div>
      </form>

      {/* Blocked Dates / Leaves Section */}
      <div className="bg-white rounded-2xl p-6 sm:p-8 border border-slate-200 shadow-2xs space-y-6">
        <div>
          <h2 className="text-base font-bold text-slate-900">Blocked Slots & Doctor Leave</h2>
          <p className="text-xs text-slate-500">
            Dates where Dr. Kavita Goswami is unavailable. These dates are automatically excluded from the online booking system.
          </p>
        </div>

        {/* Add Block Form */}
        <form onSubmit={handleAddBlock} className="flex flex-col sm:flex-row gap-3 items-end bg-slate-50 p-4 rounded-xl border border-slate-200">
          <div className="w-full sm:w-48">
            <label className="block text-[11px] font-semibold text-slate-600 mb-1">Block Date</label>
            <input
              type="date"
              required
              value={newBlockDate}
              onChange={(e) => setNewBlockDate(e.target.value)}
              className="w-full px-3 py-1.5 text-xs bg-white border border-slate-200 rounded-lg"
            />
          </div>
          <div className="w-full sm:flex-1">
            <label className="block text-[11px] font-semibold text-slate-600 mb-1">Reason / Note</label>
            <input
              type="text"
              required
              placeholder="e.g. Doctor attending medical conference / personal leave"
              value={newBlockReason}
              onChange={(e) => setNewBlockReason(e.target.value)}
              className="w-full px-3 py-1.5 text-xs bg-white border border-slate-200 rounded-lg"
            />
          </div>
          <button
            type="submit"
            className="px-4 py-2 bg-slate-800 hover:bg-slate-900 text-white text-xs font-semibold rounded-lg shrink-0 flex items-center gap-1.5"
          >
            <Plus className="w-3.5 h-3.5" /> Block Date
          </button>
        </form>

        {/* Blocked List */}
        <div className="space-y-2">
          {blockedPeriods.length === 0 ? (
            <div className="text-center py-6 text-xs text-slate-400">No dates are currently blocked.</div>
          ) : (
            blockedPeriods.map((bp) => (
              <div
                key={bp.id}
                className="flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-200 text-xs"
              >
                <div>
                  <span className="font-bold text-slate-900">{bp.date}</span>
                  <span className="text-slate-500 ml-3">({bp.reason})</span>
                </div>
                <button
                  onClick={() => handleRemoveBlock(bp.id)}
                  className="text-red-600 hover:text-red-800 p-1 rounded-lg"
                  title="Remove block"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
