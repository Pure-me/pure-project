import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';
import { supabaseAdmin } from '@/lib/supabase';

type Params = { params: { id: string } };

async function checkAccess(userId: string, orgId: string) {
  const { data } = await supabaseAdmin
    .from('organization_members').select('role')
    .eq('organization_id', orgId).eq('user_id', userId).single();
  return data?.role as string | undefined;
}

export async function POST(req: NextRequest, { params }: Params) {
  const user = await getSession();
  if (!user) return NextResponse.json({ error: 'Niet ingelogd' }, { status: 401 });

  const myRole = await checkAccess(user.id, params.id);
  if (!myRole || !['owner', 'admin'].includes(myRole))
    return NextResponse.json({ error: 'Geen rechten om uit te nodigen' }, { status: 403 });

  const { email, role = 'member' } = await req.json();
  if (!email?.trim()) return NextResponse.json({ error: 'E-mail vereist' }, { status: 400 });
  if (!['admin', 'member'].includes(role)) return NextResponse.json({ error: 'Ongeldig role' }, { status: 400 });

  const { data: authUsers } = await supabaseAdmin.auth.admin.listUsers();
  const existingUser = authUsers?.users?.find((u: any) => u.email?.toLowerCase() === email.toLowerCase());
  if (existingUser) {
    const { data: existing } = await supabaseAdmin.from('organization_members').select('user_id')
      .eq('organization_id', params.id).eq('user_id', existingUser.id).single();
    if (existing) return NextResponse.json({ error: 'Gebruiker is al lid' }, { status: 409 });
  }

  const { data: invite, error } = await supabaseAdmin
    .from('organization_invitations')
    .insert({ organization_id: params.id, email: email.toLowerCase().trim(), role, invited_by: user.id })
    .select().single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  const { data: org } = await supabaseAdmin.from('organizations').select('name').eq('id', params.id).single();
  const inviteUrl = `\${process.env.NEXT_PUBLIC_APP_URL}/invite/\${invite.token}`;

  await supabaseAdmin.auth.admin.inviteUserByEmail(email, {
    redirectTo: inviteUrl,
    data: { organization_id: params.id, organization_name: org?.name, invite_token: invite.token, role },
  });

  return NextResponse.json({ success: true, token: invite.token, inviteUrl }, { status: 201 });
}

export async function GET(_req: NextRequest, { params }: Params) {
  const user = await getSession();
  if (!user) return NextResponse.json({ error: 'Niet ingelogd' }, { status: 401 });

  const myRole = await checkAccess(user.id, params.id);
  if (!myRole || !['owner', 'admin'].includes(myRole))
    return NextResponse.json({ error: 'Geen toegang' }, { status: 403 });

  const { data, error } = await supabaseAdmin
    .from('organization_invitations')
    .select('id, email, role, token, created_at, expires_at')
    .eq('organization_id', params.id)
    .is('accepted_at', null)
    .gt('expires_at', new Date().toISOString())
    .order('created_at', { ascending: false });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  const appUrl = process.env.NEXT_PUBLIC_APP_URL;
  return NextResponse.json((data || []).map((inv: any) => ({
    ...inv,
    inviteUrl: `\${appUrl}/invite/\${inv.token}`,
  })));
}
