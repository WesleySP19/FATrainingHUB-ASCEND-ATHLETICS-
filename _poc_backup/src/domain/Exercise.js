export class Exercise {
  constructor(id, name, category, focus, recommendedPositions, description) {
    this.id = id;
    this.name = name;
    this.category = category;
    this.focus = focus;
    this.recommendedPositions = recommendedPositions || [];
    this.description = description;
    
    // Parâmetros preenchidos no momento da criação do treino
    this.sets = 0;
    this.reps = 0;
    this.load = 0; // em Kg
  }

  setPrescription(sets, reps, load) {
    this.sets = sets;
    this.reps = reps;
    this.load = load;
  }

  calculateVolume() {
    return this.sets * this.reps * this.load;
  }

  isRecommendedFor(position) {
    if (this.recommendedPositions.includes("ALL")) return true;
    return this.recommendedPositions.includes(position.toUpperCase());
  }
}
