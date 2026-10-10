import React, { useState } from 'react';
import { useClinic } from '../../context/ClinicContext';
import { X, Sparkles, CheckCircle2, ArrowRight, Building2, User, Phone, Mail, HelpCircle } from 'lucide-react';

export const AuditModal: React.FC = () => {
  const { isAuditModalOpen, closeAuditModal, submitAuditRequest } = useClinic();

  const [clinicName, setClinicName] = useState('');
  const [yourName, setYourName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [monthlyInquiries, setMonthlyInquiries] = useState('50 - 150 inquiries/mo');
  const [currentBookingMethod, setCurrentBookingMethod] = useState('Manual phone calls & WhatsApp');
  const [notes, setNotes] = useState('');
  const [isSubmitted, setIsSubmitted] = useState(false);

  if (!isAuditModalOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    submitAuditRequest({
      clinicName: clinicName || 'Premier Health Clinic',
      contactName: yourName || 'Dr. Prospective Owner',
      phone: phone || '+1 (555) 789-0123',
      email: email || 'owner@clinicdemo.com',
      monthlyInquiries,
      currentBookingMethod,
      notes,
    });
    setIsSubmitted(true);
  };

  const handleClose = () => {
    setIsSubmitted(false);
    closeAuditModal();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-[#111827] border border-slate-800 w-full max-w-lg rounded-2xl shadow-2xl overflow-hidden flex flex-col">
        
        {/* Modal Header */}
        <div className="px-6 py-4 border-b border-slate-800 flex items-center justify-between bg-slate-900/60">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-cyan-400" />
            <span className="text-sm font-bold text-white tracking-tight">FREE AUTOMATION AUDIT</span>
          </div>
          <button
            onClick={handleClose}
            className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body or Success State */}
        <div className="p-6">
          {!isSubmitted ? (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <h3 className="text-xl font-bold text-white">
                  See how this system could be customized for your clinic.
                </h3>
                <p className="text-xs text-slate-300 mt-1">
                  We'll review your current patient inquiry drop-off rate, estimate recovered appointment volume, and prepare a custom live demo.
                </p>
              </div>

              <div className="space-y-3 pt-2">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Clinic Name *
                  </label>
                  <div className="relative">
                    <Building2 className="w-4 h-4 text-slate-500 absolute left-3 top-3" />
                    <input
                      type="text"
                      required
                      value={clinicName}
                      onChange={(e) => setClinicName(e.target.value)}
                      placeholder="e.g. Metro Dermatology Center"
                      className="w-full bg-slate-900 border border-slate-700 rounded-xl pl-9 pr-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">
                      Your Name *
                    </label>
                    <div className="relative">
                      <User className="w-4 h-4 text-slate-500 absolute left-3 top-3" />
                      <input
                        type="text"
                        required
                        value={yourName}
                        onChange={(e) => setYourName(e.target.value)}
                        placeholder="Dr. / Clinic Owner"
                        className="w-full bg-slate-900 border border-slate-700 rounded-xl pl-9 pr-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">
                      Phone / WhatsApp *
                    </label>
                    <div className="relative">
                      <Phone className="w-4 h-4 text-slate-500 absolute left-3 top-3" />
                      <input
                        type="tel"
                        required
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        placeholder="+1 (555) 000-0000"
                        className="w-full bg-slate-900 border border-slate-700 rounded-xl pl-9 pr-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400"
                      />
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Email Address *
                  </label>
                  <div className="relative">
                    <Mail className="w-4 h-4 text-slate-500 absolute left-3 top-3" />
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="contact@yourclinic.com"
                      className="w-full bg-slate-900 border border-slate-700 rounded-xl pl-9 pr-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">
                      Monthly Inquiries
                    </label>
                    <select
                      value={monthlyInquiries}
                      onChange={(e) => setMonthlyInquiries(e.target.value)}
                      className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-cyan-400"
                    >
                      <option value="Under 50 inquiries/mo">Under 50 inquiries/mo</option>
                      <option value="50 - 150 inquiries/mo">50 - 150 inquiries/mo</option>
                      <option value="150 - 400 inquiries/mo">150 - 400 inquiries/mo</option>
                      <option value="400+ inquiries/mo">400+ inquiries/mo</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">
                      Current Booking Method
                    </label>
                    <select
                      value={currentBookingMethod}
                      onChange={(e) => setCurrentBookingMethod(e.target.value)}
                      className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-cyan-400"
                    >
                      <option value="Manual phone calls & WhatsApp">Manual phone calls & WhatsApp</option>
                      <option value="Generic website contact form">Generic website contact form</option>
                      <option value="Basic online calendar link">Basic online calendar link</option>
                      <option value="Pen and paper / Reception only">Pen and paper / Reception only</option>
                    </select>
                  </div>
                </div>
              </div>

              <div className="pt-3">
                <button
                  type="submit"
                  className="w-full py-3 px-4 rounded-xl text-xs font-bold text-white bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-500 hover:to-cyan-500 shadow-xl shadow-blue-600/30 transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-95"
                >
                  <span>Book Your Free Automation Audit</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
                <div className="text-[11px] text-slate-400 text-center mt-2">
                  No obligation · 15-minute consultation · Confidential
                </div>
              </div>
            </form>
          ) : (
            <div className="text-center py-6 space-y-4">
              <div className="w-14 h-14 rounded-full bg-emerald-500/20 text-emerald-400 mx-auto flex items-center justify-center border border-emerald-500/30">
                <CheckCircle2 className="w-8 h-8" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-white">
                  Audit Request Received!
                </h3>
                <p className="text-xs text-slate-300 mt-2 max-w-sm mx-auto leading-relaxed">
                  Thank you, {yourName || 'Doctor'}. We have received your clinic audit details for <strong className="text-white">{clinicName || 'your clinic'}</strong>.
                </p>
              </div>

              <div className="p-3.5 bg-slate-900 border border-slate-800 rounded-xl text-xs text-slate-300 text-left max-w-md mx-auto space-y-1">
                <div className="text-slate-400 text-[11px]">Logged in Demo Sales Pipeline:</div>
                <div className="text-white font-medium">Inquiry Volume: {monthlyInquiries}</div>
                <div className="text-slate-400">Current Method: {currentBookingMethod}</div>
                <div className="text-cyan-300 text-[11px] pt-1">
                  Alert dispatched to demonstration team dashboard.
                </div>
              </div>

              <div className="pt-2">
                <button
                  onClick={handleClose}
                  className="px-6 py-2.5 rounded-xl text-xs font-semibold text-white bg-blue-600 hover:bg-blue-500 transition-colors cursor-pointer"
                >
                  Done
                </button>
              </div>
            </div>
          )}
        </div>

      </div>
    </div>
  );
};
