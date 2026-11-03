import fs from "fs";
import path from "path";
import {
  Doctor,
  Treatment,
  Department,
  Appointment,
  Enquiry,
  AutomationLog,
  AuditLog,
  ClinicSettings,
  AnalyticsSummary,
  User,
  BlockedPeriod,
  ClinicHoliday,
  AppointmentStatus,
} from "@/types";
import { hashPassword } from "./auth";

const DATA_DIR = path.join(process.cwd(), ".data");
const DB_FILE = path.join(DATA_DIR, "db.json");

interface DatabaseSchema {
  users: User[];
  doctors: Doctor[];
  departments: Department[];
  services: Treatment[]; // Keep "services" key for backwards compatibility
  appointments: Appointment[];
  enquiries: Enquiry[];
  blockedPeriods: BlockedPeriod[];
  holidays: ClinicHoliday[];
  automationLogs: AutomationLog[];
  auditLogs: AuditLog[];
  settings: ClinicSettings;
  analytics: AnalyticsSummary;
}

// Default Admin and Staff Setup
const defaultAdminSalt = "a1b2c3d4e5f67890";
const defaultAdminHash = hashPassword("ApexHealth@2026", defaultAdminSalt).hash;

const defaultStaffSalt = "b2c3d4e5f67890a1";
const defaultStaffHash = hashPassword("ApexStaff@2026", defaultStaffSalt).hash;

const SEED_USERS: User[] = [
  {
    id: "usr-admin-1",
    username: "admin",
    name: "Dr. Kavita Goswami / Clinic Admin",
    role: "admin",
    passwordHash: defaultAdminHash,
    salt: defaultAdminSalt,
    createdAt: "2026-10-30T00:00:00.000Z",
  },
  {
    id: "usr-staff-1",
    username: "staff",
    name: "Front Desk Staff",
    role: "staff",
    passwordHash: defaultStaffHash,
    salt: defaultStaffSalt,
    createdAt: "2026-10-30T00:00:00.000Z",
  },
];

const SEED_DEPARTMENTS: Department[] = [
  {
    id: "dept-gen-med",
    name: "General Medicine",
    slug: "general-medicine",
    description: "Comprehensive outpatient consultations, clinical diagnostics, fever care, and personalized health management.",
    headDoctorId: "doc-kavita-goswami",
    icon: "Stethoscope",
    isActive: true,
  },
  {
    id: "dept-preventive",
    name: "Preventive Care",
    slug: "preventive-care",
    description: "Routine health examinations, wellness screenings, risk stratifications, and lifestyle guidance.",
    headDoctorId: "doc-kavita-goswami",
    icon: "ShieldCheck",
    isActive: true,
  },
  {
    id: "dept-chronic",
    name: "Chronic Disease Care",
    slug: "chronic-disease-care",
    description: "Continuous care and medical oversight for hypertension, diabetes, thyroid, and metabolic conditions.",
    headDoctorId: "doc-kavita-goswami",
    icon: "Activity",
    isActive: true,
  },
];

// Verified Doctor Profile for Apex Health Clinic
const SEED_DOCTORS: Doctor[] = [
  {
    id: "doc-kavita-goswami",
    name: "Dr. Kavita Goswami",
    credentials: "MBBS, MD",
    title: "Senior Consultant Physician",
    specialty: "Internal Medicine & General Healthcare",
    department: "General Medicine",
    bio: "Dr. Kavita Goswami (MBBS, MD) provides expert clinical evaluations, preventive health management, and outpatient primary care at Apex Health Clinic in Vaishali, Ghaziabad.",
    avatarUrl: "https://images.unsplash.com/photo-1594824813583-12543787a911?auto=format&fit=crop&q=80&w=400",
    workingDays: [1, 2, 3, 4, 5, 6], // Monday through Saturday
    workingDaysText: "Mon - Sat",
    workingHours: { start: "09:30", end: "18:30" },
    breakHours: { start: "13:30", end: "14:30" },
    slotDurationMinutes: 30,
    availableServices: [
      "srv-gen-consult",
      "srv-health-check",
      "srv-chronic-care",
      "srv-follow-up",
    ],
    isDemo: false,
    isActive: true,
  },
];

const SEED_SERVICES: Treatment[] = [
  {
    id: "srv-gen-consult",
    name: "General Medical Consultation",
    slug: "general-medical-consultation",
    departmentId: "dept-gen-med",
    departmentName: "General Medicine",
    description: "Comprehensive evaluation of symptoms, acute illnesses, vital signs, physical examination, and treatment planning.",
    durationMinutes: 30,
    fee: "Fee provided at registration",
    availableDoctorIds: ["doc-kavita-goswami"],
    icon: "Stethoscope",
    isActive: true,
  },
  {
    id: "srv-health-check",
    name: "Preventive Health Review",
    slug: "preventive-health-review",
    departmentId: "dept-preventive",
    departmentName: "Preventive Care",
    description: "Full clinical checkup, review of baseline markers, cardiovascular and metabolic assessment, and lifestyle counsel.",
    durationMinutes: 45,
    fee: "Fee provided at registration",
    availableDoctorIds: ["doc-kavita-goswami"],
    icon: "ShieldCheck",
    isActive: true,
  },
  {
    id: "srv-chronic-care",
    name: "Chronic Condition Care",
    slug: "chronic-condition-care",
    departmentId: "dept-chronic",
    departmentName: "Chronic Disease Care",
    description: "Dedicated follow-up and prescription review for long-term conditions including diabetes, hypertension, and thyroid disorders.",
    durationMinutes: 30,
    fee: "Fee provided at registration",
    availableDoctorIds: ["doc-kavita-goswami"],
    icon: "Activity",
    isActive: true,
  },
  {
    id: "srv-follow-up",
    name: "Follow-up Consultation",
    slug: "follow-up-consultation",
    departmentId: "dept-gen-med",
    departmentName: "General Medicine",
    description: "Evaluation of recovery progress, diagnostic laboratory test review, and prescription adjustments.",
    durationMinutes: 20,
    fee: "Fee provided at registration",
    availableDoctorIds: ["doc-kavita-goswami"],
    icon: "Clock",
    isActive: true,
  },
];

const SEED_APPOINTMENTS: Appointment[] = [
  {
    appointment_id: "apt-101",
    reference_no: "APX-20261028-101",
    patient_name: "Demo Patient (Aarav Sharma)",
    phone: "9876543210",
    email: "aarav.demo@example.com",
    service_id: "srv-gen-consult",
    service_name: "General Medical Consultation",
    doctor_id: "doc-kavita-goswami",
    doctor_name: "Dr. Kavita Goswami",
    date: "2026-10-31",
    time: "10:00 AM",
    duration: 30,
    status: "Confirmed",
    status_history: [
      {
        status: "Confirmed",
        changed_at: "2026-10-28T09:15:00.000Z",
        changed_by: "system",
        reason: "Initial booking confirmed via website",
      },
    ],
    notes: "Routine health consultation regarding seasonal allergy.",
    preferred_contact: "WhatsApp",
    source: "Website Booking",
    created_at: "2026-10-28T09:15:00.000Z",
    updated_at: "2026-10-28T09:15:00.000Z",
    consent: true,
    confirmation_status: "Simulated",
    reminder_status: "Scheduled",
    calendar_sync_status: "Simulated",
    calendar_event_id: "gcal_sim_101",
    whatsapp_delivery_status: "Simulated",
    automation_status: "Simulated",
  },
  {
    appointment_id: "apt-102",
    reference_no: "APX-20261029-102",
    patient_name: "Demo Patient (Pooja Verma)",
    phone: "9812345678",
    email: "pooja.demo@example.com",
    service_id: "srv-chronic-care",
    service_name: "Chronic Condition Care",
    doctor_id: "doc-kavita-goswami",
    doctor_name: "Dr. Kavita Goswami",
    date: "2026-10-31",
    time: "11:30 AM",
    duration: 30,
    status: "Pending",
    status_history: [
      {
        status: "Pending",
        changed_at: "2026-10-29T10:00:00.000Z",
        changed_by: "patient",
        reason: "Requested appointment via booking portal",
      },
    ],
    notes: "Review of blood glucose log and medication dosage.",
    preferred_contact: "Phone",
    source: "Website Booking",
    created_at: "2026-10-29T10:00:00.000Z",
    updated_at: "2026-10-29T10:00:00.000Z",
    consent: true,
    confirmation_status: "Pending",
    reminder_status: "Scheduled",
    calendar_sync_status: "Pending",
    whatsapp_delivery_status: "Pending",
    automation_status: "Pending",
  },
];

const SEED_ENQUIRIES: Enquiry[] = [
  {
    enquiry_id: "enq-301",
    name: "Demo Visitor (Rohit Mehra)",
    phone: "8861608612",
    email: "rohit.demo@example.com",
    category: "General Consultation",
    question: "Do you offer Saturday morning consultation slots with Dr. Kavita Goswami?",
    service: "General Medical Consultation",
    preferred_contact: "WhatsApp",
    source: "Website Form",
    status: "New",
    classification: "Needs Information",
    consent: true,
    created_at: "2026-10-29T14:30:00.000Z",
    follow_up_status: "Pending",
    notes: "Visitor is inquiring about Saturday morning availability in Vaishali.",
  },
];

const SEED_SETTINGS: ClinicSettings = {
  demoMode: true,
  clinicName: "Apex Health Clinic",
  leadDoctor: "Dr. Kavita Goswami",
  credentials: "MBBS, MD",
  tagline: "Quality, Compassionate Healthcare in Vaishali, Ghaziabad",
  phone: "8861608612",
  whatsappNumber: "8861608612",
  email: "contact@apexhealthclinic.in",
  address: "Plot No. 3, Vaishali, Ghaziabad",
  timezone: "Asia/Kolkata",
  operatingHours: "Monday – Saturday: 9:30 AM – 6:30 PM | Sunday: Closed",
  confirmationPolicy: "instant_confirmed",
  googleCalendarConnected: false,
  emailProviderConfigured: false,
  smsProviderConfigured: false,
  whatsAppConfigured: false,
  chatbotProvider: "rules",
  n8nWebhookUrl: "https://your-n8n-instance.example/webhook/apex-health-clinic",
  bookingBufferHours: 2,
  maxAdvanceDays: 30,
  workflows: {
    newAppointment: true,
    appointmentConfirmation: true,
    reminder24h: true,
    reminder2h: true,
    enquiryRouting: true,
    followUpTasks: true,
    cancellationHandling: true,
    rescheduleHandling: true,
  },
};

const SEED_ANALYTICS: AnalyticsSummary = {
  websiteVisitors: 154,
  aiAssistantOpens: 48,
  enquiriesCreated: 12,
  bookingStarted: 22,
  appointmentsBooked: 14,
  appointmentsCompleted: 9,
  appointmentsCancelled: 1,
  appointmentsRescheduled: 1,
};

let globalDb: DatabaseSchema | null = null;

// Concurrency mutex lock to prevent simultaneous overlapping bookings
let bookingMutex = Promise.resolve();

function ensureDataDirectory() {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }
}

function loadDatabase(): DatabaseSchema {
  if (globalDb) {
    return globalDb;
  }

  ensureDataDirectory();

  if (fs.existsSync(DB_FILE)) {
    try {
      const raw = fs.readFileSync(DB_FILE, "utf-8");
      const parsed = JSON.parse(raw);

      // Verify and merge schema fields
      globalDb = {
        users: parsed.users && parsed.users.length ? parsed.users : SEED_USERS,
        doctors: parsed.doctors && parsed.doctors.length ? parsed.doctors : SEED_DOCTORS,
        departments: parsed.departments && parsed.departments.length ? parsed.departments : SEED_DEPARTMENTS,
        services: parsed.services && parsed.services.length ? parsed.services : SEED_SERVICES,
        appointments: parsed.appointments || SEED_APPOINTMENTS,
        enquiries: parsed.enquiries || SEED_ENQUIRIES,
        blockedPeriods: parsed.blockedPeriods || [],
        holidays: parsed.holidays || [],
        automationLogs: parsed.automationLogs || [],
        auditLogs: parsed.auditLogs || [],
        settings: { ...SEED_SETTINGS, ...(parsed.settings || {}) },
        analytics: { ...SEED_ANALYTICS, ...(parsed.analytics || {}) },
      };

      // Ensure Dr. Kavita Goswami is registered in doctors
      if (!globalDb.doctors.some((d) => d.id === "doc-kavita-goswami")) {
        globalDb.doctors.unshift(SEED_DOCTORS[0]);
      }

      // Ensure Apex Health Clinic settings
      globalDb.settings.clinicName = "Apex Health Clinic";
      globalDb.settings.leadDoctor = "Dr. Kavita Goswami";
      globalDb.settings.credentials = "MBBS, MD";
      globalDb.settings.phone = "8861608612";
      globalDb.settings.address = "Plot No. 3, Vaishali, Ghaziabad";

      saveDatabase(globalDb);
      return globalDb;
    } catch (e) {
      console.error("Error reading database file, using seeds:", e);
    }
  }

  globalDb = {
    users: SEED_USERS,
    doctors: SEED_DOCTORS,
    departments: SEED_DEPARTMENTS,
    services: SEED_SERVICES,
    appointments: SEED_APPOINTMENTS,
    enquiries: SEED_ENQUIRIES,
    blockedPeriods: [],
    holidays: [],
    automationLogs: [],
    auditLogs: [],
    settings: SEED_SETTINGS,
    analytics: SEED_ANALYTICS,
  };

  saveDatabase(globalDb);
  return globalDb;
}

function saveDatabase(data: DatabaseSchema): void {
  try {
    ensureDataDirectory();
    // Write atomically
    const tempFile = `${DB_FILE}.tmp.${Date.now()}`;
    fs.writeFileSync(tempFile, JSON.stringify(data, null, 2), "utf-8");
    fs.renameSync(tempFile, DB_FILE);
  } catch (err) {
    console.error("Failed to write to database file:", err);
  }
}

export function _resetDbForTesting() {
  globalDb = null;
  if (fs.existsSync(DB_FILE)) {
    try {
      const raw = fs.readFileSync(DB_FILE, "utf-8");
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed.appointments)) {
        parsed.appointments = parsed.appointments.filter(
          (a: any) =>
            !a.patient_name?.includes("Concurrent Patient") &&
            !a.patient_name?.includes("Verified Persistence Patient") &&
            !a.patient_name?.includes("Audit History Patient")
        );
        fs.writeFileSync(DB_FILE, JSON.stringify(parsed, null, 2));
      }
    } catch {
      // ignore
    }
  }
}

// ==================== AUTH & USER METHODS ====================

export async function findUserByUsername(username: string): Promise<User | null> {
  const db = loadDatabase();
  const user = db.users.find((u) => u.username.toLowerCase() === username.toLowerCase().trim());
  return user || null;
}

export async function getUserById(id: string): Promise<User | null> {
  const db = loadDatabase();
  return db.users.find((u) => u.id === id) || null;
}

// ==================== DOCTORS METHODS ====================

export async function getDoctors(filters?: { serviceId?: string; activeOnly?: boolean }): Promise<Doctor[]> {
  const db = loadDatabase();
  let list = db.doctors;

  if (filters?.activeOnly !== false) {
    list = list.filter((d) => d.isActive !== false);
  }

  if (filters?.serviceId) {
    list = list.filter((d) => d.availableServices.includes(filters.serviceId!));
  }

  return list;
}

export async function getDoctor(id: string): Promise<Doctor | null> {
  const db = loadDatabase();
  return db.doctors.find((d) => d.id === id) || null;
}

export async function updateDoctor(id: string, updates: Partial<Doctor>): Promise<Doctor | null> {
  const db = loadDatabase();
  const idx = db.doctors.findIndex((d) => d.id === id);
  if (idx === -1) return null;

  db.doctors[idx] = { ...db.doctors[idx], ...updates };
  saveDatabase(db);
  return db.doctors[idx];
}

// ==================== DEPARTMENTS & TREATMENTS ====================

export async function getDepartments(): Promise<Department[]> {
  const db = loadDatabase();
  return db.departments.filter((d) => d.isActive !== false);
}

export async function getServices(departmentId?: string): Promise<Treatment[]> {
  const db = loadDatabase();
  let list = db.services.filter((s) => s.isActive !== false);
  if (departmentId) {
    list = list.filter((s) => s.departmentId === departmentId);
  }
  return list;
}

export async function getService(id: string): Promise<Treatment | null> {
  const db = loadDatabase();
  return db.services.find((s) => s.id === id || s.slug === id) || null;
}

export async function saveService(service: Treatment): Promise<Treatment> {
  const db = loadDatabase();
  const idx = db.services.findIndex((s) => s.id === service.id);
  if (idx >= 0) {
    db.services[idx] = { ...db.services[idx], ...service };
  } else {
    db.services.push(service);
  }
  saveDatabase(db);
  return service;
}

// ==================== BLOCKED PERIODS & HOLIDAYS ====================

export async function getBlockedPeriods(doctorId?: string, date?: string): Promise<BlockedPeriod[]> {
  const db = loadDatabase();
  let list = db.blockedPeriods || [];
  if (doctorId) {
    list = list.filter((b) => b.doctorId === doctorId || b.doctorId === "all");
  }
  if (date) {
    list = list.filter((b) => b.date === date);
  }
  return list;
}

export async function addBlockedPeriod(period: Omit<BlockedPeriod, "id" | "createdAt">): Promise<BlockedPeriod> {
  const db = loadDatabase();
  const newPeriod: BlockedPeriod = {
    ...period,
    id: `blk-${Date.now()}`,
    createdAt: new Date().toISOString(),
  };
  db.blockedPeriods = db.blockedPeriods || [];
  db.blockedPeriods.push(newPeriod);
  saveDatabase(db);
  return newPeriod;
}

export async function removeBlockedPeriod(id: string): Promise<boolean> {
  const db = loadDatabase();
  if (!db.blockedPeriods) return false;
  const initialLen = db.blockedPeriods.length;
  db.blockedPeriods = db.blockedPeriods.filter((b) => b.id !== id);
  if (db.blockedPeriods.length !== initialLen) {
    saveDatabase(db);
    return true;
  }
  return false;
}

export async function getHolidays(): Promise<ClinicHoliday[]> {
  const db = loadDatabase();
  return db.holidays || [];
}

// ==================== APPOINTMENTS (TRANSACTION SAFE) ====================

export async function getAppointments(filters?: {
  doctorId?: string;
  date?: string;
  status?: string;
  search?: string;
}): Promise<Appointment[]> {
  const db = loadDatabase();
  let list = db.appointments;

  if (filters?.doctorId) {
    list = list.filter((a) => a.doctor_id === filters.doctorId);
  }
  if (filters?.date) {
    list = list.filter((a) => a.date === filters.date);
  }
  if (filters?.status) {
    list = list.filter((a) => a.status.toLowerCase() === filters.status!.toLowerCase());
  }
  if (filters?.search) {
    const term = filters.search.toLowerCase().trim();
    list = list.filter(
      (a) =>
        a.patient_name.toLowerCase().includes(term) ||
        a.phone.includes(term) ||
        (a.email && a.email.toLowerCase().includes(term)) ||
        (a.reference_no && a.reference_no.toLowerCase().includes(term)) ||
        a.appointment_id.toLowerCase().includes(term)
    );
  }

  return list.sort((a, b) => new Date(`${b.date}T${b.time}`).getTime() - new Date(`${a.date}T${a.time}`).getTime());
}

export async function getAppointmentById(id: string): Promise<Appointment | null> {
  const db = loadDatabase();
  return db.appointments.find((a) => a.appointment_id === id || a.reference_no === id) || null;
}

export interface CreateAppointmentResult {
  success: boolean;
  appointment?: Appointment;
  error?: string;
}

/**
 * Creates an appointment with mutex serialization to safely prevent double-booking.
 */
export async function createAppointment(
  data: Omit<Appointment, "appointment_id" | "reference_no" | "created_at" | "updated_at" | "status_history">
): Promise<CreateAppointmentResult> {
  // Acquire sequential mutex lock
  let unlock: () => void = () => {};
  const currentLock = new Promise<void>((resolve) => {
    unlock = resolve;
  });
  const prevLock = bookingMutex;
  bookingMutex = currentLock;

  await prevLock;

  try {
    const db = loadDatabase();

    // 0. Validate required fields
    if (!data.patient_name || !data.patient_name.trim()) {
      return { success: false, error: "Patient name is required." };
    }
    if (!data.phone || data.phone.trim().length < 7) {
      return { success: false, error: "A valid phone number is required." };
    }

    // 1. Validate past dates (IST basis)
    const todayStr = new Intl.DateTimeFormat("en-CA", { timeZone: "Asia/Kolkata" }).format(new Date());
    if (data.date < todayStr) {
      return { success: false, error: "Appointments cannot be booked for past dates." };
    }

    // 2. Validate doctor schedule
    const doctor = db.doctors.find((d) => d.id === data.doctor_id);
    if (!doctor) {
      return { success: false, error: "Doctor record not found." };
    }

    // Check doctor day of week
    const targetDate = new Date(`${data.date}T12:00:00Z`);
    const dayOfWeek = targetDate.getUTCDay();
    if (!doctor.workingDays.includes(dayOfWeek)) {
      return { success: false, error: `${doctor.name} does not consult on this day of the week.` };
    }

    // Check clinic holidays
    const isHoliday = (db.holidays || []).some((h) => h.date === data.date);
    if (isHoliday) {
      return { success: false, error: "The clinic is closed on this date for a scheduled holiday." };
    }

    // Check doctor blocked periods
    const blockedPeriods = (db.blockedPeriods || []).filter(
      (b) => (b.doctorId === doctor.id || b.doctorId === "all") && b.date === data.date
    );
    if (blockedPeriods.some((b) => b.allDay)) {
      return { success: false, error: `${doctor.name} is unavailable on this date.` };
    }

    // 3. Prevent Overlapping Appointments (Strict conflict check)
    const requestedTime = data.time.toLowerCase().trim();
    const existingConflict = db.appointments.find(
      (a) =>
        a.doctor_id === data.doctor_id &&
        a.date === data.date &&
        a.time.toLowerCase().trim() === requestedTime &&
        a.status !== "Cancelled"
    );

    if (existingConflict) {
      return {
        success: false,
        error: `The ${data.time} appointment slot with ${doctor.name} on ${data.date} has already been reserved. Please choose an alternate slot.`,
      };
    }

    // Generate unique ID and persistent Reference Number
    const now = new Date();
    const appointment_id = `apt-${Date.now().toString(36)}-${Math.random().toString(36).substring(2, 6)}`;
    const dateCode = data.date.replace(/-/g, "");
    const randomCode = Math.floor(1000 + Math.random() * 9000);
    const reference_no = `APX-${dateCode}-${randomCode}`;

    const newAppointment: Appointment = {
      ...data,
      appointment_id,
      reference_no,
      created_at: now.toISOString(),
      updated_at: now.toISOString(),
      status_history: [
        {
          status: data.status,
          changed_at: now.toISOString(),
          changed_by: data.source === "Admin Entry" ? "staff" : "patient",
          reason: `Initial booking created via ${data.source}`,
        },
      ],
    };

    db.appointments.unshift(newAppointment);

    // Update Analytics
    db.analytics.appointmentsBooked = (db.analytics.appointmentsBooked || 0) + 1;

    saveDatabase(db);

    return { success: true, appointment: newAppointment };
  } finally {
    unlock();
  }
}

export async function updateAppointment(
  id: string,
  updates: Partial<Appointment>,
  actor: string = "system",
  reason?: string
): Promise<Appointment | null> {
  const db = loadDatabase();
  const idx = db.appointments.findIndex((a) => a.appointment_id === id || a.reference_no === id);
  if (idx === -1) return null;

  const current = db.appointments[idx];
  const now = new Date().toISOString();

  const statusHistory = [...(current.status_history || [])];
  if (updates.status && updates.status !== current.status) {
    statusHistory.push({
      status: updates.status,
      changed_at: now,
      changed_by: actor,
      reason: reason || updates.cancellation_reason || `Status updated to ${updates.status}`,
    });
  }

  const updated: Appointment = {
    ...current,
    ...updates,
    status_history: statusHistory,
    updated_at: now,
  };

  db.appointments[idx] = updated;

  // Track status analytics
  if (updates.status === "Completed" && current.status !== "Completed") {
    db.analytics.appointmentsCompleted = (db.analytics.appointmentsCompleted || 0) + 1;
  }
  if (updates.status === "Cancelled" && current.status !== "Cancelled") {
    db.analytics.appointmentsCancelled = (db.analytics.appointmentsCancelled || 0) + 1;
  }
  if (updates.status === "Rescheduled" && current.status !== "Rescheduled") {
    db.analytics.appointmentsRescheduled = (db.analytics.appointmentsRescheduled || 0) + 1;
  }

  saveDatabase(db);
  return updated;
}

// ==================== ENQUIRIES ====================

export async function getEnquiries(): Promise<Enquiry[]> {
  const db = loadDatabase();
  return (db.enquiries || []).sort(
    (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
  );
}

export async function getEnquiry(id: string): Promise<Enquiry | null> {
  const db = loadDatabase();
  return (db.enquiries || []).find((e) => e.enquiry_id === id) || null;
}


export async function createEnquiry(enquiryData: Omit<Enquiry, "enquiry_id" | "created_at">): Promise<Enquiry> {
  const db = loadDatabase();
  const enquiry: Enquiry = {
    ...enquiryData,
    enquiry_id: `enq-${Date.now().toString(36)}-${Math.random().toString(36).substring(2, 6)}`,
    created_at: new Date().toISOString(),
  };

  db.enquiries = db.enquiries || [];
  db.enquiries.unshift(enquiry);
  db.analytics.enquiriesCreated = (db.analytics.enquiriesCreated || 0) + 1;

  saveDatabase(db);
  return enquiry;
}

export async function updateEnquiry(id: string, updates: Partial<Enquiry>): Promise<Enquiry | null> {
  const db = loadDatabase();
  const idx = db.enquiries.findIndex((e) => e.enquiry_id === id);
  if (idx === -1) return null;

  db.enquiries[idx] = { ...db.enquiries[idx], ...updates };
  saveDatabase(db);
  return db.enquiries[idx];
}

// ==================== AUDIT & AUTOMATION LOGS ====================

export async function addAuditLog(entry: Omit<AuditLog, "id" | "timestamp">): Promise<AuditLog> {
  const db = loadDatabase();
  const log: AuditLog = {
    ...entry,
    id: `aud-${Date.now()}`,
    timestamp: new Date().toISOString(),
  };
  db.auditLogs = db.auditLogs || [];
  db.auditLogs.unshift(log);
  if (db.auditLogs.length > 500) db.auditLogs.pop();
  saveDatabase(db);
  return log;
}

export async function getAuditLogs(): Promise<AuditLog[]> {
  const db = loadDatabase();
  return db.auditLogs || [];
}

export async function addAutomationLog(entry: Omit<AutomationLog, "id" | "timestamp">): Promise<AutomationLog> {
  const db = loadDatabase();
  const log: AutomationLog = {
    ...entry,
    id: `log-${Date.now()}-${Math.random().toString(36).substring(2, 5)}`,
    timestamp: new Date().toISOString(),
  };

  db.automationLogs = db.automationLogs || [];
  db.automationLogs.unshift(log);
  if (db.automationLogs.length > 200) db.automationLogs.pop();

  saveDatabase(db);
  return log;
}

export async function getAutomationLogs(limit?: number): Promise<AutomationLog[]> {
  const db = loadDatabase();
  const logs = db.automationLogs || [];
  return typeof limit === "number" ? logs.slice(0, limit) : logs;
}

// ==================== SETTINGS & ANALYTICS ====================

export async function getSettings(): Promise<ClinicSettings> {
  const db = loadDatabase();
  return db.settings;
}

export async function updateSettings(updates: Partial<ClinicSettings>): Promise<ClinicSettings> {
  const db = loadDatabase();
  db.settings = { ...db.settings, ...updates };
  saveDatabase(db);
  return db.settings;
}

export async function getAnalytics(): Promise<AnalyticsSummary> {
  const db = loadDatabase();
  return db.analytics;
}

export async function trackEvent(eventType: keyof AnalyticsSummary): Promise<void> {
  const db = loadDatabase();
  if (typeof db.analytics[eventType] === "number") {
    db.analytics[eventType] = (db.analytics[eventType] || 0) + 1;
    saveDatabase(db);
  }
}

export const trackAnalyticsEvent = trackEvent;


export async function isSlotAvailable(
  doctorId: string,
  date: string,
  time: string,
  excludeAppointmentId?: string
): Promise<boolean> {
  const db = loadDatabase();
  const todayStr = new Intl.DateTimeFormat("en-CA", { timeZone: "Asia/Kolkata" }).format(new Date());
  if (date < todayStr) return false;

  const doctor = db.doctors.find((d) => d.id === doctorId);
  if (!doctor || !doctor.isActive) return false;

  const targetDate = new Date(`${date}T12:00:00Z`);
  const dayOfWeek = targetDate.getUTCDay();
  if (!doctor.workingDays.includes(dayOfWeek)) return false;

  const reqTime = time.toLowerCase().trim();
  const conflict = db.appointments.find(
    (a) =>
      a.doctor_id === doctorId &&
      a.date === date &&
      a.time.toLowerCase().trim() === reqTime &&
      a.status !== "Cancelled" &&
      a.appointment_id !== excludeAppointmentId &&
      a.reference_no !== excludeAppointmentId
  );
  return !conflict;
}

export const getAppointment = getAppointmentById;

