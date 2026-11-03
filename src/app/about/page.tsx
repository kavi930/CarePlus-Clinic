import type { Metadata } from "next";
import Link from "next/link";
import { ShieldCheck, Stethoscope, HeartHandshake, Clock, MapPin, Phone, ArrowRight, UserCheck } from "lucide-react";

export const metadata: Metadata = {
  title: "About Us",
  description:
    "Learn about Apex Health Clinic in Vaishali, Ghaziabad. Outpatient primary care under Dr. Kavita Goswami (MBBS, MD).",
};

export default function AboutPage() {
  return (
    <div className="bg-white">
      {/* Header */}
      <section className="bg-slate-900 text-white py-16 px-4">
        <div className="max-w-5xl mx-auto text-center space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-teal-900/60 text-teal-300 text-xs font-semibold border border-teal-700/60">
            About Our Clinic
          </div>
          <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight">
            Apex Health Clinic
          </h1>
          <p className="text-slate-300 text-base sm:text-lg max-w-2xl mx-auto leading-relaxed">
            Committed to providing accessible, dependable primary medical care in Vaishali, Ghaziabad.
          </p>
        </div>
      </section>

      {/* Main Content */}
      <section className="py-16 px-4">
        <div className="max-w-5xl mx-auto space-y-16">
          {/* Mission & Background */}
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-4">
              <h2 className="text-2xl sm:text-3xl font-bold text-slate-900">
                Our Clinical Mission
              </h2>
              <p className="text-slate-600 leading-relaxed text-sm sm:text-base">
                Apex Health Clinic was established with a singular objective: to provide patients and families in Vaishali and surrounding areas with thorough, respectful, and clinically sound outpatient medical care.
              </p>
              <p className="text-slate-600 leading-relaxed text-sm sm:text-base">
                We believe that good primary care begins with listening. By structuring appointments with sufficient time for clinical history, vital signs assessment, and diagnostic evaluation, we ensure that every patient receives dedicated attention.
              </p>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200">
                <Stethoscope className="w-6 h-6 text-teal-600 mb-2" />
                <div className="font-bold text-slate-900 text-sm">Primary Care</div>
                <div className="text-xs text-slate-500 mt-1">Acute and routine outpatient consultations.</div>
              </div>

              <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200">
                <ShieldCheck className="w-6 h-6 text-teal-600 mb-2" />
                <div className="font-bold text-slate-900 text-sm">Preventive Health</div>
                <div className="text-xs text-slate-500 mt-1">Screenings and metabolic risk management.</div>
              </div>

              <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200">
                <Clock className="w-6 h-6 text-teal-600 mb-2" />
                <div className="font-bold text-slate-900 text-sm">Organized Slots</div>
                <div className="text-xs text-slate-500 mt-1">30-minute dedicated appointment blocks.</div>
              </div>

              <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200">
                <HeartHandshake className="w-6 h-6 text-teal-600 mb-2" />
                <div className="font-bold text-slate-900 text-sm">Chronic Care</div>
                <div className="text-xs text-slate-500 mt-1">Management of hypertension and diabetes.</div>
              </div>
            </div>
          </div>

          {/* Doctor Profile Spotlight */}
          <div className="bg-slate-50 rounded-2xl p-8 border border-slate-200 space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-teal-100 text-teal-800 flex items-center justify-center font-bold text-lg">
                KG
              </div>
              <div>
                <h3 className="text-xl font-bold text-slate-900">Dr. Kavita Goswami</h3>
                <div className="text-xs font-semibold text-teal-700">MBBS, MD • Senior Consultant Physician</div>
              </div>
            </div>

            <p className="text-slate-600 text-sm leading-relaxed">
              Dr. Kavita Goswami brings established clinical expertise in internal medicine, comprehensive primary care, diagnostic symptom evaluation, and lifestyle disease management. She leads consultations at Apex Health Clinic, emphasizing patient education and evidence-based treatment plans.
            </p>

            <div className="pt-2 flex flex-wrap items-center gap-4 text-xs text-slate-500 border-t border-slate-200">
              <span className="flex items-center gap-1.5 font-medium text-slate-700">
                <MapPin className="w-4 h-4 text-teal-600" />
                Plot No. 3, Vaishali, Ghaziabad
              </span>
              <span>•</span>
              <span className="flex items-center gap-1.5 font-medium text-slate-700">
                <Phone className="w-4 h-4 text-teal-600" />
                Helpline: 8861608612
              </span>
              <span>•</span>
              <span className="flex items-center gap-1.5 font-medium text-slate-700">
                <Clock className="w-4 h-4 text-teal-600" />
                Consulting: Mon – Sat (9:30 AM – 6:30 PM)
              </span>
            </div>
          </div>

          {/* Call to Action */}
          <div className="text-center pt-4">
            <Link
              href="/book"
              className="inline-flex items-center gap-2 px-6 py-3.5 rounded-xl bg-blue-900 hover:bg-blue-950 text-white font-semibold text-sm transition"
            >
              Book an Appointment with Dr. Goswami <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
