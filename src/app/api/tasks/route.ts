import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';
import { getWorkItemsByProject, createWorkItem } from '@/lib/db';

export async function GET(req: NextRequest) {
  const user = await getSession();
  if (!user) return NextResponse.json({ error: 'Niet geautoriseerd' }, { status: 401 });
  const { searchParams } = new URL(req.url);
  const projectId = searchParams.get('projectId');
  if (!projectId) return NextResponse.json({ error: 'projectId is verplicht' }, { status: 400 });
  const tasks = await getWorkItemsByProject(projectId);
  return NextResponse.json(tasks);
}

export async function POST(req: NextRequest) {
  const user = await getSession();
  if (!user) return NextResponse.json({ error: 'Niet geautoriseerd' }, { status: 401 });
  try {
    const body = await req.json();
    const task = await createWorkItem({
      projectId: body.projectId,
      title: body.title,
      description: body.description || '',
      type: body.type || 'task',
      status: body.status || 'todo',
      priority: body.priority || 'medium',
      assigneeId: body.assigneeId || user.id,
      dueDate: body.dueDate || '',
      tags: body.tags || [],
    });
    return NextResponse.json(task, { status: 201 });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: 'Fout bij aanmaken taak' }, { status: 500 });
  }
}
