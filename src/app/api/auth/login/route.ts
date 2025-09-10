
import { cookies } from 'next/headers';
import { NextRequest, NextResponse } from 'next/server';

// This is a simplified session creation for demonstration.
// In a real-world app, you would verify the idToken with Firebase Admin SDK on a backend.
// Since we are avoiding the Admin SDK, we'll create a simple session cookie based on the token from the client.
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const idToken = body.idToken.toString(); 
    
    // In a real app, you'd want to verify this token server-side.
    // For this prototype, we are trusting the token from the client and setting a cookie.
    const expiresIn = 60 * 60 * 24 * 5 * 1000; // 5 days
    const sessionCookieValue = JSON.stringify({ token: idToken, loggedInAt: Date.now() });

    cookies().set('session', sessionCookieValue, {
      maxAge: expiresIn,
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      path: '/',
    });
    
    return NextResponse.json({ status: 'success' }, { status: 200 });
  } catch (error) {
    console.error('Error creating session cookie:', error);
    return NextResponse.json({ error: 'Failed to create session.' }, { status: 401 });
  }
}
