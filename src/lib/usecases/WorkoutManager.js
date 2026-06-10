export class WorkoutManager {
  constructor(prismaClient) {
    this.prisma = prismaClient;
  }

  createShortHash() {
    const chars = '0123456789ABCDEF';
    let hash = '';
    for (let i = 0; i < 4; i++) {
      hash += chars[Math.floor(Math.random() * chars.length)];
    }
    return `TX-${hash}`;
  }

  async generateAccessIdForWorkout(workoutTemplate, coachId, athleteId = null) {
    const uniqueHash = this.createShortHash();
    
    const workout = await this.prisma.workout.create({
      data: {
        pinCode: uniqueHash,
        coachId,
        athleteId: athleteId || null,
        sets: {
          create: workoutTemplate.exercisesBlock.map(block => ({
            exerciseId: block.exercise.id,
            exerciseName: block.exercise.name,
            targetSets: parseInt(block.sets || 3),
            targetReps: parseInt(block.reps || 10),
            targetLoad: block.targetLoad ? parseFloat(block.targetLoad) : null,
            dayOfWeek: block.dayOfWeek || 'monday'
          }))
        }
      },
      include: { sets: true }
    });
    return workout;
  }

  async applyIndividualOverride(baseWorkoutId, athleteId, modifications) {
    const baseWorkout = await this.prisma.workout.findUnique({
      where: { id: baseWorkoutId },
      include: { sets: true }
    });
    if (!baseWorkout) throw new Error("Base workout template not found.");

    const uniqueHash = this.createShortHash();

    let targetSetsData = [];
    if (modifications && modifications.exercises) {
      targetSetsData = modifications.exercises.map(modEx => ({
        exerciseId: modEx.exerciseId || modEx.id,
        exerciseName: modEx.exerciseName || modEx.name,
        targetSets: parseInt(modEx.targetSets || 3),
        targetReps: parseInt(modEx.targetReps || 10),
        targetLoad: modEx.targetLoad ? parseFloat(modEx.targetLoad) : null,
        dayOfWeek: modEx.dayOfWeek || 'monday'
      }));
    } else {
      targetSetsData = baseWorkout.sets.map(s => ({
        exerciseId: s.exerciseId,
        exerciseName: s.exerciseName,
        targetSets: s.targetSets,
        targetReps: s.targetReps,
        targetLoad: s.targetLoad,
        dayOfWeek: s.dayOfWeek || 'monday'
      }));
    }

    const overriddenWorkout = await this.prisma.workout.create({
      data: {
        pinCode: uniqueHash,
        coachId: baseWorkout.coachId,
        athleteId: athleteId,
        sets: {
          create: targetSetsData
        }
      },
      include: { sets: true }
    });

    return overriddenWorkout;
  }
}
