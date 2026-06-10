import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { WorkoutTemplate } from '@/lib/domain/WorkoutTemplate';
import { WorkoutManager } from '@/lib/usecases/WorkoutManager';

export async function POST(request) {
  try {
    const data = await request.json();
    const manager = new WorkoutManager(prisma);

    // 1. Se for uma sobrescrita (override) individual
    if (data.isOverride && data.baseWorkoutId && data.athleteId) {
      const modifications = { exercises: data.exercises };
      const workout = await manager.applyIndividualOverride(data.baseWorkoutId, data.athleteId, modifications);
      return NextResponse.json({ success: true, workout });
    }

    // 2. Criação normal a partir de template
    const template = new WorkoutTemplate(data.title || "Treino Prescrito", data.athleteId ? "Individual" : (data.positionGroup ? "Position_Group" : "Team"));
    
    for (const ex of data.exercises) {
      // Cria a estrutura usando as classes POO
      template.addExercise(
        { id: ex.id, name: ex.name },
        parseInt(ex.targetSets || 3),
        parseInt(ex.targetReps || 10),
        ex.targetLoad ? parseFloat(ex.targetLoad) : null,
        ex.dayOfWeek || 'monday'
      );
    }

    let coachId = data.coachId;
    if (!coachId) {
      let coach = await prisma.coach.findFirst();
      if (!coach) {
        coach = await prisma.coach.create({
          data: { name: "Coach Supremo", email: "coach@fafoundation.com", teamName: "Black Mambas", role: "HC" }
        });
      }
      coachId = coach.id;
    }

    let primaryWorkout;

    // Se direcionado para atleta específico
    if (data.athleteId) {
      primaryWorkout = await manager.generateAccessIdForWorkout(template, coachId, data.athleteId);
    } 
    // Se direcionado por Grupo de Posição (Coletivo)
    else if (data.positionGroup) {
      const athletes = await prisma.athlete.findMany({
        where: {
          coachId: coachId,
          position: data.positionGroup
        }
      });

      if (athletes.length > 0) {
        const created = await Promise.all(
          athletes.map(ath => manager.generateAccessIdForWorkout(template, coachId, ath.id))
        );
        primaryWorkout = created[0]; // Retorna a primeira referência para o Coach
      } else {
        // Se nenhum atleta for do grupo, cria um treino geral
        primaryWorkout = await manager.generateAccessIdForWorkout(template, coachId, null);
      }
    } 
    // Treino geral para todos
    else {
      primaryWorkout = await manager.generateAccessIdForWorkout(template, coachId, null);
    }

    return NextResponse.json({ success: true, workout: primaryWorkout });
  } catch (error) {
    console.error("Erro ao criar treino:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

