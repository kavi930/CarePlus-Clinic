import React, { useState } from 'react';
import { useClinic } from '../../context/ClinicContext';
import { 
  MessageSquareReply, 
  Clock, 
  Send, 
  CheckCircle2, 
  Sparkles, 
  Smartphone, 
  ToggleLeft, 
  ToggleRight,
  ArrowRight,
  Bot
} from 'lucide-react';

export const FollowUpDemoTab: React.FC = () => {
  const { followUpSequences, toggleSequence } = useClinic();
  const [activePreviewMsg, setActivePreviewMsg] = useState<string>(
    followUpSequences[0]?.messages[0]?.text || "Hi Rahul, just checking whether you'd still like to schedule your appointment."
  );
  const [activePreviewSender, setActivePreviewSender] = useState<string>('CarePlus Clinic');

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-white tracking-tight">Automated Follow-up Sequences</h2>
          <p className="text-xs text-slate-400">
            Re-engage unbooked patient inquiries and eliminate clinic no-shows on autopilot.
          </p>
        </div>

        <span className="text-xs font-mono text-cyan-400 bg-cyan-950/60 border border-cyan-800/80 px-3 py-1.5 rounded-xl">
          Automated Recovery Active
        </span>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* Left Column: Sequences Configuration (7 cols) */}
        <div className="lg:col-span-7 space-y-5">
          {followUpSequences.map((seq) => (
            <div
              key={seq.id}
              className={`bg-[#111827] border rounded-2xl p-6 transition-all ${
                seq.isEnabled
                  ? 'border-slate-800 shadow-md'
                  : 'border-slate-800/60 opacity-70'
              }`}
            >
              <div className="flex items-start justify-between gap-4 pb-4 border-b border-slate-800">
                <div>
                  <h3 className="text-base font-bold text-white flex items-center gap-2">
                    {seq.name}
                    {seq.isEnabled ? (
                      <span className="text-[10px] font-mono font-medium px-2 py-0.5 rounded bg-emerald-500/15 text-emerald-300">
                        Enabled
                      </span>
                    ) : (
                      <span className="text-[10px] font-mono font-medium px-2 py-0.5 rounded bg-slate-800 text-slate-400">
                        Disabled
                      </span>
                    )}
                  </h3>
                  <p className="text-xs text-slate-400 mt-1">
                    <strong className="text-slate-300">Trigger:</strong> {seq.triggerDesc}
                  </p>
                </div>

                {/* Enable/Disable Toggle */}
                <button
                  onClick={() => toggleSequence(seq.id)}
                  className="cursor-pointer focus:outline-none"
                  title="Enable or disable sequence"
                >
                  {seq.isEnabled ? (
                    <ToggleRight className="w-8 h-8 text-cyan-400" />
                  ) : (
                    <ToggleLeft className="w-8 h-8 text-slate-600" />
                  )}
                </button>
              </div>

              {/* Messages in this sequence */}
              <div className="mt-4 space-y-3">
                <div className="text-[11px] font-mono text-slate-400 uppercase tracking-wider font-semibold">
                  Dispatched Sequence Messages:
                </div>
                {seq.messages.map((m) => (
                  <div
                    key={m.id}
                    onClick={() => {
                      setActivePreviewMsg(m.text);
                      setActivePreviewSender(seq.name);
                    }}
                    className="p-3.5 rounded-xl bg-slate-900 border border-slate-800 hover:border-cyan-500/50 cursor-pointer transition-colors group"
                  >
                    <div className="flex items-center justify-between text-xs text-slate-400 font-mono mb-1.5">
                      <span className="text-cyan-300 font-semibold">
                        Message 0{m.stepIndex} · {m.channel}
                      </span>
                      <span>Timing: {m.delay}</span>
                    </div>
                    <p className="text-xs text-slate-200 leading-relaxed italic group-hover:text-white">
                      "{m.text}"
                    </p>
                    <div className="text-[10px] text-cyan-400/80 mt-2 text-right">
                      Click to preview on patient phone →
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* Right Column: Interactive Patient Mobile Device Simulator (5 cols) */}
        <div className="lg:col-span-5 bg-[#111827] border border-slate-800 rounded-2xl p-6 shadow-xl sticky top-24">
          <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-800">
            <div className="flex items-center gap-2">
              <Smartphone className="w-4 h-4 text-cyan-400" />
              <span className="text-xs font-bold text-white">Patient Mobile Simulator</span>
            </div>
            <span className="text-[10px] font-mono text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded">
              WhatsApp Verified
            </span>
          </div>

          <p className="text-xs text-slate-400 mb-4">
            Demonstrates how an unbooked patient experiences the automated follow-up:
          </p>

          {/* Smartphone Frame */}
          <div className="w-full max-w-[320px] mx-auto bg-black rounded-[32px] p-3 border-4 border-slate-800 shadow-2xl relative">
            {/* Top speaker notch */}
            <div className="w-20 h-4 bg-slate-900 mx-auto rounded-b-xl mb-2 flex items-center justify-center">
              <div className="w-8 h-1 bg-slate-700 rounded-full" />
            </div>

            {/* Chat header */}
            <div className="bg-[#1f2c34] p-2.5 rounded-t-xl flex items-center gap-2.5 border-b border-slate-700">
              <div className="w-7 h-7 rounded-full bg-cyan-600 text-white flex items-center justify-center font-bold text-xs">
                CP
              </div>
              <div className="flex-1">
                <div className="text-xs font-bold text-white leading-tight">CarePlus Clinic</div>
                <div className="text-[10px] text-emerald-400">Verified Business Account</div>
              </div>
            </div>

            {/* Message screen */}
            <div className="bg-[#0b141a] p-3 rounded-b-xl min-h-[300px] flex flex-col justify-end space-y-3">
              <div className="bg-[#005c4b] text-white p-3 rounded-xl rounded-tl-sm text-xs leading-relaxed shadow-sm">
                <p>{activePreviewMsg}</p>
                <div className="text-[9px] text-emerald-200 mt-1.5 text-right font-mono">
                  10:14 AM · Delivered ✓✓
                </div>
              </div>

              <div className="flex items-center gap-1.5 pt-2 border-t border-slate-800/60">
                <div className="flex-1 bg-[#1f2c34] rounded-full px-3 py-1.5 text-[10px] text-slate-400">
                  Reply to CarePlus Clinic...
                </div>
                <div className="w-6 h-6 rounded-full bg-[#00a884] flex items-center justify-center text-white text-[11px]">
                  ➤
                </div>
              </div>
            </div>
          </div>

          <div className="mt-4 p-3 bg-slate-900 rounded-xl border border-slate-800 text-[11px] text-slate-400 text-center">
            Clinic owners love this: Inquiries who got distracted receive gentle automated nudges, recovering lost revenue.
          </div>
        </div>

      </div>
    </div>
  );
};
