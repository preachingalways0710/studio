import { NextResponse, type NextRequest } from 'next/server';

export async function middleware(request: NextRequest) {
  const session = request.cookies.get('session');

  // Return to /login if don't have a session
  if (!session) {
    if (request.nextUrl.pathname !== '/login' && request.nextUrl.pathname !== '/signup') {
        return NextResponse.redirect(new URL('/login', request.url));
    }
    return NextResponse.next();
  }

  // Call the authentication endpoint to verify the session
  try {
    const responseAPI = await fetch(`${request.nextUrl.origin}/api/auth/login`, {
      headers: {
        Cookie: `session=${session.value}`,
      },
    });

    // Return to /login if the session is not valid
    if (responseAPI.status !== 200) {
      if (request.nextUrl.pathname !== '/login' && request.nextUrl.pathname !== '/signup') {
        return NextResponse.redirect(new URL('/login', request.url));
      }
    }
    
    // If user is authenticated and tries to access login/signup, redirect to home
    if (request.nextUrl.pathname === '/login' || request.nextUrl.pathname === '/signup') {
        return NextResponse.redirect(new URL('/', request.url));
    }

  } catch (error) {
    console.error("Middleware auth check failed:", error);
     if (request.nextUrl.pathname !== '/login' && request.nextUrl.pathname !== '/signup') {
        const response = NextResponse.redirect(new URL('/login', request.url));
        // Clear the invalid cookie
        response.cookies.delete('session');
        return response;
    }
  }


  return NextResponse.next();
}

// Add routes that should be protected
export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
};
