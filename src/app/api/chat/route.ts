import { NextRequest, NextResponse } from "next/server";
import { processReceptionistMessage } from "@/lib/aiReceptionist";
import { trackAnalyticsEvent } from "@/lib/db";

export async function GET() {
  return NextResponse.json({
    status: "active",
    service: "Apex Health Clinic AI Receptionist Service",
    message: "This endpoint accepts POST requests with JSON payload: { message: string, history?: Array }",
    supportedMethods: ["POST"],
  });
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { message, history = [] } = body;

    if (!message || typeof message !== "string") {
      return NextResponse.json({ success: false, error: "Message is required" }, { status: 400 });
    }

    // Track analytics
    await trackAnalyticsEvent("aiAssistantOpens");

    const response = await processReceptionistMessage(message, history);

    return NextResponse.json({
      success: true,
      reply: response,
    });
  } catch (err: unknown) {
    return NextResponse.json({ success: false, error: String(err) }, { status: 500 });
  }
}
