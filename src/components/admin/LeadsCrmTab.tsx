import React, { useState } from 'react';
import { useClinic } from '../../context/ClinicContext';
import { Lead, LeadStatus } from '../../types/clinic';
import { 
  Users, 
  Search, 
  Filter, 
  Phone, 
  Mail, 
  Clock, 
  X, 
  CheckCircle2, 
  Calendar, 
  MessageSquare, 
  UserCheck, 
  Send,
  AlertCircle,
  FileText
} from 'lucide-react';

export const LeadsCrmTab: React.FC = () => {
  const { 
    leads, 
    updateLeadStatus, 
    assignLead, 
    addLeadNote, 
    openBookingModal, 
    selectedLead, 
    setSelectedLead 
  } = useClinic();

  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'All' | LeadStatus>('All');
  const [newNoteText, setNewNoteText] = useState('');
  const [actionNotice, setActionNotice] = useState<string | null>(null);

  const filteredLeads = leads.filter(l => {
    const matchesSearch = 
      l.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      l.phone.includes(searchQuery) ||
      l.service.toLowerCase().includes(searchQuery.toLowerCase()) ||
      l.inquirySummary.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'All' || l.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const getStatusBadge = (status: LeadStatus) => {
    switch (status) {
      case 'Booked':
        return 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30';
      case 'Qualified':
        return 'bg-cyan-500/15 text-cyan-300 border-cyan-500/30';
      case 'Booking Requested':
        return 'bg-blue-500/15 text-blue-300 border-blue-500/30';
      case 'Follow-up':
        return 'bg-amber-500/15 text-amber-300 border-amber-500/30';
      case 'Human Handoff':
        return 'bg-rose-500/15 text-rose-300 border-rose-500/30';
      case 'Contacted':
        return 'bg-purple-500/15 text-purple-300 border-purple-500/30';
      default:
        return 'bg-slate-700/50 text-slate-300 border-slate-600';
    }
  };

  const handleAddNote = (leadId: string) => {
    if (!newNoteText.trim()) return;
    addLeadNote(leadId, newNoteText);
    setNewNoteText('');
    setActionNotice('Staff note added to lead timeline.');
    setTimeout(() => setActionNotice(null), 3000);
  };

  const triggerLeadAction = (msg: string) => {
    setActionNotice(msg);
    setTimeout(() => setActionNotice(null), 3000);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-white tracking-tight">Leads & Patient CRM</h2>
          <p className="text-xs text-slate-400">
            Track inquiries, qualification states, automated follow-ups, and human handoffs.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs font-mono text-cyan-400 bg-slate-900 border border-slate-800 px-3 py-1.5 rounded-xl">
            {leads.length} Total Captured Inquiries
          </span>
        </div>
      </div>

      {actionNotice && (
        <div className="p-3 bg-blue-950/80 border border-blue-500/40 rounded-xl text-xs text-blue-200 flex items-center justify-between animate-in fade-in">
          <span>✓ {actionNotice}</span>
          <button onClick={() => setActionNotice(null)} className="text-blue-300 hover:text-white">
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* Search & Filter Ribbon */}
      <div className="flex flex-col sm:flex-row gap-3 items-center justify-between bg-[#111827] p-3 rounded-2xl border border-slate-800">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-slate-500 absolute left-3 top-2.5" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search patient, phone, query..."
            className="w-full bg-slate-900 border border-slate-700/80 rounded-xl pl-9 pr-3 py-1.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400"
          />
        </div>

        <div className="flex items-center gap-1.5 w-full sm:w-auto overflow-x-auto pb-1 sm:pb-0">
          {(['All', 'New', 'Qualified', 'Booking Requested', 'Booked', 'Follow-up', 'Human Handoff'] as const).map((st) => (
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

      {/* Main CRM Table */}
      <div className="bg-[#111827] border border-slate-800 rounded-2xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-900/90 text-slate-400 font-mono uppercase text-[10px] tracking-wider border-b border-slate-800">
              <tr>
                <th className="py-3 px-4">Name</th>
                <th className="py-3 px-4">Phone</th>
                <th className="py-3 px-4">Patient Type</th>
                <th className="py-3 px-4">Service</th>
                <th className="py-3 px-4">Source</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4">Created</th>
                <th className="py-3 px-4">Assigned To</th>
                <th className="py-3 px-4 text-right">View</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/80">
              {filteredLeads.map((lead) => (
                <tr
                  key={lead.id}
                  onClick={() => setSelectedLead(lead)}
                  className="hover:bg-slate-800/50 transition-colors cursor-pointer group"
                >
                  <td className="py-3.5 px-4 font-bold text-white group-hover:text-cyan-300 transition-colors">
                    {lead.name}
                  </td>
                  <td className="py-3.5 px-4 font-mono text-slate-300">
                    {lead.phone}
                  </td>
                  <td className="py-3.5 px-4 capitalize text-slate-300">
                    {lead.patientType}
                  </td>
                  <td className="py-3.5 px-4 text-slate-200">
                    {lead.service}
                  </td>
                  <td className="py-3.5 px-4 text-slate-400 text-[11px]">
                    {lead.source}
                  </td>
                  <td className="py-3.5 px-4">
                    <span className={`inline-block px-2.5 py-0.5 rounded text-[11px] font-medium border ${getStatusBadge(lead.status)}`}>
                      {lead.status}
                    </span>
                  </td>
                  <td className="py-3.5 px-4 text-slate-400 font-mono text-[11px]">
                    {lead.created}
                  </td>
                  <td className="py-3.5 px-4 text-slate-300">
                    {lead.assignedTo}
                  </td>
                  <td className="py-3.5 px-4 text-right">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedLead(lead);
                      }}
                      className="text-xs text-cyan-400 hover:text-cyan-300 font-semibold px-2 py-1 rounded bg-slate-900 border border-slate-700/80"
                    >
                      Detail
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Detailed Side Panel / Modal Drawer when a lead is clicked */}
      {selectedLead && (
        <div className="fixed inset-0 z-50 flex items-center justify-end bg-black/80 backdrop-blur-sm animate-in fade-in">
          <div className="bg-[#111827] border-l border-slate-800 w-full max-w-xl h-full shadow-2xl overflow-y-auto flex flex-col p-6 space-y-6">
            
            {/* Drawer Header */}
            <div className="flex items-center justify-between pb-4 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <Users className="w-5 h-5 text-cyan-400" />
                <h3 className="text-lg font-bold text-white">Lead Details & Journey</h3>
              </div>
              <button
                onClick={() => setSelectedLead(null)}
                className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Profile Overview */}
            <div className="space-y-3">
              <div className="flex items-start justify-between">
                <div>
                  <h4 className="text-xl font-bold text-white">{selectedLead.name}</h4>
                  <div className="text-xs text-slate-400 mt-0.5">
                    {selectedLead.phone} · {selectedLead.email}
                  </div>
                </div>
                <span className={`px-2.5 py-1 rounded-md text-xs font-semibold border ${getStatusBadge(selectedLead.status)}`}>
                  {selectedLead.status}
                </span>
              </div>

              <div className="grid grid-cols-2 gap-3 p-3.5 bg-slate-900 rounded-xl border border-slate-800 text-xs">
                <div>
                  <span className="text-slate-500 block">Patient Type:</span>
                  <span className="font-semibold text-white capitalize">{selectedLead.patientType} Patient</span>
                </div>
                <div>
                  <span className="text-slate-500 block">Service Interest:</span>
                  <span className="font-semibold text-white">{selectedLead.service}</span>
                </div>
                <div>
                  <span className="text-slate-500 block">Lead Source:</span>
                  <span className="font-semibold text-cyan-300">{selectedLead.source}</span>
                </div>
                <div>
                  <span className="text-slate-500 block">Assigned Staff:</span>
                  <span className="font-semibold text-white">{selectedLead.assignedTo}</span>
                </div>
              </div>
            </div>

            {/* Conversation Summary */}
            <div className="p-3.5 bg-slate-900/80 border border-slate-800 rounded-xl text-xs space-y-1">
              <div className="text-slate-400 font-semibold">Inquiry Summary:</div>
              <div className="text-slate-200 leading-relaxed italic">
                "{selectedLead.inquirySummary}"
              </div>
              {selectedLead.notes && (
                <div className="pt-2 mt-2 border-t border-slate-800 text-slate-300">
                  <strong className="text-slate-400">Notes:</strong> {selectedLead.notes}
                </div>
              )}
            </div>

            {/* Actions Toolbar Required by Prompt:
                Buttons: Book, Assign, Contact, Mark as Qualified, Mark as Follow-up */}
            <div className="space-y-2">
              <div className="text-xs font-mono uppercase tracking-wider text-slate-400 font-semibold">
                Lead Actions:
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                <button
                  onClick={() => {
                    openBookingModal();
                    triggerLeadAction(`Opening booking flow for ${selectedLead.name}`);
                  }}
                  className="py-2 px-3 rounded-lg text-xs font-semibold text-white bg-blue-600 hover:bg-blue-500 transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <Calendar className="w-3.5 h-3.5" />
                  <span>Book</span>
                </button>

                <button
                  onClick={() => {
                    assignLead(selectedLead.id, 'Dr. Ananya Mehta');
                    triggerLeadAction(`Assigned ${selectedLead.name} to Dr. Ananya Mehta`);
                  }}
                  className="py-2 px-3 rounded-lg text-xs font-semibold text-slate-200 bg-slate-800 hover:bg-slate-700 border border-slate-700 transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <UserCheck className="w-3.5 h-3.5" />
                  <span>Assign</span>
                </button>

                <button
                  onClick={() => {
                    triggerLeadAction(`WhatsApp message window opened for ${selectedLead.phone}`);
                  }}
                  className="py-2 px-3 rounded-lg text-xs font-semibold text-slate-200 bg-slate-800 hover:bg-slate-700 border border-slate-700 transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <MessageSquare className="w-3.5 h-3.5 text-cyan-400" />
                  <span>Contact</span>
                </button>

                <button
                  onClick={() => {
                    updateLeadStatus(selectedLead.id, 'Qualified');
                    triggerLeadAction(`Marked ${selectedLead.name} as Qualified`);
                  }}
                  className="py-2 px-3 rounded-lg text-xs font-semibold text-cyan-300 bg-cyan-950/60 hover:bg-cyan-900/60 border border-cyan-800/70 transition-colors cursor-pointer"
                >
                  <span>Mark Qualified</span>
                </button>

                <button
                  onClick={() => {
                    updateLeadStatus(selectedLead.id, 'Follow-up');
                    triggerLeadAction(`Marked ${selectedLead.name} for Automated Follow-up`);
                  }}
                  className="py-2 px-3 rounded-lg text-xs font-semibold text-amber-300 bg-amber-950/60 hover:bg-amber-900/60 border border-amber-800/70 transition-colors cursor-pointer"
                >
                  <span>Mark Follow-up</span>
                </button>

                <button
                  onClick={() => {
                    updateLeadStatus(selectedLead.id, 'Human Handoff');
                    triggerLeadAction(`Escalated ${selectedLead.name} to Human Handoff`);
                  }}
                  className="py-2 px-3 rounded-lg text-xs font-semibold text-rose-300 bg-rose-950/60 hover:bg-rose-900/60 border border-rose-800/70 transition-colors cursor-pointer"
                >
                  <span>Human Handoff</span>
                </button>
              </div>
            </div>

            {/* Interaction Timeline */}
            <div className="space-y-3 flex-1">
              <div className="text-xs font-mono uppercase tracking-wider text-slate-400 font-semibold">
                Interaction Timeline
              </div>
              <div className="space-y-3 relative border-l-2 border-slate-800 ml-2 pl-4">
                {selectedLead.timeline.map((evt) => (
                  <div key={evt.id} className="relative text-xs">
                    <span className="w-2.5 h-2.5 rounded-full bg-cyan-400 absolute -left-[21px] top-1 ring-4 ring-[#111827]" />
                    <div className="flex items-center justify-between text-slate-400 font-mono text-[10px]">
                      <span className="text-white font-semibold">{evt.title}</span>
                      <span>{evt.timestamp}</span>
                    </div>
                    <p className="text-slate-300 text-xs mt-1 leading-relaxed">
                      {evt.detail}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            {/* Add Staff Note */}
            <div className="pt-3 border-t border-slate-800">
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Add Staff Follow-up Note:
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={newNoteText}
                  onChange={(e) => setNewNoteText(e.target.value)}
                  placeholder="e.g. Spoke with patient. Prefers afternoon laser slot."
                  className="flex-1 bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-cyan-400"
                />
                <button
                  onClick={() => handleAddNote(selectedLead.id)}
                  className="px-3.5 py-2 rounded-xl text-xs font-semibold text-white bg-blue-600 hover:bg-blue-500 transition-colors cursor-pointer shrink-0"
                >
                  Save Note
                </button>
              </div>
            </div>

          </div>
        </div>
      )}

    </div>
  );
};
