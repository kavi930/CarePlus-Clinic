"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  LayoutDashboard,
  Calendar,
  MessageSquare,
  Users,
  Stethoscope,
  Settings,
  Zap,
  ShieldCheck,
  Menu,
  X,
  ChevronRight,
  LogOut,
  Clock,
  Layers,
  UserCheck,
} from "lucide-react";

const navItems = [
  { href: "/dashboard", label: "Overview", icon: LayoutDashboard, exact: true },
  { href: "/dashboard/appointments", label: "Appointments", icon: Calendar },
  { href: "/dashboard/enquiries", label: "Enquiries & Triage", icon: MessageSquare },
  { href: "/dashboard/schedule", label: "Doctor Schedules & Breaks", icon: Clock },
  { href: "/dashboard/treatments", label: "Treatments & Departments", icon: Layers },
  { href: "/dashboard/automations", label: "Integrations & Logs", icon: Zap },
  { href: "/dashboard/settings", label: "Clinic Settings", icon: Settings },
];

interface DashboardSidebarProps {
  children: React.ReactNode;
}

export default function DashboardSidebar({ children }: DashboardSidebarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [demoMode, setDemoMode] = useState(true);
  const [currentUser, setCurrentUser] = useState<{ name: string; username: string; role: string } | null>(null);

  useEffect(() => {
    fetch("/api/settings")
      .then((r) => r.json())
      .then((d) => {
        if (d.success) setDemoMode(d.settings.demoMode);
      })
      .catch(() => {});

    fetch("/api/auth/me")
      .then((r) => r.json())
      .then((d) => {
        if (d.success && d.user) {
          setCurrentUser(d.user);
        } else {
          // If not logged in and on protected dashboard subpages, route to login
          if (pathname !== "/dashboard/login") {
            router.push("/dashboard/login");
          }
        }
      })
      .catch(() => {});
  }, [pathname, router]);

  const handleLogout = async () => {
    try {
      await fetch("/api/auth/logout", { method: "POST" });
      router.push("/dashboard/login");
    } catch (e) {
      console.error("Logout failed:", e);
    }
  };

  const isActive = (item: { href: string; exact?: boolean }) => {
    if (item.exact) return pathname === item.href;
    return pathname.startsWith(item.href);
  };

  // If on login page, render clean layout without sidebar
  if (pathname === "/dashboard/login") {
    return <div className="min-h-screen bg-slate-100">{children}</div>;
  }

  return (
    <div className="flex min-h-screen bg-slate-100">
      {/* Sidebar Overlay (mobile) */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 w-64 bg-slate-900 text-white flex flex-col transition-transform duration-200 ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        } lg:translate-x-0 lg:static lg:z-auto`}
      >
        {/* Logo */}
        <div className="p-5 border-b border-slate-800 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2.5 group">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-700 to-teal-600 flex items-center justify-center shadow-xs">
              <ShieldCheck className="w-5 h-5 text-teal-200" />
            </div>
            <div>
              <div className="font-bold text-white text-sm">Apex Health</div>
              <div className="text-[9px] text-teal-400 font-semibold tracking-wider uppercase">
                CLINIC CRM
              </div>
            </div>
          </Link>
          <button
            onClick={() => setSidebarOpen(false)}
            className="lg:hidden p-1.5 hover:bg-slate-800 rounded-lg text-slate-400"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Demo Mode Persistent Badge */}
        {demoMode && (
          <div className="mx-4 mt-4 px-3 py-2 bg-teal-500/10 border border-teal-500/20 rounded-xl">
            <div className="flex items-center gap-1.5">
              <span className="w-2 h-2 bg-teal-400 rounded-full animate-pulse" />
              <span className="text-teal-300 text-xs font-bold tracking-wide">DEMO MODE ACTIVE</span>
            </div>
            <p className="text-slate-400 text-[10px] mt-0.5">Database is persistent. Integrations simulate dispatch.</p>
          </div>
        )}

        {/* Nav */}
        <nav className="flex-1 p-4 space-y-1 overflow-y-auto mt-2">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => setSidebarOpen(false)}
              className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-medium transition-all ${
                isActive(item)
                  ? "bg-blue-900 text-white shadow-xs font-semibold"
                  : "text-slate-400 hover:text-white hover:bg-slate-800"
              }`}
            >
              <item.icon className="w-4 h-4 shrink-0 text-teal-400" />
              {item.label}
            </Link>
          ))}
        </nav>

        {/* User Card & Logout */}
        <div className="p-4 border-t border-slate-800 space-y-3">
          {currentUser ? (
            <div className="flex items-center justify-between text-xs text-slate-300 bg-slate-800/80 p-2.5 rounded-xl border border-slate-700/60">
              <div className="space-y-0.5">
                <div className="font-bold text-white truncate max-w-[120px]">{currentUser.name}</div>
                <div className="text-[10px] text-teal-400 uppercase font-semibold">{currentUser.role}</div>
              </div>
              <button
                onClick={handleLogout}
                className="p-1.5 text-slate-400 hover:text-red-400 hover:bg-slate-700 rounded-lg transition"
                title="Log Out"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <Link
              href="/dashboard/login"
              className="w-full flex items-center justify-center gap-2 py-2 px-3 rounded-xl bg-slate-800 text-slate-300 text-xs font-semibold hover:bg-slate-700 transition"
            >
              Staff Login
            </Link>
          )}

          <Link
            href="/"
            className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs text-slate-400 hover:text-white transition"
          >
            <ChevronRight className="w-3.5 h-3.5 rotate-180" />
            Public Website
          </Link>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top Header */}
        <header className="sticky top-0 z-30 bg-white border-b border-slate-200 px-4 sm:px-6 h-14 flex items-center justify-between shadow-2xs">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setSidebarOpen(true)}
              className="lg:hidden p-2 rounded-lg hover:bg-slate-100 text-slate-500"
            >
              <Menu className="w-5 h-5" />
            </button>
            <div className="text-sm font-semibold text-slate-800 hidden sm:block">
              Apex Health Clinic Management Portal
            </div>
          </div>
          <div className="flex items-center gap-3 text-xs">
            {demoMode && (
              <span className="px-2.5 py-0.5 bg-teal-50 text-teal-800 font-bold rounded-full border border-teal-200 text-[11px]">
                DEMO SYSTEM
              </span>
            )}
            <span className="text-slate-500 hidden md:inline">
              Plot No. 3, Vaishali • 8861608612
            </span>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 p-4 sm:p-6 overflow-auto">{children}</main>
      </div>
    </div>
  );
}
