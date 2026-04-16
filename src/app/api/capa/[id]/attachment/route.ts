import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';
import { addCAPAAttachment, Attachment } from '@/lib/db';

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const user = await getSession();
  if (!user) return NextResponse.json({ error: 'Niet geautoriseerd' }, { status: 401 });
  const { id } = await params;
  const body = await req.json() as Omit<Attachment, 'id' | 'createdAt'>;
  const att = await addCAPAAttachment(id, body);
  if (!att) return NextResponse.json({ error: 'CAPA niet gevonden' }, { status: 404 });
  return NextResponse.json(att, { status: 201 });
}
