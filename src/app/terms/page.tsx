import type { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Gebruiksvoorwaarden',
  description: 'Lees de algemene gebruiksvoorwaarden van Pure Project (pureexcellence.be).',
};

export default function TermsPage() {
  const updated = '16 april 2025';
  return (
    <div style={{ background: '#0a0f1e', minHeight: '100vh', color: '#e2e8f0' }}>
      <nav style={{ borderBottom: '1px solid rgba(255,255,255,0.07)', padding: '16px 32px', display: 'flex', alignItems: 'center', gap: '16px' }}>
        <Link href="/" style={{ display: 'flex', alignItems: 'center', gap: '10px', textDecoration: 'none' }}>
          <div style={{ width: '32px', height: '32px', background: 'linear-gradient(135deg,#3b82f6,#8b5cf6)', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '16px' }}>⬡</div>
          <span style={{ fontWeight: '800', color: '#f1f5f9' }}>Pure Project</span>
        </Link>
        <span style={{ color: '#475569', fontSize: '13px', marginLeft: '8px' }}>/ Gebruiksvoorwaarden</span>
      </nav>

      <div style={{ maxWidth: '800px', margin: '0 auto', padding: '48px 32px' }}>
        <h1 style={{ fontSize: '32px', fontWeight: '800', color: '#f1f5f9', marginBottom: '8px' }}>Gebruiksvoorwaarden</h1>
        <p style={{ color: '#64748b', marginBottom: '40px', fontSize: '14px' }}>Versie 1.0 — Laatst bijgewerkt: {updated}</p>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '32px', lineHeight: '1.8', color: '#94a3b8', fontSize: '15px' }}>

          <section>
            <h2 style={{ color: '#f1f5f9', fontSize: '20px', fontWeight: '700', marginBottom: '12px' }}>1. Toepassingsgebied</h2>
            <p>Deze gebruiksvoorwaarden ("Voorwaarden") zijn van toepassing op het gebruik van Pure Project, een SaaS-platform aangeboden door <strong style={{ color: '#94a3b8' }}>Pure Excellence BV</strong>, bereikbaar via pureexcellence.be ("het Platform"). Door het Platform te gebruiken, gaat u akkoord met deze Voorwaarden.</p>
          </section>

          <section>
            <h2 style={{ color: '#f1f5f9', fontSize: '20px', fontWeight: '700', marginBottom: '12px' }}>2. Beschrijving van de dienst</h2>
            <p>Pure Project is een webgebaseerde software-as-a-service (SaaS) oplossing voor projectmanagement, ISO 9001 kwaliteitsmanagement, CAPA-beheer en ISO 22301 business continuity management. Het Platform is beschikbaar via webbrowsers op desktop- en mobiele apparaten.</p>
          </section>

          <section>
            <h2 style={{ color: '#f1f5f9', fontSize: '20px', fontWeight: '700', marginBottom: '12px' }}>3. Account en toegang</h2>
            <ul style={{ paddingLeft: '20px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <li>U bent verantwoordelijk voor de vertrouwelijkheid van uw inloggegevens</li>
              <li>U mag uw account niet delen met derden buiten uw organisatie</li>
              <li>U bent minimaal 18 jaar oud of handelt namens een rechtspersoon</li>
              <li>Gebruik door minderjarigen zonder toestemming van ouder/voogd is niet toegestaan</li>
              <li>Bij vermoeden van ongeautoriseerde toegang dient u ons onmiddellijk te informeren via support@pureexcellence.be</li>
            </ul>
          </section>

          <section>
            <h2 style={{ color: '#f1f5f9', fontSize: '20px', fontWeight: '700', marginBottom: '12px' }}>4. Abonnementen en betaling</h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <div style={{ padding: '16px', background: 'rgba(59,130,246,0.08)', borderRadius: '10px', border: '1px solid rgba(59,130,246,0.2)' }}>
                <div style={{ color: '#60a5fa', fontWeight: '700', marginBottom: '8px' }}>Gratis proefperiode</div>
                <p style={{ margin: 0, fontSize: '14px' }}>Nieuwe gebruikers kunnen Pure Project 14 dagen gratis uitproberen zonder creditcard. Na de proefperiode is een betaald abonnement vereist om toegang te behouden.</p>
              </div>
              <div style={{ padding: '16px', background: 'rgba(255,255,255,0.03)', borderRadius: '10px', border: '1px solid rgba(255,255,255,0.06)' }}>
                <div style={{ color: '#f1f5f9', fontWeight: '700', marginBottom: '8px' }}>Maandabonnement — € 23,78 / maand</div>
                <p style={{ margin: 0, fontSize: '14px' }}>Automatische maandelijkse verlenging. U kunt op elk moment opzeggen via uw accountinstellingen. Bij opzegging behoudt u toegang tot het einde van de betaalde periode.</p>
              </div>
              <div style={{ padding: '16px', background: 'rgba(255,255,255,0.03)', borderRadius: '10px', border: '1px solid rgba(255,255,255,0.06)' }}>
                <div style={{ color: '#f1f5f9', fontWeight: '700', marginBottom: '8px' }}>Jaarabonnement — € 250,00 / jaar</div>
                <p style={{ margin: 0, fontSize: '14px' }}>Jaarlijkse verlenging. Geen terugbetaling bij tussentijdse opzegging, tenzij anders overeengekomen of wettelijk verplicht.</p>
              </div>
            </div>
            <p style={{ marginTop: '16px' }}>Alle prijzen zijn exclusief btw (21% BE/NL). Betalingen worden verwerkt via <strong style={{ color: '#94a3b8' }}>Stripe</strong>. Bij niet-betaling behouden wij ons het recht voor de toegang tot het Platform te beperken of op te schorten.</p>
          </section>

          <section>
            <h2 style={{ color: '#f1f5f9', fontSize: '20px', fontWeight: '700', marginBottom: '12px' }}>5. Herroepingsrecht (consumenten)</h2>
            <p>Indien u het Platform als consument (niet zakelijk) afneemt, heeft u het recht de overeenkomst te herroepen binnen <strong style={{ color: '#94a3b8' }}>14 kalenderdagen</strong> na het afsluiten van het abonnement, zonder opgave van reden. Dit recht vervalt indien de dienstverlening met uw uitdrukkelijke toestemming vóór het verstrijken van de herroepingstermijn volledig is uitgevoerd. Stuur uw herroepingsverzoek naar support@pureexcellence.be.</p>
          </section>

          <section>
            <h2 style={{ color: '#f1f5f9', fontSize: '20px', fontWeight: '700', marginBottom: '12px' }}>6. Toegestaan gebruik</h2>
            <p>Het is niet toegestaan om:</p>
            <ul style={{ marginTop: '12px', paddingLeft: '20px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <li>Het Platform te gebruiken voor illegale activiteiten of in strijd met de openbare orde</li>
              <li>Het Platform te reverse-engineeren, kopiëren of na te maken</li>
              <li>Beveiligingsmaatregelen te omzeilen of te testen zonder schriftelijke toestemming</li>
              <li>Kwaadaardige code, virussen of malware te uploaden</li>
              <li>Andere gebruikers te hinderen of het Platform te overbelasten</li>
              <li>Gegevens van andere organisaties te raadplegen zonder toestemming</li>
            </ul>
          </section>

          <section>
            <h2 style={{ color: '#f1f5f9', fontSize: '20px', fontWeight: '700', marginBottom: '12px' }}>7. Eigendom van gegevens</h2>
            <p>U blijft te allen tijde eigenaar van de gegevens die u invoert in het Platform ("Klantdata"). Wij verwerken deze gegevens uitsluitend in uw opdracht als verwerker conform de AVG. U kunt uw data op elk moment exporteren via de ingebouwde exportfuncties (Excel, PDF).</p>
          </section>

          <section>
            <h2 style={{ color: '#f1f5f9', fontSize: '20px', fontWeight: '700', marginBottom: '12px' }}>8. Beschikbaarheid en SLA</h2>
            <p>Wij streven naar een beschikbaarheid van <strong style={{ color: '#94a3b8' }}>99,5% per maand</strong>, exclusief geplande onderhoudsmomenten. Gepland onderhoud wordt minstens 24 uur op voorhand gecommuniceerd. Wij zijn niet aansprakelijk voor schade door overmacht, storingen bij derde partijen (Supabase, Vercel) of cybersaanvallen.</p>
          </section>

          <section>
            <h2 style={{ color: '#f1f5f9', fontSize: '20px', fontWeight: '700', marginBottom: '12px' }}>9. Aansprakelijkheidsbeperking</h2>
            <p>De aansprakelijkheid van Pure Excellence BV is beperkt tot het bedrag dat u in de drie maanden voorafgaand aan de schadeveroorzakende gebeurtenis heeft betaald. Wij zijn niet aansprakelijk voor indirecte schade, gevolgschade of gederfde winst.</p>
          </section>

          <section>
            <h2 style={{ color: '#f1f5f9', fontSize: '20px', fontWeight: '700', marginBottom: '12px' }}>10. Intellectueel eigendom</h2>
            <p>Alle intellectuele eigendomsrechten op het Platform (software, ontwerp, logo's, teksten) berusten bij Pure Excellence BV of haar licentiegevers. U ontvangt een niet-exclusief, niet-overdraagbaar gebruiksrecht voor de duur van uw abonnement.</p>
          </section>

          <section>
            <h2 style={{ color: '#f1f5f9', fontSize: '20px', fontWeight: '700', marginBottom: '12px' }}>11. Toepasselijk recht en geschillenbeslechting</h2>
            <p>Deze Voorwaarden worden beheerst door het <strong style={{ color: '#94a3b8' }}>Belgisch recht</strong>. Bij geschillen gelden de rechtbanken van het gerechtelijk arrondissement Antwerpen als bevoegd, tenzij u als consument de voorkeur geeft aan de rechtbank van uw woonplaats. Consumenten kunnen ook terecht bij het <strong style={{ color: '#60a5fa' }}>Online Dispute Resolution platform</strong> van de Europese Commissie: <a href="https://ec.europa.eu/consumers/odr" target="_blank" rel="noopener" style={{ color: '#60a5fa' }}>ec.europa.eu/consumers/odr</a>.</p>
          </section>

          <section>
            <h2 style={{ color: '#f1f5f9', fontSize: '20px', fontWeight: '700', marginBottom: '12px' }}>12. Wijzigingen</h2>
            <p>Wij behouden ons het recht voor deze Voorwaarden te wijzigen. Bij materiële wijzigingen informeren wij u minstens 30 dagen op voorhand via e-mail. Indien u niet akkoord gaat met de nieuwe Voorwaarden, kunt u uw abonnement opzeggen voor de ingangsdatum van de wijziging.</p>
          </section>

        </div>

        <div style={{ marginTop: '48px', paddingTop: '24px', borderTop: '1px solid rgba(255,255,255,0.07)', display: 'flex', gap: '24px', flexWrap: 'wrap' }}>
          <Link href="/privacy" style={{ color: '#475569', fontSize: '13px', textDecoration: 'none' }}>Privacybeleid</Link>
          <Link href="/" style={{ color: '#475569', fontSize: '13px', textDecoration: 'none' }}>Terug naar home</Link>
          <Link href="/login" style={{ color: '#60a5fa', fontSize: '13px', textDecoration: 'none' }}>Inloggen →</Link>
        </div>
      </div>
    </div>
  );
}
