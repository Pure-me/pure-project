'use client';
import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';

export default function InvitePage() {
  const { token } = useParams() as { token: string };
  const router = useRouter();
  const [step, setStep] = useState<'loading'|'ready'|'joining'|'success'|'error'>('loading');
  const [msg, setMsg] = useState('');
  const [orgName, setOrgName] = useState('');
  const [loggedIn, setLoggedIn] = useState(false);

  useEffect(() => {
    fetch('/api/auth/me').then(r=>r.json()).then(u=>{ setLoggedIn(!!u?.id); setStep('ready'); }).catch(()=>setStep('ready'));
  }, []);

  const join = async () => {
    setStep('joining');
    const r = await fetch('/api/organizations/join', { method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify({token}) });
    const d = await r.json();
    if (r.ok) { setOrgName(d.organizationName); setStep('success'); setTimeout(()=>router.push('/dashboard/team'), 2000); }
    else { setMsg(d.error||'Er is een fout opgetreden'); setStep('error'); }
  };

  return (
    <div style={{minHeight:'100vh', background:'linear-gradient(135deg,#0f172a,#1e293b)', display:'flex', alignItems:'center', justifyContent:'center', padding:24}}>
      <div style={{background:'rgba(255,255,255,0.05)', border:'1px solid rgba(255,255,255,0.1)', borderRadius:20, padding:'40px 36px', maxWidth:420, width:'100%', textAlign:'center'}}>
        <div style={{fontSize:40, marginBottom:12}}>⚡</div>
        <h1 style={{fontSize:22, fontWeight:800, color:'#f1f5f9', marginBottom:20}}>Pure Project</h1>
        {step==='loading' && <p style={{color:'#94a3b8'}}>Laden...</p>}
        {step==='ready' && !loggedIn && (
          <>
            <p style={{color:'#94a3b8', marginBottom:24, lineHeight:1.6}}>Je bent uitgenodigd voor een Pure Project team.<br/>Log eerst in of maak een account aan.</p>
            <Link href={'/login?redirect=/invite/'+token} style={{display:'inline-block', background:'linear-gradient(135deg,#3b82f6,#8b5cf6)', color:'#fff', textDecoration:'none', padding:'12px 28px', borderRadius:10, fontWeight:700, fontSize:15}}>Inloggen / Registreren</Link>
          </>
        )}
        {step==='ready' && loggedIn && (
          <>
            <p style={{color:'#94a3b8', marginBottom:24, lineHeight:1.6}}>Je bent uitgenodigd voor een Pure Project team.<br/>Klik hieronder om te accepteren.</p>
            <button onClick={join} style={{width:'100%', padding:'12px 24px', background:'linear-gradient(135deg,#3b82f6,#8b5cf6)', color:'#fff', border:'none', borderRadius:10, fontWeight:700, fontSize:15, cursor:'pointer'}}>Uitnodiging accepteren</button>
          </>
        )}
        {step==='joining' && <p style={{color:'#94a3b8'}}>Bezig met aansluiten...</p>}
        {step==='success' && (
          <>
            <div style={{fontSize:36, marginBottom:12}}>✅</div>
            <p style={{color:'#34d399', fontWeight:700, marginBottom:8}}>Welkom bij {orgName}!</p>
            <p style={{color:'#64748b', fontSize:13}}>Je wordt doorgestuurd...</p>
          </>
        )}
        {step==='error' && (
          <>
            <div style={{fontSize:36, marginBottom:12}}>❌</div>
            <p style={{color:'#f87171', marginBottom:16}}>{msg}</p>
            <Link href="/dashboard" style={{color:'#93c5fd', fontSize:14}}>Ga naar dashboard</Link>
          </>
        )}
      </div>
    </div>
  );
}
