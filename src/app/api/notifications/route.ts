import { NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';
import { getNotificationsForUser } from '@/lib/db';

export async function GET() {
  const user = await getSession();
  if (!user) return NextResponse.json({ error: 'Niet geautoriseerd' }, { status: 401 });
  return NextResponse.json(await getNotificationsForUser(user.id));
}
