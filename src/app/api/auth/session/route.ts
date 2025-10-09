
import { cookies } from 'next/headers';
import { NextRequest, NextResponse } from 'next/server';

// This file no longer needs to handle session creation or verification via the Admin SDK.
// The client-side logic and Firestore rules now manage authentication state and access control.

// Handles DELETE requests to clear the session cookie upon logout.
export async function DELETE(request: NextRequest) {
  cookies().delete('session');
  return NextResponse.json({ status: 'success' }, { status: 200 });
}

// The GET and POST handlers are removed as they are no longer necessary.
// Client-side auth state is managed by the Firebase Auth SDK (client) and its persistence.
// Server-side validation happens via Firestore rules which automatically get the user's auth token.
