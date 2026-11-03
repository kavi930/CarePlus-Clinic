import React from "react";
import Link from "next/link";
import {
  ShieldCheck,
  Calendar,
  Clock,
  Phone,
  MapPin,
  CheckCircle2,
  ArrowRight,
  MessageCircle,
  Stethoscope,
  Activity,
  HeartPulse,
  HelpCircle,
  UserCheck,
  Building2,
  ExternalLink,
} from "lucide-react";
import { getDoctor, getDepartments, getServices, getSettings } from "@/lib/db";

export default async function HomePage() {
  const settings = await getSettings();
  const doctor = await getDoctor("doc-kavita-goswami");
  const departments = await getDepartments();
  const services = await getServices();

  const faqs = [
    {
      q: "Where is Apex Health Clinic located?",
      a: "Apex Health Clinic is located at Plot No. 3, Vaishali, Ghaziabad. We are conveniently situated for residents of Vaishali, Kaushambi, Indirapuram, and surrounding areas.",
    },
    {
      q: "Who is the consulting physician at the clinic?",
      a: "Consultations are conducted by Dr. Kavita Goswami (MBBS, MD), a senior consultant physician specializing in internal medicine, primary outpatient care, and chronic condition management.",
    },
    {
      q: "What are the clinic's operating and consultation hours?",
      a: "The clinic is open Monday through Saturday from 9:30 AM to 6:30 PM. A lunch break is observed between 1:30 PM and 2:30 PM. The clinic is closed on Sundays.",
    },
    {
      q: "Do I need an appointment before visiting?",
      a: "Prior appointments are recommended to ensure prompt consultation without long waiting times. Walk-in patients are accommodated subject to slot availability between scheduled appointments.",
    },
    {
      q: "How can I reschedule or cancel an existing booking?",
      a: "You can reschedule or cancel directly through the appointment link provided in your confirmation message or by contacting our front desk at 8861608612.",
    },
    {
      q: "What should I bring to my consultation?",
      a: "Please bring a valid photo ID, any recent laboratory or diagnostic reports, and your current prescription medication list or previous medical summaries.",
    },
  ];

  return (
    <div className="bg-white">
      {/* ─── HERO SECTION ─── */}
      <section className="relative overflow-hidden bg-gradient-to-b from-slate-50 via-white to-white border-b border-slate-100 py-16 sm:py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-12 gap-12 items-center">
            {/* Left Content */}
            <div className="lg:col-span-7 space-y-6">
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-teal-50 border border-teal-200 text-teal-800 text-xs font-semibold tracking-wide">
                <span className="w-2 h-2 rounded-full bg-teal-500 animate-pulse" />
                Apex Health Clinic • Vaishali, Ghaziabad
              </div>

              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-slate-900 tracking-tight leading-[1.12]">
                Accessible, Quality Healthcare in{" "}
                <span className="text-teal-700">Vaishali</span>
              </h1>

              <p className="text-lg text-slate-600 max-w-2xl leading-relaxed">
                Consulting care led by{" "}
                <strong className="text-slate-900">Dr. Kavita Goswami (MBBS, MD)</strong>.
                Dedicated to clinical excellence, thorough evaluations, and respectful outpatient
                primary healthcare for patients and families.
              </p>

              {/* CTAs */}
              <div className="flex flex-wrap items-center gap-3 pt-2">
                <Link
                  href="/book"
                  className="inline-flex items-center gap-2 px-6 py-3.5 rounded-xl bg-blue-900 hover:bg-blue-950 text-white font-semibold text-base shadow-sm hover:shadow-md transition-all"
                >
                  <Calendar className="w-5 h-5 text-teal-300" />
                  Book Appointment
                </Link>

                <a
                  href="https://wa.me/918861608612"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 px-5 py-3.5 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-800 font-semibold text-base border border-emerald-200 transition-colors"
                >
                  <MessageCircle className="w-5 h-5 text-emerald-600" />
                  WhatsApp
                </a>

                <a
                  href="tel:8861608612"
                  className="inline-flex items-center gap-2 px-5 py-3.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 font-semibold text-base transition-colors"
                >
                  <Phone className="w-4 h-4 text-slate-600" />
                  8861608612
                </a>
              </div>

              {/* Quick Trust Highlights */}
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 pt-6 border-t border-slate-100">
                <div className="flex items-start gap-2.5">
                  <UserCheck className="w-5 h-5 text-teal-600 shrink-0 mt-0.5" />
                  <div>
                    <div className="text-xs text-slate-500 font-medium uppercase">Consultant</div>
                    <div className="text-sm font-bold text-slate-900">Dr. Kavita Goswami</div>
                    <div className="text-xs text-slate-500">MBBS, MD</div>
                  </div>
                </div>

                <div className="flex items-start gap-2.5">
                  <MapPin className="w-5 h-5 text-teal-600 shrink-0 mt-0.5" />
                  <div>
                    <div className="text-xs text-slate-500 font-medium uppercase">Address</div>
                    <div className="text-sm font-bold text-slate-900">Plot No. 3</div>
                    <div className="text-xs text-slate-500">Vaishali, Ghaziabad</div>
                  </div>
                </div>

                <div className="flex items-start gap-2.5 col-span-2 sm:col-span-1">
                  <Clock className="w-5 h-5 text-teal-600 shrink-0 mt-0.5" />
                  <div>
                    <div className="text-xs text-slate-500 font-medium uppercase">Hours</div>
                    <div className="text-sm font-bold text-slate-900">Mon – Sat</div>
                    <div className="text-xs text-slate-500">9:30 AM – 6:30 PM</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Card / Clinical Reference */}
            <div className="lg:col-span-5">
              <div className="bg-slate-900 rounded-2xl p-6 sm:p-8 text-white shadow-xl shadow-slate-900/10 border border-slate-800 relative">
                <div className="flex items-center justify-between pb-6 border-b border-slate-800">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-xl bg-teal-600/30 border border-teal-500/40 flex items-center justify-center">
                      <Stethoscope className="w-6 h-6 text-teal-300" />
                    </div>
                    <div>
                      <div className="text-xs font-semibold text-teal-400 uppercase tracking-wider">
                        Medical Consultation
                      </div>
                      <div className="text-lg font-bold text-white">Apex Health Clinic</div>
                    </div>
                  </div>
                  <span className="px-2.5 py-1 rounded-full bg-teal-950 text-teal-300 text-xs font-semibold border border-teal-700">
                    Verified
                  </span>
                </div>

                <div className="py-6 space-y-4">
                  <div>
                    <div className="text-xs text-slate-400">Consulting Physician</div>
                    <div className="text-xl font-bold text-white">Dr. Kavita Goswami</div>
                    <div className="text-sm text-teal-300 font-medium">MBBS, MD</div>
                  </div>

                  <p className="text-slate-300 text-sm leading-relaxed">
                    Personalized attention, clinical diagnostics, and comprehensive patient care.
                    Consultations are scheduled at 30-minute intervals to allow detailed evaluation.
                  </p>

                  <div className="bg-slate-800/80 rounded-xl p-4 border border-slate-700/60 space-y-2 text-xs text-slate-300">
                    <div className="flex justify-between">
                      <span className="text-slate-400">Clinic Location:</span>
                      <span className="font-semibold text-white">Plot No. 3, Vaishali</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">Helpline / Contact:</span>
                      <span className="font-semibold text-white">8861608612</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">Slot Duration:</span>
                      <span className="font-semibold text-white">30 Minutes</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">Sunday Status:</span>
                      <span className="font-semibold text-amber-400">Closed</span>
                    </div>
                  </div>
                </div>

                <div className="pt-2">
                  <Link
                    href="/book"
                    className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-teal-600 hover:bg-teal-500 text-white font-semibold text-sm transition shadow-sm"
                  >
                    <span>Check Real Slot Availability</span>
                    <ArrowRight className="w-4 h-4" />
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ─── DOCTOR SPOTLIGHT ─── */}
      <section className="py-16 sm:py-20 bg-white border-b border-slate-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl mb-12">
            <div className="text-xs font-bold uppercase tracking-wider text-teal-700 mb-2">
              Primary Medical Care
            </div>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
              Consulting Physician
            </h2>
            <p className="text-slate-600 text-base mt-3 leading-relaxed">
              Dr. Kavita Goswami provides clinical consultations for acute and chronic conditions,
              routine examinations, and health maintenance.
            </p>
          </div>

          {doctor && (
            <div className="bg-slate-50 rounded-2xl border border-slate-200/80 p-8 sm:p-10">
              <div className="grid md:grid-cols-12 gap-8 items-center">
                <div className="md:col-span-8 space-y-4">
                  <div className="flex flex-wrap items-center gap-3">
                    <h3 className="text-2xl font-bold text-slate-900">{doctor.name}</h3>
                    <span className="px-3 py-1 rounded-md bg-blue-100 text-blue-900 font-bold text-sm">
                      {doctor.credentials}
                    </span>
                  </div>

                  <div className="text-teal-800 font-medium text-sm">{doctor.title} • {doctor.specialty}</div>

                  <p className="text-slate-600 text-base leading-relaxed">
                    {doctor.bio}
                  </p>

                  <div className="grid sm:grid-cols-2 gap-4 pt-2 text-sm text-slate-700">
                    <div className="flex items-center gap-2">
                      <Clock className="w-4 h-4 text-teal-600 shrink-0" />
                      <span><strong>Days:</strong> {doctor.workingDaysText}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Clock className="w-4 h-4 text-teal-600 shrink-0" />
                      <span><strong>Hours:</strong> {doctor.workingHours.start} – {doctor.workingHours.end}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-teal-600 shrink-0" />
                      <span><strong>Consultation:</strong> {doctor.slotDurationMinutes} Minutes</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <MapPin className="w-4 h-4 text-teal-600 shrink-0" />
                      <span><strong>Clinic:</strong> Plot No. 3, Vaishali</span>
                    </div>
                  </div>

                  <div className="pt-4 flex flex-wrap items-center gap-3">
                    <Link
                      href={`/book?doctor=${doctor.id}`}
                      className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-blue-900 hover:bg-blue-950 text-white font-semibold text-sm transition"
                    >
                      <Calendar className="w-4 h-4 text-teal-300" />
                      Book Consultation
                    </Link>
                    <Link
                      href="/doctors"
                      className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white hover:bg-slate-100 text-slate-700 font-semibold text-sm border border-slate-200 transition"
                    >
                      View Doctor Details
                    </Link>
                  </div>
                </div>

                <div className="md:col-span-4 bg-white rounded-xl p-6 border border-slate-200 text-center space-y-4">
                  <div className="w-20 h-20 rounded-full bg-teal-100 text-teal-800 mx-auto flex items-center justify-center font-bold text-2xl">
                    KG
                  </div>
                  <div>
                    <div className="font-bold text-slate-900">Dr. Kavita Goswami</div>
                    <div className="text-xs text-slate-500">MBBS, MD</div>
                  </div>
                  <div className="text-xs text-slate-500 leading-relaxed border-t border-slate-100 pt-3">
                    Consultations are strictly scheduled by time slot to ensure dedicated patient care.
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </section>

      {/* ─── DEPARTMENTS & TREATMENTS ─── */}
      <section className="py-16 sm:py-20 bg-slate-50/60 border-b border-slate-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-12 gap-4">
            <div>
              <div className="text-xs font-bold uppercase tracking-wider text-teal-700 mb-2">
                Clinical Care Areas
              </div>
              <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
                Departments & Consultations
              </h2>
            </div>
            <Link
              href="/treatments"
              className="inline-flex items-center gap-1.5 text-sm font-semibold text-teal-700 hover:text-teal-800"
            >
              Explore All Treatments <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          {/* Department Cards */}
          <div className="grid md:grid-cols-3 gap-6 mb-10">
            {departments.map((dept) => (
              <div
                key={dept.id}
                className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-xs hover:shadow-md transition-shadow flex flex-col justify-between"
              >
                <div>
                  <div className="w-10 h-10 rounded-xl bg-teal-50 border border-teal-100 flex items-center justify-center text-teal-700 mb-4">
                    {dept.icon === "Stethoscope" ? (
                      <Stethoscope className="w-5 h-5" />
                    ) : dept.icon === "ShieldCheck" ? (
                      <ShieldCheck className="w-5 h-5" />
                    ) : (
                      <Activity className="w-5 h-5" />
                    )}
                  </div>
                  <h3 className="text-xl font-bold text-slate-900 mb-2">{dept.name}</h3>
                  <p className="text-slate-600 text-sm leading-relaxed mb-4">
                    {dept.description}
                  </p>
                </div>
                <div className="border-t border-slate-100 pt-4 flex items-center justify-between">
                  <span className="text-xs font-medium text-slate-500">
                    Lead: Dr. Kavita Goswami
                  </span>
                  <Link
                    href={`/treatments?department=${dept.id}`}
                    className="text-xs font-bold text-teal-700 hover:text-teal-900"
                  >
                    View Services →
                  </Link>
                </div>
              </div>
            ))}
          </div>

          {/* Treatment List Preview */}
          <div className="bg-white rounded-2xl border border-slate-200/80 p-6 sm:p-8">
            <h3 className="text-lg font-bold text-slate-900 mb-6 flex items-center gap-2">
              <HeartPulse className="w-5 h-5 text-teal-600" />
              Available Outpatient Consultations
            </h3>
            <div className="grid md:grid-cols-2 gap-4">
              {services.map((srv) => (
                <div
                  key={srv.id}
                  className="p-4 rounded-xl border border-slate-100 hover:border-teal-200 hover:bg-slate-50 transition-colors flex items-start justify-between gap-4"
                >
                  <div>
                    <div className="font-bold text-slate-900 text-sm">{srv.name}</div>
                    <div className="text-xs text-teal-700 font-medium mb-1.5">{srv.departmentName}</div>
                    <p className="text-xs text-slate-500 leading-relaxed">{srv.description}</p>
                    <div className="text-[11px] text-slate-400 mt-2">
                      Duration: {srv.durationMinutes || 30} mins • Consultation with Dr. Kavita Goswami
                    </div>
                  </div>
                  <Link
                    href={`/book?service=${srv.id}`}
                    className="shrink-0 px-3 py-1.5 rounded-lg bg-blue-900 hover:bg-blue-950 text-white font-medium text-xs transition"
                  >
                    Book
                  </Link>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ─── 4-STEP BOOKING PROCESS ─── */}
      <section className="py-16 sm:py-20 bg-white border-b border-slate-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-14">
            <div className="text-xs font-bold uppercase tracking-wider text-teal-700 mb-2">
              Seamless Process
            </div>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
              How Appointment Booking Works
            </h2>
            <p className="text-slate-600 text-sm mt-3">
              Direct, real-time slot scheduling with instant confirmation and reference tracking.
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              {
                step: "01",
                title: "Select Service",
                desc: "Choose the relevant consultation or health evaluation required.",
              },
              {
                step: "02",
                title: "Choose Date & Slot",
                desc: "View verified doctor calendar slots and pick an available time.",
              },
              {
                step: "03",
                title: "Enter Patient Info",
                desc: "Provide your name, phone number, and any notes for the doctor.",
              },
              {
                step: "04",
                title: "Instant Confirmation",
                desc: "Receive your unique booking reference ID and confirmation alert.",
              },
            ].map((st, i) => (
              <div
                key={i}
                className="p-6 rounded-2xl bg-slate-50 border border-slate-200/80 hover:border-teal-300 transition-colors"
              >
                <div className="text-2xl font-black text-teal-600 mb-2">{st.step}</div>
                <h3 className="font-bold text-slate-900 text-base mb-1.5">{st.title}</h3>
                <p className="text-slate-600 text-xs leading-relaxed">{st.desc}</p>
              </div>
            ))}
          </div>

          <div className="text-center mt-10">
            <Link
              href="/book"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-blue-900 hover:bg-blue-950 text-white font-semibold text-sm shadow-xs transition"
            >
              <Calendar className="w-4 h-4 text-teal-300" />
              Schedule Your Appointment Now
            </Link>
          </div>
        </div>
      </section>

      {/* ─── FREQUENTLY ASKED QUESTIONS ─── */}
      <section className="py-16 sm:py-20 bg-slate-50/60 border-b border-slate-100">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <div className="text-xs font-bold uppercase tracking-wider text-teal-700 mb-2">
              Patient Information
            </div>
            <h2 className="text-3xl font-extrabold text-slate-900 tracking-tight">
              Frequently Asked Questions
            </h2>
            <p className="text-slate-600 text-sm mt-2">
              Straightforward information regarding clinic visits, appointments, and consultations.
            </p>
          </div>

          <div className="space-y-4">
            {faqs.map((f, i) => (
              <div
                key={i}
                className="bg-white rounded-xl p-6 border border-slate-200/80 shadow-2xs"
              >
                <h3 className="text-base font-bold text-slate-900 mb-2 flex items-start gap-2.5">
                  <HelpCircle className="w-5 h-5 text-teal-600 shrink-0 mt-0.5" />
                  {f.q}
                </h3>
                <p className="text-sm text-slate-600 leading-relaxed pl-7.5">{f.a}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── CLINIC CONTACT & LOCATION ─── */}
      <section className="py-16 sm:py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-slate-900 text-white rounded-3xl p-8 sm:p-12 border border-slate-800">
            <div className="grid lg:grid-cols-12 gap-8 items-center">
              <div className="lg:col-span-7 space-y-4">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-teal-900/60 text-teal-300 text-xs font-semibold border border-teal-700/60">
                  <Building2 className="w-3.5 h-3.5 text-teal-400" />
                  Clinic Address & Contact
                </div>
                <h2 className="text-3xl sm:text-4xl font-extrabold text-white">
                  Visit Apex Health Clinic
                </h2>
                <p className="text-slate-300 text-sm leading-relaxed max-w-xl">
                  Located at Plot No. 3, Vaishali, Ghaziabad. We welcome patients for routine and
                  specialized physician consultations.
                </p>

                <div className="space-y-2.5 pt-2 text-sm text-slate-300">
                  <div className="flex items-center gap-2.5">
                    <MapPin className="w-4 h-4 text-teal-400 shrink-0" />
                    <span>Plot No. 3, Vaishali, Ghaziabad</span>
                  </div>
                  <div className="flex items-center gap-2.5">
                    <Phone className="w-4 h-4 text-teal-400 shrink-0" />
                    <span>8861608612</span>
                  </div>
                  <div className="flex items-center gap-2.5">
                    <Clock className="w-4 h-4 text-teal-400 shrink-0" />
                    <span>Monday – Saturday: 9:30 AM – 6:30 PM (Sunday Closed)</span>
                  </div>
                </div>
              </div>

              <div className="lg:col-span-5 bg-slate-800 rounded-2xl p-6 border border-slate-700/80 space-y-4">
                <div className="text-base font-bold text-white">Need Directions or Assistance?</div>
                <p className="text-xs text-slate-300 leading-relaxed">
                  Open directions on Google Maps or connect with our front desk directly on WhatsApp.
                </p>

                <div className="space-y-2.5">
                  <a
                    href="https://maps.google.com/?q=Plot+No.+3+Vaishali+Ghaziabad"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-teal-600 hover:bg-teal-500 text-white font-semibold text-sm transition"
                  >
                    <MapPin className="w-4 h-4" />
                    <span>Open in Google Maps</span>
                    <ExternalLink className="w-3.5 h-3.5 ml-1 opacity-70" />
                  </a>

                  <a
                    href="https://wa.me/918861608612"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-slate-700 hover:bg-slate-600 text-emerald-300 font-semibold text-sm transition border border-slate-600"
                  >
                    <MessageCircle className="w-4 h-4 text-emerald-400" />
                    <span>Message on WhatsApp (8861608612)</span>
                  </a>

                  <Link
                    href="/contact"
                    className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl text-xs text-slate-400 hover:text-white transition"
                  >
                    Submit an Online Enquiry Form →
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
