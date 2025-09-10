import { auth } from 'firebase-admin';
import { cookies } from 'next/headers';
import { NextRequest, NextResponse } from 'next/server';
import { authAdmin } from '@/lib/firebase-admin';

export async function POST(request: NextRequest, response: NextResponse) {
  try {
    const body = await request.json();
    const idToken = body.idToken.toString();
    const expiresIn = 60 * 60 * 24 * 5 * 1000; // 5 days

    const sessionCookie = await authAdmin.createSessionCookie(idToken, { expiresIn });

    cookies().set('session', sessionCookie, {
      maxAge: expiresIn,
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      path: '/',
    });
    
    return NextResponse.json({ status: 'success' }, { status: 200 });
  } catch (error) {
    console.error('Error creating session cookie:', error);
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
}


export async function GET(request: NextRequest) {
    const session = cookies().get("session")?.value || "";
    //Validate if the cookie exist in the request
    if (!session) {
      return NextResponse.json({ isLogged: false }, { status: 401 });
    }
  
    //Use Firebase Admin to validate the session cookie
    try {
        const decodedClaims = await authAdmin.verifySessionCookie(session, true);
        if (!decodedClaims) {
            return NextResponse.json({ isLogged: false }, { status: 401 });
        }
        return NextResponse.json({ isLogged: true }, { status: 200 });
    } catch(error) {
        console.error("Error verifying session cookie in GET:", error);
        return NextResponse.json({ isLogged: false }, { status: 401 });
    }

}
