import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';
import { supabaseAdmin } from '@/lib/supabase';

export async function GET() {
  const user = await getSession();
  if (!user) return NextResponse.json({ error: 'Niet ingelogd' }, { status: 401 });

  const { data, error } = await supabaseAdmin
    .from('profiles')
    .select('id, name, email, role, avatar_url, language, plan, subscription_status, trial_ends_at, created_at')
    .eq('id', user.id)
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data);
}

export async function PATCH(req: NextRequest) {
  const user = await getSession();
  if (!user) return NextResponse.json({ error: 'Niet ingelogd' }, { status: 401 });

  const { name, language } = await req.json();
  const updates: Record<string, unknown> = {};
  if (name?.trim()) updates.name = name.trim();
  if (language === 'nl' || language === 'en') updates.language = language;

  if (Object.keys(updates).length === 0)
    return NextResponse.json({ error: 'Geen velden om bij te werken' }, { status: 400 });

  const { data, error } = await supabaseAdmin
    .from('profiles').update(updates).eq('id', user.id).select().single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data);
}
