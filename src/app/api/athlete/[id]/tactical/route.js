import { NextResponse } from 'next/server';
import { AthleteDataService } from '@/lib/domain/AthleteDataService';

export async function GET(request, { params }) {
  try {
    const resolvedParams = await params;
    const id = resolvedParams.id;

    const dataService = new AthleteDataService();
    const stats = await dataService.getAthleteTacticalData(id);

    if (!stats) {
      return NextResponse.json({ success: false, error: 'Atleta não encontrado ou sem métricas.' }, { status: 404 });
    }

    return NextResponse.json({ success: true, stats });
  } catch (error) {
    console.error("Erro na rota tática do atleta:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
