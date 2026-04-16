'use client';

import { useState, useRef, useCallback } from 'react';

// ─── Types ────────────────────────────────────────────────────────────────────

export interface PanelComment {
  id: string;
  authorId: string;
  authorName: string;
  text: string;
  type?: 'comment' | 'status_change' | 'attachment';
  createdAt: string;
}

export interface PanelAttachment {
  id: string;
  filename: string;
  storedName: string;
  mimeType: string;
  size: number;
  url: string;
  uploadedBy: string;
  uploadedByName: string;
  createdAt: string;
}

export interface PanelItem {
  id: string;
  shortId?: string;
  title: string;
  description?: string;
  status: string;
  priority?: string;
  type?: string;           // entity type label for display
  dueDate?: string;
  completedAt?: string;
  comments: PanelComment[];
  attachments: PanelAttachment[];
  // entity routing
  entityType: 'project' | 'workitem' | 'quality' | 'bcm' | 'capa';
}

interface Props {
  item: PanelItem | null;
  onClose: () => void;
  onUpdate?: (updatedItem: Partial<PanelItem>) => void;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

const statusColors: Record<string, string> = {
  todo: '#64748b', in_progress: '#3b82f6', review: '#f59e0b', done: '#10b981', blocked: '#f43f5e',
  planning: '#8b5cf6', active: '#3b82f6', on_hold: '#f59e0b', completed: '#10b981', cancelled: '#f43f5e',
  open: '#3b82f6', closed: '#10b981', verified: '#a78bfa', in_progress_q: '#f59e0b',
  identified: '#64748b', assessed: '#f59e0b', mitigated: '#10b981', accepted: '#8b5cf6',
};
const priorityColors: Record<string, string> = {
  low: '#64748b', medium: '#3b82f6', high: '#f59e0b', critical: '#f43f5e',
};

function formatSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function fileIcon(mimeType: string): string {
  if (mimeType.startsWith('image/')) return '🖼️';
  if (mimeType === 'application/pdf') return '📄';
  if (mimeType.includes('word')) return '📝';
  if (mimeType.includes('excel') || mimeType.includes('spreadsheet')) return '📊';
  if (mimeType.includes('powerpoint') || mimeType.includes('presentation')) return '📋';
  if (mimeType.includes('zip')) return '🗜️';
  if (mimeType.startsWith('text/')) return '📃';
  return '📎';
}

function timeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'zojuist';
  if (mins < 60) return `${mins}m geleden`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}u geleden`;
  const days = Math.floor(hrs / 24);
  if (days < 7) return `${days}d geleden`;
  return new Date(dateStr).toLocaleDateString('nl-BE');
}

// ─── Component ────────────────────────────────────────────────────────────────

export default function ItemPanel({ item, onClose, onUpdate }: Props) {
  const [tab, setTab] = useState<'info' | 'updates' | 'attachments'>('updates');
  const [commentText, setCommentText] = useState('');
  const [sendingComment, setSendingComment] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [localComments, setLocalComments] = useState<PanelComment[]>([]);
  const [localAttachments, setLocalAttachments] = useState<PanelAttachment[]>([]);
  const [dragOver, setDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Reset local state when item changes
  const prevItemId = useRef<string | null>(null);
  if (item && item.id !== prevItemId.current) {
    prevItemId.current = item.id;
    setLocalComments([]);
    setLocalAttachments([]);
    setCommentText('');
  }

  function entityApiBase(et: string) {
    if (et === 'workitem') return 'workitems';
    if (et === 'project') return 'projects';
    if (et === 'quality') return 'quality';
    if (et === 'capa') return 'capa';
    return 'bcm';
  }
  const commentEndpoint = item ? `/api/${entityApiBase(item.entityType)}/${item.id}/comment` : '';
  const attachmentEndpoint = item ? `/api/${entityApiBase(item.entityType)}/${item.id}/attachment` : '';

  // Merge server state + optimistic local additions, deduplicate by id
  const seenCommentIds = new Set<string>();
  const allComments = [...(item?.comments || []), ...localComments]
    .filter(c => { if (seenCommentIds.has(c.id)) return false; seenCommentIds.add(c.id); return true; })
    .sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());

  const seenAttIds = new Set<string>();
  const allAttachments = [...(item?.attachments || []), ...localAttachments]
    .filter(a => { if (seenAttIds.has(a.id)) return false; seenAttIds.add(a.id); return true; });

  const handleSendComment = async () => {
    if (!commentText.trim() || !item) return;
    setSendingComment(true);
    try {
      const res = await fetch(commentEndpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: commentText.trim(), type: 'comment' }),
      });
      if (res.ok) {
        const comment = await res.json();
        setLocalComments(prev => [...prev, comment]);
        setCommentText('');
      }
    } finally {
      setSendingComment(false);
    }
  };

  const uploadFile = useCallback(async (file: File) => {
    if (!item) return;
    setUploading(true);
    try {
      // Step 1: upload file to server
      const formData = new FormData();
      formData.append('file', file);
      const uploadRes = await fetch('/api/upload', { method: 'POST', body: formData });
      if (!uploadRes.ok) {
        const err = await uploadRes.json();
        alert(err.error || 'Upload mislukt');
        return;
      }
      const fileData = await uploadRes.json();

      // Step 2: attach to item
      const attRes = await fetch(attachmentEndpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(fileData),
      });
      if (attRes.ok) {
        const att = await attRes.json();
        setLocalAttachments(prev => [...prev, att]);
        // Add an activity comment about the upload
        const commentRes = await fetch(commentEndpoint, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ text: `Bijlage toegevoegd: ${file.name}`, type: 'attachment' }),
        });
        if (commentRes.ok) {
          const c = await commentRes.json();
          setLocalComments(prev => [...prev, c]);
        }
      }
    } finally {
      setUploading(false);
    }
  }, [item, attachmentEndpoint, commentEndpoint]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    files.forEach(uploadFile);
    e.target.value = '';
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    Array.from(e.dataTransfer.files).forEach(uploadFile);
  };

  const handleDeleteAttachment = async (attId: string) => {
    if (!item) return;
    if (!confirm('Bijlage verwijderen?')) return;
    const res = await fetch(attachmentEndpoint, {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ attachmentId: attId }),
    });
    if (res.ok) {
      setLocalAttachments(prev => prev.filter(a => a.id !== attId));
      if (onUpdate) onUpdate({});
    }
  };

  if (!item) return null;

  const statusColor = statusColors[item.status] || '#64748b';
  const priorityColor = item.priority ? (priorityColors[item.priority] || '#64748b') : null;

  return (
    <>
      {/* Backdrop */}
      <div
        onClick={onClose}
        style={{
          position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)',
          backdropFilter: 'blur(4px)', zIndex: 999,
        }}
      />

      {/* Panel */}
      <div style={{
        position: 'fixed', top: 0, right: 0, bottom: 0, width: '520px',
        background: '#0f172a', borderLeft: '1px solid rgba(255,255,255,0.08)',
        zIndex: 1000, display: 'flex', flexDirection: 'column',
        boxShadow: '-20px 0 60px rgba(0,0,0,0.5)',
        animation: 'slideIn 0.2s ease-out',
      }}>
        <style>{`
          @keyframes slideIn { from { transform: translateX(100%); } to { transform: translateX(0); } }
          .panel-tab { padding: 10px 16px; font-size: 13px; font-weight: 600; cursor: pointer; border: none; background: transparent; color: #64748b; border-bottom: 2px solid transparent; transition: all 0.15s; }
          .panel-tab:hover { color: #94a3b8; }
          .panel-tab.active { color: #60a5fa; border-bottom-color: #3b82f6; }
          .panel-input { width: 100%; background: rgba(255,255,255,0.05); border: 1px solid rgba(255,255,255,0.1); border-radius: 8px; padding: 10px 12px; color: #f1f5f9; font-size: 13px; outline: none; resize: none; font-family: inherit; box-sizing: border-box; }
          .panel-input:focus { border-color: rgba(59,130,246,0.5); }
          .panel-input::placeholder { color: #475569; }
          .att-row:hover { background: rgba(255,255,255,0.06); }
        `}</style>

        {/* Header */}
        <div style={{ padding: '20px 24px 0', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px', flexWrap: 'wrap' }}>
                {item.shortId && (
                  <span style={{ fontSize: '11px', fontFamily: 'monospace', fontWeight: '700', color: '#60a5fa', background: 'rgba(59,130,246,0.12)', padding: '2px 7px', borderRadius: '4px' }}>
                    {item.shortId}
                  </span>
                )}
                <span style={{ fontSize: '11px', padding: '2px 8px', borderRadius: '4px', background: `${statusColor}18`, color: statusColor, fontWeight: '600' }}>
                  {item.status}
                </span>
                {priorityColor && (
                  <span style={{ fontSize: '11px', padding: '2px 8px', borderRadius: '4px', background: `${priorityColor}18`, color: priorityColor }}>
                    {item.priority}
                  </span>
                )}
              </div>
              <h2 style={{ margin: 0, fontSize: '16px', fontWeight: '700', color: '#f1f5f9', lineHeight: '1.3' }}>
                {item.title}
              </h2>
              {item.dueDate && (
                <div style={{ marginTop: '6px', fontSize: '12px', color: new Date(item.dueDate) < new Date() && item.status !== 'done' && item.status !== 'completed' && item.status !== 'closed' ? '#f87171' : '#475569' }}>
                  📅 {new Date(item.dueDate).toLocaleDateString('nl-BE')}
                </div>
              )}
            </div>
            <button
              onClick={onClose}
              style={{ background: 'rgba(255,255,255,0.06)', border: 'none', color: '#64748b', cursor: 'pointer', width: '32px', height: '32px', borderRadius: '8px', fontSize: '16px', flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}
            >
              ✕
            </button>
          </div>

          {/* Tabs */}
          <div style={{ display: 'flex', gap: '4px' }}>
            {[
              { key: 'info', label: 'Overzicht' },
              { key: 'updates', label: `Updates (${allComments.length})` },
              { key: 'attachments', label: `Bijlagen (${allAttachments.length})` },
            ].map(t => (
              <button
                key={t.key}
                className={`panel-tab ${tab === t.key ? 'active' : ''}`}
                onClick={() => setTab(t.key as typeof tab)}
              >{t.label}</button>
            ))}
          </div>
        </div>

        {/* Body */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '20px 24px' }}>

          {/* ── Overzicht tab ─────────────────────────────────────────── */}
          {tab === 'info' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {item.description && (
                <div>
                  <div style={{ fontSize: '11px', color: '#475569', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '8px' }}>Beschrijving</div>
                  <p style={{ margin: 0, fontSize: '14px', color: '#94a3b8', lineHeight: '1.6', whiteSpace: 'pre-wrap' }}>{item.description}</p>
                </div>
              )}

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                {[
                  { label: 'Status', value: item.status, color: statusColor },
                  item.priority ? { label: 'Prioriteit', value: item.priority, color: priorityColor! } : null,
                  item.type ? { label: 'Type', value: item.type, color: '#64748b' } : null,
                  item.dueDate ? { label: 'Deadline', value: new Date(item.dueDate).toLocaleDateString('nl-BE'), color: '#64748b' } : null,
                ].filter(Boolean).map((field, i) => field && (
                  <div key={i} style={{ padding: '12px', background: 'rgba(255,255,255,0.03)', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.06)' }}>
                    <div style={{ fontSize: '11px', color: '#475569', marginBottom: '4px', fontWeight: '600' }}>{field.label}</div>
                    <div style={{ fontSize: '13px', color: field.color, fontWeight: '600' }}>{field.value}</div>
                  </div>
                ))}
              </div>

              {/* Quick stats */}
              <div style={{ display: 'flex', gap: '12px' }}>
                <div style={{ flex: 1, padding: '12px', background: 'rgba(255,255,255,0.03)', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.06)', textAlign: 'center' }}>
                  <div style={{ fontSize: '22px', fontWeight: '700', color: '#60a5fa' }}>{allComments.length}</div>
                  <div style={{ fontSize: '11px', color: '#475569', marginTop: '2px' }}>Updates</div>
                </div>
                <div style={{ flex: 1, padding: '12px', background: 'rgba(255,255,255,0.03)', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.06)', textAlign: 'center' }}>
                  <div style={{ fontSize: '22px', fontWeight: '700', color: '#a78bfa' }}>{allAttachments.length}</div>
                  <div style={{ fontSize: '11px', color: '#475569', marginTop: '2px' }}>Bijlagen</div>
                </div>
              </div>
            </div>
          )}

          {/* ── Updates tab ───────────────────────────────────────────── */}
          {tab === 'updates' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {allComments.length === 0 && (
                <div style={{ textAlign: 'center', padding: '32px 0', color: '#475569' }}>
                  <div style={{ fontSize: '36px', marginBottom: '8px' }}>💬</div>
                  <p style={{ margin: 0, fontSize: '13px' }}>Nog geen updates. Voeg de eerste toe!</p>
                </div>
              )}

              {allComments.map(comment => (
                <div key={comment.id} style={{ display: 'flex', gap: '10px' }}>
                  {/* Avatar */}
                  <div style={{
                    width: '32px', height: '32px', borderRadius: '50%', flexShrink: 0,
                    background: comment.type === 'attachment' ? 'rgba(167,139,250,0.2)' : comment.type === 'status_change' ? 'rgba(16,185,129,0.2)' : 'rgba(59,130,246,0.2)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '14px',
                  }}>
                    {comment.type === 'attachment' ? '📎' : comment.type === 'status_change' ? '🔄' : '💬'}
                  </div>

                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
                      <span style={{ fontSize: '12px', fontWeight: '600', color: '#94a3b8' }}>{comment.authorName}</span>
                      <span style={{ fontSize: '11px', color: '#334155' }}>{timeAgo(comment.createdAt)}</span>
                    </div>
                    <div style={{
                      padding: '10px 12px', borderRadius: '8px',
                      background: comment.type === 'attachment' ? 'rgba(167,139,250,0.08)' : comment.type === 'status_change' ? 'rgba(16,185,129,0.08)' : 'rgba(255,255,255,0.04)',
                      border: `1px solid ${comment.type === 'attachment' ? 'rgba(167,139,250,0.15)' : comment.type === 'status_change' ? 'rgba(16,185,129,0.15)' : 'rgba(255,255,255,0.06)'}`,
                      fontSize: '13px', color: '#cbd5e1', lineHeight: '1.5', wordBreak: 'break-word',
                    }}>
                      {comment.text}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* ── Bijlagen tab ──────────────────────────────────────────── */}
          {tab === 'attachments' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {/* Drop zone */}
              <div
                onDragOver={e => { e.preventDefault(); setDragOver(true); }}
                onDragLeave={() => setDragOver(false)}
                onDrop={handleDrop}
                onClick={() => fileInputRef.current?.click()}
                style={{
                  border: `2px dashed ${dragOver ? 'rgba(59,130,246,0.6)' : 'rgba(255,255,255,0.12)'}`,
                  borderRadius: '10px', padding: '24px', textAlign: 'center',
                  cursor: 'pointer', transition: 'all 0.15s',
                  background: dragOver ? 'rgba(59,130,246,0.05)' : 'rgba(255,255,255,0.02)',
                }}
              >
                <input ref={fileInputRef} type="file" multiple style={{ display: 'none' }} onChange={handleFileChange} />
                <div style={{ fontSize: '28px', marginBottom: '8px' }}>
                  {uploading ? '⏳' : '📎'}
                </div>
                <div style={{ fontSize: '13px', color: uploading ? '#60a5fa' : '#64748b', fontWeight: '600' }}>
                  {uploading ? 'Bestand uploaden...' : 'Sleep bestanden hier of klik om te selecteren'}
                </div>
                <div style={{ fontSize: '11px', color: '#334155', marginTop: '4px' }}>
                  PDF, Word, Excel, afbeeldingen, ZIP — max 25 MB
                </div>
              </div>

              {/* Attachments list */}
              {allAttachments.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '20px 0', color: '#334155', fontSize: '13px' }}>
                  Nog geen bijlagen. Upload je eerste bestand.
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  {allAttachments.map(att => (
                    <div
                      key={att.id}
                      className="att-row"
                      style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '10px 12px', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.06)', transition: 'background 0.1s' }}
                    >
                      <span style={{ fontSize: '20px', flexShrink: 0 }}>{fileIcon(att.mimeType)}</span>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <a
                          href={att.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          style={{ fontSize: '13px', color: '#60a5fa', fontWeight: '600', textDecoration: 'none', display: 'block', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}
                        >
                          {att.filename}
                        </a>
                        <div style={{ fontSize: '11px', color: '#334155', marginTop: '2px' }}>
                          {formatSize(att.size)} · {att.uploadedByName} · {timeAgo(att.createdAt)}
                        </div>
                      </div>
                      <div style={{ display: 'flex', gap: '6px', flexShrink: 0 }}>
                        <a
                          href={att.url}
                          download={att.filename}
                          style={{ padding: '4px 8px', borderRadius: '6px', background: 'rgba(59,130,246,0.1)', color: '#60a5fa', fontSize: '11px', textDecoration: 'none', fontWeight: '600' }}
                        >
                          ↓
                        </a>
                        <button
                          onClick={() => handleDeleteAttachment(att.id)}
                          style={{ padding: '4px 8px', borderRadius: '6px', background: 'rgba(244,63,94,0.1)', color: '#f87171', fontSize: '11px', border: 'none', cursor: 'pointer', fontWeight: '600' }}
                        >
                          ✕
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer — comment box (visible on Updates + Info tab) */}
        {(tab === 'updates' || tab === 'info') && (
          <div style={{ padding: '16px 24px', borderTop: '1px solid rgba(255,255,255,0.06)', background: '#0a0f1e' }}>
            <textarea
              className="panel-input"
              rows={3}
              placeholder="Schrijf een update, opmerking of beslissing..."
              value={commentText}
              onChange={e => setCommentText(e.target.value)}
              onKeyDown={e => {
                if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) handleSendComment();
              }}
            />
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '8px' }}>
              <span style={{ fontSize: '11px', color: '#334155' }}>Ctrl+Enter om te versturen</span>
              <button
                onClick={handleSendComment}
                disabled={sendingComment || !commentText.trim()}
                style={{
                  padding: '7px 16px', borderRadius: '8px', border: 'none', cursor: 'pointer',
                  background: sendingComment || !commentText.trim() ? 'rgba(59,130,246,0.2)' : 'rgba(59,130,246,0.8)',
                  color: sendingComment || !commentText.trim() ? '#475569' : '#fff',
                  fontSize: '13px', fontWeight: '600', transition: 'all 0.15s',
                }}
              >
                {sendingComment ? 'Versturen...' : 'Verstuur update'}
              </button>
            </div>
          </div>
        )}

        {/* Footer — upload button on Bijlagen tab */}
        {tab === 'attachments' && (
          <div style={{ padding: '16px 24px', borderTop: '1px solid rgba(255,255,255,0.06)', background: '#0a0f1e', display: 'flex', justifyContent: 'flex-end' }}>
            <button
              onClick={() => fileInputRef.current?.click()}
              disabled={uploading}
              style={{ padding: '8px 20px', borderRadius: '8px', border: 'none', cursor: 'pointer', background: 'rgba(167,139,250,0.2)', color: '#a78bfa', fontSize: '13px', fontWeight: '600' }}
            >
              {uploading ? 'Uploaden...' : '+ Bijlage toevoegen'}
            </button>
          </div>
        )}
      </div>
    </>
  );
}
