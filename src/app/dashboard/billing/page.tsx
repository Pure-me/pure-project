'use client';
import { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { useI18n } from '@/lib/i18n';
import Link from 'next/link';

interface BillingInfo {
  subscription_status: string; plan: string;
  trial_ends_at: string | null; current_period_end: string | null;
  stripe_customer_id: string | null;
}

export default function BillingPage() {
  const { locale } = useI18n();
  const searchParams = useSearchParams();
  const [billing, setBilling] = useState<BillingInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [checkoutLoading, setCheckoutLoading] = useState<string | null>(null);
  const [portalLoading, setPortalLoading] = useState(false);
  const nl = locale === 'nl';
  const ui = {
    title:       nl ? 'Abonnement & facturatie'   : 'Subscription & billing',
    currentPlan: nl ? 'Huidig plan'               : 'Current plan',
    choosePlan:  nl ? 'Kies je plan'              : 'Choose your plan',
    trialActive: nl ? 'Proefperiode actief'        : 'Trial active',
    trialExp:    nl ? 'Proefperiode verlopen'      : 'Trial expired',
    active:      nl ? 'Actief'                    : 'Active',
    pastDue:     nl ? 'Betaling mislukt'          : 'Payment failed',
    canceled:    nl ? 'Opgezegd'                  : 'Canceled',
    blocked:     nl ? 'Geblokkeerd'               : 'Blocked',
    trialEnds:   nl ? 'Proefperiode eindigt op'   : 'Trial ends on',
    renewsOn:    nl ? 'Verlenging op'             : 'Renews on',
    manage:      nl ? 'Abonnement beheren'        : 'Manage subscription',
    manageDesc:  nl ? 'Facturen, betaalmethode of opzeggen.' : 'Invoices, payment method or cancel.',
    portal:      nl ? 'Open facturatieportaal'    : 'Open billing portal',
    successMsg:  nl ? '\u2713 Betaling geslaagd!' : '\u2713 Payment successful!',
    expiredMsg:  nl ? 'Je abonnement is verlopen.' : 'Your subscription has expired.',
    pastDueMsg:  nl ? '\u26a0\ufe0f Betaling mislukt.' : '\u26a0\ufe0f Payment failed.',
    noCard:      nl ? 'Geen creditcard vereist voor proefperiode' : 'No credit card required for trial',
    save12:      nl ? 'Bespaar 12%'              : 'Save 12%',
    save17:      nl ? 'Bespaar 17%'              : 'Save 17%',
    perMonth:    nl ? '/maand'                   : '/month',
    perYear:     nl ? '/jaar'                    : '/year',
    trialLabel:  nl ? '14 dagen gratis'          : '14 days free',
    manageTeam:  nl ? 'Team beheren \u2192'      : 'Manage team \u2192',
    soloDesc:    nl ? 'Voor individuele gebruikers.' : 'For individual users.',
    extDesc:     nl ? 'Voor teams die samen willen werken aan projecten, kwaliteit en continuïteit.' : 'For teams collaborating on projects, quality and continuity.',
    extBadge:    nl ? 'Team samenwerking'        : 'Team collaboration',
    soloF: nl ? ['Alle modules (projecten, kwaliteit, BCM, CAPA)','Onbeperkte projecten & taken','ISO 9001 & ISO 22301','PDF/Excel export','E-mailsupport'] : ['All modules (projects, quality, BCM, CAPA)','Unlimited projects & tasks','ISO 9001 & ISO 22301','PDF/Excel export','Email support'],
    extF:  nl ? ['Alles uit Solo','Onbeperkt teamleden uitnodigen','Eigenaar / Beheerder / Lid rollen','Gedeelde projecten & taken','Eigenaars toewijzen vanuit team','Prioriteitsondersteuning'] : ['Everything in Solo','Invite unlimited team members','Owner / Admin / Member roles','Shared projects & tasks','Assign owners from team','Priority support'],
    startSoloM: nl ? 'Solo maandelijks'     : 'Solo monthly',
    startSoloY: nl ? 'Solo jaarlijks'       : 'Solo yearly',
    startExtM:  nl ? 'Extended maandelijks' : 'Extended monthly',
    startExtY:  nl ? 'Extended jaarlijks'   : 'Extended yearly',
  };
  useEffect(() => {
    fetch('/api/account/billing-info').then(r => r.json()).then(d => { setBilling(d); setLoading(false); }).catch(() => setLoading(false));
  }, []);
  const checkout = async (plan: string) => {
    setCheckoutLoading(plan);
    const res = await fetch('/api/stripe/checkout', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ plan }) });
    const { url, error } = await res.json();
    if (url) window.location.href = url; else alert(error);
    setCheckoutLoading(null);
  };
  const portal = async () => {
    setPortalLoading(true);
    const res = await fetch('/api/stripe/portal', { method: 'POST' });
    const { url, error } = await res.json();
    if (url) window.location.href = url; else alert(error);
    setPortalLoading(false);
  };
  const sc = (s: string) => s === 'active' ? '#34d399' : s === 'trialing' ? '#60a5fa' : s === 'past_due' ? '#fbbf24' : '#f87171';
  const sl = (s: string) => s === 'active' ? ui.active : s === 'trialing' ? (billing?.trial_ends_at && new Date(billing.trial_ends_at) < new Date() ? ui.trialExp : ui.trialActive) : s === 'past_due' ? ui.pastDue : s === 'canceled' ? ui.canceled : ui.blocked;
  const fmt = (d: string) => new Date(d).toLocaleDateString(nl ? 'nl-BE' : 'en-GB', { day: 'numeric', month: 'long', year: 'numeric' });
  const hasActive = billing?.subscription_status === 'active' || billing?.subscription_status === 'past_due';
  const isExt = billing?.plan?.startsWith('extended');
  const C = { background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 16, padding: 24, marginBottom: 20 };
  const Btn = (props: any) => <button {...props} style={{ padding: '8px 16px', borderRadius: 8, fontWeight: 600, fontSize: 13, cursor: props.disabled ? 'not-allowed' : 'pointer', width: '100%', marginTop: 10, ...props.style }} />;
  if (loading) return <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '60vh', color: '#94a3b8' }}>Laden...</div>;
  return (
    <div style={{ maxWidth: 820, margin: '0 auto', padding: '32px 16px' }}>
      <h1 style={{ fontSize: 26, fontWeight: 700, color: '#f1f5f9', marginBottom: 8 }}>{ui.title}</h1>
      {searchParams.get('success') && <div style={{ background: 'rgba(52,211,153,.12)', border: '1px solid rgba(52,211,153,.3)', borderRadius: 10, padding: '12px 16px', marginBottom: 16, color: '#34d399', fontSize: 14 }}>{ui.successMsg}</div>}
      {billing?.subscription_status === 'past_due' && <div style={{ background: 'rgba(251,191,36,.1)', border: '1px solid rgba(251,191,36,.3)', borderRadius: 10, padding: '12px 16px', marginBottom: 16, color: '#fbbf24', fontSize: 14 }}>{ui.pastDueMsg}</div>}
      {billing && (
        <div style={C}>
          <p style={{ fontSize: 12, color: '#64748b', textTransform: 'uppercase', letterSpacing: '.06em', marginBottom: 6 }}>{ui.currentPlan}</p>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
            <span style={{ fontSize: 20, fontWeight: 700, color: '#f1f5f9' }}>{billing.plan === 'free' ? ui.trialLabel : billing.plan.replace(/_/g, ' ')}</span>
            <span style={{ background: sc(billing.subscription_status) + '22', color: sc(billing.subscription_status), fontSize: 12, fontWeight: 600, padding: '2px 10px', borderRadius: 99 }}>{sl(billing.subscription_status)}</span>
            {isExt && <Link href="/dashboard/team" style={{ background: 'rgba(139,92,246,.15)', color: '#a78bfa', fontSize: 12, fontWeight: 600, padding: '2px 10px', borderRadius: 99, textDecoration: 'none' }}>{ui.manageTeam}</Link>}
          </div>
          {billing.trial_ends_at && billing.subscription_status === 'trialing' && <p style={{ fontSize: 13, color: '#64748b', marginTop: 6 }}>{ui.trialEnds}: <strong style={{ color: '#e2e8f0' }}>{fmt(billing.trial_ends_at)}</strong></p>}
          {billing.current_period_end && billing.subscription_status === 'active' && <p style={{ fontSize: 13, color: '#64748b', marginTop: 6 }}>{ui.renewsOn}: <strong style={{ color: '#e2e8f0' }}>{fmt(billing.current_period_end)}</strong></p>}
        </div>
      )}
      {hasActive && (
        <div style={C}>
          <h2 style={{ fontSize: 15, fontWeight: 600, color: '#e2e8f0', marginBottom: 6 }}>{ui.manage}</h2>
          <p style={{ fontSize: 13, color: '#64748b', marginBottom: 14 }}>{ui.manageDesc}</p>
          <button onClick={portal} disabled={portalLoading} style={{ padding: '10px 22px', borderRadius: 8, background: 'rgba(59,130,246,.15)', border: '1px solid rgba(59,130,246,.3)', color: '#93c5fd', fontWeight: 500, fontSize: 14, cursor: 'pointer' }}>{portalLoading ? '...' : ui.portal}</button>
        </div>
      )}
      {!hasActive && (
        <div>
          <h2 style={{ fontSize: 17, fontWeight: 600, color: '#e2e8f0', marginBottom: 20 }}>{ui.choosePlan}</h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(340px,1fr))', gap: 20, marginBottom: 16 }}>
            {/* SOLO */}
            <div style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 16, padding: 24 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
                <p style={{ fontSize: 14, fontWeight: 800, color: '#60a5fa', margin: 0 }}>SOLO</p>
              </div>
              <p style={{ fontSize: 13, color: '#64748b', marginBottom: 16 }}>{ui.soloDesc}</p>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 20 }}>
                <div style={{ background: 'rgba(255,255,255,.03)', borderRadius: 10, padding: 14 }}>
                  <div style={{ fontSize: 24, fontWeight: 800, color: '#f1f5f9' }}>&euro;23,78</div>
                  <div style={{ fontSize: 12, color: '#64748b' }}>{ui.perMonth}</div>
                  <Btn onClick={() => checkout('monthly')} disabled={checkoutLoading === 'monthly'} style={{ background: 'rgba(59,130,246,.15)', border: '1px solid rgba(59,130,246,.3)', color: '#93c5fd' }}>{checkoutLoading === 'monthly' ? '...' : ui.startSoloM}</Btn>
                </div>
                <div style={{ background: 'rgba(255,255,255,.03)', borderRadius: 10, padding: 14, position: 'relative' }}>
                  <span style={{ position: 'absolute', top: -8, right: 8, background: '#3b82f6', color: '#fff', fontSize: 10, fontWeight: 700, padding: '1px 6px', borderRadius: 99 }}>{ui.save12}</span>
                  <div style={{ fontSize: 24, fontWeight: 800, color: '#f1f5f9' }}>&euro;250</div>
                  <div style={{ fontSize: 12, color: '#64748b' }}>{ui.perYear}</div>
                  <Btn onClick={() => checkout('yearly')} disabled={checkoutLoading === 'yearly'} style={{ background: 'rgba(59,130,246,.15)', border: '1px solid rgba(59,130,246,.3)', color: '#93c5fd' }}>{checkoutLoading === 'yearly' ? '...' : ui.startSoloY}</Btn>
                </div>
              </div>
              <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: 6 }}>
                {ui.soloF.map((f, i) => <li key={i} style={{ fontSize: 12, color: '#94a3b8', display: 'flex', gap: 6 }}><span style={{ color: '#3b82f6' }}>✓</span>{f}</li>)}
              </ul>
            </div>
            {/* EXTENDED */}
            <div style={{ background: 'linear-gradient(145deg,rgba(139,92,246,.1),rgba(59,130,246,.08))', border: '1.5px solid rgba(139,92,246,.45)', borderRadius: 16, padding: 24, position: 'relative' }}>
              <span style={{ position: 'absolute', top: -12, left: '50%', transform: 'translateX(-50%)', background: 'linear-gradient(135deg,#8b5cf6,#3b82f6)', color: '#fff', fontSize: 11, fontWeight: 800, padding: '3px 14px', borderRadius: 999, whiteSpace: 'nowrap' }}>{ui.extBadge}</span>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
                <p style={{ fontSize: 14, fontWeight: 800, color: '#a78bfa', margin: 0 }}>EXTENDED</p>
              </div>
              <p style={{ fontSize: 13, color: '#64748b', marginBottom: 16 }}>{ui.extDesc}</p>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 20 }}>
                <div style={{ background: 'rgba(255,255,255,.03)', borderRadius: 10, padding: 14 }}>
                  <div style={{ fontSize: 24, fontWeight: 800, color: '#f1f5f9' }}>&euro;53,30</div>
                  <div style={{ fontSize: 12, color: '#64748b' }}>{ui.perMonth}</div>
                  <Btn onClick={() => checkout('extended_monthly')} disabled={checkoutLoading === 'extended_monthly'} style={{ background: 'linear-gradient(135deg,rgba(139,92,246,.3),rgba(59,130,246,.3))', border: '1px solid rgba(139,92,246,.4)', color: '#c4b5fd' }}>{checkoutLoading === 'extended_monthly' ? '...' : ui.startExtM}</Btn>
                </div>
                <div style={{ background: 'rgba(255,255,255,.03)', borderRadius: 10, padding: 14, position: 'relative' }}>
                  <span style={{ position: 'absolute', top: -8, right: 8, background: '#8b5cf6', color: '#fff', fontSize: 10, fontWeight: 700, padding: '1px 6px', borderRadius: 99 }}>{ui.save17}</span>
                  <div style={{ fontSize: 24, fontWeight: 800, color: '#f1f5f9' }}>&euro;530</div>
                  <div style={{ fontSize: 12, color: '#64748b' }}>{ui.perYear}</div>
                  <Btn onClick={() => checkout('extended_yearly')} disabled={checkoutLoading === 'extended_yearly'} style={{ background: 'linear-gradient(135deg,rgba(139,92,246,.3),rgba(59,130,246,.3))', border: '1px solid rgba(139,92,246,.4)', color: '#c4b5fd' }}>{checkoutLoading === 'extended_yearly' ? '...' : ui.startExtY}</Btn>
                </div>
              </div>
              <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: 6 }}>
                {ui.extF.map((f, i) => <li key={i} style={{ fontSize: 12, color: '#94a3b8', display: 'flex', gap: 6 }}><span style={{ color: '#a78bfa' }}>✓</span>{f}</li>)}
              </ul>
            </div>
          </div>
          <p style={{ fontSize: 12, color: '#475569', textAlign: 'center' }}>{ui.noCard}</p>
        </div>
      )}
    </div>
  );
}
