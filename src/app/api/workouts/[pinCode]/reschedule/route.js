import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(request, { params }) {
  const p = await params;
  const pinCode = p.pinCode;

  try {
    const data = await request.json(); // { fromDay: 'monday', toDay: 'tuesday' }
    const { fromDay, toDay } = data;

    if (!fromDay || !toDay) {
      return NextResponse.json({ success: false, error: 'Parâmetros fromDay e toDay são obrigatórios.' }, { status: 400 });
    }

    const workout = await prisma.workout.findUnique({
      where: { pinCode }
    });

    if (!workout) {
      return NextResponse.json({ success: false, error: 'Treino não encontrado.' }, { status: 404 });
    }

    // Atualiza o dia de todos os sets correspondentes
    await prisma.workoutSet.updateMany({
      where: {
        workoutId: workout.id,
        dayOfWeek: fromDay.toLowerCase()
      },
      data: {
        dayOfWeek: toDay.toLowerCase()
      }
    });

    return NextResponse.json({ success: true, message: `Treino de ${fromDay} movido para ${toDay} com sucesso!` });
  } catch (error) {
    console.error("Erro ao reagendar treino:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
