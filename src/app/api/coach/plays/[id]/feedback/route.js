import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(request, { params }) {
  try {
    const resolvedParams = await params;
    const playId = resolvedParams.id;

    if (!playId) {
      return NextResponse.json({ success: false, error: 'O ID da jogada é obrigatório.' }, { status: 400 });
    }

    // 1. Busca todas as atribuições dessa jogada
    const assignments = await prisma.playAssignment.findMany({
      where: { playId },
      include: {
        athlete: {
          select: { id: true, name: true, position: true, overall: true }
        }
      }
    });

    // 2. Busca todos os feedbacks registrados
    const feedbacks = await prisma.playFeedback.findMany({
      where: { playId }
    });

    const feedbackMap = new Map(feedbacks.map(f => [f.athleteId, f]));

    // 3. Consolida as respostas de cada atleta
    const reports = assignments.map(ass => {
      const fb = feedbackMap.get(ass.athleteId);
      return {
        athleteId: ass.athlete.id,
        name: ass.athlete.name,
        position: ass.athlete.position,
        overall: ass.athlete.overall,
        assignedAt: ass.assignedAt,
        status: fb ? fb.status : 'UNVIEWED', // UNDERSTOOD, DOUBT, UNVIEWED
        comment: fb ? fb.comment : null,
        updatedAt: fb ? fb.updatedAt : null
      };
    });

    return NextResponse.json({ success: true, reports });
  } catch (error) {
    console.error("Erro ao carregar feedbacks da jogada:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
