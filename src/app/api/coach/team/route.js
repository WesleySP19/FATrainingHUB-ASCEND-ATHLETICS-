import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// Busca o time do coach ou todos os times
export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const coachId = searchParams.get('coachId');

    if (!coachId) {
      // Retorna todos os times com seus atletas ativos para a homepage
      const teams = await prisma.team.findMany({
        include: {
          coach: {
            include: {
              athletes: {
                select: {
                  id: true,
                  name: true,
                  position: true,
                  overall: true,
                  profilePhoto: true,
                  isMVP: true
                },
                orderBy: { overall: 'desc' }
              }
            }
          }
        }
      });

      return NextResponse.json({
        success: true,
        teams: teams.map(t => ({
          ...t,
          athletes: t.coach?.athletes || []
        }))
      });
    }

    const team = await prisma.team.findUnique({
      where: { coachId },
      include: {
        coach: {
          include: {
            athletes: {
              select: {
                id: true,
                name: true,
                position: true,
                overall: true,
                profilePhoto: true,
                isMVP: true
              },
              orderBy: { overall: 'desc' },
              take: 10
            }
          }
        }
      }
    });

    if (!team) {
      return NextResponse.json({ success: true, team: null });
    }

    return NextResponse.json({
      success: true,
      team: {
        ...team,
        athletes: team.coach?.athletes || []
      }
    });
  } catch (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

// Cria um novo time para o coach
export async function POST(request) {
  try {
    const data = await request.json();

    if (!data.coachId || !data.name) {
      return NextResponse.json({ success: false, error: 'coachId e name são obrigatórios.' }, { status: 400 });
    }

    // Verifica se o coach já tem um time
    const existing = await prisma.team.findUnique({ where: { coachId: data.coachId } });
    if (existing) {
      return NextResponse.json({ success: false, error: 'Este coach já possui um time cadastrado.' }, { status: 400 });
    }

    const team = await prisma.team.create({
      data: {
        name: data.name,
        abbreviation: data.abbreviation || data.name.substring(0, 2).toUpperCase(),
        logoUrl: data.logoUrl || null,
        primaryColor: data.primaryColor || '#f97316',
        history: data.history || null,
        wins: parseInt(data.wins) || 0,
        losses: parseInt(data.losses) || 0,
        draws: parseInt(data.draws) || 0,
        founded: data.founded || null,
        trainingFrequency: data.trainingFrequency || '3x por semana',
        championships: parseInt(data.championships) || 0,
        coachId: data.coachId
      }
    });

    return NextResponse.json({ success: true, team });
  } catch (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

// Atualiza o time do coach
export async function PUT(request) {
  try {
    const data = await request.json();

    if (!data.coachId) {
      return NextResponse.json({ success: false, error: 'coachId é obrigatório.' }, { status: 400 });
    }

    const existing = await prisma.team.findUnique({ where: { coachId: data.coachId } });
    if (!existing) {
      return NextResponse.json({ success: false, error: 'Time não encontrado para este coach.' }, { status: 404 });
    }

    const updateData = {};
    if (data.name !== undefined) updateData.name = data.name;
    if (data.abbreviation !== undefined) updateData.abbreviation = data.abbreviation;
    if (data.logoUrl !== undefined) updateData.logoUrl = data.logoUrl;
    if (data.primaryColor !== undefined) updateData.primaryColor = data.primaryColor;
    if (data.history !== undefined) updateData.history = data.history;
    if (data.wins !== undefined) updateData.wins = parseInt(data.wins) || 0;
    if (data.losses !== undefined) updateData.losses = parseInt(data.losses) || 0;
    if (data.draws !== undefined) updateData.draws = parseInt(data.draws) || 0;
    if (data.founded !== undefined) updateData.founded = data.founded;
    if (data.trainingFrequency !== undefined) updateData.trainingFrequency = data.trainingFrequency;
    if (data.championships !== undefined) updateData.championships = parseInt(data.championships) || 0;

    const team = await prisma.team.update({
      where: { coachId: data.coachId },
      data: updateData
    });

    return NextResponse.json({ success: true, team });
  } catch (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
