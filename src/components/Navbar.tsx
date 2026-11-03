"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Menu, X, Phone, Calendar, MessageCircle, ShieldCheck } from "lucide-react";

const navLinks = [
  { href: "/", label: "Home" },
  { href: "/about", label: "About" },
  { href: "/doctors", label: "Doctors" },
  { href: "/departments", label: "Departments" },
  { href: "/treatments", label: "Treatments" },
  { href: "/contact", label: "Contact" },
];

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <nav className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200/80 shadow-xs">
      {/* Top micro-bar for clinic address & phone */}
      <div className="bg-slate-900 text-slate-300 text-xs py-1.5 px-4 hidden md:block">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-6">
            <span className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-teal-400"></span>
              Plot No. 3, Vaishali, Ghaziabad
            </span>
            <span className="text-slate-400">|</span>
            <span>Consulting: Dr. Kavita Goswami (MBBS, MD)</span>
          </div>
          <div className="flex items-center gap-4">
            <a
              href="https://wa.me/918861608612"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1 hover:text-teal-300 transition-colors text-emerald-400 font-medium"
            >
              <MessageCircle className="w-3.5 h-3.5" />
              WhatsApp: 8861608612
            </a>
            <span className="text-slate-400">|</span>
            <Link href="/dashboard" className="hover:text-white transition-colors text-slate-300">
              Staff Portal
            </Link>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-18">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-3 group">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-900 via-teal-700 to-teal-600 flex items-center justify-center text-white shadow-md shadow-teal-900/10 group-hover:scale-105 transition-transform">
              <ShieldCheck className="w-6 h-6 text-teal-200" />
            </div>
            <div>
              <div className="font-extrabold text-slate-900 text-lg leading-tight tracking-tight">
                Apex Health Clinic
              </div>
              <div className="text-[11px] text-teal-700 font-semibold tracking-wider uppercase">
                Vaishali, Ghaziabad
              </div>
            </div>
          </Link>

          {/* Desktop Nav */}
          <div className="hidden lg:flex items-center gap-1">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="px-3.5 py-2 rounded-lg text-sm font-medium text-slate-700 hover:text-blue-900 hover:bg-slate-50 transition-colors"
              >
                {link.label}
              </Link>
            ))}
          </div>

          {/* Action CTAs */}
          <div className="hidden md:flex items-center gap-3">
            <a
              href="tel:8861608612"
              className="flex items-center gap-1.5 px-3 py-2 text-sm font-semibold text-slate-700 hover:text-teal-700 hover:bg-slate-50 rounded-lg transition"
              title="Call Apex Health Clinic"
            >
              <Phone className="w-4 h-4 text-teal-600" />
              <span>8861608612</span>
            </a>
            <a
              href="https://wa.me/918861608612"
              target="_blank"
              rel="noopener noreferrer"
              className="hidden xl:inline-flex items-center gap-1.5 px-3 py-2 bg-emerald-50 text-emerald-800 hover:bg-emerald-100 font-medium text-sm rounded-lg transition border border-emerald-200"
            >
              <MessageCircle className="w-4 h-4 text-emerald-600" />
              WhatsApp
            </a>
            <Link
              href="/book"
              className="inline-flex items-center gap-2 px-4.5 py-2.5 bg-blue-900 hover:bg-blue-950 text-white font-semibold text-sm rounded-xl shadow-xs hover:shadow-md transition-all"
            >
              <Calendar className="w-4 h-4 text-teal-300" />
              Book Appointment
            </Link>
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="lg:hidden p-2 rounded-lg text-slate-700 hover:bg-slate-100 transition"
            aria-label="Toggle navigation menu"
          >
            {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Menu Drawer */}
      {isOpen && (
        <div className="lg:hidden border-t border-slate-200 bg-white px-4 py-4 space-y-2 shadow-lg">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="block px-3 py-2 rounded-lg text-base font-medium text-slate-800 hover:text-blue-900 hover:bg-slate-50 transition"
              onClick={() => setIsOpen(false)}
            >
              {link.label}
            </Link>
          ))}
          <div className="pt-3 border-t border-slate-100 space-y-2">
            <Link
              href="/book"
              onClick={() => setIsOpen(false)}
              className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl text-sm font-bold bg-blue-900 text-white shadow-xs"
            >
              <Calendar className="w-4 h-4 text-teal-300" />
              Book Appointment
            </Link>
            <a
              href="https://wa.me/918861608612"
              target="_blank"
              rel="noopener noreferrer"
              className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold bg-emerald-50 text-emerald-800 border border-emerald-200 transition"
            >
              <MessageCircle className="w-4 h-4 text-emerald-600" />
              WhatsApp (8861608612)
            </a>
            <a
              href="tel:8861608612"
              className="w-full flex items-center justify-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold text-slate-700 hover:bg-slate-50 transition"
            >
              <Phone className="w-4 h-4 text-teal-600" />
              Call Reception: 8861608612
            </a>
            <div className="pt-2 text-center">
              <Link
                href="/dashboard"
                onClick={() => setIsOpen(false)}
                className="text-xs text-slate-500 hover:text-blue-900"
              >
                Staff CRM Login
              </Link>
            </div>
          </div>
        </div>
      )}
    </nav>
  );
}
