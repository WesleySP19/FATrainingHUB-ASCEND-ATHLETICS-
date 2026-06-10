import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    // Busca os top 100 atletas ordenados pelo OVR (Overall Rating) de forma decrescente
    const athletes = await prisma.athlete.findMany({
      orderBy: { overall: 'desc' },
      include: { coach: true },
      take: 100 
    });
    return NextResponse.json({ success: true, rank: athletes });
  } catch (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
