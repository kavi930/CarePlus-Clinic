import { NextRequest, NextResponse } from "next/server";
import { getDoctors } from "@/lib/db";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const serviceId = searchParams.get("serviceId");

    let doctors = await getDoctors();
    if (serviceId) {
      doctors = doctors.filter((d) => d.availableServices.includes(serviceId));
    }

    return NextResponse.json({ success: true, doctors });
  } catch (err: unknown) {
    return NextResponse.json({ success: false, error: String(err) }, { status: 500 });
  }
}
