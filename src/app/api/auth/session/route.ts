
import { cookies } from 'next/headers';
import { NextRequest, NextResponse } from 'next/server';
import { getAdminAuth } from '@/lib/firebase-admin';

// Handles GET requests to check a session
export async function GET(request: NextRequest) {
  const sessionCookie = cookies().get('session')?.value;
  if (!sessionCookie) {
    return NextResponse.json({ authenticated: false, error: 'No session cookie found.' }, { status: 401 });
  }

  try {
    const adminAuth = getAdminAuth();
    const decodedToken = await adminAuth.verifySessionCookie(sessionCookie, true /** checkRevoked */);
    return NextResponse.json({ authenticated: true, user: decodedToken }, { status: 200 });
  } catch (error) {
    console.error('Session verification error:', error);
    return NextResponse.json({ authenticated: false, error: 'Invalid or expired session cookie.' }, { status: 401 });
  }
}

// Handles POST requests to create a session
export async function POST(request: NextRequest) {
  const { idToken } = await request.json();

  if (!idToken) {
    return NextResponse.json({ error: 'ID token is required.' }, { status: 400 });
  }

  // Set session expiration to 5 days.
  const expiresIn = 60 * 60 * 24 * 5 * 1000;

  try {
    const adminAuth = getAdminAuth();
    const sessionCookie = await adminAuth.createSessionCookie(idToken, { expiresIn });
    
    cookies().set('session', sessionCookie, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      maxAge: expiresIn / 1000,
      path: '/',
      sameSite: 'lax',
    });

    return NextResponse.json({ status: 'success' }, { status: 200 });
  } catch (error) {
    console.error('Error creating session cookie:', error);
    return NextResponse.json({ error: 'Failed to create session.' }, { status: 401 });
  }
}

// Handles DELETE requests to clear the session
export async function DELETE(request: NextRequest) {
  cookies().delete('session');
  return NextResponse.json({ status: 'success' }, { status: 200 });
}
