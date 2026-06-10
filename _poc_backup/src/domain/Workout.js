export class Workout {
  constructor(coachId, title, date) {
    // Gera um código de 6 dígitos (ex: 839210) que será passado para os atletas
    this.id = this._generateAccessCode();
    this.coachId = coachId;
    this.title = title || "Treino do Dia";
    this.date = date || new Date().toISOString().split('T')[0];
    this.exercises = []; // Lista de instâncias da classe Exercise
  }

  _generateAccessCode() {
    return Math.floor(100000 + Math.random() * 900000).toString();
  }

  addExercise(exercise) {
    this.exercises.push(exercise);
  }

  removeExercise(exerciseId) {
    this.exercises = this.exercises.filter(ex => ex.id !== exerciseId);
  }

  getTotalVolume() {
    return this.exercises.reduce((total, ex) => {
      // Garantimos que ex.calculateVolume exista (caso tenha sido recuperado do JSON bruto)
      if (typeof ex.calculateVolume === 'function') {
        return total + ex.calculateVolume();
      }
      return total + (ex.sets * ex.reps * ex.load);
    }, 0);
  }
}
