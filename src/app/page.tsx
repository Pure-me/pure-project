import type { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Pure Project — Projectmanagement, ISO 9001 & BCM voor KMOs | Gratis proberen',
  description: 'Pure Project combineert projectmanagement, ISO 9001 kwaliteitsmanagement en ISO 22301 business continuity in één betaalbaar platform. Voor Belgische en Nederlandse KMOs. 14 dagen gratis.',
  openGraph: {
    title: 'Pure Project — Alles-in-één voor projectmanagement, kwaliteit & BCM',
    description: 'Stop met 3 aparte tools. Pure Project geeft je projectmanagement, ISO 9001 en BCM in één platform. Vanaf €23,78/maand. Gratis starten.',
  },
};

const features = [
  {
    icon: '📋',
    title: 'Projectmanagement',
    description: 'Gantt-charts, taakbeheer, workstreams, deadlines en voortgangsopvolging. Alles overzichtelijk in één plek.',
    color: '#3b82f6',
    items: ['Gantt-chart visualisatie', 'Hiërarchische taakstructuur', 'Teamleden & rollen', 'Exporteer naar PDF/Excel'],
  },
  {
    icon: '🔍',
    title: 'ISO 9001 Kwaliteitsmanagement',
    description: 'Non-conformiteiten, verbeterpunten, auditbevindingen en KPIs. Volledig conform ISO 9001:2015.',
    color: '#8b5cf6',
    items: ['Non-conformiteitsbeheer', 'Verbeterpunten opvolgen', 'Auditbevindingen registreren', 'CAPA 8-stappen workflow'],
  },
  {
    icon: '🛡️',
    title: 'ISO 22301 Business Continuity',
    description: 'Risicomatrix, herstelplannen, crisisprocedures en BCP-ontwikkeling. Conform ISO 22301:2019.',
    color: '#10b981',
    items: ['5×5 risicomatrix', 'BCP-templates klaar voor gebruik', 'Crisisprocedures beheren', 'Scenario-oefeningen plannen'],
  },
];

const competitors = [
  { feature: 'Projectmanagement', pure: true, monday: true, asana: true, qualityze: false },
  { feature: 'ISO 9001 kwaliteitsmanagement', pure: true, monday: false, asana: false, qualityze: true },
  { feature: 'ISO 22301 BCM', pure: true, monday: false, asana: false, qualityze: false },
  { feature: 'CAPA 8-stappen workflow', pure: true, monday: false, asana: false, qualityze: true },
  { feature: 'Gantt-chart ingebouwd', pure: true, monday: true, asana: true, qualityze: false },
  { feature: 'NL/EN tweetalig', pure: true, monday: false, asana: false, qualityze: false },
  { feature: 'ISO-compliance templates', pure: true, monday: false, asana: false, qualityze: false },
  { feature: 'Betaalbaar voor KMOs', pure: true, monday: false, asana: false, qualityze: false },
  { feature: 'Prijs/maand (flat rate)', pure: '€23,78', monday: '€9/user', asana: '€11/user', qualityze: 'Op aanvraag' },
];

const testimonials = [
  {
    text: "Eindelijk één tool voor al onze ISO 9001 registraties én projectopvolging. We besparen minstens 5 uur per week aan rapportage.",
    author: "Kwaliteitsmanager",
    company: "Productiebedrijf, België",
    avatar: "K",
    color: "#3b82f6",
  },
  {
    text: "De CAPA-module alleen al is de investering waard. Volledig traceerbaar, auditklaar en gebruiksvriendelijk.",
    author: "Operations Director",
    company: "Logistiek bedrijf, Nederland",
    avatar: "O",
    color: "#8b5cf6",
  },
  {
    text: "BCM en projectmanagement in één overzicht. Onze directie heeft nu real-time inzicht zonder eindeloze Excelsheets.",
    author: "Business Continuity Manager",
    company: "Financiële dienstverlener, België",
    avatar: "B",
    color: "#10b981",
  },
];

export default function LandingPage() {
  return (
    <div style={{ background: '#0a0f1e', color: '#e2e8f0', minHeight: '100vh' }}>

      {/* ── NAVBAR ─────────────────────────────────────────── */}
      <nav style={{
        position: 'sticky', top: 0, zIndex: 50,
        borderBottom: '1px solid rgba(255,255,255,0.07)',
        background: 'rgba(10,15,30,0.95)',
        backdropFilter: 'blur(20px)',
        padding: '0 32px',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        height: '64px',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{ width: '36px', height: '36px', background: 'linear-gradient(135deg,#3b82f6,#8b5cf6)', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '18px' }}>⬡</div>
          <span style={{ fontWeight: '800', fontSize: '18px', color: '#f1f5f9' }}>Pure Project</span>
          <span style={{ fontSize: '11px', color: '#475569', marginTop: '2px' }}>by pureexcellence.be</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Link href="#pricing" style={{ padding: '8px 16px', color: '#94a3b8', textDecoration: 'none', fontSize: '14px', fontWeight: '500' }}>Prijzen</Link>
          <Link href="/login" style={{ padding: '8px 16px', color: '#94a3b8', textDecoration: 'none', fontSize: '14px', fontWeight: '500' }}>Inloggen</Link>
          <Link href="/login" style={{
            padding: '9px 20px',
            background: 'linear-gradient(135deg,#3b82f6,#2563eb)',
            color: 'white', textDecoration: 'none',
            borderRadius: '10px', fontSize: '14px', fontWeight: '700',
            boxShadow: '0 4px 20px rgba(59,130,246,0.3)',
          }}>
            Gratis starten →
          </Link>
        </div>
      </nav>

      {/* ── HERO ──────────────────────────────────────────── */}
      <section style={{
        padding: '96px 32px 80px',
        textAlign: 'center',
        background: 'radial-gradient(ellipse at 50% 0%, rgba(59,130,246,0.15) 0%, transparent 60%)',
        position: 'relative', overflow: 'hidden',
      }}>
        {/* Badge */}
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', padding: '6px 16px', borderRadius: '20px', background: 'rgba(59,130,246,0.1)', border: '1px solid rgba(59,130,246,0.3)', marginBottom: '24px' }}>
          <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#3b82f6', display: 'inline-block' }}></span>
          <span style={{ fontSize: '13px', color: '#60a5fa', fontWeight: '600' }}>ISO 9001 · ISO 22301 · Projectmanagement · CAPA</span>
        </div>

        <h1 style={{
          fontSize: 'clamp(36px, 6vw, 68px)', fontWeight: '900', lineHeight: '1.1',
          color: '#f1f5f9', margin: '0 auto 24px', maxWidth: '880px',
        }}>
          Stop met{' '}
          <span style={{ background: 'linear-gradient(135deg,#f43f5e,#f59e0b)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>
            3 aparte tools
          </span>
          .<br />Alles in één platform.
        </h1>

        <p style={{ fontSize: 'clamp(16px, 2vw, 20px)', color: '#64748b', maxWidth: '620px', margin: '0 auto 40px', lineHeight: '1.7' }}>
          Pure Project combineert <strong style={{ color: '#94a3b8' }}>projectmanagement</strong>, <strong style={{ color: '#94a3b8' }}>ISO 9001 kwaliteitsmanagement</strong> en <strong style={{ color: '#94a3b8' }}>ISO 22301 business continuity</strong> in één betaalbaar platform — speciaal gebouwd voor Belgische en Nederlandse KMOs.
        </p>

        <div style={{ display: 'flex', gap: '12px', justifyContent: 'center', flexWrap: 'wrap' }}>
          <Link href="/login" style={{
            padding: '14px 32px',
            background: 'linear-gradient(135deg,#3b82f6,#2563eb)',
            color: 'white', textDecoration: 'none',
            borderRadius: '12px', fontSize: '16px', fontWeight: '700',
            boxShadow: '0 8px 32px rgba(59,130,246,0.4)',
            display: 'inline-flex', alignItems: 'center', gap: '8px',
          }}>
            14 dagen gratis starten
            <span style={{ fontSize: '18px' }}>→</span>
          </Link>
          <Link href="#features" style={{
            padding: '14px 32px', borderRadius: '12px', fontSize: '16px', fontWeight: '600',
            background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.12)',
            color: '#94a3b8', textDecoration: 'none',
          }}>
            Meer info
          </Link>
        </div>

        <p style={{ color: '#334155', fontSize: '13px', marginTop: '20px' }}>
          ✓ Geen creditcard vereist &nbsp;·&nbsp; ✓ 14 dagen volledig gratis &nbsp;·&nbsp; ✓ Direct up en running
        </p>

        {/* Hero KPIs */}
        <div style={{ display: 'flex', gap: '40px', justifyContent: 'center', marginTop: '56px', flexWrap: 'wrap' }}>
          {[
            { value: '3-in-1', label: 'tools vervangen' },
            { value: '€23,78', label: 'per maand, flat' },
            { value: 'ISO', label: '9001 + 22301 ready' },
            { value: 'NL/EN', label: 'tweetalig' },
          ].map(kpi => (
            <div key={kpi.value} style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '28px', fontWeight: '900', color: '#f1f5f9', lineHeight: 1 }}>{kpi.value}</div>
              <div style={{ fontSize: '13px', color: '#475569', marginTop: '4px' }}>{kpi.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* ── FEATURES ──────────────────────────────────────── */}
      <section id="features" style={{ padding: '80px 32px', maxWidth: '1200px', margin: '0 auto' }}>
        <div style={{ textAlign: 'center', marginBottom: '56px' }}>
          <h2 style={{ fontSize: 'clamp(28px, 4vw, 44px)', fontWeight: '800', color: '#f1f5f9', marginBottom: '12px' }}>Drie pijlers. Één platform.</h2>
          <p style={{ color: '#64748b', fontSize: '17px', maxWidth: '520px', margin: '0 auto' }}>Geen aparte tools meer, geen data-eilanden, geen dubbele invoer.</p>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '24px' }}>
          {features.map(f => (
            <div key={f.title} style={{
              padding: '32px', borderRadius: '20px',
              background: 'rgba(255,255,255,0.04)',
              border: `1px solid ${f.color}22`,
              transition: 'all 0.2s',
            }}>
              <div style={{ width: '52px', height: '52px', borderRadius: '14px', background: `${f.color}18`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '24px', marginBottom: '20px' }}>
                {f.icon}
              </div>
              <h3 style={{ color: '#f1f5f9', fontSize: '20px', fontWeight: '700', marginBottom: '12px' }}>{f.title}</h3>
              <p style={{ color: '#64748b', fontSize: '14px', lineHeight: '1.7', marginBottom: '20px' }}>{f.description}</p>
              <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {f.items.map(item => (
                  <li key={item} style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '14px', color: '#94a3b8' }}>
                    <span style={{ color: f.color, fontWeight: '700', fontSize: '16px' }}>✓</span>
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </section>

      {/* ── COMPARISON TABLE ──────────────────────────────── */}
      <section style={{ padding: '80px 32px', background: 'rgba(255,255,255,0.01)' }}>
        <div style={{ maxWidth: '900px', margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: '48px' }}>
            <h2 style={{ fontSize: 'clamp(28px, 4vw, 40px)', fontWeight: '800', color: '#f1f5f9', marginBottom: '12px' }}>Waarom Pure Project wint</h2>
            <p style={{ color: '#64748b', fontSize: '16px' }}>Vergelijking met de populairste alternatieven</p>
          </div>

          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr>
                  <th style={{ textAlign: 'left', padding: '14px 20px', color: '#475569', fontSize: '13px', fontWeight: '600', borderBottom: '1px solid rgba(255,255,255,0.07)' }}>Functionaliteit</th>
                  {[
                    { name: 'Pure Project', color: '#3b82f6', highlight: true },
                    { name: 'Monday.com', color: '#475569', highlight: false },
                    { name: 'Asana', color: '#475569', highlight: false },
                    { name: 'Qualityze', color: '#475569', highlight: false },
                  ].map(col => (
                    <th key={col.name} style={{
                      textAlign: 'center', padding: '14px 16px',
                      color: col.highlight ? '#60a5fa' : '#475569',
                      fontSize: '13px', fontWeight: '700',
                      borderBottom: '1px solid rgba(255,255,255,0.07)',
                      background: col.highlight ? 'rgba(59,130,246,0.06)' : 'transparent',
                    }}>
                      {col.name}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {competitors.map((row, i) => (
                  <tr key={row.feature} style={{ background: i % 2 === 0 ? 'transparent' : 'rgba(255,255,255,0.01)' }}>
                    <td style={{ padding: '13px 20px', fontSize: '14px', color: '#94a3b8', borderBottom: '1px solid rgba(255,255,255,0.04)' }}>{row.feature}</td>
                    {[row.pure, row.monday, row.asana, row.qualityze].map((val, ci) => (
                      <td key={ci} style={{
                        textAlign: 'center', padding: '13px 16px',
                        fontSize: '14px',
                        borderBottom: '1px solid rgba(255,255,255,0.04)',
                        background: ci === 0 ? 'rgba(59,130,246,0.04)' : 'transparent',
                      }}>
                        {typeof val === 'string' ? (
                          <span style={{ color: ci === 0 ? '#60a5fa' : '#64748b', fontWeight: ci === 0 ? '700' : '400' }}>{val}</span>
                        ) : val ? (
                          <span style={{ color: ci === 0 ? '#10b981' : '#94a3b8', fontWeight: '700', fontSize: '18px' }}>✓</span>
                        ) : (
                          <span style={{ color: '#334155', fontSize: '18px' }}>—</span>
                        )}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* ── PRICING ───────────────────────────────────────── */}
      <section id="pricing" style={{ padding: '80px 32px', maxWidth: '1000px', margin: '0 auto' }}>
        <div style={{ textAlign: 'center', marginBottom: '48px' }}>
          <h2 style={{ fontSize: 'clamp(28px, 4vw, 44px)', fontWeight: '800', color: '#f1f5f9', marginBottom: '12px' }}>Transparante prijzen</h2>
          <p style={{ color: '#64748b', fontSize: '16px' }}>Flat rate — geen verrassingen, geen extra kosten per gebruiker</p>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '24px', alignItems: 'start' }}>

          {/* Free trial */}
          <div style={{ padding: '32px', borderRadius: '20px', background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.1)' }}>
            <div style={{ fontSize: '13px', fontWeight: '700', color: '#64748b', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '16px' }}>Gratis Proef</div>
            <div style={{ fontSize: '48px', fontWeight: '900', color: '#f1f5f9', marginBottom: '4px' }}>€0</div>
            <div style={{ color: '#475569', fontSize: '14px', marginBottom: '24px' }}>14 dagen volledig gratis</div>
            <ul style={{ listStyle: 'none', padding: 0, margin: '0 0 28px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {['Alle functies inbegrepen', 'Onbeperkte projecten', 'Geen creditcard vereist', 'Direct toegang'].map(item => (
                <li key={item} style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '14px', color: '#94a3b8' }}>
                  <span style={{ color: '#10b981', fontWeight: '700' }}>✓</span>{item}
                </li>
              ))}
            </ul>
            <Link href="/login" style={{
              display: 'block', textAlign: 'center', padding: '12px',
              borderRadius: '10px', textDecoration: 'none', fontSize: '15px', fontWeight: '700',
              background: 'rgba(255,255,255,0.07)', border: '1px solid rgba(255,255,255,0.12)', color: '#94a3b8',
            }}>
              Gratis starten
            </Link>
          </div>

          {/* Monthly — RECOMMENDED */}
          <div style={{
            padding: '32px', borderRadius: '20px',
            background: 'rgba(59,130,246,0.08)',
            border: '2px solid rgba(59,130,246,0.5)',
            position: 'relative', transform: 'scale(1.03)',
          }}>
            <div style={{ position: 'absolute', top: '-14px', left: '50%', transform: 'translateX(-50%)', background: 'linear-gradient(135deg,#3b82f6,#2563eb)', color: 'white', padding: '4px 16px', borderRadius: '20px', fontSize: '12px', fontWeight: '700', whiteSpace: 'nowrap' }}>
              MEEST POPULAIR
            </div>
            <div style={{ fontSize: '13px', fontWeight: '700', color: '#60a5fa', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '16px' }}>Maandabonnement</div>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: '4px', marginBottom: '4px' }}>
              <span style={{ fontSize: '48px', fontWeight: '900', color: '#f1f5f9' }}>€23,78</span>
              <span style={{ color: '#475569', fontSize: '14px' }}>/maand</span>
            </div>
            <div style={{ color: '#475569', fontSize: '13px', marginBottom: '24px' }}>Excl. btw · Maandelijks opzegbaar</div>
            <ul style={{ listStyle: 'none', padding: 0, margin: '0 0 28px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {[
                'Onbeperkt projecten & taken',
                'Onbeperkt gebruikers',
                'ISO 9001 + 22301 modules',
                'CAPA 8-stappen workflow',
                'PDF & Excel export',
                'NL/EN taalondersteuning',
                'ISO compliance templates',
                'E-mail ondersteuning',
              ].map(item => (
                <li key={item} style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '14px', color: '#94a3b8' }}>
                  <span style={{ color: '#3b82f6', fontWeight: '700' }}>✓</span>{item}
                </li>
              ))}
            </ul>
            <Link href="/login" style={{
              display: 'block', textAlign: 'center', padding: '14px',
              borderRadius: '10px', textDecoration: 'none', fontSize: '15px', fontWeight: '700',
              background: 'linear-gradient(135deg,#3b82f6,#2563eb)', color: 'white',
              boxShadow: '0 8px 24px rgba(59,130,246,0.35)',
            }}>
              Nu starten →
            </Link>
          </div>

          {/* Annual */}
          <div style={{ padding: '32px', borderRadius: '20px', background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(16,185,129,0.3)', position: 'relative' }}>
            <div style={{ position: 'absolute', top: '-14px', right: '20px', background: 'rgba(16,185,129,0.2)', color: '#10b981', padding: '4px 14px', borderRadius: '20px', fontSize: '12px', fontWeight: '700', border: '1px solid rgba(16,185,129,0.3)' }}>
              BES PAAR €35/JAAR
            </div>
            <div style={{ fontSize: '13px', fontWeight: '700', color: '#10b981', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '16px' }}>Jaarabonnement</div>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: '4px', marginBottom: '4px' }}>
              <span style={{ fontSize: '48px', fontWeight: '900', color: '#f1f5f9' }}>€250</span>
              <span style={{ color: '#475569', fontSize: '14px' }}>/jaar</span>
            </div>
            <div style={{ color: '#475569', fontSize: '13px', marginBottom: '24px' }}>≈ €20,83/maand · Excl. btw</div>
            <ul style={{ listStyle: 'none', padding: 0, margin: '0 0 28px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {[
                'Alles van het maandabonnement',
                '2 maanden gratis t.o.v. maandelijks',
                'Prioritaire e-mail ondersteuning',
                'Vroege toegang tot nieuwe functies',
              ].map(item => (
                <li key={item} style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '14px', color: '#94a3b8' }}>
                  <span style={{ color: '#10b981', fontWeight: '700' }}>✓</span>{item}
                </li>
              ))}
            </ul>
            <Link href="/login" style={{
              display: 'block', textAlign: 'center', padding: '12px',
              borderRadius: '10px', textDecoration: 'none', fontSize: '15px', fontWeight: '700',
              background: 'rgba(16,185,129,0.15)', border: '1px solid rgba(16,185,129,0.3)', color: '#10b981',
            }}>
              Jaarabonnement kiezen
            </Link>
          </div>
        </div>

        <p style={{ textAlign: 'center', color: '#334155', fontSize: '13px', marginTop: '32px' }}>
          Alle abonnementen incl. gratis 14-daagse proefperiode · Opzegbaar per e-mail · Prijzen excl. 21% btw
        </p>
      </section>

      {/* ── TESTIMONIALS ──────────────────────────────────── */}
      <section style={{ padding: '80px 32px', background: 'rgba(255,255,255,0.01)' }}>
        <div style={{ maxWidth: '1100px', margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: '48px' }}>
            <h2 style={{ fontSize: 'clamp(28px, 4vw, 40px)', fontWeight: '800', color: '#f1f5f9', marginBottom: '12px' }}>Wat onze gebruikers zeggen</h2>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '24px' }}>
            {testimonials.map((t, i) => (
              <div key={i} style={{ padding: '28px', borderRadius: '16px', background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }}>
                <p style={{ color: '#94a3b8', fontSize: '15px', lineHeight: '1.7', marginBottom: '20px', fontStyle: 'italic' }}>"{t.text}"</p>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <div style={{ width: '40px', height: '40px', borderRadius: '10px', background: `${t.color}22`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: '700', color: t.color, fontSize: '16px' }}>{t.avatar}</div>
                  <div>
                    <div style={{ fontWeight: '600', color: '#f1f5f9', fontSize: '14px' }}>{t.author}</div>
                    <div style={{ color: '#475569', fontSize: '12px' }}>{t.company}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── FINAL CTA ─────────────────────────────────────── */}
      <section style={{ padding: '80px 32px', textAlign: 'center' }}>
        <div style={{ maxWidth: '600px', margin: '0 auto' }}>
          <h2 style={{ fontSize: 'clamp(28px, 4vw, 44px)', fontWeight: '800', color: '#f1f5f9', marginBottom: '16px' }}>
            Klaar om te starten?
          </h2>
          <p style={{ color: '#64748b', fontSize: '17px', marginBottom: '32px', lineHeight: '1.7' }}>
            14 dagen gratis. Geen creditcard. Geen onboarding-call. Gewoon inloggen en aan de slag.
          </p>
          <Link href="/login" style={{
            padding: '16px 40px',
            background: 'linear-gradient(135deg,#3b82f6,#8b5cf6)',
            color: 'white', textDecoration: 'none',
            borderRadius: '14px', fontSize: '18px', fontWeight: '800',
            boxShadow: '0 12px 40px rgba(59,130,246,0.35)',
            display: 'inline-block',
          }}>
            Gratis starten →
          </Link>
          <p style={{ color: '#334155', fontSize: '13px', marginTop: '16px' }}>
            Na 14 dagen kies je zelf of je doorgaat
          </p>
        </div>
      </section>

      {/* ── FOOTER ────────────────────────────────────────── */}
      <footer style={{ borderTop: '1px solid rgba(255,255,255,0.07)', padding: '32px', background: 'rgba(10,15,30,0.8)' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{ width: '28px', height: '28px', background: 'linear-gradient(135deg,#3b82f6,#8b5cf6)', borderRadius: '7px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '14px' }}>⬡</div>
            <div>
              <span style={{ fontWeight: '700', color: '#f1f5f9', fontSize: '14px' }}>Pure Project</span>
              <span style={{ color: '#334155', fontSize: '12px', marginLeft: '8px' }}>© {new Date().getFullYear()} Pure Excellence BV</span>
            </div>
          </div>
          <div style={{ display: 'flex', gap: '24px', flexWrap: 'wrap' }}>
            <Link href="/privacy" style={{ color: '#475569', textDecoration: 'none', fontSize: '13px' }}>Privacybeleid</Link>
            <Link href="/terms" style={{ color: '#475569', textDecoration: 'none', fontSize: '13px' }}>Gebruiksvoorwaarden</Link>
            <a href="mailto:support@pureexcellence.be" style={{ color: '#475569', textDecoration: 'none', fontSize: '13px' }}>Contact</a>
            <Link href="/login" style={{ color: '#60a5fa', textDecoration: 'none', fontSize: '13px', fontWeight: '600' }}>Inloggen →</Link>
          </div>
        </div>
      </footer>

    </div>
  );
}
