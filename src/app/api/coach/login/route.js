import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'ascend-secret-key-12345';

export async function POST(request) {
  try {
    const data = await request.json();
    const coach = await prisma.coach.findUnique({ where: { email: data.email } });
    
    if (!coach) {
      return NextResponse.json({ success: false, error: 'E-mail ou senha incorretos.' }, { status: 401 });
    }

    const isHash = coach.password && (coach.password.startsWith('$2a$') || coach.password.startsWith('$2b$') || coach.password.startsWith('$2y$'));
    let passwordMatch = false;
    if (isHash) {
      passwordMatch = await bcrypt.compare(data.password, coach.password);
    } else {
      passwordMatch = coach.password === data.password;
    }

    if (!passwordMatch) {
      return NextResponse.json({ success: false, error: 'E-mail ou senha incorretos.' }, { status: 401 });
    }

    const token = jwt.sign(
      { userId: coach.id, role: 'ROLE_COACH' },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    const response = NextResponse.json({ success: true, coach });
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
