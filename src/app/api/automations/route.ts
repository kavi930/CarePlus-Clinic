import { NextResponse } from "next/server";
import { getAutomationLogs, getSettings } from "@/lib/db";

export async function GET() {
  try {
    const logs = await getAutomationLogs(100);
    const settings = await getSettings();

    return NextResponse.json({
      success: true,
      logs,
      workflows: settings.workflows,
      demoMode: settings.demoMode,
    });
  } catch (err: unknown) {
    return NextResponse.json({ success: false, error: String(err) }, { status: 500 });
  }
}
