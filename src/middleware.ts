import { NextResponse, type NextRequest } from 'next/server';

// This middleware is no longer needed as the app is publicly accessible.
// It is kept to prevent build errors from Next.js if it expects the file to exist.
export async function middleware(request: NextRequest) {
  return NextResponse.next();
}

export const config = {
  matcher: [], // Empty matcher means this middleware will not run on any route.
};
