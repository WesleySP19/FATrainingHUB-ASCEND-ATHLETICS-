import { prisma } from '@/lib/prisma';

export class AthleteDataService {
  constructor(prismaClient = prisma) {
    this.prisma = prismaClient;
  }

  // Identifica a modalidade esportiva com base na posição do atleta
  getSportByPosition(position) {
    const pos = (position || '').toUpperCase();
    if (pos === 'FORÇA BASE' || pos === 'ALUNO') {
      return 'Powerlifting';
    }
    if (pos === 'FORWARDS' || pos === 'BACKS') {
      return 'Rugby';
    }
    return 'Futebol Americano';
  }

  // Gera dados estruturados de performance tática baseados no Harry Kane
  calculateTacticalStats(athlete) {
    const sport = this.getSportByPosition(athlete.position);
    const ovr = athlete.overall || 70;
    const att = athlete.attendanceCount || 0;
    const prsCount = athlete.prCount || 0;

    if (sport === 'Powerlifting') {
      // Busca o maior peso registrado nos PRs, ou estima com base no OVR
      const topPR = athlete.personalRecords && athlete.personalRecords.length > 0 
        ? Math.max(...athlete.personalRecords.map(p => p.maxLoad)) 
        : Math.round(ovr * 2.5);

      return {
        sport,
        athleteName: athlete.name,
        teamName: athlete.coach?.teamName || 'Academia de Elite',
        photo: athlete.profilePhoto,
        summary: [
          { label: 'SQUAT PR (KG)', value: `${topPR} KG` },
          { label: 'SESSÕES TOTAIS', value: att },
          { label: 'REPS NA FAIXA ALVO', value: att * 30 || 240 },
          { label: 'EVOLUÇÃO SEMANAL', value: `+${(ovr * 0.15).toFixed(1)}%` }
        ],
        mechanicsTitle: 'MECHANICAL FORCES',
        mechanics: [
          { name: 'Extension Torque', value: Math.round(ovr * 1.2) },
          { name: 'Depth Control', value: Math.round(ovr * 0.5) },
          { name: 'Knee Stability', value: Math.round(ovr * 0.9) }
        ],
        fieldTitle: 'LIFT PHASES',
        field: [
          { name: 'Eccentric Phase', value: 133 },
          { name: 'Isometric Pause', value: 19 },
          { name: 'Concentric Push', value: 80 }
        ],
        milestones: [
          { name: 'Perfect Form', value: Math.floor(ovr * 0.3) },
          { name: '1RM Milestone', value: prsCount || Math.floor(ovr * 0.12) },
          { name: 'High Volume', value: ovr > 85 ? 1 : 0 },
          { name: 'Gym Record', value: ovr > 90 ? 12 : 1 }
        ],
        svgBody: 'powerlifting'
      };
    }

    if (sport === 'Rugby') {
      const tackles = att * 5 + 3;
      const meters = att * 85 + 240;
      return {
        sport,
        athleteName: athlete.name,
        teamName: athlete.coach?.teamName || 'Rugby Club',
        photo: athlete.profilePhoto,
        summary: [
          { label: 'METROS CORRIDOS', value: `${meters}m` },
          { label: 'TACKLES', value: tackles },
          { label: 'JOGOS', value: att + 2 },
          { label: 'EFICIÊNCIA PASSE', value: `${(80 + ovr * 0.15).toFixed(1)}%` }
        ],
        mechanicsTitle: 'MECHANICS BREAKDOWN',
        mechanics: [
          { name: 'Pass Hand Accuracy', value: Math.round(ovr * 1.1) },
          { name: 'Fend Hand Impact', value: Math.round(ovr * 0.8) },
          { name: 'Center Contact', value: Math.round(ovr * 0.6) }
        ],
        fieldTitle: 'TACTICAL PLAY',
        field: [
          { name: 'Angle Run Success', value: 133 },
          { name: 'Tactical Pass', value: 19 },
          { name: 'Attack Phase Win', value: 80 }
        ],
        milestones: [
          { name: 'Impact Tackle', value: Math.floor(ovr * 0.3) },
          { name: 'Converted Kick', value: Math.floor(ovr * 0.12) },
          { name: '1000m+ Season', value: ovr > 85 ? 1 : 0 },
          { name: 'Rival MVP', value: athlete.isMVP ? 12 : 2 }
        ],
        svgBody: 'rugby'
      };
    }

    // Default: Futebol Americano
    const pos = (athlete.position || '').toUpperCase();
    if (pos === 'QB') {
      const games = att;
      const touchdowns = Math.round(att * 1.5 + prsCount * 0.5);
      const passYards = att * 220 + prsCount * 15;
      const passerRating = games > 0 ? (85 + (ovr - 70) * 0.6).toFixed(1) : '0.0';
      return {
        sport,
        athleteName: athlete.name,
        teamName: athlete.coach?.teamName || 'Wizards',
        photo: athlete.profilePhoto,
        summary: [
          { label: 'PASS TOUCHDOWNS', value: touchdowns },
          { label: 'GAMES', value: games },
          { label: 'PASS YARDS', value: `${passYards} YDS` },
          { label: 'PASSER RATING', value: passerRating }
        ],
        mechanicsTitle: 'QB MECHANICS',
        mechanics: [
          { name: 'Release Time (s)', value: (0.4 - ovr * 0.0015).toFixed(2) },
          { name: 'Arm Angle (deg)', value: Math.round(75 + ovr * 0.1) },
          { name: 'Hip Rotation Speed', value: Math.round(ovr * 1.1) }
        ],
        fieldTitle: 'PASS DISTRIBUTION',
        field: [
          { name: 'Deep Pass Attempts', value: 133 },
          { name: 'Short / Mid Pass', value: 19 },
          { name: 'Screen Pass Play', value: 80 }
        ],
        milestones: [
          { name: '300+ Yard Game', value: Math.floor(att * 0.4) },
          { name: 'Multi-TD Game', value: Math.floor(att * 0.3) },
          { name: '3000+ Season', value: passYards >= 3000 ? 1 : 0 },
          { name: 'Rival MVP', value: athlete.isMVP ? 1 : 0 }
        ],
        svgBody: 'football'
      };
    }

    if (pos === 'OL') {
      const games = att;
      const pancakes = Math.round(att * 2.2 + prsCount * 0.6);
      const snaps = att * 55;
      const sacksAllowed = Math.max(0, Math.round(att * 0.15 - prsCount * 0.05));
      return {
        sport,
        athleteName: athlete.name,
        teamName: athlete.coach?.teamName || 'Wizards',
        photo: athlete.profilePhoto,
        summary: [
          { label: 'PANCAKES', value: pancakes },
          { label: 'GAMES', value: games },
          { label: 'SNAPS PLAYED', value: snaps },
          { label: 'SACKS ALLOWED', value: sacksAllowed }
        ],
        mechanicsTitle: 'BLOCK MECHANICS',
        mechanics: [
          { name: 'Punch Speed (m/s)', value: (1.2 + ovr * 0.02).toFixed(1) },
          { name: 'Stance Angle (deg)', value: Math.round(35 + ovr * 0.05) },
          { name: 'Wide Anchor Hold', value: Math.round(ovr * 0.9) }
        ],
        fieldTitle: 'BLOCK INSTRUCTIONS',
        field: [
          { name: 'Zone Run Block', value: 133 },
          { name: 'Gap Run Block', value: 19 },
          { name: 'Pass Protection', value: 80 }
        ],
        milestones: [
          { name: 'Zero Sack Games', value: Math.max(0, games - sacksAllowed) },
          { name: 'Pancake Game', value: Math.floor(pancakes * 0.2) },
          { name: '500+ Snaps Season', value: snaps >= 500 ? 1 : 0 },
          { name: 'Rival MVP', value: athlete.isMVP ? 1 : 0 }
        ],
        svgBody: 'football'
      };
    }

    if (pos === 'DL') {
      const games = att;
      const sacks = Math.round(att * 0.4 + prsCount * 0.2);
      const pressures = Math.round(att * 2.5 + prsCount * 0.5);
      const tackles = Math.round(att * 3.2 + prsCount * 0.8);
      return {
        sport,
        athleteName: athlete.name,
        teamName: athlete.coach?.teamName || 'Wizards',
        photo: athlete.profilePhoto,
        summary: [
          { label: 'SACKS', value: sacks },
          { label: 'GAMES', value: games },
          { label: 'PRESSURES', value: pressures },
          { label: 'TOTAL TACKLES', value: tackles }
        ],
        mechanicsTitle: 'DL MECHANICS',
        mechanics: [
          { name: 'Get-off Time (s)', value: (0.8 - ovr * 0.003).toFixed(2) },
          { name: 'Punch Force (lbs)', value: Math.round(ovr * 12) },
          { name: 'Shed Block Efficiency', value: Math.round(ovr * 0.95) }
        ],
        fieldTitle: 'FIELD TACTICS',
        field: [
          { name: 'Pass Rush Wins', value: 133 },
          { name: 'Run Stuff Stops', value: 19 },
          { name: 'Goal Line Stands', value: 80 }
        ],
        milestones: [
          { name: '3+ Sack Game', value: Math.floor(sacks * 0.3) },
          { name: 'TFL Game', value: Math.floor(tackles * 0.25) },
          { name: '50+ Tackles Season', value: tackles >= 50 ? 1 : 0 },
          { name: 'Rival MVP', value: athlete.isMVP ? 1 : 0 }
        ],
        svgBody: 'football'
      };
    }

    // Default: Skills (WR, RB, DB, etc.)
    const games = att;
    const touchdowns = Math.round(att * 0.8 + prsCount * 0.2);
    const rushes = Math.round(att * 10);
    const tdPerGame = games > 0 ? (touchdowns / games).toFixed(2) : '0.00';
    return {
      sport,
      athleteName: athlete.name,
      teamName: athlete.coach?.teamName || 'Wizards',
      photo: athlete.profilePhoto,
      summary: [
        { label: 'TOUCHDOWNS', value: touchdowns },
        { label: 'GAMES', value: games },
        { label: 'RUSHES', value: rushes },
        { label: 'TD/GAME', value: tdPerGame }
      ],
      mechanicsTitle: 'MECHANICS BREAKDOWN',
      mechanics: [
        { name: 'Right Run', value: Math.round(ovr * 1.2) },
        { name: 'Left Run', value: Math.round(ovr * 0.5) },
        { name: 'In Middle', value: Math.round(ovr * 0.8) }
      ],
      fieldTitle: 'FIELD DISTRIBUTION',
      field: [
        { name: 'Red Zone', value: 133 },
        { name: 'Goal Line', value: 19 },
        { name: 'Down Field', value: 80 }
      ],
      milestones: [
        { name: '100+ Yard Game', value: Math.floor(att * 0.5) },
        { name: 'Multi-TD Game', value: Math.floor(touchdowns * 0.4) },
        { name: '1000+ Season', value: rushes * 4.5 >= 1000 ? 1 : 0 },
        { name: 'Rival MVP', value: athlete.isMVP ? 1 : 0 }
      ],
      svgBody: 'football'
    };
  }

  // Busca atleta no banco e processa
  async getAthleteTacticalData(id) {
    const athlete = await this.prisma.athlete.findUnique({
      where: { id },
      include: {
        coach: true,
        personalRecords: true
      }
    });
    if (!athlete) return null;
    const stats = this.calculateTacticalStats(athlete);
    
    try {
      stats.highlights = athlete.highlights ? JSON.parse(athlete.highlights) : [];
    } catch(e) {
      stats.highlights = [];
    }
    
    return stats;
  }

  // Busca perfil completo do atleta para o Locker Room
  async getAthleteFullProfile(id) {
    const athlete = await this.prisma.athlete.findUnique({
      where: { id },
      include: {
        coach: true,
        personalRecords: {
          orderBy: { dateAchieved: 'desc' }
        }
      }
    });

    if (!athlete) return null;

    // Busca o MVP do mesmo time/coach
    const mvp = await this.prisma.athlete.findFirst({
      where: {
        coachId: athlete.coachId,
        isMVP: true
      }
    });

    // Busca treinos direcionados especificamente para esse atleta
    const workouts = await this.prisma.workout.findMany({
      where: {
        athleteId: athlete.id
      },
      include: {
        sets: true,
        coach: true
      },
      orderBy: {
        date: 'desc'
      }
    });

    return { athlete, mvp, workouts };
  }

  // Atualiza as opções cosméticas de customização do card do atleta
  async updateAthleteCustomization(id, { themeColor, profilePhoto, cardBorder, highlights }) {
    return await this.prisma.athlete.update({
      where: { id },
      data: {
        themeColor,
        profilePhoto,
        cardBorder,
        highlights
      },
      include: {
        personalRecords: {
          orderBy: { dateAchieved: 'desc' }
        }
      }
    });
  }

  // Registra um recorde pessoal (PR) e incrementa prCount
  async addAthletePR(id, { exerciseId, exerciseName, maxLoad }) {
    await this.prisma.pRRecord.create({
      data: {
        athleteId: id,
        exerciseId: exerciseId || 'custom-pr',
        exerciseName,
        maxLoad: parseFloat(maxLoad)
      }
    });

    // Incrementa o contador de PRs do atleta
    return await this.prisma.athlete.update({
      where: { id },
      data: {
        prCount: { increment: 1 }
      },
      include: {
        personalRecords: {
          orderBy: { dateAchieved: 'desc' }
        }
      }
    });
  }

  // Busca dados fisiológicos (ACWR, RPE, sono e dor) do atleta ao longo do tempo
  async getAthletePhysioData(id) {
    const athlete = await this.prisma.athlete.findUnique({
      where: { id },
      include: {
        workouts: {
          include: { sets: true },
          orderBy: { date: 'desc' },
          take: 15
        }
      }
    });
    if (!athlete) return null;

    // Calcula ACWR com base nos treinos dos últimos 28 dias
    const dateLimit = new Date(Date.now() - 28 * 24 * 60 * 60 * 1000);
    const workoutsLast28Days = await this.prisma.workout.findMany({
      where: {
        athleteId: id,
        date: { gte: dateLimit }
      },
      include: { sets: true }
    });

    let acuteWorkload = 0;
    let chronicWorkloadSum = 0;
    const now = Date.now();
    const sevenDaysAgo = now - 7 * 24 * 60 * 60 * 1000;

    workoutsLast28Days.forEach(w => {
      let workoutWorkload = 0;
      w.sets.forEach(s => {
        const load = s.actualLoad || s.targetLoad || 1.0;
        workoutWorkload += load * s.targetReps;
      });
      if (workoutWorkload === 0) workoutWorkload = 100.0;

      if (new Date(w.date).getTime() >= sevenDaysAgo) {
        acuteWorkload += workoutWorkload;
      }
      chronicWorkloadSum += workoutWorkload;
    });

    const chronicWorkload = chronicWorkloadSum / 4.0;
    let acwr = 0.0;
    if (chronicWorkload > 0) {
      acwr = parseFloat((acuteWorkload / chronicWorkload).toFixed(2));
    } else if (acuteWorkload > 0) {
      acwr = 1.0;
    }

    const history = athlete.workouts.map(w => {
      const rpe = w.rpeScore || 7;
      const sleep = w.sleepScore || 4;
      const pain = w.painScore || 2;
      
      let workload = 0;
      w.sets.forEach(s => {
        const load = s.actualLoad || s.targetLoad || 1.0;
        workload += load * s.targetReps;
      });
      if (workload === 0) workload = 100.0;

      return {
        date: w.date.toISOString().split('T')[0],
        rpe,
        sleep,
        pain,
        workload
      };
    }).reverse();

    // Determinar status do ACWR
    let acwrStatusText = 'Sem Carga';
    let acwrColor = '#94a3b8'; // Cinza
    let acwrAdvice = 'Nenhum treino recente registrado para gerar análise fisiológica.';
    let acwrSeverity = 'neutral';

    if (acwr > 0) {
      if (acwr < 0.8) {
        acwrStatusText = 'Subtreino (Under-training)';
        acwrColor = '#38bdf8'; // Ciano
        acwrAdvice = 'O atleta apresenta carga de treino aguda significativamente menor que a crônica. Há risco de destreinamento. Recomendação: Aumentar gradualmente a intensidade ou volume das sessões.';
        acwrSeverity = 'info';
      } else if (acwr <= 1.3) {
        acwrStatusText = 'Zona Ideal (Optimal Workload)';
        acwrColor = '#10b981'; // Emerald
        acwrAdvice = 'A relação entre treino agudo e crônico está equilibrada. Esta é a "Zona Verde", onde o condicionamento físico melhora minimizando o risco de lesões. Recomendação: Manter a planilha atual.';
        acwrSeverity = 'success';
      } else if (acwr <= 1.5) {
        acwrStatusText = 'Zona de Sobrecarga (Overreaching)';
        acwrColor = '#f59e0b'; // Amarelo
        acwrAdvice = 'Carga de treino em ascensão acelerada. O atleta está em fase de sobrecarga funcional. Recomendação: Monitorar atentamente a dor muscular e garantir o repouso adequado nos próximos dias.';
        acwrSeverity = 'warning';
      } else {
        acwrStatusText = 'Risco Crítico de Lesão (Danger Zone)';
        acwrColor = '#ef4444'; // Vermelho
        acwrAdvice = '🚨 ALERTA CRÍTICO: Relação agudo-crônica acima da linha de perigo (ACWR > 1.50). O risco de lesão muscular ou fadiga crônica é estatisticamente muito alto. Recomendação: Reduzir imediatamente a carga em 40-50% ou sugerir repouso/treino regenerativo.';
        acwrSeverity = 'danger';
      }
    }

    // Ajustar recomendação se houver dor/soneca ruim nos últimos treinos
    const lastSession = history.length > 0 ? history[history.length - 1] : null;
    let wellnessAlert = null;
    if (lastSession) {
      if (lastSession.pain >= 4 && acwr > 1.3) {
        wellnessAlert = '⚠️ ATENÇÃO: Dor muscular elevada detectada em conjunto com sobrecarga de treinamento. Risco iminente de estiramento.';
        acwrAdvice = 'Atenção redobrada! Recomenda-se repouso total ou sessão exclusiva de fisioterapia/liberação miofascial.';
      } else if (lastSession.sleep <= 2) {
        wellnessAlert = '💤 AVISO DE RECUPERAÇÃO: Qualidade do sono crítica nas últimas 24h. O processo de restauração muscular foi comprometido.';
      }
    }

    return {
      athleteName: athlete.name,
      position: athlete.position,
      overall: athlete.overall,
      acwr,
      history,
      analysis: {
        acwrStatusText,
        acwrColor,
        acwrAdvice,
        acwrSeverity,
        wellnessAlert
      }
    };
  }
}
