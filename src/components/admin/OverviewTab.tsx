import React from 'react';
import { useClinic } from '../../context/ClinicContext';
import { 
  Users, 
  CalendarCheck, 
  Clock, 
  TrendingUp, 
  ArrowUpRight, 
  Sparkles, 
  Bot, 
  CheckCircle2, 
  BellRing,
  GitBranch,
  Play
} from 'lucide-react';

export const OverviewTab: React.FC = () => {
  const { 
    setAdminTab, 
    appointments, 
    leads, 
    notifications, 
    openBookingModal, 
    simulateWorkflowRun, 
    isWorkflowSimulating 
  } = useClinic();

  const kpis = [
    {
      title: 'New Inquiries',
      value: '128',
      change: '+24% this week',
      subtext: 'Multi-channel inbound (Demo)',
      icon: Users,
      color: 'text-blue-400',
    },
    {
      title: 'Appointments Booked',
      value: appointments.length.toString(),
      change: '+18% vs last week',
      subtext: 'Auto-scheduled & confirmed',
      icon: CalendarCheck,
      color: 'text-cyan-400',
    },
    {
      title: 'Pending Follow-ups',
      value: '19',
      change: '8 in automated queue',
      subtext: 'Unbooked leads engaged',
      icon: Clock,
      color: 'text-amber-400',
    },
    {
      title: 'Booking Conversion Rate',
      value: '36.7%',
      change: '+12.4% with automation',
      subtext: 'Inquiry-to-confirmed ratio',
      icon: TrendingUp,
      color: 'text-emerald-400',
    },
  ];

  const recentAppointments = appointments.slice(0, 4);

  return (
    <div className="space-y-8">
      {/* Headline & Sales Demonstration Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="text-xs font-mono font-semibold uppercase tracking-wider text-cyan-400">
            CarePlus Executive Console
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight mt-1">
            Clinic Automation Dashboard
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Real-time pipeline: Patient Inquiries → AI Qualification → Instant Booking → Automated Reminders
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={simulateWorkflowRun}
            disabled={isWorkflowSimulating}
            className="inline-flex items-center gap-2 px-3.5 py-2 text-xs font-semibold text-cyan-300 bg-cyan-950/60 hover:bg-cyan-900/60 border border-cyan-800/80 rounded-xl transition-colors cursor-pointer disabled:opacity-60"
          >
            <Play className={`w-3.5 h-3.5 ${isWorkflowSimulating ? 'animate-spin' : ''}`} />
            <span>{isWorkflowSimulating ? 'Simulating Pipeline...' : 'Test Full Pipeline Simulation'}</span>
          </button>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {kpis.map((kpi, idx) => {
          const Icon = kpi.icon;
          return (
            <div
              key={idx}
              className="bg-[#111827] border border-slate-800 rounded-2xl p-5 flex flex-col justify-between hover:border-slate-700 transition-colors shadow-sm"
            >
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-medium text-slate-400">{kpi.title}</span>
                <div className="w-8 h-8 rounded-lg bg-slate-900 border border-slate-800 flex items-center justify-center">
                  <Icon className={`w-4 h-4 ${kpi.color}`} />
                </div>
              </div>

              <div>
                <div className="text-2xl sm:text-3xl font-extrabold text-white font-mono tabular-nums">
                  {kpi.value}
                </div>
                <div className="flex items-center justify-between mt-2 pt-2 border-t border-slate-800/80 text-[11px]">
                  <span className="text-emerald-400 font-semibold">{kpi.change}</span>
                  <span className="text-slate-500 font-mono text-[10px] uppercase">Fictional Demo</span>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Main Grid: Recent Bookings & Live Pipeline Visual */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left Column: Recent Appointments List (7 cols) */}
        <div className="lg:col-span-7 bg-[#111827] border border-slate-800 rounded-2xl p-6 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-5">
              <div>
                <h3 className="text-base font-bold text-white">Today's & Upcoming Appointments</h3>
                <p className="text-xs text-slate-400">Live calendar reservations booked by system</p>
              </div>
              <button
                onClick={() => setAdminTab('appointments')}
                className="text-xs font-semibold text-cyan-400 hover:text-cyan-300 transition-colors flex items-center gap-1 cursor-pointer"
              >
                <span>View All ({appointments.length})</span>
                <ArrowUpRight className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="space-y-3">
              {recentAppointments.map((apt) => (
                <div
                  key={apt.id}
                  className="p-3.5 rounded-xl bg-slate-900/80 border border-slate-800 flex items-center justify-between gap-4 hover:border-slate-700 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl bg-blue-600/20 text-cyan-300 flex items-center justify-center font-bold text-xs shrink-0">
                      {apt.patientName.slice(0, 2).toUpperCase()}
                    </div>
                    <div>
                      <div className="text-xs font-bold text-white flex items-center gap-2">
                        {apt.patientName}
                        <span className="text-[10px] font-normal text-slate-400">
                          ({apt.patientType === 'new' ? 'New Patient' : 'Returning'})
                        </span>
                      </div>
                      <div className="text-[11px] text-slate-400 mt-0.5">
                        {apt.service} · <span className="text-slate-300">{apt.doctorName}</span>
                      </div>
                    </div>
                  </div>

                  <div className="text-right shrink-0">
                    <div className="text-xs font-mono font-semibold text-white">
                      {apt.time}
                    </div>
                    <div className="text-[11px] text-slate-400">
                      {apt.date.split(',')[0]}
                    </div>
                    <span className="inline-block mt-1 px-2 py-0.2 rounded text-[10px] font-medium bg-emerald-500/15 text-emerald-300 border border-emerald-500/20">
                      {apt.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="mt-5 pt-4 border-t border-slate-800 flex items-center justify-between text-xs text-slate-400">
            <span>Automated 24h WhatsApp reminders active</span>
            <button
              onClick={openBookingModal}
              className="text-cyan-400 hover:underline font-medium cursor-pointer"
            >
              + Create booking manually
            </button>
          </div>
        </div>

        {/* Right Column: Automation Pipeline Health & Activity Feed (5 cols) */}
        <div className="lg:col-span-5 bg-[#111827] border border-slate-800 rounded-2xl p-6 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-5">
              <div>
                <h3 className="text-base font-bold text-white">Live Automation Activity</h3>
                <p className="text-xs text-slate-400">Real-time bot inquiries & notifications</p>
              </div>
              <button
                onClick={() => setAdminTab('notifications')}
                className="text-xs font-semibold text-cyan-400 hover:text-cyan-300 transition-colors flex items-center gap-1 cursor-pointer"
              >
                <span>View Center</span>
                <ArrowUpRight className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="space-y-3.5">
              {notifications.slice(0, 4).map((n) => (
                <div key={n.id} className="flex items-start gap-3 text-xs">
                  <div className="w-2 h-2 rounded-full bg-cyan-400 shrink-0 mt-1.5" />
                  <div className="flex-1">
                    <div className="font-semibold text-white flex items-center justify-between">
                      <span>{n.title.replace('🔔 ', '').replace('⚠️ ', '')}</span>
                      <span className="text-[10px] text-slate-500 font-mono">{n.createdAt}</span>
                    </div>
                    <p className="text-slate-400 text-[11px] mt-0.5 leading-relaxed">
                      {n.description}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="mt-6 p-3.5 rounded-xl bg-slate-900 border border-slate-800">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold text-white flex items-center gap-1.5">
                <GitBranch className="w-3.5 h-3.5 text-cyan-400" />
                <span>Workflow System Status</span>
              </span>
              <span className="text-[10px] font-mono text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded">
                Operational
              </span>
            </div>
            <p className="text-[11px] text-slate-400 leading-relaxed">
              7 of 7 workflow nodes active. Average response latency: <strong className="text-slate-200">280ms</strong>. Human handoff hotline connected.
            </p>
            <button
              onClick={() => setAdminTab('workflow')}
              className="mt-2 text-xs font-semibold text-cyan-300 hover:text-cyan-200 flex items-center gap-1 cursor-pointer"
            >
              <span>Inspect Workflow Nodes</span>
              <ArrowUpRight className="w-3 h-3" />
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};
