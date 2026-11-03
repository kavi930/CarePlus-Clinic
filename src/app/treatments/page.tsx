import type { Metadata } from "next";
import { getServices, getDepartments } from "@/lib/db";
import TreatmentsClient from "./TreatmentsClient";

export const metadata: Metadata = {
  title: "Treatments & Consultations",
  description:
    "Explore medical treatments and outpatient consultations at Apex Health Clinic, Vaishali. Dr. Kavita Goswami (MBBS, MD).",
};

export default async function TreatmentsPage() {
  const treatments = await getServices();
  const departments = await getDepartments();

  return (
    <div className="bg-white">
      {/* Header */}
      <section className="bg-slate-900 text-white py-16 px-4">
        <div className="max-w-5xl mx-auto text-center space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-teal-900/60 text-teal-300 text-xs font-semibold border border-teal-700/60">
            Clinical Services
          </div>
          <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight">
            Treatments & Consultations
          </h1>
          <p className="text-slate-300 text-base max-w-xl mx-auto">
            Primary medical consultations, preventive examinations, and chronic condition management under Dr. Kavita Goswami (MBBS, MD).
          </p>
        </div>
      </section>

      {/* Main Content */}
      <section className="py-16 px-4">
        <div className="max-w-6xl mx-auto">
          <TreatmentsClient initialTreatments={treatments} departments={departments} />
        </div>
      </section>
    </div>
  );
}
