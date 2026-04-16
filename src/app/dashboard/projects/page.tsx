'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Project } from '@/lib/db';
import { useI18n } from '@/lib/i18n';
import ExportBar from '@/components/ExportBar';

const statusColors: Record<string, string> = {
  planning: '#8b5cf6', active: '#3b82f6', on_hold: '#f59e0b',
  completed: '#10b981', cancelled: '#f43f5e',
};
const statusLabels: Record<string, string> = {
  planning: 'Gepland', active: 'Actief', on_hold: 'On hold',
  completed: 'Voltooid', cancelled: 'Geannuleerd',
};
const priorityLabels: Record<string, string> = {
  low: 'Laag', medium: 'Medium', high: 'Hoog', critical: 'Kritiek',
};
const priorityColors: Record<string, string> = {
  low: '#64748b', medium: '#3b82f6', high: '#f59e0b', critical: '#f43f5e',
};

export default function ProjectsPage() {
  const router = useRouter();
  const { t } = useI18n();
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({
    name: '', description: '', status: 'planning', priority: 'medium',
    startDate: new Date().toISOString().split('T')[0], endDate: '', tags: '',
  });
  const [saving, setSaving] = useState(false);
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    fetch('/api/projects').then(r => r.json()).then(data => {
      setProjects(Array.isArray(data) ? data : []);
      setLoading(false);
    });
  }, []);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    const res = await fetch('/api/projects', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...form, tags: form.tags.split(',').map(t => t.trim()).filter(Boolean) }),
    });
    if (res.ok) {
      const project = await res.json();
      setProjects(prev => [project, ...prev]);
      setShowForm(false);
      setForm({ name: '', description: '', status: 'planning', priority: 'medium', startDate: new Date().toISOString().split('T')[0], endDate: '', tags: '' });
    }
    setSaving(false);
  };

  const handleUpdateStatus = async (id: string, status: string) => {
    const res = await fetch(`/api/projects/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status }),
    });
    if (res.ok) {
      const updated = await res.json();
      setProjects(prev => prev.map(p => p.id === id ? updated : p));
    }
  };

  const handleUpdateProgress = async (id: string, progress: number) => {
    const res = await fetch(`/api/projects/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ progress }),
    });
    if (res.ok) {
      const updated = await res.json();
      setProjects(prev => prev.map(p => p.id === id ? updated : p));
    }
  };

  const filtered = filter === 'all' ? projects : projects.filter(p => p.status === filter);

  const exportCols = [
    { key: 'shortId', label: 'ID', width: 12 },
    { key: 'name', label: t.projects.name, width: 40 },
    { key: 'status', label: t.common.status, width: 16 },
    { key: 'priority', label: t.common.priority, width: 14 },
    { key: 'progress', label: 'Progress %', width: 14 },
    { key: 'startDate', label: t.projects.startDate, width: 18 },
    { key: 'endDate', label: t.projects.endDate, width: 18 },
  ];

  return (
    <div style={{ maxWidth: '1100px' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '28px' }}>
        <div>
          <h1 style={{ fontSize: '24px', fontWeight: '800', color: '#f1f5f9', margin: '0 0 4px' }}>{t.projects.title}</h1>
          <p style={{ color: '#64748b', margin: 0, fontSize: '14px' }}>{projects.length} projecten in totaal</p>
        </div>
        <button className="btn-primary" onClick={() => setShowForm(true)}>
          + {t.projects.new}
        </button>
      </div>

      {/* Export */}
      {!loading && projects.length > 0 && (
        <ExportBar
          title={t.projects.title}
          subtitle={`${new Date().toLocaleDateString('nl-BE')} — Pure Project`}
          columns={exportCols}
          rows={filtered}
          filename="projecten"
          count={filtered.length}
        />
      )}

      {/* Filters */}
      <div style={{ display: 'flex', gap: '8px', marginBottom: '24px', flexWrap: 'wrap' }}>
        {[
          { key: 'all', label: t.common.all },
          { key: 'planning', label: 'Gepland' }, // static, no i18n needed for status filters
          { key: 'active', label: 'Actief' },
          { key: 'on_hold', label: 'On hold' },
          { key: 'completed', label: 'Voltooid' },
        ].map(f => (
          <button
            key={f.key}
            onClick={() => setFilter(f.key)}
            style={{
              padding: '6px 16px', borderRadius: '20px', fontSize: '13px', cursor: 'pointer',
              background: filter === f.key ? 'rgba(59,130,246,0.2)' : 'rgba(255,255,255,0.05)',
              border: filter === f.key ? '1px solid rgba(59,130,246,0.5)' : '1px solid rgba(255,255,255,0.1)',
              color: filter === f.key ? '#60a5fa' : '#64748b',
              transition: 'all 0.15s',
            }}
          >
            {f.label}
          </button>
        ))}
      </div>

      {/* Form */}
      {showForm && (
        <div className="glass" style={{ padding: '24px', marginBottom: '24px', border: '1px solid rgba(59,130,246,0.3)' }}>
          <h3 style={{ margin: '0 0 20px', color: '#f1f5f9', fontSize: '16px', fontWeight: '700' }}>Nieuw project aanmaken</h3>
          <form onSubmit={handleCreate} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
            <div style={{ gridColumn: '1 / -1' }}>
              <label style={{ display: 'block', fontSize: '12px', color: '#94a3b8', marginBottom: '6px', fontWeight: '600' }}>Projectnaam *</label>
              <input className="input-dark" placeholder="Naam van het project" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} required />
            </div>
            <div style={{ gridColumn: '1 / -1' }}>
              <label style={{ display: 'block', fontSize: '12px', color: '#94a3b8', marginBottom: '6px', fontWeight: '600' }}>Beschrijving</label>
              <textarea className="input-dark" placeholder="Beschrijf het project..." value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} rows={3} style={{ resize: 'vertical' }} />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '12px', color: '#94a3b8', marginBottom: '6px', fontWeight: '600' }}>Status</label>
              <select className="input-dark" value={form.status} onChange={e => setForm({ ...form, status: e.target.value })}>
                <option value="planning">Gepland</option>
                <option value="active">Actief</option>
                <option value="on_hold">On hold</option>
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
              <label style={{ display: 'block', fontSize: '12px', color: '#94a3b8', marginBottom: '6px', fontWeight: '600' }}>Startdatum</label>
              <input className="input-dark" type="date" value={form.startDate} onChange={e => setForm({ ...form, startDate: e.target.value })} />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '12px', color: '#94a3b8', marginBottom: '6px', fontWeight: '600' }}>Einddatum</label>
              <input className="input-dark" type="date" value={form.endDate} onChange={e => setForm({ ...form, endDate: e.target.value })} />
            </div>
            <div style={{ gridColumn: '1 / -1' }}>
              <label style={{ display: 'block', fontSize: '12px', color: '#94a3b8', marginBottom: '6px', fontWeight: '600' }}>Tags (komma-gescheiden)</label>
              <input className="input-dark" placeholder="bijv. IT, Infrastructuur, Q1" value={form.tags} onChange={e => setForm({ ...form, tags: e.target.value })} />
            </div>
            <div style={{ gridColumn: '1 / -1', display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
              <button type="button" className="btn-secondary" onClick={() => setShowForm(false)}>Annuleren</button>
              <button type="submit" className="btn-primary" disabled={saving}>
                {saving ? 'Aanmaken...' : 'Project aanmaken'}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Projects Grid */}
      {loading ? (
        <div style={{ textAlign: 'center', padding: '60px', color: '#475569' }}>Laden...</div>
      ) : filtered.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '60px' }}>
          <div style={{ fontSize: '48px', marginBottom: '16px' }}>📋</div>
          <p style={{ color: '#475569', fontSize: '16px' }}>Geen projecten gevonden</p>
          <button className="btn-primary" onClick={() => setShowForm(true)} style={{ marginTop: '16px' }}>Maak je eerste project aan</button>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))', gap: '16px' }}>
          {filtered.map(project => (
            <div key={project.id} className="glass card-hover" style={{ padding: '20px', cursor: 'pointer' }} onClick={() => router.push(`/dashboard/projects/${project.id}`)}>

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                    <span style={{ fontSize: '11px', fontFamily: 'monospace', color: '#60a5fa', background: 'rgba(59,130,246,0.1)', padding: '2px 6px', borderRadius: '4px', fontWeight: '700' }}>
                      {(project as Project & { shortId?: string }).shortId || ''}
                    </span>
                  </div>
                  <h3 style={{ margin: 0, fontSize: '15px', fontWeight: '700', color: '#f1f5f9' }}>{project.name}</h3>
                </div>
                <span style={{ fontSize: '11px', padding: '3px 10px', borderRadius: '6px', background: `${statusColors[project.status]}22`, color: statusColors[project.status], flexShrink: 0 }}>
                  {statusLabels[project.status]}
                </span>
              </div>

              {project.description && (
                <p style={{ color: '#64748b', fontSize: '13px', margin: '0 0 12px', lineHeight: '1.5' }}>
                  {project.description.slice(0, 100)}{project.description.length > 100 ? '...' : ''}
                </p>
              )}

              <div style={{ display: 'flex', gap: '8px', marginBottom: '14px', flexWrap: 'wrap' }}>
                <span style={{ fontSize: '11px', padding: '2px 8px', borderRadius: '5px', background: `${priorityColors[project.priority]}22`, color: priorityColors[project.priority] }}>
                  {priorityLabels[project.priority]}
                </span>
                {project.tags.slice(0, 2).map(tag => (
                  <span key={tag} style={{ fontSize: '11px', padding: '2px 8px', borderRadius: '5px', background: 'rgba(255,255,255,0.07)', color: '#94a3b8' }}>{tag}</span>
                ))}
              </div>

              {/* Progress */}
              <div style={{ marginBottom: '14px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                  <span style={{ fontSize: '12px', color: '#64748b' }}>Voortgang</span>
                  <span style={{ fontSize: '12px', color: '#94a3b8', fontWeight: '600' }}>{project.progress}%</span>
                </div>
                <div className="progress-bar">
                  <div className="progress-fill" style={{ width: `${project.progress}%`, background: statusColors[project.status] }} />
                </div>
              </div>

              {/* Actions */}
              <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }} onClick={e => e.stopPropagation()}>
                <input
                  type="range" min="0" max="100" value={project.progress}
                  onChange={e => handleUpdateProgress(project.id, Number(e.target.value))}
                  style={{ flex: 1, accentColor: statusColors[project.status] }}
                />
                <select
                  value={project.status}
                  onChange={e => handleUpdateStatus(project.id, e.target.value)}
                  style={{ fontSize: '11px', padding: '4px 8px', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '6px', color: '#94a3b8', cursor: 'pointer' }}
                >
                  <option value="planning">Gepland</option>
                  <option value="active">Actief</option>
                  <option value="on_hold">On hold</option>
                  <option value="completed">Voltooid</option>
                  <option value="cancelled">Geannuleerd</option>
                </select>
              </div>

              {project.endDate && (
                <div style={{ marginTop: '10px', fontSize: '11px', color: new Date(project.endDate) < new Date() && project.status !== 'completed' ? '#f87171' : '#475569' }}>
                  📅 Einddatum: {new Date(project.endDate).toLocaleDateString('nl-BE')}
                  {new Date(project.endDate) < new Date() && project.status !== 'completed' && ' ⚠️ Vertraagd'}
                </div>
              )}

              <div style={{ marginTop: '12px', textAlign: 'right' }}>
                <span style={{ fontSize: '12px', color: '#60a5fa', fontWeight: '600' }}>Open project →</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
