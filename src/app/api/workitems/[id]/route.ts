import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';
import { getWorkItemById, updateWorkItem, deleteWorkItem } from '@/lib/db';

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const user = await getSession();
  if (!user) return NextResponse.json({ error: 'Niet geautoriseerd' }, { status: 401 });
  const { id } = await params;
  const item = await getWorkItemById(id);
  if (!item) return NextResponse.json({ error: 'Niet gevonden' }, { status: 404 });
  return NextResponse.json(item);
}

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const user = await getSession();
  if (!user) return NextResponse.json({ error: 'Niet geautoriseerd' }, { status: 401 });
  const { id } = await params;
  const body = await req.json();
  if (body.status === 'done' && !body.completedAt) body.completedAt = new Date().toISOString();
  const updated = await updateWorkItem(id, body);
  if (!updated) return NextResponse.json({ error: 'Niet gevonden' }, { status: 404 });
  return NextResponse.json(updated);
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const user = await getSession();
  if (!user) return NextResponse.json({ error: 'Niet geautoriseerd' }, { status: 401 });
  const { id } = await params;
  const ok = await deleteWorkItem(id);
  if (!ok) return NextResponse.json({ error: 'Niet gevonden' }, { status: 404 });
  return NextResponse.json({ success: true });
}
