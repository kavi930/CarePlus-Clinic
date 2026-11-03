import { NextResponse } from "next/server";
import { getDepartments } from "@/lib/db";

export async function GET() {
  try {
    const departments = await getDepartments();
    return NextResponse.json({ success: true, departments });
  } catch (err: unknown) {
    return NextResponse.json({ success: false, error: String(err) }, { status: 500 });
  }
}
