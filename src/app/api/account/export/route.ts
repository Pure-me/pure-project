import { NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';
import { supabaseAdmin } from '@/lib/supabase';

export async function GET() {
  const user = await getSession();
  if (!user) return NextResponse.json({ error: 'Niet ingelogd' }, { status: 401 });

  const [profile, projects, workItems, quality, bcm, capas] = await Promise.all([
    supabaseAdmin.from('profiles').select('*').eq('id', user.id).single(),
    supabaseAdmin.from('projects').select('*').eq('owner_id', user.id),
    supabaseAdmin.from('work_items').select('*').eq('assignee_id', user.id),
    supabaseAdmin.from('quality_items').select('*').eq('owner_id', user.id),
    supabaseAdmin.from('bcm_items').select('*').eq('owner_id', user.id),
    supabaseAdmin.from('capas').select('*').eq('initiated_by', user.id),
  ]);

  const exportData = {
    exportDate: new Date().toISOString(),
    profile: profile.data,
    projects: projects.data || [],
    workItems: workItems.data || [],
    qualityItems: quality.data || [],
    bcmItems: bcm.data || [],
    capas: capas.data || [],
  };

  return new Response(JSON.stringify(exportData, null, 2), {
    headers: {
      'Content-Type': 'application/json',
      'Content-Disposition': `attachment; filename="pure-project-export-${new Date().toISOString().split('T')[0]}.json"`,
    },
  });
}
