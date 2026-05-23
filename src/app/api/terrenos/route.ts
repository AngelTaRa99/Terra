import { NextRequest, NextResponse } from 'next/server';
import { getProyectos, updateTerrenoEstado, getDb } from '@/lib/db';

export async function GET() {
  const proyectos = getProyectos();
  return NextResponse.json(proyectos);
}

export async function PATCH(request: NextRequest) {
  const body = await request.json();
  const { id_terreno, proyecto_id, estado } = body;

  if (!id_terreno || !proyecto_id || !estado) {
    return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
  }

  const valid = ['libre', 'en_visita', 'apartado', 'vendido'];
  if (!valid.includes(estado)) {
    return NextResponse.json({ error: 'Invalid estado' }, { status: 400 });
  }

  updateTerrenoEstado(id_terreno, proyecto_id, estado);
  return NextResponse.json({ success: true });
}
