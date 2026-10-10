import React, { useState } from 'react';
import { useClinic } from '../../context/ClinicContext';
import { Appointment, AppointmentStatus } from '../../types/clinic';
import { 
  Calendar as CalendarIcon, 
  Clock, 
  Search, 
  Filter, 
  Plus, 
  User, 
  Phone, 
  Mail, 
  CheckCircle, 
  X, 
  Send,
  MessageSquare,
  AlertCircle
} from 'lucide-react';

export const AppointmentsTab: React.FC = () => {
  const { 
    appointments, 
    updateAppointmentStatus, 
    openBookingModal, 
    selectedAppointment, 
    setSelectedAppointment 
  } = useClinic();

  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'All' | AppointmentStatus>('All');
  const [reminderSentAlert, setReminderSentAlert] = useState<string | null>(null);

  // Filtered appointments
  const filteredAppointments = appointments.filter(apt => {
    const matchesSearch = 
      apt.patientName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      apt.patientPhone.includes(searchQuery) ||
      apt.service.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'All' || apt.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const handleSendReminder = (apt: Appointment) => {
    setReminderSentAlert(`Automated WhatsApp reminder sent to ${apt.patientName} (${apt.patientPhone})!`);
    setTimeout(() => setReminderSentAlert(null), 3500);
  };

  const getStatusBadge = (status: AppointmentStatus) => {
    switch (status) {
      case 'Confirmed':
        return 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30';
      case 'Pending':
        return 'bg-amber-500/15 text-amber-300 border-amber-500/30';
      case 'Completed':
        return 'bg-blue-500/15 text-blue-300 border-blue-500/30';
      case 'Cancelled':
        return 'bg-rose-500/15 text-rose-300 border-rose-500/30';
      default:
        return 'bg-slate-700 text-slate-300 border-slate-600';
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Controls Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-white tracking-tight">Appointments Management</h2>
          <p className="text-xs text-slate-400">
            View, reschedule, and manage automated patient bookings.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={openBookingModal}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-500 rounded-xl transition-colors cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Book Appointment</span>
          </button>
        </div>
      </div>

      {/* Reminder Notification Banner if sent */}
      {reminderSentAlert && (
        <div className="p-3 bg-emerald-950/80 border border-emerald-500/40 rounded-xl text-xs text-emerald-200 flex items-center justify-between animate-in fade-in">
          <div className="flex items-center gap-2">
            <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>{reminderSentAlert}</span>
          </div>
          <button 
            onClick={() => setReminderSentAlert(null)}
            className="text-emerald-400 hover:text-white p-1"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* Search & Filter Toolbar */}
      <div className="flex flex-col sm:flex-row gap-3 items-center justify-between bg-[#111827] p-3 rounded-2xl border border-slate-800">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-slate-500 absolute left-3 top-2.5" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search patient, phone, or service..."
            className="w-full bg-slate-900 border border-slate-700/80 rounded-xl pl-9 pr-3 py-1.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400"
          />
        </div>

        <div className="flex items-center gap-1.5 w-full sm:w-auto overflow-x-auto pb-1 sm:pb-0">
          {(['All', 'Confirmed', 'Pending', 'Completed', 'Cancelled'] as const).map((st) => (
            <button
              key={st}
              onClick={() => setStatusFilter(st)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors cursor-pointer whitespace-nowrap ${
                statusFilter === st
                  ? 'bg-blue-600 text-white font-semibold'
                  : 'bg-slate-900/80 text-slate-400 hover:text-white border border-slate-800'
              }`}
            >
              {st}
            </button>
          ))}
        </div>
      </div>

      {/* Appointments Data Table */}
      <div className="bg-[#111827] border border-slate-800 rounded-2xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-900/90 text-slate-400 font-mono uppercase text-[10px] tracking-wider border-b border-slate-800">
              <tr>
                <th className="py-3 px-4">Patient</th>
                <th className="py-3 px-4">Service</th>
                <th className="py-3 px-4">Date & Time</th>
                <th className="py-3 px-4">Assigned Doctor</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/80">
              {filteredAppointments.length > 0 ? (
                filteredAppointments.map((apt) => (
                  <tr
                    key={apt.id}
                    onClick={() => setSelectedAppointment(apt)}
                    className="hover:bg-slate-800/50 transition-colors cursor-pointer group"
                  >
                    <td className="py-3.5 px-4">
                      <div className="font-bold text-white group-hover:text-cyan-300 transition-colors">
                        {apt.patientName}
                      </div>
                      <div className="text-[11px] text-slate-400 flex items-center gap-1 mt-0.5">
                        <span>{apt.patientPhone}</span>
                        <span>·</span>
                        <span className="capitalize">{apt.patientType} patient</span>
                      </div>
                    </td>

                    <td className="py-3.5 px-4 font-medium text-slate-200">
                      {apt.service}
                    </td>

                    <td className="py-3.5 px-4">
                      <div className="font-semibold text-white font-mono">
                        {apt.time}
                      </div>
                      <div className="text-[11px] text-slate-400">
                        {apt.date}
                      </div>
                    </td>

                    <td className="py-3.5 px-4 text-slate-300">
                      {apt.doctorName}
                    </td>

                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <span className={`inline-block px-2.5 py-1 rounded-md text-[11px] font-medium border ${getStatusBadge(apt.status)}`}>
                          {apt.status}
                        </span>
                        {apt.isSimulated === false ? (
                          <span className="px-1.5 py-0.5 rounded text-[10px] font-mono bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                            Calendar Synced
                          </span>
                        ) : (
                          <span className="px-1.5 py-0.5 rounded text-[10px] font-mono bg-slate-800 text-slate-400">
                            Demo Mode
                          </span>
                        )}
                      </div>
                    </td>

                    <td className="py-3.5 px-4 text-right">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedAppointment(apt);
                        }}
                        className="text-xs text-cyan-400 hover:text-cyan-300 font-semibold px-2.5 py-1 rounded-lg bg-slate-900 border border-slate-700/80 hover:border-slate-600 transition-colors"
                      >
                        Details
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-slate-500 text-xs">
                    No appointments found matching current filters.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Appointment Detail Modal / Side Panel */}
      {selectedAppointment && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in">
          <div className="bg-[#111827] border border-slate-800 w-full max-w-lg rounded-2xl shadow-2xl overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-800 flex items-center justify-between bg-slate-900/60">
              <div className="flex items-center gap-2">
                <CalendarIcon className="w-4 h-4 text-cyan-400" />
                <span className="text-sm font-bold text-white">Appointment Details</span>
              </div>
              <button
                onClick={() => setSelectedAppointment(null)}
                className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-4">
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="text-lg font-bold text-white">{selectedAppointment.patientName}</h3>
                  <div className="text-xs text-slate-400 mt-0.5">
                    {selectedAppointment.patientPhone} · {selectedAppointment.patientEmail}
                  </div>
                </div>
                <span className={`px-2.5 py-1 rounded-md text-xs font-semibold border ${getStatusBadge(selectedAppointment.status)}`}>
                  {selectedAppointment.status}
                </span>
              </div>

              <div className="grid grid-cols-2 gap-3 p-3.5 bg-slate-900 rounded-xl border border-slate-800 text-xs">
                <div>
                  <div className="text-slate-500">Service:</div>
                  <div className="font-semibold text-white mt-0.5">{selectedAppointment.service}</div>
                </div>
                <div>
                  <div className="text-slate-500">Doctor:</div>
                  <div className="font-semibold text-white mt-0.5">{selectedAppointment.doctorName}</div>
                </div>
                <div>
                  <div className="text-slate-500">Date:</div>
                  <div className="font-semibold text-white mt-0.5">{selectedAppointment.date}</div>
                </div>
                <div>
                  <div className="text-slate-500">Time:</div>
                  <div className="font-semibold text-white font-mono mt-0.5">{selectedAppointment.time}</div>
                </div>
              </div>

              {selectedAppointment.notes && (
                <div className="p-3 bg-slate-900/60 border border-slate-800/80 rounded-xl text-xs">
                  <span className="text-slate-400 block mb-1">Visit Notes:</span>
                  <span className="text-slate-300">{selectedAppointment.notes}</span>
                </div>
              )}

              {/* Integration Status Notice */}
              <div className="p-3 bg-slate-900/80 rounded-xl border border-slate-800 text-xs flex items-center justify-between">
                <div>
                  <span className="text-slate-400 block text-[11px]">Integration Status:</span>
                  <span className="font-semibold text-white">
                    {selectedAppointment.isSimulated === false ? 'Synchronized with Live Google Calendar & Sheets' : 'Simulated Demo Record'}
                  </span>
                </div>
                {selectedAppointment.calendarLink && (
                  <a
                    href={selectedAppointment.calendarLink}
                    target="_blank"
                    rel="noreferrer"
                    className="text-xs text-blue-400 hover:text-blue-300 underline font-medium"
                  >
                    Open Google Event ↗
                  </a>
                )}
              </div>

              {/* Status Updater */}
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  Update Appointment Status:
                </label>
                <div className="grid grid-cols-4 gap-2">
                  {(['Confirmed', 'Pending', 'Completed', 'Cancelled'] as AppointmentStatus[]).map((st) => (
                    <button
                      key={st}
                      onClick={() => updateAppointmentStatus(selectedAppointment.id, st)}
                      className={`py-1.5 px-2 rounded-lg text-xs font-medium border text-center transition-colors cursor-pointer ${
                        selectedAppointment.status === st
                          ? 'bg-blue-600 text-white border-blue-500 font-bold'
                          : 'bg-slate-900 text-slate-400 hover:text-white border-slate-800'
                      }`}
                    >
                      {st}
                    </button>
                  ))}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="pt-3 border-t border-slate-800 flex flex-col sm:flex-row gap-2">
                <button
                  onClick={() => handleSendReminder(selectedAppointment)}
                  className="flex-1 py-2.5 px-3 rounded-xl text-xs font-semibold text-white bg-slate-800 hover:bg-slate-700 border border-slate-700 transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <MessageSquare className="w-3.5 h-3.5 text-cyan-400" />
                  <span>Send WhatsApp Reminder</span>
                </button>
                <button
                  onClick={() => setSelectedAppointment(null)}
                  className="py-2.5 px-4 rounded-xl text-xs font-semibold text-slate-300 bg-slate-900 hover:bg-slate-800 border border-slate-800 transition-colors cursor-pointer"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
