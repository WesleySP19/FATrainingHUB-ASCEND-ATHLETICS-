import { Workout } from '../domain/Workout.js';

export class GenerateWorkoutId {
  constructor(workoutRepository) {
    // Injeção de dependência do repositório
    this.workoutRepository = workoutRepository;
  }

  /**
   * Executa o caso de uso de criar um treino e retornar seu ID (Access Code)
   * @param {string} coachId ID do coach logado
   * @param {string} title Título do treino
   * @param {Array} exercisePrescriptions Lista de objetos contendo id, sets, reps, load
   */
  async execute(coachId, title, exercisePrescriptions) {
    const workout = new Workout(coachId, title);

    // Carrega a biblioteca para validar os exercícios selecionados
    const library = await this.workoutRepository.getExerciseLibrary();
    
    exercisePrescriptions.forEach(prescription => {
      const validExerciseData = library.find(ex => ex.id === prescription.id);
      
      if (validExerciseData) {
        // Simulação da adição das métricas no objeto do exercício
        const configuredExercise = {
          ...validExerciseData,
          sets: prescription.sets || 0,
          reps: prescription.reps || 0,
          load: prescription.load || 0
        };
        workout.addExercise(configuredExercise);
      }
    });

    // Salva o treino no repositório (que internamente pode ir para API ou LocalStorage)
    const savedWorkout = this.workoutRepository.saveWorkout(workout);
    
    // Retorna apenas a entidade pronta com o AccessCode (id) gerado
    return savedWorkout;
  }
}
