import React, { createContext, useContext, useState, useEffect } from 'react';
import { 
  Appointment, 
  Lead, 
  NotificationItem, 
  WorkflowNode, 
  FollowUpSequence, 
  ClinicSettings,
  LeadStatus,
  AppointmentStatus,
  PatientType,
  ServiceType,
  AuditRequest
} from '../types/clinic';
import { 
  INITIAL_APPOINTMENTS, 
  INITIAL_LEADS, 
  INITIAL_NOTIFICATIONS, 
  WORKFLOW_NODES, 
  FOLLOW_UP_SEQUENCES, 
  INITIAL_SETTINGS 
} from '../data/mockData';
import { 
  fetchServerStatus, 
  submitServerBooking, 
  ServerStatusResponse 
} from '../services/apiClient';

interface BookingFormData {
  patientType: PatientType;
  service: ServiceType;
  date: string;
  time: string;
  patientName: string;
  patientPhone: string;
  patientEmail: string;
  notes?: string;
  source?: 'Website AI Chat' | 'Booking Form' | 'WhatsApp Inbound';
}

interface ClinicContextType {
  // Navigation & View State
  currentView: 'landing' | 'admin';
  setCurrentView: (view: 'landing' | 'admin') => void;
  adminTab: 'overview' | 'appointments' | 'leads' | 'workflow' | 'followups' | 'notifications' | 'analytics' | 'settings';
  setAdminTab: (tab: 'overview' | 'appointments' | 'leads' | 'workflow' | 'followups' | 'notifications' | 'analytics' | 'settings') => void;
  
  // Modals & Panels
  isBookingModalOpen: boolean;
  openBookingModal: () => void;
  closeBookingModal: () => void;
  
  isAuditModalOpen: boolean;
  openAuditModal: () => void;
  closeAuditModal: () => void;
  
  isChatOpen: boolean;
  openChat: () => void;
  closeChat: () => void;
  toggleChat: () => void;

  selectedLead: Lead | null;
  setSelectedLead: (lead: Lead | null) => void;

  selectedAppointment: Appointment | null;
  setSelectedAppointment: (apt: Appointment | null) => void;

  lastConfirmedAppointment: Appointment | null;
  setLastConfirmedAppointment: (apt: Appointment | null) => void;

  // Server & Integration Diagnostics
  serverStatus: ServerStatusResponse | null;
  refreshServerStatus: () => Promise<void>;
  isRealIntegrationActive: boolean;

  // Data Collections
  appointments: Appointment[];
  leads: Lead[];
  notifications: NotificationItem[];
  workflowNodes: WorkflowNode[];
  followUpSequences: FollowUpSequence[];
  settings: ClinicSettings;
  auditRequests: AuditRequest[];

  // Actions
  bookAppointment: (data: BookingFormData) => Promise<Appointment>;
  updateAppointmentStatus: (id: string, status: AppointmentStatus) => void;
  updateLeadStatus: (id: string, status: LeadStatus) => void;
  assignLead: (id: string, staffName: string) => void;
  addLeadNote: (id: string, note: string) => void;
  createInquiryLead: (name: string, phone: string, inquiry: string, patientType?: PatientType, service?: ServiceType) => Lead;
  
  markNotificationRead: (id: string) => void;
  markAllNotificationsRead: () => void;
  
  toggleSequence: (id: string) => void;
  updateNodeStatus: (id: string, isActive: boolean) => void;
  updateSettings: (newSettings: Partial<ClinicSettings>) => void;
  submitAuditRequest: (req: Omit<AuditRequest, 'id' | 'submittedAt'>) => void;

  // Live simulation trigger
  isWorkflowSimulating: boolean;
  simulateWorkflowRun: () => void;
  activeSimulationStep: number;
}

const ClinicContext = createContext<ClinicContextType | undefined>(undefined);

export const ClinicProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentView, setCurrentView] = useState<'landing' | 'admin'>('landing');
  const [adminTab, setAdminTab] = useState<'overview' | 'appointments' | 'leads' | 'workflow' | 'followups' | 'notifications' | 'analytics' | 'settings'>('overview');

  const [isBookingModalOpen, setIsBookingModalOpen] = useState(false);
  const [isAuditModalOpen, setIsAuditModalOpen] = useState(false);
  const [isChatOpen, setIsChatOpen] = useState(false);

  const [selectedLead, setSelectedLead] = useState<Lead | null>(null);
  const [selectedAppointment, setSelectedAppointment] = useState<Appointment | null>(null);
  const [lastConfirmedAppointment, setLastConfirmedAppointment] = useState<Appointment | null>(null);

  const [serverStatus, setServerStatus] = useState<ServerStatusResponse | null>(null);

  const [appointments, setAppointments] = useState<Appointment[]>(INITIAL_APPOINTMENTS);
  const [leads, setLeads] = useState<Lead[]>(INITIAL_LEADS);
  const [notifications, setNotifications] = useState<NotificationItem[]>(INITIAL_NOTIFICATIONS);
  const [workflowNodes, setWorkflowNodes] = useState<WorkflowNode[]>(WORKFLOW_NODES);
  const [followUpSequences, setFollowUpSequences] = useState<FollowUpSequence[]>(FOLLOW_UP_SEQUENCES);
  const [settings, setSettings] = useState<ClinicSettings>(INITIAL_SETTINGS);
  const [auditRequests, setAuditRequests] = useState<AuditRequest[]>([]);

  const [isWorkflowSimulating, setIsWorkflowSimulating] = useState(false);
  const [activeSimulationStep, setActiveSimulationStep] = useState(0);

  const refreshServerStatus = async () => {
    const status = await fetchServerStatus();
    setServerStatus(status);
  };

  useEffect(() => {
    refreshServerStatus();
  }, []);

  const isRealIntegrationActive = Boolean(serverStatus?.auth?.isGoogleAuthorized);

  // Sync route hash if url has #admin
  useEffect(() => {
    const handleHash = () => {
      if (window.location.hash.toLowerCase().includes('admin')) {
        setCurrentView('admin');
      }
    };
    handleHash();
    window.addEventListener('hashchange', handleHash);
    return () => window.removeEventListener('hashchange', handleHash);
  }, []);

  const openBookingModal = () => setIsBookingModalOpen(true);
  const closeBookingModal = () => setIsBookingModalOpen(false);

  const openAuditModal = () => setIsAuditModalOpen(true);
  const closeAuditModal = () => setIsAuditModalOpen(false);

  const openChat = () => setIsChatOpen(true);
  const closeChat = () => setIsChatOpen(false);
  const toggleChat = () => setIsChatOpen(prev => !prev);

  // Safe Transactional Booking Flow via Server Backend
  const bookAppointment = async (data: BookingFormData): Promise<Appointment> => {
    const nowTime = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const idempotencyKey = `idemp-${data.patientPhone.replace(/\D/g, '')}-${data.date.replace(/\s+/g, '_')}-${data.time.replace(/\s+/g, '_')}`;

    // Call server booking pipeline
    const serverResult = await submitServerBooking({
      patientName: data.patientName,
      patientPhone: data.patientPhone,
      patientEmail: data.patientEmail,
      patientType: data.patientType,
      service: data.service,
      date: data.date,
      time: data.time,
      notes: data.notes,
      idempotencyKey,
    });

    const isSimulated = serverResult.isSimulated;
    const appointmentId = serverResult.appointmentId;
    const leadId = `lead-${Date.now().toString().slice(-4)}`;

    const newAppointment: Appointment = {
      id: appointmentId,
      patientName: data.patientName,
      patientPhone: data.patientPhone,
      patientEmail: data.patientEmail,
      patientType: data.patientType,
      service: data.service,
      date: data.date,
      time: data.time,
      status: 'Confirmed',
      doctorName: serverResult.appointment.doctorName || (data.service === 'Skin Consultation' ? 'Dr. Ananya Mehta' : 'Dr. Rahul Verma'),
      notes: data.notes || 'Booked via patient flow.',
      createdAt: `Today, ${nowTime}`,
      leadId: leadId,
      isSimulated: isSimulated,
      calendarLink: serverResult.integrations.calendar.htmlLink,
      googleEventId: serverResult.integrations.calendar.eventId,
      sheetUpdated: serverResult.integrations.sheets.status === 'confirmed',
      emailSent: serverResult.integrations.email.status === 'confirmed',
      warnings: serverResult.warnings,
    };

    // Check if an existing lead matches by phone
    const existingLeadIndex = leads.findIndex(l => l.phone.trim() === data.patientPhone.trim());
    if (existingLeadIndex !== -1) {
      setLeads(prev => prev.map((l, i) => {
        if (i === existingLeadIndex) {
          return {
            ...l,
            status: 'Booked',
            appointmentId: appointmentId,
            service: data.service,
            timeline: [
              ...l.timeline,
              {
                id: `tl-${Date.now()}`,
                timestamp: nowTime,
                title: isSimulated ? 'Simulated Booking Created' : 'Live Google Calendar Booking Confirmed',
                detail: `Booked for ${data.date} at ${data.time}. ${isSimulated ? '(Simulated Mode)' : 'Synchronized with Google Calendar & Sheets.'}`,
                type: 'booking',
              }
            ]
          };
        }
        return l;
      }));
    } else {
      const newLead: Lead = {
        id: leadId,
        name: data.patientName,
        phone: data.patientPhone,
        email: data.patientEmail,
        patientType: data.patientType,
        service: data.service,
        source: data.source || 'Booking Form',
        status: 'Booked',
        created: `Today, ${nowTime}`,
        assignedTo: newAppointment.doctorName,
        inquirySummary: `Booking for ${data.service} on ${data.date} at ${data.time}`,
        notes: data.notes,
        appointmentId: appointmentId,
        timeline: [
          {
            id: `tl-1-${Date.now()}`,
            timestamp: nowTime,
            title: 'Patient Inquiry Captured',
            detail: `Captured contact details via ${data.source || 'Booking Form'}.`,
            type: 'inquiry',
          },
          {
            id: `tl-2-${Date.now()}`,
            timestamp: nowTime,
            title: isSimulated ? 'Appointment Booked (Demo Mode)' : 'Google Calendar Event Created',
            detail: `Scheduled for ${data.date} at ${data.time}. ${isSimulated ? 'Simulated confirmation dispatched.' : 'Google Calendar event & confirmation email confirmed.'}`,
            type: 'booking',
          },
        ],
      };
      setLeads(prev => [newLead, ...prev]);
    }

    // Add appointment to state
    setAppointments(prev => [newAppointment, ...prev]);

    // Push High-Priority Notification to Staff Dashboard
    const newNotif: NotificationItem = {
      id: `notif-${Date.now()}`,
      title: isSimulated ? '🔔 New Appointment (Demo)' : '🔔 New Appointment Confirmed (Live Google Calendar)',
      description: `${data.patientName} booked a ${data.service}. ${data.date} at ${data.time}. ${isSimulated ? '[Simulated Demo]' : '[Google Calendar Synced]'}`,
      patientName: data.patientName,
      service: data.service,
      date: data.date,
      time: data.time,
      read: false,
      type: 'appointment',
      createdAt: 'Just now',
      appointmentId: appointmentId,
      phone: data.patientPhone,
    };
    setNotifications(prev => [newNotif, ...prev]);
    setLastConfirmedAppointment(newAppointment);

    return newAppointment;
  };

  const createInquiryLead = (
    name: string, 
    phone: string, 
    inquiry: string, 
    patientType: PatientType = 'new', 
    service: ServiceType = 'General Consultation'
  ): Lead => {
    const leadId = `lead-${Date.now().toString().slice(-4)}`;
    const nowTime = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    const newLead: Lead = {
      id: leadId,
      name,
      phone,
      email: `${name.toLowerCase().replace(/\s+/g, '.') || 'patient'}@example.com`,
      patientType,
      service,
      source: 'Website AI Chat',
      status: 'Qualified',
      created: `Today, ${nowTime}`,
      assignedTo: 'Automated Bot',
      inquirySummary: inquiry,
      timeline: [
        {
          id: `tl-inq-${Date.now()}`,
          timestamp: nowTime,
          title: 'AI Chat Inquiry Initiated',
          detail: inquiry,
          type: 'inquiry',
        },
        {
          id: `tl-qual-${Date.now()}`,
          timestamp: nowTime,
          title: 'AI Qualification Completed',
          detail: `Classified as ${patientType} patient for ${service}.`,
          type: 'qualification',
        }
      ]
    };

    setLeads(prev => [newLead, ...prev]);

    const notif: NotificationItem = {
      id: `notif-${Date.now()}`,
      title: '💬 New Inbound Inquiry Qualified',
      description: `${name} inquired via AI Assistant: "${inquiry.slice(0, 60)}..."`,
      patientName: name,
      service,
      date: 'Today',
      time: nowTime,
      read: false,
      type: 'lead',
      createdAt: 'Just now',
      phone,
    };
    setNotifications(prev => [notif, ...prev]);

    return newLead;
  };

  const updateAppointmentStatus = (id: string, status: AppointmentStatus) => {
    setAppointments(prev => prev.map(apt => apt.id === id ? { ...apt, status } : apt));
  };

  const updateLeadStatus = (id: string, status: LeadStatus) => {
    setLeads(prev => prev.map(l => {
      if (l.id === id) {
        const nowTime = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        return {
          ...l,
          status,
          timeline: [
            ...l.timeline,
            {
              id: `tl-status-${Date.now()}`,
              timestamp: nowTime,
              title: `Status Changed to ${status}`,
              detail: `Updated by clinic staff.`,
              type: 'staff',
            }
          ]
        };
      }
      return l;
    }));
  };

  const assignLead = (id: string, staffName: string) => {
    setLeads(prev => prev.map(l => l.id === id ? { ...l, assignedTo: staffName } : l));
  };

  const addLeadNote = (id: string, note: string) => {
    setLeads(prev => prev.map(l => {
      if (l.id === id) {
        const nowTime = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        return {
          ...l,
          notes: l.notes ? `${l.notes}\n${note}` : note,
          timeline: [
            ...l.timeline,
            {
              id: `tl-note-${Date.now()}`,
              timestamp: nowTime,
              title: 'Staff Note Added',
              detail: note,
              type: 'staff',
            }
          ]
        };
      }
      return l;
    }));
  };

  const markNotificationRead = (id: string) => {
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
  };

  const markAllNotificationsRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
  };

  const toggleSequence = (id: string) => {
    setFollowUpSequences(prev => prev.map(s => s.id === id ? { ...s, isEnabled: !s.isEnabled } : s));
  };

  const updateNodeStatus = (id: string, isActive: boolean) => {
    setWorkflowNodes(prev => prev.map(n => n.id === id ? { ...n, isActive } : n));
  };

  const updateSettings = (newSettings: Partial<ClinicSettings>) => {
    setSettings(prev => ({ ...prev, ...newSettings }));
  };

  const submitAuditRequest = (req: Omit<AuditRequest, 'id' | 'submittedAt'>) => {
    const audit: AuditRequest = {
      ...req,
      id: `audit-${Date.now()}`,
      submittedAt: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
    };
    setAuditRequests(prev => [audit, ...prev]);

    // Also push a high priority notification for staff demo!
    const notif: NotificationItem = {
      id: `notif-audit-${Date.now()}`,
      title: '🎯 Free Automation Audit Requested',
      description: `${req.contactName} from "${req.clinicName}" requested an audit (${req.monthlyInquiries} inquiries/mo).`,
      patientName: req.contactName,
      service: 'General Consultation',
      date: 'Today',
      time: 'Just now',
      read: false,
      type: 'lead',
      createdAt: 'Just now',
      phone: req.phone,
    };
    setNotifications(prev => [notif, ...prev]);
  };

  // Workflow Live Simulation Runner (animates nodes 1 through 7)
  const simulateWorkflowRun = () => {
    if (isWorkflowSimulating) return;
    setIsWorkflowSimulating(true);
    setActiveSimulationStep(1);

    const stepInterval = setInterval(() => {
      setActiveSimulationStep(prev => {
        if (prev >= 7) {
          clearInterval(stepInterval);
          setTimeout(() => {
            setIsWorkflowSimulating(false);
            setActiveSimulationStep(0);
          }, 1200);
          return 7;
        }
        return prev + 1;
      });
    }, 900);
  };

  return (
    <ClinicContext.Provider
      value={{
        currentView,
        setCurrentView,
        adminTab,
        setAdminTab,
        isBookingModalOpen,
        openBookingModal,
        closeBookingModal,
        isAuditModalOpen,
        openAuditModal,
        closeAuditModal,
        isChatOpen,
        openChat,
        closeChat,
        toggleChat,
        selectedLead,
        setSelectedLead,
        selectedAppointment,
        setSelectedAppointment,
        lastConfirmedAppointment,
        setLastConfirmedAppointment,
        serverStatus,
        refreshServerStatus,
        isRealIntegrationActive,
        appointments,
        leads,
        notifications,
        workflowNodes,
        followUpSequences,
        settings,
        auditRequests,
        bookAppointment,
        updateAppointmentStatus,
        updateLeadStatus,
        assignLead,
        addLeadNote,
        createInquiryLead,
        markNotificationRead,
        markAllNotificationsRead,
        toggleSequence,
        updateNodeStatus,
        updateSettings,
        submitAuditRequest,
        isWorkflowSimulating,
        simulateWorkflowRun,
        activeSimulationStep,
      }}
    >
      {children}
    </ClinicContext.Provider>
  );
};

export const useClinic = () => {
  const context = useContext(ClinicContext);
  if (!context) {
    throw new Error('useClinic must be used within a ClinicProvider');
  }
  return context;
};
