import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function DELETE(request, { params }) {
  try {
    const resolvedParams = await params;
    const exerciseId = resolvedParams.id;

    if (!exerciseId) {
      return NextResponse.json({ success: false, error: 'O ID do exercício é obrigatório.' }, { status: 400 });
    }

    // Deleta o exercício. Nota: Se o exercício já estiver sendo usado em um WorkoutSet, 
    // dependerá das configurações de OnDelete (atualmente não estrito). 
    // É recomendado garantir que não há WorkoutSets órfãos ou usar cascade.
    await prisma.exercise.delete({
      where: { id: exerciseId }
    });

    return NextResponse.json({ success: true, message: 'Exercício deletado com sucesso.' });
  } catch (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
