import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function DELETE(request, { params }) {
  try {
    const p = await params;
    const { id } = p;

    if (!id) {
      return NextResponse.json({ success: false, error: 'ID da jogada não fornecido.' }, { status: 400 });
    }

    // Deleta os feedbacks atrelados à jogada
    await prisma.playFeedback.deleteMany({
      where: { playId: id }
    });

    // Deleta as atribuições
    await prisma.playAssignment.deleteMany({
      where: { playId: id }
    });

    // Finalmente, deleta a jogada
    await prisma.play.delete({
      where: { id }
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
