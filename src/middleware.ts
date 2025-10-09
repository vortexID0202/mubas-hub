import { NextResponse, type NextRequest } from 'next/server';

export async function middleware(request: NextRequest) {
  // We don't need to manually pass the session cookie via headers anymore.
  // The cookie is automatically sent by the browser on subsequent requests to the server.
  return NextResponse.next();
}

export const config = {
  matcher: '/:path*',
};
