/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { ClinicProvider, useClinic } from './context/ClinicContext';
import { Navbar } from './components/layout/Navbar';
import { Footer } from './components/layout/Footer';
import { HeroSection } from './components/landing/HeroSection';
import { ProblemSolutionSection } from './components/landing/ProblemSolutionSection';
import { FeaturesSection } from './components/landing/FeaturesSection';
import { ClinicShowcaseSection } from './components/landing/ClinicShowcaseSection';
import { PricingAndFaqSection } from './components/landing/PricingAndFaqSection';

import { AdminLayout } from './components/admin/AdminLayout';
import { OverviewTab } from './components/admin/OverviewTab';
import { AppointmentsTab } from './components/admin/AppointmentsTab';
import { LeadsCrmTab } from './components/admin/LeadsCrmTab';
import { WorkflowBuilderTab } from './components/admin/WorkflowBuilderTab';
import { NotificationCenterTab } from './components/admin/NotificationCenterTab';
import { FollowUpDemoTab } from './components/admin/FollowUpDemoTab';
import { AnalyticsTab } from './components/admin/AnalyticsTab';
import { SettingsTab } from './components/admin/SettingsTab';

import { PatientBookingModal } from './components/booking/PatientBookingModal';
import { AuditModal } from './components/modals/AuditModal';
import { AiChatAssistant } from './components/chat/AiChatAssistant';

const MainAppContent: React.FC = () => {
  const { currentView, adminTab } = useClinic();

  return (
    <div className="min-h-screen bg-[#080B12] text-[#F8FAFC]">
      {currentView === 'landing' ? (
        <div className="flex flex-col min-h-screen">
          <Navbar />
          <main className="flex-1">
            <HeroSection />
            <ProblemSolutionSection />
            <FeaturesSection />
            <ClinicShowcaseSection />
            <PricingAndFaqSection />
          </main>
          <Footer />
        </div>
      ) : (
        <AdminLayout>
          {adminTab === 'overview' && <OverviewTab />}
          {adminTab === 'appointments' && <AppointmentsTab />}
          {adminTab === 'leads' && <LeadsCrmTab />}
          {adminTab === 'workflow' && <WorkflowBuilderTab />}
          {adminTab === 'notifications' && <NotificationCenterTab />}
          {adminTab === 'followups' && <FollowUpDemoTab />}
          {adminTab === 'analytics' && <AnalyticsTab />}
          {adminTab === 'settings' && <SettingsTab />}
        </AdminLayout>
      )}

      {/* Global Interactive Modals and Floating Assistants */}
      <PatientBookingModal />
      <AuditModal />
      <AiChatAssistant />
    </div>
  );
};

export default function App() {
  return (
    <ClinicProvider>
      <MainAppContent />
    </ClinicProvider>
  );
}
