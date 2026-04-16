import { redirect } from 'next/navigation';
import { getSession } from '@/lib/auth';
import Sidebar from '@/components/Sidebar';

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const user = await getSession();
  if (!user) redirect('/login');

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: '#0a0f1e' }}>
      <Sidebar user={{ id: user.id, name: user.name, email: user.email, role: user.role }} />
      <main className="main-content" style={{ flex: 1, marginLeft: '260px', padding: '32px', maxWidth: 'calc(100vw - 260px)', overflowX: 'hidden' }}>
        {children}
      </main>
    </div>
  );
}
