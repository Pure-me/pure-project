import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';
import { updateWorkItem, deleteWorkItem } from '@/lib/db';

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const user = await getSession();
  if (!user) return NextResponse.json({ error: 'Niet geautoriseerd' }, { status: 401 });
  const { id } = await params;
  const body = await req.json();
  const updated = await updateWorkItem(id, body);
  if (!updated) return NextResponse.json({ error: 'Taak niet gevonden' }, { status: 404 });
  return NextResponse.json(updated);
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const user = await getSession();
  if (!user) return NextResponse.json({ error: 'Niet geautoriseerd' }, { status: 401 });
  const { id } = await params;
  const ok = await deleteWorkItem(id);
  if (!ok) return NextResponse.json({ error: 'Taak niet gevonden' }, { status: 404 });
  return NextResponse.json({ success: true });
}
