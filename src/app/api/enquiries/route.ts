import { NextRequest, NextResponse } from "next/server";
import { getEnquiries, createEnquiry } from "@/lib/db";
import { classifyEnquiry } from "@/lib/aiReceptionist";
import { dispatchAutomationEvent } from "@/lib/automation";

export async function GET(req: NextRequest) {
  try {
    const enquiries = await getEnquiries();
    return NextResponse.json({ success: true, enquiries });
  } catch (err: unknown) {
    return NextResponse.json({ success: false, error: String(err) }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      name,
      phone,
      email,
      category,
      question,
      service,
      preferred_contact = "WhatsApp",
      source = "Website Form",
      consent = true,
      conversation,
    } = body;

    if (!name || !name.trim()) {
      return NextResponse.json(
        { success: false, error: "Please enter your full name." },
        { status: 400 }
      );
    }

    if (!phone || !phone.trim() || phone.replace(/\D/g, "").length < 10) {
      return NextResponse.json(
        { success: false, error: "Please provide a valid 10-digit phone number for enquiry follow-up." },
        { status: 400 }
      );
    }

    if (!question || !question.trim()) {
      return NextResponse.json(
        { success: false, error: "Please describe your question or message." },
        { status: 400 }
      );
    }

    const classification = classifyEnquiry(question);

    const enquiry = await createEnquiry({
      name: name.trim(),
      phone: phone.trim(),
      email: email ? email.trim().toLowerCase() : undefined,
      category: category || "General Healthcare",
      question: question.trim(),
      service: service || "General Consultation",
      preferred_contact,
      source,
      status: "New",
      classification,
      consent: Boolean(consent),
      conversation: conversation || [
        {
          sender: "patient",
          text: question.trim(),
          timestamp: new Date().toISOString(),
        },
      ],
      follow_up_status: "Pending",
      assigned_to: classification === "Potentially Urgent / Medical Safety Escalation" ? "Urgent Triage" : "Front Desk",
    });

    // Trigger automation pipeline
    await dispatchAutomationEvent("enquiry.created", enquiry);

    return NextResponse.json(
      {
        success: true,
        enquiry,
        message: "Your enquiry has been received. Our clinic team will reach out shortly.",
      },
      { status: 201 }
    );
  } catch (err: unknown) {
    return NextResponse.json({ success: false, error: String(err) }, { status: 500 });
  }
}
