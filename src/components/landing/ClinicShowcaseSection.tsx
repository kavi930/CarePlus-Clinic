import React from 'react';
import { useClinic } from '../../context/ClinicContext';
import { Check, ArrowRight, Stethoscope, Sparkles, Activity } from 'lucide-react';

export const ClinicShowcaseSection: React.FC = () => {
  const { openBookingModal, openChat } = useClinic();

  const verticals = [
    {
      title: 'Dermatology & Aesthetic Clinics',
      image: '/src/assets/images/dermatology_clinic_1791455493265.jpg',
      badge: 'High Inquiry Volume',
      description: 'Handles frequent pricing queries on acne treatments, chemical peels, and laser sessions without receptionist overload.',
      benefits: [
        'Automated treatment consultation fee answers',
        'Pre-qualification for aesthetic treatments',
        'Automated pre-care & post-procedure instructions',
        'Instant human handoff for sensitive skin queries',
      ],
      sampleQuery: 'What is the consultation fee for acne scar laser treatment?',
    },
    {
      title: 'Modern Dental Clinics',
      image: '/src/assets/images/dental_clinic_1791455509356.jpg',
      badge: 'High Repeat Booking',
      description: 'Streamlines routine cleaning, whitening, orthodontic consultations, and emergency triage scheduling.',
      benefits: [
        'Slot matching by appointment type (Cleaning vs. Root Canal)',
        'Emergency triage classification with immediate front-desk alert',
        'Automated 6-month preventive checkup reminders',
        'Patient intake details collected before arrival',
      ],
      sampleQuery: 'Do you have an opening for a routine dental cleaning this week?',
    },
    {
      title: 'Physiotherapy & Rehab Centers',
      image: '/src/assets/images/physiotherapy_clinic_1791455521342.jpg',
      badge: 'Multi-Session Plans',
      description: 'Coordinates recurring therapy blocks, sports injury initial assessments, and recovery check-ins.',
      benefits: [
        'Initial assessment vs. recurring rehab session routing',
        'Doctor / therapist schedule allocation',
        'Automated session confirmation and calendar sync',
        'Post-treatment exercise reminder sequences',
      ],
      sampleQuery: 'Can I book an assessment for a sports knee strain?',
    },
  ];

  return (
    <section id="for-clinics" className="py-20 bg-[#080B12] border-t border-slate-800/60 relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="max-w-3xl mx-auto text-center mb-16">
          <div className="text-xs font-semibold uppercase tracking-wider text-cyan-400 mb-2">
            Tailored For Healthcare Practices
          </div>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
            Built for Clinics That Run on Appointments & Inquiries
          </h2>
          <p className="mt-4 text-base text-slate-300 leading-relaxed">
            One intelligent automation engine, tailored to the specific scheduling rules, services, and administrative workflows of your clinic.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {verticals.map((v, idx) => (
            <div
              key={idx}
              className="bg-[#111827] border border-slate-800 rounded-2xl overflow-hidden flex flex-col justify-between hover:border-slate-700 transition-all duration-200"
            >
              <div>
                {/* Visual Image with Fallback */}
                <div className="relative h-48 w-full bg-slate-900 overflow-hidden">
                  <img
                    src={v.image}
                    alt={v.title}
                    referrerPolicy="no-referrer"
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    onError={(e) => {
                      // Fallback gracefully to styled container if needed
                      (e.target as HTMLElement).style.display = 'none';
                    }}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#111827] via-transparent to-black/20" />
                  <div className="absolute top-3 left-3">
                    <span className="text-[11px] font-semibold tracking-wide px-2.5 py-1 rounded-md bg-slate-900/90 text-cyan-300 border border-cyan-500/30">
                      {v.badge}
                    </span>
                  </div>
                </div>

                {/* Content */}
                <div className="p-6">
                  <h3 className="text-lg font-bold text-white mb-2">{v.title}</h3>
                  <p className="text-xs text-slate-400 leading-relaxed mb-4">
                    {v.description}
                  </p>

                  <div className="space-y-2 mb-6">
                    {v.benefits.map((b, bIdx) => (
                      <div key={bIdx} className="flex items-start gap-2 text-xs text-slate-300">
                        <Check className="w-3.5 h-3.5 text-cyan-400 shrink-0 mt-0.5" />
                        <span>{b}</span>
                      </div>
                    ))}
                  </div>

                  <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800 text-xs">
                    <div className="text-[10px] text-slate-500 uppercase font-mono mb-1">Sample Inquiry Handled:</div>
                    <div className="text-slate-300 italic">"{v.sampleQuery}"</div>
                  </div>
                </div>
              </div>

              <div className="p-6 pt-0">
                <button
                  onClick={openBookingModal}
                  className="w-full py-2.5 px-4 rounded-xl text-xs font-semibold text-white bg-slate-800 hover:bg-slate-700 border border-slate-700/80 transition-colors flex items-center justify-center gap-2 cursor-pointer"
                >
                  <span>Experience Booking Demo</span>
                  <ArrowRight className="w-3.5 h-3.5 text-cyan-400" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
