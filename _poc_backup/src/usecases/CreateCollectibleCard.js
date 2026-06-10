export class CreateCollectibleCard {
  constructor() {
    // Num cenário real, injetaríamos um AthleteRepository aqui
  }

  /**
   * Compila os dados do Atleta e gera o DTO final para a interface (Holographic Card)
   * @param {Athlete} athlete Instância da classe Athlete
   */
  execute(athlete) {
    if (!athlete || typeof athlete.calculateOverallScore !== 'function') {
      throw new Error("Um objeto Athlete válido é necessário para gerar o card.");
    }

    const overall = athlete.calculateOverallScore();
    
    return {
      athleteId: athlete.id,
      athleteName: athlete.name,
      position: athlete.position,
      overall: overall,
      badges: this._generateBadges(athlete),
      cardTier: this._determineCardTier(overall)
    };
  }

  _generateBadges(athlete) {
    const badges = [];
    const prs = athlete.personalRecords;
    
    // Exemplo de regra de negócio para badges:
    // Se fez 100+ no Agachamento (id simulado "ex-001")
    if (prs["ex-001"] && prs["ex-001"] >= 100) { 
      badges.push("100kg+ Club (Squat)");
    }
    
    if (athlete.attendanceCount >= 20) {
      badges.push("Iron Commitment");
    }
    
    return badges;
  }

  _determineCardTier(overall) {
    if (overall >= 90) return "Elite (Holo-Gold)";
    if (overall >= 80) return "Pro (Silver)";
    if (overall >= 70) return "Starter (Bronze)";
    return "Rookie (Base)";
  }
}
