import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';
import { addQualityAttachment, deleteAttachment, Attachment } from '@/lib/db';

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const user = await getSession();
  if (!user) return NextResponse.json({ error: 'Niet geautoriseerd' }, { status: 401 });

  const body = await req.json() as Omit<Attachment, 'id' | 'createdAt'>;
  const att = await addQualityAttachment((await params).id, body);
  if (!att) return NextResponse.json({ error: 'Item niet gevonden' }, { status: 404 });
  return NextResponse.json(att, { status: 201 });
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const user = await getSession();
  if (!user) return NextResponse.json({ error: 'Niet geautoriseerd' }, { status: 401 });

  const { attachmentId } = await req.json();
  const ok = await deleteAttachment(attachmentId);
  if (!ok) return NextResponse.json({ error: 'Bijlage niet gevonden' }, { status: 404 });
  return NextResponse.json({ success: true });
}
