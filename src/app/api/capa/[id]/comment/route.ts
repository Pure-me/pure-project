import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';
import { findUserById, addCAPAComment } from '@/lib/db';

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const user = await getSession();
  if (!user) return NextResponse.json({ error: 'Niet geautoriseerd' }, { status: 401 });
  const { id } = await params;
  const { text, type } = await req.json();
  if (!text?.trim()) return NextResponse.json({ error: 'Tekst verplicht' }, { status: 400 });
  const fullUser = await findUserById(user.id);
  const comment = await addCAPAComment(id, user.id, fullUser?.name || user.name, text.trim(), type || 'comment');
  if (!comment) return NextResponse.json({ error: 'CAPA niet gevonden' }, { status: 404 });
  return NextResponse.json(comment, { status: 201 });
}
