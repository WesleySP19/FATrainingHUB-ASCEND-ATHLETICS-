import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(request, { params }) {
  try {
    const p = await params;
    const { athleteId } = p;

    if (!athleteId) {
      return NextResponse.json({ success: false, error: 'ID do atleta não fornecido' }, { status: 400 });
    }

    // Busca o atleta e seus dados básicos
    const athlete = await prisma.athlete.findUnique({
      where: { id: athleteId },
      include: {
        personalRecords: {
          orderBy: { dateAchieved: 'desc' }
        }
      }
    });

    if (!athlete) {
      return NextResponse.json({ success: false, error: 'Atleta não encontrado' }, { status: 404 });
    }

    // Busca os workouts completados por este atleta
    // A logica atual é: se o workout foi gerado e atribuido ao atleta (isOverride) ele tem athleteId.
    // Mas e se for um workout geral que o atleta acessou?
    // Na verdade, quando o atleta finaliza o treino, o sistema salva o Workout com os Sets completos e o atletaId pode estar atrelado.
    // Vamos buscar os workouts atrelados ao athleteId ou os workouts cujos logs pertencem ao atleta.
    // Vamos olhar como o /api/athlete/log (ou similar) salva os workouts finalizados.
    
    // Na nossa modelagem, Workout tem `athleteId`.
    const workouts = await prisma.workout.findMany({
      where: {
        athleteId: athleteId,
        // Só queremos treinos que o atleta finalizou. Uma heurística: rpeScore ou painScore foram preenchidos, ou algum set isCompleted = true.
        // Vamos pegar todos atrelados a ele para simplificar, ordenados por data
      },
      include: {
        sets: true
      },
      orderBy: {
        date: 'desc'
      }
    });

    return NextResponse.json({
      success: true,
      athlete,
      workouts
    });

  } catch (error) {
    console.error('Erro ao buscar relatório do atleta:', error);
    return NextResponse.json({ success: false, error: 'Erro interno do servidor' }, { status: 500 });
  }
}
