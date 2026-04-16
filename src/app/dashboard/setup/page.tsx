'use client';

import { useState, useEffect } from 'react';
import { Category } from '@/lib/db';

const COLORS = ['#3b82f6','#8b5cf6','#10b981','#f59e0b','#f43f5e','#06b6d4','#84cc16','#f97316','#ec4899','#6366f1'];

const typeLabels: Record<string, string> = {
  workstream: '🔀 Workstream',
  department: '🏢 Afdeling',
  other: '🏷️ Overige',
};

export default function SetupPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ name: '', type: 'workstream', color: '#3b82f6', description: '' });
  const [saving, setSaving] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);

  useEffect(() => {
    fetch('/api/categories').then(r => r.json()).then(d => {
      setCategories(Array.isArray(d) ? d : []);
      setLoading(false);
    });
  }, []);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    const url = editId ? `/api/categories/${editId}` : '/api/categories';
    const method = editId ? 'PATCH' : 'POST';
    const res = await fetch(url, { method, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(form) });
    if (res.ok) {
      const cat = await res.json();
      if (editId) setCategories(prev => prev.map(c => c.id === editId ? cat : c));
      else setCategories(prev => [...prev, cat]);
      setShowForm(false);
      setEditId(null);
      setForm({ name: '', type: 'workstream', color: '#3b82f6', description: '' });
    }
    setSaving(false);
  };

  const handleEdit = (cat: Category) => {
    setForm({ name: cat.name, type: cat.type, color: cat.color, description: cat.description || '' });
    setEditId(cat.id);
    setShowForm(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Categorie verwijderen?')) return;
    const res = await fetch(`/api/categories/${id}`, { method: 'DELETE' });
    if (res.ok) setCategories(prev => prev.filter(c => c.id !== id));
  };

  return (
    <div style={{ maxWidth: '800px' }}>
      <div style={{ marginBottom: '32px' }}>
        <h1 style={{ fontSize: '24px', fontWeight: '800', color: '#f1f5f9', margin: '0 0 4px' }}>Instellingen</h1>
        <p style={{ color: '#64748b', margin: 0, fontSize: '14px' }}>Beheer categorieën, workstreams en afdelingen</p>
      </div>

      {/* Categories Section */}
      <div className="glass" style={{ padding: '24px', marginBottom: '24px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
          <div>
            <h2 style={{ margin: '0 0 4px', fontSize: '16px', fontWeight: '700', color: '#f1f5f9' }}>Categorieën</h2>
            <p style={{ margin: 0, fontSize: '13px', color: '#64748b' }}>Workstreams en afdelingen om items in te groeperen</p>
          </div>
          <button className="btn-primary" onClick={() => { setEditId(null); setForm({ name: '', type: 'workstream', color: '#3b82f6', description: '' }); setShowForm(true); }}>
            + Nieuwe categorie
          </button>
        </div>

        {showForm && (
          <div style={{ padding: '20px', background: 'rgba(59,130,246,0.05)', border: '1px solid rgba(59,130,246,0.2)', borderRadius: '12px', marginBottom: '20px' }}>
            <h3 style={{ margin: '0 0 16px', color: '#f1f5f9', fontSize: '14px', fontWeight: '700' }}>
              {editId ? 'Categorie bewerken' : 'Nieuwe categorie'}
            </h3>
            <form onSubmit={handleCreate} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
              <div style={{ gridColumn: '1 / -1' }}>
                <label style={{ display: 'block', fontSize: '12px', color: '#94a3b8', marginBottom: '6px', fontWeight: '600' }}>Naam *</label>
                <input className="input-dark" placeholder="bijv. IT & Infrastructuur, HR, Kwaliteit..." value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} required />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '12px', color: '#94a3b8', marginBottom: '6px', fontWeight: '600' }}>Type</label>
                <select className="input-dark" value={form.type} onChange={e => setForm({ ...form, type: e.target.value })}>
                  <option value="workstream">Workstream</option>
                  <option value="department">Afdeling</option>
                  <option value="other">Overige</option>
                </select>
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '12px', color: '#94a3b8', marginBottom: '6px', fontWeight: '600' }}>Kleur</label>
                <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                  {COLORS.map(c => (
                    <button key={c} type="button" onClick={() => setForm({ ...form, color: c })} style={{
                      width: '28px', height: '28px', borderRadius: '8px', background: c, border: 'none',
                      cursor: 'pointer', outline: form.color === c ? '3px solid white' : 'none',
                      outlineOffset: '2px', transition: 'outline 0.1s',
                    }} />
                  ))}
                </div>
              </div>
              <div style={{ gridColumn: '1 / -1' }}>
                <label style={{ display: 'block', fontSize: '12px', color: '#94a3b8', marginBottom: '6px', fontWeight: '600' }}>Beschrijving</label>
                <input className="input-dark" placeholder="Optionele beschrijving..." value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} />
              </div>
              <div style={{ gridColumn: '1 / -1', display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
                <button type="button" className="btn-secondary" onClick={() => { setShowForm(false); setEditId(null); }}>Annuleren</button>
                <button type="submit" className="btn-primary" disabled={saving}>{saving ? 'Opslaan...' : editId ? 'Bijwerken' : 'Aanmaken'}</button>
              </div>
            </form>
          </div>
        )}

        {loading ? (
          <p style={{ color: '#475569', textAlign: 'center', padding: '24px' }}>Laden...</p>
        ) : categories.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '32px', color: '#475569' }}>
            <div style={{ fontSize: '40px', marginBottom: '12px' }}>🏷️</div>
            <p style={{ margin: 0 }}>Nog geen categorieën. Maak je eerste workstream of afdeling aan.</p>
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '12px' }}>
            {categories.map(cat => (
              <div key={cat.id} style={{
                padding: '16px', borderRadius: '12px',
                background: 'rgba(255,255,255,0.03)',
                border: `1px solid ${cat.color}33`,
                display: 'flex', alignItems: 'flex-start', gap: '12px',
              }}>
                <div style={{ width: '36px', height: '36px', borderRadius: '10px', background: cat.color, flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '16px' }}>
                  {cat.type === 'workstream' ? '🔀' : cat.type === 'department' ? '🏢' : '🏷️'}
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <div>
                      <div style={{ fontWeight: '700', color: '#f1f5f9', fontSize: '14px' }}>{cat.name}</div>
                      <div style={{ fontSize: '11px', color: cat.color, marginTop: '2px' }}>{cat.shortId} · {typeLabels[cat.type]}</div>
                    </div>
                    <div style={{ display: 'flex', gap: '6px' }}>
                      <button onClick={() => handleEdit(cat)} style={{ padding: '4px 10px', fontSize: '12px', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '6px', color: '#94a3b8', cursor: 'pointer' }}>✏️</button>
                      <button onClick={() => handleDelete(cat.id)} style={{ padding: '4px 10px', fontSize: '12px', background: 'rgba(244,63,94,0.1)', border: '1px solid rgba(244,63,94,0.2)', borderRadius: '6px', color: '#f87171', cursor: 'pointer' }}>🗑️</button>
                    </div>
                  </div>
                  {cat.description && <p style={{ margin: '6px 0 0', fontSize: '12px', color: '#64748b' }}>{cat.description}</p>}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Info Box */}
      <div className="glass" style={{ padding: '20px' }}>
        <h3 style={{ margin: '0 0 12px', color: '#f1f5f9', fontSize: '14px', fontWeight: '700' }}>💡 Hoe gebruik je categorieën?</h3>
        <div style={{ fontSize: '13px', color: '#64748b', lineHeight: '1.7' }}>
          <p style={{ margin: '0 0 8px' }}>Categorieën laten je toe om projecten, maatregelen, acties en taken te groeperen per <strong style={{ color: '#94a3b8' }}>workstream</strong> (bijv. IT, Kwaliteit, HR) of <strong style={{ color: '#94a3b8' }}>afdeling</strong> (bijv. Productie, Finance).</p>
          <p style={{ margin: 0 }}>Je kunt ze toewijzen bij het aanmaken van elk item. Filters in overzichten laten je dan enkel de items van een specifieke categorie tonen.</p>
        </div>
      </div>
    </div>
  );
}
