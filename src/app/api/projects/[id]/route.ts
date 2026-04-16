import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';
import { getProjectById, updateProject, deleteProject } from '@/lib/db';

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const user = await getSession();
  if (!user) return NextResponse.json({ error: 'Niet geautoriseerd' }, { status: 401 });
  const { id } = await params;
  const project = await getProjectById(id);
  if (!project) return NextResponse.json({ error: 'Project niet gevonden' }, { status: 404 });
  return NextResponse.json(project);
}

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const user = await getSession();
  if (!user) return NextResponse.json({ error: 'Niet geautoriseerd' }, { status: 401 });
  const { id } = await params;
  const body = await req.json();
  const updated = await updateProject(id, body);
  if (!updated) return NextResponse.json({ error: 'Project niet gevonden' }, { status: 404 });
  return NextResponse.json(updated);
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const user = await getSession();
  if (!user) return NextResponse.json({ error: 'Niet geautoriseerd' }, { status: 401 });
  const { id } = await params;
  const ok = await deleteProject(id);
  if (!ok) return NextResponse.json({ error: 'Project niet gevonden' }, { status: 404 });
  return NextResponse.json({ success: true });
}
