'use client';

import { useState, useEffect } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { useI18n, LanguageToggle } from '@/lib/i18n';

interface User {
  id: string;
  name: string;
  email: string;
  role: string;
}

export default function Sidebar({ user }: { user: User }) {
  const pathname = usePathname();
  const router = useRouter();
  const { t } = useI18n();
  const [mobileOpen, setMobileOpen] = useState(false);

  // Close sidebar on route change (mobile)
  useEffect(() => {
    setMobileOpen(false);
  }, [pathname]);

  const navItems = [
    { href: '/dashboard', label: t.nav.dashboard, icon: '⬡' },
    { href: '/dashboard/projects', label: t.nav.projects, icon: '📋' },
    { href: '/dashboard/tasks', label: t.nav.tasks, icon: '✅' },
    { href: '/dashboard/quality', label: t.nav.quality, icon: '🔍' },
    { href: '/dashboard/capa', label: t.nav.capa, icon: '🔁' },
    { href: '/dashboard/bcm', label: t.nav.bcm, icon: '🛡️' },
    { href: '/dashboard/setup', label: t.nav.settings, icon: '⚙️' },
  ];

  const handleLogout = async () => {
    await fetch('/api/auth/logout', { method: 'POST' });
    router.push('/login');
    router.refresh();
  };

  return (
    <>
      {/* Mobile hamburger button */}
      <button
        className="hamburger-btn"
        onClick={() => setMobileOpen(o => !o)}
        aria-label="Toggle menu"
      >
        {mobileOpen ? '✕' : '☰'}
      </button>

      {/* Overlay (mobile) */}
      <div
        className={`sidebar-overlay${mobileOpen ? ' visible' : ''}`}
        onClick={() => setMobileOpen(false)}
      />

      <aside
        className={`sidebar-aside${mobileOpen ? ' open' : ''}`}
        style={{
          position: 'fixed',
          left: 0, top: 0, bottom: 0,
          width: '260px',
          background: 'rgba(10,15,30,0.98)',
          borderRight: '1px solid rgba(255,255,255,0.07)',
          display: 'flex',
          flexDirection: 'column',
          padding: '24px 16px',
          zIndex: 100,
          backdropFilter: 'blur(20px)',
        }}
      >
        {/* Logo */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '32px', padding: '0 8px' }}>
          <div style={{
            width: '40px', height: '40px',
            background: 'linear-gradient(135deg, #3b82f6, #8b5cf6)',
            borderRadius: '12px',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: '20px',
            boxShadow: '0 0 20px rgba(59,130,246,0.3)',
          }}>⬡</div>
          <div>
            <div style={{ fontWeight: '800', fontSize: '16px', color: '#f1f5f9', lineHeight: 1.2 }}>Pure Project</div>
            <div style={{ fontSize: '11px', color: '#475569' }}>pureexcellence.be</div>
          </div>
        </div>

        {/* Nav */}
        <nav style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '4px' }}>
          {navItems.map(item => {
            const isActive = item.href === '/dashboard'
              ? pathname === '/dashboard'
              : pathname.startsWith(item.href);
            return (
              <a
                key={item.href}
                href={item.href}
                className={`sidebar-item${isActive ? ' active' : ''}`}
              >
                <span style={{ fontSize: '18px', width: '24px', textAlign: 'center' }}>{item.icon}</span>
                {item.label}
              </a>
            );
          })}
        </nav>

        {/* Language + User */}
        <div style={{
          borderTop: '1px solid rgba(255,255,255,0.07)',
          paddingTop: '16px',
          marginTop: '16px',
        }}>
          {/* Language toggle */}
          <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '12px' }}>
            <LanguageToggle />
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '8px', marginBottom: '8px' }}>
            <div style={{
              width: '36px', height: '36px',
              background: 'linear-gradient(135deg, #3b82f6, #8b5cf6)',
              borderRadius: '10px',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: '14px', fontWeight: '700', color: 'white',
              flexShrink: 0,
            }}>
              {user.name.charAt(0).toUpperCase()}
            </div>
            <div style={{ minWidth: 0 }}>
              <div style={{ fontSize: '13px', fontWeight: '600', color: '#e2e8f0', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                {user.name}
              </div>
              <div style={{ fontSize: '11px', color: '#475569' }}>{user.role}</div>
            </div>
          </div>
          <button
            onClick={handleLogout}
            style={{
              width: '100%', padding: '8px', borderRadius: '8px',
              background: 'rgba(244,63,94,0.1)', border: '1px solid rgba(244,63,94,0.2)',
              color: '#f87171', fontSize: '13px', cursor: 'pointer',
              transition: 'all 0.15s',
            }}
            onMouseEnter={e => (e.currentTarget.style.background = 'rgba(244,63,94,0.2)')}
            onMouseLeave={e => (e.currentTarget.style.background = 'rgba(244,63,94,0.1)')}
          >
            {t.nav.logout}
          </button>
        </div>
      </aside>
    </>
  );
}
