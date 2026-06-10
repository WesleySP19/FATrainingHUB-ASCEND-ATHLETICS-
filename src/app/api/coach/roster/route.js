import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// Lista todos os atletas do coach logado com cálculo de ACWR e PRs
export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const coachId = searchParams.get('coachId');
    
    const filter = coachId ? { coachId } : {};
    
    const athletes = await prisma.athlete.findMany({
      where: filter,
      orderBy: { name: 'asc' }
    });

    const athletesWithACWR = await Promise.all(athletes.map(async (athlete) => {
      // Busca treinos dos últimos 28 dias
      const dateLimit = new Date(Date.now() - 28 * 24 * 60 * 60 * 1000);
      const workouts = await prisma.workout.findMany({
        where: {
          athleteId: athlete.id,
          date: { gte: dateLimit }
        },
        include: { sets: true }
      });

      let acuteWorkload = 0;
      let chronicWorkloadSum = 0;
      
      const now = Date.now();
      const sevenDaysAgo = now - 7 * 24 * 60 * 60 * 1000;

      workouts.forEach(w => {
        // Calcula carga do treino: Soma de (Carga Real ou Alvo) * Repetições
        let workoutWorkload = 0;
        w.sets.forEach(s => {
          const load = s.actualLoad || s.targetLoad || 1.0;
          workoutWorkload += load * s.targetReps;
        });

        if (workoutWorkload === 0) workoutWorkload = 100.0; // Carga padrão de fallback

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
        acwr = 1.0; // Fallback se o atleta acabou de começar o ciclo esta semana
      }

      // Totaliza os recordes pessoais ativos
      const prsCount = await prisma.pRRecord.count({
        where: { athleteId: athlete.id }
      });

      return {
        ...athlete,
        acwr,
        prCount: prsCount
      };
    }));

    return NextResponse.json({ success: true, athletes: athletesWithACWR });
  } catch (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

// Cria/Cadastra um atleta manualmente pelo painel do Coach
export async function POST(request) {
  try {
    const data = await request.json();
    if (!data.name || !data.coachId || !data.position) {
      return NextResponse.json({ success: false, error: 'Dados obrigatórios ausentes.' }, { status: 400 });
    }
    
    if (data.email) {
      const existing = await prisma.athlete.findUnique({ where: { email: data.email } });
      if (existing) {
        return NextResponse.json({ success: false, error: 'Atleta com este e-mail já cadastrado.' }, { status: 400 });
      }
    }
    
    const athlete = await prisma.athlete.create({
      data: {
        name: data.name,
        email: data.email || null,
        password: data.password || '123456', // Senha padrão
        position: data.position,
        overall: data.overall ? parseInt(data.overall) : 70,
        coachId: data.coachId,
        height: data.height || "6'2\"",
        weight: data.weight || "220 lbs",
        wingspan: data.wingspan || "75\"",
        handSize: data.handSize || "9.5\"",
        forceAttr: data.forceAttr ? parseInt(data.forceAttr) : 70,
        skillAttr: data.skillAttr ? parseInt(data.skillAttr) : 70,
        evolutionAttr: data.evolutionAttr ? parseInt(data.evolutionAttr) : 70,
        speedAttr: data.speedAttr ? parseInt(data.speedAttr) : 70,
        powerAttr: data.powerAttr ? parseInt(data.powerAttr) : 70
      }
    });
    
    return NextResponse.json({ success: true, athlete });
  } catch (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

// Atualiza o OVR, define o MVP ou edita o cadastro do atleta
export async function PUT(request) {
  try {
    const data = await request.json();
    
    if (data.action === 'setMVP') {
      const currentAthlete = await prisma.athlete.findUnique({ where: { id: data.id } });
      if (!currentAthlete) {
        return NextResponse.json({ success: false, error: 'Atleta não encontrado.' }, { status: 404 });
      }
      
      // Reseta todos do mesmo time
      await prisma.athlete.updateMany({
        where: { coachId: currentAthlete.coachId },
        data: { isMVP: false }
      });
      
      // Define o novo MVP
      const athlete = await prisma.athlete.update({
        where: { id: data.id },
        data: { isMVP: true }
      });
      
      return NextResponse.json({ success: true, athlete });
    }
    
    if (data.action === 'editAthlete') {
      const athlete = await prisma.athlete.update({
        where: { id: data.id },
        data: {
          name: data.name,
          position: data.position,
          overall: parseInt(data.overall) || 70,
          profilePhoto: data.profilePhoto || null,
          email: data.email || null,
          height: data.height || "6'2\"",
          weight: data.weight || "220 lbs",
          wingspan: data.wingspan || "75\"",
          handSize: data.handSize || "9.5\"",
          forceAttr: data.forceAttr ? parseInt(data.forceAttr) : 70,
          skillAttr: data.skillAttr ? parseInt(data.skillAttr) : 70,
          evolutionAttr: data.evolutionAttr ? parseInt(data.evolutionAttr) : 70,
          speedAttr: data.speedAttr ? parseInt(data.speedAttr) : 70,
          powerAttr: data.powerAttr ? parseInt(data.powerAttr) : 70
        }
      });
      return NextResponse.json({ success: true, athlete });
    }
    
    // Atualização padrão de Overall
    const athlete = await prisma.athlete.update({
      where: { id: data.id },
      data: { overall: parseInt(data.overall) || 70 }
    });
    return NextResponse.json({ success: true, athlete });
  } catch (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
