import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';
import { getAllBCMItems, createBCMItem } from '@/lib/db';

export async function GET() {
  const user = await getSession();
  if (!user) return NextResponse.json({ error: 'Niet geautoriseerd' }, { status: 401 });
  return NextResponse.json(await getAllBCMItems());
}

export async function POST(req: NextRequest) {
  const user = await getSession();
  if (!user) return NextResponse.json({ error: 'Niet geautoriseerd' }, { status: 401 });
  const body = await req.json();
  const item = await createBCMItem({
    title: body.title,
    type: body.type || 'risk',
    status: 'identified',
    priority: body.priority || 'medium',
    description: body.description || '',
    ownerId: user.id,
    reviewDate: body.reviewDate || '',
    tags: [],
  });
  return NextResponse.json(item, { status: 201 });
}
