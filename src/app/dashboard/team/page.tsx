'use client';
import { useState, useEffect, useCallback } from 'react';
import { useI18n } from '@/lib/i18n';

interface Member { id: string; role: 'owner'|'admin'|'member'; joined_at: string; email: string; profiles: { id: string; name: string|null; }; }
interface Invitation { id: string; email: string; role: string; expires_at: string; }
interface Org { id: string; name: string; owner_id: string; subscription_status: string; myRole: string; }

export default function TeamPage() {
  const { locale } = useI18n();
  const nl = locale === 'nl';
  const ui = {
    title:       nl ? 'Team beheren'                    : 'Manage team',
    noOrg:       nl ? 'Je hebt nog geen organisatie.'   : "You don't have an organization yet.",
    createOrg:   nl ? 'Organisatie aanmaken'            : 'Create organization',
    orgName:     nl ? 'Naam van je organisatie'         : 'Organization name',
    creating:    nl ? 'Aanmaken...'                     : 'Creating...',
    members:     nl ? 'Leden'                           : 'Members',
    pending:     nl ? 'Openstaande uitnodigingen'       : 'Pending invitations',
    invite:      nl ? 'Lid uitnodigen'                  : 'Invite member',
    emailPh:     nl ? 'E-mailadres'                     : 'Email address',
    send:        nl ? 'Uitnodiging versturen'           : 'Send invitation',
    sending:     nl ? 'Versturen...'                    : 'Sending...',
    owner:       nl ? 'Eigenaar'                        : 'Owner',
    admin:       nl ? 'Beheerder'                       : 'Admin',
    member:      nl ? 'Lid'                             : 'Member',
    remove:      nl ? 'Verwijderen'                     : 'Remove',
    makeAdmin:   nl ? 'Maak beheerder'                  : 'Make admin',
    makeMember:  nl ? 'Maak lid'                        : 'Make member',
    joined:      nl ? 'Lid sinds'                       : 'Joined',
    expires:     nl ? 'Verloopt'                        : 'Expires',
    copyLink:    nl ? 'Kopieer link'                    : 'Copy link',
    copied:      nl ? 'Gekopieerd!'                     : 'Copied!',
    noMembers:   nl ? 'Geen leden gevonden.'            : 'No members found.',
    noInvites:   nl ? 'Geen openstaande uitnodigingen.' : 'No pending invitations.',
    sentTo:      nl ? '\u2713 Verstuurd naar'            : '\u2713 Sent to',
    unlimited:   nl ? 'Onbeperkte gebruikers'           : 'Unlimited users',
    extBadge:    'Extended',
  };

  const [orgs, setOrgs] = useState<Org[]>([]);
  const [active, setActive] = useState<Org|null>(null);
  const [members, setMembers] = useState<Member[]>([]);
  const [invites, setInvites] = useState<Invitation[]>([]);
  const [myId, setMyId] = useState('');
  const [loading, setLoading] = useState(true);
  const [orgName, setOrgName] = useState('');
  const [creating, setCreating] = useState(false);
  const [email, setEmail] = useState('');
  const [role, setRole] = useState<'admin'|'member'>('member');
  const [sending, setSending] = useState(false);
  const [msg, setMsg] = useState('');
  const [copied, setCopied] = useState('');

  const loadOrgs = useCallback(async () => {
    const r = await fetch('/api/organizations');
    if (r.ok) { const d = await r.json(); setOrgs(d); if (d.length > 0) setActive(d[0]); }
  }, []);

  const loadTeam = useCallback(async (id: string) => {
    const [mr, ir] = await Promise.all([fetch('/api/organizations/'+id+'/members'), fetch('/api/organizations/'+id+'/invite')]);
    if (mr.ok) setMembers(await mr.json());
    if (ir.ok) setInvites(await ir.json());
  }, []);

  useEffect(() => {
    fetch('/api/auth/me').then(r=>r.json()).then(u=>{ if(u?.id) setMyId(u.id); });
    loadOrgs().finally(()=>setLoading(false));
  }, []);

  useEffect(() => { if (active) loadTeam(active.id); }, [active]);

  const createOrg = async () => {
    if (!orgName.trim()) return;
    setCreating(true);
    const r = await fetch('/api/organizations', { method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify({name: orgName}) });
    if (r.ok) { const o = await r.json(); setOrgs([o]); setActive(o); setOrgName(''); }
    setCreating(false);
  };

  const sendInvite = async () => {
    if (!email || !active) return;
    setSending(true); setMsg('');
    const r = await fetch('/api/organizations/'+active.id+'/invite', { method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify({email, role}) });
    const d = await r.json();
    setMsg(r.ok ? ui.sentTo+' '+email : d.error || 'Fout');
    if (r.ok) { setEmail(''); loadTeam(active.id); }
    setSending(false);
  };

  const changeRole = async (uid: string, r: 'admin'|'member') => {
    if (!active) return;
    await fetch('/api/organizations/'+active.id+'/members', { method:'PATCH', headers:{'Content-Type':'application/json'}, body: JSON.stringify({userId:uid, role:r}) });
    loadTeam(active.id);
  };

  const removeMember = async (uid: string) => {
    if (!active) return;
    await fetch('/api/organizations/'+active.id+'/members', { method:'DELETE', headers:{'Content-Type':'application/json'}, body: JSON.stringify({userId:uid}) });
    loadTeam(active.id);
  };

  const copyLink = async (token: string) => {
    await navigator.clipboard.writeText(window.location.origin+'/invite/'+token);
    setCopied(token); setTimeout(()=>setCopied(''), 2000);
  };

  const rl = (r: string) => r==='owner' ? ui.owner : r==='admin' ? ui.admin : ui.member;
  const rc = (r: string) => r==='owner' ? {bg:'rgba(139,92,246,.15)',col:'#a78bfa'} : r==='admin' ? {bg:'rgba(59,130,246,.15)',col:'#93c5fd'} : {bg:'rgba(100,116,139,.15)',col:'#94a3b8'};
  const fmt = (d: string) => new Date(d).toLocaleDateString(nl?'nl-BE':'en-GB', {day:'numeric',month:'short',year:'numeric'});
  const C = { background:'rgba(255,255,255,0.04)', border:'1px solid rgba(255,255,255,0.08)', borderRadius:16, padding:24, marginBottom:20 };
  const I = { padding:'10px 14px', borderRadius:8, background:'rgba(255,255,255,0.06)', border:'1px solid rgba(255,255,255,0.1)', color:'#f1f5f9', fontSize:14, boxSizing:'border-box' as const };
  const canManage = active && ['owner','admin'].includes(active.myRole);

  if (loading) return <div style={{display:'flex',alignItems:'center',justifyContent:'center',minHeight:'60vh',color:'#94a3b8'}}>Laden...</div>;

  return (
    <div style={{maxWidth:720, margin:'0 auto', padding:'32px 16px'}}>
      <h1 style={{fontSize:26, fontWeight:700, color:'#f1f5f9', marginBottom:8}}>{ui.title}</h1>

      {orgs.length === 0 && (
        <div style={C}>
          <p style={{color:'#94a3b8', marginBottom:16, fontSize:14}}>{ui.noOrg}</p>
          <div style={{display:'flex', gap:10, flexWrap:'wrap'}}>
            <input style={{...I, flex:1, minWidth:200}} placeholder={ui.orgName} value={orgName} onChange={e=>setOrgName(e.target.value)} onKeyDown={e=>e.key==='Enter'&&createOrg()} />
            <button onClick={createOrg} disabled={creating||!orgName.trim()} style={{padding:'10px 22px', borderRadius:8, background:'linear-gradient(135deg,#3b82f6,#8b5cf6)', color:'#fff', fontWeight:600, fontSize:14, border:'none', cursor:'pointer', whiteSpace:'nowrap'}}>
              {creating ? ui.creating : ui.createOrg}
            </button>
          </div>
        </div>
      )}

      {orgs.length > 1 && (
        <div style={{display:'flex', gap:8, flexWrap:'wrap', marginBottom:20}}>
          {orgs.map(o => (
            <button key={o.id} onClick={()=>setActive(o)} style={{padding:'6px 14px', borderRadius:20, fontSize:13, fontWeight:600, border:'1px solid', borderColor: active?.id===o.id ? '#3b82f6' : 'rgba(255,255,255,.1)', background: active?.id===o.id ? 'rgba(59,130,246,.15)' : 'transparent', color: active?.id===o.id ? '#93c5fd' : '#94a3b8', cursor:'pointer'}}>
              {o.name}
            </button>
          ))}
        </div>
      )}

      {active && (
        <>
          <div style={{...C, display:'flex', justifyContent:'space-between', alignItems:'center', flexWrap:'wrap', gap:12}}>
            <div>
              <div style={{display:'flex', alignItems:'center', gap:10, marginBottom:4}}>
                <h2 style={{fontSize:18, fontWeight:700, color:'#f1f5f9', margin:0}}>{active.name}</h2>
                <span style={{background:'linear-gradient(135deg,rgba(59,130,246,.2),rgba(139,92,246,.2))', color:'#93c5fd', fontSize:11, fontWeight:700, padding:'2px 8px', borderRadius:999}}>{ui.extBadge}</span>
              </div>
              <p style={{fontSize:13, color:'#64748b', margin:0}}>{members.length} {ui.members.toLowerCase()} · {ui.unlimited}</p>
            </div>
          </div>

          {canManage && (
            <div style={C}>
              <h3 style={{fontSize:15, fontWeight:600, color:'#e2e8f0', marginBottom:14}}>{ui.invite}</h3>
              <div style={{display:'flex', gap:10, flexWrap:'wrap'}}>
                <input style={{...I, flex:1, minWidth:180}} type="email" placeholder={ui.emailPh} value={email} onChange={e=>setEmail(e.target.value)} onKeyDown={e=>e.key==='Enter'&&sendInvite()} />
                <select style={{...I, width:'auto'}} value={role} onChange={e=>setRole(e.target.value as 'admin'|'member')}>
                  <option value="member">{ui.member}</option>
                  <option value="admin">{ui.admin}</option>
                </select>
                <button onClick={sendInvite} disabled={sending||!email} style={{padding:'10px 20px', borderRadius:8, background:'rgba(59,130,246,.15)', border:'1px solid rgba(59,130,246,.3)', color:'#93c5fd', fontWeight:600, fontSize:14, cursor:'pointer', whiteSpace:'nowrap'}}>
                  {sending ? ui.sending : ui.send}
                </button>
              </div>
              {msg && <p style={{fontSize:13, marginTop:10, color: msg.startsWith('\u2713')||msg.startsWith('✓') ? '#34d399' : '#f87171'}}>{msg}</p>}
            </div>
          )}

          <div style={C}>
            <h3 style={{fontSize:15, fontWeight:600, color:'#e2e8f0', marginBottom:14}}>{ui.members} ({members.length})</h3>
            {members.length === 0 ? <p style={{color:'#64748b', fontSize:14}}>{ui.noMembers}</p> : (
              <div style={{display:'flex', flexDirection:'column', gap:10}}>
                {members.map(m => {
                  const {bg, col} = rc(m.role);
                  const isSelf = m.profiles?.id === myId;
                  const initials = (m.profiles?.name||m.email||'?')[0].toUpperCase();
                  return (
                    <div key={m.id} style={{display:'flex', alignItems:'center', justifyContent:'space-between', padding:'12px 14px', background:'rgba(255,255,255,0.03)', borderRadius:10, flexWrap:'wrap', gap:8}}>
                      <div style={{display:'flex', alignItems:'center', gap:12}}>
                        <div style={{width:36, height:36, borderRadius:'50%', background:'linear-gradient(135deg,#3b82f6,#8b5cf6)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:14, fontWeight:700, color:'#fff', flexShrink:0}}>{initials}</div>
                        <div>
                          <p style={{fontSize:14, fontWeight:600, color:'#f1f5f9', margin:0}}>{m.profiles?.name||m.email}{isSelf ? ' (jij)' : ''}</p>
                          <p style={{fontSize:12, color:'#64748b', margin:0}}>{m.email} · {ui.joined} {fmt(m.joined_at)}</p>
                        </div>
                      </div>
                      <div style={{display:'flex', alignItems:'center', gap:8, flexWrap:'wrap'}}>
                        <span style={{background:bg, color:col, fontSize:11, fontWeight:700, padding:'3px 10px', borderRadius:999}}>{rl(m.role)}</span>
                        {canManage && !isSelf && m.role !== 'owner' && (
                          <>
                            <button onClick={()=>changeRole(m.profiles.id, m.role==='admin'?'member':'admin')} style={{fontSize:12, color:'#64748b', background:'none', border:'1px solid rgba(255,255,255,.1)', borderRadius:6, padding:'3px 8px', cursor:'pointer'}}>
                              {m.role==='admin' ? ui.makeMember : ui.makeAdmin}
                            </button>
                            <button onClick={()=>removeMember(m.profiles.id)} style={{fontSize:12, color:'#f87171', background:'none', border:'1px solid rgba(239,68,68,.2)', borderRadius:6, padding:'3px 8px', cursor:'pointer'}}>
                              {ui.remove}
                            </button>
                          </>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {canManage && invites.length > 0 && (
            <div style={C}>
              <h3 style={{fontSize:15, fontWeight:600, color:'#e2e8f0', marginBottom:14}}>{ui.pending}</h3>
              <div style={{display:'flex', flexDirection:'column', gap:8}}>
                {invites.map(inv => (
                  <div key={inv.id} style={{display:'flex', alignItems:'center', justifyContent:'space-between', padding:'10px 14px', background:'rgba(255,255,255,0.03)', borderRadius:8, flexWrap:'wrap', gap:8}}>
                    <div>
                      <p style={{fontSize:13, color:'#e2e8f0', margin:0}}>{inv.email}</p>
                      <p style={{fontSize:11, color:'#64748b', margin:0}}>{rl(inv.role)} · {ui.expires} {fmt(inv.expires_at)}</p>
                    </div>
                    <button onClick={()=>copyLink(inv.id)} style={{fontSize:12, color:'#93c5fd', background:'rgba(59,130,246,.1)', border:'1px solid rgba(59,130,246,.2)', borderRadius:6, padding:'4px 10px', cursor:'pointer'}}>
                      {copied===inv.id ? ui.copied : ui.copyLink}
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
