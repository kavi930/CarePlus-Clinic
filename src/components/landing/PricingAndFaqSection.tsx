import React, { useState } from 'react';
import { useClinic } from '../../context/ClinicContext';
import { Check, ChevronDown, ChevronUp, Sparkles, ArrowRight, ShieldCheck } from 'lucide-react';

export const PricingAndFaqSection: React.FC = () => {
  const { openAuditModal, openBookingModal } = useClinic();
  const [openFaq, setOpenFaq] = useState<number | null>(0);

  const plans = [
    {
      name: 'Starter Implementation',
      tagline: 'For single-practitioner clinics',
      price: '$499',
      period: 'one-time setup + $99/mo',
      highlight: false,
      features: [
        'Dedicated clinic booking page',
        'AI administrative inquiry assistant',
        'Lead capture & qualification workflow',
        'Google / Outlook calendar sync',
        'Instant staff email & SMS alerts',
        'Basic follow-up sequence (1 step)',
        'Zero-medical-advice safety rules',
      ],
      ctaText: 'Get Started with Audit',
    },
    {
      name: 'Growth Automation',
      tagline: 'Most popular for busy practices',
      price: '$899',
      period: 'one-time setup + $199/mo',
      highlight: true,
      features: [
        'Everything in Starter',
        'WhatsApp Business multi-channel integration',
        'Multi-doctor scheduling & room logic',
        'Full 3-step unbooked lead recovery sequence',
        'Automated 24h & 2h WhatsApp reminders',
        'Staff CRM dashboard with live inbox',
        'Custom administrative FAQ training',
        'Human handoff hotline routing',
      ],
      ctaText: 'Book Free Audit to Qualify',
    },
    {
      name: 'Pro Clinic Network',
      tagline: 'For multi-location centers & groups',
      price: '$1,499',
      period: 'one-time setup + $349/mo',
      highlight: false,
      features: [
        'Everything in Growth',
        'Multi-location / multi-branch routing',
        'Custom EHR / PMS integration bridging',
        'Unlimited staff seats & role management',
        'Advanced conversion & channel analytics',
        'Dedicated onboarding engineer',
        'Priority 24/7 SLA & technical support',
      ],
      ctaText: 'Custom Setup Audit',
    },
  ];

  const faqs = [
    {
      q: 'Does the AI assistant provide medical advice or diagnoses?',
      a: 'Strictly no. The system is engineered solely for administrative, informational, and scheduling tasks. It is hardcoded to never diagnose symptoms, prescribe medications, or interpret test results. Any clinical or sensitive question immediately triggers our Human Handoff protocol, transferring the patient to your reception desk or nursing staff.',
    },
    {
      q: 'How does the system integrate with our clinic\'s existing calendar or software?',
      a: 'The system connects with Google Calendar, Microsoft Outlook, and popular clinic management software via clean webhooks and API connectors. Demo appointments show instant 2-way reservation capability.',
    },
    {
      q: 'What happens when a patient asks to speak with a real person?',
      a: 'Whenever a patient clicks "Talk to Staff" or asks a question beyond administrative scope, the AI acknowledges the request, flags the inquiry in your Admin Dashboard, and can send an instant alert or direct WhatsApp handoff to your reception phone.',
    },
    {
      q: 'How does automated follow-up reduce missed bookings?',
      a: 'Up to 60% of patients inquire during high-distraction hours and drop off before picking a slot. The system automatically sends a friendly follow-up message on WhatsApp 1 hour and 24 hours later, recovering approximately 22% of previously lost consultations without extra staff effort.',
    },
    {
      q: 'How quickly can this system be customized for our clinic?',
      a: 'A typical setup takes 3 to 5 business days, including loading your clinic\'s exact consultation fees, doctor schedules, service categories, and address/parking details.',
    },
  ];

  return (
    <section id="faq" className="py-20 bg-[#080B12] border-t border-slate-800/60 relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* --- PRICING SECTION --- */}
        <div className="max-w-3xl mx-auto text-center mb-16">
          <div className="text-xs font-semibold uppercase tracking-wider text-cyan-400 mb-2">
            Done-For-You Implementation
          </div>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
            Transparent Implementation Packages
          </h2>
          <p className="mt-4 text-base text-slate-300">
            Complete setup, staff training, and ongoing automation management tailored to your clinic's patient volume.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-24 items-stretch">
          {plans.map((plan, idx) => (
            <div
              key={idx}
              className={`rounded-2xl p-7 flex flex-col justify-between transition-all duration-200 relative ${
                plan.highlight
                  ? 'bg-gradient-to-b from-[#131f37] to-[#111827] border-2 border-blue-500 shadow-2xl shadow-blue-500/10'
                  : 'bg-[#111827] border border-slate-800 hover:border-slate-700'
              }`}
            >
              {plan.highlight && (
                <div className="absolute -top-3.5 left-1/2 -translate-x-1/2">
                  <span className="bg-gradient-to-r from-blue-600 to-cyan-500 text-white font-bold text-[11px] uppercase tracking-wider px-3 py-1 rounded-full shadow-md">
                    Most Popular for Clinics
                  </span>
                </div>
              )}

              <div>
                <div className="mb-4">
                  <h3 className="text-lg font-bold text-white">{plan.name}</h3>
                  <p className="text-xs text-slate-400 mt-1">{plan.tagline}</p>
                </div>

                <div className="mb-6 pb-6 border-b border-slate-800">
                  <div className="flex items-baseline gap-1">
                    <span className="text-3xl sm:text-4xl font-extrabold text-white font-mono">{plan.price}</span>
                  </div>
                  <div className="text-xs text-slate-400 mt-1">{plan.period}</div>
                </div>

                <div className="space-y-3 mb-8">
                  <div className="text-[11px] font-semibold text-slate-300 uppercase tracking-wider font-mono">
                    Included capabilities:
                  </div>
                  {plan.features.map((f, fIdx) => (
                    <div key={fIdx} className="flex items-start gap-2.5 text-xs text-slate-300">
                      <Check className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />
                      <span>{f}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <button
                  onClick={openAuditModal}
                  className={`w-full py-3 px-4 rounded-xl text-xs font-semibold transition-all cursor-pointer flex items-center justify-center gap-2 ${
                    plan.highlight
                      ? 'bg-blue-600 hover:bg-blue-500 text-white shadow-lg shadow-blue-600/30'
                      : 'bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700'
                  }`}
                >
                  <span>{plan.ctaText}</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* --- FAQ SECTION --- */}
        <div className="max-w-3xl mx-auto mb-24">
          <div className="text-center mb-10">
            <h3 className="text-2xl font-bold text-white">Frequently Asked Questions</h3>
            <p className="text-xs text-slate-400 mt-2">
              Everything clinic owners ask about safety, integrations, and patient experience.
            </p>
          </div>

          <div className="space-y-3">
            {faqs.map((faq, fIdx) => {
              const isOpen = openFaq === fIdx;
              return (
                <div
                  key={fIdx}
                  className="bg-[#111827] border border-slate-800 rounded-xl overflow-hidden transition-colors"
                >
                  <button
                    onClick={() => setOpenFaq(isOpen ? null : fIdx)}
                    className="w-full p-4 sm:p-5 text-left flex items-center justify-between gap-4 cursor-pointer focus:outline-none"
                  >
                    <span className="text-sm font-semibold text-white">{faq.q}</span>
                    {isOpen ? (
                      <ChevronUp className="w-4 h-4 text-cyan-400 shrink-0" />
                    ) : (
                      <ChevronDown className="w-4 h-4 text-slate-400 shrink-0" />
                    )}
                  </button>
                  {isOpen && (
                    <div className="px-4 pb-4 sm:px-5 sm:pb-5 text-xs sm:text-sm text-slate-300 leading-relaxed border-t border-slate-800/80 pt-3">
                      {faq.a}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* --- FINAL CONVERTING SALES CTA BANNER --- */}
        <div className="relative rounded-3xl overflow-hidden border border-blue-500/30 bg-gradient-to-r from-blue-950/80 via-[#111827] to-cyan-950/80 p-8 sm:p-12 text-center shadow-2xl">
          <div className="max-w-2xl mx-auto">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/20 text-cyan-300 text-xs font-semibold mb-4">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Complimentary Clinic Consultation</span>
            </div>

            <h2 className="text-2xl sm:text-4xl font-extrabold text-white tracking-tight">
              BOOK A FREE AUTOMATION AUDIT
            </h2>

            <p className="mt-4 text-sm sm:text-base text-slate-300 leading-relaxed">
              See how this system could be customized for your clinic. We'll map your current patient inquiry drop-offs and show you the exact automated workflow.
            </p>

            <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-4">
              <button
                onClick={openAuditModal}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 py-3.5 text-sm font-bold text-white bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-500 hover:to-cyan-500 rounded-xl shadow-xl shadow-blue-600/30 transition-all cursor-pointer active:scale-95"
              >
                <span>Book Your Free Automation Audit</span>
                <ArrowRight className="w-4 h-4" />
              </button>

              <button
                onClick={openBookingModal}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3.5 text-sm font-semibold text-slate-300 bg-slate-900/90 hover:bg-slate-800 border border-slate-700/80 rounded-xl transition-all cursor-pointer"
              >
                <span>Test Booking Experience</span>
              </button>
            </div>

            <div className="mt-6 flex items-center justify-center gap-4 text-xs text-slate-400">
              <span>✓ No obligation</span>
              <span>·</span>
              <span>✓ 15-minute consultation</span>
              <span>·</span>
              <span>✓ See a live customized demo</span>
            </div>
          </div>
        </div>

      </div>
    </section>
  );
};
