import type { Metadata } from "next";
import Link from "next/link";
import { Clock, Calendar, CheckCircle2, MapPin, ArrowRight, Stethoscope } from "lucide-react";
import { getDoctors, getServices } from "@/lib/db";

export const metadata: Metadata = {
  title: "Consulting Physicians",
  description:
    "Meet the consulting doctors at Apex Health Clinic, Vaishali. Dr. Kavita Goswami (MBBS, MD).",
};

export default async function DoctorsPage() {
  const doctors = await getDoctors({ activeOnly: true });
  const allServices = await getServices();

  return (
    <div className="bg-white">
      {/* Header */}
      <section className="bg-slate-900 text-white py-16 px-4">
        <div className="max-w-5xl mx-auto text-center space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-teal-900/60 text-teal-300 text-xs font-semibold border border-teal-700/60">
            Medical Faculty
          </div>
          <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight">
            Consulting Physicians
          </h1>
          <p className="text-slate-300 text-base max-w-xl mx-auto">
            Experienced medical practitioners providing clinical consultations at Apex Health Clinic, Vaishali.
          </p>
        </div>
      </section>

      {/* Doctor Directory List */}
      <section className="py-16 px-4">
        <div className="max-w-5xl mx-auto space-y-8">
          {doctors.map((doc) => {
            const docServices = allServices.filter((s) => doc.availableServices.includes(s.id));

            return (
              <div
                key={doc.id}
                className="bg-slate-50 rounded-2xl border border-slate-200/90 p-6 sm:p-8 hover:shadow-md transition-shadow"
              >
                <div className="grid md:grid-cols-12 gap-6 items-start">
                  <div className="md:col-span-8 space-y-4">
                    <div className="flex flex-wrap items-center gap-3">
                      <h2 className="text-2xl font-bold text-slate-900">{doc.name}</h2>
                      <span className="px-2.5 py-1 rounded-md bg-blue-100 text-blue-900 font-bold text-xs">
                        {doc.credentials}
                      </span>
                      <span className="px-2.5 py-1 rounded-md bg-teal-100 text-teal-900 font-semibold text-xs">
                        {doc.department}
                      </span>
                    </div>

                    <div className="text-sm font-semibold text-slate-700">
                      {doc.title} • {doc.specialty}
                    </div>

                    <p className="text-slate-600 text-sm leading-relaxed">
                      {doc.bio}
                    </p>

                    <div className="grid sm:grid-cols-2 gap-3 text-xs text-slate-600 pt-2 border-t border-slate-200">
                      <div className="flex items-center gap-2">
                        <Clock className="w-4 h-4 text-teal-600 shrink-0" />
                        <span><strong>Consulting Days:</strong> {doc.workingDaysText}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Clock className="w-4 h-4 text-teal-600 shrink-0" />
                        <span><strong>Hours:</strong> {doc.workingHours.start} – {doc.workingHours.end}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <CheckCircle2 className="w-4 h-4 text-teal-600 shrink-0" />
                        <span><strong>Slot Duration:</strong> {doc.slotDurationMinutes} Minutes</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <MapPin className="w-4 h-4 text-teal-600 shrink-0" />
                        <span><strong>Location:</strong> Plot No. 3, Vaishali</span>
                      </div>
                    </div>

                    {/* Services */}
                    {docServices.length > 0 && (
                      <div className="pt-2">
                        <div className="text-xs font-semibold text-slate-700 mb-2">Available Consultations:</div>
                        <div className="flex flex-wrap gap-1.5">
                          {docServices.map((s) => (
                            <span
                              key={s.id}
                              className="px-2.5 py-1 rounded-lg bg-white border border-slate-200 text-slate-700 text-xs font-medium"
                            >
                              {s.name}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Booking Card */}
                  <div className="md:col-span-4 bg-white rounded-xl p-6 border border-slate-200 text-center space-y-4">
                    <div className="w-20 h-20 rounded-full bg-blue-900 text-teal-300 mx-auto flex items-center justify-center font-bold text-2xl shadow-xs">
                      {doc.name.split(" ").map((n) => n[0]).join("")}
                    </div>
                    <div>
                      <div className="font-bold text-slate-900 text-sm">{doc.name}</div>
                      <div className="text-xs text-slate-500">{doc.credentials}</div>
                    </div>
                    <Link
                      href={`/book?doctor=${doc.id}`}
                      className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-blue-900 hover:bg-blue-950 text-white font-semibold text-xs transition"
                    >
                      <Calendar className="w-4 h-4 text-teal-300" />
                      Select & Book
                    </Link>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </section>
    </div>
  );
}
