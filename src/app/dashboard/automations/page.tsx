"use client";

import React, { useEffect, useState } from "react";
import { Zap, CheckCircle2, Clock, RefreshCw, Loader2, Play, AlertCircle } from "lucide-react";

interface AutomationLog {
  id: string;
  timestamp: string;
  workflow: string;
  trigger: string;
  action: string;
  status: "Success" | "Simulated" | "Failed";
  result: string;
}

interface Workflow {
  id: string;
  name: string;
  description: string;
  enabled: boolean;
}

const WORKFLOWS: Workflow[] = [
  { id: "newAppointment", name: "New Appointment", description: "Triggers on appointment creation", enabled: true },
  { id: "appointmentConfirmation", name: "Appointment Confirmation", description: "Sends confirmation email + SMS", enabled: true },
  { id: "reminder24h", name: "24-Hour Reminder", description: "Automated pre-visit reminder", enabled: true },
  { id: "reminder2h", name: "2-Hour Reminder", description: "Day-of appointment reminder", enabled: true },
  { id: "enquiryRouting", name: "Enquiry Routing", description: "Auto-classifies and routes new enquiries", enabled: true },
  { id: "followUpTasks", name: "Follow-up Tasks", description: "Creates follow-up for unresolved enquiries", enabled: true },
  { id: "cancellationHandling", name: "Cancellation Handling", description: "Slot release and reminder suppression", enabled: true },
  { id: "rescheduleHandling", name: "Reschedule Handling", description: "Updated notifications and calendar sync", enabled: true },
];

const STATUS_COLORS = {
  Success: "bg-emerald-100 text-emerald-700 border-emerald-200",
  Simulated: "bg-sky-100 text-sky-700 border-sky-200",
  Failed: "bg-red-100 text-red-700 border-red-200",
};

export default function AutomationsPage() {
  const [logs, setLogs] = useState<AutomationLog[]>([]);
  const [workflows, setWorkflows] = useState<Record<string, boolean>>({});
  const [demoMode, setDemoMode] = useState(true);
  const [loading, setLoading] = useState(true);
  const [simulating, setSimulating] = useState<string | null>(null);
  const [simResult, setSimResult] = useState<{ action: string; msg: string; ok: boolean } | null>(null);

  const loadData = () => {
    setLoading(true);
    Promise.all([
      fetch("/api/automations").then((r) => r.json()),
      fetch("/api/settings").then((r) => r.json()),
    ])
      .then(([autData, settData]) => {
        if (autData.success) {
          setLogs(autData.logs || []);
          setWorkflows(autData.workflows || {});
          setDemoMode(autData.demoMode);
        }
        if (settData.success) {
          setDemoMode(settData.settings.demoMode);
        }
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => { loadData(); }, []);

  const toggleWorkflow = async (id: string, current: boolean) => {
    const newWorkflows = { ...workflows, [id]: !current };
    await fetch("/api/settings", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ workflows: newWorkflows }),
    });
    setWorkflows(newWorkflows);
  };

  const runSimulation = async (action: string, label: string) => {
    setSimulating(action);
    setSimResult(null);
    try {
      const res = await fetch("/api/automations/simulate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action }),
      });
      const data = await res.json();
      setSimResult({ action: label, msg: data.message || data.error || "Done", ok: data.success });
      loadData();
    } catch {
      setSimResult({ action: label, msg: "Simulation failed", ok: false });
    } finally {
      setSimulating(null);
    }
  };

  const formatTime = (iso: string) => {
    try {
      return new Date(iso).toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit", second: "2-digit" });
    } catch { return iso; }
  };

  return (
    <div className="space-y-7">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 flex items-center gap-2">
            <Zap className="w-6 h-6 text-amber-500" />
            Automation Center
          </h1>
          <p className="text-slate-400 text-sm mt-0.5">All clinic workflows, simulation triggers, and automation logs</p>
        </div>
        <button onClick={loadData} className="flex items-center gap-2 px-3.5 py-2 bg-white border border-slate-200 text-slate-600 rounded-xl text-sm hover:bg-slate-50 transition">
          <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
        </button>
      </div>

      {/* Demo Mode Banner */}
      {demoMode && (
        <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
          <div>
            <div className="font-bold text-amber-800 text-sm">Demo Mode Active</div>
            <p className="text-amber-700 text-xs mt-0.5">
              All email, SMS, WhatsApp, and calendar operations are simulated. Database operations, appointment booking, and automation logs are real. Toggle Demo Mode in Settings to see Live Mode indicators.
            </p>
          </div>
        </div>
      )}

      {/* Workflow Status */}
      <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-100 font-bold text-slate-900">Active Workflows</div>
        <div className="divide-y divide-slate-50">
          {WORKFLOWS.map((wf) => (
            <div key={wf.id} className="px-6 py-4 flex items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className={`w-2.5 h-2.5 rounded-full ${(workflows[wf.id] ?? true) ? "bg-emerald-400 animate-pulse" : "bg-slate-300"}`} />
                <div>
                  <div className="font-semibold text-slate-900 text-sm">{wf.name}</div>
                  <div className="text-xs text-slate-400">{wf.description}</div>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <span className={`text-xs font-bold ${(workflows[wf.id] ?? true) ? "text-emerald-600" : "text-slate-400"}`}>
                  {(workflows[wf.id] ?? true) ? "🟢 Active" : "⭕ Paused"}
                </span>
                <button
                  onClick={() => toggleWorkflow(wf.id, workflows[wf.id] ?? true)}
                  className={`relative w-10 h-5 rounded-full transition-colors ${
                    (workflows[wf.id] ?? true) ? "bg-emerald-500" : "bg-slate-300"
                  }`}
                >
                  <div className={`absolute top-0.5 w-4 h-4 rounded-full bg-white shadow transition-transform ${
                    (workflows[wf.id] ?? true) ? "translate-x-5" : "translate-x-0.5"
                  }`} />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Demo Simulation Buttons */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6">
        <div className="font-bold text-slate-900 mb-2">Demo Simulation Triggers</div>
        <p className="text-sm text-slate-400 mb-5">Run these to populate the system for a client demonstration.</p>

        {simResult && (
          <div className={`mb-4 flex items-center gap-2 px-4 py-3 rounded-xl text-sm font-medium border ${simResult.ok ? "bg-emerald-50 border-emerald-200 text-emerald-700" : "bg-red-50 border-red-200 text-red-700"}`}>
            {simResult.ok ? <CheckCircle2 className="w-4 h-4" /> : <AlertCircle className="w-4 h-4" />}
            <strong>{simResult.action}:</strong> {simResult.msg}
          </div>
        )}

        <div className="flex flex-wrap gap-3">
          {[
            { action: "simulate_appointment", label: "Simulate New Appointment", color: "bg-sky-600 hover:bg-sky-700" },
            { action: "simulate_enquiry", label: "Simulate New Enquiry", color: "bg-violet-600 hover:bg-violet-700" },
            { action: "simulate_reminder", label: "Simulate 24h Reminder", color: "bg-amber-500 hover:bg-amber-600" },
            { action: "simulate_cancellation", label: "Simulate Cancellation", color: "bg-red-600 hover:bg-red-700" },
            { action: "simulate_reschedule", label: "Simulate Reschedule", color: "bg-emerald-600 hover:bg-emerald-700" },
          ].map((btn) => (
            <button
              key={btn.action}
              onClick={() => runSimulation(btn.action, btn.label)}
              disabled={!!simulating}
              className={`flex items-center gap-2 px-4 py-2.5 ${btn.color} text-white font-semibold rounded-xl text-sm transition disabled:opacity-50`}
            >
              {simulating === btn.action ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Play className="w-4 h-4" />
              )}
              {btn.label}
            </button>
          ))}
        </div>
      </div>

      {/* Automation Log */}
      <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
          <div className="font-bold text-slate-900">Automation Log</div>
          <span className="text-xs text-slate-400">{logs.length} entries</span>
        </div>

        {loading ? (
          <div className="p-8 text-center">
            <Loader2 className="w-6 h-6 text-sky-500 animate-spin mx-auto" />
          </div>
        ) : logs.length === 0 ? (
          <div className="p-8 text-center text-slate-400 text-sm">No automation events yet. Run a simulation to see events.</div>
        ) : (
          <div className="divide-y divide-slate-50 max-h-[500px] overflow-y-auto">
            {logs.map((log) => (
              <div key={log.id} className="px-5 py-3.5 flex items-start gap-3.5 hover:bg-slate-50/50 transition">
                <div className="text-xs text-slate-400 whitespace-nowrap pt-0.5 w-20 shrink-0">
                  {formatTime(log.timestamp)}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex flex-wrap items-center gap-2 mb-0.5">
                    <span className="font-semibold text-slate-800 text-sm">{log.workflow}</span>
                    <span className="text-slate-300">·</span>
                    <span className="text-xs text-slate-500">{log.trigger}</span>
                  </div>
                  <div className="text-xs text-slate-500 font-medium">{log.action}</div>
                  <div className="text-xs text-slate-400 mt-0.5 truncate">{log.result}</div>
                </div>
                <div className="shrink-0">
                  <span className={`inline-flex px-2 py-0.5 text-[10px] font-bold rounded-full border ${STATUS_COLORS[log.status] || "bg-slate-100 text-slate-500"}`}>
                    {log.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
