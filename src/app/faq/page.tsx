import type { Metadata } from "next";
import { ChevronDown, Calendar, MessageSquare, Phone } from "lucide-react";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Frequently Asked Questions",
  description:
    "Frequently asked questions about Apex Health Clinic, Vaishali. Doctor consultations, timings, booking, and clinic policies.",
};

const faqs = [
  {
    category: "Consultations & Doctor",
    items: [
      {
        q: "Who is the consulting physician at Apex Health Clinic?",
        a: "Dr. Kavita Goswami (MBBS, MD) leads all consultations at Apex Health Clinic, specializing in internal medicine, comprehensive primary care, diagnostic assessments, and chronic condition management.",
      },
      {
        q: "What medical services are available?",
        a: "We provide General Medical Consultations, Preventive Health Reviews, Chronic Condition Care (hypertension, diabetes, thyroid disorders), and ongoing Follow-up Consultations.",
      },
      {
        q: "Where is the clinic located?",
        a: "Apex Health Clinic is located at Plot No. 3, Vaishali, Ghaziabad. We are easily accessible from Kaushambi, Indirapuram, and East Delhi.",
      },
      {
        q: "What are the clinic's operating hours?",
        a: "Monday through Saturday: 9:30 AM to 6:30 PM (lunch break from 1:30 PM to 2:30 PM). The clinic is closed on Sundays.",
      },
    ],
  },
  {
    category: "Appointment Booking & Slots",
    items: [
      {
        q: "How do I book an appointment?",
        a: "You can book directly through our online booking portal by selecting your preferred service, date, and 30-minute consultation slot. An instant booking reference is generated.",
      },
      {
        q: "Can walk-in patients be seen without an appointment?",
        a: "Prior booking is strongly advised to prevent waiting. Walk-in visitors are accommodated subject to available time between scheduled appointments.",
      },
      {
        q: "How can I reschedule or cancel my appointment?",
        a: "You can reschedule or cancel using your appointment reference ID through our website or by contacting the clinic front desk at 8861608612.",
      },
      {
        q: "How do I receive confirmation of my booking?",
        a: "Upon saving your appointment, confirmation is provided on-screen with your unique reference ID, and a notification is dispatched via WhatsApp or SMS based on your preferred contact option.",
      },
    ],
  },
  {
    category: "Safety & Emergency Policies",
    items: [
      {
        q: "Does Apex Health Clinic handle acute medical emergencies?",
        a: "No. Apex Health Clinic is an outpatient consultation facility. For critical emergencies, chest pain, acute respiratory distress, severe bleeding, or trauma, please immediately call 112 or visit the nearest 24/7 hospital emergency center.",
      },
      {
        q: "Can the online chat receptionist provide a medical diagnosis?",
        a: "No. The virtual assistant provides administrative support regarding timings, doctors, and scheduling. All medical diagnoses and prescriptions require an in-person clinical examination by Dr. Kavita Goswami.",
      },
    ],
  },
];

export default function FAQPage() {
  return (
    <div className="bg-white">
      {/* Header */}
      <section className="bg-slate-900 text-white py-16 px-4">
        <div className="max-w-4xl mx-auto text-center space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-teal-900/60 text-teal-300 text-xs font-semibold border border-teal-700/60">
            Patient Guide
          </div>
          <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight">
            Frequently Asked Questions
          </h1>
          <p className="text-slate-300 text-base max-w-xl mx-auto">
            Grounded, verified answers regarding clinic appointments, doctor consultation, and visit guidelines.
          </p>
        </div>
      </section>

      {/* FAQs List */}
      <section className="py-16 px-4">
        <div className="max-w-3xl mx-auto space-y-12">
          {faqs.map((cat, ci) => (
            <div key={ci} className="space-y-4">
              <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2.5">
                <span className="w-6 h-6 rounded-md bg-blue-900 text-white text-xs font-bold flex items-center justify-center">
                  {ci + 1}
                </span>
                {cat.category}
              </h2>
              <div className="space-y-3">
                {cat.items.map((item, ii) => (
                  <details
                    key={ii}
                    className="group bg-white border border-slate-200/90 rounded-2xl overflow-hidden hover:border-teal-300 transition"
                  >
                    <summary className="flex items-center justify-between gap-4 px-5 py-4 cursor-pointer list-none">
                      <span className="font-semibold text-slate-900 text-sm">{item.q}</span>
                      <ChevronDown className="w-4 h-4 text-slate-400 shrink-0 group-open:rotate-180 transition-transform duration-200" />
                    </summary>
                    <div className="px-5 pb-5 text-sm text-slate-600 leading-relaxed border-t border-slate-100 pt-3">
                      {item.a}
                    </div>
                  </details>
                ))}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="py-12 bg-slate-50 border-t border-slate-200">
        <div className="max-w-2xl mx-auto px-4 text-center space-y-4">
          <h2 className="text-xl font-bold text-slate-900">Have more questions?</h2>
          <p className="text-slate-600 text-xs">
            Connect directly with the clinic front desk or book your consultation slot online.
          </p>
          <div className="flex flex-wrap gap-3 justify-center pt-2">
            <Link
              href="/book"
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-blue-900 hover:bg-blue-950 text-white font-semibold rounded-xl text-xs transition"
            >
              <Calendar className="w-4 h-4 text-teal-300" />
              Book Appointment
            </Link>
            <a
              href="tel:8861608612"
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-white border border-slate-200 hover:bg-slate-100 text-slate-700 font-semibold rounded-xl text-xs transition"
            >
              <Phone className="w-4 h-4 text-teal-600" />
              Call Reception (8861608612)
            </a>
          </div>
        </div>
      </section>
    </div>
  );
}
