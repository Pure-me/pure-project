import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';
import { getAllCategories, createCategory } from '@/lib/db';

export async function GET() {
  const user = await getSession();
  if (!user) return NextResponse.json({ error: 'Niet geautoriseerd' }, { status: 401 });
  return NextResponse.json(await getAllCategories());
}

export async function POST(req: NextRequest) {
  const user = await getSession();
  if (!user) return NextResponse.json({ error: 'Niet geautoriseerd' }, { status: 401 });
  const body = await req.json();
  const cat = await createCategory({
    name: body.name,
    type: body.type || 'other',
    color: body.color || '#3b82f6',
    description: body.description,
  });
  return NextResponse.json(cat, { status: 201 });
}
