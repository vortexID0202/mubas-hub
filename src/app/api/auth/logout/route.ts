import { NextResponse } from 'next/server';

export async function POST() {
  const response = NextResponse.json({ status: 'success' });
  response.cookies.set({
    name: 'session',
    value: '',
    expires: new Date(0),
    httpOnly: true,
    secure: true,
  });
  return response;
}
