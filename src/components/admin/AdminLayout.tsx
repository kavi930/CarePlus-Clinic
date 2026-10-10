import React from 'react';
import { useClinic } from '../../context/ClinicContext';
import { 
  LayoutDashboard, 
  Calendar, 
  Users, 
  GitBranch, 
  BellRing, 
  MessageSquareReply, 
  BarChart3, 
  Settings, 
  ArrowLeft, 
  Sparkles, 
  PlusCircle,
  ShieldAlert
} from 'lucide-react';

interface NavItem {
  id: 'overview' | 'appointments' | 'leads' | 'workflow' | 'notifications' | 'followups' | 'analytics' | 'settings';
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  count?: number;
  badge?: number;
  isSpecial?: boolean;
}

export const AdminLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { 
    adminTab, 
    setAdminTab, 
    setCurrentView, 
    openBookingModal, 
    notifications, 
    leads, 
    appointments 
  } = useClinic();

  const unreadNotifs = notifications.filter(n => !n.read).length;

  const navItems: NavItem[] = [
    { id: 'overview', label: 'Overview', icon: LayoutDashboard },
    { 
      id: 'appointments', 
      label: 'Appointments', 
      icon: Calendar, 
      count: appointments.length 
    },
    { 
      id: 'leads', 
      label: 'Leads / CRM', 
      icon: Users, 
      count: leads.length 
    },
    { 
      id: 'workflow', 
      label: 'Automation Flow', 
      icon: GitBranch, 
      isSpecial: true 
    },
    { 
      id: 'notifications', 
      label: 'Notifications', 
      icon: BellRing, 
      badge: unreadNotifs 
    },
    { id: 'followups', label: 'Follow-up Demo', icon: MessageSquareReply },
    { id: 'analytics', label: 'Analytics', icon: BarChart3 },
    { id: 'settings', label: 'Clinic Settings', icon: Settings },
  ];

  return (
    <div className="min-h-screen bg-[#080B12] text-[#F8FAFC] flex flex-col">
      {/* Top Admin Bar with Demo Mode Indicator */}
      <div className="border-b border-slate-800 bg-[#111827]/80 backdrop-blur-md sticky top-0 z-30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
          
          <div className="flex items-center gap-4">
            <button
              onClick={() => setCurrentView('landing')}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-300 hover:text-white bg-slate-900 border border-slate-800 rounded-xl transition-colors cursor-pointer"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Back to Patient View</span>
              <span className="sm:hidden">Exit</span>
            </button>

            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-sm sm:text-base font-bold text-white tracking-tight">
                  CarePlus Clinic
                </h1>
                <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold uppercase tracking-wider bg-cyan-500/15 text-cyan-300 border border-cyan-500/30">
                  DEMO MODE
                </span>
              </div>
              <p className="text-[11px] text-slate-400 hidden sm:block">
                Automated Inquiry & Appointment Dashboard
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={openBookingModal}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-500 rounded-xl shadow-md transition-colors cursor-pointer"
            >
              <PlusCircle className="w-3.5 h-3.5" />
              <span>+ New Appointment</span>
            </button>
          </div>

        </div>

        {/* Tab Navigation Ribbon */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 border-t border-slate-800/80 overflow-x-auto">
          <nav className="flex items-center gap-1 py-1.5 scrollbar-none">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = adminTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => setAdminTab(item.id)}
                  className={`flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-medium whitespace-nowrap transition-colors cursor-pointer shrink-0 ${
                    isActive
                      ? 'bg-blue-600/20 text-cyan-300 border border-blue-500/40 font-semibold'
                      : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
                  }`}
                >
                  <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-cyan-400' : 'text-slate-400'}`} />
                  <span>{item.label}</span>
                  {item.badge !== undefined && item.badge > 0 && (
                    <span className="px-1.5 py-0.2 rounded-full text-[10px] font-bold bg-blue-600 text-white font-mono tabular-nums">
                      {item.badge}
                    </span>
                  )}
                  {item.count !== undefined && (
                    <span className="text-[10px] text-slate-500 font-mono tabular-nums">
                      {item.count}
                    </span>
                  )}
                  {item.isSpecial && (
                    <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse" />
                  )}
                </button>
              );
            })}
          </nav>
        </div>
      </div>

      {/* Main Admin Content Body */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {children}
      </main>
    </div>
  );
};
