'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
type Locale = 'nl' | 'en';
const t = {
  nl: {
    nav: { features: 'Functies', pricing: 'Prijzen', login: 'Inloggen', start: 'Gratis starten' },
    hero: {
      badge: '14 dagen gratis \u00b7 geen creditcard vereist',
      title: 'Het enige projectmanagementtool',
      titleHighlight: 'met ISO 9001 & ISO 22301',
      titleEnd: 'ingebakken',
      subtitle: 'Pure Project combineert projectbeheer, kwaliteitsmanagement (ISO 9001) en bedrijfscontinuïteit (ISO 22301) in één platform. Gebouwd voor teams die ISO-normen serieus nemen.',
      cta: 'Start gratis proefperiode', ctaSecondary: 'Bekijk de functies',
    },
    features: {
      title: 'Alles wat je nodig hebt, in één tool',
      subtitle: 'Van projectplanning tot ISO-audit — Pure Project dekt het allemaal.',
      items: [
        { icon: '📋', title: 'Projectbeheer', desc: 'Taken, deadlines, Kanban-bord en voortgangsrapportage in real-time.' },
        { icon: '✅', title: 'Kwaliteitsmanagement (ISO 9001)', desc: 'Non-conformiteiten, root cause analysis, correctieve acties en auditlogs.' },
        { icon: '🛡️', title: 'Bedrijfscontinuïteit (ISO 22301)', desc: "BCM-items, risico's, RTO/RPO-tracking en mitigatieplannen." },
        { icon: '🔄', title: 'CAPA-beheer', desc: 'Corrigerende en preventieve acties met verificatiestappen en deadlines.' },
        { icon: '🤖', title: 'AI-ondersteuning', desc: 'Slimme suggesties voor verbeteringen, risicoanalyses en rapportage.' },
        { icon: '📊', title: 'Rapportage & Dashboards', desc: "Exporteer naar PDF, volg KPI's en deel rapporten met stakeholders." },
      ],
    },
    pricing: {
      title: 'Eenvoudige, transparante prijzen',
      subtitle: 'Geen verborgen kosten. Annuleer wanneer je wil.',
      plans: [
        { name: 'Gratis proefperiode', price: '€0', period: '14 dagen', desc: 'Probeer alle functies zonder risico.', features: ['Volledige toegang tot alle modules','Onbeperkte projecten & taken','ISO 9001 & ISO 22301 tools','CAPA-beheer','E-mailondersteuning'], cta: 'Gratis starten', highlight: false },
        { name: 'Solo', price: '€23,78', period: '/maand', desc: 'Voor individuele professionals en kleine teams.', features: ['Alle modules inbegrepen','Projecten, taken & Kanban','ISO 9001 & ISO 22301','CAPA-beheer','Of €250/jaar (bespaar 12%)'], cta: 'Start nu', highlight: true },
        { name: 'Extended', price: '€53,30', period: '/maand', desc: 'Voor teams die samen willen werken in één omgeving.', features: ['Alles uit Solo','Onbeperkt teamleden uitnodigen','3 rollen: Eigenaar / Beheerder / Lid','Gedeelde projecten & taken','Of €530/jaar (bespaar 17%)'], cta: 'Team starten', highlight: false },
      ],
    },
    social: {
      title: 'Vertrouwd door teams die werken aan ISO-certificering',
      items: [
        { quote: 'Pure Project maakte onze ISO 9001-audit een stuk eenvoudiger.', author: 'Kwaliteitsmanager, productie-kmo' },
        { quote: 'Eindelijk één tool voor projecten én continuïteit.', author: 'Operations Director, tech-scale-up' },
        { quote: 'De CAPA-module bespaart ons uren per week.', author: 'ISO-coördinator, zorgsector' },
      ],
    },
    faq: {
      title: 'Veelgestelde vragen',
      items: [
        { q: 'Wat is Pure Project?', a: "Pure Project is een SaaS-platform dat projectmanagement, kwaliteitsmanagement (ISO 9001) en bedrijfscontinuïteit (ISO 22301) combineert. Inclusief CAPA-module, non-conformiteiten en BCM-risico's." },
        { q: 'Ondersteunt Pure Project ISO 9001?', a: 'Ja. Non-conformiteiten, root cause analysis, CAPA, auditbevindingen en KPI-opvolging — alles voor ISO 9001-conformiteit.' },
        { q: 'Wat kost Pure Project?', a: '14 dagen volledig gratis, geen creditcard vereist. Solo-plan: €23,78/maand of €250/jaar. Extended team-plan: €53,30/maand of €530/jaar (17% korting).' },
        { q: 'Wat is CAPA-beheer?', a: 'Corrective and Preventive Actions — oorzaakanalyse, actieplanning, deadlines en verificatiestappen voor ISO 9001.' },
        { q: 'Is Pure Project GDPR-compliant?', a: 'Ja. Data in EU (Frankfurt), dataportabiliteit, accountverwijdering en profielbeheer conform GDPR.' },
      ],
    },
    cta: { title: 'Klaar om te starten?', subtitle: '14 dagen volledig gratis. Geen creditcard nodig.', button: 'Start gratis proefperiode' },
    footer: { tagline: 'Projectmanagement voor teams die kwaliteit serieus nemen.', copy: '© 2025 Pure Excellence BV. Alle rechten voorbehouden.' },
  },
  en: {
    nav: { features: 'Features', pricing: 'Pricing', login: 'Log in', start: 'Start for free' },
    hero: {
      badge: '14-day free trial \u00b7 no credit card required',
      title: 'The only project management tool',
      titleHighlight: 'with ISO 9001 & ISO 22301',
      titleEnd: 'built right in',
      subtitle: 'Pure Project combines project management, quality management (ISO 9001) and business continuity (ISO 22301) in one platform. Built for teams that take ISO standards seriously.',
      cta: 'Start free trial', ctaSecondary: 'See the features',
    },
    features: {
      title: 'Everything you need, in one tool',
      subtitle: 'From project planning to ISO audit — Pure Project covers it all.',
      items: [
        { icon: '📋', title: 'Project Management', desc: 'Tasks, deadlines, Kanban board and real-time progress reporting.' },
        { icon: '✅', title: 'Quality Management (ISO 9001)', desc: 'Non-conformities, root cause analysis, corrective actions and audit logs.' },
        { icon: '🛡️', title: 'Business Continuity (ISO 22301)', desc: 'BCM items, risks, RTO/RPO tracking and mitigation plans.' },
        { icon: '🔄', title: 'CAPA Management', desc: 'Corrective and preventive actions with verification steps and deadlines.' },
        { icon: '🤖', title: 'AI Assistance', desc: 'Smart suggestions for improvements, risk analysis and reporting.' },
        { icon: '📊', title: 'Reporting & Dashboards', desc: 'Export to PDF, track KPIs and share reports with stakeholders.' },
      ],
    },
    pricing: {
      title: 'Simple, transparent pricing',
      subtitle: 'No hidden costs. Cancel anytime.',
      plans: [
        { name: 'Free Trial', price: '€0', period: '14 days', desc: 'Try all features risk-free.', features: ['Full access to all modules','Unlimited projects & tasks','ISO 9001 & ISO 22301 tools','CAPA management','Email support'], cta: 'Start for free', highlight: false },
        { name: 'Solo', price: '€23.78', period: '/month', desc: 'For individual professionals and small teams.', features: ['All modules included','Projects, tasks & Kanban','ISO 9001 & ISO 22301','CAPA management','Or €250/year (save 12%)'], cta: 'Start now', highlight: true },
        { name: 'Extended', price: '€53.30', period: '/month', desc: 'For teams that want to collaborate in one environment.', features: ['Everything in Solo','Unlimited team members','3 roles: Owner / Admin / Member','Shared projects & tasks','Or €530/year (save 17%)'], cta: 'Start team', highlight: false },
      ],
    },
    social: {
      title: 'Trusted by teams working toward ISO certification',
      items: [
        { quote: 'Pure Project made our ISO 9001 audit so much easier.', author: 'Quality Manager, manufacturing SME' },
        { quote: 'Finally one tool for projects and continuity.', author: 'Operations Director, tech scale-up' },
        { quote: 'The CAPA module saves us hours every week.', author: 'ISO Coordinator, healthcare sector' },
      ],
    },
    faq: {
      title: 'Frequently asked questions',
      items: [
        { q: 'What is Pure Project?', a: 'Pure Project is a SaaS platform combining project management, quality management (ISO 9001) and business continuity (ISO 22301). Includes CAPA module, non-conformance tracking and BCM risks.' },
        { q: 'Does Pure Project support ISO 9001?', a: 'Yes. Non-conformities, root cause analysis, CAPA, audit findings and KPI tracking — everything for ISO 9001 compliance.' },
        { q: 'How much does Pure Project cost?', a: '14 days completely free, no credit card required. Solo plan: €23.78/month or €250/year. Extended team plan: €53.30/month or €530/year (17% discount).' },
        { q: 'What is CAPA management?', a: 'Corrective and Preventive Actions — cause analysis, action planning, deadlines and verification steps for ISO 9001.' },
        { q: 'Is Pure Project GDPR compliant?', a: 'Yes. Data in EU (Frankfurt), data portability, account deletion and profile management compliant with GDPR.' },
      ],
    },
    cta: { title: 'Ready to get started?', subtitle: '14 days completely free. No credit card needed.', button: 'Start free trial' },
    footer: { tagline: 'Project management for teams that take quality seriously.', copy: '© 2025 Pure Excellence BV. All rights reserved.' },
  },
};
export default function LandingPage() {
  const [locale, setLocale] = useState<Locale>('nl');
  const [openFaq, setOpenFaq] = useState<number | null>(null);
  useEffect(() => {
    const s = localStorage.getItem('pp-locale') as Locale | null;
    if (s === 'nl' || s === 'en') setLocale(s);
    else setLocale(navigator.language.startsWith('nl') ? 'nl' : 'en');
  }, []);
  const sw = (l: Locale) => { setLocale(l); localStorage.setItem('pp-locale', l); };
  const c = t[locale];
  const LangToggle = ({ dark = false }: { dark?: boolean }) => (
    <div style={{ display:'flex', border:`1px solid ${dark?'#334155':'#e2e8f0'}`, borderRadius:6, overflow:'hidden' }}>
      {(['nl','en'] as Locale[]).map(l => (
        <button key={l} onClick={() => sw(l)} style={{ padding:'0.25rem 0.6rem', fontSize:'0.75rem', fontWeight:700, background: locale===l ? '#1e40af' : (dark?'transparent':'#fff'), color: locale===l ? '#fff' : (dark?'#64748b':'#94a3b8'), border:'none', cursor:'pointer', textTransform:'uppercase' }}>{l}</button>
      ))}
    </div>
  );
  return (
    <div style={{ fontFamily:"'Inter',-apple-system,sans-serif", color:'#0f172a', background:'#fff' }}>
      <nav style={{ position:'sticky', top:0, zIndex:50, background:'rgba(255,255,255,.97)', backdropFilter:'blur(8px)', borderBottom:'1px solid #e2e8f0', padding:'0 1.5rem', height:64, display:'flex', alignItems:'center', justifyContent:'space-between', maxWidth:1200, margin:'0 auto' }}>
        <div style={{ display:'flex', alignItems:'center', gap:8 }}>
          <span style={{ fontSize:22 }}>⚡</span>
          <span style={{ fontWeight:800, fontSize:'1.05rem', color:'#1e40af' }}>Pure Project</span>
        </div>
        <div style={{ display:'flex', alignItems:'center', gap:20, flexWrap:'wrap' }}>
          <a href="#features" style={{ color:'#475569', textDecoration:'none', fontSize:'0.875rem' }}>{c.nav.features}</a>
          <a href="#pricing" style={{ color:'#475569', textDecoration:'none', fontSize:'0.875rem' }}>{c.nav.pricing}</a>
          <a href="#faq" style={{ color:'#475569', textDecoration:'none', fontSize:'0.875rem' }}>FAQ</a>
          <Link href="/login" style={{ color:'#475569', textDecoration:'none', fontSize:'0.875rem' }}>{c.nav.login}</Link>
          <Link href="/login" style={{ background:'#1e40af', color:'#fff', textDecoration:'none', padding:'0.4rem 1rem', borderRadius:6, fontSize:'0.85rem', fontWeight:700 }}>{c.nav.start}</Link>
          <LangToggle />
        </div>
      </nav>
      <section style={{ background:'linear-gradient(135deg,#eff6ff 0%,#f0fdf4 100%)', padding:'5rem 1.5rem 4rem', textAlign:'center' }}>
        <div style={{ maxWidth:820, margin:'0 auto' }}>
          <div style={{ display:'inline-block', background:'#dbeafe', color:'#1d4ed8', padding:'0.3rem 1rem', borderRadius:999, fontSize:'0.8rem', fontWeight:700, marginBottom:'1.5rem' }}>{c.hero.badge}</div>
          <h1 style={{ fontSize:'clamp(2rem,5vw,3.25rem)', fontWeight:800, lineHeight:1.15, margin:'0 0 1.25rem' }}>
            {c.hero.title}{' '}<span style={{ color:'#1e40af' }}>{c.hero.titleHighlight}</span>{' '}{c.hero.titleEnd}
          </h1>
          <p style={{ fontSize:'1.1rem', color:'#475569', lineHeight:1.7, maxWidth:660, margin:'0 auto 2rem' }}>{c.hero.subtitle}</p>
          <div style={{ display:'flex', gap:12, justifyContent:'center', flexWrap:'wrap' }}>
            <Link href="/login" style={{ background:'#1e40af', color:'#fff', textDecoration:'none', padding:'0.8rem 2rem', borderRadius:8, fontSize:'1rem', fontWeight:700, boxShadow:'0 4px 14px rgba(30,64,175,.3)' }}>{c.hero.cta}</Link>
            <a href="#features" style={{ background:'#fff', color:'#1e40af', textDecoration:'none', padding:'0.8rem 2rem', borderRadius:8, fontSize:'1rem', fontWeight:600, border:'2px solid #1e40af' }}>{c.hero.ctaSecondary}</a>
          </div>
          <div style={{ marginTop:'2.5rem', display:'flex', gap:20, justifyContent:'center', flexWrap:'wrap', color:'#64748b', fontSize:'0.82rem' }}>
            {['✅ ISO 9001','✅ ISO 22301','✅ CAPA','✅ GDPR','✅ EU data'].map(b => <span key={b}>{b}</span>)}
          </div>
        </div>
      </section>
      <section id="features" style={{ padding:'5rem 1.5rem', background:'#fff' }}>
        <div style={{ maxWidth:1100, margin:'0 auto' }}>
          <div style={{ textAlign:'center', marginBottom:'3rem' }}>
            <h2 style={{ fontSize:'2rem', fontWeight:800, marginBottom:12 }}>{c.features.title}</h2>
            <p style={{ color:'#64748b', fontSize:'1.05rem' }}>{c.features.subtitle}</p>
          </div>
          <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit,minmax(300px,1fr))', gap:20 }}>
            {c.features.items.map((item,i) => (
              <div key={i} style={{ background:'#f8fafc', border:'1px solid #e2e8f0', borderRadius:12, padding:'1.5rem' }}>
                <div style={{ fontSize:28, marginBottom:10 }}>{item.icon}</div>
                <h3 style={{ fontWeight:700, fontSize:'1rem', marginBottom:6 }}>{item.title}</h3>
                <p style={{ color:'#64748b', fontSize:'0.875rem', lineHeight:1.6 }}>{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
      <section style={{ padding:'4rem 1.5rem', background:'#f8fafc' }}>
        <div style={{ maxWidth:960, margin:'0 auto' }}>
          <h2 style={{ textAlign:'center', fontSize:'1.75rem', fontWeight:700, marginBottom:'2.5rem' }}>{c.social.title}</h2>
          <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit,minmax(280px,1fr))', gap:20 }}>
            {c.social.items.map((item,i) => (
              <div key={i} style={{ background:'#fff', borderRadius:12, padding:'1.5rem', border:'1px solid #e2e8f0' }}>
                <p style={{ color:'#334155', fontSize:'0.9rem', lineHeight:1.7, marginBottom:12 }}>"{item.quote}"</p>
                <p style={{ color:'#94a3b8', fontSize:'0.78rem', fontWeight:600 }}>{item.author}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
      <section id="pricing" style={{ padding:'5rem 1.5rem', background:'#fff' }}>
        <div style={{ maxWidth:1000, margin:'0 auto' }}>
          <div style={{ textAlign:'center', marginBottom:'3rem' }}>
            <h2 style={{ fontSize:'2rem', fontWeight:800, marginBottom:12 }}>{c.pricing.title}</h2>
            <p style={{ color:'#64748b', fontSize:'1.05rem' }}>{c.pricing.subtitle}</p>
          </div>
          <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit,minmax(280px,1fr))', gap:20, alignItems:'start' }}>
            {c.pricing.plans.map((plan,i) => (
              <div key={i} style={{ border: plan.highlight ? '2px solid #1e40af' : '1px solid #e2e8f0', borderRadius:16, padding:'2rem', background: plan.highlight ? 'linear-gradient(135deg,#eff6ff,#fff)' : '#fafafa', position:'relative' }}>
                {plan.highlight && <div style={{ position:'absolute', top:-12, left:'50%', transform:'translateX(-50%)', background:'#1e40af', color:'#fff', fontSize:'0.72rem', fontWeight:800, padding:'0.2rem 0.9rem', borderRadius:999, whiteSpace:'nowrap' }}>{locale==='nl'?'Meest populair':'Most popular'}</div>}
                <h3 style={{ fontWeight:700, fontSize:'1.05rem', marginBottom:6 }}>{plan.name}</h3>
                <div style={{ marginBottom:6 }}><span style={{ fontSize:'2.2rem', fontWeight:800 }}>{plan.price}</span><span style={{ color:'#64748b', marginLeft:4, fontSize:'0.875rem' }}>{plan.period}</span></div>
                <p style={{ color:'#64748b', fontSize:'0.85rem', marginBottom:'1.25rem' }}>{plan.desc}</p>
                <ul style={{ listStyle:'none', padding:0, margin:'0 0 1.5rem', display:'flex', flexDirection:'column', gap:8 }}>
                  {plan.features.map((f,j) => <li key={j} style={{ display:'flex', gap:8, fontSize:'0.85rem', color:'#334155' }}><span style={{ color:'#22c55e', fontWeight:700 }}>✓</span>{f}</li>)}
                </ul>
                <Link href="/login" style={{ display:'block', textAlign:'center', textDecoration:'none', background: plan.highlight ? '#1e40af' : '#f1f5f9', color: plan.highlight ? '#fff' : '#334155', padding:'0.7rem 1rem', borderRadius:8, fontWeight:700, fontSize:'0.875rem' }}>{plan.cta}</Link>
              </div>
            ))}
          </div>
        </div>
      </section>
      <section id="faq" style={{ padding:'5rem 1.5rem', background:'#f8fafc' }}>
        <div style={{ maxWidth:760, margin:'0 auto' }}>
          <h2 style={{ textAlign:'center', fontSize:'1.75rem', fontWeight:800, marginBottom:'2.5rem' }}>{c.faq.title}</h2>
          <div style={{ display:'flex', flexDirection:'column', gap:12 }}>
            {c.faq.items.map((item,i) => (
              <div key={i} style={{ background:'#fff', border:'1px solid #e2e8f0', borderRadius:12, overflow:'hidden' }}>
                <button onClick={() => setOpenFaq(openFaq===i ? null : i)} style={{ width:'100%', textAlign:'left', padding:'1rem 1.25rem', background:'none', border:'none', cursor:'pointer', display:'flex', justifyContent:'space-between', alignItems:'center', fontWeight:600, fontSize:'0.95rem', color:'#1e293b' }}>
                  {item.q}<span style={{ color:'#94a3b8', fontSize:'1.2rem' }}>{openFaq===i?'−':'+'}</span>
                </button>
                {openFaq===i && <div style={{ padding:'0 1.25rem 1rem', color:'#475569', fontSize:'0.9rem', lineHeight:1.7 }}>{item.a}</div>}
              </div>
            ))}
          </div>
        </div>
      </section>
      <section style={{ background:'linear-gradient(135deg,#1e3a8a,#1e40af)', padding:'5rem 1.5rem', textAlign:'center' }}>
        <div style={{ maxWidth:600, margin:'0 auto' }}>
          <h2 style={{ fontSize:'2rem', fontWeight:800, color:'#fff', marginBottom:12 }}>{c.cta.title}</h2>
          <p style={{ color:'#bfdbfe', fontSize:'1.05rem', marginBottom:'2rem' }}>{c.cta.subtitle}</p>
          <Link href="/login" style={{ display:'inline-block', background:'#fff', color:'#1e40af', textDecoration:'none', padding:'0.85rem 2.5rem', borderRadius:8, fontWeight:800, fontSize:'1.05rem' }}>{c.cta.button}</Link>
        </div>
      </section>
      <footer style={{ background:'#0f172a', color:'#94a3b8', padding:'3rem 1.5rem 2rem' }}>
        <div style={{ maxWidth:1100, margin:'0 auto' }}>
          <div style={{ display:'flex', justifyContent:'space-between', flexWrap:'wrap', gap:'2rem', marginBottom:'2rem' }}>
            <div>
              <div style={{ display:'flex', alignItems:'center', gap:8, marginBottom:10 }}><span style={{ fontSize:20 }}>⚡</span><span style={{ fontWeight:800, fontSize:'1rem', color:'#fff' }}>Pure Project</span></div>
              <p style={{ fontSize:'0.85rem', maxWidth:240, lineHeight:1.6 }}>{c.footer.tagline}</p>
            </div>
            <div style={{ display:'flex', gap:'2rem', flexWrap:'wrap' }}>
              <div style={{ display:'flex', flexDirection:'column', gap:8 }}>
                <span style={{ color:'#fff', fontWeight:600, fontSize:'0.85rem' }}>Product</span>
                <a href="#features" style={{ color:'#94a3b8', textDecoration:'none', fontSize:'0.85rem' }}>{c.nav.features}</a>
                <a href="#pricing" style={{ color:'#94a3b8', textDecoration:'none', fontSize:'0.85rem' }}>{c.nav.pricing}</a>
                <Link href="/login" style={{ color:'#94a3b8', textDecoration:'none', fontSize:'0.85rem' }}>{c.nav.login}</Link>
              </div>
              <div style={{ display:'flex', flexDirection:'column', gap:8 }}>
                <span style={{ color:'#fff', fontWeight:600, fontSize:'0.85rem' }}>Legal</span>
                <Link href="/privacy" style={{ color:'#94a3b8', textDecoration:'none', fontSize:'0.85rem' }}>{locale==='nl'?'Privacybeleid':'Privacy Policy'}</Link>
                <Link href="/terms" style={{ color:'#94a3b8', textDecoration:'none', fontSize:'0.85rem' }}>{locale==='nl'?'Algemene voorwaarden':'Terms of Service'}</Link>
              </div>
            </div>
          </div>
          <div style={{ borderTop:'1px solid #1e293b', paddingTop:'1.5rem', display:'flex', justifyContent:'space-between', flexWrap:'wrap', gap:12 }}>
            <p style={{ fontSize:'0.78rem' }}>{c.footer.copy}</p>
            <LangToggle dark />
          </div>
        </div>
      </footer>
    </div>
  );
}
