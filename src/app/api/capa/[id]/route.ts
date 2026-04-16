import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';
import { getCAPAById, updateCAPA } from '@/lib/db';

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const user = await getSession();
  if (!user) return NextResponse.json({ error: 'Niet geautoriseerd' }, { status: 401 });
  const { id } = await params;
  const capa = await getCAPAById(id);
  if (!capa) return NextResponse.json({ error: 'CAPA niet gevonden' }, { status: 404 });
  return NextResponse.json(capa);
}

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const user = await getSession();
  if (!user) return NextResponse.json({ error: 'Niet geautoriseerd' }, { status: 401 });
  const { id } = await params;
  const body = await req.json();
  const updated = await updateCAPA(id, body);
  if (!updated) return NextResponse.json({ error: 'CAPA niet gevonden' }, { status: 404 });
  return NextResponse.json(updated);
}
