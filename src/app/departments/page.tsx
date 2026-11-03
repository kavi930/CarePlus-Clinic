import type { Metadata } from "next";
import Link from "next/link";
import { Stethoscope, ShieldCheck, Activity, ArrowRight, CheckCircle2 } from "lucide-react";
import { getDepartments, getServices } from "@/lib/db";

export const metadata: Metadata = {
  title: "Clinical Departments",
  description:
    "Explore clinical departments at Apex Health Clinic, Vaishali. General Medicine, Preventive Care, and Chronic Disease Care.",
};

export default async function DepartmentsPage() {
  const departments = await getDepartments();
  const services = await getServices();

  return (
    <div className="bg-white">
      {/* Header */}
      <section className="bg-slate-900 text-white py-16 px-4">
        <div className="max-w-5xl mx-auto text-center space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-teal-900/60 text-teal-300 text-xs font-semibold border border-teal-700/60">
            Specialties & Care
          </div>
          <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight">
            Clinical Departments
          </h1>
          <p className="text-slate-300 text-base max-w-xl mx-auto">
            Configured medical care divisions at Apex Health Clinic under Dr. Kavita Goswami (MBBS, MD).
          </p>
        </div>
      </section>

      {/* Departments Grid */}
      <section className="py-16 px-4">
        <div className="max-w-6xl mx-auto space-y-12">
          {departments.map((dept) => {
            const deptServices = services.filter((s) => s.departmentId === dept.id);

            return (
              <div
                key={dept.id}
                className="bg-slate-50 rounded-2xl border border-slate-200/90 p-8 space-y-6"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-200">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-xl bg-teal-100 text-teal-800 flex items-center justify-center shrink-0">
                      {dept.icon === "ShieldCheck" ? (
                        <ShieldCheck className="w-6 h-6" />
                      ) : dept.icon === "Activity" ? (
                        <Activity className="w-6 h-6" />
                      ) : (
                        <Stethoscope className="w-6 h-6" />
                      )}
                    </div>
                    <div>
                      <h2 className="text-2xl font-bold text-slate-900">{dept.name}</h2>
                      <div className="text-xs text-teal-700 font-semibold">Lead Physician: Dr. Kavita Goswami (MBBS, MD)</div>
                    </div>
                  </div>
                  <Link
                    href={`/book?department=${dept.id}`}
                    className="inline-flex items-center gap-1.5 px-4 py-2 bg-blue-900 hover:bg-blue-950 text-white rounded-xl text-xs font-semibold transition"
                  >
                    Book in {dept.name}
                  </Link>
                </div>

                <p className="text-slate-600 text-sm leading-relaxed max-w-3xl">
                  {dept.description}
                </p>

                {/* Services under this department */}
                <div>
                  <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-3">
                    Consultations & Services Offered:
                  </h3>
                  <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {deptServices.map((srv) => (
                      <div
                        key={srv.id}
                        className="bg-white rounded-xl p-4 border border-slate-200/80 hover:border-teal-300 transition flex flex-col justify-between"
                      >
                        <div>
                          <div className="font-bold text-slate-900 text-sm mb-1">{srv.name}</div>
                          <p className="text-xs text-slate-500 leading-relaxed mb-3">{srv.description}</p>
                        </div>
                        <div className="border-t border-slate-100 pt-2 flex items-center justify-between text-xs">
                          <span className="text-slate-400">{srv.durationMinutes || 30} mins</span>
                          <Link
                            href={`/book?service=${srv.id}`}
                            className="font-semibold text-teal-700 hover:text-teal-900"
                          >
                            Book →
                          </Link>
                        </div>
                      </div>
                    ))}
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
