'use client';

import { useState, useEffect } from 'react';
import { BCMItem } from '@/lib/db';
import { useI18n } from '@/lib/i18n';
import ExportBar from '@/components/ExportBar';

const typeIcons: Record<string, string> = {
  risk: '⚠️',
  business_impact: '📊',
  recovery_plan: '🔄',
  crisis_procedure: '🚨',
  test_exercise: '🎭',
};

const statusColors: Record<string, string> = {
  identified: '#64748b', assessed: '#3b82f6', mitigated: '#10b981',
  accepted: '#f59e0b', completed: '#8b5cf6',
};
const statusLabels: Record<string, string> = {
  identified: 'Geïdentificeerd', assessed: 'Beoordeeld',
  mitigated: 'Gemitigeerd', accepted: 'Geaccepteerd', completed: 'Voltooid',
};

function getRiskColor(score: number): string {
  if (score >= 15) return '#f43f5e';
  if (score >= 9) return '#f59e0b';
  if (score >= 4) return '#3b82f6';
  return '#10b981';
}

function getRiskLabel(score: number): string {
  if (score >= 15) return 'Kritiek';
  if (score >= 9) return 'Hoog';
  if (score >= 4) return 'Medium';
  return 'Laag';
}

export default function BCMPage() {
  const { t } = useI18n();
  const [items, setItems] = useState<BCMItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [filter, setFilter] = useState('all');
  const [form, setForm] = useState({
    title: '', description: '', type: 'risk',
    probability: 3, impact: 3, mitigationPlan: '',
    recoveryTimeObjective: '', reviewDate: '',
  });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetch('/api/bcm').then(r => r.json()).then(d => {
      setItems(Array.isArray(d) ? d : []);
      setLoading(false);
    });
  }, []);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    const res = await fetch('/api/bcm', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form),
    });
    if (res.ok) {
      const item = await res.json();
      setItems(prev => [item, ...prev]);
      setShowForm(false);
      setForm({ title: '', description: '', type: 'risk', probability: 3, impact: 3, mitigationPlan: '', recoveryTimeObjective: '', reviewDate: '' });
    }
    setSaving(false);
  };

  const filtered = filter === 'all' ? items : filter === 'high'
    ? items.filter(i => (i.probability ?? 0) * (i.impact ?? 0) >= 9)
    : items.filter(i => i.type === filter);

  const highRiskCount = items.filter(i => (i.probability ?? 0) * (i.impact ?? 0) >= 9).length;
  const criticalCount = items.filter(i => (i.probability ?? 0) * (i.impact ?? 0) >= 15).length;

  return (
    <div style={{ maxWidth: '1100px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '28px' }}>
        <div>
          <h1 style={{ fontSize: '24px', fontWeight: '800', color: '#f1f5f9', margin: '0 0 4px' }}>{t.bcm.title}</h1>
          <p style={{ color: '#64748b', margin: 0, fontSize: '14px' }}>{items.length} items · {highRiskCount} {t.bcm.highRisk.toLowerCase()} · {criticalCount} {t.bcm.riskLevel.critical.toLowerCase()}</p>
        </div>
        <button className="btn-primary" onClick={() => setShowForm(true)}>+ {t.bcm.new}</button>
      </div>

      {/* Risk Matrix Teaser */}
      <div className="glass" style={{ padding: '20px', marginBottom: '24px' }}>
        <h3 style={{ margin: '0 0 16px', color: '#f1f5f9', fontSize: '14px', fontWeight: '700' }}>📊 {t.bcm.riskMatrix}</h3>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '6px' }}>
          {[5, 4, 3, 2, 1].map(prob => (
            [1, 2, 3, 4, 5].map(impact => {
              const score = prob * impact;
              const count = items.filter(i => (i.probability ?? 0) === prob && (i.impact ?? 0) === impact).length;
              const color = getRiskColor(score);
              return (
                <div key={`${prob}-${impact}`} style={{
                  height: '40px', borderRadius: '6px',
                  background: `${color}${count > 0 ? '44' : '11'}`,
                  border: count > 0 ? `1px solid ${color}` : `1px solid ${color}22`,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: '13px', fontWeight: count > 0 ? '700' : '400',
                  color: count > 0 ? color : `${color}44`,
                }}>
                  {count > 0 ? count : '·'}
                </div>
              );
            })
          ))}
        </div>
        <div style={{ display: 'flex', gap: '16px', marginTop: '10px', fontSize: '11px' }}>
          {[['#10b981', 'Laag'], ['#3b82f6', 'Medium'], ['#f59e0b', 'Hoog'], ['#f43f5e', 'Kritiek']].map(([c, l]) => (
            <span key={l} style={{ display: 'flex', alignItems: 'center', gap: '4px', color: '#64748b' }}>
              <span style={{ width: '10px', height: '10px', borderRadius: '2px', background: c, display: 'inline-block' }} /> {l}
            </span>
          ))}
        </div>
      </div>

      {/* Filters */}
      <div style={{ display: 'flex', gap: '8px', marginBottom: '24px', flexWrap: 'wrap' }}>
        {[
          { key: 'all', label: t.common.all },
          { key: 'high', label: t.bcm.filters.highRisk },
          { key: 'risk', label: t.bcm.filters.risks },
          { key: 'recovery_plan', label: t.bcm.filters.recoveryPlans },
          { key: 'crisis_procedure', label: t.bcm.filters.crisisProcedures },
        ].map(f => (
          <button key={f.key} onClick={() => setFilter(f.key)} style={{
            padding: '6px 16px', borderRadius: '20px', fontSize: '13px', cursor: 'pointer',
            background: filter === f.key ? 'rgba(59,130,246,0.2)' : 'rgba(255,255,255,0.05)',
            border: filter === f.key ? '1px solid rgba(59,130,246,0.5)' : '1px solid rgba(255,255,255,0.1)',
            color: filter === f.key ? '#60a5fa' : '#64748b',
          }}>{f.label}</button>
        ))}
      </div>

      {showForm && (
        <div className="glass" style={{ padding: '24px', marginBottom: '24px', border: '1px solid rgba(59,130,246,0.3)' }}>
          <h3 style={{ margin: '0 0 20px', color: '#f1f5f9', fontSize: '16px', fontWeight: '700' }}>{t.bcm.new}</h3>
          <form onSubmit={handleCreate} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
            <div style={{ gridColumn: '1 / -1' }}>
              <label style={{ display: 'block', fontSize: '12px', color: '#94a3b8', marginBottom: '6px', fontWeight: '600' }}>Titel *</label>
              <input className="input-dark" placeholder="Beschrijving van het risico/plan" value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} required />
            </div>
            <div style={{ gridColumn: '1 / -1' }}>
              <label style={{ display: 'block', fontSize: '12px', color: '#94a3b8', marginBottom: '6px', fontWeight: '600' }}>Beschrijving</label>
              <textarea className="input-dark" placeholder="Gedetailleerde beschrijving..." value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} rows={2} style={{ resize: 'vertical' }} />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '12px', color: '#94a3b8', marginBottom: '6px', fontWeight: '600' }}>Type</label>
              <select className="input-dark" value={form.type} onChange={e => setForm({ ...form, type: e.target.value })}>
                <option value="risk">Risico</option>
                <option value="business_impact">Business Impact Analyse</option>
                <option value="recovery_plan">Herstelplan</option>
                <option value="crisis_procedure">Crisisprocedure</option>
                <option value="test_exercise">Testscenario</option>
              </select>
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '12px', color: '#94a3b8', marginBottom: '6px', fontWeight: '600' }}>Reviewdatum</label>
              <input className="input-dark" type="date" value={form.reviewDate} onChange={e => setForm({ ...form, reviewDate: e.target.value })} />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '12px', color: '#94a3b8', marginBottom: '6px', fontWeight: '600' }}>{t.bcm.probability} (1-5): {form.probability}</label>
              <input type="range" min={1} max={5} value={form.probability} onChange={e => setForm({ ...form, probability: Number(e.target.value) })} style={{ width: '100%', accentColor: getRiskColor(form.probability * form.impact) }} />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '12px', color: '#94a3b8', marginBottom: '6px', fontWeight: '600' }}>{t.bcm.impact} (1-5): {form.impact}</label>
              <input type="range" min={1} max={5} value={form.impact} onChange={e => setForm({ ...form, impact: Number(e.target.value) })} style={{ width: '100%', accentColor: getRiskColor(form.probability * form.impact) }} />
            </div>
            <div style={{ gridColumn: '1 / -1', padding: '12px', background: `${getRiskColor(form.probability * form.impact)}22`, border: `1px solid ${getRiskColor(form.probability * form.impact)}44`, borderRadius: '8px', textAlign: 'center' }}>
              <span style={{ color: getRiskColor(form.probability * form.impact), fontWeight: '700' }}>
                {t.bcm.riskScore}: {form.probability * form.impact}/25 — {getRiskLabel(form.probability * form.impact)}
              </span>
            </div>
            <div style={{ gridColumn: '1 / -1' }}>
              <label style={{ display: 'block', fontSize: '12px', color: '#94a3b8', marginBottom: '6px', fontWeight: '600' }}>Mitigatieplan</label>
              <textarea className="input-dark" placeholder="Hoe wordt dit risico beheerst?" value={form.mitigationPlan} onChange={e => setForm({ ...form, mitigationPlan: e.target.value })} rows={2} style={{ resize: 'vertical' }} />
            </div>
            <div style={{ gridColumn: '1 / -1' }}>
              <label style={{ display: 'block', fontSize: '12px', color: '#94a3b8', marginBottom: '6px', fontWeight: '600' }}>Recovery Time Objective (RTO)</label>
              <input className="input-dark" placeholder="bijv. 4 uur, 24 uur..." value={form.recoveryTimeObjective} onChange={e => setForm({ ...form, recoveryTimeObjective: e.target.value })} />
            </div>
            <div style={{ gridColumn: '1 / -1', display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
              <button type="button" className="btn-secondary" onClick={() => setShowForm(false)}>Annuleren</button>
              <button type="submit" className="btn-primary" disabled={saving}>{saving ? 'Opslaan...' : 'Item aanmaken'}</button>
            </div>
          </form>
        </div>
      )}

      {/* Export */}
      {!loading && items.length > 0 && (
        <ExportBar
          title={t.bcm.title}
          subtitle={`${new Date().toLocaleDateString('nl-BE')} — Pure Project`}
          columns={[
            { key: 'shortId', label: 'ID', width: 12 },
            { key: 'title', label: t.common.title, width: 40 },
            { key: 'type', label: t.common.type, width: 22 },
            { key: 'status', label: t.common.status, width: 16 },
            { key: 'probability', label: t.bcm.probability, width: 12 },
            { key: 'impact', label: t.bcm.impact, width: 12 },
            { key: 'reviewDate', label: 'Review', width: 18 },
          ]}
          rows={filtered.map(i => ({ ...i, riskScore: (i.probability ?? 0) * (i.impact ?? 0) }))}
          filename="bcm"
          count={filtered.length}
        />
      )}

      {loading ? (
        <div style={{ textAlign: 'center', padding: '60px', color: '#475569' }}>Laden...</div>
      ) : filtered.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '60px' }}>
          <div style={{ fontSize: '48px', marginBottom: '16px' }}>🛡️</div>
          <p style={{ color: '#475569' }}>Geen BCM items gevonden</p>
          <button className="btn-primary" onClick={() => setShowForm(true)} style={{ marginTop: '16px' }}>{t.bcm.createFirst}</button>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))', gap: '16px' }}>
          {filtered.map(item => {
            const score = (item.probability ?? 0) * (item.impact ?? 0);
            const riskColor = getRiskColor(score);
            return (
              <div key={item.id} className="glass card-hover" style={{ padding: '20px', borderTop: `3px solid ${riskColor}` }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '10px' }}>
                  <div>
                    <div style={{ fontWeight: '700', color: '#f1f5f9', fontSize: '14px', marginBottom: '4px' }}>{item.title}</div>
                    <div style={{ fontSize: '12px', color: '#64748b' }}>{typeIcons[item.type]} {t.bcm.types[item.type as keyof typeof t.bcm.types] || item.type}</div>
                  </div>
                  <div style={{ textAlign: 'center', padding: '6px 12px', background: `${riskColor}22`, borderRadius: '8px', flexShrink: 0, marginLeft: '12px' }}>
                    <div style={{ fontSize: '18px', fontWeight: '800', color: riskColor }}>{score}</div>
                    <div style={{ fontSize: '10px', color: riskColor }}>{getRiskLabel(score)}</div>
                  </div>
                </div>
                {item.description && <p style={{ color: '#64748b', fontSize: '13px', margin: '0 0 12px', lineHeight: 1.5 }}>{item.description.slice(0, 100)}{item.description.length > 100 ? '...' : ''}</p>}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div style={{ display: 'flex', gap: '10px', fontSize: '12px', color: '#475569' }}>
                    <span>🎲 {t.bcm.probability}: {item.probability ?? '?'}/5</span>
                    <span>💥 {t.bcm.impact}: {item.impact ?? '?'}/5</span>
                  </div>
                  <span style={{ fontSize: '11px', padding: '3px 10px', borderRadius: '6px', background: `${statusColors[item.status]}22`, color: statusColors[item.status], fontWeight: '600' }}>
                    {statusLabels[item.status]}
                  </span>
                </div>
                {item.description && (
                  <div style={{ marginTop: '10px', padding: '10px', background: 'rgba(16,185,129,0.05)', border: '1px solid rgba(16,185,129,0.2)', borderRadius: '8px', fontSize: '12px', color: '#6ee7b7' }}>
                    🛡️ {item.description.slice(0, 80)}{item.description.length > 80 ? '...' : ''}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
