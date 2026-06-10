import { NextResponse } from 'next/server';

export async function POST() {
  const response = NextResponse.json({ success: true, message: 'Logged out successfully' });
  // Deleta o cookie do token de autenticação
  response.cookies.set('token', '', {
    httpOnly: true,
    expires: new Date(0),
    path: '/'
  });
  return response;
}
