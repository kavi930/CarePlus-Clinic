import { NextResponse } from "next/server";
import { getAnalytics } from "@/lib/db";

export async function GET() {
  try {
    const analytics = await getAnalytics();
    return NextResponse.json({ success: true, analytics });
  } catch (err: unknown) {
    return NextResponse.json({ success: false, error: String(err) }, { status: 500 });
  }
}
