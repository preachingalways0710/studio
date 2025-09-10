import { NextResponse, type NextRequest } from 'next/server';

export async function middleware(request: NextRequest) {
  const session = request.cookies.get('session');
  const { pathname } = request.nextUrl;
  
  const isAuthPage = pathname === '/login' || pathname === '/signup';

  // If there's no session cookie and the user is not on an auth page, redirect to login
  if (!session && !isAuthPage) {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  // If there's a session cookie, let's verify it with our API route
  if (session) {
    try {
      // The API route will verify the cookie. We pass it along in the headers.
      const responseAPI = await fetch(`${request.nextUrl.origin}/api/auth/login`, {
        headers: {
          Cookie: `session=${session.value}`,
        },
      });

      // If the session is valid (API returns 200 OK) and the user is on an auth page,
      // redirect them to the home page.
      if (responseAPI.ok && isAuthPage) {
        return NextResponse.redirect(new URL('/', request.url));
      }

      // If the session is NOT valid (API returns 401 or other error) and the user
      // is on a protected page, redirect them to the login page.
      if (!responseAPI.ok && !isAuthPage) {
         const response = NextResponse.redirect(new URL('/login', request.url));
         // Important: Clear the invalid cookie from the user's browser
         response.cookies.delete('session');
         return response;
      }
    } catch (error) {
        // If the API call itself fails, it's safer to assume authentication failed.
        console.error("Middleware auth check failed:", error);
        if (!isAuthPage) {
            const response = NextResponse.redirect(new URL('/login', request.url));
            response.cookies.delete('session'); // Clear any potentially problematic cookie
            return response;
        }
    }
  }

  // If none of the above conditions are met, allow the request to proceed.
  return NextResponse.next();
}

// Configuration to specify which routes should be processed by this middleware.
export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
};