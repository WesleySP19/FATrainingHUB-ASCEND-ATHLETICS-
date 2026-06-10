import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// GET: Lista as jogadas atribuídas a um atleta e seus feedbacks correspondentes
export async function GET(request, { params }) {
  try {
    const resolvedParams = await params;
    const athleteId = resolvedParams.id;

    if (!athleteId) {
      return NextResponse.json({ success: false, error: 'O ID do atleta é obrigatório.' }, { status: 400 });
    }

    // Busca atribuições
    const assignments = await prisma.playAssignment.findMany({
      where: { athleteId },
      include: {
        play: {
          include: {
            coach: {
              select: { name: true, teamName: true }
            }
          }
        }
      }
    });

    const plays = await Promise.all(assignments.map(async (ass) => {
      // Busca se já há feedback para essa jogada
      const feedback = await prisma.playFeedback.findFirst({
        where: {
          playId: ass.playId,
          athleteId: athleteId
        }
      });

      return {
        ...ass.play,
        assignedAt: ass.assignedAt,
        feedback: feedback ? {
          status: feedback.status,
          comment: feedback.comment,
          audioUrl: feedback.audioUrl,
          updatedAt: feedback.updatedAt
        } : null
      };
    }));

    return NextResponse.json({ success: true, plays });
  } catch (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

// POST: Registra ou atualiza feedback de uma jogada
export async function POST(request, { params }) {
  try {
    const resolvedParams = await params;
    const athleteId = resolvedParams.id;
    const data = await request.json(); // { playId, status, comment, audioUrl }

    const { playId, status, comment, audioUrl } = data;

    if (!athleteId || !playId || !status) {
      return NextResponse.json({ success: false, error: 'Dados obrigatórios ausentes.' }, { status: 400 });
    }

    // Tenta encontrar se já existe um feedback
    const existingFeedback = await prisma.playFeedback.findFirst({
      where: {
        playId,
        athleteId
      }
    });

    let feedback;
    if (existingFeedback) {
      feedback = await prisma.playFeedback.update({
        where: { id: existingFeedback.id },
        data: {
          status,
          comment: comment || null,
          audioUrl: audioUrl || null
        }
      });
    } else {
      feedback = await prisma.playFeedback.create({
        data: {
          playId,
          athleteId,
          status,
          comment: comment || null,
          audioUrl: audioUrl || null
        }
      });
    }

    return NextResponse.json({ success: true, feedback });
  } catch (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
