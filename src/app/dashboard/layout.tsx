import { redirect } from 'next/navigation';
import { getSession } from '@/lib/auth';
import { supabaseAdmin } from '@/lib/supabase';
import Sidebar from '@/components/Sidebar';

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const user = await getSession();
  if (!user) redirect('/login');

  const { data: profile } = await supabaseAdmin
    .from('profiles')
    .select('plan, subscription_status, trial_ends_at')
    .eq('id', user.id)
    .single();

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: '#0a0f1e' }}>
      <Sidebar user={{
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        plan: profile?.plan || 'solo',
      }} />
      <main className="dashboard-main">
        {children}
      </main>
    </div>
  );
}
