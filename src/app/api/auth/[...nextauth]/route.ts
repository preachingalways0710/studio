// This file is intentionally left blank to reserve the route,
// but the actual logic is handled by login/logout API routes
// to work with Firebase session cookies.
import { NextResponse } from 'next/server';

export async function GET() {
  return NextResponse.json({ message: 'Auth endpoint' });
}
