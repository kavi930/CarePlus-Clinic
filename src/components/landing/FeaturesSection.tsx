import React from 'react';
import { useClinic } from '../../context/ClinicContext';
import { 
  Bot, 
  UserPlus, 
  CalendarCheck, 
  CheckCircle, 
  BellRing, 
  Users, 
  Database, 
  Headphones, 
  ArrowRight 
} from 'lucide-react';

export const FeaturesSection: React.FC = () => {
  const { openBookingModal, openChat, setCurrentView, setAdminTab } = useClinic();

  const features = [
    {
      title: 'AI Appointment Assistant',
      desc: 'Answers approved administrative questions (hours, location, fees, consultation details) and effortlessly guides patients toward booking.',
      icon: Bot,
      actionText: 'Try AI Chat',
      action: openChat,
      color: 'text-cyan-400',
    },
    {
      title: 'Lead Capture',
      desc: 'Collects verified patient name, phone number, patient type (New or Existing), service interest, and preferred booking schedule.',
      icon: UserPlus,
      actionText: 'View CRM Leads',
      action: () => {
        setCurrentView('admin');
        setAdminTab('leads');
      },
      color: 'text-blue-400',
    },
    {
      title: 'Appointment Booking',
      desc: 'Allows prospective patients to select an available demo appointment slot in seconds without manual receptionist scheduling.',
      icon: CalendarCheck,
      actionText: 'Open Booking Flow',
      action: openBookingModal,
      color: 'text-emerald-400',
    },
    {
      title: 'Automated Confirmation',
      desc: 'Dispatches instant booking confirmations via WhatsApp and Email, complete with clinic address, instructions, and calendar invites.',
      icon: CheckCircle,
      actionText: 'Test Booking',
      action: openBookingModal,
      color: 'text-cyan-300',
    },
    {
      title: 'Appointment Reminders',
      desc: 'Demonstrates automated 24-hour and 2-hour pre-appointment reminders that dramatically slash costly clinic no-show rates.',
      icon: BellRing,
      actionText: 'View Follow-ups',
      action: () => {
        setCurrentView('admin');
        setAdminTab('followups');
      },
      color: 'text-amber-400',
    },
    {
      title: 'Staff Notifications',
      desc: 'Sends instant alerts to clinic reception and assigned doctors the moment an appointment is requested or scheduled.',
      icon: Users,
      actionText: 'Notification Center',
      action: () => {
        setCurrentView('admin');
        setAdminTab('notifications');
      },
      color: 'text-purple-400',
    },
    {
      title: 'CRM / Lead Management',
      desc: 'Centralized database tracking every inquiry, qualification state, conversation summary, and patient booking journey.',
      icon: Database,
      actionText: 'Explore CRM',
      action: () => {
        setCurrentView('admin');
        setAdminTab('leads');
      },
      color: 'text-blue-500',
    },
    {
      title: 'Human Handoff',
      desc: 'Strict safety guardrails immediately hand off clinical, sensitive, or complex medical questions to clinic staff with instant notification.',
      icon: Headphones,
      actionText: 'Test Handoff',
      action: openChat,
      color: 'text-rose-400',
    },
  ];

  return (
    <section id="features" className="py-20 bg-[#080B12] border-t border-slate-800/60 relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="max-w-3xl mx-auto text-center mb-16">
          <div className="text-xs font-semibold uppercase tracking-wider text-cyan-400 mb-2">
            Engineered For Modern Practices
          </div>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
            Comprehensive Clinic Appointment Automation
          </h2>
          <p className="mt-4 text-base text-slate-300 leading-relaxed">
            Everything required to turn missed inbound messages into confirmed, qualified clinic visits while keeping human staff in total control.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {features.map((feat, index) => {
            const Icon = feat.icon;
            return (
              <div
                key={index}
                className="bg-[#111827] border border-slate-800/90 hover:border-slate-700 rounded-2xl p-6 transition-all duration-150 flex flex-col justify-between group"
              >
                <div>
                  <div className="w-10 h-10 rounded-xl bg-slate-800/80 border border-slate-700/60 flex items-center justify-center mb-4 group-hover:scale-105 transition-transform">
                    <Icon className={`w-5 h-5 ${feat.color}`} />
                  </div>
                  <h3 className="text-base font-bold text-white mb-2 group-hover:text-cyan-300 transition-colors">
                    {feat.title}
                  </h3>
                  <p className="text-xs text-slate-400 leading-relaxed">
                    {feat.desc}
                  </p>
                </div>

                <div className="mt-6 pt-4 border-t border-slate-800/80">
                  <button
                    onClick={feat.action}
                    className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-300 hover:text-cyan-400 transition-colors cursor-pointer"
                  >
                    <span>{feat.actionText}</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};
