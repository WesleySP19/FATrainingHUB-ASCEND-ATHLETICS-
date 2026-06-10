import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(request) {
  try {
    const data = await request.json();
    const { playId, athleteIds } = data; // Espera { playId: '...', athleteIds: ['id1', 'id2'] }

    if (!playId || !Array.isArray(athleteIds)) {
      return NextResponse.json({ success: false, error: 'Dados obrigatórios ou formato de IDs de atletas inválidos.' }, { status: 400 });
    }

    await prisma.$transaction(async (tx) => {
      // 1. Limpa atribuições anteriores desta jogada
      await tx.playAssignment.deleteMany({
        where: { playId }
      });

      // 2. Insere as novas atribuições
      const newAssignments = athleteIds.map(athId => ({
        playId,
        athleteId: athId
      }));

      if (newAssignments.length > 0) {
        await tx.playAssignment.createMany({
          data: newAssignments
        });
      }

      // 3. Limpa feedbacks anteriores para estas atribuições
      await tx.playFeedback.deleteMany({
        where: {
          playId,
          athleteId: { in: athleteIds }
        }
      });
    });

    return NextResponse.json({ success: true, message: 'Jogada atribuída com sucesso aos atletas selecionados!' });
  } catch (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
