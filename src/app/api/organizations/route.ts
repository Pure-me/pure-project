import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';
import { supabaseAdmin } from '@/lib/supabase';

export async function GET() {
  const user = await getSession();
  if (!user) return NextResponse.json({ error: 'Niet ingelogd' }, { status: 401 });

  const { data, error } = await supabaseAdmin
    .from('organization_members')
    .select('role, organizations(id, name, slug, plan, subscription_status, owner_id)')
    .eq('user_id', user.id);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  const orgs = (data || []).map((row: any) => ({
    ...row.organizations,
    myRole: row.role,
  }));

  return NextResponse.json(orgs);
}

export async function POST(req: NextRequest) {
  const user = await getSession();
  if (!user) return NextResponse.json({ error: 'Niet ingelogd' }, { status: 401 });

  const { name } = await req.json();
  if (!name?.trim()) return NextResponse.json({ error: 'Naam vereist' }, { status: 400 });

  const slug = name.trim().toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');

  const { data: org, error } = await supabaseAdmin
    .from('organizations')
    .insert({ name: name.trim(), slug, owner_id: user.id, plan: 'extended', subscription_status: 'trialing' })
    .select()
    .single();

  if (error) {
    if (error.code === '23505') return NextResponse.json({ error: 'Naam al in gebruik' }, { status: 409 });
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  await supabaseAdmin.from('profiles').update({ current_organization_id: org.id }).eq('id', user.id);
  return NextResponse.json(org, { status: 201 });
}
