import { NextResponse } from 'next/server';
import { AthleteDataService } from '@/lib/infrastructure/AthleteDataService';

export async function GET(request, { params }) {
  try {
    const resolvedParams = await params;
    const id = resolvedParams.id;

    const dataService = new AthleteDataService();
    const physioData = await dataService.getAthletePhysioData(id);

    if (!physioData) {
      return NextResponse.json({ success: false, error: 'Atleta não encontrado ou sem métricas fisiológicas.' }, { status: 404 });
    }

    return NextResponse.json({ success: true, physioData });
  } catch (error) {
    console.error("Erro na rota fisiológica do atleta:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
