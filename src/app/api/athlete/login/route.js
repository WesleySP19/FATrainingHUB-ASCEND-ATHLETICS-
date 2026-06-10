import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'ascend-secret-key-12345';

export async function POST(request) {
  try {
    const data = await request.json();
    const athlete = await prisma.athlete.findUnique({ 
      where: { email: data.email }, 
      include: { coach: true } 
    });
    
    if (!athlete) {
      return NextResponse.json({ success: false, error: 'E-mail ou senha incorretos.' }, { status: 401 });
    }

    const isHash = athlete.password && (athlete.password.startsWith('$2a$') || athlete.password.startsWith('$2b$') || athlete.password.startsWith('$2y$'));
    let passwordMatch = false;
    if (isHash) {
      passwordMatch = await bcrypt.compare(data.password, athlete.password);
    } else {
      passwordMatch = athlete.password === data.password;
    }

    if (!passwordMatch) {
      return NextResponse.json({ success: false, error: 'E-mail ou senha incorretos.' }, { status: 401 });
    }

    const token = jwt.sign(
      { userId: athlete.id, role: 'ROLE_ATHLETE' },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    const response = NextResponse.json({ success: true, athlete });
    response.cookies.set('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60,
      path: '/'
    });

    return response;
  } catch (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
