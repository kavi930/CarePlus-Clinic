import React, { useState, useRef, useEffect } from 'react';
import { useClinic } from '../../context/ClinicContext';
import { PatientType, ServiceType } from '../../types/clinic';
import { 
  Bot, 
  X, 
  Send, 
  AlertTriangle, 
  Calendar, 
  PhoneCall, 
  MapPin, 
  Clock, 
  DollarSign, 
  Sparkles,
  ChevronRight,
  ShieldCheck,
  User,
  CheckCircle2,
  Minimize2
} from 'lucide-react';

interface ChatMessage {
  id: string;
  sender: 'assistant' | 'user' | 'system';
  text: string;
  timestamp: string;
  quickActions?: Array<{
    label: string;
    action: () => void;
    variant?: 'primary' | 'secondary' | 'danger';
  }>;
  isSafetyWarning?: boolean;
  isEmergencyAlert?: boolean;
}

export const AiChatAssistant: React.FC = () => {
  const { 
    isChatOpen, 
    closeChat, 
    toggleChat, 
    openBookingModal, 
    bookAppointment,
    createInquiryLead,
    settings,
    setCurrentView,
    setAdminTab
  } = useClinic();

  const [inputVal, setInputVal] = useState('');
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // In-chat booking state machine if patient chooses to book within chat
  const [inChatBookingStep, setInChatBookingStep] = useState<number>(0);
  const [chatBookingPatientType, setChatBookingPatientType] = useState<PatientType>('new');
  const [chatBookingService, setChatBookingService] = useState<ServiceType>('Skin Consultation');
  const [chatBookingDate, setChatBookingDate] = useState<string>('Monday, 12 October');

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping]);

  // Initial greeting message when opened
  useEffect(() => {
    if (messages.length === 0) {
      const now = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      setMessages([
        {
          id: 'msg-init',
          sender: 'assistant',
          text: '👋 Welcome to CarePlus Clinic. I can help with appointments and general clinic information. What would you like to do?',
          timestamp: now,
          quickActions: [
            { label: 'Book Appointment', action: () => startBookingFlow() },
            { label: 'Clinic Information', action: () => showClinicInfo() },
            { label: 'Services & Pricing', action: () => showServicesInfo() },
            { label: 'Talk to Staff', action: () => triggerHumanHandoff() },
          ],
        },
      ]);
    }
  }, []);

  const addAssistantMessage = (
    text: string, 
    quickActions?: ChatMessage['quickActions'], 
    isSafetyWarning = false, 
    isEmergencyAlert = false
  ) => {
    const now = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    setIsTyping(true);
    setTimeout(() => {
      setIsTyping(false);
      setMessages(prev => [
        ...prev,
        {
          id: `msg-${Date.now()}`,
          sender: 'assistant',
          text,
          timestamp: now,
          quickActions,
          isSafetyWarning,
          isEmergencyAlert,
        },
      ]);
    }, 600);
  };

  const startBookingFlow = () => {
    setInChatBookingStep(1);
    addAssistantMessage(
      'Sure. Are you a new or existing patient?',
      [
        {
          label: 'New Patient',
          action: () => handleSelectPatientType('new'),
        },
        {
          label: 'Existing Patient',
          action: () => handleSelectPatientType('existing'),
        },
      ]
    );
  };

  const handleSelectPatientType = (type: PatientType) => {
    setChatBookingPatientType(type);
    setInChatBookingStep(2);
    const now = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    setMessages(prev => [
      ...prev,
      {
        id: `msg-${Date.now()}`,
        sender: 'user',
        text: type === 'new' ? 'New patient.' : 'Existing patient.',
        timestamp: now,
      },
    ]);

    addAssistantMessage(
      'What type of appointment are you looking for?',
      [
        { label: 'General Consultation', action: () => handleSelectService('General Consultation') },
        { label: 'Skin Consultation', action: () => handleSelectService('Skin Consultation') },
        { label: 'Follow-up', action: () => handleSelectService('Follow-up') },
        { label: 'Specialist Consultation', action: () => handleSelectService('Specialist Consultation') },
      ]
    );
  };

  const handleSelectService = (serv: ServiceType) => {
    setChatBookingService(serv);
    setInChatBookingStep(3);
    const now = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    setMessages(prev => [
      ...prev,
      {
        id: `msg-${Date.now()}`,
        sender: 'user',
        text: serv,
        timestamp: now,
      },
    ]);

    addAssistantMessage(
      `Great! For ${serv}, we have availability on Monday, 12 October. Please pick your preferred demo slot:`,
      [
        { label: '10:00 AM', action: () => finalizeChatBooking('10:00 AM') },
        { label: '11:30 AM', action: () => finalizeChatBooking('11:30 AM') },
        { label: '2:00 PM', action: () => finalizeChatBooking('2:00 PM') },
        { label: '4:00 PM', action: () => finalizeChatBooking('4:00 PM') },
        { label: 'Open Full Calendar Picker', action: () => openBookingModal(), variant: 'secondary' },
      ]
    );
  };

  const finalizeChatBooking = async (slotTime: string) => {
    try {
      const apt = await bookAppointment({
        patientType: chatBookingPatientType,
        service: chatBookingService,
        date: 'Monday, 12 October',
        time: slotTime,
        patientName: 'Rahul Sharma',
        patientPhone: '+1 (555) 432-8819',
        patientEmail: 'rahul.sharma@example.com',
        notes: `Booked via CarePlus AI Chat Assistant (${chatBookingService})`,
        source: 'Website AI Chat',
      });

      const now = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      setMessages(prev => [
        ...prev,
        {
          id: `msg-${Date.now()}`,
          sender: 'user',
          text: `Book for ${slotTime}`,
          timestamp: now,
        },
      ]);

      setInChatBookingStep(0);

      const isSim = apt.isSimulated !== false;
      addAssistantMessage(
        `✅ Your appointment is confirmed!\n\n• Service: ${chatBookingService}\n• Date: Monday, 12 October at ${slotTime}\n• Clinic: CarePlus Clinic (Suite 400, Medical Plaza Blvd)\n• Mode: ${isSim ? 'Demo Simulation' : 'Live Google Calendar Event'}\n\nWe have dispatched confirmation with arrival instructions and notified our clinic staff.`,
        [
          {
            label: 'View in Staff Dashboard',
            action: () => {
              setCurrentView('admin');
              setAdminTab('appointments');
              closeChat();
            },
          },
          {
            label: 'Book Another Time',
            action: () => startBookingFlow(),
            variant: 'secondary',
          },
        ]
      );
    } catch (err: any) {
      addAssistantMessage(
        `⚠️ Could not complete booking: ${err.message || 'Slot unavailable'}. Would you like to select another time or speak with our receptionist?`,
        [
          { label: 'Try Another Slot', action: () => startBookingFlow() },
          { label: 'Talk to Staff', action: () => triggerHumanHandoff() },
        ]
      );
    }
  };

  const showClinicInfo = () => {
    addAssistantMessage(
      `🏥 CarePlus Clinic Information:\n\n• Address: ${settings.address}\n• Hours: ${settings.hours}\n• Phone: ${settings.phone}\n• Attending Doctors: ${settings.doctors.join(', ')}\n• Consultation Fee: ${settings.consultationFee}`,
      [
        { label: 'Book Appointment', action: () => startBookingFlow() },
        { label: 'Talk to Staff', action: () => triggerHumanHandoff() },
      ]
    );
  };

  const showServicesInfo = () => {
    addAssistantMessage(
      `📋 Our Clinic Services:\n\n1. General Consultation ($75) — Routine checkups and primary wellness\n2. Skin Consultation ($85) — Dermatology & skincare with Dr. Ananya Mehta\n3. Follow-up Visit ($45) — Recovery checks and lab test reviews\n4. Specialist Consultation ($110) — Advanced aesthetic and corrective protocols\n\nAll consultations include full doctor evaluation.`,
      [
        { label: 'Book Consultation', action: () => startBookingFlow() },
        { label: 'Talk to Staff', action: () => triggerHumanHandoff() },
      ]
    );
  };

  const triggerHumanHandoff = () => {
    // Notify staff CRM
    createInquiryLead('Patient via Chat', '+1 (555) 789-4400', 'Requested human clinic staff assistance from AI chat widget.');

    addAssistantMessage(
      `🤝 I've notified our clinic front desk team. A receptionist will connect with you shortly at ${settings.phone} during operating hours (${settings.hours}).\n\nIf you prefer to lock in a time slot directly, I can still assist you with calendar booking.`,
      [
        { label: 'Book Appointment Now', action: () => startBookingFlow() },
        { label: 'View Staff Dashboard', action: () => {
          setCurrentView('admin');
          setAdminTab('notifications');
          closeChat();
        }, variant: 'secondary' },
      ]
    );
  };

  // Rule-based and Safety Evaluation Handler
  const handleSendMessage = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const query = inputVal.trim();
    if (!query) return;

    const now = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    setMessages(prev => [
      ...prev,
      {
        id: `msg-${Date.now()}`,
        sender: 'user',
        text: query,
        timestamp: now,
      },
    ]);
    setInputVal('');

    const lower = query.toLowerCase();

    // 1. EMERGENCY SAFETY FILTER:
    // Chest pain, stroke, unconscious, severe bleeding, difficulty breathing, poisoned
    if (
      lower.includes('chest pain') ||
      lower.includes('heart attack') ||
      lower.includes('can\'t breathe') ||
      lower.includes('shortness of breath') ||
      lower.includes('unconscious') ||
      lower.includes('severe bleeding') ||
      lower.includes('overdose') ||
      lower.includes('emergency')
    ) {
      addAssistantMessage(
        '🚨 URGENT MEDICAL EMERGENCY NOTICE:\n\nIf you or someone with you is experiencing a medical emergency, please do not wait for clinic chat. Please call emergency services (e.g. 911 / 112) immediately or go to the nearest hospital emergency department.\n\nOur clinic assistant is restricted to routine administrative scheduling only.',
        undefined,
        true,
        true
      );
      return;
    }

    // 2. MEDICAL CLINICAL / DIAGNOSIS / MEDICATION SAFETY RULES:
    // Prompt instruction:
    // "Do NOT present the AI as a doctor."
    // "Do NOT provide diagnosis, treatment recommendations, medication recommendations, or medical interpretation."
    // "If a user asks a medical question, respond:
    // 'I can help with appointments and general clinic information, but I can't provide medical advice or diagnosis. Would you like me to connect you with clinic staff?'
    // Show buttons: Talk to Staff, Book Appointment"
    const medicalKeywords = [
      'diagnose', 'diagnosis', 'symptom', 'rash', 'pain', 'fever', 'swelling', 
      'lump', 'pill', 'medicine', 'medication', 'dosage', 'antibiotic', 
      'steroid', 'infection', 'blood test', 'lab result', 'biopsy', 'is this cancer', 
      'treatment recommendation', 'cure', 'allergy', 'allergic reaction'
    ];

    const isMedicalQuery = medicalKeywords.some(kw => lower.includes(kw));

    if (isMedicalQuery) {
      // Create lead with Human Handoff status
      createInquiryLead('Anonymous Patient', '+1 (555) 234-5500', `Medical question flagged: "${query}"`);

      addAssistantMessage(
        "I can help with appointments and general clinic information, but I can't provide medical advice or diagnosis. Would you like me to connect you with clinic staff?",
        [
          { label: 'Talk to Staff', action: () => triggerHumanHandoff() },
          { label: 'Book Appointment', action: () => startBookingFlow() },
        ],
        true,
        false
      );
      return;
    }

    // 3. BOOKING INTENTS
    if (
      lower.includes('book') || 
      lower.includes('appointment') || 
      lower.includes('schedule') || 
      lower.includes('slot') || 
      lower.includes('visit') || 
      lower.includes('see the doctor')
    ) {
      startBookingFlow();
      return;
    }

    // 4. PRICING & FEE INQUIRIES
    if (
      lower.includes('fee') || 
      lower.includes('cost') || 
      lower.includes('price') || 
      lower.includes('charge') || 
      lower.includes('how much')
    ) {
      addAssistantMessage(
        `Our standard consultation fees are:\n• General Consultation: $75\n• Skin Consultation (Dr. Ananya Mehta): $85\n• Specialist Consultation: $110\n• Follow-up Visit: $45\n\nFees can often be credited toward procedures performed on the same day.`,
        [
          { label: 'Book a Consultation', action: () => startBookingFlow() },
          { label: 'Talk to Staff', action: () => triggerHumanHandoff() },
        ]
      );
      return;
    }

    // 5. CLINIC HOURS & DOCTORS
    if (
      lower.includes('hour') || 
      lower.includes('time') || 
      lower.includes('open') || 
      lower.includes('tomorrow') || 
      lower.includes('doctor')
    ) {
      addAssistantMessage(
        `CarePlus Clinic is open ${settings.hours}.\n\nOur attending physicians are:\n• ${settings.doctors[0]}\n• ${settings.doctors[1]}\n\nDr. Mehta has consultation slots open this week. Would you like to check available times?`,
        [
          { label: 'Book an Appointment', action: () => startBookingFlow() },
          { label: 'Clinic Information', action: () => showClinicInfo() },
        ]
      );
      return;
    }

    // 6. LOCATION & PARKING
    if (
      lower.includes('where') || 
      lower.includes('location') || 
      lower.includes('address') || 
      lower.includes('parking')
    ) {
      addAssistantMessage(
        `CarePlus Clinic is located at:\n${settings.address}.\n\nFree validated patient parking is available on Level P2 of the Medical Plaza building. We are also accessible via Metro Health District transit station.`,
        [
          { label: 'Book Appointment', action: () => startBookingFlow() },
          { label: 'Services', action: () => showServicesInfo() },
        ]
      );
      return;
    }

    // 7. DEFAULT ADMINISTRATIVE ASSISTANCE
    addAssistantMessage(
      "I'm the CarePlus administrative assistant. I can help answer routine clinic questions (hours, fees, location) and book appointments with our doctors. How may I help you?",
      [
        { label: 'Book Appointment', action: () => startBookingFlow() },
        { label: 'Clinic Information', action: () => showClinicInfo() },
        { label: 'Services', action: () => showServicesInfo() },
        { label: 'Talk to Staff', action: () => triggerHumanHandoff() },
      ]
    );
  };

  return (
    <>
      {/* Floating Chat Launcher Button (Bottom Right) */}
      {!isChatOpen && (
        <div className="fixed bottom-6 right-6 z-40">
          <button
            onClick={toggleChat}
            className="group relative flex items-center gap-3 px-4 py-3 bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-500 hover:to-cyan-500 text-white rounded-2xl shadow-2xl shadow-blue-600/40 border border-cyan-400/30 transition-all duration-200 cursor-pointer active:scale-95"
            aria-label="Open AI Clinic Assistant"
          >
            <div className="relative">
              <Bot className="w-5 h-5 text-white" />
              <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-emerald-400 rounded-full ring-2 ring-[#080B12]" />
            </div>
            <div className="text-left hidden sm:block">
              <div className="text-xs font-bold leading-tight flex items-center gap-1.5">
                CarePlus Assistant
                <span className="text-[10px] px-1.5 py-0.2 rounded bg-white/20 uppercase font-mono">AI</span>
              </div>
              <div className="text-[11px] text-cyan-100/90 leading-tight">Appointments & Clinic FAQs</div>
            </div>
          </button>
        </div>
      )}

      {/* Floating Chat Window Modal / Drawer */}
      {isChatOpen && (
        <div className="fixed bottom-4 right-4 sm:bottom-6 sm:right-6 z-50 w-[95vw] sm:w-[420px] max-h-[85vh] h-[600px] bg-[#111827] border border-slate-700/80 rounded-2xl shadow-2xl flex flex-col overflow-hidden animate-in fade-in slide-in-from-bottom-6 duration-200">
          
          {/* Header with Safety Disclaimer */}
          <div className="bg-gradient-to-r from-slate-900 via-[#111827] to-slate-900 border-b border-slate-800 p-3.5 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-blue-600 to-cyan-500 flex items-center justify-center text-white shadow-md">
                <Bot className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-xs font-bold text-white flex items-center gap-1.5">
                  CarePlus Assistant
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                </h3>
                <p className="text-[10px] text-slate-400">Administrative & Appointment Booking</p>
              </div>
            </div>

            <div className="flex items-center gap-1">
              <button
                onClick={closeChat}
                className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition-colors cursor-pointer"
                aria-label="Close Chat"
              >
                <Minimize2 className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* AI Safety Rule Banner */}
          <div className="bg-slate-900/90 border-b border-slate-800/80 px-3 py-1.5 text-[10px] text-slate-400 flex items-center gap-1.5 justify-center">
            <ShieldCheck className="w-3 h-3 text-cyan-400 shrink-0" />
            <span>Non-clinical assistant. For administrative and booking requests only.</span>
          </div>

          {/* Messages Scroll Area */}
          <div className="flex-1 p-3.5 overflow-y-auto space-y-3 text-xs bg-[#080B12]/60">
            {messages.map((m) => {
              const isAssistant = m.sender === 'assistant';
              return (
                <div key={m.id} className="space-y-2">
                  <div className={`flex items-start gap-2 ${isAssistant ? '' : 'justify-end'}`}>
                    {isAssistant && (
                      <div className="w-6 h-6 rounded-lg bg-blue-600/30 text-cyan-300 flex items-center justify-center text-[10px] shrink-0 mt-0.5">
                        CP
                      </div>
                    )}

                    <div
                      className={`max-w-[85%] rounded-2xl px-3.5 py-2.5 leading-relaxed whitespace-pre-wrap ${
                        isAssistant
                          ? m.isEmergencyAlert
                            ? 'bg-rose-950/80 text-rose-200 border border-rose-500/40 rounded-tl-sm'
                            : m.isSafetyWarning
                            ? 'bg-amber-950/50 text-amber-200 border border-amber-500/40 rounded-tl-sm'
                            : 'bg-slate-800/95 text-slate-200 border border-slate-700/60 rounded-tl-sm'
                          : 'bg-blue-600 text-white rounded-tr-sm shadow-sm'
                      }`}
                    >
                      {m.text}
                      <div
                        className={`text-[9px] mt-1 text-right ${
                          isAssistant ? 'text-slate-500' : 'text-blue-200'
                        }`}
                      >
                        {m.timestamp}
                      </div>
                    </div>

                    {!isAssistant && (
                      <div className="w-6 h-6 rounded-lg bg-slate-700 text-slate-300 flex items-center justify-center text-[10px] shrink-0 mt-0.5">
                        <User className="w-3.5 h-3.5" />
                      </div>
                    )}
                  </div>

                  {/* Contextual Quick Actions for Assistant message */}
                  {isAssistant && m.quickActions && m.quickActions.length > 0 && (
                    <div className="pl-8 flex flex-wrap gap-1.5">
                      {m.quickActions.map((qa, qaIdx) => (
                        <button
                          key={qaIdx}
                          onClick={qa.action}
                          className={`px-2.5 py-1 rounded-lg text-[11px] font-medium border transition-colors cursor-pointer ${
                            qa.variant === 'danger'
                              ? 'bg-rose-950/50 border-rose-700 text-rose-300 hover:bg-rose-900/60'
                              : qa.variant === 'secondary'
                              ? 'bg-slate-900 border-slate-700 text-slate-400 hover:text-white hover:border-slate-600'
                              : 'bg-blue-600/15 border-blue-500/40 text-blue-300 hover:bg-blue-600/30 hover:border-blue-400'
                          }`}
                        >
                          {qa.label}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}

            {isTyping && (
              <div className="flex items-center gap-2 text-slate-400 text-xs pl-8">
                <div className="w-2 h-2 rounded-full bg-cyan-400 animate-ping" />
                <span className="text-[11px] text-slate-500">CarePlus assistant typing...</span>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Input Form */}
          <form onSubmit={handleSendMessage} className="p-2.5 border-t border-slate-800 bg-[#111827]">
            <div className="flex items-center gap-1.5 bg-slate-900 border border-slate-700/80 rounded-xl px-2.5 py-1.5 focus-within:border-cyan-400 transition-colors">
              <input
                type="text"
                value={inputVal}
                onChange={(e) => setInputVal(e.target.value)}
                placeholder="Ask about appointments, fees, hours..."
                className="flex-1 bg-transparent text-xs text-white placeholder-slate-500 focus:outline-none"
              />
              <button
                type="submit"
                disabled={!inputVal.trim()}
                className="w-7 h-7 rounded-lg bg-blue-600 hover:bg-blue-500 disabled:opacity-40 disabled:hover:bg-blue-600 text-white flex items-center justify-center transition-colors cursor-pointer"
                aria-label="Send Message"
              >
                <Send className="w-3.5 h-3.5" />
              </button>
            </div>
            <div className="text-[10px] text-slate-500 text-center mt-1.5">
              Try asking: "I want to book an appointment" or "What is the consultation fee?"
            </div>
          </form>

        </div>
      )}
    </>
  );
};
