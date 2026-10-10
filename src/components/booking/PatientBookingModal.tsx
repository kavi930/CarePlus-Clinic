import React, { useState } from 'react';
import { useClinic } from '../../context/ClinicContext';
import { PatientType, ServiceType } from '../../types/clinic';
import { 
  X, 
  Calendar as CalendarIcon, 
  Clock, 
  User, 
  Phone, 
  Mail, 
  CheckCircle2, 
  ArrowRight, 
  ArrowLeft, 
  Download, 
  Share2,
  Sparkles,
  MessageSquare
} from 'lucide-react';

export const PatientBookingModal: React.FC = () => {
  const { isBookingModalOpen, closeBookingModal, bookAppointment, setCurrentView, setAdminTab } = useClinic();

  const [step, setStep] = useState<number>(1);
  const [patientType, setPatientType] = useState<PatientType>('new');
  const [service, setService] = useState<ServiceType>('Skin Consultation');
  const [selectedDate, setSelectedDate] = useState<string>('Monday, 12 October');
  const [selectedTime, setSelectedTime] = useState<string>('4:00 PM');
  
  const [fullName, setFullName] = useState<string>('Rahul Sharma');
  const [phone, setPhone] = useState<string>('+1 (555) 432-8819');
  const [email, setEmail] = useState<string>('rahul.sharma@example.com');
  const [notes, setNotes] = useState<string>('Skin evaluation for routine care.');
  const [showCalendarDownloadMessage, setShowCalendarDownloadMessage] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [bookingError, setBookingError] = useState<string | null>(null);
  const [bookedResult, setBookedResult] = useState<any>(null);

  if (!isBookingModalOpen) return null;

  const demoSlots = [
    { time: '10:00 AM', status: 'available' },
    { time: '11:30 AM', status: 'available' },
    { time: '2:00 PM', status: 'available' },
    { time: '4:00 PM', status: 'available' },
  ];

  const calendarDates = [
    { label: 'Monday, 12 October', dayName: 'Mon', dayNum: '12', month: 'Oct' },
    { label: 'Tuesday, 13 October', dayName: 'Tue', dayNum: '13', month: 'Oct' },
    { label: 'Wednesday, 14 October', dayName: 'Wed', dayNum: '14', month: 'Oct' },
    { label: 'Thursday, 15 October', dayName: 'Thu', dayNum: '15', month: 'Oct' },
    { label: 'Friday, 16 October', dayName: 'Fri', dayNum: '16', month: 'Oct' },
    { label: 'Saturday, 17 October', dayName: 'Sat', dayNum: '17', month: 'Oct' },
  ];

  const handleNextStep = async () => {
    if (step === 5) {
      setBookingError(null);
      setIsSubmitting(true);
      try {
        const apt = await bookAppointment({
          patientType,
          service,
          date: selectedDate,
          time: selectedTime,
          patientName: fullName || 'Demo Patient',
          patientPhone: phone || '+1 (555) 000-0000',
          patientEmail: email || 'patient@example.com',
          notes: notes,
          source: 'Booking Form',
        });
        setBookedResult(apt);
        setStep(6);
      } catch (err: any) {
        setBookingError(err.message || 'Booking submission failed. Please try again.');
      } finally {
        setIsSubmitting(false);
      }
    } else {
      setStep(prev => prev + 1);
    }
  };

  const handlePrevStep = () => {
    if (step > 1 && step < 6) {
      setStep(prev => prev - 1);
    }
  };

  const resetAndClose = () => {
    setStep(1);
    closeBookingModal();
  };

  const downloadCalendarFile = () => {
    setShowCalendarDownloadMessage(true);
    // Generate synthetic .ics calendar event
    const icsContent = `BEGIN:VCALENDAR
VERSION:2.0
PRODID:-//CarePlus Clinic//Appointment System//EN
BEGIN:VEVENT
SUMMARY:CarePlus Clinic - ${service}
DESCRIPTION:Appointment with CarePlus Clinic.\\nPatient: ${fullName}\\nService: ${service}
LOCATION:Suite 400, Medical Plaza Blvd, Metro Health District
STATUS:CONFIRMED
END:VEVENT
END:VCALENDAR`;
    const blob = new Blob([icsContent], { type: 'text/calendar;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `CarePlus_Appointment_${selectedDate.replace(/\s+/g, '_')}.ics`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    setTimeout(() => setShowCalendarDownloadMessage(false), 3000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-[#111827] border border-slate-800 w-full max-w-xl rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh]">
        
        {/* Modal Top Bar */}
        <div className="px-6 py-4 border-b border-slate-800 flex items-center justify-between bg-slate-900/60">
          <div className="flex items-center gap-2">
            <span className="text-sm font-bold text-white tracking-tight">CAREPLUS CLINIC</span>
            <span className="text-slate-500">·</span>
            <span className="text-xs text-cyan-400 font-medium">Patient Booking Experience</span>
          </div>
          <button
            onClick={resetAndClose}
            className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Progress Step Indicator (for steps 1-5) */}
        {step < 6 && (
          <div className="px-6 pt-4 pb-2 bg-slate-900/30 border-b border-slate-800/40">
            <div className="flex items-center justify-between text-[11px] font-mono text-slate-400 mb-2">
              <span>Step 0{step} of 05</span>
              <span>
                {step === 1 && 'Patient Type'}
                {step === 2 && 'Service Choice'}
                {step === 3 && 'Preferred Day'}
                {step === 4 && 'Time Slot'}
                {step === 5 && 'Patient Details'}
              </span>
            </div>
            <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
              <div 
                className="bg-gradient-to-r from-blue-500 to-cyan-400 h-full transition-all duration-300"
                style={{ width: `${(step / 5) * 100}%` }}
              />
            </div>
          </div>
        )}

        {/* Modal Body: Dynamic Step Content */}
        <div className="p-6 overflow-y-auto flex-1">
          
          {/* STEP 1: New or Existing Patient */}
          {step === 1 && (
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-bold text-white">
                  Are you a new or existing patient?
                </h3>
                <p className="text-xs text-slate-400 mt-1">
                  We customize intake documentation depending on your patient record.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <button
                  onClick={() => {
                    setPatientType('new');
                    handleNextStep();
                  }}
                  className={`p-5 rounded-xl border text-left transition-all cursor-pointer group ${
                    patientType === 'new'
                      ? 'bg-blue-600/15 border-blue-500 ring-1 ring-blue-500'
                      : 'bg-slate-900/60 border-slate-800 hover:border-slate-700'
                  }`}
                >
                  <div className="w-8 h-8 rounded-lg bg-blue-500/20 text-cyan-300 flex items-center justify-center font-bold text-sm mb-3 group-hover:scale-105 transition-transform">
                    1st
                  </div>
                  <div className="font-bold text-white text-sm">New Patient</div>
                  <p className="text-xs text-slate-400 mt-1">
                    First visit to CarePlus Clinic. We'll set up your initial profile.
                  </p>
                </button>

                <button
                  onClick={() => {
                    setPatientType('existing');
                    handleNextStep();
                  }}
                  className={`p-5 rounded-xl border text-left transition-all cursor-pointer group ${
                    patientType === 'existing'
                      ? 'bg-blue-600/15 border-blue-500 ring-1 ring-blue-500'
                      : 'bg-slate-900/60 border-slate-800 hover:border-slate-700'
                  }`}
                >
                  <div className="w-8 h-8 rounded-lg bg-emerald-500/20 text-emerald-300 flex items-center justify-center font-bold text-sm mb-3 group-hover:scale-105 transition-transform">
                    CP
                  </div>
                  <div className="font-bold text-white text-sm">Existing Patient</div>
                  <p className="text-xs text-slate-400 mt-1">
                    Returning patient with existing medical records at our clinic.
                  </p>
                </button>
              </div>
            </div>
          )}

          {/* STEP 2: Service Selection */}
          {step === 2 && (
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-bold text-white">
                  What would you like to book?
                </h3>
                <p className="text-xs text-slate-400 mt-1">
                  Select the type of consultation required.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {[
                  { name: 'General Consultation', fee: '$75', desc: 'Routine general assessment & vitals review' },
                  { name: 'Skin Consultation', fee: '$85', desc: 'Dermatology check with Dr. Ananya Mehta' },
                  { name: 'Follow-up', fee: '$45', desc: 'Post-treatment evaluation or lab check-in' },
                  { name: 'Specialist Consultation', fee: '$110', desc: 'Advanced laser, aesthetic or acne protocol' },
                ].map((s) => (
                  <button
                    key={s.name}
                    onClick={() => {
                      setService(s.name as ServiceType);
                      handleNextStep();
                    }}
                    className={`p-4 rounded-xl border text-left transition-all cursor-pointer ${
                      service === s.name
                        ? 'bg-blue-600/15 border-blue-500 ring-1 ring-blue-500'
                        : 'bg-slate-900/60 border-slate-800 hover:border-slate-700'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <div className="font-bold text-white text-sm">{s.name}</div>
                      <span className="text-xs font-mono font-semibold text-cyan-400">{s.fee}</span>
                    </div>
                    <p className="text-xs text-slate-400">{s.desc}</p>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* STEP 3: Preferred Day */}
          {step === 3 && (
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-bold text-white">
                  What day would you prefer?
                </h3>
                <p className="text-xs text-slate-400 mt-1">
                  Choose a preferred consultation date from the clinic calendar.
                </p>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {calendarDates.map((item) => {
                  const isSelected = selectedDate === item.label;
                  return (
                    <button
                      key={item.label}
                      onClick={() => {
                        setSelectedDate(item.label);
                        handleNextStep();
                      }}
                      className={`p-4 rounded-xl border text-center transition-all cursor-pointer ${
                        isSelected
                          ? 'bg-blue-600/20 border-blue-500 text-white shadow-md'
                          : 'bg-slate-900/60 border-slate-800 text-slate-300 hover:border-slate-700'
                      }`}
                    >
                      <div className="text-xs text-slate-400 uppercase tracking-wider">{item.dayName}</div>
                      <div className="text-2xl font-bold font-mono my-1 text-white">{item.dayNum}</div>
                      <div className="text-xs text-cyan-400 font-medium">{item.month} 2026</div>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* STEP 4: Demo Appointment Slots */}
          {step === 4 && (
            <div className="space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div>
                  <h3 className="text-lg font-bold text-white">
                    Available Appointment Slots
                  </h3>
                  <p className="text-xs text-slate-400 mt-1">
                    Showing available times for {selectedDate}.
                  </p>
                </div>
                <div>
                  <span className="text-[11px] font-mono px-2.5 py-1 rounded bg-amber-500/10 text-amber-300 border border-amber-500/30">
                    Demo availability
                  </span>
                </div>
              </div>

              <div className="p-3 bg-slate-900/80 border border-slate-800 rounded-xl text-xs text-slate-300">
                Notice: Slots displayed below are for demo simulation purposes.
              </div>

              <div className="grid grid-cols-2 gap-3">
                {demoSlots.map((s) => {
                  const isSelected = selectedTime === s.time;
                  return (
                    <button
                      key={s.time}
                      onClick={() => {
                        setSelectedTime(s.time);
                        handleNextStep();
                      }}
                      className={`p-4 rounded-xl border text-center transition-all cursor-pointer ${
                        isSelected
                          ? 'bg-gradient-to-r from-blue-600 to-cyan-600 text-white border-blue-400 shadow-lg'
                          : 'bg-slate-900/80 border-slate-800 text-slate-200 hover:bg-slate-800 hover:border-slate-700'
                      }`}
                    >
                      <div className="text-base font-bold font-mono">{s.time}</div>
                      <div className="text-[11px] text-slate-300 mt-1">
                        {isSelected ? 'Selected Slot' : 'Available Demo Slot'}
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* STEP 5: Patient Contact Details */}
          {step === 5 && (
            <div className="space-y-5">
              <div>
                <h3 className="text-lg font-bold text-white">
                  Patient Contact Information
                </h3>
                <p className="text-xs text-slate-400 mt-1">
                  We'll send your appointment confirmation & reminder to these details.
                </p>
              </div>

              <div className="space-y-3.5">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                    Full Name *
                  </label>
                  <div className="relative">
                    <User className="w-4 h-4 text-slate-500 absolute left-3 top-3" />
                    <input
                      type="text"
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      placeholder="e.g. Rahul Sharma"
                      className="w-full bg-slate-900 border border-slate-700 rounded-xl pl-9 pr-3 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400"
                      required
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                      Phone Number (WhatsApp) *
                    </label>
                    <div className="relative">
                      <Phone className="w-4 h-4 text-slate-500 absolute left-3 top-3" />
                      <input
                        type="tel"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        placeholder="+1 (555) 432-8819"
                        className="w-full bg-slate-900 border border-slate-700 rounded-xl pl-9 pr-3 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400"
                        required
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                      Email Address *
                    </label>
                    <div className="relative">
                      <Mail className="w-4 h-4 text-slate-500 absolute left-3 top-3" />
                      <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="rahul.sharma@example.com"
                        className="w-full bg-slate-900 border border-slate-700 rounded-xl pl-9 pr-3 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400"
                        required
                      />
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                    Optional Visit Notes
                  </label>
                  <textarea
                    rows={2}
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="Briefly describe what you would like to discuss..."
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400"
                  />
                </div>
              </div>

              {bookingError && (
                <div className="p-3 bg-rose-950/80 border border-rose-500/50 rounded-xl text-xs text-rose-200">
                  <strong>Notice:</strong> {bookingError}
                </div>
              )}

              {/* Order summary box */}
              <div className="p-3 bg-slate-900/60 border border-slate-800 rounded-xl text-xs space-y-1 text-slate-300">
                <div className="flex justify-between">
                  <span className="text-slate-400">Booking Summary:</span>
                  <span className="font-semibold text-white">{service}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Date & Time:</span>
                  <span className="font-semibold text-cyan-300">{selectedDate} · {selectedTime}</span>
                </div>
              </div>
            </div>
          )}

          {/* STEP 6: Confirmation Screen */}
          {step === 6 && (
            <div className="space-y-6 text-center py-2">
              <div className="w-14 h-14 rounded-full bg-emerald-500/20 text-emerald-400 mx-auto flex items-center justify-center border border-emerald-500/30">
                <CheckCircle2 className="w-8 h-8" />
              </div>

              <div>
                <div className="inline-block mb-1.5">
                  {bookedResult?.isSimulated ? (
                    <span className="px-2.5 py-0.5 rounded text-[11px] font-mono uppercase tracking-wider bg-amber-500/15 text-amber-300 border border-amber-500/30">
                      DEMO MODE (Simulated Booking)
                    </span>
                  ) : (
                    <span className="px-2.5 py-0.5 rounded text-[11px] font-mono uppercase tracking-wider bg-emerald-500/15 text-emerald-300 border border-emerald-500/30">
                      LIVE GOOGLE CALENDAR EVENT CREATED
                    </span>
                  )}
                </div>
                <h3 className="text-2xl font-extrabold text-white mt-1">
                  Appointment Confirmed
                </h3>
                <p className="text-xs text-slate-300 mt-1 max-w-sm mx-auto">
                  {bookedResult?.isSimulated
                    ? 'Appointment created in simulated demo mode. Connect Google in Settings to sync to real Google Calendar & Sheets.'
                    : 'Created in clinic Google Calendar with calendar invitations sent to attendee!'}
                </p>
              </div>

              {/* Confirmation card */}
              <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 text-left space-y-3 max-w-md mx-auto shadow-inner">
                <div className="flex items-center justify-between border-b border-slate-800 pb-2.5">
                  <span className="text-xs font-bold text-white tracking-wide">CarePlus Clinic</span>
                  <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300">
                    Confirmed
                  </span>
                </div>

                <div className="space-y-1.5 text-xs">
                  <div className="flex justify-between">
                    <span className="text-slate-400">Patient:</span>
                    <span className="text-white font-medium">{fullName} ({patientType === 'new' ? 'New' : 'Existing'})</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Service:</span>
                    <span className="text-cyan-300 font-medium">{service}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Date:</span>
                    <span className="text-white font-medium">{selectedDate}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Time:</span>
                    <span className="text-white font-semibold font-mono">{selectedTime}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Clinic Location:</span>
                    <span className="text-slate-300 text-right">Suite 400, Medical Plaza Blvd</span>
                  </div>
                  {bookedResult?.calendarLink && (
                    <div className="pt-2 border-t border-slate-800 flex justify-between items-center text-xs">
                      <span className="text-cyan-400 font-medium">Google Calendar:</span>
                      <a 
                        href={bookedResult.calendarLink} 
                        target="_blank" 
                        rel="noreferrer" 
                        className="text-blue-400 underline hover:text-blue-300"
                      >
                        View Event ↗
                      </a>
                    </div>
                  )}
                </div>

                {/* Simulated vs Real Notification Box */}
                <div className="pt-2 border-t border-slate-800">
                  <div className="p-2.5 bg-emerald-950/40 border border-emerald-500/30 rounded-xl flex items-start gap-2.5 text-[11px] text-emerald-200 text-left">
                    <MessageSquare className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                    <div>
                      <div className="font-semibold text-white">
                        {bookedResult?.isSimulated ? 'Simulated Confirmation Sent' : 'Live Gmail & Calendar Dispatched'}
                      </div>
                      <div className="text-emerald-300/80 mt-0.5">
                        "Hi {fullName}, your {service} at CarePlus Clinic is confirmed for {selectedDate} at {selectedTime}."
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
                <button
                  onClick={downloadCalendarFile}
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-4 py-2.5 text-xs font-semibold text-white bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-xl transition-colors cursor-pointer"
                >
                  <Download className="w-4 h-4 text-cyan-400" />
                  <span>Add to Calendar</span>
                </button>

                <button
                  onClick={() => {
                    resetAndClose();
                    setCurrentView('admin');
                    setAdminTab('appointments');
                  }}
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-4 py-2.5 text-xs font-semibold text-cyan-300 bg-cyan-950/60 hover:bg-cyan-900/60 border border-cyan-800/60 rounded-xl transition-colors cursor-pointer"
                >
                  <span>View in Admin Dashboard</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>

                <button
                  onClick={resetAndClose}
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-2.5 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-500 rounded-xl transition-colors cursor-pointer"
                >
                  <span>Return Home</span>
                </button>
              </div>

              {showCalendarDownloadMessage && (
                <div className="text-[11px] text-emerald-400 animate-in fade-in">
                  ✓ Calendar event (.ics) downloaded to your device!
                </div>
              )}
            </div>
          )}

        </div>

        {/* Modal Footer Controls (for steps 1-5) */}
        {step < 6 && (
          <div className="px-6 py-4 border-t border-slate-800 flex items-center justify-between bg-slate-900/40">
            {step > 1 ? (
              <button
                onClick={handlePrevStep}
                className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-400 hover:text-white transition-colors cursor-pointer"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>Back</span>
              </button>
            ) : <div />}

            <button
              onClick={handleNextStep}
              className="inline-flex items-center gap-2 px-5 py-2.5 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-500 rounded-xl shadow-lg shadow-blue-600/25 transition-all cursor-pointer"
            >
              <span>{step === 5 ? 'Confirm Booking' : 'Continue'}</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        )}

      </div>
    </div>
  );
};
