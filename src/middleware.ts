import { NextResponse, type NextRequest } from 'next/server';
import { authAdmin } from '@/lib/firebase-admin';

async function verifySessionCookie(session: string | undefined) {
    if (!session) return null;
    try {
        // Use the Firebase Admin SDK to verify the session cookie.
        const decodedClaims = await authAdmin.verifySessionCookie(session, true);
        return decodedClaims;
    } catch (error) {
        // Session cookie is invalid.
        // This can happen if the cookie is old or malformed.
        // It's not a server error, so we can log it for debugging if needed.
        // console.error('Error verifying session cookie in middleware:', error);
        return null;
    }
}


export async function middleware(request: NextRequest) {
  const sessionCookie = request.cookies.get('session')?.value;
  const { pathname } = request.nextUrl;
  
  const isAuthPage = pathname === '/login' || pathname === '/signup';

  const decodedToken = await verifySessionCookie(sessionCookie);

  // If user is authenticated (has a valid token) and is on an auth page,
  // redirect them to the dashboard.
  if (decodedToken && isAuthPage) {
    return NextResponse.redirect(new URL('/', request.url));
  }

  // If user is not authenticated and is trying to access a protected page,
  // redirect them to the login page.
  if (!decodedToken && !isAuthPage) {
     const response = NextResponse.redirect(new URL('/login', request.url));
     // Clear any invalid cookie that might be present
     response.cookies.delete('session');
     return response;
  }

  // If none of the above conditions are met, allow the request to proceed.
  return NextResponse.next();
}

// Configuration to specify which routes should be processed by this middleware.
export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes, which have their own auth logic or are public)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
};
