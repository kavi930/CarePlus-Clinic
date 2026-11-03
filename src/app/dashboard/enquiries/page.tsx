"use client";

import React, { useEffect, useState } from "react";
import { RefreshCw, Loader2, MessageSquare, Calendar, UserCheck, X, ChevronRight } from "lucide-react";
import Link from "next/link";

interface Enquiry {
  enquiry_id: string;
  name: string;
  phone: string;
  email: string;
  question: string;
  service?: string;
  source: string;
  status: string;
  classification: string;
  created_at: string;
  assigned_to?: string;
  follow_up_status: string;
}

const STATUS_COLORS: Record<string, string> = {
  New: "bg-sky-100 text-sky-700 border-sky-200",
  Contacted: "bg-teal-100 text-teal-700 border-teal-200",
  Qualified: "bg-green-100 text-green-700 border-green-200",
  "Appointment Booked": "bg-emerald-100 text-emerald-700 border-emerald-200",
  Closed: "bg-slate-100 text-slate-500 border-slate-200",
};

const CLASSIFICATION_COLORS: Record<string, string> = {
  "Appointment Ready": "text-emerald-600 bg-emerald-50",
  "Needs Information": "text-amber-600 bg-amber-50",
  "Needs Human Assistance": "text-blue-600 bg-blue-50",
  "Potentially Urgent / Medical Safety Escalation": "text-red-600 bg-red-50",
};

const STATUS_FILTERS = ["All", "New", "Contacted", "Qualified", "Appointment Booked", "Closed"];

export default function EnquiriesPage() {
  const [enquiries, setEnquiries] = useState<Enquiry[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("All");
  const [selected, setSelected] = useState<Enquiry | null>(null);

  const loadEnquiries = () => {
    setLoading(true);
    fetch("/api/enquiries")
      .then((r) => r.json())
      .then((d) => {
        if (d.success) setEnquiries(d.enquiries);
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadEnquiries();
  }, []);

  const updateStatus = async (id: string, status: string) => {
    await fetch(`/api/enquiries/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status }),
    });
    loadEnquiries();
    if (selected?.enquiry_id === id) setSelected((e) => e ? { ...e, status } : null);
  };

  const filtered = filter === "All"
    ? enquiries
    : enquiries.filter((e) => e.status === filter);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900">Enquiries</h1>
          <p className="text-slate-400 text-sm mt-0.5">{enquiries.length} total enquiries · {enquiries.filter(e => e.status === "New").length} new</p>
        </div>
        <button
          onClick={loadEnquiries}
          className="flex items-center gap-2 px-3.5 py-2 bg-white border border-slate-200 text-slate-600 rounded-xl text-sm hover:bg-slate-50 transition"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
        </button>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-2">
        {STATUS_FILTERS.map((s) => (
          <button
            key={s}
            onClick={() => setFilter(s)}
            className={`px-3.5 py-1.5 rounded-full text-xs font-semibold border transition ${
              filter === s
                ? "bg-sky-600 text-white border-sky-600"
                : "bg-white text-slate-600 border-slate-200 hover:border-sky-300 hover:text-sky-700"
            }`}
          >
            {s} {s !== "All" ? `(${enquiries.filter((e) => e.status === s).length})` : `(${enquiries.length})`}
          </button>
        ))}
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
        {loading ? (
          <div className="p-12 text-center">
            <Loader2 className="w-7 h-7 text-sky-500 animate-spin mx-auto mb-3" />
            <p className="text-slate-400 text-sm">Loading enquiries...</p>
          </div>
        ) : filtered.length === 0 ? (
          <div className="p-12 text-center text-slate-400">
            <MessageSquare className="w-10 h-10 mx-auto mb-3 opacity-30" />
            <p className="font-medium">No enquiries found</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-100 bg-slate-50/50">
                  {["Name", "Service", "Question", "Classification", "Status", "Created", "Actions"].map((h) => (
                    <th key={h} className="text-left px-4 py-3.5 text-xs font-semibold text-slate-500 uppercase tracking-wide whitespace-nowrap">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {filtered.map((enq) => (
                  <tr key={enq.enquiry_id} className="hover:bg-slate-50/50 transition">
                    <td className="px-4 py-3.5">
                      <div className="font-medium text-slate-900 truncate max-w-32">{enq.name}</div>
                      <div className="text-xs text-slate-400">{enq.email || enq.phone}</div>
                    </td>
                    <td className="px-4 py-3.5 text-slate-500 whitespace-nowrap text-xs">{enq.service || "General"}</td>
                    <td className="px-4 py-3.5 text-slate-500 max-w-40">
                      <p className="truncate text-xs">{enq.question}</p>
                    </td>
                    <td className="px-4 py-3.5 whitespace-nowrap">
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${CLASSIFICATION_COLORS[enq.classification] || "bg-slate-100 text-slate-500"}`}>
                        {enq.classification.split(" / ")[0]}
                      </span>
                    </td>
                    <td className="px-4 py-3.5 whitespace-nowrap">
                      <span className={`inline-flex px-2.5 py-1 text-[10px] font-bold rounded-full border ${STATUS_COLORS[enq.status] || "bg-slate-100 text-slate-500"}`}>
                        {enq.status}
                      </span>
                    </td>
                    <td className="px-4 py-3.5 text-xs text-slate-400 whitespace-nowrap">
                      {new Date(enq.created_at).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                    </td>
                    <td className="px-4 py-3.5 whitespace-nowrap">
                      <div className="flex items-center gap-1.5">
                        <button
                          onClick={() => setSelected(enq)}
                          className="px-2.5 py-1 text-[10px] font-semibold bg-sky-50 hover:bg-sky-100 text-sky-700 rounded-lg transition"
                        >
                          Open
                        </button>
                        {enq.status === "New" && (
                          <button
                            onClick={() => updateStatus(enq.enquiry_id, "Contacted")}
                            className="px-2.5 py-1 text-[10px] font-semibold bg-teal-50 hover:bg-teal-100 text-teal-700 rounded-lg transition"
                          >
                            Contact
                          </button>
                        )}
                        {enq.status !== "Closed" && (
                          <button
                            onClick={() => updateStatus(enq.enquiry_id, "Closed")}
                            className="px-2.5 py-1 text-[10px] font-semibold bg-slate-50 hover:bg-slate-100 text-slate-500 rounded-lg transition"
                          >
                            Close
                          </button>
                        )}
                        <Link
                          href={`/book?service=${encodeURIComponent(enq.service || "")}`}
                          className="px-2.5 py-1 text-[10px] font-semibold bg-emerald-50 hover:bg-emerald-100 text-emerald-700 rounded-lg transition"
                        >
                          Book
                        </Link>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Detail Panel */}
      {selected && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 flex items-center justify-center p-4" onClick={() => setSelected(null)}>
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 max-w-lg w-full p-7 max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-5">
              <h2 className="font-bold text-slate-900">Enquiry Details</h2>
              <button onClick={() => setSelected(null)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 mb-5">
              {[
                { label: "ID", val: selected.enquiry_id },
                { label: "Name", val: selected.name },
                { label: "Phone", val: selected.phone || "—" },
                { label: "Email", val: selected.email || "—" },
                { label: "Service", val: selected.service || "General" },
                { label: "Classification", val: selected.classification },
                { label: "Status", val: selected.status },
                { label: "Source", val: selected.source },
                { label: "Assigned To", val: selected.assigned_to || "Triage" },
                { label: "Follow-up", val: selected.follow_up_status },
                { label: "Created", val: new Date(selected.created_at).toLocaleString() },
              ].map((row) => (
                <div key={row.label} className="flex justify-between gap-4 py-2 border-b border-slate-50 text-sm">
                  <span className="text-xs font-semibold text-slate-500 uppercase tracking-wide shrink-0">{row.label}</span>
                  <span className="text-slate-900 font-medium text-right">{row.val}</span>
                </div>
              ))}
              <div>
                <div className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1.5">Question</div>
                <p className="text-sm text-slate-700 bg-slate-50 rounded-xl p-3">{selected.question}</p>
              </div>
            </div>

            <div className="flex gap-2 flex-wrap">
              {selected.status !== "Contacted" && (
                <button
                  onClick={() => updateStatus(selected.enquiry_id, "Contacted")}
                  className="flex items-center gap-1.5 px-3 py-2 bg-teal-600 text-white rounded-lg text-xs font-semibold hover:bg-teal-700 transition"
                >
                  <UserCheck className="w-3.5 h-3.5" />Mark Contacted
                </button>
              )}
              {selected.status !== "Qualified" && (
                <button
                  onClick={() => updateStatus(selected.enquiry_id, "Qualified")}
                  className="flex items-center gap-1.5 px-3 py-2 bg-green-600 text-white rounded-lg text-xs font-semibold hover:bg-green-700 transition"
                >
                  <ChevronRight className="w-3.5 h-3.5" />Qualify
                </button>
              )}
              <Link
                href={`/book?service=${encodeURIComponent(selected.service || "")}`}
                className="flex items-center gap-1.5 px-3 py-2 bg-sky-600 text-white rounded-lg text-xs font-semibold hover:bg-sky-700 transition"
              >
                <Calendar className="w-3.5 h-3.5" />Book Appointment
              </Link>
              <button
                onClick={() => updateStatus(selected.enquiry_id, "Closed")}
                className="flex items-center gap-1.5 px-3 py-2 bg-slate-100 text-slate-600 rounded-lg text-xs font-semibold hover:bg-slate-200 transition"
              >
                <X className="w-3.5 h-3.5" />Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
