import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const coachId = searchParams.get('coachId');

    if (!coachId) {
      return NextResponse.json({ success: false, error: 'O coachId é obrigatório.' }, { status: 400 });
    }

    const plays = await prisma.play.findMany({
      where: { coachId },
      orderBy: { name: 'asc' }
    });

    return NextResponse.json({ success: true, plays });
  } catch (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const data = await request.json();
    const { name, sport, execution, position, description, fieldSize, dataJSON, coachId } = data;

    if (!name || !coachId || !dataJSON) {
      return NextResponse.json({ success: false, error: 'Dados obrigatórios ausentes.' }, { status: 400 });
    }

    const play = await prisma.play.create({
      data: {
        name,
        sport: sport || 'Futebol Americano',
        execution: execution || 'Ataque',
        position: position || null,
        description: description || null,
        fieldSize: fieldSize || '600,400',
        dataJSON: typeof dataJSON === 'string' ? dataJSON : JSON.stringify(dataJSON),
        coachId
      }
    });

    return NextResponse.json({ success: true, play });
  } catch (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
