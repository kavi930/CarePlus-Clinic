import React, { useState } from 'react';
import { useClinic } from '../../context/ClinicContext';
import { 
  Settings as SettingsIcon, 
  Save, 
  ShieldCheck, 
  CheckCircle2, 
  Bell, 
  Building, 
  Calendar, 
  FileSpreadsheet, 
  Mail, 
  Link2, 
  Unlink, 
  Play, 
  Copy, 
  Check, 
  AlertCircle,
  ExternalLink
} from 'lucide-react';
import { getGoogleOAuthUrl, disconnectGoogleAccount, runServerDiagnostics } from '../../services/apiClient';

export const SettingsTab: React.FC = () => {
  const { settings, updateSettings, serverStatus, refreshServerStatus, isRealIntegrationActive } = useClinic();

  const [clinicName, setClinicName] = useState(settings.clinicName);
  const [specialty, setSpecialty] = useState(settings.specialty);
  const [hours, setHours] = useState(settings.hours);
  const [phone, setPhone] = useState(settings.phone);
  const [email, setEmail] = useState(settings.email);
  const [address, setAddress] = useState(settings.address);
  const [consultationFee, setConsultationFee] = useState(settings.consultationFee);
  const [aiSafetyEnabled, setAiSafetyEnabled] = useState(settings.aiSafetyEnabled);
  const [allowDirectBooking, setAllowDirectBooking] = useState(settings.allowDirectBooking);
  const [autoWhatsAppReminder, setAutoWhatsAppReminder] = useState(settings.autoWhatsAppReminder);
  const [humanHandoffAlertPhone, setHumanHandoffAlertPhone] = useState(settings.humanHandoffAlertPhone);
  const [webhookUrl, setWebhookUrl] = useState(settings.webhookUrl);

  const [savedSuccess, setSavedSuccess] = useState(false);
  const [isConnectingOAuth, setIsConnectingOAuth] = useState(false);
  const [oauthError, setOauthError] = useState<string | null>(null);
  const [copiedUri, setCopiedUri] = useState(false);

  // Diagnostics runner
  const [diagnosticsRunning, setDiagnosticsRunning] = useState(false);
  const [diagnosticResult, setDiagnosticResult] = useState<any>(null);

  const redirectUri = serverStatus?.config?.redirectUri || 'http://localhost:3000/api/auth/google/callback';

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    updateSettings({
      clinicName,
      specialty,
      hours,
      phone,
      email,
      address,
      consultationFee,
      aiSafetyEnabled,
      allowDirectBooking,
      autoWhatsAppReminder,
      humanHandoffAlertPhone,
      webhookUrl,
    });
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 3000);
  };

  const handleConnectGoogle = async () => {
    setOauthError(null);
    setIsConnectingOAuth(true);
    try {
      const url = await getGoogleOAuthUrl('/admin#settings');
      if (url) {
        window.location.href = url;
      }
    } catch (err: any) {
      setOauthError(err.message || 'Failed to start Google OAuth flow');
      setIsConnectingOAuth(false);
    }
  };

  const handleDisconnectGoogle = async () => {
    const confirmed = window.confirm('Disconnect Google account? CarePlus will safely return to simulated demo mode.');
    if (!confirmed) return;
    await disconnectGoogleAccount();
    await refreshServerStatus();
  };

  const handleCopyUri = () => {
    navigator.clipboard.writeText(redirectUri);
    setCopiedUri(true);
    setTimeout(() => setCopiedUri(false), 2500);
  };

  const handleRunDiagnostics = async () => {
    setDiagnosticsRunning(true);
    setDiagnosticResult(null);
    try {
      const res = await runServerDiagnostics();
      setDiagnosticResult(res);
    } catch (err: any) {
      setDiagnosticResult({ ok: false, error: err.message });
    } finally {
      setDiagnosticsRunning(false);
    }
  };

  return (
    <form onSubmit={handleSave} className="space-y-6 max-w-4xl">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-white tracking-tight">Clinic & Automation Settings</h2>
          <p className="text-xs text-slate-400">
            Configure Google Workspace credentials, AI administrative guardrails, and clinic hours.
          </p>
        </div>

        <button
          type="submit"
          className="inline-flex items-center gap-2 px-4 py-2 text-xs font-bold text-white bg-blue-600 hover:bg-blue-500 rounded-xl transition-colors cursor-pointer shadow-md"
        >
          <Save className="w-3.5 h-3.5" />
          <span>Save Settings</span>
        </button>
      </div>

      {savedSuccess && (
        <div className="p-3 bg-emerald-950/80 border border-emerald-500/40 rounded-xl text-xs text-emerald-200 flex items-center gap-2 animate-in fade-in">
          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          <span>Clinic settings successfully updated across all modules!</span>
        </div>
      )}

      {/* --- SECTION 1: GOOGLE WORKSPACE OAUTH & INTEGRATIONS (STAGE 3 & 4) --- */}
      <div className="bg-[#111827] border border-slate-800 rounded-2xl p-6 space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-800">
          <div>
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <Link2 className="w-4 h-4 text-cyan-400" />
              <span>Google Workspace Integration (Calendar · Sheets · Gmail)</span>
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Secure server-side OAuth2 connection. Privileged API keys and client secrets are never exposed to browser storage.
            </p>
          </div>

          <div>
            {isRealIntegrationActive ? (
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-500/15 text-emerald-300 border border-emerald-500/30">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                Live Google Integration Active
              </span>
            ) : (
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-amber-500/15 text-amber-300 border border-amber-500/30">
                <span className="w-2 h-2 rounded-full bg-amber-400" />
                Simulated Demo Mode Active
              </span>
            )}
          </div>
        </div>

        {/* OAuth Error Alert */}
        {oauthError && (
          <div className="p-3 bg-rose-950/80 border border-rose-500/40 rounded-xl text-xs text-rose-200 flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
            <span>{oauthError}</span>
          </div>
        )}

        {/* Connection Action Box */}
        <div className="p-4 bg-slate-900/90 rounded-xl border border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="text-xs font-semibold text-white">
              {isRealIntegrationActive ? (
                <span>Connected Google Account: <strong className="text-cyan-300">{serverStatus?.auth?.connectedEmail || 'Authenticated'}</strong></span>
              ) : (
                <span>Clinic Google Authorization: <strong className="text-slate-400">Not Connected (Demo Mode)</strong></span>
              )}
            </div>
            <p className="text-[11px] text-slate-400 mt-1 max-w-xl leading-relaxed">
              {isRealIntegrationActive
                ? 'CarePlus writes real appointment events to your Google Calendar, logs rows to Google Sheets, and sends confirmation emails from your connected Gmail address.'
                : 'Appointments and notifications currently run in simulated mode without requiring Google credentials. Connect your Google account below to activate real synchronization.'}
            </p>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            {isRealIntegrationActive ? (
              <button
                type="button"
                onClick={handleDisconnectGoogle}
                className="px-3.5 py-2 text-xs font-semibold text-rose-300 bg-rose-950/60 hover:bg-rose-900/60 border border-rose-800/80 rounded-xl transition-colors cursor-pointer flex items-center gap-1.5"
              >
                <Unlink className="w-3.5 h-3.5" />
                <span>Disconnect</span>
              </button>
            ) : (
              <button
                type="button"
                onClick={handleConnectGoogle}
                disabled={isConnectingOAuth}
                className="px-4 py-2.5 text-xs font-bold text-white bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-500 hover:to-cyan-500 rounded-xl transition-all cursor-pointer shadow-lg shadow-blue-600/20 flex items-center gap-2 disabled:opacity-50"
              >
                <Link2 className="w-4 h-4" />
                <span>{isConnectingOAuth ? 'Opening OAuth...' : 'Connect Google Account'}</span>
              </button>
            )}

            <button
              type="button"
              onClick={handleRunDiagnostics}
              disabled={diagnosticsRunning}
              className="px-3.5 py-2 text-xs font-semibold text-slate-300 bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-xl transition-colors cursor-pointer flex items-center gap-1.5 disabled:opacity-50"
            >
              <Play className={`w-3.5 h-3.5 ${diagnosticsRunning ? 'animate-spin' : ''}`} />
              <span>Test Integration</span>
            </button>
          </div>
        </div>

        {/* Diagnostics Output Panel if Run */}
        {diagnosticResult && (
          <div className="p-3.5 bg-black/60 rounded-xl border border-slate-800 text-xs font-mono space-y-1">
            <div className="text-slate-400 font-bold uppercase text-[10px]">Integration Diagnostic Output:</div>
            {diagnosticResult.authorized ? (
              <>
                <div className="text-emerald-400">✓ Google OAuth: Authorized ({serverStatus?.auth?.connectedEmail || 'Active'})</div>
                <div className={diagnosticResult.results?.calendar?.success ? 'text-emerald-400' : 'text-amber-400'}>
                  • Calendar Query: {diagnosticResult.results?.calendar?.success ? `Verified (Target: ${diagnosticResult.results.calendar.calendarId})` : `Failed (${diagnosticResult.results?.calendar?.error || 'unverified'})`}
                </div>
                <div className={diagnosticResult.results?.sheets?.success ? 'text-emerald-400' : 'text-slate-400'}>
                  • Sheets Check: {diagnosticResult.results?.sheets?.success ? `Connected ("${diagnosticResult.results.sheets.title}")` : `${diagnosticResult.results?.sheets?.error || 'Simulated Mode'}`}
                </div>
              </>
            ) : (
              <div className="text-amber-400">
                Notice: Google OAuth is not yet authorized. The application is operating safely in simulated demo mode.
              </div>
            )}
          </div>
        )}

        {/* Google Cloud Console Setup Instructions */}
        <div className="p-4 bg-slate-900/60 rounded-xl border border-slate-800 text-xs space-y-3">
          <div className="flex items-center justify-between">
            <span className="font-bold text-slate-200 flex items-center gap-1.5">
              <ExternalLink className="w-3.5 h-3.5 text-cyan-400" />
              <span>Google Cloud Console Credentials Setup Guide</span>
            </span>
          </div>

          <p className="text-slate-400 text-[11px] leading-relaxed">
            In your Google Cloud Console under <strong>APIs & Services &gt; Credentials &gt; OAuth 2.0 Client IDs</strong>, ensure this exact Authorized Redirect URI is added:
          </p>

          <div className="flex items-center gap-2 bg-black/80 border border-slate-800 rounded-lg p-2 font-mono text-cyan-300 text-[11px]">
            <span className="flex-1 truncate">{redirectUri}</span>
            <button
              type="button"
              onClick={handleCopyUri}
              className="text-slate-400 hover:text-white p-1 rounded hover:bg-slate-800 cursor-pointer"
              title="Copy redirect URI"
            >
              {copiedUri ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
            </button>
          </div>

          <div className="text-[11px] text-slate-500 space-y-0.5">
            <div>• Least-privilege scopes requested: <code>calendar.events</code>, <code>spreadsheets</code>, <code>gmail.send</code>, <code>userinfo.email</code>.</div>
            <div>• Zero client passwords stored. Refresh tokens managed securely on the server.</div>
          </div>
        </div>
      </div>

      {/* --- SECTION 2: CLINIC PROFILE & HOURS --- */}
      <div className="bg-[#111827] border border-slate-800 rounded-2xl p-6 space-y-4">
        <h3 className="text-sm font-bold text-white flex items-center gap-2">
          <Building className="w-4 h-4 text-cyan-400" />
          <span>Clinic Profile & Information</span>
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs text-slate-400 font-medium mb-1">Clinic Name</label>
            <input
              type="text"
              value={clinicName}
              onChange={(e) => setClinicName(e.target.value)}
              className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-cyan-400"
            />
          </div>

          <div>
            <label className="block text-xs text-slate-400 font-medium mb-1">Specialty</label>
            <input
              type="text"
              value={specialty}
              onChange={(e) => setSpecialty(e.target.value)}
              className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-cyan-400"
            />
          </div>

          <div>
            <label className="block text-xs text-slate-400 font-medium mb-1">Operating Hours</label>
            <input
              type="text"
              value={hours}
              onChange={(e) => setHours(e.target.value)}
              className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-cyan-400"
            />
          </div>

          <div>
            <label className="block text-xs text-slate-400 font-medium mb-1">Standard Consultation Fee</label>
            <input
              type="text"
              value={consultationFee}
              onChange={(e) => setConsultationFee(e.target.value)}
              className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-cyan-400"
            />
          </div>

          <div className="sm:col-span-2">
            <label className="block text-xs text-slate-400 font-medium mb-1">Clinic Address & Parking Details</label>
            <input
              type="text"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-cyan-400"
            />
          </div>
        </div>
      </div>

      {/* --- SECTION 3: AI SAFETY & ADMINISTRATIVE GUARDRAILS (STAGE 5) --- */}
      <div className="bg-[#111827] border border-slate-800 rounded-2xl p-6 space-y-4">
        <h3 className="text-sm font-bold text-white flex items-center gap-2">
          <ShieldCheck className="w-4 h-4 text-emerald-400" />
          <span>AI Assistant Administrative Safety Policies</span>
        </h3>

        <div className="p-3.5 bg-slate-900/80 rounded-xl border border-slate-800 text-xs text-slate-300 space-y-1 leading-relaxed">
          <div className="text-cyan-300 font-semibold">Strict Anti-Medical-Advice Guardrails Active:</div>
          <div>• Zero medical diagnoses or symptom interpretations allowed.</div>
          <div>• Zero medication prescriptions or dosage suggestions.</div>
          <div>• Automatic escalation to human front-desk on clinical inquiries.</div>
          <div>• Mandatory emergency guidance on life-threatening symptom keywords.</div>
        </div>

        <div className="space-y-3 pt-2">
          <label className="flex items-center gap-3 cursor-pointer">
            <input
              type="checkbox"
              checked={aiSafetyEnabled}
              onChange={(e) => setAiSafetyEnabled(e.target.checked)}
              className="w-4 h-4 rounded text-blue-600 bg-slate-900 border-slate-700"
            />
            <span className="text-xs text-slate-200">
              Enforce strict clinical handoff guardrail (recommended for healthcare clinics)
            </span>
          </label>

          <label className="flex items-center gap-3 cursor-pointer">
            <input
              type="checkbox"
              checked={allowDirectBooking}
              onChange={(e) => setAllowDirectBooking(e.target.checked)}
              className="w-4 h-4 rounded text-blue-600 bg-slate-900 border-slate-700"
            />
            <span className="text-xs text-slate-200">
              Allow patients to directly confirm available slots without receptionist telephone ping-pong
            </span>
          </label>
        </div>
      </div>

      {/* --- SECTION 4: NOTIFICATIONS & STAFF ROUTING --- */}
      <div className="bg-[#111827] border border-slate-800 rounded-2xl p-6 space-y-4">
        <h3 className="text-sm font-bold text-white flex items-center gap-2">
          <Bell className="w-4 h-4 text-blue-400" />
          <span>Notifications & Human Handoff Routing</span>
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs text-slate-400 font-medium mb-1">Human Handoff Reception Phone</label>
            <input
              type="text"
              value={humanHandoffAlertPhone}
              onChange={(e) => setHumanHandoffAlertPhone(e.target.value)}
              className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-cyan-400"
            />
          </div>

          <div>
            <label className="block text-xs text-slate-400 font-medium mb-1">Staff Notification Email (for Gmail alerts)</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-cyan-400"
            />
          </div>
        </div>

        <div className="pt-2">
          <label className="flex items-center gap-3 cursor-pointer">
            <input
              type="checkbox"
              checked={autoWhatsAppReminder}
              onChange={(e) => setAutoWhatsAppReminder(e.target.checked)}
              className="w-4 h-4 rounded text-blue-600 bg-slate-900 border-slate-700"
            />
            <span className="text-xs text-slate-200">
              Automatically dispatch 24h & 2h reminders to booked patients
            </span>
          </label>
        </div>
      </div>

      {/* Save Button */}
      <div className="flex justify-end pt-2">
        <button
          type="submit"
          className="px-6 py-2.5 text-xs font-bold text-white bg-blue-600 hover:bg-blue-500 rounded-xl transition-colors cursor-pointer shadow-md"
        >
          Save All Changes
        </button>
      </div>
    </form>
  );
};
