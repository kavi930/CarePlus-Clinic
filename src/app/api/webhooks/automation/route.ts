import { NextRequest, NextResponse } from "next/server";
import { addAutomationLog } from "@/lib/db";

export async function GET() {
  return NextResponse.json({
    status: "active",
    endpoint: "Apex Health Clinic Automation Webhook",
    message: "This webhook accepts POST requests for inbound events (e.g. appointment.created, enquiry.created).",
    supportedMethods: ["POST"],
  });
}

export async function POST(req: NextRequest) {
  try {
    const payload = await req.json().catch(() => ({}));

    await addAutomationLog({
      workflow: "External Automation Webhook",
      trigger: payload.event || "webhook.received",
      action: "Inbound Webhook Received",
      status: "Success",
      result: `Processed webhook payload from external workflow: ${JSON.stringify(payload).substring(0, 100)}`,
      payloadSnippet: payload,
    });

    return NextResponse.json({
      received: true,
      timestamp: new Date().toISOString(),
      status: "processed",
    });
  } catch (err: unknown) {
    return NextResponse.json({ success: false, error: String(err) }, { status: 500 });
  }
}
