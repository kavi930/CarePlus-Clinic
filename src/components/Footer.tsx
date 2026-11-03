import React from "react";
import Link from "next/link";
import { ShieldCheck, Phone, MapPin, Clock, MessageCircle, ArrowRight } from "lucide-react";

export default function Footer() {
  return (
    <footer className="bg-slate-900 text-slate-300 pt-16 pb-12 border-t border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10 pb-12 border-b border-slate-800">
          {/* Clinic Brand */}
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-700 to-teal-600 flex items-center justify-center text-white">
                <ShieldCheck className="w-6 h-6 text-teal-200" />
              </div>
              <div>
                <div className="font-bold text-white text-lg">Apex Health Clinic</div>
                <div className="text-xs text-teal-400">Vaishali, Ghaziabad</div>
              </div>
            </div>
            <p className="text-slate-400 text-sm leading-relaxed">
              Consulting care under <strong>Dr. Kavita Goswami (MBBS, MD)</strong>. Dedicated to accessible, thorough, and respectful primary and preventive healthcare for patients and families.
            </p>
            <div className="pt-2">
              <a
                href="https://wa.me/918861608612"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-3.5 py-2 rounded-lg bg-emerald-950 text-emerald-300 border border-emerald-700/60 hover:bg-emerald-900 text-xs font-semibold transition"
              >
                <MessageCircle className="w-4 h-4 text-emerald-400" />
                WhatsApp: 8861608612
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-white font-semibold text-sm tracking-wider uppercase mb-4">
              Navigation
            </h3>
            <ul className="space-y-2.5 text-sm">
              <li>
                <Link href="/" className="hover:text-teal-300 transition-colors">
                  Home
                </Link>
              </li>
              <li>
                <Link href="/about" className="hover:text-teal-300 transition-colors">
                  About Clinic & Doctor
                </Link>
              </li>
              <li>
                <Link href="/doctors" className="hover:text-teal-300 transition-colors">
                  Doctor Profile
                </Link>
              </li>
              <li>
                <Link href="/departments" className="hover:text-teal-300 transition-colors">
                  Departments
                </Link>
              </li>
              <li>
                <Link href="/treatments" className="hover:text-teal-300 transition-colors">
                  Treatments & Consultations
                </Link>
              </li>
              <li>
                <Link href="/book" className="hover:text-teal-300 transition-colors flex items-center gap-1 font-medium text-teal-400">
                  Book Appointment <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact & Hours */}
          <div>
            <h3 className="text-white font-semibold text-sm tracking-wider uppercase mb-4">
              Clinic Information
            </h3>
            <ul className="space-y-3 text-sm text-slate-300">
              <li className="flex items-start gap-2.5">
                <MapPin className="w-4 h-4 text-teal-400 shrink-0 mt-0.5" />
                <span>Plot No. 3, Vaishali, Ghaziabad</span>
              </li>
              <li className="flex items-center gap-2.5">
                <Phone className="w-4 h-4 text-teal-400 shrink-0" />
                <a href="tel:8861608612" className="hover:text-white transition-colors">
                  8861608612
                </a>
              </li>
              <li className="flex items-start gap-2.5">
                <Clock className="w-4 h-4 text-teal-400 shrink-0 mt-0.5" />
                <div>
                  <div className="font-medium text-white">Mon – Sat: 9:30 AM – 6:30 PM</div>
                  <div className="text-xs text-slate-400">Lunch Break: 1:30 PM – 2:30 PM</div>
                  <div className="text-xs text-slate-400">Sunday: Closed</div>
                </div>
              </li>
            </ul>
          </div>

          {/* Consultation Standards */}
          <div>
            <h3 className="text-white font-semibold text-sm tracking-wider uppercase mb-4">
              Patient Care Notice
            </h3>
            <div className="bg-slate-800/80 border border-slate-700/80 rounded-xl p-4 text-xs text-slate-300 leading-relaxed space-y-2">
              <p>
                Consultations are by appointment. Walk-in patients are accommodated subject to doctor availability between scheduled slots.
              </p>
              <p className="text-slate-400">
                ⚠️ Apex Health Clinic is an outpatient consultation facility. For acute medical emergencies or trauma, please reach the nearest 24/7 hospital emergency center immediately.
              </p>
              <div className="pt-1">
                <Link href="/contact" className="text-teal-400 hover:underline">
                  Send an online enquiry →
                </Link>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom micro-bar */}
        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-400 gap-4">
          <div>
            © 2026 Apex Health Clinic. Doctor: Dr. Kavita Goswami (MBBS, MD). All rights reserved.
          </div>
          <div className="flex items-center gap-6">
            <Link href="/contact" className="hover:text-slate-300 transition-colors">
              Contact & Directions
            </Link>
            <span>•</span>
            <Link href="/book" className="hover:text-slate-300 transition-colors">
              Online Appointment
            </Link>
            <span>•</span>
            <Link href="/dashboard" className="hover:text-slate-300 transition-colors">
              Staff Portal
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
