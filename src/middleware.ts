import { NextResponse, type NextRequest } from 'next/server';

export async function middleware(request: NextRequest) {
  const session = request.cookies.get('session');
  const { pathname } = request.nextUrl;
  
  const isAuthPage = pathname === '/login' || pathname === '/signup';

  // If there's a session cookie, try to verify it
  if (session) {
    try {
      const responseAPI = await fetch(`${request.nextUrl.origin}/api/auth/login`, {
        headers: {
          Cookie: `session=${session.value}`,
        },
      });

      // If session is valid and user is on an auth page, redirect to home
      if (responseAPI.ok && isAuthPage) {
        return NextResponse.redirect(new URL('/', request.url));
      }

      // If session is NOT valid and user is on a protected page, redirect to login
      if (!responseAPI.ok && !isAuthPage) {
         const response = NextResponse.redirect(new URL('/login', request.url));
         response.cookies.delete('session'); // Clear the invalid cookie
         return response;
      }
    } catch (error) {
        console.error("Middleware auth check failed:", error);
        if (!isAuthPage) {
            const response = NextResponse.redirect(new URL('/login', request.url));
            response.cookies.delete('session'); // Clear invalid cookie
            return response;
        }
    }
  } else {
    // If there's no session and user is on a protected page, redirect to login
    if (!isAuthPage) {
      return NextResponse.redirect(new URL('/login', request.url));
    }
  }

  // Allow the request to continue
  return NextResponse.next();
}

// Protect all routes except API routes and static assets
export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
};
