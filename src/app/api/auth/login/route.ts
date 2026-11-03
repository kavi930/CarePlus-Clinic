import { NextRequest, NextResponse } from "next/server";
import { findUserByUsername, addAuditLog } from "@/lib/db";
import { verifyPassword, createSession } from "@/lib/auth";

export async function GET(req: NextRequest) {
  return NextResponse.redirect(new URL("/dashboard/login", req.url));
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { username, password } = body;

    if (!username || !password) {
      return NextResponse.json(
        { success: false, error: "Username and password are required." },
        { status: 400 }
      );
    }

    const user = await findUserByUsername(username);
    if (!user) {
      return NextResponse.json(
        { success: false, error: "Invalid credentials." },
        { status: 401 }
      );
    }

    const isValid = verifyPassword(password, user.passwordHash, user.salt);
    if (!isValid) {
      await addAuditLog({
        actor: username,
        action: "login_failed",
        targetEntity: "auth",
        details: "Invalid password attempt",
      });
      return NextResponse.json(
        { success: false, error: "Invalid credentials." },
        { status: 401 }
      );
    }

    const session = createSession(user);

    await addAuditLog({
      actor: user.username,
      action: "login_success",
      targetEntity: "auth",
      details: `Successful login as ${user.role}`,
    });

    const response = NextResponse.json({
      success: true,
      user: {
        id: user.id,
        username: user.username,
        name: user.name,
        role: user.role,
      },
    });

    // Set secure HTTP-only cookie
    response.cookies.set("apex_session", session.token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 12 * 60 * 60, // 12 hours
    });

    return response;
  } catch (err: unknown) {
    return NextResponse.json({ success: false, error: String(err) }, { status: 500 });
  }
}
