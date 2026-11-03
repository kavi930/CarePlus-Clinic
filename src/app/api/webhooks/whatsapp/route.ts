import { NextRequest, NextResponse } from "next/server";
import { addAutomationLog } from "@/lib/db";

// Replay protection cache (message IDs processed in the last 10 minutes)
const processedMessageIds = new Set<string>();

/**
 * Meta WhatsApp Cloud API Webhook Verification Endpoint (GET).
 */
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const mode = searchParams.get("hub.mode");
    const token = searchParams.get("hub.verify_token");
    const challenge = searchParams.get("hub.challenge");

    const expectedToken = process.env.WHATSAPP_VERIFY_TOKEN || "apex_health_verify_token";

    if (mode === "subscribe" && token === expectedToken) {
      return new NextResponse(challenge || "", { status: 200 });
    }

    return new NextResponse("Forbidden", { status: 403 });
  } catch (err: unknown) {
    return new NextResponse(String(err), { status: 500 });
  }
}

/**
 * Inbound Webhook handler for WhatsApp delivery receipts and messages (POST).
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}));

    // Deduplication & Replay Protection
    const entry = body?.entry?.[0];
    const change = entry?.changes?.[0]?.value;
    const message = change?.messages?.[0];
    const statusUpdate = change?.statuses?.[0];

    const eventId = message?.id || statusUpdate?.id || `evt_${Date.now()}`;

    if (processedMessageIds.has(eventId)) {
      return NextResponse.json({ status: "duplicate_ignored" }, { status: 200 });
    }

    processedMessageIds.add(eventId);
    // Limit cache size
    if (processedMessageIds.size > 2000) {
      const first = processedMessageIds.values().next().value;
      if (first) processedMessageIds.delete(first);
    }

    await addAutomationLog({
      workflow: "WhatsApp Business Webhook",
      trigger: message ? "Incoming Patient WhatsApp Message" : "WhatsApp Delivery Status Update",
      action: "Process Webhook Payload",
      status: "Success",
      result: `Processed WhatsApp event ${eventId} (${statusUpdate ? `status: ${statusUpdate.status}` : "inbound message"})`,
      payloadSnippet: {
        id: eventId,
        status: statusUpdate?.status,
        from: message?.from,
        timestamp: new Date().toISOString(),
      },
    });

    return NextResponse.json({ success: true, processed: true }, { status: 200 });
  } catch (err: unknown) {
    return NextResponse.json({ success: false, error: String(err) }, { status: 500 });
  }
}
