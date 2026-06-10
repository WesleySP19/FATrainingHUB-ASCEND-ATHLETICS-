import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(request, { params }) {
  const p = await params;
  const pinCode = p.pinCode;

  try {
    const data = await request.json(); // Espera receber { athleteId: '...', actualLoads: { [setId]: load } }
    const athleteId = data.athleteId;

    await prisma.$transaction(async (tx) => {
      const workout = await tx.workout.findUnique({ 
        where: { pinCode },
        include: { sets: true }
      });
      if (!workout) throw new Error('Treino não encontrado');

      // Se o treino era geral e foi executado por um atleta, vincula o atleta a esse treino
      const updateData = {};
      if (athleteId && !workout.athleteId) {
        updateData.athleteId = athleteId;
      }
      if (data.wellnessFeedback) {
        if (data.wellnessFeedback.sleepScore !== undefined) {
          updateData.sleepScore = parseInt(data.wellnessFeedback.sleepScore) || null;
        }
        if (data.wellnessFeedback.painScore !== undefined) {
          updateData.painScore = parseInt(data.wellnessFeedback.painScore) || null;
        }
      }
      if (data.fieldRPE !== undefined) {
        updateData.rpeScore = parseInt(data.fieldRPE) || null;
      }

      if (Object.keys(updateData).length > 0) {
        await tx.workout.update({
          where: { id: workout.id },
          data: updateData
        });
      }

      // 1. Atualiza as cargas reais e marca conjuntos como completos
      let newPRsCount = 0;
      if (data.actualLoads && athleteId) {
        for (const [setId, loadVal] of Object.entries(data.actualLoads)) {
          const load = parseFloat(loadVal);
          if (isNaN(load) || load <= 0) continue;

          // Atualiza o set
          const updatedSet = await tx.workoutSet.update({
            where: { id: setId },
            data: {
              actualLoad: load,
              isCompleted: true
            }
          });

          // Checa se é um novo PR para esse atleta
          const existingPR = await tx.pRRecord.findFirst({
            where: {
              athleteId: athleteId,
              exerciseName: updatedSet.exerciseName
            },
            orderBy: { maxLoad: 'desc' }
          });

          if (!existingPR || load > existingPR.maxLoad) {
            // Cria o registro de PR
            await tx.pRRecord.create({
              data: {
                athleteId,
                exerciseId: updatedSet.exerciseId,
                exerciseName: updatedSet.exerciseName,
                maxLoad: load
              }
            });
            newPRsCount++;
          }
        }
      }

      // 2. Lógica de Gamificação (Level Up e Contagem de Presença/PR)
      if (athleteId) {
        const athlete = await tx.athlete.findUnique({ where: { id: athleteId } });
        if (athlete) {
          const newAttendance = athlete.attendanceCount + 1;
          const newPRCount = athlete.prCount + newPRsCount;
          let newOvr = athlete.overall;
          
          // A cada 3 treinos completados (Constância), ganha 1 ponto de Overall
          if (newAttendance % 3 === 0) {
            newOvr += 1;
          }

          // Bônus: A cada novo recorde pessoal (PR), ganha 1 ponto extra de Overall
          if (newPRsCount > 0) {
            newOvr += newPRsCount;
          }

          const updatedAthlete = await tx.athlete.update({
            where: { id: athlete.id },
            data: { 
              attendanceCount: newAttendance,
              prCount: newPRCount,
              overall: newOvr > 99 ? 99 : newOvr // Cap no OVR 99
            }
          });

          // Sinaliza o término do treino para o canal SSE em tempo real
          if (!global.workoutCompletions) {
            global.workoutCompletions = [];
          }
          global.workoutCompletions.push({
            athleteId: updatedAthlete.id,
            athleteName: updatedAthlete.name,
            overall: updatedAthlete.overall,
            attendanceCount: updatedAthlete.attendanceCount,
            prCount: updatedAthlete.prCount,
            newPRsCount: newPRsCount,
            timestamp: Date.now()
          });
        }
      }
    });

    return NextResponse.json({ success: true, message: 'Treino salvo, cargas reais salvas e experiência computada!' });
  } catch (error) {
    console.error("Erro ao encerrar treino:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: error.message === 'Treino não encontrado' ? 404 : 500 });
  }
}

