"use client";

import React from "react";
import { X, CheckCircle2, MessageSquare, ArrowRight, Sparkles, ShieldCheck } from "lucide-react";
import Link from "next/link";

interface DemoGuideModalProps {
  onClose: () => void;
}

export default function DemoGuideModal({ onClose }: DemoGuideModalProps) {
  const steps = [
    { num: 1, title: "Clinic Identity", script: "Apex Health Clinic in Vaishali, Ghaziabad, under Dr. Kavita Goswami (MBBS, MD)." },
    { num: 2, title: "Digital Assistant", script: "Patients can ask questions about timings, doctor credentials, and consultation guidelines." },
    { num: 3, title: "Real-Time Booking", script: "Patients choose Dr. Kavita Goswami, select an available date, and book an unreserved 30-minute slot." },
    { num: 4, title: "Double-Booking Prevention", script: "Server-side mutex locking guarantees no two visitors can book the same slot." },
    { num: 5, title: "Persistent Confirmation", script: "Instant reference ID (APX-YYYYMMDD-XXXX) is generated and stored in the database." },
    { num: 6, title: "Automations & Sync", script: "WhatsApp, Google Calendar, and webhook notifications are triggered behind safe configuration switches." },
    { num: 7, title: "CRM Dashboard", script: "Clinic staff can review appointments, update statuses, reschedule, and manage doctor unavailability." },
  ];

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/70 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl shadow-2xl max-w-2xl w-full max-h-[85vh] flex flex-col border border-slate-200 overflow-hidden">
        {/* Header */}
        <div className="p-6 bg-slate-900 text-white flex items-center justify-between">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-teal-400" />
              <span className="text-xs text-teal-300 font-bold uppercase tracking-wider">
                System Guide
              </span>
            </div>
            <h2 className="text-xl font-bold text-white">Apex Health Clinic Management Platform</h2>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-full hover:bg-white/10 text-slate-300 hover:text-white transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto space-y-4">
          <div className="bg-teal-50 border border-teal-200 rounded-2xl p-4 text-teal-900 text-xs leading-relaxed">
            This production-ready system powers the website, appointment booking engine, and staff CRM for <strong>Apex Health Clinic (Plot No. 3, Vaishali, Ghaziabad)</strong> under <strong>Dr. Kavita Goswami (MBBS, MD)</strong>.
          </div>

          <div className="space-y-2.5">
            {steps.map((st) => (
              <div key={st.num} className="p-3 rounded-xl bg-slate-50 border border-slate-100 flex items-start gap-3">
                <span className="w-6 h-6 rounded-full bg-blue-900 text-white text-xs font-bold flex items-center justify-center shrink-0">
                  {st.num}
                </span>
                <div>
                  <div className="font-bold text-slate-900 text-xs">{st.title}</div>
                  <div className="text-[11px] text-slate-600 mt-0.5">{st.script}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 bg-slate-50 border-t border-slate-200 flex justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-blue-900 hover:bg-blue-950 text-white text-xs font-semibold transition"
          >
            Close Guide
          </button>
        </div>
      </div>
    </div>
  );
}
