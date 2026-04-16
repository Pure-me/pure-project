'use client';

import { useState } from 'react';
import { Project, WorkItem, QualityItem, Category } from '@/lib/db';
import ItemPanel, { PanelItem } from '@/components/ItemPanel';
import GanttChart from '@/components/GanttChart';
import ExportBar from '@/components/ExportBar';

const STATUS_COLORS: Record<string, string> = {
  todo: '#64748b', in_progress: '#3b82f6', review: '#f59e0b', done: '#10b981', blocked: '#f43f5e',
  planning: '#8b5cf6', active: '#3b82f6', on_hold: '#f59e0b', completed: '#10b981', cancelled: '#f43f5e',
  open: '#3b82f6', in_progress_q: '#f59e0b', closed: '#10b981', verified: '#8b5cf6',
};
const STATUS_LABELS: Record<string, string> = {
  todo: 'Te doen', in_progress: 'Bezig', review: 'Review', done: 'Klaar', blocked: 'Geblokkeerd',
  planning: 'Gepland', active: 'Actief', on_hold: 'On hold', completed: 'Voltooid', cancelled: 'Geannuleerd',
  open: 'Open', closed: 'Gesloten', verified: 'Geverifieerd',
};
const PRIORITY_COLORS: Record<string, string> = {
  low: '#64748b', medium: '#3b82f6', high: '#f59e0b', critical: '#f43f5e',
};
const TYPE_ICONS: Record<string, string> = {
  measure: '🎯', action: '⚡', task: '📌', milestone: '🏆',
};
const TYPE_LABELS: Record<string, string> = {
  measure: 'Maatregel', action: 'Actie', task: 'Taak', milestone: 'Milestone',
};

interface Props {
  project: Project;
  measures: WorkItem[];
  actions: WorkItem[];
  tasks: WorkItem[];
  milestones: WorkItem[];
  quality: QualityItem[];
  categories: Category[];
  allItems: WorkItem[];
}

function ItemRow({ item, level = 0, children, onStatusChange, onAddChild, onOpen }: {
  item: WorkItem;
  level?: number;
  children?: React.ReactNode;
  onStatusChange: (id: string, status: string) => void;
  onAddChild: (parentId: string, parentType: string, childType: string) => void;
  onOpen: (item: WorkItem) => void;
}) {
  const [expanded, setExpanded] = useState(true);
  const isOverdue = item.dueDate && new Date(item.dueDate) < new Date() && item.status !== 'done';

  return (
    <div>
      <div style={{
        display: 'flex', alignItems: 'center', gap: '8px',
        padding: '10px 12px',
        marginLeft: `${level * 24}px`,
        borderRadius: '8px',
        background: level === 0 ? 'rgba(255,255,255,0.04)' : 'rgba(255,255,255,0.02)',
        border: `1px solid ${isOverdue ? 'rgba(244,63,94,0.25)' : 'rgba(255,255,255,0.06)'}`,
        marginBottom: '6px',
        transition: 'background 0.15s',
      }}>
        {/* Expand toggle */}
        {children ? (
          <button onClick={() => setExpanded(!expanded)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#475569', fontSize: '12px', padding: '0 4px', flexShrink: 0 }}>
            {expanded ? '▼' : '▶'}
          </button>
        ) : <span style={{ width: '20px', flexShrink: 0 }} />}

        {/* Type icon */}
        <span style={{ fontSize: '14px', flexShrink: 0 }}>{TYPE_ICONS[item.type]}</span>

        {/* Short ID */}
        <span style={{ fontSize: '11px', fontFamily: 'monospace', color: '#475569', fontWeight: '700', flexShrink: 0, background: 'rgba(255,255,255,0.06)', padding: '2px 6px', borderRadius: '4px' }}>
          {item.shortId}
        </span>

        {/* Priority dot */}
        <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: PRIORITY_COLORS[item.priority], flexShrink: 0 }} />

        {/* Title (clickable to open panel) */}
        <span
          onClick={() => onOpen(item)}
          style={{ flex: 1, fontSize: '13px', fontWeight: '500', color: item.status === 'done' ? '#475569' : '#e2e8f0', textDecoration: item.status === 'done' ? 'line-through' : 'none', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', cursor: 'pointer' }}
          title="Klik voor details, updates & bijlagen"
        >
          {item.title}
        </span>

        {/* Due date */}
        {item.dueDate && (
          <span style={{ fontSize: '11px', color: isOverdue ? '#f87171' : '#475569', flexShrink: 0 }}>
            {isOverdue ? '⏰' : '📅'} {new Date(item.dueDate).toLocaleDateString('nl-BE', { day: '2-digit', month: '2-digit' })}
          </span>
        )}

        {/* Comments */}
        {item.comments?.length > 0 && (
          <span style={{ fontSize: '11px', color: '#475569', flexShrink: 0 }}>💬 {item.comments.length}</span>
        )}
        {/* Attachments */}
        {(item.attachments as unknown[])?.length > 0 && (
          <span style={{ fontSize: '11px', color: '#475569', flexShrink: 0 }}>📎 {(item.attachments as unknown[]).length}</span>
        )}

        {/* Detail button */}
        <button
          onClick={() => onOpen(item)}
          style={{ padding: '3px 7px', fontSize: '11px', background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '5px', color: '#64748b', cursor: 'pointer', flexShrink: 0 }}
          title="Updates & bijlagen"
        >⋯</button>

        {/* Status */}
        <select
          value={item.status}
          onChange={e => onStatusChange(item.id, e.target.value)}
          style={{ fontSize: '11px', padding: '3px 8px', background: `${STATUS_COLORS[item.status]}22`, border: `1px solid ${STATUS_COLORS[item.status]}44`, borderRadius: '6px', color: STATUS_COLORS[item.status], cursor: 'pointer', fontWeight: '600', flexShrink: 0 }}
        >
          <option value="todo">Te doen</option>
          <option value="in_progress">Bezig</option>
          <option value="review">Review</option>
          <option value="done">Klaar</option>
          <option value="blocked">Geblokkeerd</option>
        </select>

        {/* Add child button */}
        {item.type !== 'task' && item.type !== 'milestone' && (
          <button
            onClick={() => onAddChild(item.id, item.type, item.type === 'measure' ? 'action' : 'task')}
            style={{ padding: '3px 8px', fontSize: '11px', background: 'rgba(59,130,246,0.1)', border: '1px solid rgba(59,130,246,0.2)', borderRadius: '6px', color: '#60a5fa', cursor: 'pointer', flexShrink: 0 }}
            title={`${item.type === 'measure' ? 'Actie' : 'Taak'} toevoegen`}
          >
            +{item.type === 'measure' ? 'Actie' : 'Taak'}
          </button>
        )}
      </div>
      {expanded && children && <div>{children}</div>}
    </div>
  );
}

export default function ProjectDetailClient({ project, measures, actions, tasks, milestones, quality, categories, allItems }: Props) {
  const [items, setItems] = useState({ measures, actions, tasks, milestones });
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    type: 'task', title: '', description: '', priority: 'medium',
    dueDate: '', categoryId: '', parentId: '', parentType: 'project' as string,
    linkedToType: '', linkedToId: '',
  });
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState<'hierarchy' | 'flat' | 'gantt' | 'quality'>('hierarchy');
  const [aiMsg, setAiMsg] = useState('');
  const [aiResp, setAiResp] = useState('');
  const [aiLoading, setAiLoading] = useState(false);
  const [panelItem, setPanelItem] = useState<PanelItem | null>(null);

  const openItemPanel = (item: WorkItem) => {
    setPanelItem({
      id: item.id,
      shortId: item.shortId,
      title: item.title,
      description: item.description,
      status: item.status,
      priority: item.priority,
      type: TYPE_LABELS[item.type] || item.type,
      dueDate: item.dueDate,
      comments: (item.comments || []) as PanelItem['comments'],
      attachments: (item.attachments as unknown as PanelItem['attachments']) || [],
      entityType: 'workitem',
    });
  };

  // Deduplicate across type arrays to prevent duplicate React keys
  const seenIds = new Set<string>();
  const allCurrentItems = [...items.measures, ...items.actions, ...items.tasks, ...items.milestones]
    .filter(i => { if (seenIds.has(i.id)) return false; seenIds.add(i.id); return true; });

  const handleStatusChange = async (id: string, status: string) => {
    const res = await fetch(`/api/workitems/${id}`, {
      method: 'PATCH', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status, ...(status === 'done' ? { completedAt: new Date().toISOString() } : {}) }),
    });
    if (res.ok) {
      const updated = await res.json();
      setItems(prev => ({
        measures: prev.measures.map(i => i.id === id ? updated : i),
        actions: prev.actions.map(i => i.id === id ? updated : i),
        tasks: prev.tasks.map(i => i.id === id ? updated : i),
        milestones: prev.milestones.map(i => i.id === id ? updated : i),
      }));
    }
  };

  const handleAddChild = (parentId: string, parentType: string, childType: string) => {
    setFormData(f => ({ ...f, type: childType, parentId, parentType, title: '' }));
    setShowForm(true);
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    const res = await fetch('/api/workitems', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...formData, projectId: project.id }),
    });
    if (res.ok) {
      const item = await res.json();
      setItems(prev => ({
        ...prev,
        measures: item.type === 'measure' ? [...prev.measures, item] : prev.measures,
        actions: item.type === 'action' ? [...prev.actions, item] : prev.actions,
        tasks: item.type === 'task' ? [...prev.tasks, item] : prev.tasks,
        milestones: item.type === 'milestone' ? [...prev.milestones, item] : prev.milestones,
      }));
      setShowForm(false);
      setFormData({ type: 'task', title: '', description: '', priority: 'medium', dueDate: '', categoryId: '', parentId: '', parentType: 'project', linkedToType: '', linkedToId: '' });
    }
    setSaving(false);
  };

  const sendAi = async () => {
    if (!aiMsg.trim()) return;
    setAiLoading(true); setAiResp('');
    const res = await fetch('/api/ai', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ message: aiMsg }) });
    const d = await res.json();
    setAiResp(d.response || ''); setAiLoading(false); setAiMsg('');
  };

  // Build hierarchy: measures → actions → tasks
  const renderHierarchy = () => {
    // Top-level items (parent = project or no parent)
    const topMeasures   = items.measures.filter(m => !m.parentId || m.parentType === 'project');
    const topActions    = items.actions.filter(a => !a.parentId || a.parentType === 'project');
    const topTasks      = items.tasks.filter(t => !t.parentId || t.parentType === 'project');
    const topMilestones = items.milestones.filter(m => !m.parentId || m.parentType === 'project');

    const actionsOf = (parentId: string) => items.actions.filter(a => a.parentId === parentId);
    const tasksOf   = (parentId: string) => items.tasks.filter(t => t.parentId === parentId);

    if (allCurrentItems.length === 0) return (
      <div style={{ textAlign: 'center', padding: '40px', color: '#475569' }}>
        <div style={{ fontSize: '40px', marginBottom: '12px' }}>📋</div>
        <p>Nog geen items. Voeg een maatregel, actie of taak toe.</p>
        <button className="btn-primary" onClick={() => setShowForm(true)} style={{ marginTop: '12px' }}>+ Item toevoegen</button>
      </div>
    );

    return (
      <div>
        {topMilestones.map(mil => (
          <ItemRow key={mil.id} item={mil} level={0} onStatusChange={handleStatusChange} onAddChild={handleAddChild} onOpen={openItemPanel} />
        ))}
        {topMeasures.map(mes => (
          <ItemRow key={mes.id} item={mes} level={0} onStatusChange={handleStatusChange} onAddChild={handleAddChild} onOpen={openItemPanel}>
            {(actionsOf(mes.id).length > 0 || tasksOf(mes.id).length > 0) && (
              <>
                {actionsOf(mes.id).map(act => (
                  <ItemRow key={act.id} item={act} level={1} onStatusChange={handleStatusChange} onAddChild={handleAddChild} onOpen={openItemPanel}>
                    {tasksOf(act.id).length > 0 && (
                      <>
                        {tasksOf(act.id).map(tsk => (
                          <ItemRow key={tsk.id} item={tsk} level={2} onStatusChange={handleStatusChange} onAddChild={handleAddChild} onOpen={openItemPanel} />
                        ))}
                      </>
                    )}
                  </ItemRow>
                ))}
                {tasksOf(mes.id).map(tsk => (
                  <ItemRow key={tsk.id} item={tsk} level={1} onStatusChange={handleStatusChange} onAddChild={handleAddChild} onOpen={openItemPanel} />
                ))}
              </>
            )}
          </ItemRow>
        ))}
        {topActions.map(act => (
          <ItemRow key={act.id} item={act} level={0} onStatusChange={handleStatusChange} onAddChild={handleAddChild} onOpen={openItemPanel}>
            {tasksOf(act.id).length > 0 && (
              <>
                {tasksOf(act.id).map(tsk => (
                  <ItemRow key={tsk.id} item={tsk} level={1} onStatusChange={handleStatusChange} onAddChild={handleAddChild} onOpen={openItemPanel} />
                ))}
              </>
            )}
          </ItemRow>
        ))}
        {topTasks.map(tsk => (
          <ItemRow key={tsk.id} item={tsk} level={0} onStatusChange={handleStatusChange} onAddChild={handleAddChild} onOpen={openItemPanel} />
        ))}
      </div>
    );
  };

  const openItems = allCurrentItems.filter(i => i.status !== 'done');
  const doneItems = allCurrentItems.filter(i => i.status === 'done');
  const progress = allCurrentItems.length > 0 ? Math.round((doneItems.length / allCurrentItems.length) * 100) : project.progress;

  // Status counts
  const statusCounts: Record<string, number> = { todo: 0, in_progress: 0, review: 0, done: 0, blocked: 0 };
  allCurrentItems.forEach(i => { if (statusCounts[i.status] !== undefined) statusCounts[i.status]++; });

  // Timing 1: days from today to project end date
  const today = new Date(); today.setHours(0, 0, 0, 0);
  const endDate = project.endDate ? new Date(project.endDate) : null;
  const daysToEnd = endDate ? Math.round((endDate.getTime() - today.getTime()) / 86400000) : null;
  const endOverdue = daysToEnd !== null && daysToEnd < 0 && project.status !== 'completed' && project.status !== 'cancelled';

  // Timing 2: open actions (workItems of type 'action' that are not done)
  const openActions = items.actions.filter(a => a.status !== 'done');
  const overdueActions = openActions.filter(a => a.dueDate && new Date(a.dueDate) < today);

  return (
    <div style={{ maxWidth: '1100px' }}>
      {/* Item detail panel */}
      {panelItem && <ItemPanel item={panelItem} onClose={() => setPanelItem(null)} />}

      {/* Breadcrumb */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '20px', fontSize: '13px', color: '#475569' }}>
        <a href="/dashboard/projects" style={{ color: '#60a5fa', textDecoration: 'none' }}>Projecten</a>
        <span>›</span>
        <span style={{ color: '#94a3b8' }}>{project.shortId}</span>
        <span>›</span>
        <span style={{ color: '#f1f5f9' }}>{project.name}</span>
      </div>

      {/* Project header */}
      <div className="glass" style={{ padding: '24px', marginBottom: '24px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '16px', flexWrap: 'wrap' }}>
          <div style={{ flex: 1 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '6px', flexWrap: 'wrap' }}>
              <span style={{ fontSize: '12px', fontFamily: 'monospace', background: 'rgba(59,130,246,0.15)', color: '#60a5fa', padding: '3px 8px', borderRadius: '6px', fontWeight: '700' }}>
                {project.shortId}
              </span>
              <span style={{ fontSize: '12px', padding: '3px 10px', borderRadius: '6px', background: `${STATUS_COLORS[project.status]}22`, color: STATUS_COLORS[project.status] }}>
                {STATUS_LABELS[project.status]}
              </span>
              <span style={{ fontSize: '12px', padding: '3px 10px', borderRadius: '6px', background: `${PRIORITY_COLORS[project.priority]}22`, color: PRIORITY_COLORS[project.priority] }}>
                {project.priority}
              </span>
            </div>
            <h1 style={{ fontSize: '22px', fontWeight: '800', color: '#f1f5f9', margin: '0 0 8px' }}>{project.name}</h1>
            {project.description && <p style={{ color: '#64748b', margin: '0 0 16px', fontSize: '14px', lineHeight: '1.5' }}>{project.description}</p>}
            <div style={{ display: 'flex', gap: '16px', fontSize: '12px', color: '#475569', flexWrap: 'wrap' }}>
              {project.startDate && <span>📅 Start: {new Date(project.startDate).toLocaleDateString('nl-BE')}</span>}
              {project.endDate && <span>🏁 Einde: {new Date(project.endDate).toLocaleDateString('nl-BE')}</span>}
              <span>📊 {allCurrentItems.length} items · {openItems.length} open · {doneItems.length} klaar</span>
            </div>
          </div>
          <div style={{ textAlign: 'center', minWidth: '80px' }}>
            <div style={{ fontSize: '32px', fontWeight: '800', color: progress >= 75 ? '#10b981' : progress >= 40 ? '#f59e0b' : '#3b82f6' }}>{progress}%</div>
            <div className="progress-bar" style={{ width: '80px' }}>
              <div className="progress-fill" style={{ width: `${progress}%`, background: progress >= 75 ? '#10b981' : progress >= 40 ? '#f59e0b' : '#3b82f6' }} />
            </div>
            <div style={{ fontSize: '11px', color: '#475569', marginTop: '4px' }}>voltooid</div>
          </div>
        </div>
      </div>

      {/* Status counts + Timings */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(110px, 1fr))', gap: '10px', marginBottom: '20px' }}>
        {/* Status pills */}
        {[
          { key: 'todo',        label: 'Te doen',    color: '#64748b' },
          { key: 'in_progress', label: 'Bezig',      color: '#3b82f6' },
          { key: 'review',      label: 'Review',     color: '#f59e0b' },
          { key: 'blocked',     label: 'Geblokkeerd', color: '#f43f5e' },
          { key: 'done',        label: 'Klaar',      color: '#10b981' },
        ].map(({ key, label, color }) => (
          <div key={key} style={{ background: 'rgba(255,255,255,0.04)', border: `1px solid ${color}22`, borderRadius: '10px', padding: '12px 14px', textAlign: 'center' }}>
            <div style={{ fontSize: '22px', fontWeight: '800', color }}>{statusCounts[key]}</div>
            <div style={{ fontSize: '11px', color: '#64748b', marginTop: '2px' }}>{label}</div>
          </div>
        ))}
        {/* Timing 1: Einddatum */}
        <div style={{ background: endOverdue ? 'rgba(244,63,94,0.08)' : 'rgba(255,255,255,0.04)', border: `1px solid ${endOverdue ? 'rgba(244,63,94,0.3)' : 'rgba(255,255,255,0.08)'}`, borderRadius: '10px', padding: '12px 14px', textAlign: 'center' }}>
          <div style={{ fontSize: '10px', color: '#475569', marginBottom: '4px', textTransform: 'uppercase', letterSpacing: '0.06em' }}>⏱ Einddatum</div>
          {daysToEnd !== null ? (
            <>
              <div style={{ fontSize: '18px', fontWeight: '800', color: endOverdue ? '#f87171' : daysToEnd <= 7 ? '#f59e0b' : '#10b981' }}>
                {endOverdue ? `-${Math.abs(daysToEnd)}d` : `${daysToEnd}d`}
              </div>
              <div style={{ fontSize: '10px', color: '#475569', marginTop: '2px' }}>{endOverdue ? 'te laat' : 'resterend'}</div>
            </>
          ) : <div style={{ fontSize: '13px', color: '#475569' }}>—</div>}
        </div>
        {/* Timing 2: Open acties */}
        <div style={{ background: overdueActions.length > 0 ? 'rgba(244,63,94,0.08)' : 'rgba(255,255,255,0.04)', border: `1px solid ${overdueActions.length > 0 ? 'rgba(244,63,94,0.3)' : 'rgba(255,255,255,0.08)'}`, borderRadius: '10px', padding: '12px 14px', textAlign: 'center' }}>
          <div style={{ fontSize: '10px', color: '#475569', marginBottom: '4px', textTransform: 'uppercase', letterSpacing: '0.06em' }}>⚡ Open acties</div>
          <div style={{ fontSize: '18px', fontWeight: '800', color: overdueActions.length > 0 ? '#f87171' : openActions.length > 0 ? '#f59e0b' : '#10b981' }}>{openActions.length}</div>
          {overdueActions.length > 0 && <div style={{ fontSize: '10px', color: '#f87171', marginTop: '2px' }}>{overdueActions.length} verlopen ⏰</div>}
          {openActions.length === 0 && <div style={{ fontSize: '10px', color: '#10b981', marginTop: '2px' }}>Alles klaar ✓</div>}
        </div>
      </div>

      {/* Tabs + Add button */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', flexWrap: 'wrap', gap: '12px' }}>
        <div style={{ display: 'flex', gap: '4px', background: 'rgba(255,255,255,0.05)', padding: '4px', borderRadius: '10px' }}>
          {([
            { key: 'hierarchy', label: '🌳 Hiërarchie' },
            { key: 'flat', label: '📋 Overzicht' },
            { key: 'gantt', label: '📅 Gantt' },
            { key: 'quality', label: `🔍 Kwaliteit (${quality.length})` },
          ] as const).map(tab => (
            <button key={tab.key} onClick={() => setActiveTab(tab.key)} style={{
              padding: '7px 16px', borderRadius: '8px', border: 'none', cursor: 'pointer', fontSize: '13px', fontWeight: '600',
              background: activeTab === tab.key ? 'linear-gradient(135deg, #3b82f6, #2563eb)' : 'transparent',
              color: activeTab === tab.key ? 'white' : '#64748b',
              transition: 'all 0.15s',
            }}>{tab.label}</button>
          ))}
        </div>
        <button className="btn-primary" onClick={() => setShowForm(true)}>+ Item toevoegen</button>
      </div>

      {/* Add form */}
      {showForm && (
        <div className="glass" style={{ padding: '20px', marginBottom: '20px', border: '1px solid rgba(59,130,246,0.3)' }}>
          <h3 style={{ margin: '0 0 16px', color: '#f1f5f9', fontSize: '14px', fontWeight: '700' }}>Nieuw item toevoegen aan {project.shortId}</h3>
          <form onSubmit={handleCreate} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
            <div>
              <label style={{ display: 'block', fontSize: '12px', color: '#94a3b8', marginBottom: '6px', fontWeight: '600' }}>Type</label>
              <select className="input-dark" value={formData.type} onChange={e => setFormData(f => ({ ...f, type: e.target.value }))}>
                <option value="measure">🎯 Maatregel</option>
                <option value="action">⚡ Actie</option>
                <option value="task">📌 Taak</option>
                <option value="milestone">🏆 Milestone</option>
              </select>
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '12px', color: '#94a3b8', marginBottom: '6px', fontWeight: '600' }}>Prioriteit</label>
              <select className="input-dark" value={formData.priority} onChange={e => setFormData(f => ({ ...f, priority: e.target.value }))}>
                <option value="low">Laag</option>
                <option value="medium">Medium</option>
                <option value="high">Hoog</option>
                <option value="critical">Kritiek</option>
              </select>
            </div>
            <div style={{ gridColumn: '1 / -1' }}>
              <label style={{ display: 'block', fontSize: '12px', color: '#94a3b8', marginBottom: '6px', fontWeight: '600' }}>Titel *</label>
              <input className="input-dark" placeholder="Beschrijf de maatregel, actie of taak..." value={formData.title} onChange={e => setFormData(f => ({ ...f, title: e.target.value }))} required />
            </div>
            <div style={{ gridColumn: '1 / -1' }}>
              <label style={{ display: 'block', fontSize: '12px', color: '#94a3b8', marginBottom: '6px', fontWeight: '600' }}>Beschrijving</label>
              <textarea className="input-dark" placeholder="Optionele details..." value={formData.description} onChange={e => setFormData(f => ({ ...f, description: e.target.value }))} rows={2} style={{ resize: 'vertical' }} />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '12px', color: '#94a3b8', marginBottom: '6px', fontWeight: '600' }}>Koppel aan (optioneel)</label>
              <select className="input-dark" value={`${formData.parentType}:${formData.parentId}`} onChange={e => {
                const [type, id] = e.target.value.split(':');
                setFormData(f => ({ ...f, parentType: type, parentId: id || '' }));
              }}>
                <option value="project:">Rechtstreeks aan project</option>
                {items.measures.map(m => <option key={m.id} value={`measure:${m.id}`}>{m.shortId} — {m.title}</option>)}
                {items.actions.map(a => <option key={a.id} value={`action:${a.id}`}>{a.shortId} — {a.title}</option>)}
              </select>
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '12px', color: '#94a3b8', marginBottom: '6px', fontWeight: '600' }}>Deadline</label>
              <input className="input-dark" type="date" value={formData.dueDate} onChange={e => setFormData(f => ({ ...f, dueDate: e.target.value }))} />
            </div>
            {categories.length > 0 && (
              <div>
                <label style={{ display: 'block', fontSize: '12px', color: '#94a3b8', marginBottom: '6px', fontWeight: '600' }}>Categorie</label>
                <select className="input-dark" value={formData.categoryId} onChange={e => setFormData(f => ({ ...f, categoryId: e.target.value }))}>
                  <option value="">Geen categorie</option>
                  {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                </select>
              </div>
            )}
            <div>
              <label style={{ display: 'block', fontSize: '12px', color: '#94a3b8', marginBottom: '6px', fontWeight: '600' }}>Koppel aan NC/BCM</label>
              <select className="input-dark" value={`${formData.linkedToType}:${formData.linkedToId}`} onChange={e => {
                const [type, id] = e.target.value.split(':');
                setFormData(f => ({ ...f, linkedToType: type, linkedToId: id || '' }));
              }}>
                <option value=":">Geen</option>
                {quality.map(q => <option key={q.id} value={`non_conformity:${q.id}`}>{q.shortId} — {q.title}</option>)}
              </select>
            </div>
            <div style={{ gridColumn: '1 / -1', display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
              <button type="button" className="btn-secondary" onClick={() => setShowForm(false)}>Annuleren</button>
              <button type="submit" className="btn-primary" disabled={saving}>{saving ? 'Aanmaken...' : 'Item aanmaken'}</button>
            </div>
          </form>
        </div>
      )}

      {/* Content */}
      {activeTab === 'hierarchy' && (
        <div className="glass" style={{ padding: '20px' }}>
          <div style={{ marginBottom: '16px', display: 'flex', gap: '12px', fontSize: '12px', color: '#475569', flexWrap: 'wrap' }}>
            <span>🎯 {items.measures.length} maatregelen</span>
            <span>⚡ {items.actions.length} acties</span>
            <span>📌 {items.tasks.length} taken</span>
            <span>🏆 {items.milestones.length} milestones</span>
          </div>
          {renderHierarchy()}
        </div>
      )}

      {activeTab === 'flat' && (
        <div className="glass" style={{ padding: '20px' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {allCurrentItems.length === 0 ? (
              <p style={{ color: '#475569', textAlign: 'center', padding: '24px' }}>Geen items gevonden.</p>
            ) : (
              allCurrentItems
                .sort((a, b) => {
                  const p = { critical: 0, high: 1, medium: 2, low: 3 };
                  return p[a.priority] - p[b.priority];
                })
                .map(item => {
                  const isOverdue = item.dueDate && new Date(item.dueDate) < new Date() && item.status !== 'done';
                  const cat = categories.find(c => c.id === item.categoryId);
                  return (
                    <div key={item.id} style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '12px 14px', background: 'rgba(255,255,255,0.03)', borderRadius: '8px', border: `1px solid ${isOverdue ? 'rgba(244,63,94,0.25)' : 'rgba(255,255,255,0.06)'}`, cursor: 'pointer' }} onClick={() => openItemPanel(item)}>
                      <span style={{ fontSize: '13px' }}>{TYPE_ICONS[item.type]}</span>
                      <span style={{ fontSize: '11px', fontFamily: 'monospace', color: '#60a5fa', background: 'rgba(59,130,246,0.1)', padding: '2px 6px', borderRadius: '4px', fontWeight: '700', flexShrink: 0 }}>{item.shortId}</span>
                      <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: PRIORITY_COLORS[item.priority], flexShrink: 0 }} />
                      <span style={{ flex: 1, fontSize: '13px', color: item.status === 'done' ? '#475569' : '#e2e8f0', textDecoration: item.status === 'done' ? 'line-through' : 'none' }}>{item.title}</span>
                      {cat && <span style={{ fontSize: '11px', padding: '2px 8px', borderRadius: '5px', background: `${cat.color}22`, color: cat.color, flexShrink: 0 }}>{cat.name}</span>}
                      {item.dueDate && <span style={{ fontSize: '11px', color: isOverdue ? '#f87171' : '#475569', flexShrink: 0 }}>{isOverdue ? '⏰' : '📅'} {new Date(item.dueDate).toLocaleDateString('nl-BE', { day: '2-digit', month: '2-digit' })}</span>}
                      <select value={item.status} onClick={e => e.stopPropagation()} onChange={e => { e.stopPropagation(); handleStatusChange(item.id, e.target.value); }} style={{ fontSize: '11px', padding: '3px 8px', background: `${STATUS_COLORS[item.status]}22`, border: `1px solid ${STATUS_COLORS[item.status]}44`, borderRadius: '6px', color: STATUS_COLORS[item.status], cursor: 'pointer', fontWeight: '600', flexShrink: 0 }}>
                        <option value="todo">Te doen</option>
                        <option value="in_progress">Bezig</option>
                        <option value="review">Review</option>
                        <option value="done">Klaar</option>
                        <option value="blocked">Geblokkeerd</option>
                      </select>
                    </div>
                  );
                })
            )}
          </div>
        </div>
      )}

      {activeTab === 'gantt' && (
        <div className="glass" style={{ padding: '20px' }}>
          <ExportBar
            title={`${project.name} — Gantt`}
            subtitle={`${project.shortId} — Pure Project`}
            columns={[
              { key: 'shortId', label: 'ID', width: 12 },
              { key: 'title', label: 'Titel', width: 40 },
              { key: 'type', label: 'Type', width: 14 },
              { key: 'status', label: 'Status', width: 14 },
              { key: 'dueDate', label: 'Deadline', width: 18 },
            ]}
            rows={allCurrentItems}
            filename={`gantt-${project.shortId}`}
            count={allCurrentItems.length}
          />
          <GanttChart
            items={allCurrentItems.map(i => ({
              ...i,
              startDate: i.createdAt,
              endDate: i.dueDate,
            }))}
            title={`${project.shortId} — ${project.name}`}
          />
        </div>
      )}

      {activeTab === 'quality' && (
        <div className="glass" style={{ padding: '20px' }}>
          {quality.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '32px', color: '#475569' }}>
              <div style={{ fontSize: '36px', marginBottom: '12px' }}>✅</div>
              <p>Geen kwaliteitsitems gekoppeld aan dit project.</p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {quality.map(q => (
                <div key={q.id} style={{ padding: '14px 16px', background: 'rgba(255,255,255,0.03)', borderRadius: '10px', border: '1px solid rgba(255,255,255,0.06)', display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <span style={{ fontSize: '11px', fontFamily: 'monospace', color: '#f59e0b', background: 'rgba(245,158,11,0.1)', padding: '2px 6px', borderRadius: '4px', fontWeight: '700', flexShrink: 0 }}>{q.shortId}</span>
                  <span style={{ flex: 1, fontSize: '13px', color: '#e2e8f0' }}>{q.title}</span>
                  <span style={{ fontSize: '11px', padding: '2px 8px', borderRadius: '5px', background: q.priority === 'critical' ? 'rgba(244,63,94,0.15)' : q.priority === 'high' ? 'rgba(245,158,11,0.15)' : 'rgba(100,116,139,0.15)', color: q.priority === 'critical' ? '#f87171' : q.priority === 'high' ? '#fbbf24' : '#94a3b8', flexShrink: 0 }}>{q.priority}</span>
                  <span style={{ fontSize: '11px', padding: '2px 8px', borderRadius: '5px', background: `${STATUS_COLORS[q.status] || '#64748b'}22`, color: STATUS_COLORS[q.status] || '#64748b', flexShrink: 0 }}>{STATUS_LABELS[q.status] || q.status}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* AI Assistent */}
      <div className="glass" style={{ padding: '20px', marginTop: '20px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '12px' }}>
          <span style={{ fontSize: '20px' }}>🤖</span>
          <div>
            <div style={{ fontWeight: '700', color: '#f1f5f9', fontSize: '14px' }}>Pure AI — Project Assistent</div>
            <div style={{ fontSize: '11px', color: '#475569' }}>Gebruik een ID om items bij te werken (bijv. "update ACT-001 naar klaar")</div>
          </div>
        </div>
        {aiResp && (
          <div style={{ marginBottom: '12px', padding: '14px', background: 'rgba(139,92,246,0.08)', border: '1px solid rgba(139,92,246,0.2)', borderRadius: '10px', fontSize: '13px', color: '#c4b5fd', whiteSpace: 'pre-line' }}>
            {aiLoading ? '⏳ Bezig...' : aiResp}
          </div>
        )}
        <div style={{ display: 'flex', gap: '10px' }}>
          <input className="input-dark" style={{ flex: 1 }} placeholder={`bijv. "update ${allCurrentItems[0]?.shortId || 'ACT-001'} naar klaar" of "voeg opmerking toe aan ${allCurrentItems[0]?.shortId || 'TSK-001'}: ..."`} value={aiMsg} onChange={e => setAiMsg(e.target.value)} onKeyDown={e => e.key === 'Enter' && sendAi()} />
          <button className="btn-primary" onClick={sendAi} disabled={aiLoading || !aiMsg.trim()}>Stuur</button>
        </div>
      </div>
    </div>
  );
}
