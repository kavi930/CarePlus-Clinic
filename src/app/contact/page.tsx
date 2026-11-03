import type { Metadata } from "next";
import Link from "next/link";
import { Phone, Mail, MapPin, Clock, MessageCircle, Calendar, ExternalLink, ShieldCheck } from "lucide-react";
import EnquiryFormClient from "@/components/EnquiryFormClient";

export const metadata: Metadata = {
  title: "Contact & Enquiry",
  description:
    "Contact Apex Health Clinic in Vaishali, Ghaziabad. Phone: 8861608612. Dr. Kavita Goswami (MBBS, MD).",
};

export default function ContactPage() {
  return (
    <div className="bg-white">
      {/* Header */}
      <section className="bg-slate-900 text-white py-16 px-4">
        <div className="max-w-5xl mx-auto text-center space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-teal-900/60 text-teal-300 text-xs font-semibold border border-teal-700/60">
            Get in Touch
          </div>
          <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight">
            Contact Apex Health Clinic
          </h1>
          <p className="text-slate-300 text-base max-w-xl mx-auto">
            Reach out by phone, WhatsApp, or submit an online enquiry for consultations with Dr. Kavita Goswami (MBBS, MD).
          </p>
        </div>
      </section>

      {/* Main Grid */}
      <section className="py-16 px-4">
        <div className="max-w-6xl mx-auto grid lg:grid-cols-12 gap-10">
          {/* Contact Details & Info */}
          <div className="lg:col-span-5 space-y-6">
            <div>
              <h2 className="text-2xl font-bold text-slate-900 mb-2">Clinic Information</h2>
              <p className="text-xs text-slate-500 leading-relaxed">
                Consultations are held at our Vaishali clinic by prior appointment.
              </p>
            </div>

            <div className="space-y-4">
              <div className="flex items-start gap-3.5 p-4 rounded-2xl bg-slate-50 border border-slate-200">
                <div className="w-10 h-10 rounded-xl bg-teal-100 flex items-center justify-center shrink-0">
                  <MapPin className="w-5 h-5 text-teal-700" />
                </div>
                <div>
                  <div className="text-xs font-semibold text-slate-500 uppercase">Clinic Address</div>
                  <div className="text-sm font-bold text-slate-900">Plot No. 3, Vaishali</div>
                  <div className="text-xs text-slate-600">Ghaziabad, Uttar Pradesh</div>
                </div>
              </div>

              <div className="flex items-start gap-3.5 p-4 rounded-2xl bg-slate-50 border border-slate-200">
                <div className="w-10 h-10 rounded-xl bg-teal-100 flex items-center justify-center shrink-0">
                  <Phone className="w-5 h-5 text-teal-700" />
                </div>
                <div>
                  <div className="text-xs font-semibold text-slate-500 uppercase">Telephone / Helpline</div>
                  <a href="tel:8861608612" className="text-sm font-bold text-blue-900 hover:underline">
                    8861608612
                  </a>
                  <div className="text-xs text-slate-500">Available Mon–Sat: 9:30 AM – 6:30 PM</div>
                </div>
              </div>

              <div className="flex items-start gap-3.5 p-4 rounded-2xl bg-slate-50 border border-slate-200">
                <div className="w-10 h-10 rounded-xl bg-emerald-100 flex items-center justify-center shrink-0">
                  <MessageCircle className="w-5 h-5 text-emerald-700" />
                </div>
                <div>
                  <div className="text-xs font-semibold text-slate-500 uppercase">WhatsApp Channel</div>
                  <a
                    href="https://wa.me/918861608612"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm font-bold text-emerald-800 hover:underline"
                  >
                    8861608612 (Direct Chat)
                  </a>
                  <div className="text-xs text-slate-500">Quick queries & booking assistance</div>
                </div>
              </div>

              <div className="flex items-start gap-3.5 p-4 rounded-2xl bg-slate-50 border border-slate-200">
                <div className="w-10 h-10 rounded-xl bg-teal-100 flex items-center justify-center shrink-0">
                  <Clock className="w-5 h-5 text-teal-700" />
                </div>
                <div>
                  <div className="text-xs font-semibold text-slate-500 uppercase">Consulting Timings</div>
                  <div className="text-sm font-bold text-slate-900">Monday – Saturday</div>
                  <div className="text-xs text-slate-600">9:30 AM – 6:30 PM (Lunch: 1:30 PM – 2:30 PM)</div>
                  <div className="text-xs text-amber-700 font-medium">Sunday: Closed</div>
                </div>
              </div>
            </div>

            {/* Google Maps Directions Action */}
            <div className="p-4 rounded-2xl bg-blue-950 text-white space-y-3">
              <div className="font-bold text-sm">Need Driving or Metro Directions?</div>
              <p className="text-xs text-slate-300 leading-relaxed">
                Open Plot No. 3, Vaishali, Ghaziabad directly on Google Maps for navigation.
              </p>
              <a
                href="https://maps.google.com/?q=Plot+No.+3+Vaishali+Ghaziabad"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 px-4 py-2 bg-teal-600 hover:bg-teal-500 text-white rounded-xl text-xs font-semibold transition"
              >
                <MapPin className="w-3.5 h-3.5" />
                <span>Open Google Maps</span>
                <ExternalLink className="w-3 h-3 ml-1" />
              </a>
            </div>
          </div>

          {/* Enquiry Form */}
          <div className="lg:col-span-7">
            <EnquiryFormClient />
          </div>
        </div>
      </section>
    </div>
  );
}
