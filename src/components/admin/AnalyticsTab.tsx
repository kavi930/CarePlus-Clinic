import React from 'react';
import { ANALYTICS_DATA } from '../../data/mockData';
import { BarChart3, TrendingUp, Users, CalendarCheck, Clock, ArrowRight } from 'lucide-react';

export const AnalyticsTab: React.FC = () => {
  const { kpis, funnel, sources, servicesBreakdown } = ANALYTICS_DATA;

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="text-xs font-mono font-semibold uppercase tracking-wider text-cyan-400">
            Conversion & Channel Intelligence
          </div>
          <h2 className="text-xl sm:text-2xl font-extrabold text-white tracking-tight mt-1">
            Clinic Booking Analytics & Funnel
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Simulated performance showing how automation increases appointment throughput.
          </p>
        </div>

        <span className="text-xs font-mono text-slate-400 bg-slate-900 border border-slate-800 px-3 py-1.5 rounded-xl">
          Fictional Demo Metrics
        </span>
      </div>

      {/* Funnel Chart: Traffic -> Inquiries -> Qualified -> Booking Started -> Booked */}
      <div className="bg-[#111827] border border-slate-800 rounded-2xl p-6 shadow-sm">
        <div className="flex items-center justify-between mb-6 pb-4 border-b border-slate-800">
          <div>
            <h3 className="text-base font-bold text-white">
              End-to-End Patient Conversion Funnel
            </h3>
            <p className="text-xs text-slate-400">
              Drop-off visualization from website traffic to confirmed clinic consultation
            </p>
          </div>
          <span className="text-xs font-mono text-emerald-400 font-bold bg-emerald-500/10 px-2.5 py-1 rounded-lg">
            36.7% Overall Booking Rate
          </span>
        </div>

        <div className="space-y-4">
          {funnel.map((step, idx) => {
            const widthPct = [100, 78, 58, 42, 28][idx];
            return (
              <div key={step.stage} className="space-y-1.5">
                <div className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-cyan-400 font-bold">0{idx + 1}</span>
                    <span className="font-bold text-white">{step.stage}</span>
                  </div>
                  <div className="flex items-center gap-3 font-mono">
                    <span className="text-white font-bold tabular-nums">{step.count.toLocaleString()}</span>
                    <span className="text-slate-400 text-[11px]">({step.percentage})</span>
                  </div>
                </div>

                <div className="w-full bg-slate-900 h-6 rounded-lg overflow-hidden p-0.5 border border-slate-800/80">
                  <div
                    className="h-full rounded-md bg-gradient-to-r from-blue-600 via-cyan-500 to-blue-500 transition-all duration-500 flex items-center justify-end pr-2 text-[10px] font-bold text-white shadow-sm"
                    style={{ width: `${widthPct}%` }}
                  >
                    {step.count}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Grid: Inquiry Sources Breakdown & Service Distribution */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Inquiry Sources */}
        <div className="bg-[#111827] border border-slate-800 rounded-2xl p-6">
          <h3 className="text-base font-bold text-white mb-1">Inbound Channel Attribution</h3>
          <p className="text-xs text-slate-400 mb-5">Where prospective patients first reach out</p>

          <div className="space-y-3.5">
            {sources.map((src) => (
              <div key={src.name} className="space-y-1">
                <div className="flex justify-between text-xs">
                  <span className="text-slate-300 font-medium">{src.name}</span>
                  <span className="font-mono text-cyan-300 font-semibold">{src.percentage}% ({src.inquiries} inquiries)</span>
                </div>
                <div className="w-full bg-slate-900 h-2 rounded-full overflow-hidden">
                  <div 
                    className="bg-cyan-500 h-full rounded-full"
                    style={{ width: `${src.percentage}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Services Breakdown */}
        <div className="bg-[#111827] border border-slate-800 rounded-2xl p-6">
          <h3 className="text-base font-bold text-white mb-1">Appointment Volume by Service</h3>
          <p className="text-xs text-slate-400 mb-5">Distribution of confirmed consultations</p>

          <div className="space-y-3.5">
            {servicesBreakdown.map((serv) => (
              <div key={serv.service} className="space-y-1">
                <div className="flex justify-between text-xs">
                  <span className="text-slate-300 font-medium">{serv.service}</span>
                  <span className="font-mono text-blue-300 font-semibold">{serv.count} bookings ({serv.percentage}%)</span>
                </div>
                <div className="w-full bg-slate-900 h-2 rounded-full overflow-hidden">
                  <div 
                    className="bg-blue-600 h-full rounded-full"
                    style={{ width: `${serv.percentage}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
};
