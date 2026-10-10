export type PatientType = 'new' | 'existing';

export type ServiceType = 
  | 'General Consultation' 
  | 'Skin Consultation' 
  | 'Follow-up' 
  | 'Specialist Consultation';

export type AppointmentStatus = 'Confirmed' | 'Pending' | 'Completed' | 'Cancelled';

export interface Appointment {
  id: string;
  patientName: string;
  patientPhone: string;
  patientEmail: string;
  patientType: PatientType;
  service: ServiceType;
  date: string;
  time: string;
  status: AppointmentStatus;
  doctorName: string;
  notes?: string;
  createdAt: string;
  leadId?: string;
  isSimulated?: boolean;
  calendarLink?: string;
  googleEventId?: string;
  sheetUpdated?: boolean;
  emailSent?: boolean;
  warnings?: string[];
}

export type LeadStatus = 
  | 'New'
  | 'Contacted'
  | 'Qualified'
  | 'Booking Requested'
  | 'Booked'
  | 'Follow-up'
  | 'Human Handoff';

export interface LeadTimelineEvent {
  id: string;
  timestamp: string;
  title: string;
  detail: string;
  type: 'inquiry' | 'bot' | 'qualification' | 'booking' | 'system' | 'staff';
}

export interface Lead {
  id: string;
  name: string;
  phone: string;
  email: string;
  patientType: PatientType;
  service: ServiceType;
  source: 'Website AI Chat' | 'Booking Form' | 'WhatsApp Inbound' | 'Instagram DM' | 'Google Ads';
  status: LeadStatus;
  created: string;
  assignedTo: string;
  inquirySummary: string;
  notes?: string;
  appointmentId?: string;
  timeline: LeadTimelineEvent[];
}

export interface NotificationItem {
  id: string;
  title: string;
  description: string;
  patientName: string;
  service: ServiceType;
  date: string;
  time: string;
  read: boolean;
  type: 'appointment' | 'lead' | 'handoff' | 'reminder';
  createdAt: string;
  appointmentId?: string;
  phone?: string;
}

export interface WorkflowNode {
  id: string;
  stepNumber: number;
  label: string;
  subtitle: string;
  trigger: string;
  actions: string[];
  description: string;
  isActive: boolean;
  metrics: {
    executionsToday: number;
    successRate: string;
    avgLatency: string;
  };
}

export interface FollowUpSequence {
  id: string;
  name: string;
  triggerDesc: string;
  targetAudience: string;
  isEnabled: boolean;
  messages: Array<{
    id: string;
    stepIndex: number;
    delay: string;
    text: string;
    channel: 'WhatsApp' | 'SMS';
  }>;
}

export interface ClinicSettings {
  clinicName: string;
  specialty: string;
  doctors: string[];
  hours: string;
  phone: string;
  email: string;
  address: string;
  consultationFee: string;
  aiSafetyEnabled: boolean;
  allowDirectBooking: boolean;
  autoWhatsAppReminder: boolean;
  humanHandoffAlertPhone: string;
  webhookUrl: string;
}

export interface AuditRequest {
  id: string;
  clinicName: string;
  contactName: string;
  phone: string;
  email: string;
  monthlyInquiries: string;
  currentBookingMethod: string;
  notes?: string;
  submittedAt: string;
}
