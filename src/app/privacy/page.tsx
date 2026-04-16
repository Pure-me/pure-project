import type { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Privacybeleid',
  description: 'Lees hoe Pure Project (pureexcellence.be) omgaat met uw persoonsgegevens conform de AVG/GDPR.',
};

export default function PrivacyPage() {
  const updated = '16 april 2025';
  return (
    <div style={{ background: '#0a0f1e', minHeight: '100vh', color: '#e2e8f0' }}>
      {/* Nav */}
      <nav style={{ borderBottom: '1px solid rgba(255,255,255,0.07)', padding: '16px 32px', display: 'flex', alignItems: 'center', gap: '16px' }}>
        <Link href="/" style={{ display: 'flex', alignItems: 'center', gap: '10px', textDecoration: 'none' }}>
          <div style={{ width: '32px', height: '32px', background: 'linear-gradient(135deg,#3b82f6,#8b5cf6)', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '16px' }}>⬡</div>
          <span style={{ fontWeight: '800', color: '#f1f5f9' }}>Pure Project</span>
        </Link>
        <span style={{ color: '#475569', fontSize: '13px', marginLeft: '8px' }}>/ Privacybeleid</span>
      </nav>

      <div style={{ maxWidth: '800px', margin: '0 auto', padding: '48px 32px' }}>
        <h1 style={{ fontSize: '32px', fontWeight: '800', color: '#f1f5f9', marginBottom: '8px' }}>Privacybeleid</h1>
        <p style={{ color: '#64748b', marginBottom: '40px', fontSize: '14px' }}>Laatst bijgewerkt: {updated}</p>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '32px', lineHeight: '1.8', color: '#94a3b8', fontSize: '15px' }}>

          <section>
            <h2 style={{ color: '#f1f5f9', fontSize: '20px', fontWeight: '700', marginBottom: '12px' }}>1. Verwerkingsverantwoordelijke</h2>
            <p>Pure Excellence BV ("wij", "ons" of "onze") is de verwerkingsverantwoordelijke voor de verwerking van uw persoonsgegevens via het platform Pure Project, bereikbaar via <strong style={{ color: '#60a5fa' }}>pureexcellence.be</strong>.</p>
            <p style={{ marginTop: '12px' }}><strong style={{ color: '#94a3b8' }}>Contactgegevens:</strong><br />
            Pure Excellence BV<br />
            E-mail: privacy@pureexcellence.be<br />
            Website: https://pureexcellence.be</p>
          </section>

          <section>
            <h2 style={{ color: '#f1f5f9', fontSize: '20px', fontWeight: '700', marginBottom: '12px' }}>2. Welke persoonsgegevens verzamelen wij?</h2>
            <p>Wij verwerken de volgende categorieën persoonsgegevens:</p>
            <ul style={{ marginTop: '12px', paddingLeft: '20px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <li><strong style={{ color: '#94a3b8' }}>Accountgegevens:</strong> naam, e-mailadres, wachtwoord (versleuteld), functie/rol</li>
              <li><strong style={{ color: '#94a3b8' }}>Gebruiksgegevens:</strong> inlogactiviteit, taalvoorkeur, functies die u gebruikt</li>
              <li><strong style={{ color: '#94a3b8' }}>Bedrijfsgegevens:</strong> projecten, taken, kwaliteitsregistraties en BCM-documenten die u aanmaakt</li>
              <li><strong style={{ color: '#94a3b8' }}>Betalingsgegevens:</strong> worden uitsluitend verwerkt door Stripe (onze betaalverwerker); wij bewaren geen betaalkaartgegevens</li>
              <li><strong style={{ color: '#94a3b8' }}>Technische gegevens:</strong> IP-adres, browsertype, tijdzone — enkel voor beveiliging en foutopsporing</li>
            </ul>
          </section>

          <section>
            <h2 style={{ color: '#f1f5f9', fontSize: '20px', fontWeight: '700', marginBottom: '12px' }}>3. Doelen en rechtsgronden voor verwerking</h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {[
                { doel: 'Accountbeheer en authenticatie', grond: 'Uitvoering overeenkomst (art. 6 lid 1 b AVG)' },
                { doel: 'Levering van de software (SaaS)', grond: 'Uitvoering overeenkomst (art. 6 lid 1 b AVG)' },
                { doel: 'Facturatie en betalingsverwerking', grond: 'Uitvoering overeenkomst + wettelijke verplichting (art. 6 lid 1 b & c AVG)' },
                { doel: 'Klantenservice en technische ondersteuning', grond: 'Gerechtvaardigd belang (art. 6 lid 1 f AVG)' },
                { doel: 'Beveiligingsmonitoring en misbruikpreventie', grond: 'Gerechtvaardigd belang (art. 6 lid 1 f AVG)' },
                { doel: 'Product- en dienstverbetering (geanonimiseerde statistieken)', grond: 'Gerechtvaardigd belang (art. 6 lid 1 f AVG)' },
              ].map(item => (
                <div key={item.doel} style={{ padding: '14px 16px', background: 'rgba(255,255,255,0.03)', borderRadius: '10px', border: '1px solid rgba(255,255,255,0.06)' }}>
                  <div style={{ color: '#f1f5f9', fontWeight: '600', fontSize: '14px' }}>{item.doel}</div>
                  <div style={{ color: '#64748b', fontSize: '13px', marginTop: '4px' }}>Rechtsgrond: {item.grond}</div>
                </div>
              ))}
            </div>
          </section>

          <section>
            <h2 style={{ color: '#f1f5f9', fontSize: '20px', fontWeight: '700', marginBottom: '12px' }}>4. Bewaartermijnen</h2>
            <p>Wij bewaren uw persoonsgegevens niet langer dan noodzakelijk:</p>
            <ul style={{ marginTop: '12px', paddingLeft: '20px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <li><strong style={{ color: '#94a3b8' }}>Accountgegevens:</strong> zolang uw account actief is + 30 dagen na verwijderingsverzoek</li>
              <li><strong style={{ color: '#94a3b8' }}>Projectdata:</strong> zolang uw abonnement actief is + 60 dagen na beëindiging (exportmogelijkheid)</li>
              <li><strong style={{ color: '#94a3b8' }}>Factuurgegevens:</strong> 7 jaar (Belgische boekhoudkundige bewaarplicht)</li>
              <li><strong style={{ color: '#94a3b8' }}>Logbestanden:</strong> maximaal 90 dagen</li>
            </ul>
          </section>

          <section>
            <h2 style={{ color: '#f1f5f9', fontSize: '20px', fontWeight: '700', marginBottom: '12px' }}>5. Doorgifte aan derden</h2>
            <p>Wij delen uw gegevens uitsluitend met de volgende verwerkers, telkens op basis van een verwerkersovereenkomst:</p>
            <ul style={{ marginTop: '12px', paddingLeft: '20px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <li><strong style={{ color: '#94a3b8' }}>Supabase Inc.</strong> (database & authenticatie) — servers in EU (Frankfurt)</li>
              <li><strong style={{ color: '#94a3b8' }}>Vercel Inc.</strong> (hosting & CDN) — EU-regio actief</li>
              <li><strong style={{ color: '#94a3b8' }}>Stripe Inc.</strong> (betalingsverwerking) — PCI-DSS Level 1 gecertificeerd</li>
            </ul>
            <p style={{ marginTop: '12px' }}>Wij verkopen uw gegevens nooit aan derden en gebruiken ze niet voor advertentiedoeleinden.</p>
          </section>

          <section>
            <h2 style={{ color: '#f1f5f9', fontSize: '20px', fontWeight: '700', marginBottom: '12px' }}>6. Uw rechten (AVG/GDPR)</h2>
            <p>U heeft de volgende rechten met betrekking tot uw persoonsgegevens:</p>
            <ul style={{ marginTop: '12px', paddingLeft: '20px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <li><strong style={{ color: '#94a3b8' }}>Recht op inzage:</strong> u kunt opvragen welke gegevens wij van u verwerken</li>
              <li><strong style={{ color: '#94a3b8' }}>Recht op rectificatie:</strong> u kunt onjuiste gegevens laten corrigeren</li>
              <li><strong style={{ color: '#94a3b8' }}>Recht op verwijdering ("recht om vergeten te worden"):</strong> u kunt vragen uw gegevens te wissen</li>
              <li><strong style={{ color: '#94a3b8' }}>Recht op beperking van verwerking:</strong> u kunt de verwerking tijdelijk laten stopzetten</li>
              <li><strong style={{ color: '#94a3b8' }}>Recht op gegevensoverdraagbaarheid:</strong> u kunt uw data exporteren in JSON of Excel-formaat</li>
              <li><strong style={{ color: '#94a3b8' }}>Recht van bezwaar:</strong> u kunt bezwaar maken tegen verwerking op basis van gerechtvaardigd belang</li>
            </ul>
            <p style={{ marginTop: '16px' }}>Richt uw verzoek aan <strong style={{ color: '#60a5fa' }}>privacy@pureexcellence.be</strong>. Wij reageren binnen 30 dagen. U heeft ook het recht een klacht in te dienen bij de <strong style={{ color: '#60a5fa' }}>Gegevensbeschermingsautoriteit (GBA)</strong>: <a href="https://www.gegevensbeschermingsautoriteit.be" target="_blank" rel="noopener" style={{ color: '#60a5fa' }}>www.gegevensbeschermingsautoriteit.be</a>.</p>
          </section>

          <section>
            <h2 style={{ color: '#f1f5f9', fontSize: '20px', fontWeight: '700', marginBottom: '12px' }}>7. Cookies</h2>
            <p>Wij gebruiken uitsluitend functionele cookies die noodzakelijk zijn voor de werking van de applicatie (sessiebeheer). Wij plaatsen geen tracking- of advertentiecookies.</p>
          </section>

          <section>
            <h2 style={{ color: '#f1f5f9', fontSize: '20px', fontWeight: '700', marginBottom: '12px' }}>8. Beveiliging</h2>
            <p>Wij nemen passende technische en organisatorische maatregelen om uw gegevens te beschermen, waaronder:</p>
            <ul style={{ marginTop: '12px', paddingLeft: '20px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <li>Versleuteling van gegevens in transit (TLS 1.3) en in rust (AES-256)</li>
              <li>Wachtwoorden worden nooit in leesbare vorm opgeslagen (bcrypt hashing)</li>
              <li>Strikte toegangscontrole via rollen (admin / manager / lid)</li>
              <li>Regelmatige back-ups in geografisch verspreide datacentra</li>
            </ul>
          </section>

          <section>
            <h2 style={{ color: '#f1f5f9', fontSize: '20px', fontWeight: '700', marginBottom: '12px' }}>9. Wijzigingen aan dit beleid</h2>
            <p>Wij kunnen dit privacybeleid periodiek bijwerken. Bij materiële wijzigingen informeren wij u via e-mail of een melding in de applicatie minstens 14 dagen voor de wijziging van kracht wordt.</p>
          </section>

        </div>

        {/* Footer links */}
        <div style={{ marginTop: '48px', paddingTop: '24px', borderTop: '1px solid rgba(255,255,255,0.07)', display: 'flex', gap: '24px', flexWrap: 'wrap' }}>
          <Link href="/terms" style={{ color: '#475569', fontSize: '13px', textDecoration: 'none' }}>Gebruiksvoorwaarden</Link>
          <Link href="/" style={{ color: '#475569', fontSize: '13px', textDecoration: 'none' }}>Terug naar home</Link>
          <Link href="/login" style={{ color: '#60a5fa', fontSize: '13px', textDecoration: 'none' }}>Inloggen →</Link>
        </div>
      </div>
    </div>
  );
}
