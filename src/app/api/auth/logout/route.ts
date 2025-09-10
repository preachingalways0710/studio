import { auth } from 'firebase-admin';
import { cookies } from 'next/headers';
import { NextRequest, NextResponse } from 'next/server';
import { authAdmin } from '@/lib/firebase-admin';

export async function POST(request: NextRequest) {
  try {
    const sessionCookie = cookies().get('session')?.value;
    if (sessionCookie) {
      const decodedClaims = await authAdmin.verifySessionCookie(sessionCookie);
      await authAdmin.revokeRefreshTokens(decodedClaims.sub);
    }
    cookies().delete('session');
    return NextResponse.json({ status: 'logged-out' }, { status: 200 });
  } catch (error) {
    console.error('Error during logout:', error);
    // Even if revocation fails, deleting the cookie is the main goal
    cookies().delete('session');
    return NextResponse.json({ error: 'Logout failed but session cleared.' }, { status: 500 });
  }
}
