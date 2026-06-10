import { NextResponse } from 'next/server';
import { AthleteDataService } from '@/lib/domain/AthleteDataService';

const service = new AthleteDataService();

export async function GET(request, { params }) {
  try {
    const resolvedParams = await params;
    const id = resolvedParams.id;
    
    const result = await service.getAthleteFullProfile(id);
    if (!result) {
      return NextResponse.json({ success: false, error: 'Atleta não encontrado.' }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      ...result
    });
  } catch (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function PUT(request, { params }) {
  try {
    const resolvedParams = await params;
    const id = resolvedParams.id;
    const data = await request.json();

    // Se a requisição for para adicionar um recorde pessoal (PR)
    if (data.action === 'addPR') {
      const athlete = await service.addAthletePR(id, data);
      return NextResponse.json({ success: true, athlete });
    }

    // Atualização padrão de personalização
    const athlete = await service.updateAthleteCustomization(id, data);
    return NextResponse.json({ success: true, athlete });
  } catch (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
