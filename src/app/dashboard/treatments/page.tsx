"use client";

import React, { useEffect, useState } from "react";
import { Layers, Stethoscope, ShieldCheck, Activity, Plus, Loader2 } from "lucide-react";
import { Treatment, Department } from "@/types";

export default function DashboardTreatmentsPage() {
  const [services, setServices] = useState<Treatment[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      fetch("/api/services").then((r) => r.json()),
      fetch("/api/departments").then((r) => r.json()),
    ])
      .then(([sRes, dRes]) => {
        if (sRes.success) setServices(sRes.services || []);
        if (dRes.success) setDepartments(dRes.departments || []);
      })
      .finally(() => setLoading(false));
  }, []);

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
          Treatments & Clinical Departments
        </h1>
        <p className="text-xs text-slate-500">
          Configured medical services and departments offered at Apex Health Clinic.
        </p>
      </div>

      {/* Departments Section */}
      <div className="bg-white rounded-2xl p-6 sm:p-8 border border-slate-200 shadow-2xs space-y-4">
        <h2 className="text-base font-bold text-slate-900">Clinical Departments ({departments.length})</h2>
        <div className="grid sm:grid-cols-3 gap-4">
          {departments.map((d) => (
            <div key={d.id} className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
              <div className="font-bold text-slate-900 text-sm">{d.name}</div>
              <p className="text-xs text-slate-500 leading-relaxed">{d.description}</p>
              <div className="text-[11px] text-teal-700 font-semibold pt-1">
                Consultant: Dr. Kavita Goswami (MBBS, MD)
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Services List Section */}
      <div className="bg-white rounded-2xl p-6 sm:p-8 border border-slate-200 shadow-2xs space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-bold text-slate-900">Consultation Treatments ({services.length})</h2>
        </div>

        <div className="space-y-3">
          {services.map((srv) => (
            <div
              key={srv.id}
              className="p-4 rounded-xl bg-slate-50 border border-slate-200/90 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
            >
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="font-bold text-slate-900 text-sm">{srv.name}</span>
                  <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-teal-50 text-teal-800 border border-teal-200">
                    {srv.departmentName}
                  </span>
                </div>
                <p className="text-xs text-slate-600 max-w-2xl">{srv.description}</p>
                <div className="text-[11px] text-slate-400">
                  Standard Duration: {srv.durationMinutes || 30} mins • Fee: {srv.fee || "Standard clinic registration"}
                </div>
              </div>
              <div className="shrink-0 text-xs text-emerald-700 font-semibold flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-500"></span> Active on Portal
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
