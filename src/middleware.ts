import { NextResponse, type NextRequest } from 'next/server';

export async function middleware(request: NextRequest) {
  const session = request.cookies.get('session');
  const response = NextResponse.next();

  // Pass the session cookie to server actions via headers
  if (session) {
    response.headers.set('x-session-cookie', session.value);
  }

  return response;
}

export const config = {
  matcher: '/:path*',
};
