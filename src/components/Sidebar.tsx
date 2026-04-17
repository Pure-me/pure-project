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

interface SidebarProps {
  user: User;
  plan?: string;
}

export default function Sidebar({ user, plan = 'solo' }: SidebarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const { t, locale } = useI18n();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [subscriptionStatus, setSubscriptionStatus] = useState<string | null>(null);

  const isExtended = plan === 'extended_monthly' || plan === 'extended_yearly' || plan === 'extended';

  // Close sidebar on route change (mobile)
  useEffect(() => {
    setMobileOpen(false);
  }, [pathname]);

  // Fetch subscription status for warning indicator
  useEffect(() => {
    fetch('/api/account/billing-info')
      .then(r => r.json())
      .then(d => setSubscriptionStatus(d.subscription_status))
      .catch(() => null);
  }, []);

  const needsAttention = subscriptionStatus === 'past_due' || subscriptionStatus === 'blocked' || subscriptionStatus === 'canceled';

  const navItems = [
    { href: '/dashboard', label: t.nav.dashboard, icon: '\u2b21' },
    { href: '/dashboard/projects', label: t.nav.projects, icon: '\U0001f4cb' },
    { href: '/dashboard/tasks', label: t.nav.tasks, icon: '\u2705' },
    { href: '/dashboard/quality', label: t.nav.quality, icon: '\U0001f50d' },
    { href: '/dashboard/capa', label: t.nav.capa, icon: '\U0001f501' },
    { href: '/dashboard/bcm', label: t.nav.bcm, icon: '\U0001f6e1\ufe0f' },
    ...(isExtended ? [{ href: '/dashboard/team', label: locale === 'nl' ? 'Team' : 'Team', icon: '\U0001f465' }] : []),
    { href: '/dashboard/setup', label: t.nav.settings, icon: '\u2699\ufe0f' },
  ];

  const bottomItems = [
    {
      href: '/dashboard/billing',
      label: locale === 'nl' ? 'Abonnement' : 'Subscription',
      icon: '\U0001f4b3',
      badge: needsAttention ? '!' : null,
    },
    {
      href: '/dashboard/account',
      label: locale === 'nl' ? 'Mijn account' : 'My account',
      icon: '\U0001f464',
      badge: null,
    },
  ];

  const handleLogout = async () => {
    await fetch('/api/auth/logout', { method: 'POST' });
    router.push('/login');
    router.refresh();
  };

  const NavItem = ({ href, label, icon, badge }: { href: string; label: string; icon: string; badge?: string | null }) => {
    const isActive = href === '/dashboard'
      ? pathname === '/dashboard'
      : pathname.startsWith(href);
    return (
      <a
        href={href}
        className={`sidebar-item${isActive ? ' active' : ''}`}
        style={{ position: 'relative' }}
      >
        <span style={{ fontSize: '18px', width: '24px', textAlign: 'center' }}>{icon}</span>
        {label}
        {badge && (
          <span style={{
            marginLeft: 'auto',
            background: '#f87171',
            color: 'white',
            fontSize: '10px',
            fontWeight: '700',
            width: '16px',
            height: '16px',
            borderRadius: '50%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}>{badge}</span>
        )}
      </a>
    );
  };

  return (
    <>
      {/* Mobile hamburger button */}
      <button
        className="hamburger-btn"
        onClick={() => setMobileOpen(o => !o)}
        aria-label="Toggle menu"
      >
        {mobileOpen ? '\u2715' : '\u2630'}
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
          }}>\u2b21</div>
          <div>
            <div style={{ fontWeight: '800', fontSize: '16px', color: '#f1f5f9', lineHeight: 1.2 }}>Pure Project</div>
            {isExtended ? (
              <div style={{ fontSize: '10px', fontWeight: '700', color: '#a78bfa', letterSpacing: '0.05em', textTransform: 'uppercase' }}>
                \u2736 Extended Plan
              </div>
            ) : (
              <div style={{ fontSize: '11px', color: '#475569' }}>pureexcellence.be</div>
            )}
          </div>
        </div>

        {/* Main Nav */}
        <nav style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '4px' }}>
          {navItems.map(item => (
            <NavItem key={item.href} {...item} />
          ))}
        </nav>

        {/* Bottom section */}
        <div style={{
          borderTop: '1px solid rgba(255,255,255,0.07)',
          paddingTop: '12px',
          marginTop: '16px',
          display: 'flex',
          flexDirection: 'column',
          gap: '4px',
        }}>
          {/* Billing & Account links */}
          {bottomItems.map(item => (
            <NavItem key={item.href} {...item} />
          ))}

          {/* Language toggle */}
          <div style={{ display: 'flex', justifyContent: 'center', marginTop: '8px', marginBottom: '8px' }}>
            <LanguageToggle />
          </div>

          {/* User info */}
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
