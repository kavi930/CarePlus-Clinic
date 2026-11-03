"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import {
  Calendar,
  MessageSquare,
  Clock,
  CheckCircle2,
  XCircle,
  AlertCircle,
  TrendingUp,
  Zap,
  ArrowRight,
  RefreshCw,
  Search,
  Filter,
  UserCheck,
  Download,
  CalendarCheck,
  CalendarX,
  Clock3,
} from "lucide-react";
import { Appointment, Enquiry, AnalyticsSummary } from "@/types";

export default function DashboardOverviewPage() {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [enquiries, setEnquiries] = useState<Enquiry[]>([]);
  const [analytics, setAnalytics] = useState<AnalyticsSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  // Today in Asia/Kolkata
  const [todayStr, setTodayStr] = useState("");

  const loadData = async () => {
    setLoading(true);
    try {
      const [aptRes, enqRes, anaRes] = await Promise.all([
        fetch("/api/appointments").then((r) => r.json()),
        fetch("/api/enquiries").then((r) => r.json()),
        fetch("/api/analytics").then((r) => r.json()),
      ]);

      if (aptRes.success) setAppointments(aptRes.appointments || []);
      if (enqRes.success) setEnquiries(enqRes.enquiries || []);
      if (anaRes.success) setAnalytics(anaRes.analytics || null);
    } catch (e) {
      console.error("Dashboard overview load error:", e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    setTodayStr(new Intl.DateTimeFormat("en-CA", { timeZone: "Asia/Kolkata" }).format(new Date()));
    loadData();
  }, []);

  // Filtered appointments
  const filteredAppointments = appointments.filter((a) => {
    const matchesStatus = statusFilter === "all" || a.status.toLowerCase() === statusFilter.toLowerCase();
    const term = searchTerm.toLowerCase().trim();
    const matchesSearch =
      term === "" ||
      a.patient_name.toLowerCase().includes(term) ||
      a.phone.includes(term) ||
      (a.reference_no && a.reference_no.toLowerCase().includes(term)) ||
      a.appointment_id.toLowerCase().includes(term);
    return matchesStatus && matchesSearch;
  });

  const todayAppointments = appointments.filter((a) => a.date === todayStr);
  const upcomingAppointments = appointments.filter((a) => a.date >= todayStr && a.status !== "Cancelled");
  const pendingCount = appointments.filter((a) => a.status === "Pending").length;
  const confirmedCount = appointments.filter((a) => a.status === "Confirmed").length;
  const completedCount = appointments.filter((a) => a.status === "Completed").length;
  const cancelledCount = appointments.filter((a) => a.status === "Cancelled").length;

  const newEnquiries = enquiries.filter((e) => e.status === "New");

  return (
    <div className="space-y-6">
      {/* Top Banner / Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
            Apex Health Clinic Dashboard
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Today: {todayStr} • Consulting Physician: Dr. Kavita Goswami (MBBS, MD)
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={loadData}
            disabled={loading}
            className="inline-flex items-center gap-1.5 px-3 py-2 bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 text-xs font-semibold rounded-xl transition shadow-2xs"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin text-teal-600" : ""}`} />
            Refresh Data
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

      {/* KPI Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Today's Bookings */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs space-y-2">
          <div className="flex items-center justify-between text-slate-500 text-xs font-medium">
            <span>Today's Consultations</span>
            <CalendarCheck className="w-4 h-4 text-teal-600" />
          </div>
          <div className="text-3xl font-extrabold text-slate-900">{todayAppointments.length}</div>
          <div className="text-[11px] text-slate-400">Scheduled for today ({todayStr})</div>
        </div>

        {/* Pending Approval */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs space-y-2">
          <div className="flex items-center justify-between text-amber-700 text-xs font-medium">
            <span>Pending Requests</span>
            <Clock3 className="w-4 h-4 text-amber-600" />
          </div>
          <div className="text-3xl font-extrabold text-amber-900">{pendingCount}</div>
          <div className="text-[11px] text-slate-400">Awaiting staff confirmation</div>
        </div>

        {/* Confirmed / Upcoming */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs space-y-2">
          <div className="flex items-center justify-between text-emerald-700 text-xs font-medium">
            <span>Confirmed Bookings</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="text-3xl font-extrabold text-emerald-950">{confirmedCount}</div>
          <div className="text-[11px] text-slate-400">Upcoming in clinic: {upcomingAppointments.length}</div>
        </div>

        {/* New Enquiries */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs space-y-2">
          <div className="flex items-center justify-between text-blue-700 text-xs font-medium">
            <span>New Enquiries</span>
            <MessageSquare className="w-4 h-4 text-blue-600" />
          </div>
          <div className="text-3xl font-extrabold text-blue-950">{newEnquiries.length}</div>
          <div className="text-[11px] text-slate-400">Pending front-desk follow-up</div>
        </div>
      </div>

      {/* Main Grid: Appointments & Enquiries Queue */}
      <div className="grid lg:grid-cols-12 gap-6">
        {/* Appointments Table Section */}
        <div className="lg:col-span-8 bg-white rounded-2xl border border-slate-200 shadow-2xs p-6 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h2 className="text-base font-bold text-slate-900">Appointments Schedule</h2>
              <p className="text-xs text-slate-500">Live appointments persisted in clinic database.</p>
            </div>

            {/* Filters */}
            <div className="flex items-center gap-2">
              <div className="relative">
                <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Search patient, phone, ref..."
                  className="pl-8 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-hidden focus:ring-1 focus:ring-teal-500"
                />
              </div>

              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="px-2.5 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg text-slate-700"
              >
                <option value="all">All Statuses</option>
                <option value="confirmed">Confirmed</option>
                <option value="pending">Pending</option>
                <option value="completed">Completed</option>
                <option value="cancelled">Cancelled</option>
              </select>
            </div>
          </div>

          {/* Table */}
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-500 border-b border-slate-200">
                <tr>
                  <th className="py-2.5 px-3 font-semibold">Ref / Date</th>
                  <th className="py-2.5 px-3 font-semibold">Patient</th>
                  <th className="py-2.5 px-3 font-semibold">Consultation</th>
                  <th className="py-2.5 px-3 font-semibold">Status</th>
                  <th className="py-2.5 px-3 font-semibold text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredAppointments.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="text-center py-8 text-slate-400 text-xs">
                      No appointments matching current filters.
                    </td>
                  </tr>
                ) : (
                  filteredAppointments.slice(0, 8).map((apt) => (
                    <tr key={apt.appointment_id} className="hover:bg-slate-50/60 transition">
                      <td className="py-3 px-3">
                        <div className="font-mono font-bold text-slate-900">
                          {apt.reference_no || apt.appointment_id}
                        </div>
                        <div className="text-[11px] text-slate-500">
                          {apt.date} • {apt.time}
                        </div>
                      </td>
                      <td className="py-3 px-3">
                        <div className="font-semibold text-slate-900">{apt.patient_name}</div>
                        <div className="text-[11px] text-slate-500">{apt.phone}</div>
                      </td>
                      <td className="py-3 px-3">
                        <div className="text-slate-800 font-medium">{apt.service_name}</div>
                        <div className="text-[11px] text-teal-700">{apt.doctor_name}</div>
                      </td>
                      <td className="py-3 px-3">
                        <span
                          className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${
                            apt.status === "Confirmed"
                              ? "bg-emerald-50 text-emerald-800 border-emerald-200"
                              : apt.status === "Cancelled"
                              ? "bg-red-50 text-red-800 border-red-200"
                              : apt.status === "Pending"
                              ? "bg-amber-50 text-amber-800 border-amber-200"
                              : "bg-blue-50 text-blue-800 border-blue-200"
                          }`}
                        >
                          {apt.status}
                        </span>
                      </td>
                      <td className="py-3 px-3 text-right">
                        <Link
                          href={`/dashboard/appointments?search=${apt.reference_no || apt.appointment_id}`}
                          className="text-xs font-semibold text-blue-900 hover:text-blue-950 underline"
                        >
                          Manage
                        </Link>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          <div className="pt-2 text-right">
            <Link
              href="/dashboard/appointments"
              className="text-xs font-semibold text-teal-700 hover:text-teal-900 inline-flex items-center gap-1"
            >
              View Full Appointments Registry ({appointments.length}) <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>

        {/* Enquiries Follow-up Queue */}
        <div className="lg:col-span-4 bg-white rounded-2xl border border-slate-200 shadow-2xs p-6 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-base font-bold text-slate-900">Enquiries Queue</h2>
              <p className="text-xs text-slate-500">Website & patient messages.</p>
            </div>
            <Link
              href="/dashboard/enquiries"
              className="text-xs font-semibold text-teal-700 hover:underline"
            >
              All ({enquiries.length})
            </Link>
          </div>

          <div className="space-y-3">
            {enquiries.length === 0 ? (
              <div className="text-center py-6 text-slate-400 text-xs">No pending enquiries.</div>
            ) : (
              enquiries.slice(0, 5).map((enq) => (
                <div
                  key={enq.enquiry_id}
                  className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/80 space-y-2 hover:border-teal-200 transition"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-xs text-slate-900">{enq.name}</span>
                    <span
                      className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${
                        enq.status === "New" ? "bg-blue-100 text-blue-800" : "bg-slate-200 text-slate-700"
                      }`}
                    >
                      {enq.status}
                    </span>
                  </div>
                  <p className="text-xs text-slate-600 line-clamp-2">{enq.question}</p>
                  <div className="flex items-center justify-between text-[11px] text-slate-400 pt-1 border-t border-slate-200/60">
                    <span>{enq.phone}</span>
                    <Link
                      href={`/dashboard/enquiries`}
                      className="text-teal-700 font-semibold hover:underline"
                    >
                      Follow-up →
                    </Link>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
