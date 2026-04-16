import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';
import { getAllWorkItems, getWorkItemsByProject, createWorkItem } from '@/lib/db';

export async function GET(req: NextRequest) {
  const user = await getSession();
  if (!user) return NextResponse.json({ error: 'Niet geautoriseerd' }, { status: 401 });
  const { searchParams } = new URL(req.url);
  const projectId = searchParams.get('projectId');
  const items = projectId ? await getWorkItemsByProject(projectId) : await getAllWorkItems();
  return NextResponse.json(items);
}

export async function POST(req: NextRequest) {
  const user = await getSession();
  if (!user) return NextResponse.json({ error: 'Niet geautoriseerd' }, { status: 401 });
  const body = await req.json();
  const item = await createWorkItem({
    type: body.type || 'task',
    title: body.title,
    description: body.description || '',
    status: body.status || 'todo',
    priority: body.priority || 'medium',
    projectId: body.projectId,
    parentType: body.parentType,
    parentId: body.parentId,
    linkedToType: body.linkedToType,
    linkedToId: body.linkedToId,
    categoryId: body.categoryId,
    assigneeId: body.assigneeId || user.id,
    dueDate: body.dueDate || '',
    tags: body.tags || [],
  });
  return NextResponse.json(item, { status: 201 });
}
