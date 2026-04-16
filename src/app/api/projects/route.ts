import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';
import { createProject, getAllProjects } from '@/lib/db';

export async function GET() {
  const user = await getSession();
  if (!user) return NextResponse.json({ error: 'Niet geautoriseerd' }, { status: 401 });
  const projects = await getAllProjects();
  return NextResponse.json(projects);
}

export async function POST(req: NextRequest) {
  const user = await getSession();
  if (!user) return NextResponse.json({ error: 'Niet geautoriseerd' }, { status: 401 });
  try {
    const body = await req.json();
    const project = await createProject({
      name: body.name,
      description: body.description || '',
      status: body.status || 'planning',
      priority: body.priority || 'medium',
      ownerId: user.id,
      teamMembers: body.teamMembers || [],
      startDate: body.startDate || new Date().toISOString().split('T')[0],
      endDate: body.endDate || '',
      progress: 0,
      tags: body.tags || [],
    });
    return NextResponse.json(project, { status: 201 });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: 'Fout bij aanmaken project' }, { status: 500 });
  }
}
