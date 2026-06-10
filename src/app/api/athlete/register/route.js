import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'ascend-secret-key-12345';

export async function POST(request) {
  try {
    const data = await request.json();
    const existing = await prisma.athlete.findUnique({ where: { email: data.email } });
    if (existing) return NextResponse.json({ success: false, error: 'Atleta já cadastrado.' }, { status: 400 });

    // Pega o coach com o qual o atleta quer se vincular (usando o primeiro para não complicar a UI de busca de times)
    const coach = await prisma.coach.findFirst(); 
    if (!coach) return NextResponse.json({ success: false, error: 'Nenhum Coach ativo na liga.' }, { status: 400 });

    const hashedPassword = await bcrypt.hash(data.password, 10);

    const athlete = await prisma.athlete.create({
      data: {
        name: data.name,
        email: data.email,
        password: hashedPassword,
        position: data.position,
        coachId: coach.id
      }
    });

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
  } catch (e) {
    return NextResponse.json({ success: false, error: e.message }, { status: 500 });
  }
}
