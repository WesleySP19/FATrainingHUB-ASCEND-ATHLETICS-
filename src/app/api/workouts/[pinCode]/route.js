import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(request, { params }) {
  // No Next.js 15, os params precisam ser lidos de forma assíncrona
  const p = await params;
  const pinCode = p.pinCode;

  try {
    const workout = await prisma.workout.findUnique({
      where: { pinCode },
      include: { sets: true, coach: true }
    });

    if (!workout) {
      return NextResponse.json({ success: false, message: 'Treino não encontrado' }, { status: 404 });
    }

    return NextResponse.json({ success: true, workout });
  } catch (error) {
    console.error("Erro ao buscar treino:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
