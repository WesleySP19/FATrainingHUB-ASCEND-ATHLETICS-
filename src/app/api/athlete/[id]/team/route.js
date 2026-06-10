import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(request, { params }) {
  try {
    const resolvedParams = await params;
    const athleteId = resolvedParams.id;

    if (!athleteId) {
      return NextResponse.json({ success: false, error: 'ID do atleta é obrigatório.' }, { status: 400 });
    }

    // 1. Busca o atleta e seu coachId
    const athlete = await prisma.athlete.findUnique({
      where: { id: athleteId },
      select: { coachId: true }
    });

    if (!athlete || !athlete.coachId) {
      return NextResponse.json({ success: false, error: 'Atleta não encontrado ou não possui coach.' }, { status: 404 });
    }

    // 2. Busca o time do coach do atleta
    const team = await prisma.team.findUnique({
      where: { coachId: athlete.coachId }
    });

    if (!team) {
      return NextResponse.json({ success: true, team: null });
    }

    // 3. Busca os colegas de equipe (outros atletas do mesmo coach)
    const teammates = await prisma.athlete.findMany({
      where: {
        coachId: athlete.coachId
      },
      select: {
        id: true,
        name: true,
        position: true,
        overall: true,
        profilePhoto: true,
        isMVP: true
      },
      orderBy: { overall: 'desc' }
    });

    return NextResponse.json({
      success: true,
      team: {
        ...team,
        athletes: teammates
      }
    });
  } catch (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
