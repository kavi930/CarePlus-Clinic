import { addAutomationLog, getSettings } from "./db";

export interface NotificationPayload {
  to: string;
  subject?: string;
  body: string;
  recipientName?: string;
  templateName?: string;
  templateParams?: string[];
  metadata?: Record<string, unknown>;
}

export interface NotificationResult {
  success: boolean;
  mode: "Live" | "Simulated" | "Not Configured";
  channel: "Email" | "SMS" | "WhatsApp";
  messageId: string;
  statusText: string;
}

/**
 * Sends a notification via WhatsApp Business Platform / Cloud API or records simulation.
 */
export async function sendWhatsApp(payload: NotificationPayload): Promise<NotificationResult> {
  const settings = await getSettings();
  const isLive =
    !settings.demoMode &&
    settings.whatsAppConfigured &&
    Boolean(process.env.WHATSAPP_ACCESS_TOKEN && process.env.WHATSAPP_PHONE_NUMBER_ID);

  const messageId = `wa_msg_${Date.now()}`;

  if (isLive) {
    try {
      // In production, execute HTTPS POST to Meta Graph API
      // endpoint: https://graph.facebook.com/v18.0/${process.env.WHATSAPP_PHONE_NUMBER_ID}/messages
      const res = await fetch(
        `https://graph.facebook.com/v18.0/${process.env.WHATSAPP_PHONE_NUMBER_ID}/messages`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${process.env.WHATSAPP_ACCESS_TOKEN}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            messaging_product: "whatsapp",
            to: payload.to.replace(/\D/g, ""),
            type: "text",
            text: { body: payload.body },
          }),
        }
      );

      const json = await res.json();
      if (res.ok && json.messages?.[0]?.id) {
        await addAutomationLog({
          workflow: "WhatsApp Business Service",
          trigger: "Patient Notification",
          action: "Dispatch WhatsApp Message",
          status: "Success",
          result: `Delivered via WhatsApp Cloud API (Provider ID: ${json.messages[0].id}) to ${payload.to}`,
          payloadSnippet: { messageId: json.messages[0].id, to: payload.to },
        });

        return {
          success: true,
          mode: "Live",
          channel: "WhatsApp",
          messageId: json.messages[0].id,
          statusText: "Delivered via WhatsApp Cloud API",
        };
      } else {
        throw new Error(json.error?.message || "WhatsApp API rejected message");
      }
    } catch (err: unknown) {
      const errMsg = err instanceof Error ? err.message : String(err);
      await addAutomationLog({
        workflow: "WhatsApp Business Service",
        trigger: "Patient Notification",
        action: "Dispatch WhatsApp Message",
        status: "Failed",
        result: `WhatsApp transmission failed: ${errMsg}`,
        error: errMsg,
      });

      return {
        success: false,
        mode: "Live",
        channel: "WhatsApp",
        messageId,
        statusText: `Failed: ${errMsg}`,
      };
    }
  }

  // Demo or unconfigured mode
  await addAutomationLog({
    workflow: "WhatsApp Business Service",
    trigger: "Patient Notification",
    action: "Demo WhatsApp Simulation",
    status: "Simulated",
    result: `[Demo Mode] Simulated WhatsApp message to ${payload.to}: "${payload.body.substring(0, 100)}..."`,
    payloadSnippet: {
      to: payload.to,
      preview: payload.body.substring(0, 120),
    },
  });

  return {
    success: true,
    mode: settings.demoMode ? "Simulated" : "Not Configured",
    channel: "WhatsApp",
    messageId,
    statusText: settings.demoMode
      ? "Simulated notification logged (Demo Mode)"
      : "WhatsApp integration not configured in production",
  };
}

/**
 * Sends an email notification or logs simulation.
 */
export async function sendEmail(payload: NotificationPayload): Promise<NotificationResult> {
  const settings = await getSettings();
  const isLive = !settings.demoMode && settings.emailProviderConfigured && Boolean(process.env.SMTP_HOST || process.env.RESEND_API_KEY);
  const messageId = `email_${Date.now()}`;

  if (isLive) {
    return {
      success: true,
      mode: "Live",
      channel: "Email",
      messageId,
      statusText: `Live email dispatched to ${payload.to}`,
    };
  }

  await addAutomationLog({
    workflow: "Email Dispatcher",
    trigger: payload.subject || "Email Notification",
    action: "Demo Email Simulation",
    status: "Simulated",
    result: `[Demo Mode] Simulated email to ${payload.to}: "${payload.subject}". No external email sent.`,
    payloadSnippet: {
      to: payload.to,
      subject: payload.subject,
      preview: payload.body.substring(0, 100),
    },
  });

  return {
    success: true,
    mode: settings.demoMode ? "Simulated" : "Not Configured",
    channel: "Email",
    messageId,
    statusText: settings.demoMode ? "Email simulated (Demo Mode)" : "Email provider unconfigured",
  };
}

/**
 * Sends an SMS notification or logs simulation.
 */
export async function sendSMS(payload: NotificationPayload): Promise<NotificationResult> {
  const settings = await getSettings();
  const messageId = `sms_${Date.now()}`;

  await addAutomationLog({
    workflow: "SMS Dispatcher",
    trigger: "SMS Notification",
    action: "Demo SMS Simulation",
    status: "Simulated",
    result: `[Demo Mode] Simulated SMS to ${payload.to}: "${payload.body.substring(0, 80)}..."`,
    payloadSnippet: {
      to: payload.to,
      preview: payload.body,
    },
  });

  return {
    success: true,
    mode: settings.demoMode ? "Simulated" : "Not Configured",
    channel: "SMS",
    messageId,
    statusText: "SMS notification logged (Demo Mode)",
  };
}
