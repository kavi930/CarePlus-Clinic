import React, { useState } from 'react';
import { useClinic } from '../../context/ClinicContext';
import { 
  Bot, 
  Calendar as CalendarIcon, 
  CheckCircle2, 
  ArrowRight, 
  ShieldCheck, 
  Clock, 
  Sparkles, 
  MessageSquare,
  Send,
  User,
  Check
} from 'lucide-react';

export const HeroSection: React.FC = () => {
  const { openBookingModal, openChat, bookAppointment } = useClinic();

  // Interactive hero mini-demo states
  const [interactiveStep, setInteractiveStep] = useState<number>(2); // 1: inquiry, 2: slot picked, 3: confirmed
  const [selectedDemoSlot, setSelectedDemoSlot] = useState<string>('4:00 PM');
  const [selectedDemoDate, setSelectedDemoDate] = useState<number>(12); // Oct 12
  const [selectedDemoService, setSelectedDemoService] = useState<string>('Skin Consultation');
  const [heroSuccessMessage, setHeroSuccessMessage] = useState<string>('Booking Confirmed! Rahul Sharma · Mon 12 Oct at 4:00 PM');

  const demoSlots = [
    { time: '10:00 AM', status: 'available' },
    { time: '11:30 AM', status: 'available' },
    { time: '2:00 PM', status: 'booked' },
    { time: '4:00 PM', status: 'selected' },
  ];

  const handleQuickHeroBook = async () => {
    try {
      const apt = await bookAppointment({
        patientType: 'new',
        service: 'Skin Consultation',
        date: `Monday, ${selectedDemoDate} October`,
        time: selectedDemoSlot,
        patientName: 'Rahul Sharma',
        patientPhone: '+1 (555) 432-8819',
        patientEmail: 'rahul.sharma@example.com',
        notes: 'Demo booking via interactive Hero preview widget.',
        source: 'Website AI Chat',
      });
      setInteractiveStep(3);
      const isSim = apt.isSimulated !== false;
      setHeroSuccessMessage(`Booking Confirmed! Rahul Sharma · Mon ${selectedDemoDate} Oct at ${selectedDemoSlot} ${isSim ? '(Demo)' : '(Google Calendar Synced)'}`);
    } catch (err: any) {
      alert(`Booking notice: ${err.message || 'Slot currently unavailable'}`);
    }
  };

  return (
    <section className="relative pt-12 pb-20 md:pt-20 md:pb-32 overflow-hidden">
      {/* Background radial gradient glow */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[450px] bg-blue-600/10 blur-[130px] pointer-events-none rounded-full" />
      <div className="absolute top-1/3 left-1/3 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[300px] bg-cyan-500/10 blur-[100px] pointer-events-none rounded-full" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Market segment indicators */}
        <div className="flex justify-center mb-6">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-slate-900/90 border border-slate-700/70 text-xs text-slate-300">
            <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse" />
            <span className="font-semibold text-slate-200">FOR CLINICS</span>
            <span className="text-slate-500">·</span>
            <span>DENTAL</span>
            <span className="text-slate-500">·</span>
            <span>DERMATOLOGY</span>
            <span className="text-slate-500">·</span>
            <span>PHYSIOTHERAPY</span>
          </div>
        </div>

        {/* Main Headline & Subtitle */}
        <div className="text-center max-w-4xl mx-auto mb-10">
          <h1 className="text-3xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-white text-balance leading-[1.12]">
            Stop Losing Patients{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-cyan-300 to-blue-400">
              Between Inquiry & Appointment
            </span>
          </h1>
          <p className="mt-5 text-base sm:text-xl text-slate-300 max-w-3xl mx-auto leading-relaxed text-balance">
            A smarter appointment system that helps clinics respond to inquiries, collect booking information, schedule appointments, and keep patients informed.
          </p>

          {/* Action CTAs */}
          <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-4">
            <button
              onClick={openBookingModal}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2.5 px-7 py-3.5 text-sm font-semibold text-white bg-blue-600 hover:bg-blue-500 rounded-xl shadow-xl shadow-blue-600/25 transition-all duration-150 cursor-pointer active:scale-95"
            >
              <CalendarIcon className="w-4 h-4" />
              <span>Book an Appointment</span>
              <ArrowRight className="w-4 h-4" />
            </button>

            <button
              onClick={openChat}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2.5 px-6 py-3.5 text-sm font-semibold text-slate-200 bg-slate-900 hover:bg-slate-800 border border-slate-700/80 rounded-xl transition-all duration-150 cursor-pointer"
            >
              <Bot className="w-4 h-4 text-cyan-400" />
              <span>Try AI Assistant</span>
            </button>
          </div>

          {/* Trust strip */}
          <div className="mt-6 flex items-center justify-center gap-3 text-xs sm:text-sm text-slate-400">
            <span className="flex items-center gap-1.5 text-emerald-400">
              <CheckCircle2 className="w-4 h-4" /> Fast responses
            </span>
            <span className="text-slate-600">·</span>
            <span className="flex items-center gap-1.5 text-cyan-400">
              <CheckCircle2 className="w-4 h-4" /> Easy booking
            </span>
            <span className="text-slate-600">·</span>
            <span className="flex items-center gap-1.5 text-blue-400">
              <CheckCircle2 className="w-4 h-4" /> Human support when needed
            </span>
          </div>
        </div>

        {/* HERO VISUAL: Split-Screen Interactive Product Preview */}
        <div className="mt-8 max-w-5xl mx-auto">
          {/* Progression Breadcrumb Tracker */}
          <div className="mb-4 flex items-center justify-center">
            <div className="inline-flex items-center gap-1 sm:gap-2 px-3 py-1.5 rounded-lg bg-slate-900/80 border border-slate-800 text-[11px] sm:text-xs text-slate-400">
              <span className="text-cyan-400 font-medium">Patient inquiry</span>
              <span className="text-slate-600">→</span>
              <span className="text-cyan-400 font-medium">AI assistant</span>
              <span className="text-slate-600">→</span>
              <span className="text-cyan-400 font-medium">Qualification</span>
              <span className="text-slate-600">→</span>
              <span className="text-cyan-400 font-medium">Appointment</span>
              <span className="text-slate-600">→</span>
              <span className="text-emerald-400 font-medium">Confirmation</span>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-stretch">
            {/* Left Column: Interactive AI Assistant Conversation Preview */}
            <div className="lg:col-span-6 bg-[#111827]/95 border border-slate-800 rounded-2xl p-5 shadow-2xl flex flex-col justify-between relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-cyan-500/10 blur-2xl rounded-full pointer-events-none" />

              {/* Chat Header */}
              <div className="flex items-center justify-between pb-4 border-b border-slate-800/80">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-blue-600 to-cyan-500 flex items-center justify-center text-white shadow-md">
                    <Bot className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-sm font-semibold text-white flex items-center gap-1.5">
                      CarePlus Assistant
                      <span className="inline-block w-2 h-2 rounded-full bg-emerald-400" />
                    </h3>
                    <p className="text-[11px] text-slate-400">Administrative & Scheduling Support</p>
                  </div>
                </div>
                <span className="text-[10px] uppercase font-mono px-2 py-0.5 rounded bg-slate-800 text-slate-300">
                  Live Preview
                </span>
              </div>

              {/* Conversation Messages */}
              <div className="py-4 space-y-3.5 flex-1 text-xs">
                {/* Bot greeting */}
                <div className="flex items-start gap-2.5">
                  <div className="w-6 h-6 rounded-lg bg-blue-600/30 text-cyan-300 flex items-center justify-center text-[10px] shrink-0 mt-0.5">
                    CP
                  </div>
                  <div className="bg-slate-800/90 border border-slate-700/60 text-slate-200 rounded-2xl rounded-tl-sm px-3.5 py-2.5 max-w-[85%] leading-relaxed">
                    👋 Welcome to CarePlus Clinic. I can help with appointments and general clinic information. What would you like to do?
                  </div>
                </div>

                {/* User message */}
                <div className="flex items-start justify-end gap-2.5">
                  <div className="bg-blue-600 text-white rounded-2xl rounded-tr-sm px-3.5 py-2.5 max-w-[85%] leading-relaxed shadow-sm">
                    I want to book an appointment with Dr. Ananya Mehta.
                  </div>
                  <div className="w-6 h-6 rounded-lg bg-slate-700 text-slate-300 flex items-center justify-center text-[10px] shrink-0 mt-0.5">
                    <User className="w-3.5 h-3.5" />
                  </div>
                </div>

                {/* Bot qualification */}
                <div className="flex items-start gap-2.5">
                  <div className="w-6 h-6 rounded-lg bg-blue-600/30 text-cyan-300 flex items-center justify-center text-[10px] shrink-0 mt-0.5">
                    CP
                  </div>
                  <div className="bg-slate-800/90 border border-slate-700/60 text-slate-200 rounded-2xl rounded-tl-sm px-3.5 py-2.5 max-w-[85%] space-y-2 leading-relaxed">
                    <p>Certainly! Are you a new or existing patient?</p>
                    <div className="flex gap-2 pt-1">
                      <span className="px-2.5 py-1 rounded-lg bg-blue-600/20 text-blue-300 border border-blue-500/40 font-medium text-[11px]">
                        ✓ New Patient
                      </span>
                      <span className="px-2.5 py-1 rounded-lg bg-slate-800 text-slate-400 border border-slate-700 text-[11px]">
                        Existing Patient
                      </span>
                    </div>
                  </div>
                </div>

                {/* Bot service selection */}
                <div className="flex items-start gap-2.5">
                  <div className="w-6 h-6 rounded-lg bg-blue-600/30 text-cyan-300 flex items-center justify-center text-[10px] shrink-0 mt-0.5">
                    CP
                  </div>
                  <div className="bg-slate-800/90 border border-slate-700/60 text-slate-200 rounded-2xl rounded-tl-sm px-3.5 py-2.5 max-w-[85%] leading-relaxed space-y-1.5">
                    <p className="text-slate-300">Selected: <strong className="text-white">Skin Consultation</strong> ($85).</p>
                    <p className="text-slate-400 text-[11px]">Please select your preferred slot on the calendar 👉</p>
                  </div>
                </div>
              </div>

              {/* Chat Input Bar */}
              <div className="pt-2 border-t border-slate-800/80">
                <div 
                  onClick={openChat}
                  className="flex items-center gap-2 bg-slate-900 border border-slate-700/70 rounded-xl px-3 py-2 text-slate-400 text-xs cursor-pointer hover:border-slate-600 transition-colors"
                >
                  <MessageSquare className="w-4 h-4 text-cyan-400" />
                  <span className="flex-1">Click to test live interactive chat...</span>
                  <span className="text-[10px] bg-blue-600/30 text-blue-300 px-2 py-0.5 rounded font-medium">
                    Try Live
                  </span>
                </div>
              </div>
            </div>

            {/* Right Column: Appointment Calendar & Confirmation Card */}
            <div className="lg:col-span-6 bg-[#111827]/95 border border-slate-800 rounded-2xl p-5 shadow-2xl flex flex-col justify-between">
              <div>
                {/* Header */}
                <div className="flex items-center justify-between pb-3 border-b border-slate-800/80 mb-4">
                  <div className="flex items-center gap-2 text-xs font-semibold text-white">
                    <CalendarIcon className="w-4 h-4 text-blue-400" />
                    <span>Select Date & Demo Availability</span>
                  </div>
                  <span className="text-[11px] font-mono text-cyan-300 bg-cyan-950/60 border border-cyan-800/50 px-2 py-0.5 rounded">
                    Demo availability
                  </span>
                </div>

                {/* Calendar Days Row */}
                <div className="mb-4">
                  <div className="text-[11px] font-medium text-slate-400 mb-2 flex justify-between">
                    <span>October 2026</span>
                    <span className="text-slate-500">CarePlus Dermatology</span>
                  </div>
                  <div className="grid grid-cols-5 gap-2">
                    {[
                      { day: 'Mon', num: 12, label: 'Oct 12' },
                      { day: 'Tue', num: 13, label: 'Oct 13' },
                      { day: 'Wed', num: 14, label: 'Oct 14' },
                      { day: 'Thu', num: 15, label: 'Oct 15' },
                      { day: 'Fri', num: 16, label: 'Oct 16' },
                    ].map((d) => (
                      <button
                        key={d.num}
                        onClick={() => {
                          setSelectedDemoDate(d.num);
                          if (interactiveStep === 3) setInteractiveStep(2);
                        }}
                        className={`p-2 rounded-xl text-center border transition-all cursor-pointer ${
                          selectedDemoDate === d.num
                            ? 'bg-blue-600/20 border-blue-500 text-white shadow-sm'
                            : 'bg-slate-900/60 border-slate-800 text-slate-400 hover:text-slate-200 hover:border-slate-700'
                        }`}
                      >
                        <div className="text-[10px] text-slate-400">{d.day}</div>
                        <div className="text-sm font-bold mt-0.5">{d.num}</div>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Demo Slots Grid */}
                <div className="mb-4">
                  <div className="text-[11px] font-medium text-slate-400 mb-2 flex items-center justify-between">
                    <span>Available demo slots for Mon, {selectedDemoDate} Oct:</span>
                    <span className="text-[10px] text-slate-500">Dr. Ananya Mehta</span>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    {demoSlots.map((slot) => {
                      const isSelected = selectedDemoSlot === slot.time;
                      const isBooked = slot.status === 'booked';
                      return (
                        <button
                          key={slot.time}
                          disabled={isBooked}
                          onClick={() => {
                            setSelectedDemoSlot(slot.time);
                            if (interactiveStep === 3) setInteractiveStep(2);
                          }}
                          className={`px-3 py-2.5 rounded-xl text-xs font-semibold text-center border transition-all cursor-pointer ${
                            isBooked
                              ? 'bg-slate-900/30 border-slate-800 text-slate-600 cursor-not-allowed line-through'
                              : isSelected
                              ? 'bg-gradient-to-r from-blue-600 to-cyan-600 text-white border-blue-400 shadow-md'
                              : 'bg-slate-900/80 border-slate-700/80 text-slate-200 hover:bg-slate-800 hover:border-slate-600'
                          }`}
                        >
                          {slot.time}
                          {isSelected && <span className="ml-1.5 text-[10px]">✓</span>}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Patient Summary Preview */}
                <div className="p-3 rounded-xl bg-slate-900/70 border border-slate-800/80 text-xs mb-3 space-y-1">
                  <div className="flex justify-between text-slate-400">
                    <span>Patient:</span>
                    <span className="text-slate-200 font-medium">Rahul Sharma (New Patient)</span>
                  </div>
                  <div className="flex justify-between text-slate-400">
                    <span>Service:</span>
                    <span className="text-slate-200 font-medium">Skin Consultation ($85)</span>
                  </div>
                </div>
              </div>

              {/* Bottom confirmation area */}
              <div>
                {interactiveStep === 3 ? (
                  <div className="p-3.5 rounded-xl bg-emerald-950/40 border border-emerald-500/40 text-emerald-300 text-xs flex items-center gap-3">
                    <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
                    <div className="flex-1">
                      <div className="font-bold text-white text-xs">{heroSuccessMessage}</div>
                      <div className="text-[11px] text-emerald-300/80 mt-0.5">
                        Added to clinic CRM · Staff alert & WhatsApp reminder sent
                      </div>
                    </div>
                  </div>
                ) : (
                  <button
                    onClick={handleQuickHeroBook}
                    className="w-full py-3 px-4 rounded-xl font-semibold text-xs text-white bg-blue-600 hover:bg-blue-500 transition-colors shadow-lg shadow-blue-600/20 flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <span>Confirm Booking</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
