import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';
import { getAllQualityItems, createQualityItem } from '@/lib/db';

export async function GET(req: NextRequest) {
  const user = await getSession();
  if (!user) return NextResponse.json({ error: 'Niet geautoriseerd' }, { status: 401 });
  return NextResponse.json(await getAllQualityItems());
}

export async function POST(req: NextRequest) {
  const user = await getSession();
  if (!user) return NextResponse.json({ error: 'Niet geautoriseerd' }, { status: 401 });
  const body = await req.json();
  const item = await createQualityItem({
    projectId: body.projectId,
    title: body.title,
    type: body.type || 'non_conformity',
    status: 'open',
    priority: body.priority || (body.severity === 'critical' ? 'critical' : body.severity === 'major' ? 'high' : 'medium'),
    description: body.description || '',
    ownerId: body.ownerId || user.id,
    dueDate: body.dueDate || '',
    tags: [],
  });
  return NextResponse.json(item, { status: 201 });
}
