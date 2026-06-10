export class WorkoutTemplate {
  constructor(title, targetGroup) {
    this.title = title;
    this.targetGroup = targetGroup; // 'Team', 'Position_Group', 'Individual'
    this.exercisesBlock = [];
    this.createdAt = new Date();
  }

  addExercise(exercise, sets, reps, targetLoad = null, dayOfWeek = "monday") {
    this.exercisesBlock.push({ exercise, sets, reps, targetLoad, dayOfWeek });
  }
}
