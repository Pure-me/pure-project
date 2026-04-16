'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import ExportBar from '@/components/ExportBar';
import { useI18n } from '@/lib/i18n';

interface CAPA {
  id: string;
  shortId: string;
  stage: string;
  status: string;
  initiationDate: string;
  initiatedByName: string;
  department: string;
  source: string;
  nonconformityDescription: string;
  ownerName: string;
  planDueDate: string;
  closureDate?: string;
  actionPlanType?: string;
  actions?: Array<{ status: string; dueDate: string }>;
  verificationChecks?: Array<{ verdict?: string }>;
  isSuccessful?: boolean;
}

const SOURCE_LABELS: Record<string, string> = {
  customer_complaint: '👥 Klachten klant',
  external_audit: '🔍 Externe audit',
  external_supplier: '🚚 Externe leverancier',
  incident: '⚠️ Incident',
  internal_audit: '📋 Interne audit',
  management_review: '📊 Management review',
  process_issue: '⚙️ Procesprobleem',
  reportable_event: '📣 Meldplichtig event',
  other: '📌 Ander',
};

const STAGE_LABELS: Record<string, string> = {
  initiation: 'Initiatie',
  risk_assessment: 'Risico-analyse',
  correction: 'Correctie',
  rca: 'Oorzaakanalyse',
  action_plan: 'Actieplan',
  verification: 'Verificatie',
  closure: 'Afsluiting',
};

const STATUS_COLORS: Record<string, string> = {
  open: '#3b82f6',
  in_progress: '#f59e0b',
  verification: '#a78bfa',
  closed: '#10b981',
  unsuccessful: '#f43f5e',
};

const STAGE_ORDER = ['initiation', 'risk_assessment', 'correction', 'rca', 'action_plan', 'verification', 'closure'];

function daysDiff(dateStr?: string): number | null {
  if (!dateStr) return null;
  return Math.ceil((new Date(dateStr).getTime() - Date.now()) / 86400000);
}

function StageBar({ stage }: { stage: string }) {
  const idx = STAGE_ORDER.indexOf(stage);
  return (
    <div style={{ display: 'flex', gap: '2px', alignItems: 'center' }}>
      {STAGE_ORDER.map((s, i) => (
        <div key={s} style={{
          height: '4px', flex: 1, borderRadius: '2px',
          background: i <= idx ? '#3b82f6' : 'rgba(255,255,255,0.1)',
        }} title={STAGE_LABELS[s]} />
      ))}
    </div>
  );
}

export default function CAPAPage() {
  const router = useRouter();
  const { locale } = useI18n();
  const [capas, setCapas] = useState<CAPA[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('all');
  const [sourceFilter, setSourceFilter] = useState('all');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [creating, setCreating] = useState(false);
  const [form, setForm] = useState({
    initiatedByName: '', initiatedByJobTitle: '',
    department: '', scope: '',
    source: 'internal_audit', sourceOtherDescription: '',
    nonconformityDescription: '',
    ownerName: '', ownerJobTitle: '',
    planDueDate: '',
  });

  useEffect(() => {
    fetch('/api/capa').then(r => r.json()).then(data => {
      setCapas(Array.isArray(data) ? data : []);
      setLoading(false);
    });
    // Pre-fill plan due date: 15 working days
    const d = new Date();
    let w = 0;
    while (w < 15) { d.setDate(d.getDate() + 1); if (d.getDay() !== 0 && d.getDay() !== 6) w++; }
    setForm(f => ({ ...f, planDueDate: d.toISOString().split('T')[0] }));
  }, []);

  const filtered = capas.filter(c => {
    if (statusFilter !== 'all' && c.status !== statusFilter) return false;
    if (sourceFilter !== 'all' && c.source !== sourceFilter) return false;
    return true;
  });

  const stats = {
    total: capas.length,
    open: capas.filter(c => c.status !== 'closed' && c.status !== 'unsuccessful').length,
    overdue: capas.filter(c => {
      if (c.status === 'closed' || c.status === 'unsuccessful') return false;
      const d = daysDiff(c.planDueDate);
      return d !== null && d < 0;
    }).length,
    avgDays: capas.filter(c => c.closureDate).length > 0
      ? Math.round(capas.filter(c => c.closureDate).reduce((sum, c) => {
          return sum + Math.ceil((new Date(c.closureDate!).getTime() - new Date(c.initiationDate).getTime()) / 86400000);
        }, 0) / capas.filter(c => c.closureDate).length)
      : null,
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setCreating(true);
    const res = await fetch('/api/capa', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form),
    });
    if (res.ok) {
      const capa = await res.json();
      router.push(`/dashboard/capa/${capa.id}`);
    }
    setCreating(false);
  };

  return (
    <div style={{ maxWidth: '1200px' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '28px' }}>
        <div>
          <h1 style={{ fontSize: '24px', fontWeight: '800', color: '#f1f5f9', margin: '0 0 4px' }}>CAPA</h1>
          <p style={{ color: '#64748b', margin: 0, fontSize: '14px' }}>Corrective & Preventive Action — conform P04 BENE-QESH</p>
        </div>
        <button className="btn-primary" onClick={() => setShowCreateModal(true)}>+ Nieuwe CAPA</button>
      </div>

      {/* KPI cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: '16px', marginBottom: '28px' }}>
        {[
          { label: 'Totaal actief', value: stats.open, color: '#3b82f6', icon: '📋', sub: `van ${stats.total} totaal` },
          { label: 'Te laat', value: stats.overdue, color: '#f43f5e', icon: '⏰', sub: 'plan deadline overschreden', alert: stats.overdue > 0 },
          { label: 'Gemiddelde doorlooptijd', value: stats.avgDays !== null ? `${stats.avgDays}d` : '—', color: '#a78bfa', icon: '📅', sub: 'tot afsluiting' },
          { label: 'Succesvol gesloten', value: capas.filter(c => c.status === 'closed' && c.isSuccessful !== false).length, color: '#10b981', icon: '✅', sub: 'van alle afgesloten' },
        ].map((stat, i) => (
          <div key={i} className="glass" style={{ padding: '18px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <div>
                <div style={{ fontSize: '11px', color: '#64748b', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '6px' }}>{stat.label}</div>
                <div style={{ fontSize: '32px', fontWeight: '800', color: stat.color, lineHeight: 1 }}>{stat.value}</div>
                <div style={{ fontSize: '11px', color: '#475569', marginTop: '4px' }}>{stat.sub}</div>
              </div>
              <div style={{ fontSize: '24px' }}>{stat.icon}</div>
            </div>
            {('alert' in stat) && stat.alert && stat.value > 0 && (
              <div style={{ marginTop: '8px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                <span className="pulse-dot" style={{ background: stat.color }} />
                <span style={{ fontSize: '11px', color: stat.color }}>Directe actie vereist</span>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Export */}
      {!loading && capas.length > 0 && (
        <ExportBar
          title={locale === 'nl' ? 'CAPA Overzicht' : 'CAPA Overview'}
          subtitle={`${new Date().toLocaleDateString('nl-BE')} — Pure Project`}
          columns={[
            { key: 'shortId', label: 'ID', width: 16 },
            { key: 'nonconformityDescription', label: locale === 'nl' ? 'Omschrijving' : 'Description', width: 50 },
            { key: 'source', label: locale === 'nl' ? 'Bron' : 'Source', width: 22 },
            { key: 'status', label: 'Status', width: 14 },
            { key: 'stage', label: locale === 'nl' ? 'Fase' : 'Stage', width: 16 },
            { key: 'ownerName', label: locale === 'nl' ? 'Eigenaar' : 'Owner', width: 22 },
            { key: 'department', label: locale === 'nl' ? 'Afdeling' : 'Department', width: 20 },
            { key: 'planDueDate', label: locale === 'nl' ? 'Deadline' : 'Due date', width: 16 },
          ]}
          rows={filtered}
          filename="capa"
          count={filtered.length}
        />
      )}

      {/* Filters */}
      <div style={{ display: 'flex', gap: '10px', marginBottom: '20px', flexWrap: 'wrap', alignItems: 'center' }}>
        <div style={{ display: 'flex', gap: '6px' }}>
          {[
            { key: 'all', label: 'Alle' },
            { key: 'open', label: 'Open' },
            { key: 'in_progress', label: 'Bezig' },
            { key: 'verification', label: 'Verificatie' },
            { key: 'closed', label: 'Afgesloten' },
            { key: 'unsuccessful', label: 'Mislukt' },
          ].map(f => (
            <button key={f.key} onClick={() => setStatusFilter(f.key)} style={{
              padding: '5px 14px', borderRadius: '20px', fontSize: '12px', cursor: 'pointer',
              background: statusFilter === f.key ? 'rgba(59,130,246,0.2)' : 'rgba(255,255,255,0.05)',
              border: statusFilter === f.key ? '1px solid rgba(59,130,246,0.5)' : '1px solid rgba(255,255,255,0.1)',
              color: statusFilter === f.key ? '#60a5fa' : '#64748b',
            }}>{f.label}</button>
          ))}
        </div>
        <select value={sourceFilter} onChange={e => setSourceFilter(e.target.value)} style={{
          marginLeft: 'auto', fontSize: '12px', padding: '6px 10px',
          background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)',
          borderRadius: '8px', color: '#94a3b8', cursor: 'pointer',
        }}>
          <option value="all">Alle bronnen</option>
          {Object.entries(SOURCE_LABELS).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
        </select>
      </div>

      {/* CAPA list */}
      {loading ? (
        <div style={{ textAlign: 'center', padding: '60px', color: '#475569' }}>Laden...</div>
      ) : filtered.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '60px' }}>
          <div style={{ fontSize: '48px', marginBottom: '16px' }}>🔍</div>
          <p style={{ color: '#475569' }}>Geen CAPA's gevonden</p>
          <button className="btn-primary" onClick={() => setShowCreateModal(true)} style={{ marginTop: '16px' }}>Maak eerste CAPA aan</button>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          {filtered.map(capa => {
            const days = daysDiff(capa.planDueDate);
            const isOverdue = days !== null && days < 0 && capa.status !== 'closed' && capa.status !== 'unsuccessful';
            const openActions = (capa.actions || []).filter(a => a.status !== 'completed').length;
            const overdueActions = (capa.actions || []).filter(a => a.status !== 'completed' && daysDiff(a.dueDate) !== null && daysDiff(a.dueDate)! < 0).length;

            return (
              <div
                key={capa.id}
                className="glass card-hover"
                style={{ padding: '18px 20px', cursor: 'pointer', border: isOverdue ? '1px solid rgba(244,63,94,0.3)' : undefined }}
                onClick={() => router.push(`/dashboard/capa/${capa.id}`)}
              >
                <div style={{ display: 'flex', gap: '16px', alignItems: 'flex-start' }}>
                  {/* Left: ID + badges */}
                  <div style={{ flexShrink: 0, minWidth: '100px' }}>
                    <div style={{ fontSize: '13px', fontFamily: 'monospace', fontWeight: '700', color: '#60a5fa', background: 'rgba(59,130,246,0.12)', padding: '3px 8px', borderRadius: '5px', marginBottom: '6px', display: 'inline-block' }}>
                      {capa.shortId}
                    </div>
                    <div>
                      <span style={{ fontSize: '10px', padding: '2px 8px', borderRadius: '4px', background: `${STATUS_COLORS[capa.status]}18`, color: STATUS_COLORS[capa.status], fontWeight: '600' }}>
                        {capa.status === 'open' ? 'Open' : capa.status === 'in_progress' ? 'Bezig' : capa.status === 'verification' ? 'Verificatie' : capa.status === 'closed' ? 'Afgesloten' : 'Mislukt'}
                      </span>
                    </div>
                  </div>

                  {/* Center: content */}
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: '14px', fontWeight: '600', color: '#f1f5f9', marginBottom: '4px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {capa.nonconformityDescription || '(geen omschrijving)'}
                    </div>
                    <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', marginBottom: '10px' }}>
                      <span style={{ fontSize: '12px', color: '#64748b' }}>{SOURCE_LABELS[capa.source] || capa.source}</span>
                      <span style={{ fontSize: '12px', color: '#64748b' }}>🏢 {capa.department}</span>
                      <span style={{ fontSize: '12px', color: '#64748b' }}>👤 {capa.ownerName}</span>
                      <span style={{ fontSize: '12px', color: '#64748b' }}>📅 {new Date(capa.initiationDate).toLocaleDateString('nl-BE')}</span>
                    </div>

                    {/* Stage progress bar */}
                    <div style={{ marginBottom: '6px' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                        <span style={{ fontSize: '11px', color: '#475569' }}>Fase: {STAGE_LABELS[capa.stage]}</span>
                        <span style={{ fontSize: '11px', color: '#475569' }}>{STAGE_ORDER.indexOf(capa.stage) + 1}/{STAGE_ORDER.length}</span>
                      </div>
                      <StageBar stage={capa.stage} />
                    </div>
                  </div>

                  {/* Right: timings */}
                  <div style={{ flexShrink: 0, display: 'flex', flexDirection: 'column', gap: '8px', alignItems: 'flex-end' }}>
                    {/* Timing 1: Plan deadline */}
                    <div style={{ padding: '8px 12px', borderRadius: '8px', background: isOverdue ? 'rgba(244,63,94,0.1)' : 'rgba(255,255,255,0.04)', border: `1px solid ${isOverdue ? 'rgba(244,63,94,0.3)' : 'rgba(255,255,255,0.08)'}`, textAlign: 'right', minWidth: '130px' }}>
                      <div style={{ fontSize: '10px', color: '#475569', marginBottom: '2px' }}>Plan deadline</div>
                      <div style={{ fontSize: '13px', fontWeight: '700', color: isOverdue ? '#f87171' : '#94a3b8' }}>
                        {isOverdue ? `⏰ ${Math.abs(days!)} dagen te laat` : days !== null ? `${days} dagen` : '—'}
                      </div>
                      <div style={{ fontSize: '10px', color: '#334155' }}>{new Date(capa.planDueDate).toLocaleDateString('nl-BE')}</div>
                    </div>

                    {/* Timing 2: Open actions */}
                    {(capa.actions || []).length > 0 && (
                      <div style={{ padding: '8px 12px', borderRadius: '8px', background: overdueActions > 0 ? 'rgba(245,158,11,0.1)' : 'rgba(255,255,255,0.04)', border: `1px solid ${overdueActions > 0 ? 'rgba(245,158,11,0.3)' : 'rgba(255,255,255,0.08)'}`, textAlign: 'right', minWidth: '130px' }}>
                        <div style={{ fontSize: '10px', color: '#475569', marginBottom: '2px' }}>Openstaande acties</div>
                        <div style={{ fontSize: '13px', fontWeight: '700', color: overdueActions > 0 ? '#fbbf24' : '#94a3b8' }}>
                          {openActions} open {overdueActions > 0 ? `(${overdueActions} ⏰)` : ''}
                        </div>
                        <div style={{ fontSize: '10px', color: '#334155' }}>{(capa.actions || []).length} totaal</div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Create Modal */}
      {showCreateModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '24px' }}>
          <div className="glass" style={{ width: '100%', maxWidth: '640px', maxHeight: '90vh', overflowY: 'auto', padding: '28px', border: '1px solid rgba(59,130,246,0.3)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
              <div>
                <h2 style={{ margin: 0, fontSize: '18px', fontWeight: '800', color: '#f1f5f9' }}>Nieuwe CAPA initiëren</h2>
                <p style={{ margin: '4px 0 0', fontSize: '12px', color: '#64748b' }}>Part 1 – Algemene informatie (P04 §3.1.4)</p>
              </div>
              <button onClick={() => setShowCreateModal(false)} style={{ background: 'rgba(255,255,255,0.06)', border: 'none', color: '#64748b', cursor: 'pointer', width: '32px', height: '32px', borderRadius: '8px', fontSize: '16px' }}>✕</button>
            </div>

            <form onSubmit={handleCreate} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {/* Initiator */}
              <div style={{ padding: '16px', background: 'rgba(255,255,255,0.03)', borderRadius: '10px', border: '1px solid rgba(255,255,255,0.06)' }}>
                <div style={{ fontSize: '11px', color: '#60a5fa', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '12px' }}>Initiator</div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '11px', color: '#94a3b8', marginBottom: '5px', fontWeight: '600' }}>Naam initiator *</label>
                    <input className="input-dark" value={form.initiatedByName} onChange={e => setForm({ ...form, initiatedByName: e.target.value })} required placeholder="Voor- en achternaam" />
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '11px', color: '#94a3b8', marginBottom: '5px', fontWeight: '600' }}>Functietitel *</label>
                    <input className="input-dark" value={form.initiatedByJobTitle} onChange={e => setForm({ ...form, initiatedByJobTitle: e.target.value })} required placeholder="bijv. Site Manager" />
                  </div>
                </div>
              </div>

              {/* Department & Scope */}
              <div style={{ padding: '16px', background: 'rgba(255,255,255,0.03)', borderRadius: '10px', border: '1px solid rgba(255,255,255,0.06)' }}>
                <div style={{ fontSize: '11px', color: '#60a5fa', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '12px' }}>Afdeling & Scope (§3.1.5)</div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '11px', color: '#94a3b8', marginBottom: '5px', fontWeight: '600' }}>Afdeling *</label>
                    <input className="input-dark" value={form.department} onChange={e => setForm({ ...form, department: e.target.value })} required placeholder="bijv. QESH, Operaties" />
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '11px', color: '#94a3b8', marginBottom: '5px', fontWeight: '600' }}>Scope *</label>
                    <input className="input-dark" value={form.scope} onChange={e => setForm({ ...form, scope: e.target.value })} required placeholder="Bereik van de CAPA" />
                  </div>
                </div>
              </div>

              {/* Source */}
              <div style={{ padding: '16px', background: 'rgba(255,255,255,0.03)', borderRadius: '10px', border: '1px solid rgba(255,255,255,0.06)' }}>
                <div style={{ fontSize: '11px', color: '#60a5fa', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '12px' }}>Bron (§3.1.6)</div>
                <div>
                  <label style={{ display: 'block', fontSize: '11px', color: '#94a3b8', marginBottom: '5px', fontWeight: '600' }}>Bron *</label>
                  <select className="input-dark" value={form.source} onChange={e => setForm({ ...form, source: e.target.value })}>
                    {Object.entries(SOURCE_LABELS).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
                  </select>
                </div>
                <div style={{ marginTop: '8px', fontSize: '11px', color: '#475569', fontStyle: 'italic' }}>
                  Het referentienummer (CAPA-{new Date().getFullYear()}-XXX) wordt automatisch toegekend bij aanmaak.
                </div>
                {form.source === 'other' && (
                  <div style={{ marginTop: '12px' }}>
                    <label style={{ display: 'block', fontSize: '11px', color: '#94a3b8', marginBottom: '5px', fontWeight: '600' }}>Specificeer bron *</label>
                    <input className="input-dark" value={form.sourceOtherDescription} onChange={e => setForm({ ...form, sourceOtherDescription: e.target.value })} required placeholder="Omschrijf de bron" />
                  </div>
                )}
              </div>

              {/* Nonconformity */}
              <div style={{ padding: '16px', background: 'rgba(255,255,255,0.03)', borderRadius: '10px', border: '1px solid rgba(255,255,255,0.06)' }}>
                <div style={{ fontSize: '11px', color: '#60a5fa', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '12px' }}>Non-conformiteit (§3.1.7)</div>
                <label style={{ display: 'block', fontSize: '11px', color: '#94a3b8', marginBottom: '5px', fontWeight: '600' }}>Omschrijving *</label>
                <textarea className="input-dark" rows={4} value={form.nonconformityDescription} onChange={e => setForm({ ...form, nonconformityDescription: e.target.value })} required placeholder="Beschrijf de non-conformiteit zo gedetailleerd mogelijk..." style={{ resize: 'vertical' }} />
              </div>

              {/* Ownership */}
              <div style={{ padding: '16px', background: 'rgba(255,255,255,0.03)', borderRadius: '10px', border: '1px solid rgba(255,255,255,0.06)' }}>
                <div style={{ fontSize: '11px', color: '#60a5fa', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '12px' }}>Eigenaarschap (§3.1.8)</div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '11px', color: '#94a3b8', marginBottom: '5px', fontWeight: '600' }}>Eigenaar CAPA *</label>
                    <input className="input-dark" value={form.ownerName} onChange={e => setForm({ ...form, ownerName: e.target.value })} required placeholder="Voor- en achternaam" />
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '11px', color: '#94a3b8', marginBottom: '5px', fontWeight: '600' }}>Functietitel eigenaar *</label>
                    <input className="input-dark" value={form.ownerJobTitle} onChange={e => setForm({ ...form, ownerJobTitle: e.target.value })} required placeholder="bijv. Supervisor" />
                  </div>
                  <div style={{ gridColumn: '1 / -1' }}>
                    <label style={{ display: 'block', fontSize: '11px', color: '#94a3b8', marginBottom: '5px', fontWeight: '600' }}>Deadline actieplan * <span style={{ color: '#475569', fontWeight: '400' }}>(max 15 werkdagen na initiatie)</span></label>
                    <input className="input-dark" type="date" value={form.planDueDate} onChange={e => setForm({ ...form, planDueDate: e.target.value })} required />
                  </div>
                </div>
              </div>

              <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
                <button type="button" className="btn-secondary" onClick={() => setShowCreateModal(false)}>Annuleren</button>
                <button type="submit" className="btn-primary" disabled={creating}>{creating ? 'Aanmaken...' : 'CAPA aanmaken & openen'}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
