'use client';

import { useState, useEffect } from 'react';
import { QualityItem } from '@/lib/db';
import { useI18n } from '@/lib/i18n';
import ExportBar from '@/components/ExportBar';

const priorityColors: Record<string, string> = {
  low: '#64748b', medium: '#3b82f6', high: '#f59e0b', critical: '#f43f5e',
};
const priorityLabels: Record<string, string> = {
  low: 'Laag', medium: 'Medium', high: 'Hoog', critical: 'Kritiek',
};
const statusColors: Record<string, string> = {
  open: '#3b82f6', in_progress: '#f59e0b', closed: '#10b981', verified: '#8b5cf6',
};
const statusLabels: Record<string, string> = {
  open: 'Open', in_progress: 'In behandeling', closed: 'Gesloten', verified: 'Geverifieerd',
};
const typeLabels: Record<string, string> = {
  non_conformity: '🔴 Non-conformiteit',
  improvement: '💡 Verbetering',
  audit_finding: '🔍 Auditbevinding',
  capa: '🎯 CAPA',
  kpi: '📊 KPI',
};

export default function QualityPage() {
  const { t } = useI18n();
  const [items, setItems] = useState<QualityItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [filter, setFilter] = useState('all');
  const [form, setForm] = useState({
    title: '', description: '', type: 'non_conformity', priority: 'medium', dueDate: '',
  });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetch('/api/quality').then(r => r.json()).then(d => {
      setItems(Array.isArray(d) ? d : []);
      setLoading(false);
    });
  }, []);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    const res = await fetch('/api/quality', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form),
    });
    if (res.ok) {
      const item = await res.json();
      setItems(prev => [item, ...prev]);
      setShowForm(false);
      setForm({ title: '', description: '', type: 'non_conformity', priority: 'medium', dueDate: '' });
    }
    setSaving(false);
  };

  const filtered = filter === 'all' ? items : items.filter(i => i.status === filter);
  const openCount = items.filter(i => i.status === 'open').length;
  const criticalCount = items.filter(i => i.priority === 'critical').length;

  return (
    <div style={{ maxWidth: '1100px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '28px' }}>
        <div>
          <h1 style={{ fontSize: '24px', fontWeight: '800', color: '#f1f5f9', margin: '0 0 4px' }}>{t.quality.title}</h1>
          <p style={{ color: '#64748b', margin: 0, fontSize: '14px' }}>{openCount} {t.common.open.toLowerCase()} · {criticalCount} {t.priority.critical.toLowerCase()}</p>
        </div>
        <button className="btn-primary" onClick={() => setShowForm(true)}>+ {t.quality.new}</button>
      </div>

      {/* ISO 9001 Quick Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '12px', marginBottom: '24px' }}>
        {[
          { label: t.quality.stats.nonConformities, count: items.filter(i => i.type === 'non_conformity').length, color: '#f43f5e', icon: '🔴' },
          { label: t.quality.stats.improvements, count: items.filter(i => i.type === 'improvement').length, color: '#10b981', icon: '💡' },
          { label: t.quality.stats.capas, count: items.filter(i => i.type === 'capa').length, color: '#8b5cf6', icon: '🎯' },
          { label: t.quality.stats.auditFindings, count: items.filter(i => i.type === 'audit_finding').length, color: '#3b82f6', icon: '🔍' },
        ].map((s, i) => (
          <div key={i} className="glass" style={{ padding: '16px', textAlign: 'center' }}>
            <div style={{ fontSize: '24px', marginBottom: '6px' }}>{s.icon}</div>
            <div style={{ fontSize: '28px', fontWeight: '800', color: s.color }}>{s.count}</div>
            <div style={{ fontSize: '11px', color: '#64748b' }}>{s.label}</div>
          </div>
        ))}
      </div>

      {/* Export */}
      {!loading && items.length > 0 && (
        <ExportBar
          title={t.quality.title}
          subtitle={`${new Date().toLocaleDateString('nl-BE')} — Pure Project`}
          columns={[
            { key: 'shortId', label: 'ID', width: 12 },
            { key: 'title', label: t.common.title, width: 40 },
            { key: 'type', label: t.common.type, width: 20 },
            { key: 'status', label: t.common.status, width: 16 },
            { key: 'priority', label: t.common.priority, width: 14 },
            { key: 'dueDate', label: t.common.dueDate, width: 18 },
          ]}
          rows={filtered}
          filename="kwaliteit"
          count={filtered.length}
        />
      )}

      {/* Filters */}
      <div style={{ display: 'flex', gap: '8px', marginBottom: '24px', flexWrap: 'wrap' }}>
        {[{ key: 'all', label: t.common.all }, { key: 'open', label: 'Open' }, { key: 'in_progress', label: 'In behandeling' }, { key: 'closed', label: 'Gesloten' }, { key: 'verified', label: 'Geverifieerd' }].map(f => (
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
          <h3 style={{ margin: '0 0 20px', color: '#f1f5f9', fontSize: '16px', fontWeight: '700' }}>Nieuw kwaliteitsitem</h3>
          <form onSubmit={handleCreate} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
            <div style={{ gridColumn: '1 / -1' }}>
              <label style={{ display: 'block', fontSize: '12px', color: '#94a3b8', marginBottom: '6px', fontWeight: '600' }}>Titel *</label>
              <input className="input-dark" placeholder="Omschrijving van de bevinding" value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} required />
            </div>
            <div style={{ gridColumn: '1 / -1' }}>
              <label style={{ display: 'block', fontSize: '12px', color: '#94a3b8', marginBottom: '6px', fontWeight: '600' }}>Beschrijving</label>
              <textarea className="input-dark" placeholder="Gedetailleerde beschrijving..." value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} rows={3} style={{ resize: 'vertical' }} />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '12px', color: '#94a3b8', marginBottom: '6px', fontWeight: '600' }}>Type</label>
              <select className="input-dark" value={form.type} onChange={e => setForm({ ...form, type: e.target.value })}>
                <option value="non_conformity">Non-conformiteit</option>
                <option value="improvement">Verbeterpunt</option>
                <option value="audit_finding">Auditbevinding</option>
                <option value="capa">CAPA</option>
                <option value="kpi">KPI</option>
              </select>
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '12px', color: '#94a3b8', marginBottom: '6px', fontWeight: '600' }}>Prioriteit</label>
              <select className="input-dark" value={form.priority} onChange={e => setForm({ ...form, priority: e.target.value })}>
                <option value="low">Laag</option>
                <option value="medium">Medium</option>
                <option value="high">Hoog</option>
                <option value="critical">Kritiek</option>
              </select>
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '12px', color: '#94a3b8', marginBottom: '6px', fontWeight: '600' }}>Deadline</label>
              <input className="input-dark" type="date" value={form.dueDate} onChange={e => setForm({ ...form, dueDate: e.target.value })} />
            </div>
            <div style={{ gridColumn: '1 / -1', display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
              <button type="button" className="btn-secondary" onClick={() => setShowForm(false)}>Annuleren</button>
              <button type="submit" className="btn-primary" disabled={saving}>{saving ? 'Opslaan...' : 'Item aanmaken'}</button>
            </div>
          </form>
        </div>
      )}

      {loading ? (
        <div style={{ textAlign: 'center', padding: '60px', color: '#475569' }}>Laden...</div>
      ) : filtered.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '60px' }}>
          <div style={{ fontSize: '48px', marginBottom: '16px' }}>🔍</div>
          <p style={{ color: '#475569' }}>Geen kwaliteitsitems gevonden</p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          {filtered.map(item => (
            <div key={item.id} className="glass card-hover" style={{ padding: '18px 20px', borderLeft: `4px solid ${priorityColors[item.priority] || '#64748b'}` }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '6px', flexWrap: 'wrap' }}>
                    <span style={{ fontWeight: '600', color: '#f1f5f9', fontSize: '14px' }}>{item.title}</span>
                    <span style={{ fontSize: '12px', color: '#94a3b8' }}>{typeLabels[item.type]}</span>
                    <span style={{ fontSize: '11px', padding: '2px 8px', borderRadius: '5px', background: `${priorityColors[item.priority] || '#64748b'}22`, color: priorityColors[item.priority] || '#64748b' }}>
                      {priorityLabels[item.priority] || item.priority}
                    </span>
                  </div>
                  {item.description && <p style={{ color: '#64748b', fontSize: '13px', margin: '0 0 6px', lineHeight: 1.5 }}>{item.description}</p>}
                  {item.dueDate && <span style={{ fontSize: '12px', color: '#475569' }}>📅 {new Date(item.dueDate).toLocaleDateString('nl-BE')}</span>}
                </div>
                <span style={{ fontSize: '12px', padding: '4px 12px', borderRadius: '8px', background: `${statusColors[item.status]}22`, color: statusColors[item.status], fontWeight: '600', flexShrink: 0, marginLeft: '16px' }}>
                  {statusLabels[item.status]}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
