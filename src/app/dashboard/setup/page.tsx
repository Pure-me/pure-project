'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useI18n } from '@/lib/i18n';
import { Category } from '@/lib/db';

const COLORS = ['#3b82f6','#8b5cf6','#10b981','#f59e0b','#f43f5e','#06b6d4','#84cc16','#f97316','#ec4899','#6366f1'];

const typeLabels: Record<string, Record<string, string>> = {
  workstream: { nl: '🔀 Workstream', en: '🔀 Workstream' },
  department: { nl: '🏢 Afdeling', en: '🏢 Department' },
  other: { nl: '🏷️ Overige', en: '🏷️ Other' },
};

interface TemplateItem {
  type: 'task' | 'quality' | 'risk';
  titleNl: string;
  titleEn: string;
  priority: 'low' | 'medium' | 'high' | 'critical';
  dueOffset: number; // days from now
}

interface Template {
  id: string;
  standard: string;
  nameNl: string;
  nameEn: string;
  descriptionNl: string;
  descriptionEn: string;
  icon: string;
  color: string;
  category: 'projects' | 'quality' | 'bcm';
  items: TemplateItem[];
}

const ISO_TEMPLATES: Template[] = [
  {
    id: 'iso9001-internal-audit',
    standard: 'ISO 9001',
    nameNl: 'Interne Audit',
    nameEn: 'Internal Audit',
    descriptionNl: 'Volledige workflow voor een interne kwaliteitsaudit conform ISO 9001:2015 clausule 9.2',
    descriptionEn: 'Complete workflow for an internal quality audit per ISO 9001:2015 clause 9.2',
    icon: '🔍',
    color: '#3b82f6',
    category: 'quality',
    items: [
      { type: 'task', titleNl: 'Auditplan opstellen en goedkeuren', titleEn: 'Prepare and approve audit plan', priority: 'high', dueOffset: 7 },
      { type: 'task', titleNl: 'Auditchecklist voorbereiden per clausule', titleEn: 'Prepare audit checklist per clause', priority: 'high', dueOffset: 10 },
      { type: 'task', titleNl: 'Openingsvergadering houden', titleEn: 'Conduct opening meeting', priority: 'medium', dueOffset: 14 },
      { type: 'task', titleNl: 'Auditgesprekken uitvoeren', titleEn: 'Conduct audit interviews', priority: 'high', dueOffset: 21 },
      { type: 'task', titleNl: 'Bevindingen documenteren (NC / OFI)', titleEn: 'Document findings (NC / OFI)', priority: 'high', dueOffset: 25 },
      { type: 'task', titleNl: 'Sluitingsvergadering houden', titleEn: 'Conduct closing meeting', priority: 'medium', dueOffset: 28 },
      { type: 'task', titleNl: 'Auditrapport opstellen en verspreiden', titleEn: 'Prepare and distribute audit report', priority: 'high', dueOffset: 35 },
      { type: 'quality', titleNl: 'NC-register bijwerken met auditbevindingen', titleEn: 'Update NC register with audit findings', priority: 'medium', dueOffset: 35 },
      { type: 'task', titleNl: 'Correctieve maatregelen opvolgen', titleEn: 'Follow up corrective actions', priority: 'high', dueOffset: 60 },
      { type: 'task', titleNl: 'Effectiviteit maatregelen beoordelen', titleEn: 'Assess effectiveness of measures', priority: 'medium', dueOffset: 90 },
    ],
  },
  {
    id: 'iso9001-management-review',
    standard: 'ISO 9001',
    nameNl: 'Directiebeoordeling',
    nameEn: 'Management Review',
    descriptionNl: 'Jaarlijkse directiebeoordeling van het kwaliteitsmanagementsysteem (clausule 9.3)',
    descriptionEn: 'Annual management review of the quality management system (clause 9.3)',
    icon: '📊',
    color: '#8b5cf6',
    category: 'quality',
    items: [
      { type: 'task', titleNl: "Inputgegevens verzamelen (KPI's, audits, klachten)", titleEn: 'Collect input data (KPIs, audits, complaints)', priority: 'high', dueOffset: 14 },
      { type: 'task', titleNl: 'Klanttevredenheidsresultaten analyseren', titleEn: 'Analyse customer satisfaction results', priority: 'high', dueOffset: 14 },
      { type: 'task', titleNl: 'Procesperformantie rapporteren', titleEn: 'Report process performance', priority: 'medium', dueOffset: 21 },
      { type: 'task', titleNl: "Risico's en kansen beoordelen", titleEn: 'Review risks and opportunities', priority: 'high', dueOffset: 21 },
      { type: 'task', titleNl: 'Vergadering directiebeoordeling houden', titleEn: 'Conduct management review meeting', priority: 'critical', dueOffset: 28 },
      { type: 'task', titleNl: 'Notulen en actiepunten documenteren', titleEn: 'Document minutes and action points', priority: 'high', dueOffset: 35 },
      { type: 'task', titleNl: 'Verbeterdoelstellingen voor volgend jaar vastleggen', titleEn: 'Set improvement objectives for next year', priority: 'high', dueOffset: 42 },
      { type: 'quality', titleNl: 'Beleid en doelstellingen kwaliteit actualiseren', titleEn: 'Update quality policy and objectives', priority: 'medium', dueOffset: 45 },
    ],
  },
  {
    id: 'iso9001-supplier-eval',
    standard: 'ISO 9001',
    nameNl: 'Leveranciersbeoordeling',
    nameEn: 'Supplier Evaluation',
    descriptionNl: 'Structureerde evaluatie en kwalificatie van leveranciers (clausule 8.4)',
    descriptionEn: 'Structured evaluation and qualification of suppliers (clause 8.4)',
    icon: '🤝',
    color: '#10b981',
    category: 'quality',
    items: [
      { type: 'task', titleNl: 'Leverancierslijst actualiseren', titleEn: 'Update supplier list', priority: 'medium', dueOffset: 7 },
      { type: 'task', titleNl: 'Evaluatiecriteria vastleggen (kwaliteit, levertijd, prijs)', titleEn: 'Define evaluation criteria (quality, lead time, price)', priority: 'high', dueOffset: 10 },
      { type: 'task', titleNl: 'Leveranciersvragenlijst versturen', titleEn: 'Send supplier questionnaire', priority: 'medium', dueOffset: 14 },
      { type: 'quality', titleNl: 'Certificaten en kwalificaties controleren', titleEn: 'Check certificates and qualifications', priority: 'high', dueOffset: 21 },
      { type: 'task', titleNl: 'Beoordelingsscores berekenen per leverancier', titleEn: 'Calculate assessment scores per supplier', priority: 'high', dueOffset: 28 },
      { type: 'task', titleNl: 'Goedgekeurde leverancierslijst bijwerken', titleEn: 'Update approved supplier list', priority: 'medium', dueOffset: 35 },
      { type: 'quality', titleNl: 'Verbeterpunten communiceren aan niet-conforme leveranciers', titleEn: 'Communicate improvement points to non-compliant suppliers', priority: 'medium', dueOffset: 42 },
    ],
  },
  {
    id: 'iso22301-bcp-development',
    standard: 'ISO 22301',
    nameNl: 'BCP Ontwikkeling',
    nameEn: 'BCP Development',
    descriptionNl: 'Opzetten van een Business Continuity Plan conform ISO 22301:2019',
    descriptionEn: 'Setting up a Business Continuity Plan per ISO 22301:2019',
    icon: '🛡️',
    color: '#f59e0b',
    category: 'bcm',
    items: [
      { type: 'task', titleNl: 'Scope en context van de organisatie bepalen', titleEn: 'Define scope and organizational context', priority: 'critical', dueOffset: 7 },
      { type: 'task', titleNl: 'Business Impact Analyse (BIA) uitvoeren', titleEn: 'Conduct Business Impact Analysis (BIA)', priority: 'critical', dueOffset: 21 },
      { type: 'risk', titleNl: 'Kritieke processen en afhankelijkheden identificeren', titleEn: 'Identify critical processes and dependencies', priority: 'critical', dueOffset: 21 },
      { type: 'risk', titleNl: "Risicoanalyse en dreigingsscenario's opstellen", titleEn: 'Develop risk analysis and threat scenarios', priority: 'high', dueOffset: 28 },
      { type: 'task', titleNl: 'Herstelstrategieën per kritiek proces definiëren', titleEn: 'Define recovery strategies per critical process', priority: 'high', dueOffset: 35 },
      { type: 'task', titleNl: 'BCP-document schrijven (procedures, contacten, checklists)', titleEn: 'Write BCP document (procedures, contacts, checklists)', priority: 'critical', dueOffset: 49 },
      { type: 'task', titleNl: 'BCP goedkeuren door directie', titleEn: 'Approve BCP by management', priority: 'high', dueOffset: 56 },
      { type: 'task', titleNl: 'Personeel trainen op BCP-procedures', titleEn: 'Train staff on BCP procedures', priority: 'medium', dueOffset: 70 },
      { type: 'task', titleNl: 'Tabletop-oefening plannen en uitvoeren', titleEn: 'Plan and conduct tabletop exercise', priority: 'high', dueOffset: 90 },
      { type: 'task', titleNl: 'BCP evalueren en bijwerken na oefening', titleEn: 'Evaluate and update BCP after exercise', priority: 'medium', dueOffset: 105 },
    ],
  },
  {
    id: 'iso22301-incident-response',
    standard: 'ISO 22301',
    nameNl: 'Incident Response',
    nameEn: 'Incident Response',
    descriptionNl: 'Gestructureerde aanpak voor het beheren en oplossen van kritieke verstoringen',
    descriptionEn: 'Structured approach to managing and resolving critical disruptions',
    icon: '🚨',
    color: '#f43f5e',
    category: 'bcm',
    items: [
      { type: 'task', titleNl: 'Incident melden en classificeren (P1–P4)', titleEn: 'Report and classify incident (P1–P4)', priority: 'critical', dueOffset: 0 },
      { type: 'risk', titleNl: 'Initiële impactbeoordeling uitvoeren', titleEn: 'Perform initial impact assessment', priority: 'critical', dueOffset: 0 },
      { type: 'task', titleNl: 'Crisis Management Team (CMT) activeren', titleEn: 'Activate Crisis Management Team (CMT)', priority: 'critical', dueOffset: 1 },
      { type: 'task', titleNl: 'Communicatieplan uitvoeren (intern + extern)', titleEn: 'Execute communication plan (internal + external)', priority: 'high', dueOffset: 1 },
      { type: 'task', titleNl: 'Noodmaatregelen en workarounds implementeren', titleEn: 'Implement emergency measures and workarounds', priority: 'critical', dueOffset: 2 },
      { type: 'task', titleNl: 'Voortgang monitoren en status bijwerken', titleEn: 'Monitor progress and update status', priority: 'high', dueOffset: 3 },
      { type: 'task', titleNl: 'Normale operaties herstellen', titleEn: 'Restore normal operations', priority: 'critical', dueOffset: 7 },
      { type: 'quality', titleNl: 'Post-incident review (PIR) uitvoeren', titleEn: 'Conduct post-incident review (PIR)', priority: 'high', dueOffset: 14 },
      { type: 'task', titleNl: 'Lessons learned documenteren', titleEn: 'Document lessons learned', priority: 'medium', dueOffset: 21 },
      { type: 'task', titleNl: 'BCP aanpassen op basis van bevindingen', titleEn: 'Update BCP based on findings', priority: 'medium', dueOffset: 30 },
    ],
  },
  {
    id: 'product-launch',
    standard: 'Best Practice',
    nameNl: 'Product Launch',
    nameEn: 'Product Launch',
    descriptionNl: 'Gestructureerd lanceringsproces van concept naar markt',
    descriptionEn: 'Structured launch process from concept to market',
    icon: '🚀',
    color: '#06b6d4',
    category: 'projects',
    items: [
      { type: 'task', titleNl: 'Marktanalyse en doelgroep definiëren', titleEn: 'Define market analysis and target audience', priority: 'high', dueOffset: 7 },
      { type: 'task', titleNl: 'Productspecificaties finaliseren', titleEn: 'Finalize product specifications', priority: 'critical', dueOffset: 14 },
      { type: 'quality', titleNl: 'Kwaliteitscontroles en acceptatiecriteria bepalen', titleEn: 'Define quality controls and acceptance criteria', priority: 'high', dueOffset: 14 },
      { type: 'task', titleNl: 'Go-to-market strategie opstellen', titleEn: 'Develop go-to-market strategy', priority: 'high', dueOffset: 21 },
      { type: 'task', titleNl: 'Marketing- en communicatiemateriaal voorbereiden', titleEn: 'Prepare marketing and communication materials', priority: 'medium', dueOffset: 35 },
      { type: 'task', titleNl: 'Interne training en briefing', titleEn: 'Internal training and briefing', priority: 'medium', dueOffset: 42 },
      { type: 'quality', titleNl: 'Pre-launch kwaliteitscontrole uitvoeren', titleEn: 'Conduct pre-launch quality control', priority: 'critical', dueOffset: 56 },
      { type: 'task', titleNl: 'Soft launch bij selecte klanten', titleEn: 'Soft launch with select customers', priority: 'high', dueOffset: 63 },
      { type: 'task', titleNl: 'Feedback verzamelen en verwerken', titleEn: 'Collect and process feedback', priority: 'high', dueOffset: 70 },
      { type: 'task', titleNl: 'Volledige marktlancering', titleEn: 'Full market launch', priority: 'critical', dueOffset: 84 },
      { type: 'task', titleNl: 'Post-launch evaluatie na 30 dagen', titleEn: '30-day post-launch evaluation', priority: 'medium', dueOffset: 114 },
    ],
  },
];

export default function SetupPage() {
  const { locale } = useI18n();
  const router = useRouter();
  const nl = locale === 'nl';

  // Categories state
  const [categories, setCategories] = useState<Category[]>([]);
  const [loadingCats, setLoadingCats] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ name: '', type: 'workstream', color: '#3b82f6', description: '' });
  const [saving, setSaving] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);

  // Templates state
  const [activeTab, setActiveTab] = useState<'templates' | 'categories' | 'system'>('templates');
  const [templateFilter, setTemplateFilter] = useState<'all' | 'projects' | 'quality' | 'bcm'>('all');
  const [applyingId, setApplyingId] = useState<string | null>(null);
  const [appliedId, setAppliedId] = useState<string | null>(null);

  useEffect(() => {
    fetch('/api/categories').then(r => r.json()).then(d => {
      setCategories(Array.isArray(d) ? d : []);
      setLoadingCats(false);
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
    if (!confirm(nl ? 'Categorie verwijderen?' : 'Delete category?')) return;
    const res = await fetch(`/api/categories/${id}`, { method: 'DELETE' });
    if (res.ok) setCategories(prev => prev.filter(c => c.id !== id));
  };

  const applyTemplate = async (template: Template) => {
    setApplyingId(template.id);
    try {
      // 1. Create project
      const projectRes = await fetch('/api/projects', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: nl ? template.nameNl : template.nameEn,
          description: `${template.standard} — ${nl ? template.descriptionNl : template.descriptionEn}`,
          status: 'active',
          priority: 'high',
          startDate: new Date().toISOString(),
          dueDate: new Date(Date.now() + 120 * 86400000).toISOString(),
        }),
      });
      if (!projectRes.ok) throw new Error('Project creation failed');
      const project = await projectRes.json();

      // 2. Create work items
      for (const item of template.items) {
        await fetch('/api/workitems', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            projectId: project.id,
            title: nl ? item.titleNl : item.titleEn,
            type: item.type === 'task' ? 'task' : item.type === 'quality' ? 'quality' : 'risk',
            status: 'todo',
            priority: item.priority,
            dueDate: new Date(Date.now() + item.dueOffset * 86400000).toISOString(),
          }),
        });
      }

      setAppliedId(template.id);
      setTimeout(() => {
        router.push(`/dashboard/projects/${project.id}`);
      }, 800);
    } catch {
      setApplyingId(null);
    }
  };

  const filteredTemplates = ISO_TEMPLATES.filter(t => templateFilter === 'all' || t.category === templateFilter);

  const categoryLabels: Record<string, string> = {
    all: nl ? 'Alles' : 'All',
    projects: nl ? 'Projecten' : 'Projects',
    quality: nl ? 'Kwaliteit' : 'Quality',
    bcm: 'BCM',
  };

  const priorityColor: Record<string, string> = {
    low: '#10b981',
    medium: '#f59e0b',
    high: '#f97316',
    critical: '#f43f5e',
  };

  return (
    <div style={{ maxWidth: '900px' }}>
      <div style={{ marginBottom: '28px' }}>
        <h1 style={{ fontSize: '24px', fontWeight: '800', color: '#f1f5f9', margin: '0 0 4px' }}>
          {nl ? 'Instellingen & Templates' : 'Settings & Templates'}
        </h1>
        <p style={{ color: '#64748b', margin: 0, fontSize: '14px' }}>
          {nl ? 'ISO-templates, categorieën en systeeminstellingen' : 'ISO templates, categories and system settings'}
        </p>
      </div>

      {/* Tab bar */}
      <div style={{ display: 'flex', gap: '4px', marginBottom: '24px', background: 'rgba(255,255,255,0.03)', borderRadius: '12px', padding: '4px', width: 'fit-content' }}>
        {([
          { key: 'templates', labelNl: '📋 ISO Templates', labelEn: '📋 ISO Templates' },
          { key: 'categories', labelNl: '🏷️ Categorieën', labelEn: '🏷️ Categories' },
          { key: 'system', labelNl: '⚙️ Systeem', labelEn: '⚙️ System' },
        ] as const).map(tab => (
          <button key={tab.key} onClick={() => setActiveTab(tab.key)} style={{
            padding: '8px 20px', borderRadius: '8px', border: 'none', cursor: 'pointer', fontSize: '13px', fontWeight: '600', transition: 'all 0.15s',
            background: activeTab === tab.key ? 'rgba(99,102,241,0.3)' : 'transparent',
            color: activeTab === tab.key ? '#a5b4fc' : '#64748b',
          }}>
            {nl ? tab.labelNl : tab.labelEn}
          </button>
        ))}
      </div>

      {/* TEMPLATES TAB */}
      {activeTab === 'templates' && (
        <div>
          <div className="glass" style={{ padding: '20px', marginBottom: '20px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
              <div>
                <h2 style={{ margin: '0 0 4px', fontSize: '16px', fontWeight: '700', color: '#f1f5f9' }}>
                  {nl ? 'Compliance Templates' : 'Compliance Templates'}
                </h2>
                <p style={{ margin: 0, fontSize: '13px', color: '#64748b' }}>
                  {nl ? 'Klik op "Toepassen" om een volledig project met taken aan te maken' : 'Click "Apply" to create a complete project with tasks'}
                </p>
              </div>
              <div style={{ display: 'flex', gap: '6px' }}>
                {(['all', 'projects', 'quality', 'bcm'] as const).map(f => (
                  <button key={f} onClick={() => setTemplateFilter(f)} style={{
                    padding: '6px 14px', borderRadius: '8px', border: '1px solid', cursor: 'pointer', fontSize: '12px', fontWeight: '600', transition: 'all 0.15s',
                    background: templateFilter === f ? 'rgba(99,102,241,0.2)' : 'transparent',
                    borderColor: templateFilter === f ? 'rgba(99,102,241,0.5)' : 'rgba(255,255,255,0.08)',
                    color: templateFilter === f ? '#a5b4fc' : '#64748b',
                  }}>
                    {categoryLabels[f]}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(420px, 1fr))', gap: '16px' }}>
            {filteredTemplates.map(template => (
              <div key={template.id} className="glass" style={{
                padding: '20px',
                border: `1px solid ${template.color}22`,
                transition: 'border-color 0.2s',
              }}>
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: '14px', marginBottom: '14px' }}>
                  <div style={{
                    width: '44px', height: '44px', borderRadius: '12px', flexShrink: 0,
                    background: `${template.color}22`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '22px',
                  }}>
                    {template.icon}
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap', marginBottom: '4px' }}>
                      <span style={{ fontWeight: '700', color: '#f1f5f9', fontSize: '15px' }}>
                        {nl ? template.nameNl : template.nameEn}
                      </span>
                      <span style={{
                        fontSize: '10px', fontWeight: '700', padding: '2px 8px', borderRadius: '20px',
                        background: `${template.color}22`, color: template.color, letterSpacing: '0.5px',
                      }}>
                        {template.standard}
                      </span>
                    </div>
                    <p style={{ margin: 0, fontSize: '12px', color: '#64748b', lineHeight: '1.5' }}>
                      {nl ? template.descriptionNl : template.descriptionEn}
                    </p>
                  </div>
                </div>

                {/* Item type chips */}
                <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', marginBottom: '14px' }}>
                  {['task', 'quality', 'risk'].map(type => {
                    const count = template.items.filter(i => i.type === type).length;
                    if (!count) return null;
                    const typeConfig: Record<string, { label: string; color: string }> = {
                      task: { label: nl ? `${count} taken` : `${count} tasks`, color: '#3b82f6' },
                      quality: { label: nl ? `${count} kwaliteit` : `${count} quality`, color: '#8b5cf6' },
                      risk: { label: nl ? `${count} risico's` : `${count} risks`, color: '#f43f5e' },
                    };
                    return (
                      <span key={type} style={{
                        fontSize: '11px', fontWeight: '600', padding: '3px 10px', borderRadius: '20px',
                        background: `${typeConfig[type].color}15`, color: typeConfig[type].color,
                      }}>
                        {typeConfig[type].label}
                      </span>
                    );
                  })}
                  <span style={{ fontSize: '11px', color: '#475569', padding: '3px 10px' }}>
                    {nl ? `${template.items.length} items totaal` : `${template.items.length} items total`}
                  </span>
                </div>

                {/* First 3 items preview */}
                <div style={{ marginBottom: '16px' }}>
                  {template.items.slice(0, 3).map((item, idx) => (
                    <div key={idx} style={{
                      display: 'flex', alignItems: 'center', gap: '8px', padding: '6px 0',
                      borderBottom: idx < 2 ? '1px solid rgba(255,255,255,0.04)' : 'none',
                    }}>
                      <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: priorityColor[item.priority], flexShrink: 0 }} />
                      <span style={{ fontSize: '12px', color: '#94a3b8', flex: 1 }}>
                        {nl ? item.titleNl : item.titleEn}
                      </span>
                      <span style={{ fontSize: '11px', color: '#475569' }}>
                        {item.dueOffset === 0 ? (nl ? 'vandaag' : 'today') : `+${item.dueOffset}d`}
                      </span>
                    </div>
                  ))}
                  {template.items.length > 3 && (
                    <div style={{ fontSize: '11px', color: '#475569', paddingTop: '6px' }}>
                      +{template.items.length - 3} {nl ? 'meer...' : 'more...'}
                    </div>
                  )}
                </div>

                <button
                  onClick={() => applyTemplate(template)}
                  disabled={applyingId === template.id}
                  style={{
                    width: '100%', padding: '10px', borderRadius: '10px', border: 'none', cursor: applyingId === template.id ? 'default' : 'pointer',
                    fontWeight: '700', fontSize: '13px', transition: 'all 0.2s',
                    background: appliedId === template.id
                      ? 'rgba(16,185,129,0.2)'
                      : applyingId === template.id
                        ? 'rgba(255,255,255,0.05)'
                        : `${template.color}22`,
                    color: appliedId === template.id ? '#10b981' : applyingId === template.id ? '#475569' : template.color,
                  }}
                >
                  {appliedId === template.id
                    ? (nl ? '✓ Project aangemaakt!' : '✓ Project created!')
                    : applyingId === template.id
                      ? (nl ? 'Aanmaken...' : 'Creating...')
                      : (nl ? `▶ Toepassen (${template.items.length} items)` : `▶ Apply (${template.items.length} items)`)}
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* CATEGORIES TAB */}
      {activeTab === 'categories' && (
        <div>
          <div className="glass" style={{ padding: '24px', marginBottom: '24px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <div>
                <h2 style={{ margin: '0 0 4px', fontSize: '16px', fontWeight: '700', color: '#f1f5f9' }}>
                  {nl ? 'Categorieën' : 'Categories'}
                </h2>
                <p style={{ margin: 0, fontSize: '13px', color: '#64748b' }}>
                  {nl ? 'Workstreams en afdelingen om items in te groeperen' : 'Workstreams and departments to group items'}
                </p>
              </div>
              <button className="btn-primary" onClick={() => { setEditId(null); setForm({ name: '', type: 'workstream', color: '#3b82f6', description: '' }); setShowForm(true); }}>
                + {nl ? 'Nieuwe categorie' : 'New category'}
              </button>
            </div>

            {showForm && (
              <div style={{ padding: '20px', background: 'rgba(59,130,246,0.05)', border: '1px solid rgba(59,130,246,0.2)', borderRadius: '12px', marginBottom: '20px' }}>
                <h3 style={{ margin: '0 0 16px', color: '#f1f5f9', fontSize: '14px', fontWeight: '700' }}>
                  {editId ? (nl ? 'Categorie bewerken' : 'Edit category') : (nl ? 'Nieuwe categorie' : 'New category')}
                </h3>
                <form onSubmit={handleCreate} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                  <div style={{ gridColumn: '1 / -1' }}>
                    <label style={{ display: 'block', fontSize: '12px', color: '#94a3b8', marginBottom: '6px', fontWeight: '600' }}>
                      {nl ? 'Naam' : 'Name'} *
                    </label>
                    <input className="input-dark" placeholder={nl ? 'bijv. IT & Infrastructuur, HR, Kwaliteit...' : 'e.g. IT & Infrastructure, HR, Quality...'} value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} required />
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '12px', color: '#94a3b8', marginBottom: '6px', fontWeight: '600' }}>Type</label>
                    <select className="input-dark" value={form.type} onChange={e => setForm({ ...form, type: e.target.value })}>
                      <option value="workstream">Workstream</option>
                      <option value="department">{nl ? 'Afdeling' : 'Department'}</option>
                      <option value="other">{nl ? 'Overige' : 'Other'}</option>
                    </select>
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '12px', color: '#94a3b8', marginBottom: '6px', fontWeight: '600' }}>
                      {nl ? 'Kleur' : 'Color'}
                    </label>
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
                    <label style={{ display: 'block', fontSize: '12px', color: '#94a3b8', marginBottom: '6px', fontWeight: '600' }}>
                      {nl ? 'Beschrijving' : 'Description'}
                    </label>
                    <input className="input-dark" placeholder={nl ? 'Optionele beschrijving...' : 'Optional description...'} value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} />
                  </div>
                  <div style={{ gridColumn: '1 / -1', display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
                    <button type="button" className="btn-secondary" onClick={() => { setShowForm(false); setEditId(null); }}>
                      {nl ? 'Annuleren' : 'Cancel'}
                    </button>
                    <button type="submit" className="btn-primary" disabled={saving}>
                      {saving ? (nl ? 'Opslaan...' : 'Saving...') : editId ? (nl ? 'Bijwerken' : 'Update') : (nl ? 'Aanmaken' : 'Create')}
                    </button>
                  </div>
                </form>
              </div>
            )}

            {loadingCats ? (
              <p style={{ color: '#475569', textAlign: 'center', padding: '24px' }}>{nl ? 'Laden...' : 'Loading...'}</p>
            ) : categories.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '32px', color: '#475569' }}>
                <div style={{ fontSize: '40px', marginBottom: '12px' }}>🏷️</div>
                <p style={{ margin: 0 }}>{nl ? 'Nog geen categorieën. Maak je eerste workstream of afdeling aan.' : 'No categories yet. Create your first workstream or department.'}</p>
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
                          <div style={{ fontSize: '11px', color: cat.color, marginTop: '2px' }}>{cat.shortId} · {typeLabels[cat.type][locale]}</div>
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

          <div className="glass" style={{ padding: '20px' }}>
            <h3 style={{ margin: '0 0 12px', color: '#f1f5f9', fontSize: '14px', fontWeight: '700' }}>
              💡 {nl ? 'Hoe gebruik je categorieën?' : 'How to use categories?'}
            </h3>
            <div style={{ fontSize: '13px', color: '#64748b', lineHeight: '1.7' }}>
              <p style={{ margin: '0 0 8px' }}>
                {nl
                  ? <>Categorieën laten je toe om projecten, maatregelen, acties en taken te groeperen per <strong style={{ color: '#94a3b8' }}>workstream</strong> (bijv. IT, Kwaliteit, HR) of <strong style={{ color: '#94a3b8' }}>afdeling</strong> (bijv. Productie, Finance).</>
                  : <>Categories let you group projects, measures, actions and tasks by <strong style={{ color: '#94a3b8' }}>workstream</strong> (e.g. IT, Quality, HR) or <strong style={{ color: '#94a3b8' }}>department</strong> (e.g. Production, Finance).</>
                }
              </p>
              <p style={{ margin: 0 }}>
                {nl
                  ? 'Je kunt ze toewijzen bij het aanmaken van elk item. Filters in overzichten laten je dan enkel de items van een specifieke categorie tonen.'
                  : 'Assign them when creating each item. Filters in overviews will then show only items from a specific category.'}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* SYSTEM TAB */}
      {activeTab === 'system' && (
        <div style={{ display: 'grid', gap: '16px' }}>
          <div className="glass" style={{ padding: '24px' }}>
            <h2 style={{ margin: '0 0 16px', fontSize: '16px', fontWeight: '700', color: '#f1f5f9' }}>
              🔗 {nl ? 'Snelkoppelingen' : 'Quick Links'}
            </h2>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: '12px' }}>
              {[
                { icon: '🌐', label: 'pureexcellence.be', url: 'https://pureexcellence.be', color: '#3b82f6' },
                { icon: '🗄️', label: 'Supabase Dashboard', url: 'https://supabase.com/dashboard', color: '#10b981' },
                { icon: '▲', label: 'Vercel Dashboard', url: 'https://vercel.com/dashboard', color: '#f1f5f9' },
                { icon: '📘', label: 'ISO 9001:2015', url: 'https://www.iso.org/standard/62085.html', color: '#8b5cf6' },
                { icon: '📘', label: 'ISO 22301:2019', url: 'https://www.iso.org/standard/75106.html', color: '#f59e0b' },
              ].map(link => (
                <a key={link.url} href={link.url} target="_blank" rel="noopener noreferrer" style={{
                  display: 'flex', alignItems: 'center', gap: '10px', padding: '14px 16px',
                  background: 'rgba(255,255,255,0.03)', borderRadius: '10px', border: '1px solid rgba(255,255,255,0.07)',
                  textDecoration: 'none', color: link.color, fontWeight: '600', fontSize: '13px', transition: 'all 0.15s',
                }}>
                  <span style={{ fontSize: '18px' }}>{link.icon}</span>
                  {link.label}
                  <span style={{ marginLeft: 'auto', fontSize: '10px', color: '#475569' }}>↗</span>
                </a>
              ))}
            </div>
          </div>

          <div className="glass" style={{ padding: '24px' }}>
            <h2 style={{ margin: '0 0 16px', fontSize: '16px', fontWeight: '700', color: '#f1f5f9' }}>
              ⚙️ {nl ? 'Systeeminformatie' : 'System Information'}
            </h2>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
              {[
                { label: nl ? 'Applicatie' : 'Application', value: 'Pure Project v1.0' },
                { label: nl ? 'Omgeving' : 'Environment', value: 'Production' },
                { label: 'Database', value: 'Supabase (PostgreSQL)' },
                { label: nl ? 'Hosting' : 'Hosting', value: 'Vercel (EU West)' },
                { label: nl ? 'Framework' : 'Framework', value: 'Next.js 15 App Router' },
                { label: nl ? 'Talen' : 'Languages', value: 'NL / EN' },
              ].map(item => (
                <div key={item.label} style={{ padding: '12px 14px', background: 'rgba(255,255,255,0.02)', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.05)' }}>
                  <div style={{ fontSize: '11px', color: '#475569', marginBottom: '4px', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.5px' }}>{item.label}</div>
                  <div style={{ fontSize: '13px', color: '#94a3b8', fontWeight: '600' }}>{item.value}</div>
                </div>
              ))}
            </div>
          </div>

          <div className="glass" style={{ padding: '24px' }}>
            <h2 style={{ margin: '0 0 8px', fontSize: '16px', fontWeight: '700', color: '#f1f5f9' }}>
              🔄 {nl ? 'Updates uitrollen' : 'Deploy Updates'}
            </h2>
            <p style={{ margin: '0 0 14px', fontSize: '13px', color: '#64748b' }}>
              {nl ? 'Elke git push naar main triggert automatisch een nieuwe Vercel deployment (~2 min).' : 'Every git push to main automatically triggers a new Vercel deployment (~2 min).'}
            </p>
            <div style={{ background: 'rgba(0,0,0,0.3)', borderRadius: '8px', padding: '14px 16px', fontFamily: 'monospace', fontSize: '12px', color: '#94a3b8', lineHeight: '1.8' }}>
              <span style={{ color: '#475569' }}>$ </span><span style={{ color: '#10b981' }}>git</span> add .<br />
              <span style={{ color: '#475569' }}>$ </span><span style={{ color: '#10b981' }}>git</span> commit -m <span style={{ color: '#f59e0b' }}>"Update: ..."</span><br />
              <span style={{ color: '#475569' }}>$ </span><span style={{ color: '#10b981' }}>git</span> push
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
