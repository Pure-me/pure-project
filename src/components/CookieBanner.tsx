'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

export default function CookieBanner() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const consent = localStorage.getItem('cookie-consent');
    if (!consent) setVisible(true);
  }, []);

  const accept = () => {
    localStorage.setItem('cookie-consent', 'accepted');
    setVisible(false);
  };

  if (!visible) return null;

  return (
    <div style={{
      position: 'fixed', bottom: '20px', left: '50%', transform: 'translateX(-50%)',
      zIndex: 9999, width: 'min(95vw, 640px)',
      background: 'rgba(15,23,42,0.97)',
      border: '1px solid rgba(255,255,255,0.1)',
      borderRadius: '16px',
      padding: '20px 24px',
      backdropFilter: 'blur(20px)',
      boxShadow: '0 24px 64px rgba(0,0,0,0.6)',
      display: 'flex', alignItems: 'center', gap: '16px', flexWrap: 'wrap',
    }}>
      <span style={{ fontSize: '22px' }}>🍪</span>
      <p style={{ flex: 1, margin: 0, fontSize: '13px', color: '#94a3b8', lineHeight: '1.6', minWidth: '200px' }}>
        Wij gebruiken enkel functionele cookies die noodzakelijk zijn voor de werking van de applicatie. Geen tracking, geen advertenties.{' '}
        <Link href="/privacy" style={{ color: '#60a5fa', textDecoration: 'none' }}>Privacybeleid</Link>
      </p>
      <button onClick={accept} style={{
        padding: '9px 22px', background: 'linear-gradient(135deg,#3b82f6,#2563eb)',
        border: 'none', borderRadius: '9px', color: 'white',
        fontSize: '13px', fontWeight: '700', cursor: 'pointer', flexShrink: 0,
      }}>
        Begrepen
      </button>
    </div>
  );
}
