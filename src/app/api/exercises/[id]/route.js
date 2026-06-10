import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(request, { params }) {
  try {
    const resolvedParams = await params;
    const id = resolvedParams.id;
    
    const exercise = await prisma.exercise.findUnique({
      where: { id }
    });
    
    if (!exercise) {
      return NextResponse.json({ success: false, error: 'Exercício não encontrado.' }, { status: 404 });
    }
    
    return NextResponse.json({ success: true, exercise });
  } catch (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
