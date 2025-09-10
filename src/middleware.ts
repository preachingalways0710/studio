import { NextResponse, type NextRequest } from 'next/server';

export async function middleware(request: NextRequest) {
  const sessionCookie = request.cookies.get('session')?.value;
  const { pathname } = request.nextUrl;
  
  const isAuthPage = pathname === '/login' || pathname === '/signup';

  // If user has a session cookie and is on an auth page,
  // redirect them to the dashboard.
  if (sessionCookie && isAuthPage) {
    return NextResponse.redirect(new URL('/', request.url));
  }

  // If user does not have a session cookie and is trying to access a protected page,
  // redirect them to the login page.
  if (!sessionCookie && !isAuthPage) {
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
