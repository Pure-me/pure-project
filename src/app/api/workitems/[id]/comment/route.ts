import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';
import { findUserById, addWorkItemComment } from '@/lib/db';

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const user = await getSession();
  if (!user) return NextResponse.json({ error: 'Niet geautoriseerd' }, { status: 401 });
  const { id } = await params;
  const { text, type } = await req.json();
  if (!text?.trim()) return NextResponse.json({ error: 'Commentaar is leeg' }, { status: 400 });
  const fullUser = await findUserById(user.id);
  const updated = await addWorkItemComment(id, user.id, fullUser?.name || user.name, text.trim(), type);
  if (!updated) return NextResponse.json({ error: 'Item niet gevonden' }, { status: 404 });
  return NextResponse.json(updated);
}
