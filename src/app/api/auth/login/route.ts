import { getAuth } from 'firebase-admin/auth';
import { initializeFirebaseAdmin } from '@/firebase/server';
import { NextRequest, NextResponse } from 'next/server';

// Initialize the Firebase Admin SDK
initializeFirebaseAdmin();

export async function POST(request: NextRequest) {
  try {
    const idToken = await request.text();
    const expiresIn = 60 * 60 * 24 * 5 * 1000; // 5 days

    const sessionCookie = await getAuth().createSessionCookie(idToken, { expiresIn });

    const options = {
      name: 'session',
      value: sessionCookie,
      maxAge: expiresIn,
      httpOnly: true,
      secure: true,
    };

    const response = NextResponse.json({ status: 'success' });
    response.cookies.set(options);

    return response;
  } catch (error) {
    console.error('Error creating session cookie:', error);
    return NextResponse.json({ status: 'error', message: 'Failed to create session' }, { status: 401 });
  }
}
