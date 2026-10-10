import React from 'react';
import { useClinic } from '../../context/ClinicContext';
import { Sparkles, Calendar, LayoutDashboard } from 'lucide-react';

export const Navbar: React.FC = () => {
  const { currentView, setCurrentView, openBookingModal, notifications, isRealIntegrationActive, serverStatus } = useClinic();
  const unreadCount = notifications.filter(n => !n.read).length;

  return (
    <header className="sticky top-0 z-40 w-full border-b border-slate-800/80 bg-[#080B12]/90 backdrop-blur-md">
      {/* Dynamic Integration & Demo Mode Announcement Strip */}
      <div className={`border-b px-4 py-1.5 text-center text-xs flex items-center justify-center gap-2 ${
        isRealIntegrationActive 
          ? 'bg-emerald-950/60 border-emerald-500/30 text-emerald-200' 
          : 'bg-gradient-to-r from-blue-950/60 via-cyan-950/40 to-blue-950/60 border-cyan-500/20 text-cyan-200/90'
      }`}>
        <span className={`font-semibold px-2 py-0.5 rounded text-[11px] tracking-wider uppercase ${
          isRealIntegrationActive
            ? 'bg-emerald-500/20 text-emerald-300'
            : 'bg-cyan-500/20 text-cyan-300'
        }`}>
          {isRealIntegrationActive ? 'Live Google Mode' : 'DEMO MODE'}
        </span>
        <span className="hidden sm:inline">
          {isRealIntegrationActive 
            ? `Connected to ${serverStatus?.auth?.connectedEmail || 'Google Workspace'}. Appointments write directly to Google Calendar & Sheets.`
            : 'Demonstration system for clinic owners. Inquiries & bookings simulate live administrative workflows.'}
        </span>
        <span className="sm:hidden">
          {isRealIntegrationActive ? 'Google Workspace Connected' : 'Simulated Demo Mode'}
        </span>
      </div>

      {/* Strict 3-Zone Top Navigation Contract */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
        {/* Zone 1: Brand wordmark (single text element) */}
        <div className="flex items-center gap-3">
          <button 
            onClick={() => setCurrentView('landing')}
            className="text-left group cursor-pointer focus:outline-none"
          >
            <span className="text-xl sm:text-2xl font-extrabold tracking-tight text-white flex items-center gap-1.5">
              CAREPLUS
              <span className="w-2 h-2 rounded-full bg-cyan-400 group-hover:scale-125 transition-transform duration-200"></span>
            </span>
          </button>
        </div>

        {/* Zone 2: 4–6 text navigation links */}
        {currentView === 'landing' ? (
          <nav className="hidden md:flex items-center gap-8 text-sm font-medium text-slate-300">
            <a 
              href="#how-it-works" 
              className="hover:text-white transition-colors duration-150"
            >
              How It Works
            </a>
            <a 
              href="#features" 
              className="hover:text-white transition-colors duration-150"
            >
              Features
            </a>
            <a 
              href="#for-clinics" 
              className="hover:text-white transition-colors duration-150"
            >
              For Clinics
            </a>
            <a 
              href="#workflow" 
              className="hover:text-white transition-colors duration-150"
            >
              Automation Flow
            </a>
            <a 
              href="#faq" 
              className="hover:text-white transition-colors duration-150"
            >
              FAQ
            </a>
          </nav>
        ) : (
          <div className="hidden md:flex items-center gap-3 text-sm text-slate-400">
            <span className="text-white font-medium">CarePlus Dermatology & Skin Care</span>
            <span>·</span>
            <span>Staff Portal</span>
          </div>
        )}

        {/* Zone 3: 1–2 primary actions */}
        <div className="flex items-center gap-3">
          {currentView === 'landing' ? (
            <>
              <button
                onClick={() => setCurrentView('admin')}
                className="relative inline-flex items-center gap-2 px-3.5 py-2 text-xs font-semibold text-slate-200 bg-slate-900/90 hover:bg-slate-800 border border-slate-700/80 rounded-xl transition-all duration-150 whitespace-nowrap cursor-pointer"
                title="View Clinic Staff & Automation Dashboard"
              >
                <LayoutDashboard className="w-3.5 h-3.5 text-cyan-400" />
                <span>Admin Dashboard</span>
                {unreadCount > 0 && (
                  <span className="inline-flex items-center justify-center w-5 h-5 text-[11px] font-bold text-white bg-blue-600 rounded-full tabular-nums">
                    {unreadCount}
                  </span>
                )}
              </button>

              <button
                onClick={openBookingModal}
                className="inline-flex items-center gap-2 px-4 py-2 text-xs font-semibold text-white bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-500 hover:to-cyan-500 rounded-xl shadow-lg shadow-blue-500/20 transition-all duration-150 whitespace-nowrap cursor-pointer active:scale-95"
              >
                <Calendar className="w-3.5 h-3.5" />
                <span>Book an Appointment</span>
              </button>
            </>
          ) : (
            <>
              <button
                onClick={() => setCurrentView('landing')}
                className="inline-flex items-center gap-2 px-3.5 py-2 text-xs font-semibold text-slate-200 bg-slate-900 hover:bg-slate-800 border border-slate-700 rounded-xl transition-all duration-150 whitespace-nowrap cursor-pointer"
              >
                <span>View Patient Experience</span>
              </button>

              <button
                onClick={openBookingModal}
                className="inline-flex items-center gap-2 px-4 py-2 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-500 rounded-xl transition-all duration-150 whitespace-nowrap cursor-pointer"
              >
                <Calendar className="w-3.5 h-3.5" />
                <span>+ New Booking</span>
              </button>
            </>
          )}
        </div>
      </div>
    </header>
  );
};
