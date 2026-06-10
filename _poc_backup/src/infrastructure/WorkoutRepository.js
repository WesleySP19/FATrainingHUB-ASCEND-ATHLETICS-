export class WorkoutRepository {
  constructor() {
    this.storageKey = 'fa_workouts';
    // Em um cenário real, estes dados viriam de uma API REST,
    // mas aqui estamos carregando de um JSON fixo que definimos e
    // cacheando as informações de treino no LocalStorage.
  }

  async getExerciseLibrary() {
    try {
      // Como estamos operando sem um servidor web nesta POC estática, o fetch 
      // de arquivos JSON locais pode dar erro de CORS em navegadores (se aberto direto como file://).
      // Mas assumindo o uso de um Live Server ou bundle via Vite futuramente:
      const response = await fetch('/src/infrastructure/data/exercises.json');
      if (!response.ok) {
        throw new Error('Falha ao carregar a biblioteca de exercícios.');
      }
      const data = await response.json();
      return data.exercises;
    } catch (error) {
      console.warn("Retornando fallback da biblioteca de exercícios devido a erro de fetch:", error);
      return this._getExerciseLibraryFallback();
    }
  }

  // Fallback caso estejamos executando o arquivo index.html direto sem um servidor local
  _getExerciseLibraryFallback() {
    return [
      {
        "id": "ex-001",
        "name": "Squat (Agachamento Livre)",
        "category": "Powerlifting",
        "focus": "Força Base",
        "recommendedPositions": ["ALL"],
        "description": "Exercício base para força de membros inferiores, essencial para sustentar tackles e blocos."
      },
      {
        "id": "ex-004",
        "name": "Power Clean",
        "category": "LPO",
        "focus": "Explosão",
        "recommendedPositions": ["OL", "DL", "LB", "TE", "RB"],
        "description": "Exercício vital para gerar explosão e força a partir do quadril, fundamental para o primeiro passo na linha de scrimmage."
      }
    ];
  }

  saveWorkout(workout) {
    const workouts = this.getAllWorkouts();
    // Atualiza ou insere o treino
    const index = workouts.findIndex(w => w.id === workout.id);
    if (index >= 0) {
      workouts[index] = workout;
    } else {
      workouts.push(workout);
    }
    localStorage.setItem(this.storageKey, JSON.stringify(workouts));
    return workout;
  }

  getWorkoutById(id) {
    const workouts = this.getAllWorkouts();
    return workouts.find(w => w.id === id) || null;
  }

  getAllWorkouts() {
    const data = localStorage.getItem(this.storageKey);
    return data ? JSON.parse(data) : [];
  }
}
