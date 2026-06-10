import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'ascend-secret-key-12345';

export async function POST(request) {
  try {
    const data = await request.json();
    
    // Verifica se já existe o e-mail
    const existing = await prisma.coach.findUnique({ where: { email: data.email } });
    if (existing) {
      return NextResponse.json({ success: false, error: 'Email já cadastrado na Liga.' }, { status: 400 });
    }

    const hashedPassword = await bcrypt.hash(data.password, 10);

    const coach = await prisma.coach.create({
      data: {
        name: data.name,
        email: data.email,
        password: hashedPassword,
        teamName: data.teamName,
        role: data.role || "HC"
      }
    });

    const token = jwt.sign(
      { userId: coach.id, role: 'ROLE_COACH' },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    const { password: _, ...coachWithoutPassword } = coach;
    const response = NextResponse.json({ success: true, coach: coachWithoutPassword });
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
