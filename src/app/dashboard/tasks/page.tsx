'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import ItemPanel, { PanelItem } from '@/components/ItemPanel';
import { useI18n } from '@/lib/i18n';
import ExportBar from '@/components/ExportBar';

interface WorkItem {
  id: string;
  shortId: string;
  type: 'measure' | 'action' | 'task' | 'milestone';
  title: string;
  description: string;
  status: 'todo' | 'in_progress' | 'review' | 'done' | 'blocked';
  priority: 'low' | 'medium' | 'high' | 'critical';
  projectId?: string;
  parentType?: string;
  parentId?: string;
  categoryId?: string;
  dueDate?: string;
  completedAt?: string;
  tags: string[];
  comments: Array<{ id: string; authorId: string; authorName: string; text: string; type?: string; createdAt: string }>;
  attachments: Array<{ id: string; filename: string; storedName: string; mimeType: string; size: number; url: string; uploadedBy: string; uploadedByName: string; createdAt: string }>;
  createdAt: string;
}

interface Project {
  id: string;
  shortId?: string;
  name: string;
}

interface Category {
  id: string;
  shortId?: string;
  name: string;
  color: string;
}

const statusColors: Record<string, string> = {
  todo: '#64748b', in_progress: '#3b82f6', review: '#f59e0b', done: '#10b981', blocked: '#f43f5e',
};
const statusLabels: Record<string, string> = {
  todo: 'Te doen', in_progress: 'Bezig', review: 'Review', done: 'Klaar', blocked: 'Geblokkeerd',
};
const priorityColors: Record<string, string> = {
  low: '#64748b', medium: '#3b82f6', high: '#f59e0b', critical: '#f43f5e',
};
const priorityLabels: Record<string, string> = {
  low: 'Laag', medium: 'Medium', high: 'Hoog', critical: 'Kritiek',
};
const typeLabels: Record<string, string> = {
  task: '📌 Taak', action: '⚡ Actie', measure: '🎯 Maatregel', milestone: '🏆 Milestone',
};
const typeColors: Record<string, string> = {
  task: '#60a5fa', action: '#a78bfa', measure: '#34d399', milestone: '#fbbf24',
};

// ─── Item row ─────────────────────────────────────────────────────────────────
function ItemRow({ item, getProject, getCategory, onOpenPanel, onUpdateStatus, onNavigate, hideTypeBadge }: {
  item: WorkItem;
  getProject: (id?: string) => Project | undefined;
  getCategory: (id?: string) => Category | undefined;
  onOpenPanel: (item: WorkItem) => void;
  onUpdateStatus: (id: string, status: string) => void;
  onNavigate: (path: string) => void;
  hideTypeBadge?: boolean;
}) {
  const isOverdue = item.dueDate && new Date(item.dueDate) < new Date() && item.status !== 'done';
  const project = getProject(item.projectId);
  const category = getCategory(item.categoryId);
  return (
    <div className="glass card-hover" style={{
      padding: '14px 18px',
      border: isOverdue ? '1px solid rgba(244,63,94,0.3)' : '1px solid rgba(255,255,255,0.06)',
      cursor: 'pointer',
    }} onClick={() => onOpenPanel(item)}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
        <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: priorityColors[item.priority], flexShrink: 0 }} />
        <span style={{ fontSize: '10px', fontFamily: 'monospace', fontWeight: '700', color: typeColors[item.type], background: `${typeColors[item.type]}18`, padding: '2px 6px', borderRadius: '4px', flexShrink: 0 }}>
          {item.shortId}
        </span>
        {!hideTypeBadge && <span style={{ fontSize: '11px', color: '#64748b', flexShrink: 0 }}>{typeLabels[item.type]}</span>}
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontWeight: '600', fontSize: '14px', color: item.status === 'done' ? '#475569' : '#f1f5f9', textDecoration: item.status === 'done' ? 'line-through' : 'none', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
            {item.title}
          </div>
          <div style={{ display: 'flex', gap: '10px', marginTop: '4px', flexWrap: 'wrap' }}>
            {project && (
              <span style={{ fontSize: '11px', color: '#3b82f6', cursor: 'pointer' }} onClick={e => { e.stopPropagation(); onNavigate(`/dashboard/projects/${project.id}`); }}>
                📋 {project.shortId ? `${project.shortId} · ` : ''}{project.name}
              </span>
            )}
            {category && <span style={{ fontSize: '11px', padding: '1px 6px', borderRadius: '4px', background: `${category.color}22`, color: category.color }}>{category.name}</span>}
            {item.dueDate && <span style={{ fontSize: '11px', color: isOverdue ? '#f87171' : '#475569' }}>{isOverdue ? '⏰ Te laat: ' : '📅 '}{new Date(item.dueDate).toLocaleDateString('nl-BE')}</span>}
          </div>
        </div>
        <span style={{ fontSize: '10px', padding: '2px 8px', borderRadius: '4px', flexShrink: 0, background: `${priorityColors[item.priority]}18`, color: priorityColors[item.priority] }}>{priorityLabels[item.priority]}</span>
        <select
          value={item.status}
          onChange={e => { e.stopPropagation(); onUpdateStatus(item.id, e.target.value); }}
          onClick={e => e.stopPropagation()}
          style={{ fontSize: '12px', padding: '5px 10px', flexShrink: 0, background: `${statusColors[item.status]}22`, border: `1px solid ${statusColors[item.status]}44`, borderRadius: '8px', color: statusColors[item.status], cursor: 'pointer', fontWeight: '600' }}
        >
          {Object.entries(statusLabels).map(([val, lbl]) => <option key={val} value={val}>{lbl}</option>)}
        </select>
      </div>
    </div>
  );
}

// ─── Grouped list ─────────────────────────────────────────────────────────────
function GroupedItemList({ items, typeFilter, getProject, getCategory, onOpenPanel, onUpdateStatus, onNavigate }: {
  items: WorkItem[];
  typeFilter: string;
  getProject: (id?: string) => Project | undefined;
  getCategory: (id?: string) => Category | undefined;
  onOpenPanel: (item: WorkItem) => void;
  onUpdateStatus: (id: string, status: string) => void;
  onNavigate: (path: string) => void;
}) {
  const [collapsed, setCollapsed] = useState<Record<string, boolean>>({});

  const toggle = (type: string) => setCollapsed(c => ({ ...c, [type]: !c[type] }));

  // When a specific type filter is active, render flat (no grouping)
  if (typeFilter !== 'all') {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
        {items.map(item => (
          <ItemRow key={item.id} item={item} getProject={getProject} getCategory={getCategory} onOpenPanel={onOpenPanel} onUpdateStatus={onUpdateStatus} onNavigate={onNavigate} />
        ))}
      </div>
    );
  }

  const groups: { type: WorkItem['type']; icon: string; label: string; color: string }[] = [
    { type: 'measure',   icon: '🎯', label: 'Maatregelen',  color: '#34d399' },
    { type: 'action',    icon: '⚡', label: 'Acties',       color: '#a78bfa' },
    { type: 'task',      icon: '📌', label: 'Taken',        color: '#60a5fa' },
    { type: 'milestone', icon: '🏆', label: 'Milestones',   color: '#fbbf24' },
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
      {groups.map(({ type, icon, label, color }) => {
        const groupItems = items.filter(i => i.type === type);
        if (groupItems.length === 0) return null;
        const open = groupItems.filter(i => i.status !== 'done').length;
        const isCollapsed = collapsed[type];
        return (
          <div key={type}>
            {/* Group header */}
            <button
              onClick={() => toggle(type)}
              style={{ display: 'flex', alignItems: 'center', gap: '10px', width: '100%', background: 'none', border: 'none', cursor: 'pointer', padding: '8px 4px', marginBottom: '8px' }}
            >
              <span style={{ fontSize: '18px' }}>{icon}</span>
              <span style={{ fontSize: '14px', fontWeight: '700', color }}>{label}</span>
              <span style={{ fontSize: '12px', background: `${color}18`, color, padding: '2px 8px', borderRadius: '10px', fontWeight: '600' }}>{groupItems.length}</span>
              {open > 0 && <span style={{ fontSize: '11px', color: '#64748b' }}>{open} open</span>}
              <span style={{ marginLeft: 'auto', fontSize: '12px', color: '#475569' }}>{isCollapsed ? '▶' : '▼'}</span>
            </button>
            {!isCollapsed && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', paddingLeft: '8px', borderLeft: `2px solid ${color}33` }}>
                {groupItems.map(item => (
                  <ItemRow key={item.id} item={item} getProject={getProject} getCategory={getCategory} onOpenPanel={onOpenPanel} onUpdateStatus={onUpdateStatus} onNavigate={onNavigate} hideTypeBadge />
                ))}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}

export default function TasksPage() {
  const router = useRouter();
  const { t } = useI18n();
  const [items, setItems] = useState<WorkItem[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [statusFilter, setStatusFilter] = useState('all');
  const [typeFilter, setTypeFilter] = useState('all');
  const [projectFilter, setProjectFilter] = useState('all');
  const [panelItem, setPanelItem] = useState<PanelItem | null>(null);
  const [form, setForm] = useState({
    title: '', description: '', projectId: '', type: 'task',
    status: 'todo', priority: 'medium', dueDate: '', categoryId: '',
    parentType: '', parentId: '',
  });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    Promise.all([
      fetch('/api/workitems').then(r => r.json()),
      fetch('/api/projects').then(r => r.json()),
      fetch('/api/categories').then(r => r.json()),
    ]).then(([wi, p, c]) => {
      setItems(Array.isArray(wi) ? wi : []);
      setProjects(Array.isArray(p) ? p : []);
      setCategories(Array.isArray(c) ? c : []);
      setLoading(false);
    });
  }, []);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    const body: Record<string, string> = {
      title: form.title,
      description: form.description,
      type: form.type,
      status: form.status,
      priority: form.priority,
    };
    if (form.projectId) body.projectId = form.projectId;
    if (form.dueDate) body.dueDate = form.dueDate;
    if (form.categoryId) body.categoryId = form.categoryId;
    if (form.parentType && form.parentId) {
      body.parentType = form.parentType;
      body.parentId = form.parentId;
    }

    const res = await fetch('/api/workitems', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });
    if (res.ok) {
      const item = await res.json();
      setItems(prev => [item, ...prev]);
      setShowForm(false);
      setForm({ title: '', description: '', projectId: '', type: 'task', status: 'todo', priority: 'medium', dueDate: '', categoryId: '', parentType: '', parentId: '' });
    }
    setSaving(false);
  };

  const handleUpdateStatus = async (id: string, status: string) => {
    const res = await fetch(`/api/workitems/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status }),
    });
    if (res.ok) {
      const updated = await res.json();
      setItems(prev => prev.map(t => t.id === id ? updated : t));
    }
  };

  const filtered = items.filter(item => {
    if (statusFilter === 'overdue') return item.dueDate && new Date(item.dueDate) < new Date() && item.status !== 'done';
    if (statusFilter !== 'all' && item.status !== statusFilter) return false;
    if (typeFilter !== 'all' && item.type !== typeFilter) return false;
    if (projectFilter !== 'all' && item.projectId !== projectFilter) return false;
    return true;
  });

  const getProject = (id?: string) => projects.find(p => p.id === id);
  const getCategory = (id?: string) => categories.find(c => c.id === id);

  const openPanel = (item: WorkItem) => {
    const typeLabel: Record<string, string> = { task: 'Taak', action: 'Actie', measure: 'Maatregel', milestone: 'Milestone' };
    setPanelItem({
      id: item.id,
      shortId: item.shortId,
      title: item.title,
      description: item.description,
      status: item.status,
      priority: item.priority,
      type: typeLabel[item.type] || item.type,
      dueDate: item.dueDate,
      comments: (item.comments || []) as PanelItem['comments'],
      attachments: item.attachments || [],
      entityType: 'workitem',
    });
  };

  const counts = {
    total: items.length,
    open: items.filter(t => t.status !== 'done').length,
    overdue: items.filter(t => t.dueDate && new Date(t.dueDate) < new Date() && t.status !== 'done').length,
  };

  return (
    <div style={{ maxWidth: '1200px' }}>
      {panelItem && <ItemPanel item={panelItem} onClose={() => setPanelItem(null)} />}
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '28px' }}>
        <div>
          <h1 style={{ fontSize: '24px', fontWeight: '800', color: '#f1f5f9', margin: '0 0 4px' }}>{t.tasks.title}</h1>
          <p style={{ color: '#64748b', margin: 0, fontSize: '14px' }}>
            {counts.open} open · {counts.total} totaal
            {counts.overdue > 0 && <span style={{ color: '#f87171', marginLeft: '10px' }}>⏰ {counts.overdue} te laat</span>}
          </p>
        </div>
        <button className="btn-primary" onClick={() => setShowForm(true)}>+ {t.tasks.new}</button>
      </div>

      {/* Export */}
      {!loading && items.length > 0 && (
        <ExportBar
          title={t.tasks.title}
          subtitle={`${new Date().toLocaleDateString('nl-BE')} — Pure Project`}
          columns={[
            { key: 'shortId', label: 'ID', width: 12 },
            { key: 'title', label: t.common.title, width: 40 },
            { key: 'type', label: t.common.type, width: 14 },
            { key: 'status', label: t.common.status, width: 16 },
            { key: 'priority', label: t.common.priority, width: 14 },
            { key: 'dueDate', label: t.common.dueDate, width: 18 },
          ]}
          rows={filtered}
          filename="taken"
          count={filtered.length}
        />
      )}

      {/* Filters row */}
      <div style={{ display: 'flex', gap: '12px', marginBottom: '20px', flexWrap: 'wrap', alignItems: 'center' }}>
        {/* Status filters */}
        <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
          {[
            { key: 'all', label: 'Alle' },
            { key: 'todo', label: 'Te doen' },
            { key: 'in_progress', label: 'Bezig' },
            { key: 'review', label: 'Review' },
            { key: 'blocked', label: 'Geblokkeerd' },
            { key: 'overdue', label: '⏰ Te laat' },
            { key: 'done', label: 'Klaar' },
          ].map(f => (
            <button key={f.key} onClick={() => setStatusFilter(f.key)} style={{
              padding: '5px 14px', borderRadius: '20px', fontSize: '12px', cursor: 'pointer',
              background: statusFilter === f.key ? 'rgba(59,130,246,0.2)' : 'rgba(255,255,255,0.05)',
              border: statusFilter === f.key ? '1px solid rgba(59,130,246,0.5)' : '1px solid rgba(255,255,255,0.1)',
              color: statusFilter === f.key ? '#60a5fa' : '#64748b', transition: 'all 0.15s',
            }}>{f.label}</button>
          ))}
        </div>

        {/* Type + project selects */}
        <div style={{ display: 'flex', gap: '8px', marginLeft: 'auto' }}>
          <select value={typeFilter} onChange={e => setTypeFilter(e.target.value)} style={{
            fontSize: '12px', padding: '6px 10px', background: 'rgba(255,255,255,0.05)',
            border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', color: '#94a3b8', cursor: 'pointer',
          }}>
            <option value="all">Alle types</option>
            <option value="task">Taak</option>
            <option value="action">Actie</option>
            <option value="measure">Maatregel</option>
            <option value="milestone">Milestone</option>
          </select>
          <select value={projectFilter} onChange={e => setProjectFilter(e.target.value)} style={{
            fontSize: '12px', padding: '6px 10px', background: 'rgba(255,255,255,0.05)',
            border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', color: '#94a3b8', cursor: 'pointer',
          }}>
            <option value="all">Alle projecten</option>
            <option value="">Geen project</option>
            {projects.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
          </select>
        </div>
      </div>

      {/* Create form */}
      {showForm && (
        <div className="glass" style={{ padding: '24px', marginBottom: '24px', border: '1px solid rgba(59,130,246,0.3)' }}>
          <h3 style={{ margin: '0 0 20px', color: '#f1f5f9', fontSize: '16px', fontWeight: '700' }}>Nieuw item aanmaken</h3>
          <form onSubmit={handleCreate} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
            <div style={{ gridColumn: '1 / -1' }}>
              <label style={{ display: 'block', fontSize: '12px', color: '#94a3b8', marginBottom: '6px', fontWeight: '600' }}>Titel *</label>
              <input className="input-dark" placeholder="Wat moet er gedaan worden?" value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} required />
            </div>
            <div style={{ gridColumn: '1 / -1' }}>
              <label style={{ display: 'block', fontSize: '12px', color: '#94a3b8', marginBottom: '6px', fontWeight: '600' }}>Beschrijving</label>
              <textarea className="input-dark" placeholder="Beschrijving..." value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} rows={2} style={{ resize: 'vertical' }} />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '12px', color: '#94a3b8', marginBottom: '6px', fontWeight: '600' }}>Type</label>
              <select className="input-dark" value={form.type} onChange={e => setForm({ ...form, type: e.target.value })}>
                <option value="task">📌 Taak</option>
                <option value="action">⚡ Actie</option>
                <option value="measure">🎯 Maatregel</option>
                <option value="milestone">🏆 Milestone</option>
              </select>
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '12px', color: '#94a3b8', marginBottom: '6px', fontWeight: '600' }}>Project</label>
              <select className="input-dark" value={form.projectId} onChange={e => setForm({ ...form, projectId: e.target.value })}>
                <option value="">Geen project</option>
                {projects.map(p => <option key={p.id} value={p.id}>{(p as Project & { shortId?: string }).shortId ? `${(p as Project & { shortId?: string }).shortId} - ` : ''}{p.name}</option>)}
              </select>
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '12px', color: '#94a3b8', marginBottom: '6px', fontWeight: '600' }}>Status</label>
              <select className="input-dark" value={form.status} onChange={e => setForm({ ...form, status: e.target.value })}>
                <option value="todo">Te doen</option>
                <option value="in_progress">Bezig</option>
                <option value="review">Review</option>
                <option value="blocked">Geblokkeerd</option>
                <option value="done">Klaar</option>
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
            <div>
              <label style={{ display: 'block', fontSize: '12px', color: '#94a3b8', marginBottom: '6px', fontWeight: '600' }}>Categorie</label>
              <select className="input-dark" value={form.categoryId} onChange={e => setForm({ ...form, categoryId: e.target.value })}>
                <option value="">Geen categorie</option>
                {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
            </div>
            <div style={{ gridColumn: '1 / -1', display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
              <button type="button" className="btn-secondary" onClick={() => setShowForm(false)}>Annuleren</button>
              <button type="submit" className="btn-primary" disabled={saving}>{saving ? 'Aanmaken...' : 'Item aanmaken'}</button>
            </div>
          </form>
        </div>
      )}

      {/* Items list */}
      {loading ? (
        <div style={{ textAlign: 'center', padding: '60px', color: '#475569' }}>Laden...</div>
      ) : filtered.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '60px' }}>
          <div style={{ fontSize: '48px', marginBottom: '16px' }}>✅</div>
          <p style={{ color: '#475569' }}>Geen items gevonden</p>
          <button className="btn-primary" onClick={() => setShowForm(true)} style={{ marginTop: '16px' }}>Maak je eerste item aan</button>
        </div>
      ) : (
        <GroupedItemList
          items={filtered}
          typeFilter={typeFilter}
          getProject={getProject}
          getCategory={getCategory}
          onOpenPanel={openPanel}
          onUpdateStatus={handleUpdateStatus}
          onNavigate={(path) => router.push(path)}
        />
      )}
    </div>
  );
}
