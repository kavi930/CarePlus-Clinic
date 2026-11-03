"use client";

import React, { useState, useMemo } from "react";
import Link from "next/link";
import { Search, Stethoscope, ShieldCheck, Activity, Clock, Calendar, ArrowRight, Filter } from "lucide-react";
import { Treatment, Department } from "@/types";

interface Props {
  initialTreatments: Treatment[];
  departments: Department[];
}

export default function TreatmentsClient({ initialTreatments, departments }: Props) {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedDept, setSelectedDept] = useState<string>("all");

  const filteredTreatments = useMemo(() => {
    return initialTreatments.filter((t) => {
      const matchesDept = selectedDept === "all" || t.departmentId === selectedDept;
      const matchesSearch =
        searchTerm === "" ||
        t.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        t.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        t.departmentName.toLowerCase().includes(searchTerm.toLowerCase());
      return matchesDept && matchesSearch;
    });
  }, [initialTreatments, selectedDept, searchTerm]);

  return (
    <div className="space-y-8">
      {/* Search & Filter Bar */}
      <div className="bg-slate-50 rounded-2xl p-4 sm:p-6 border border-slate-200/90 flex flex-col md:flex-row gap-4 items-center justify-between">
        {/* Search Input */}
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search consultation or treatment..."
            className="w-full pl-10 pr-4 py-2 text-sm bg-white border border-slate-200 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-teal-500 transition"
          />
        </div>

        {/* Department Filter Pills */}
        <div className="flex flex-wrap gap-2 w-full md:w-auto">
          <button
            onClick={() => setSelectedDept("all")}
            className={`px-3.5 py-1.5 text-xs font-semibold rounded-xl transition ${
              selectedDept === "all"
                ? "bg-blue-900 text-white shadow-xs"
                : "bg-white text-slate-700 hover:bg-slate-100 border border-slate-200"
            }`}
          >
            All Departments ({initialTreatments.length})
          </button>
          {departments.map((d) => {
            const count = initialTreatments.filter((t) => t.departmentId === d.id).length;
            return (
              <button
                key={d.id}
                onClick={() => setSelectedDept(d.id)}
                className={`px-3.5 py-1.5 text-xs font-semibold rounded-xl transition ${
                  selectedDept === d.id
                    ? "bg-blue-900 text-white shadow-xs"
                    : "bg-white text-slate-700 hover:bg-slate-100 border border-slate-200"
                }`}
              >
                {d.name} ({count})
              </button>
            );
          })}
        </div>
      </div>

      {/* Treatments Cards Grid */}
      {filteredTreatments.length === 0 ? (
        <div className="text-center py-16 bg-slate-50 rounded-2xl border border-slate-200 p-8">
          <p className="text-slate-600 text-sm">No treatments matched your search criteria.</p>
          <button
            onClick={() => {
              setSearchTerm("");
              setSelectedDept("all");
            }}
            className="mt-3 text-xs text-teal-700 font-semibold hover:underline"
          >
            Reset Filters
          </button>
        </div>
      ) : (
        <div className="grid md:grid-cols-2 gap-6">
          {filteredTreatments.map((t) => (
            <div
              key={t.id}
              className="bg-white rounded-2xl p-6 border border-slate-200/90 shadow-2xs hover:shadow-md transition-shadow flex flex-col justify-between"
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="px-2.5 py-1 rounded-md bg-teal-50 text-teal-800 font-semibold text-xs border border-teal-200/60">
                    {t.departmentName}
                  </span>
                  <div className="flex items-center gap-1.5 text-xs text-slate-500">
                    <Clock className="w-3.5 h-3.5 text-teal-600" />
                    <span>{t.durationMinutes || 30} mins</span>
                  </div>
                </div>

                <h3 className="text-lg font-bold text-slate-900">{t.name}</h3>

                <p className="text-slate-600 text-sm leading-relaxed">{t.description}</p>

                <div className="text-xs text-slate-500 bg-slate-50 rounded-lg p-2.5 border border-slate-100">
                  <span className="font-semibold text-slate-700">Doctor:</span> Dr. Kavita Goswami (MBBS, MD)
                  {t.fee && <span className="ml-3 font-semibold text-slate-700">• Fee: {t.fee}</span>}
                </div>
              </div>

              <div className="pt-5 border-t border-slate-100 mt-5 flex items-center justify-between">
                <span className="text-xs text-slate-400">Scheduled 30-min slot</span>
                <Link
                  href={`/book?service=${t.id}`}
                  className="inline-flex items-center gap-1.5 px-4 py-2 bg-blue-900 hover:bg-blue-950 text-white rounded-xl text-xs font-semibold transition"
                >
                  <Calendar className="w-3.5 h-3.5 text-teal-300" />
                  Book Consultation
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Safety Notice */}
      <div className="bg-slate-50 rounded-xl p-4 border border-slate-200 text-xs text-slate-500 text-center leading-relaxed">
        Medical Notice: Treatment modalities and diagnostic plans are tailored individually following clinical examination by Dr. Kavita Goswami. Apex Health Clinic does not claim guaranteed outcomes or provide remote prescriptions without evaluation.
      </div>
    </div>
  );
}
