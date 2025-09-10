import { NextResponse, type NextRequest } from 'next/server';

export async function middleware(request: NextRequest) {
  const sessionCookie = request.cookies.get('session')?.value;
  const { pathname } = request.nextUrl;
  
  const isAuthPage = pathname === '/login' || pathname === '/signup';

  if (sessionCookie && isAuthPage) {
    return NextResponse.redirect(new URL('/', request.url));
  }

  if (!sessionCookie && !isAuthPage) {
     return NextResponse.redirect(new URL('/login', request.url));
  }

  return NextResponse.next();
}

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
