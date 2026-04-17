import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';
import { supabaseAdmin } from '@/lib/supabase';

export async function POST(req: NextRequest) {
  const user = await getSession();
  if (!user) return NextResponse.json({ error: 'Niet ingelogd' }, { status: 401 });

  const { token } = await req.json();
  if (!token) return NextResponse.json({ error: 'Token vereist' }, { status: 400 });

  const { data: invite, error: invErr } = await supabaseAdmin
    .from('organization_invitations').select('*').eq('token', token).single();

  if (invErr || !invite) return NextResponse.json({ error: 'Ongeldig of verlopen token' }, { status: 404 });
  if (invite.accepted_at) return NextResponse.json({ error: 'Uitnodiging al geaccepteerd' }, { status: 409 });
  if (new Date(invite.expires_at) < new Date())
    return NextResponse.json({ error: 'Uitnodiging is verlopen' }, { status: 410 });

  const { data: authUser } = await supabaseAdmin.auth.admin.getUserById(user.id);
  const userEmail = authUser?.user?.email?.toLowerCase();
  if (userEmail && invite.email && userEmail !== invite.email.toLowerCase()) {
    return NextResponse.json(
      { error: \`Deze uitnodiging is voor \${invite.email}. Log in met dat e-mailadres.\` },
      { status: 403 }
    );
  }

  const { data: existing } = await supabaseAdmin.from('organization_members').select('user_id')
    .eq('organization_id', invite.organization_id).eq('user_id', user.id).single();

  if (existing) {
    await supabaseAdmin.from('profiles').update({ current_organization_id: invite.organization_id }).eq('id', user.id);
    return NextResponse.json({ success: true, alreadyMember: true });
  }

  const { error: memberErr } = await supabaseAdmin.from('organization_members')
    .insert({ organization_id: invite.organization_id, user_id: user.id, role: invite.role, invited_by: invite.invited_by });

  if (memberErr) return NextResponse.json({ error: memberErr.message }, { status: 500 });

  await supabaseAdmin.from('organization_invitations')
    .update({ accepted_at: new Date().toISOString() }).eq('id', invite.id);

  await supabaseAdmin.from('profiles')
    .update({ current_organization_id: invite.organization_id }).eq('id', user.id);

  return NextResponse.json({ success: true, organizationId: invite.organization_id });
}
