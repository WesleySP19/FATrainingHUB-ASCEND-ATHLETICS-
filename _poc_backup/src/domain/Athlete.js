export class Athlete {
  constructor(id, name, position) {
    this.id = id;
    this.name = name;
    this.position = position.toUpperCase();
    this.personalRecords = {}; // ex: { "ex-001": 150 } (Kg)
    this.attendanceCount = 0; // Quantidade de treinos concluídos
  }

  updatePR(exerciseId, newLoad) {
    const currentPR = this.personalRecords[exerciseId] || 0;
    if (newLoad > currentPR) {
      this.personalRecords[exerciseId] = newLoad;
      return true; // Retorna true se quebrou o recorde pessoal!
    }
    return false;
  }

  incrementAttendance() {
    this.attendanceCount++;
  }

  // O motor da Gamificação: calcula um Rating (Overall) inspirado em games como Madden NFL
  calculateOverallScore() {
    let score = 50; // Nota base para qualquer atleta iniciante
    
    // Peso da Assiduidade: até 20 pontos de Overall
    score += Math.min(this.attendanceCount * 0.5, 20);

    // Peso da Força (PRs): 2 pontos por cada exercício onde o atleta tem um PR registrado
    const prCount = Object.keys(this.personalRecords).length;
    score += Math.min(prCount * 2, 29); // Máximo de 29 pontos aqui

    const finalScore = Math.floor(score);
    return finalScore > 99 ? 99 : finalScore; // Cap máximo em 99 OVR
  }
}
