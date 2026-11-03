"use client";

import React, { useState } from "react";
import Link from "next/link";
import { ShieldCheck, Calendar, LayoutDashboard, X, Info } from "lucide-react";

export default function DemoBanner() {
  const [dismissed, setDismissed] = useState(false);

  if (dismissed) return null;

  return (
    <div className="bg-gradient-to-r from-blue-950 via-slate-900 to-teal-950 text-white text-xs py-2 px-4 border-b border-teal-800/40 relative z-40">
      <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <span className="bg-teal-500/20 text-teal-300 font-semibold px-2 py-0.5 rounded-full border border-teal-400/30 text-[11px] tracking-wide inline-flex items-center gap-1">
            <ShieldCheck className="w-3 h-3 text-teal-400" />
            DEMO MODE ACTIVE
          </span>
          <span className="text-slate-300 hidden sm:inline">
            Apex Health Clinic (Vaishali, Ghaziabad) — WhatsApp & Google Calendar integrations operate in simulation mode until production credentials are provided.
          </span>
        </div>

        <div className="flex items-center gap-2 sm:gap-3">
          <Link
            href="/book"
            className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-blue-800 hover:bg-blue-700 text-white font-medium transition shadow-xs"
          >
            <Calendar className="w-3.5 h-3.5 text-teal-300" />
            <span>Test Real Booking</span>
          </Link>

          <Link
            href="/dashboard"
            className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-teal-800/80 hover:bg-teal-700 text-white font-medium transition"
          >
            <LayoutDashboard className="w-3.5 h-3.5" />
            <span>Admin CRM</span>
          </Link>

          <button
            onClick={() => setDismissed(true)}
            className="text-slate-400 hover:text-white p-1 ml-1"
            title="Dismiss Demo Banner"
            aria-label="Dismiss banner"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
}
