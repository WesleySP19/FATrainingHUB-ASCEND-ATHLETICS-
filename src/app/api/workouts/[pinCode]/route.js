import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(request, { params }) {
  // No Next.js 15, os params precisam ser lidos de forma assíncrona
  const p = await params;
  const pinCode = p.pinCode;

  try {
    const workout = await prisma.workout.findUnique({
      where: { pinCode },
      select: {
        id: true,
        pinCode: true,
        title: true,
        type: true,
        coachId: true,
        athleteId: true,
        createdAt: true,
        sets: true,
        coach: {
          select: {
            name: true,
            teamName: true
          }
        }
      }
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
