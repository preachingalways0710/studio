
import { cookies } from 'next/headers';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    cookies().delete('session');
    return NextResponse.json({ status: 'logged-out' }, { status: 200 });
  } catch (error) {
    console.error('Error during logout:', error);
    return NextResponse.json({ error: 'Logout failed but session cleared.' }, { status: 500 });
  }
}
