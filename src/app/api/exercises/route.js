import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    // Busca todos os exercícios semeados (GYM e HOME)
    const exercises = await prisma.exercise.findMany();
    return NextResponse.json({ success: true, exercises });
  } catch (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

// Cria um novo exercício dinamicamente
export async function POST(request) {
  try {
    const data = await request.json();
    if (!data.name || !data.type || !data.location) {
      return NextResponse.json({ success: false, error: 'Campos obrigatórios ausentes (nome, tipo ou ambiente).' }, { status: 400 });
    }

    const exercise = await prisma.exercise.create({
      data: {
        name: data.name,
        type: data.type,
        location: data.location,
        description: data.description || null,
        mechanics: data.mechanics || null,
        imageUrl: data.imageUrl || null,
        gifUrl: data.gifUrl || null,
        videoUrl: data.videoUrl || null,
        mediaUrl: data.mediaUrl || null
      }
    });

    return NextResponse.json({ success: true, exercise });
  } catch (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

