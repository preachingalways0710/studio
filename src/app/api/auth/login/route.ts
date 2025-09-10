
import { cookies } from "next/headers";
import { NextResponse } from "next/server";

// This route is no longer used but is kept to prevent build errors
// from components that might still reference it before being removed.

// Force Node runtime so Buffer/crypto are available if needed later.
export const runtime = "nodejs";

type LoginBody = { idToken?: string };

// POST /api/auth/login
export async function POST(request: Request) {
  return NextResponse.json({ ok: true });
}
