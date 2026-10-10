import React, { useState } from 'react';
import { useClinic } from '../../context/ClinicContext';
import { 
  Clock, 
  MessageCircleOff, 
  CalendarX2, 
  Bot, 
  CheckCircle, 
  ArrowRight, 
  ChevronRight, 
  Sparkles, 
  Users, 
  CalendarCheck, 
  BellRing, 
  UserCheck 
} from 'lucide-react';

export const ProblemSolutionSection: React.FC = () => {
  const { openBookingModal, openChat, setCurrentView, setAdminTab } = useClinic();
  const [activeStepDetail, setActiveStepDetail] = useState<number>(1);

  const workflowSteps = [
    {
      step: 1,
      title: 'Inquiry',
      tagline: 'Multi-Channel Entry',
      icon: MessageCircleOff,
      detail: 'Patient asks via Website, WhatsApp, or Instagram: "What is your consultation fee?" or "Is the doctor available tomorrow?"',
      metric: '0-second wait time',
    },
    {
      step: 2,
      title: 'AI Assistant',
      tagline: 'Administrative Guardrails',
      icon: Bot,
      detail: 'Responds instantly with verified clinic pricing, clinic hours, and directions. Strictly withholds medical diagnoses or medication recommendations.',
      metric: '100% policy compliance',
    },
    {
      step: 3,
      title: 'Qualification',
      tagline: 'Patient Classification',
      icon: UserCheck,
      detail: 'Identifies whether patient is New vs. Returning and isolates the specific service (Skin Consultation, Follow-up, General, Specialist).',
      metric: 'Structured CRM lead created',
    },
    {
      step: 4,
      title: 'Available Appointment',
      tagline: 'Calendar Sync',
      icon: CalendarCheck,
      detail: 'Presents verified demo time slots (10:00 AM, 11:30 AM, 2:00 PM, 4:00 PM). Patient selects a slot in 1 click.',
      metric: 'Eliminates phone tag',
    },
    {
      step: 5,
      title: 'Confirmation',
      tagline: 'Multi-Channel Confirmation',
      icon: CheckCircle,
      detail: 'Instant WhatsApp message & Email sent with arrival guidance, clinic address, and calendar invite file.',
      metric: 'Instant reassurance',
    },
    {
      step: 6,
      title: 'Reminder',
      tagline: 'Automated Sequences',
      icon: BellRing,
      detail: 'Scheduled WhatsApp reminders dispatched 24 hours and 2 hours before the appointment. Slashes clinic no-shows.',
      metric: 'No-shows dropped to <6%',
    },
    {
      step: 7,
      title: 'Clinic Staff',
      tagline: 'Reception Alignment',
      icon: Users,
      detail: 'Clinic reception and doctors receive real-time dashboard notifications with full patient context, inquiry history, and notes.',
      metric: 'Full team visibility',
    },
  ];

  return (
    <section id="how-it-works" className="py-20 bg-[#080B12] relative border-t border-slate-800/60">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* --- PROBLEM SECTION --- */}
        <div className="max-w-4xl mx-auto text-center mb-16">
          <div className="text-xs font-semibold uppercase tracking-wider text-rose-400 mb-2">
            The Bottleneck in Healthcare Clinics
          </div>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
            Patients shouldn't have to wait for a reply.
          </h2>
          <p className="mt-4 text-base text-slate-300 leading-relaxed max-w-2xl mx-auto">
            When prospective patients reach out with routine administrative questions, delays cost appointments.
          </p>

          {/* Sample real questions speech bubbles */}
          <div className="mt-6 flex flex-wrap justify-center gap-2.5">
            {[
              '"Is the doctor available tomorrow?"',
              '"What is the consultation fee?"',
              '"Can I book at 5 PM?"',
              '"Where is the clinic located?"',
            ].map((q, idx) => (
              <span
                key={idx}
                className="px-3.5 py-1.5 rounded-full bg-slate-900 border border-slate-700/80 text-xs text-slate-300 font-medium shadow-sm"
              >
                {q}
              </span>
            ))}
          </div>

          <p className="mt-5 text-sm text-slate-400 max-w-2xl mx-auto">
            The system automates routine administrative conversations while allowing staff to handle situations that require human judgment.
          </p>
        </div>

        {/* 3 Problem Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-24">
          <div className="bg-[#111827] border border-slate-800 rounded-2xl p-6 hover:border-slate-700 transition-colors">
            <div className="w-10 h-10 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400 flex items-center justify-center mb-4">
              <MessageCircleOff className="w-5 h-5" />
            </div>
            <h3 className="text-lg font-bold text-white mb-2">Missed inquiries</h3>
            <p className="text-sm text-slate-400 leading-relaxed">
              Patients inquire during evenings, lunch breaks, or weekends. An unanswered message often leads them directly to a competitor's clinic.
            </p>
          </div>

          <div className="bg-[#111827] border border-slate-800 rounded-2xl p-6 hover:border-slate-700 transition-colors">
            <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-400 flex items-center justify-center mb-4">
              <Clock className="w-5 h-5" />
            </div>
            <h3 className="text-lg font-bold text-white mb-2">Manual follow-up</h3>
            <p className="text-sm text-slate-400 leading-relaxed">
              Front-desk staff spend hours repeating fee structures, clinic timings, and parking directions instead of focusing on in-clinic patients.
            </p>
          </div>

          <div className="bg-[#111827] border border-slate-800 rounded-2xl p-6 hover:border-slate-700 transition-colors">
            <div className="w-10 h-10 rounded-xl bg-blue-500/10 border border-blue-500/20 text-blue-400 flex items-center justify-center mb-4">
              <CalendarX2 className="w-5 h-5" />
            </div>
            <h3 className="text-lg font-bold text-white mb-2">Booking friction</h3>
            <p className="text-sm text-slate-400 leading-relaxed">
              Scheduling via phone calls or delayed messages requires 4–5 back-and-forth exchanges. Patients drop off before picking a slot.
            </p>
          </div>
        </div>

        {/* --- SOLUTION SECTION --- */}
        <div id="workflow" className="scroll-mt-24 pt-6">
          <div className="max-w-4xl mx-auto text-center mb-12">
            <div className="text-xs font-semibold uppercase tracking-wider text-cyan-400 mb-2">
              The Automated Solution
            </div>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
              From Patient Inquiry to Appointment
            </h2>
            <p className="mt-4 text-base text-slate-300 max-w-2xl mx-auto">
              A unified pipeline that handles inquiry, answers administrative FAQs, captures details, schedules the visit, and alerts your team.
            </p>
            <p className="mt-1 text-xs text-slate-500">
              Click any step below to inspect its automation mechanics:
            </p>
          </div>

          {/* Clickable 7-Step Workflow Row */}
          <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-3 mb-8">
            {workflowSteps.map((step) => {
              const Icon = step.icon;
              const isSelected = activeStepDetail === step.step;
              return (
                <button
                  key={step.step}
                  onClick={() => setActiveStepDetail(step.step)}
                  className={`p-3.5 rounded-xl border text-left transition-all cursor-pointer flex flex-col justify-between ${
                    isSelected
                      ? 'bg-blue-600/15 border-blue-500 ring-1 ring-blue-500 text-white shadow-lg'
                      : 'bg-[#111827] border-slate-800 text-slate-300 hover:border-slate-700 hover:bg-slate-800/60'
                  }`}
                >
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className={`text-[11px] font-mono font-bold ${isSelected ? 'text-cyan-400' : 'text-slate-500'}`}>
                        0{step.step}
                      </span>
                      <Icon className={`w-4 h-4 ${isSelected ? 'text-cyan-400' : 'text-slate-400'}`} />
                    </div>
                    <div className="font-semibold text-xs text-white leading-tight">
                      {step.title}
                    </div>
                  </div>
                  <div className="mt-3 pt-2 border-t border-slate-800/80 text-[10px] text-slate-400 truncate">
                    {step.tagline}
                  </div>
                </button>
              );
            })}
          </div>

          {/* Active Step Detailed Showcase Panel */}
          {(() => {
            const current = workflowSteps.find(s => s.step === activeStepDetail) || workflowSteps[0];
            const StepIcon = current.icon;
            return (
              <div className="bg-[#111827] border border-slate-800 rounded-2xl p-6 md:p-8 relative overflow-hidden shadow-xl">
                <div className="absolute top-0 right-0 w-80 h-80 bg-blue-600/5 blur-3xl pointer-events-none rounded-full" />
                
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 pb-6 border-b border-slate-800">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-xl bg-blue-600/20 border border-blue-500/30 flex items-center justify-center text-cyan-400 shrink-0">
                      <StepIcon className="w-6 h-6" />
                    </div>
                    <div>
                      <div className="text-xs font-mono text-cyan-400 uppercase tracking-wider">
                        Step 0{current.step} Workflow Action
                      </div>
                      <h3 className="text-xl font-bold text-white mt-0.5">
                        {current.title} — {current.tagline}
                      </h3>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <span className="text-xs font-mono text-slate-400 bg-slate-900 border border-slate-700/80 px-3 py-1.5 rounded-lg">
                      Outcome: <strong className="text-emerald-400">{current.metric}</strong>
                    </span>
                  </div>
                </div>

                <div className="pt-6 grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
                  <div className="md:col-span-8">
                    <h4 className="text-sm font-semibold text-slate-200 mb-2">How this works for your clinic:</h4>
                    <p className="text-sm text-slate-300 leading-relaxed">
                      {current.detail}
                    </p>
                    <div className="mt-4 flex flex-wrap gap-2 text-xs text-slate-400">
                      <span className="bg-slate-900 border border-slate-800 px-2.5 py-1 rounded">24/7 Active Automation</span>
                      <span className="bg-slate-900 border border-slate-800 px-2.5 py-1 rounded">Multi-Channel WhatsApp/Web</span>
                      <span className="bg-slate-900 border border-slate-800 px-2.5 py-1 rounded">Instant Staff Visibility</span>
                    </div>
                  </div>

                  <div className="md:col-span-4 flex flex-col gap-2">
                    <button
                      onClick={openBookingModal}
                      className="w-full py-2.5 px-4 rounded-xl text-xs font-semibold text-white bg-blue-600 hover:bg-blue-500 transition-colors flex items-center justify-center gap-2 cursor-pointer"
                    >
                      <span>Test Patient Booking</span>
                      <ChevronRight className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => {
                        setCurrentView('admin');
                        setAdminTab('workflow');
                      }}
                      className="w-full py-2.5 px-4 rounded-xl text-xs font-semibold text-slate-300 bg-slate-900 hover:bg-slate-800 border border-slate-700 transition-colors flex items-center justify-center gap-2 cursor-pointer"
                    >
                      <span>View Workflow in Admin</span>
                    </button>
                  </div>
                </div>
              </div>
            );
          })()}

        </div>

      </div>
    </section>
  );
};
