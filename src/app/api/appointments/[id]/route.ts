import { NextRequest, NextResponse } from "next/server";
import { getAppointment, updateAppointment } from "@/lib/db";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const appointment = await getAppointment(id);
    if (!appointment) {
      return NextResponse.json({ success: false, error: "Appointment not found" }, { status: 404 });
    }
    return NextResponse.json({ success: true, appointment });
  } catch (err: unknown) {
    return NextResponse.json({ success: false, error: String(err) }, { status: 500 });
  }
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await req.json();
    const updated = await updateAppointment(id, body);
    if (!updated) {
      return NextResponse.json({ success: false, error: "Appointment not found" }, { status: 404 });
    }
    return NextResponse.json({ success: true, appointment: updated });
  } catch (err: unknown) {
    return NextResponse.json({ success: false, error: String(err) }, { status: 500 });
  }
}
