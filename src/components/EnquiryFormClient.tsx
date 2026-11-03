"use client";

import React, { useState } from "react";
import { User, Phone, Mail, MessageSquare, CheckCircle2, AlertCircle, Loader2, ArrowRight } from "lucide-react";

interface FormState {
  name: string;
  phone: string;
  email: string;
  category: string;
  question: string;
  preferred_contact: "WhatsApp" | "Phone" | "Email";
  consent: boolean;
}

const CATEGORIES = [
  "General Medical Consultation",
  "Preventive Health Review",
  "Chronic Condition Care",
  "Follow-up Consultation",
  "Clinic Timings & Directions",
  "Other Patient Enquiry",
];

export default function EnquiryFormClient() {
  const [form, setForm] = useState<FormState>({
    name: "",
    phone: "",
    email: "",
    category: "General Medical Consultation",
    question: "",
    preferred_contact: "WhatsApp",
    consent: false,
  });
  const [submitting, setSubmitting] = useState(false);
  const [submittedData, setSubmittedData] = useState<Record<string, unknown> | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!form.name.trim()) {
      setError("Please enter your full name.");
      return;
    }

    const cleanPhone = form.phone.replace(/\D/g, "");
    if (!form.phone.trim() || cleanPhone.length < 10) {
      setError("Please enter a valid 10-digit phone number.");
      return;
    }

    if (!form.question.trim()) {
      setError("Please enter your question or message.");
      return;
    }

    if (!form.consent) {
      setError("Please confirm your consent for the clinic team to contact you.");
      return;
    }

    setSubmitting(true);
    setError(null);

    try {
      const res = await fetch("/api/enquiries", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: form.name.trim(),
          phone: form.phone.trim(),
          email: form.email.trim() || undefined,
          category: form.category,
          question: form.question.trim(),
          preferred_contact: form.preferred_contact,
          source: "Website Contact Page",
          consent: true,
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || "Failed to submit enquiry");
      }

      setSubmittedData(data.enquiry);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Submission failed. Please call 8861608612 directly.");
    } finally {
      setSubmitting(false);
    }
  };

  if (submittedData) {
    return (
      <div className="bg-white rounded-2xl p-8 border border-slate-200 text-center space-y-5 shadow-xs">
        <div className="w-14 h-14 rounded-full bg-emerald-100 text-emerald-700 mx-auto flex items-center justify-center">
          <CheckCircle2 className="w-8 h-8" />
        </div>
        <div className="space-y-1">
          <h3 className="text-2xl font-bold text-slate-900">Enquiry Received</h3>
          <p className="text-slate-600 text-sm max-w-md mx-auto">
            Thank you, <strong>{form.name}</strong>. Your message regarding <strong>{form.category}</strong> has been forwarded to our clinic reception.
          </p>
        </div>

        <div className="bg-slate-50 rounded-xl p-4 border border-slate-200 text-xs text-slate-600 max-w-sm mx-auto space-y-1 text-left">
          <div><span className="font-semibold text-slate-700">Phone Contact:</span> {form.phone}</div>
          <div><span className="font-semibold text-slate-700">Preferred Channel:</span> {form.preferred_contact}</div>
          <div><span className="font-semibold text-slate-700">Enquiry ID:</span> {String(submittedData.enquiry_id || "")}</div>
        </div>

        <p className="text-xs text-slate-500">
          Our front desk will contact you shortly. Need immediate booking? You can reserve a direct slot below.
        </p>

        <div className="flex justify-center gap-3 pt-2">
          <a
            href="/book"
            className="inline-flex items-center gap-1.5 px-5 py-2.5 rounded-xl bg-blue-900 text-white text-xs font-semibold hover:bg-blue-950 transition"
          >
            Book Appointment Now <ArrowRight className="w-3.5 h-3.5" />
          </a>
          <button
            onClick={() => {
              setSubmittedData(null);
              setForm({
                name: "",
                phone: "",
                email: "",
                category: "General Medical Consultation",
                question: "",
                preferred_contact: "WhatsApp",
                consent: false,
              });
            }}
            className="px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-medium transition"
          >
            Submit Another Query
          </button>
        </div>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="bg-white rounded-2xl p-6 sm:p-8 border border-slate-200 shadow-xs space-y-5">
      <div className="space-y-1">
        <h2 className="text-xl font-bold text-slate-900">Send an Enquiry</h2>
        <p className="text-xs text-slate-500">
          Fill in your details and our clinic front desk will follow up via your preferred contact method.
        </p>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 rounded-xl p-3 text-xs flex items-start gap-2">
          <AlertCircle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
          <span>{error}</span>
        </div>
      )}

      {/* Name */}
      <div>
        <label className="block text-xs font-semibold text-slate-700 mb-1">
          Patient / Visitor Full Name <span className="text-red-500">*</span>
        </label>
        <div className="relative">
          <User className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            required
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            placeholder="e.g. Ramesh Kumar"
            className="w-full pl-9 pr-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-teal-500 focus:bg-white transition"
          />
        </div>
      </div>

      {/* Phone & Email */}
      <div className="grid sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1">
            Phone Number <span className="text-red-500">*</span>
          </label>
          <div className="relative">
            <Phone className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="tel"
              required
              value={form.phone}
              onChange={(e) => setForm({ ...form, phone: e.target.value })}
              placeholder="e.g. 9876543210"
              className="w-full pl-9 pr-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-teal-500 focus:bg-white transition"
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1">
            Email Address <span className="text-slate-400">(Optional)</span>
          </label>
          <div className="relative">
            <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="email"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              placeholder="e.g. ramesh@example.com"
              className="w-full pl-9 pr-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-teal-500 focus:bg-white transition"
            />
          </div>
        </div>
      </div>

      {/* Category Dropdown */}
      <div>
        <label className="block text-xs font-semibold text-slate-700 mb-1">
          Enquiry Category
        </label>
        <select
          value={form.category}
          onChange={(e) => setForm({ ...form, category: e.target.value })}
          className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-teal-500 focus:bg-white transition"
        >
          {CATEGORIES.map((cat) => (
            <option key={cat} value={cat}>
              {cat}
            </option>
          ))}
        </select>
      </div>

      {/* Message Question */}
      <div>
        <label className="block text-xs font-semibold text-slate-700 mb-1">
          Your Question or Message <span className="text-red-500">*</span>
        </label>
        <div className="relative">
          <MessageSquare className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
          <textarea
            required
            rows={4}
            value={form.question}
            onChange={(e) => setForm({ ...form, question: e.target.value })}
            placeholder="Please share any question regarding clinic timings, doctor consultation, or specific concerns..."
            className="w-full pl-9 pr-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-teal-500 focus:bg-white transition"
          />
        </div>
      </div>

      {/* Preferred Contact Method */}
      <div>
        <label className="block text-xs font-semibold text-slate-700 mb-1">
          Preferred Contact Method
        </label>
        <div className="grid grid-cols-3 gap-2">
          {(["WhatsApp", "Phone", "Email"] as const).map((method) => (
            <label
              key={method}
              className={`flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl border text-xs font-medium cursor-pointer transition ${
                form.preferred_contact === method
                  ? "bg-teal-50 border-teal-500 text-teal-900 font-bold"
                  : "bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100"
              }`}
            >
              <input
                type="radio"
                name="preferred_contact"
                value={method}
                checked={form.preferred_contact === method}
                onChange={() => setForm({ ...form, preferred_contact: method })}
                className="sr-only"
              />
              <span>{method}</span>
            </label>
          ))}
        </div>
      </div>

      {/* Privacy Notice & Consent Checkbox */}
      <div className="pt-2">
        <label className="flex items-start gap-2.5 cursor-pointer">
          <input
            type="checkbox"
            required
            checked={form.consent}
            onChange={(e) => setForm({ ...form, consent: e.target.checked })}
            className="mt-0.5 rounded text-teal-600 focus:ring-teal-500"
          />
          <span className="text-xs text-slate-500 leading-relaxed">
            I consent to Apex Health Clinic storing my submitted details for the purpose of responding to this enquiry and contacting me via my chosen communication method. Information is kept private and confidential.
          </span>
        </label>
      </div>

      {/* Submit Button */}
      <button
        type="submit"
        disabled={submitting}
        className="w-full py-3 px-4 rounded-xl bg-blue-900 hover:bg-blue-950 text-white font-semibold text-sm transition shadow-xs flex items-center justify-center gap-2 disabled:opacity-50"
      >
        {submitting ? (
          <>
            <Loader2 className="w-4 h-4 animate-spin text-teal-300" />
            <span>Submitting Enquiry...</span>
          </>
        ) : (
          <span>Submit Enquiry</span>
        )}
      </button>
    </form>
  );
}
