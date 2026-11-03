import { NextRequest, NextResponse } from "next/server";
import { destroySession } from "@/lib/auth";

export async function GET(req: NextRequest) {
  const token = req.cookies.get("apex_session")?.value;
  if (token) {
    destroySession(token);
  }
  const response = NextResponse.redirect(new URL("/dashboard/login", req.url));
  response.cookies.delete("apex_session");
  return response;
}

export async function POST(req: NextRequest) {
  try {
    const token = req.cookies.get("apex_session")?.value;
    if (token) {
      destroySession(token);
    }

    const response = NextResponse.json({ success: true, message: "Logged out successfully" });
    response.cookies.delete("apex_session");
    return response;
  } catch (err: unknown) {
    return NextResponse.json({ success: false, error: String(err) }, { status: 500 });
  }
}
