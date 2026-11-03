export type AppointmentStatus =
  | "Pending"
  | "Confirmed"
  | "Completed"
  | "Cancelled"
  | "Rescheduled"
  | "No-show";

export type EnquiryStatus =
  | "New"
  | "Contacted"
  | "Qualified"
  | "Appointment Booked"
  | "Closed";

export type EnquiryClassification =
  | "Appointment Ready"
  | "Needs Information"
  | "Needs Human Assistance"
  | "Potentially Urgent / Medical Safety Escalation";

export interface User {
  id: string;
  username: string;
  name: string;
  role: "admin" | "staff";
  passwordHash: string; // Salted PBKDF2 hash
  salt: string;
  createdAt: string;
}

export interface AuthSession {
  token: string;
  userId: string;
  username: string;
  role: "admin" | "staff";
  name: string;
  expiresAt: string;
}

export interface Department {
  id: string;
  name: string;
  slug: string;
  description: string;
  headDoctorId?: string;
  icon: string;
  isActive: boolean;
}

export interface Treatment {
  id: string;
  name: string;
  slug: string;
  departmentId: string;
  departmentName: string;
  description: string;
  durationMinutes?: number;
  fee?: string; // Optional: only if clinic administrator provides it
  availableDoctorIds: string[];
  icon: string;
  isActive: boolean;
}

// Retain alias for existing imports
export type Service = Treatment;

export interface Doctor {
  id: string;
  name: string;
  credentials: string; // e.g. "MBBS, MD"
  title: string;
  specialty: string;
  department: string;
  bio: string;
  avatarUrl?: string;
  workingDays: number[]; // 0 = Sunday, 1 = Monday, ..., 6 = Saturday
  workingDaysText: string;
  workingHours: {
    start: string; // e.g., "09:00"
    end: string;   // e.g., "18:00"
  };
  breakHours?: {
    start: string; // e.g., "13:30"
    end: string;   // e.g., "14:30"
  };
  slotDurationMinutes: number;
  availableServices: string[];
  isDemo: boolean;
  isActive: boolean;
}

export interface BlockedPeriod {
  id: string;
  doctorId: string; // doctor ID or "all"
  date: string; // YYYY-MM-DD
  startTime?: string;
  endTime?: string;
  allDay: boolean;
  reason: string;
  createdAt: string;
}

export interface ClinicHoliday {
  id: string;
  date: string; // YYYY-MM-DD
  title: string;
  description?: string;
}

export interface StatusHistoryEntry {
  status: AppointmentStatus;
  changed_at: string;
  changed_by: string; // "patient" | "system" | "staff" | username
  reason?: string;
}

export interface Appointment {
  appointment_id: string;
  reference_no: string; // e.g. "APX-20261030-4821"
  patient_name: string;
  phone: string;
  email?: string;
  service_id: string;
  service_name: string;
  doctor_id: string;
  doctor_name: string;
  date: string; // "YYYY-MM-DD"
  time: string; // "10:00 AM" or "10:00"
  duration: number; // in minutes
  status: AppointmentStatus;
  status_history: StatusHistoryEntry[];
  notes?: string;
  preferred_contact: "Email" | "Phone" | "WhatsApp";
  source: "Website Booking" | "AI Receptionist" | "Phone Call" | "Admin Entry" | "Demo Simulation";
  created_at: string;
  updated_at: string;
  consent: boolean;
  confirmation_status: "Pending" | "Sent" | "Simulated" | "Failed";
  reminder_status: "Scheduled" | "Sent 24h" | "Sent 2h" | "Cancelled" | "Pending";
  calendar_event_id?: string;
  calendar_sync_status: "Not Configured" | "Synced" | "Failed" | "Pending" | "Simulated";
  calendar_sync_error?: string;
  whatsapp_delivery_status: "Not Configured" | "Delivered" | "Sent" | "Failed" | "Simulated" | "Pending";
  whatsapp_message_id?: string;
  automation_status: "Completed" | "Pending" | "Simulated" | "Failed";
  cancellation_reason?: string;
  cancelled_at?: string;
  rescheduled_from?: {
    date: string;
    time: string;
  };
}

export interface Enquiry {
  enquiry_id: string;
  name: string;
  phone: string;
  email?: string;
  category?: string;
  question: string;
  service?: string;
  preferred_contact?: "Email" | "Phone" | "WhatsApp";
  source: "Website Form" | "AI Receptionist Widget" | "Callback Request" | "Demo Simulation";
  status: EnquiryStatus;
  classification: EnquiryClassification;
  consent: boolean;
  created_at: string;
  assigned_to?: string;
  conversation?: Array<{
    sender: "patient" | "assistant" | "staff";
    text: string;
    timestamp: string;
  }>;
  follow_up_status: "Pending" | "In Progress" | "Completed";
  notes?: string;
}

export interface AutomationLog {
  id: string;
  timestamp: string;
  workflow: string;
  trigger: string;
  action: string;
  status: "Success" | "Simulated" | "Failed" | "Not Configured";
  result: string;
  payloadSnippet?: Record<string, unknown>;
  error?: string;
}

export interface AuditLog {
  id: string;
  timestamp: string;
  actor: string;
  action: string;
  targetEntity: "appointment" | "doctor" | "treatment" | "settings" | "schedule" | "enquiry" | "auth";
  targetId?: string;
  details: string;
}

export interface ClinicSettings {
  demoMode: boolean;
  clinicName: string;
  leadDoctor: string;
  credentials: string;
  tagline: string;
  phone: string;
  whatsappNumber: string;
  email: string;
  address: string;
  timezone: string; // Default: "Asia/Kolkata"
  operatingHours: string;
  confirmationPolicy: "instant_confirmed" | "pending_staff_approval";
  googleCalendarConnected: boolean;
  emailProviderConfigured: boolean;
  smsProviderConfigured: boolean;
  whatsAppConfigured: boolean;
  chatbotProvider: "rules" | "ai";
  n8nWebhookUrl?: string;
  workflows: Record<string, boolean>;
  bookingBufferHours: number; // e.g. 2 hours min notice
  maxAdvanceDays: number; // e.g. 30 days
}

export interface AnalyticsSummary {
  websiteVisitors: number;
  aiAssistantOpens: number;
  enquiriesCreated: number;
  bookingStarted: number;
  appointmentsBooked: number;
  appointmentsCompleted: number;
  appointmentsCancelled: number;
  appointmentsRescheduled: number;
}
