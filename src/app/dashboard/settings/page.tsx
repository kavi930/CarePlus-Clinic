"use client";

import React, { useEffect, useState } from "react";
import { Settings, ShieldCheck, CheckCircle2, AlertCircle, Loader2, Save, Calendar, MessageCircle, Bot } from "lucide-react";
import { ClinicSettings } from "@/types";

export default function DashboardSettingsPage() {
  const [settings, setSettings] = useState<ClinicSettings | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    fetch("/api/settings")
      .then((r) => r.json())
      .then((d) => {
        if (d.success) setSettings(d.settings);
      })
      .finally(() => setLoading(false));
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!settings) return;

    setSaving(true);
    setSuccess(false);

    try {
      const res = await fetch("/api/settings", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(settings),
      });

      const data = await res.json();
      if (data.success) {
        setSettings(data.settings);
        setSuccess(true);
      }
    } catch {
      alert("Failed to save settings.");
    } finally {
      setSaving(false);
    }
  };

  if (loading || !settings) {
    return (
      <div className="min-h-[50vh] flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-teal-600" />
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div>
        <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
          Clinic Settings & Integration Toggles
        </h1>
        <p className="text-xs text-slate-500">
          Configure Apex Health Clinic parameters, safety switches, and integration connections.
        </p>
      </div>

      {success && (
        <div className="bg-teal-50 border border-teal-200 text-teal-800 rounded-xl p-3 text-xs flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-teal-600 shrink-0" />
          <span>Settings saved successfully.</span>
        </div>
      )}

      <form onSubmit={handleSave} className="space-y-6">
        {/* Core Clinic Info */}
        <div className="bg-white rounded-2xl p-6 sm:p-8 border border-slate-200 shadow-2xs space-y-4">
          <h2 className="text-base font-bold text-slate-900 pb-3 border-b border-slate-100">
            Core Clinic Information
          </h2>

          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Clinic Name</label>
              <input
                type="text"
                value={settings.clinicName}
                onChange={(e) => setSettings({ ...settings, clinicName: e.target.value })}
                className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Lead Doctor</label>
              <input
                type="text"
                value={settings.leadDoctor}
                onChange={(e) => setSettings({ ...settings, leadDoctor: e.target.value })}
                className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Credentials</label>
              <input
                type="text"
                value={settings.credentials}
                onChange={(e) => setSettings({ ...settings, credentials: e.target.value })}
                className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Phone Helpline</label>
              <input
                type="text"
                value={settings.phone}
                onChange={(e) => setSettings({ ...settings, phone: e.target.value })}
                className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="block text-xs font-semibold text-slate-700 mb-1">Clinic Address</label>
              <input
                type="text"
                value={settings.address}
                onChange={(e) => setSettings({ ...settings, address: e.target.value })}
                className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl"
              />
            </div>
          </div>
        </div>

        {/* Integration Statuses & Toggles */}
        <div className="bg-white rounded-2xl p-6 sm:p-8 border border-slate-200 shadow-2xs space-y-4">
          <h2 className="text-base font-bold text-slate-900 pb-3 border-b border-slate-100">
            Safety & Integration Switches
          </h2>

          <div className="space-y-4">
            {/* Demo Mode Toggle */}
            <div className="flex items-center justify-between p-4 rounded-xl bg-slate-50 border border-slate-200">
              <div>
                <div className="font-bold text-slate-900 text-sm">Demo / Simulation Mode</div>
                <div className="text-xs text-slate-500">
                  When enabled, all notifications and calendar writes are safely simulated to prevent unintended live transmissions.
                </div>
              </div>
              <input
                type="checkbox"
                checked={settings.demoMode}
                onChange={(e) => setSettings({ ...settings, demoMode: e.target.checked })}
                className="w-5 h-5 rounded text-teal-600 focus:ring-teal-500"
              />
            </div>

            {/* Google Calendar Toggle */}
            <div className="flex items-center justify-between p-4 rounded-xl bg-slate-50 border border-slate-200">
              <div>
                <div className="font-bold text-slate-900 text-sm flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-blue-600" />
                  Google Calendar Live Sync
                </div>
                <div className="text-xs text-slate-500">
                  Requires GOOGLE_CLIENT_ID / GOOGLE_CLIENT_SECRET or Service Account in .env.local.
                </div>
              </div>
              <input
                type="checkbox"
                checked={settings.googleCalendarConnected}
                onChange={(e) => setSettings({ ...settings, googleCalendarConnected: e.target.checked })}
                className="w-5 h-5 rounded text-teal-600 focus:ring-teal-500"
              />
            </div>

            {/* WhatsApp Business API Toggle */}
            <div className="flex items-center justify-between p-4 rounded-xl bg-slate-50 border border-slate-200">
              <div>
                <div className="font-bold text-slate-900 text-sm flex items-center gap-2">
                  <MessageCircle className="w-4 h-4 text-emerald-600" />
                  WhatsApp Cloud API Live Messaging
                </div>
                <div className="text-xs text-slate-500">
                  Requires WHATSAPP_ACCESS_TOKEN and WHATSAPP_PHONE_NUMBER_ID in .env.local.
                </div>
              </div>
              <input
                type="checkbox"
                checked={settings.whatsAppConfigured}
                onChange={(e) => setSettings({ ...settings, whatsAppConfigured: e.target.checked })}
                className="w-5 h-5 rounded text-teal-600 focus:ring-teal-500"
              />
            </div>

            {/* Chatbot Provider */}
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
              <label className="block text-xs font-bold text-slate-700">Chatbot Intelligence Provider</label>
              <select
                value={settings.chatbotProvider}
                onChange={(e) => setSettings({ ...settings, chatbotProvider: e.target.value as "rules" | "ai" })}
                className="w-full px-3 py-2 text-sm bg-white border border-slate-200 rounded-xl"
              >
                <option value="rules">Clinic Rule-Based Safety Engine (Deterministic & Safe)</option>
                <option value="ai">AI Model Provider (Requires AI_API_KEY)</option>
              </select>
            </div>
          </div>
        </div>

        <div className="flex justify-end">
          <button
            type="submit"
            disabled={saving}
            className="px-6 py-2.5 bg-blue-900 hover:bg-blue-950 text-white rounded-xl text-xs font-semibold transition disabled:opacity-50"
          >
            {saving ? "Saving..." : "Save Settings"}
          </button>
        </div>
      </form>
    </div>
  );
}
