import React from 'react';
import { useClinic } from '../../context/ClinicContext';
import { ShieldCheck, Calendar, Sparkles } from 'lucide-react';

export const Footer: React.FC = () => {
  const { setCurrentView, setAdminTab, openBookingModal, openAuditModal } = useClinic();

  return (
    <footer className="border-t border-slate-800 bg-[#06080E] text-slate-400 text-xs py-14">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 pb-12 border-b border-slate-800/80">
          
          {/* Col 1: Wordmark & Purpose */}
          <div className="space-y-3 md:col-span-1">
            <span className="text-xl font-extrabold text-white tracking-tight flex items-center gap-1.5">
              CAREPLUS
              <span className="w-2 h-2 rounded-full bg-cyan-400" />
            </span>
            <p className="text-xs text-slate-400 leading-relaxed">
              Smart appointment automation system for modern clinics, dental centers, and healthcare practices.
            </p>
            <div className="pt-2 text-[11px] text-slate-500 flex items-center gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
              <span>Strict Non-Clinical Administrative Assistant</span>
            </div>
          </div>

          {/* Col 2: Product & Architecture */}
          <div>
            <h4 className="text-xs font-mono font-bold text-slate-200 uppercase tracking-wider mb-3">
              Automation Pipeline
            </h4>
            <ul className="space-y-2">
              <li><a href="#how-it-works" className="hover:text-white transition-colors">Multi-Channel Ingestion</a></li>
              <li><a href="#workflow" className="hover:text-white transition-colors">AI Qualification</a></li>
              <li><a href="#features" className="hover:text-white transition-colors">Demo Calendar Booking</a></li>
              <li><a href="#for-clinics" className="hover:text-white transition-colors">WhatsApp Reminders</a></li>
              <li><a href="#how-it-works" className="hover:text-white transition-colors">Human Handoff Protocol</a></li>
            </ul>
          </div>

          {/* Col 3: For Healthcare Practices */}
          <div>
            <h4 className="text-xs font-mono font-bold text-slate-200 uppercase tracking-wider mb-3">
              Practice Solutions
            </h4>
            <ul className="space-y-2">
              <li><a href="#for-clinics" className="hover:text-white transition-colors">Dermatology Clinics</a></li>
              <li><a href="#for-clinics" className="hover:text-white transition-colors">Dental Practices</a></li>
              <li><a href="#for-clinics" className="hover:text-white transition-colors">Physiotherapy & Rehab</a></li>
              <li><a href="#for-clinics" className="hover:text-white transition-colors">Diagnostic Imaging</a></li>
              <li><a href="#faq" className="hover:text-white transition-colors">Frequently Asked Questions</a></li>
            </ul>
          </div>

          {/* Col 4: Sales Demo Portal */}
          <div>
            <h4 className="text-xs font-mono font-bold text-slate-200 uppercase tracking-wider mb-3">
              Demo Experience
            </h4>
            <ul className="space-y-2.5">
              <li>
                <button
                  onClick={() => {
                    setCurrentView('admin');
                    setAdminTab('overview');
                  }}
                  className="text-cyan-400 hover:text-cyan-300 font-semibold cursor-pointer"
                >
                  → Open Clinic Admin Portal
                </button>
              </li>
              <li>
                <button
                  onClick={openBookingModal}
                  className="hover:text-white transition-colors cursor-pointer"
                >
                  Test Patient Booking Modal
                </button>
              </li>
              <li>
                <button
                  onClick={openAuditModal}
                  className="text-amber-400 hover:text-amber-300 font-medium cursor-pointer"
                >
                  Book Free Automation Audit
                </button>
              </li>
            </ul>
          </div>

        </div>

        {/* Bottom Disclaimer */}
        <div className="pt-8 flex flex-col md:flex-row items-center justify-between gap-4 text-[11px] text-slate-500">
          <p>
            © {new Date().getFullYear()} CarePlus Clinic Automation. Demo SaaS System. All patient inquiries and availability shown are fictional for demonstration purposes.
          </p>
          <div className="flex items-center gap-4">
            <span>Fast responses</span>
            <span>·</span>
            <span>Easy booking</span>
            <span>·</span>
            <span>Human staff support</span>
          </div>
        </div>
      </div>
    </footer>
  );
};
