import { NextRequest, NextResponse } from "next/server";
import { trackAnalyticsEvent } from "@/lib/db";
import { AnalyticsSummary } from "@/types";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { event } = body;

    if (event) {
      await trackAnalyticsEvent(event as keyof AnalyticsSummary);
    }

    return NextResponse.json({ success: true });
  } catch (err: unknown) {
    return NextResponse.json({ success: false, error: String(err) }, { status: 500 });
  }
}
