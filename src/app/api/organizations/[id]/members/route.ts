import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';
import { supabaseAdmin } from '@/lib/supabase';

type Params = { params: { id: string } };

async function checkAccess(userId: string, orgId: string) {
  const { data } = await supabaseAdmin
    .from('organization_members')
    .select('role')
    .eq('organization_id', orgId)
    .eq('user_id', userId)
    .single();
  return data?.role as string | undefined;
}

export async function GET(_req: NextRequest, { params }: Params) {
  const user = await getSession();
  if (!user) return NextResponse.json({ error: 'Niet ingelogd' }, { status: 401 });

  const role = await checkAccess(user.id, params.id);
  if (!role) return NextResponse.json({ error: 'Geen toegang' }, { status: 403 });

  const { data, error } = await supabaseAdmin
    .from('organization_members')
    .select('user_id, role, invited_by, created_at, profiles(full_name, avatar_url)')
    .eq('organization_id', params.id);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  const { data: authUsers } = await supabaseAdmin.auth.admin.listUsers();
  const emailMap: Record<string, string> = {};
  (authUsers?.users || []).forEach((u: any) => { emailMap[u.id] = u.email; });

  const members = (data || []).map((m: any) => ({
    userId: m.user_id, role: m.role, invitedBy: m.invited_by, createdAt: m.created_at,
    fullName: m.profiles?.full_name || null, avatarUrl: m.profiles?.avatar_url || null,
    email: emailMap[m.user_id] || null,
  }));

  return NextResponse.json(members);
}

export async function PATCH(req: NextRequest, { params }: Params) {
  const user = await getSession();
  if (!user) return NextResponse.json({ error: 'Niet ingelogd' }, { status: 401 });

  const myRole = await checkAccess(user.id, params.id);
  if (!myRole || !['owner', 'admin'].includes(myRole))
    return NextResponse.json({ error: 'Geen rechten' }, { status: 403 });

  const { userId, role } = await req.json();
  if (!['admin', 'member'].includes(role)) return NextResponse.json({ error: 'Ongeldig role' }, { status: 400 });

  const { data: target } = await supabaseAdmin.from('organization_members').select('role')
    .eq('organization_id', params.id).eq('user_id', userId).single();
  if (target?.role === 'owner') return NextResponse.json({ error: 'Eigenaar kan niet gewijzigd worden' }, { status: 400 });

  await supabaseAdmin.from('organization_members').update({ role })
    .eq('organization_id', params.id).eq('user_id', userId);
  return NextResponse.json({ success: true });
}

export async function DELETE(req: NextRequest, { params }: Params) {
  const user = await getSession();
  if (!user) return NextResponse.json({ error: 'Niet ingelogd' }, { status: 401 });

  const myRole = await checkAccess(user.id, params.id);
  if (!myRole) return NextResponse.json({ error: 'Geen toegang' }, { status: 403 });

  const { searchParams } = new URL(req.url);
  const targetUserId = searchParams.get('userId') || user.id;

  if (targetUserId !== user.id && !['owner', 'admin'].includes(myRole))
    return NextResponse.json({ error: 'Geen rechten' }, { status: 403 });

  const { data: target } = await supabaseAdmin.from('organization_members').select('role')
    .eq('organization_id', params.id).eq('user_id', targetUserId).single();
  if (target?.role === 'owner') return NextResponse.json({ error: 'Eigenaar kan niet verwijderd worden' }, { status: 400 });

  await supabaseAdmin.from('organization_members').delete()
    .eq('organization_id', params.id).eq('user_id', targetUserId);
  return NextResponse.json({ success: true });
}
