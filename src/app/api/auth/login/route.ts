
import { cookies } from "next/headers";
import { NextResponse } from "next/server";

// Force Node runtime so Buffer/crypto are available if needed later.
export const runtime = "nodejs";

type LoginBody = { idToken?: string };

// POST /api/auth/login
export async function POST(request: Request) {
  try {
    const body = (await request.json()) as LoginBody;
    const idToken = body?.idToken;

    if (!idToken) {
      return NextResponse.json({ error: "Missing idToken" }, { status: 400 });
    }

    // Prototype-only: trusting the client token. No firebase-admin dependency.
    const session = JSON.stringify({ token: idToken, loggedInAt: Date.now() });

    // NOTE: maxAge is in **seconds**, not ms.
    cookies().set("session", encodeURIComponent(session), {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 60 * 24 * 5, // 5 days
    });

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("Error creating session cookie:", err);
    return NextResponse.json({ error: "Failed to create session." }, { status: 401 });
  }
}
