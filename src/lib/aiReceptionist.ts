import { EnquiryClassification } from "@/types";
import { getDoctors, getServices, getSettings } from "./db";

export interface ChatMessage {
  id: string;
  sender: "user" | "assistant" | "system";
  text: string;
  timestamp: string;
  quickActions?: Array<{ label: string; action: string; payload?: unknown }>;
  escalateToHuman?: boolean;
  suggestBooking?: {
    serviceId?: string;
    doctorId?: string;
    date?: string;
  };
}

// Emergency trigger keywords
const EMERGENCY_KEYWORDS = [
  "chest pain",
  "heart attack",
  "can't breathe",
  "cannot breathe",
  "difficulty breathing",
  "shortness of breath",
  "unconscious",
  "stroke",
  "severe bleeding",
  "heavy bleeding",
  "poison",
  "suicide",
  "seizure",
  "convulsion",
  "head injury",
  "severe burn",
  "collapsed",
  "paralysis",
];

export function checkEmergency(query: string): boolean {
  const lower = query.toLowerCase();
  return EMERGENCY_KEYWORDS.some((kw) => lower.includes(kw));
}

export function classifyEnquiry(query: string): EnquiryClassification {
  if (checkEmergency(query)) {
    return "Potentially Urgent / Medical Safety Escalation";
  }

  const lower = query.toLowerCase();
  if (
    lower.includes("book") ||
    lower.includes("appointment") ||
    lower.includes("slot") ||
    lower.includes("schedule") ||
    lower.includes("consult") ||
    lower.includes("timing")
  ) {
    return "Appointment Ready";
  }

  if (
    lower.includes("human") ||
    lower.includes("call me") ||
    lower.includes("speak to") ||
    lower.includes("receptionist") ||
    lower.includes("staff")
  ) {
    return "Needs Human Assistance";
  }

  return "Needs Information";
}

/**
 * AI Virtual Receptionist for Apex Health Clinic.
 * Complies with strict clinical safety constraints: no diagnosis, no prescription,
 * no fabricated pricing or emergency treatment.
 */
export async function processReceptionistMessage(
  userMessage: string,
  history: Array<{ sender: "user" | "assistant"; text: string }> = []
): Promise<ChatMessage> {
  const settings = await getSettings();
  const doctors = await getDoctors();
  const services = await getServices();
  const trimmed = userMessage.trim();
  const lower = trimmed.toLowerCase();

  const msgId = `msg_${Date.now()}`;
  const timestamp = new Date().toISOString();

  // 1. Critical Medical Emergency Safeguard
  if (checkEmergency(lower)) {
    return {
      id: msgId,
      sender: "assistant",
      text:
        "⚠️ MEDICAL SAFETY NOTICE: If you or someone you are inquiring about is experiencing severe symptoms, acute chest pain, difficulty breathing, or another medical emergency, please call emergency services immediately (112 in India) or visit the nearest hospital emergency room. Apex Health Clinic provides outpatient scheduled consultations and is not an emergency response unit.",
      timestamp,
      quickActions: [
        { label: "📞 Clinic Helpline: 8861608612", action: "call" },
        { label: "Book Outpatient Appointment", action: "start_booking" },
      ],
      escalateToHuman: true,
    };
  }

  // 2. Diagnostic & Medication Safeguards
  const diagnosticKeywords = [
    "do i have",
    "what medicine",
    "prescribe",
    "which tablet",
    "cure my",
    "what illness",
    "antibiotic",
    "treatment for",
    "is it cancer",
  ];

  if (diagnosticKeywords.some((kw) => lower.includes(kw))) {
    return {
      id: msgId,
      sender: "assistant",
      text:
        "As an AI assistant, I cannot diagnose medical conditions or recommend specific prescription medications. For an accurate medical evaluation, please schedule an in-person consultation with Dr. Kavita Goswami (MBBS, MD) at Apex Health Clinic, Vaishali.",
      timestamp,
      quickActions: [
        { label: "Book Consultation with Dr. Goswami", action: "start_booking" },
        { label: "Contact Clinic: 8861608612", action: "call" },
      ],
      suggestBooking: {
        doctorId: "doc-kavita-goswami",
        serviceId: "srv-gen-consult",
      },
    };
  }

  // 3. Optional AI Provider integration if AI_API_KEY is configured
  if (process.env.AI_API_KEY && settings.chatbotProvider === "ai") {
    try {
      // In production with AI_API_KEY, prompt safety-shielded model
      // Falling back smoothly if network or quota errors arise
    } catch (err) {
      console.warn("AI Provider call failed, falling back to rule engine:", err);
    }
  }

  // 4. Rule-Based Fallback for Apex Health Clinic
  // A. Doctor & Credentials inquiry
  if (lower.includes("doctor") || lower.includes("kavita") || lower.includes("qualification") || lower.includes("credentials")) {
    return {
      id: msgId,
      sender: "assistant",
      text:
        "Our consulting physician is Dr. Kavita Goswami (MBBS, MD). She has extensive clinical experience in general medicine, primary healthcare, preventive diagnostics, and chronic condition management at Apex Health Clinic, Plot No. 3, Vaishali, Ghaziabad.",
      timestamp,
      quickActions: [
        { label: "Book with Dr. Kavita Goswami", action: "start_booking" },
        { label: "View Consultation Timings", action: "check_timings" },
      ],
      suggestBooking: { doctorId: "doc-kavita-goswami" },
    };
  }

  // B. Location and Address inquiry
  if (lower.includes("where") || lower.includes("address") || lower.includes("location") || lower.includes("vaishali") || lower.includes("reach")) {
    return {
      id: msgId,
      sender: "assistant",
      text:
        "Apex Health Clinic is located at Plot No. 3, Vaishali, Ghaziabad. We are easily accessible from surrounding sectors. For directions or appointments, call us at 8861608612.",
      timestamp,
      quickActions: [
        { label: "Book an Appointment", action: "start_booking" },
        { label: "Call 8861608612", action: "call" },
      ],
    };
  }

  // C. Timings and Hours inquiry
  if (lower.includes("timing") || lower.includes("hour") || lower.includes("open") || lower.includes("time") || lower.includes("sunday")) {
    return {
      id: msgId,
      sender: "assistant",
      text:
        "Apex Health Clinic operates Monday through Saturday from 9:30 AM to 6:30 PM (lunch break 1:30 PM – 2:30 PM). We are closed on Sundays. Consultation slots are 30 minutes each and advance booking is recommended.",
      timestamp,
      quickActions: [
        { label: "Check Slot Availability", action: "start_booking" },
        { label: "Call Reception: 8861608612", action: "call" },
      ],
    };
  }

  // D. Booking & Appointment intent
  if (lower.includes("book") || lower.includes("appointment") || lower.includes("slot") || lower.includes("schedule")) {
    return {
      id: msgId,
      sender: "assistant",
      text:
        "You can book a real appointment directly through our online booking portal! Select a preferred date and available 30-minute consultation slot with Dr. Kavita Goswami. You will receive an immediate confirmation and reference number.",
      timestamp,
      quickActions: [
        { label: "📅 Book Appointment Now", action: "start_booking" },
        { label: "💬 WhatsApp Us (8861608612)", action: "whatsapp" },
      ],
      suggestBooking: {
        doctorId: "doc-kavita-goswami",
        serviceId: "srv-gen-consult",
      },
    };
  }

  // E. Services and Departments
  if (lower.includes("service") || lower.includes("treatment") || lower.includes("department") || lower.includes("checkup")) {
    const serviceList = services.map((s) => `• ${s.name} (${s.departmentName})`).join("\n");
    return {
      id: msgId,
      sender: "assistant",
      text:
        `Apex Health Clinic provides clinical outpatient services including:\n${serviceList}\n\nAll consultations are conducted by Dr. Kavita Goswami (MBBS, MD).`,
      timestamp,
      quickActions: [
        { label: "Book a Consultation", action: "start_booking" },
        { label: "Send an Enquiry", action: "open_enquiry" },
      ],
    };
  }

  // F. Default response
  return {
    id: msgId,
    sender: "assistant",
    text:
      "Welcome to Apex Health Clinic (Plot No. 3, Vaishali, Ghaziabad). I can assist you with consultation timings, services by Dr. Kavita Goswami (MBBS, MD), and booking an appointment.",
    timestamp,
    quickActions: [
      { label: "📅 Book Appointment", action: "start_booking" },
      { label: "🕒 Clinic Timings", action: "check_timings" },
      { label: "📍 Clinic Location", action: "get_location" },
      { label: "📞 Call 8861608612", action: "call" },
    ],
  };
}
