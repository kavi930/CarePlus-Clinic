import React, { useState } from 'react';
import { useClinic } from '../../context/ClinicContext';
import { NotificationItem } from '../../types/clinic';
import { 
  BellRing, 
  CheckCheck, 
  Calendar, 
  Phone, 
  Clock, 
  User, 
  MessageSquare, 
  AlertTriangle, 
  CheckCircle2, 
  Eye,
  Filter
} from 'lucide-react';

export const NotificationCenterTab: React.FC = () => {
  const { 
    notifications, 
    markNotificationRead, 
    markAllNotificationsRead, 
    setAdminTab, 
    setSelectedAppointment, 
    appointments 
  } = useClinic();

  const [filterType, setFilterType] = useState<'all' | 'unread' | 'appointment' | 'handoff'>('all');
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const filtered = notifications.filter(n => {
    if (filterType === 'unread') return !n.read;
    if (filterType === 'appointment') return n.type === 'appointment';
    if (filterType === 'handoff') return n.type === 'handoff';
    return true;
  });

  const handleViewAppointment = (notif: NotificationItem) => {
    markNotificationRead(notif.id);
    const matched = appointments.find(a => a.id === notif.appointmentId || a.patientName === notif.patientName);
    if (matched) {
      setSelectedAppointment(matched);
      setAdminTab('appointments');
    } else {
      setAdminTab('appointments');
    }
  };

  const handleContactPatient = (notif: NotificationItem) => {
    markNotificationRead(notif.id);
    setToastMessage(`Opening direct WhatsApp/SMS message channel for ${notif.patientName} (${notif.phone || '+1 555-000-0000'}).`);
    setTimeout(() => setToastMessage(null), 3500);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-white tracking-tight">Staff Notification Center</h2>
          <p className="text-xs text-slate-400">
            Real-time alerts triggered by patient bookings, inquiries, reminders, and safety escalations.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={markAllNotificationsRead}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-300 hover:text-white bg-slate-900 border border-slate-700/80 rounded-xl transition-colors cursor-pointer"
          >
            <CheckCheck className="w-3.5 h-3.5 text-cyan-400" />
            <span>Mark All as Read</span>
          </button>
        </div>
      </div>

      {toastMessage && (
        <div className="p-3 bg-cyan-950/80 border border-cyan-500/40 rounded-xl text-xs text-cyan-200 flex items-center justify-between animate-in fade-in">
          <span>✓ {toastMessage}</span>
          <button onClick={() => setToastMessage(null)} className="text-cyan-400 hover:text-white">✕</button>
        </div>
      )}

      {/* Filter Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-800 pb-3">
        {(['all', 'unread', 'appointment', 'handoff'] as const).map((ft) => (
          <button
            key={ft}
            onClick={() => setFilterType(ft)}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium capitalize transition-colors cursor-pointer ${
              filterType === ft
                ? 'bg-blue-600 text-white font-semibold'
                : 'text-slate-400 hover:text-white hover:bg-slate-800'
            }`}
          >
            {ft === 'all' ? 'All Alerts' : ft}
          </button>
        ))}
      </div>

      {/* Notifications List */}
      <div className="space-y-3">
        {filtered.length > 0 ? (
          filtered.map((n) => {
            return (
              <div
                key={n.id}
                className={`p-4 sm:p-5 rounded-2xl border transition-all ${
                  n.read
                    ? 'bg-[#111827]/70 border-slate-800 text-slate-300'
                    : 'bg-[#111827] border-blue-500/40 ring-1 ring-blue-500/30 text-white shadow-md'
                }`}
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="flex items-start gap-3">
                    <div
                      className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${
                        n.type === 'handoff'
                          ? 'bg-rose-500/20 text-rose-400'
                          : n.type === 'appointment'
                          ? 'bg-blue-500/20 text-cyan-300'
                          : 'bg-emerald-500/20 text-emerald-400'
                      }`}
                    >
                      {n.type === 'handoff' ? (
                        <AlertTriangle className="w-4 h-4" />
                      ) : (
                        <BellRing className="w-4 h-4" />
                      )}
                    </div>

                    <div>
                      <div className="flex items-center gap-2">
                        <h4 className="text-sm font-bold text-white">{n.title}</h4>
                        {!n.read && (
                          <span className="w-2 h-2 rounded-full bg-cyan-400 inline-block" />
                        )}
                      </div>
                      <p className="text-xs text-slate-300 mt-1 leading-relaxed max-w-2xl">
                        {n.description}
                      </p>

                      <div className="flex flex-wrap items-center gap-3 mt-2 text-[11px] text-slate-400 font-mono">
                        <span>Patient: <strong className="text-slate-200">{n.patientName}</strong></span>
                        <span>·</span>
                        <span>Service: {n.service}</span>
                        <span>·</span>
                        <span>{n.date} at {n.time}</span>
                        <span>·</span>
                        <span className="text-slate-500">{n.createdAt}</span>
                      </div>
                    </div>
                  </div>

                  {/* Notification Action Buttons (Prompt Requirement: View Appointment, Contact Patient) */}
                  <div className="flex sm:flex-col gap-2 shrink-0 pt-2 sm:pt-0">
                    <button
                      onClick={() => handleViewAppointment(n)}
                      className="flex-1 sm:flex-none px-3 py-1.5 rounded-lg text-xs font-semibold text-white bg-blue-600 hover:bg-blue-500 transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
                    >
                      <Eye className="w-3.5 h-3.5" />
                      <span>View Appointment</span>
                    </button>

                    <button
                      onClick={() => handleContactPatient(n)}
                      className="flex-1 sm:flex-none px-3 py-1.5 rounded-lg text-xs font-semibold text-slate-300 bg-slate-900 hover:bg-slate-800 border border-slate-700 transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
                    >
                      <Phone className="w-3.5 h-3.5 text-cyan-400" />
                      <span>Contact Patient</span>
                    </button>
                  </div>
                </div>
              </div>
            );
          })
        ) : (
          <div className="py-16 text-center text-slate-500 text-xs bg-[#111827] rounded-2xl border border-slate-800">
            No notifications in this filter view.
          </div>
        )}
      </div>
    </div>
  );
};
