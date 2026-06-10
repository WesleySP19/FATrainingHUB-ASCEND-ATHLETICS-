import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    // Busca todos os exercícios semeados (GYM e HOME)
    const exercises = await prisma.exercise.findMany();
    return NextResponse.json({ success: true, exercises });
  } catch (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
