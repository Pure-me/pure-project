'use client';

import { useState, useEffect, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import ItemPanel, { PanelItem } from '@/components/ItemPanel';

// ─── Types ────────────────────────────────────────────────────────────────────
interface CAPAAction {
  id: string;
  description: string;
  ownerName: string;
  ownerJobTitle?: string;
  dueDate: string;
  completedDate?: string;
  status: 'open' | 'in_progress' | 'completed';
}

interface VerificationCheck {
  checkNumber: 1 | 2 | 3;
  description: string;
  method: string;
  methodOther?: string;
  dateDone?: string;
  verdict?: 'ok' | 'not_ok';
  notes?: string;
}

interface Comment {
  id: string;
  authorId: string;
  authorName: string;
  text: string;
  type?: 'comment' | 'status_change' | 'attachment';
  createdAt: string;
}

interface Attachment {
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

interface CAPA {
  id: string;
  shortId: string;
  stage: string;
  status: string;
  // Part 1
  initiationDate: string;
  initiatedBy: string;
  initiatedByName: string;
  initiatedByJobTitle: string;
  department: string;
  scope: string;
  categoryId?: string;
  source: string;
  sourceReference: string;
  sourceOtherDescription?: string;
  nonconformityDescription: string;
  ownerName: string;
  ownerJobTitle: string;
  assignmentDate: string;
  planDueDate: string;
  capaTeam: string;
  // Part 2
  riskCustomer: string;
  riskCompany: string;
  riskProcess: string;
  correction: string;
  correctionDueDate?: string;
  rcaMethods: string[];
  rcaMethodOther?: string;
  rcaDescription: string;
  rootCause: string;
  actionPlanType: string;
  actions: CAPAAction[];
  // Part 3
  verificationPlan: string;
  verificationResponsibleName: string;
  verificationStartDate?: string;
  verificationChecks: VerificationCheck[];
  // Part 4
  conclusion: string;
  validationConfirmed: boolean;
  isSuccessful?: boolean;
  newCapaId?: string;
  closureDate?: string;
  closedByName?: string;
  closedByJobTitle?: string;
  comments: Comment[];
  attachments: Attachment[];
  linkedQualityItemId?: string;
  createdAt: string;
  updatedAt: string;
}

// ─── Constants ────────────────────────────────────────────────────────────────
const STAGES = [
  { key: 'initiation',     label: 'Initiatie',       part: 1, step: 1 },
  { key: 'risk_assessment',label: 'Risico-analyse',  part: 2, step: 1 },
  { key: 'correction',     label: 'Correctie',       part: 2, step: 2 },
  { key: 'rca',            label: 'Oorzaakanalyse',  part: 2, step: 3 },
  { key: 'action_plan',    label: 'Actieplan',       part: 2, step: 4 },
  { key: 'verification',   label: 'Verificatie',     part: 3, step: 1 },
  { key: 'closure',        label: 'Afsluiting',      part: 4, step: 1 },
];

const STAGE_INDEX: Record<string, number> = Object.fromEntries(STAGES.map((s, i) => [s.key, i]));

const RCA_METHODS = [
  { value: '5why',      label: '5x Waarom' },
  { value: 'fishbone',  label: 'Visgraatdiagram (Ishikawa)' },
  { value: 'fmea',      label: 'FMEA' },
  { value: 'pareto',    label: 'Pareto-analyse' },
  { value: 'scatter',   label: 'Spreidingsdiagram' },
  { value: 'other',     label: 'Ander' },
];

const VERIFY_METHODS = [
  'email', 'meeting', 'phone', 'procedure', 'process', 'questioning', 'system', 'visit', 'visual', 'other',
];

const SOURCE_LABELS: Record<string, string> = {
  customer_complaint: 'Klachten klant',
  external_audit: 'Externe audit',
  external_supplier: 'Externe leverancier',
  incident: 'Incident',
  internal_audit: 'Interne audit',
  management_review: 'Management review',
  process_issue: 'Procesprobleem',
  reportable_event: 'Meldplichtig event',
  other: 'Ander',
};

const STATUS_COLORS: Record<string, string> = {
  open: '#3b82f6',
  in_progress: '#f59e0b',
  verification: '#a78bfa',
  closed: '#22c55e',
  unsuccessful: '#ef4444',
};

const STATUS_LABELS: Record<string, string> = {
  open: 'Open',
  in_progress: 'In uitvoering',
  verification: 'Verificatie',
  closed: 'Afgesloten',
  unsuccessful: 'Niet succesvol',
};

// ─── Helpers ─────────────────────────────────────────────────────────────────
function uid() {
  return Math.random().toString(36).slice(2) + Date.now().toString(36);
}

function fmtDate(d?: string) {
  if (!d) return '—';
  return new Date(d).toLocaleDateString('nl-BE', { day: '2-digit', month: 'short', year: 'numeric' });
}

function daysDiff(from: string, to: string) {
  const a = new Date(from), b = new Date(to);
  return Math.round((b.getTime() - a.getTime()) / 86400000);
}

// ─── Section wrapper ──────────────────────────────────────────────────────────
function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 12, padding: 24, marginBottom: 20 }}>
      <div style={{ fontSize: 13, fontWeight: 600, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 16 }}>{title}</div>
      {children}
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div style={{ marginBottom: 16 }}>
      <label style={{ display: 'block', fontSize: 12, color: '#64748b', marginBottom: 6, fontWeight: 500 }}>{label}</label>
      {children}
    </div>
  );
}

const inputStyle: React.CSSProperties = {
  width: '100%', background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.12)',
  borderRadius: 8, padding: '10px 14px', color: '#e2e8f0', fontSize: 14, outline: 'none',
  boxSizing: 'border-box',
};

const taStyle: React.CSSProperties = { ...inputStyle, resize: 'vertical', minHeight: 90, fontFamily: 'inherit' };

function Inp({ value, onChange, placeholder }: { value: string; onChange: (v: string) => void; placeholder?: string }) {
  return <input style={inputStyle} value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder} />;
}

function Ta({ value, onChange, placeholder, rows = 4 }: { value: string; onChange: (v: string) => void; placeholder?: string; rows?: number }) {
  return <textarea style={{ ...taStyle, minHeight: rows * 24 }} value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder} />;
}

// ─── Main component ───────────────────────────────────────────────────────────
export default function CAPADetailPage() {
  const params = useParams();
  const router = useRouter();
  const id = params?.id as string;

  const [capa, setCapa] = useState<CAPA | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [activeStage, setActiveStage] = useState<string>('initiation');
  const [panelItem, setPanelItem] = useState<PanelItem | null>(null);

  // Local editable state per stage
  const [form, setForm] = useState<Partial<CAPA>>({});

  const load = useCallback(async () => {
    const res = await fetch(`/api/capa/${id}`);
    if (!res.ok) { router.push('/dashboard/capa'); return; }
    const data: CAPA = await res.json();
    setCapa(data);
    setForm(data);
    setActiveStage(data.stage);
    setLoading(false);
  }, [id, router]);

  useEffect(() => { load(); }, [load]);

  const patch = async (updates: Partial<CAPA>) => {
    setSaving(true);
    const res = await fetch(`/api/capa/${id}`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(updates) });
    if (res.ok) {
      const updated: CAPA = await res.json();
      setCapa(updated);
      setForm(updated);
    }
    setSaving(false);
  };

  const advanceStage = async (nextStage: string) => {
    await patch({ ...form, stage: nextStage as CAPA['stage'], status: nextStage === 'closure' ? 'verification' : nextStage === 'action_plan' ? 'in_progress' : capa!.status });
    setActiveStage(nextStage);
  };

  const saveAndStay = async () => {
    await patch(form);
  };

  // ─── Panel item builder ────────────────────────────────────────────────────
  const openPanel = () => {
    if (!capa) return;
    setPanelItem({
      id: capa.id,
      shortId: capa.shortId,
      title: capa.nonconformityDescription?.slice(0, 60) || capa.shortId,
      description: `CAPA initiatie: ${fmtDate(capa.initiationDate)} | Eigenaar: ${capa.ownerName}`,
      status: capa.status,
      type: 'capa',
      dueDate: capa.planDueDate,
      comments: (capa.comments || []).map(c => ({ ...c, type: (c.type || 'comment') as 'comment' | 'status_change' | 'attachment' })),
      attachments: (capa.attachments || []).map(a => ({ ...a })),
      entityType: 'capa',
    });
  };

  // Refresh after panel close
  const handlePanelClose = () => {
    setPanelItem(null);
    load();
  };

  // ─── Actions management ───────────────────────────────────────────────────
  const addAction = () => {
    const newAction: CAPAAction = {
      id: uid(), description: '', ownerName: '', ownerJobTitle: '', dueDate: '', status: 'open',
    };
    setForm(f => ({ ...f, actions: [...(f.actions || []), newAction] }));
  };

  const updateAction = (idx: number, key: keyof CAPAAction, val: string) => {
    setForm(f => {
      const actions = [...(f.actions || [])];
      actions[idx] = { ...actions[idx], [key]: val };
      return { ...f, actions };
    });
  };

  const removeAction = (idx: number) => {
    setForm(f => ({ ...f, actions: (f.actions || []).filter((_, i) => i !== idx) }));
  };

  // ─── Verification checks ──────────────────────────────────────────────────
  const ensureChecks = (checks: VerificationCheck[]) => {
    const result: VerificationCheck[] = [1, 2, 3].map(n => {
      const existing = checks.find(c => c.checkNumber === n);
      return existing || {
        checkNumber: n as 1 | 2 | 3,
        description: '',
        method: 'meeting',
        dateDone: undefined,
        verdict: undefined,
        notes: undefined,
      };
    });
    return result;
  };

  const updateCheck = (checkNumber: 1 | 2 | 3, key: keyof VerificationCheck, val: string | undefined) => {
    setForm(f => {
      const checks = ensureChecks(f.verificationChecks || []);
      const idx = checks.findIndex(c => c.checkNumber === checkNumber);
      checks[idx] = { ...checks[idx], [key]: val };
      return { ...f, verificationChecks: checks };
    });
  };

  // ─── Loading ──────────────────────────────────────────────────────────────
  if (loading || !capa) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100vh', color: '#94a3b8' }}>
        Laden...
      </div>
    );
  }

  const currentStageIdx = STAGE_INDEX[activeStage] ?? 0;
  const checks = ensureChecks(form.verificationChecks || []);

  // ─── Stage content ─────────────────────────────────────────────────────────
  const renderStage = () => {
    switch (activeStage) {

      // ── PART 1 – Initiation ────────────────────────────────────────────────
      case 'initiation':
        return (
          <>
            <Section title="Initiator">
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                <Field label="Geïnitieerd door">
                  <Inp value={form.initiatedByName || ''} onChange={v => setForm(f => ({ ...f, initiatedByName: v }))} />
                </Field>
                <Field label="Functietitel">
                  <Inp value={form.initiatedByJobTitle || ''} onChange={v => setForm(f => ({ ...f, initiatedByJobTitle: v }))} />
                </Field>
                <Field label="Afdeling">
                  <Inp value={form.department || ''} onChange={v => setForm(f => ({ ...f, department: v }))} />
                </Field>
                <Field label="Scope">
                  <Inp value={form.scope || ''} onChange={v => setForm(f => ({ ...f, scope: v }))} />
                </Field>
                <Field label="Initiatiedatum">
                  <input type="date" style={inputStyle} value={form.initiationDate || ''} onChange={e => setForm(f => ({ ...f, initiationDate: e.target.value }))} />
                </Field>
              </div>
            </Section>

            <Section title="Bron van de non-conformiteit">
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 16 }}>
                <Field label="Referentienummer">
                  <Inp value={form.sourceReference || ''} onChange={v => setForm(f => ({ ...f, sourceReference: v }))} placeholder="bijv. CAPA-2026-001" />
                </Field>
                <Field label="Bron">
                  <select style={inputStyle} value={form.source || ''} onChange={e => setForm(f => ({ ...f, source: e.target.value }))}>
                    {Object.entries(SOURCE_LABELS).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
                  </select>
                </Field>
              </div>
              {form.source === 'other' && (
                <Field label="Beschrijving andere bron">
                  <Inp value={form.sourceOtherDescription || ''} onChange={v => setForm(f => ({ ...f, sourceOtherDescription: v }))} />
                </Field>
              )}
              <Field label="Beschrijving non-conformiteit *">
                <Ta value={form.nonconformityDescription || ''} onChange={v => setForm(f => ({ ...f, nonconformityDescription: v }))} placeholder="Beschrijf de non-conformiteit in detail…" rows={5} />
              </Field>
            </Section>

            <Section title="Eigenaar & team">
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                <Field label="Eigenaar naam">
                  <Inp value={form.ownerName || ''} onChange={v => setForm(f => ({ ...f, ownerName: v }))} />
                </Field>
                <Field label="Functietitel eigenaar">
                  <Inp value={form.ownerJobTitle || ''} onChange={v => setForm(f => ({ ...f, ownerJobTitle: v }))} />
                </Field>
                <Field label="Datum toewijzing">
                  <input type="date" style={inputStyle} value={form.assignmentDate || ''} onChange={e => setForm(f => ({ ...f, assignmentDate: e.target.value }))} />
                </Field>
                <Field label="Deadline actieplan (max 15 werkdagen)">
                  <input type="date" style={inputStyle} value={form.planDueDate || ''} onChange={e => setForm(f => ({ ...f, planDueDate: e.target.value }))} />
                </Field>
              </div>
              <Field label="CAPA Team (namen + functies)">
                <Ta value={form.capaTeam || ''} onChange={v => setForm(f => ({ ...f, capaTeam: v }))} placeholder="bijv. Jan Janssen (QA Manager), …" rows={3} />
              </Field>
            </Section>
          </>
        );

      // ── PART 2, Step 1 – Risk Assessment ─────────────────────────────────
      case 'risk_assessment':
        return (
          <Section title="Risico-analyse — impact van de non-conformiteit">
            <Field label="Impact op de klant">
              <Ta value={form.riskCustomer || ''} onChange={v => setForm(f => ({ ...f, riskCustomer: v }))} placeholder="Welk risico loopt de klant?" rows={4} />
            </Field>
            <Field label="Impact op het bedrijf">
              <Ta value={form.riskCompany || ''} onChange={v => setForm(f => ({ ...f, riskCompany: v }))} placeholder="Welk risico loopt het bedrijf?" rows={4} />
            </Field>
            <Field label="Impact op het proces">
              <Ta value={form.riskProcess || ''} onChange={v => setForm(f => ({ ...f, riskProcess: v }))} placeholder="Welk risico loopt het proces?" rows={4} />
            </Field>
          </Section>
        );

      // ── PART 2, Step 2 – Correction ──────────────────────────────────────
      case 'correction':
        return (
          <Section title="Onmiddellijke correctie">
            <Field label="Beschrijving correctie *">
              <Ta value={form.correction || ''} onChange={v => setForm(f => ({ ...f, correction: v }))} placeholder="Welke onmiddellijke actie werd ondernomen om het probleem in te dammen?" rows={5} />
            </Field>
            <Field label="Deadline correctie">
              <input type="date" style={inputStyle} value={form.correctionDueDate || ''} onChange={e => setForm(f => ({ ...f, correctionDueDate: e.target.value }))} />
            </Field>
          </Section>
        );

      // ── PART 2, Step 3 – Root Cause Analysis ─────────────────────────────
      case 'rca':
        return (
          <>
            <Section title="Methode van oorzaakanalyse">
              <Field label="Gebruikte methode(s) *">
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10, marginTop: 4 }}>
                  {RCA_METHODS.map(m => {
                    const selected = (form.rcaMethods || []).includes(m.value);
                    return (
                      <label key={m.value} style={{ display: 'flex', alignItems: 'center', gap: 6, cursor: 'pointer', padding: '6px 12px', borderRadius: 8, background: selected ? 'rgba(99,102,241,0.2)' : 'rgba(255,255,255,0.06)', border: `1px solid ${selected ? '#6366f1' : 'rgba(255,255,255,0.1)'}`, color: selected ? '#a5b4fc' : '#94a3b8', fontSize: 13 }}>
                        <input type="checkbox" checked={selected} onChange={e => {
                          const cur = form.rcaMethods || [];
                          setForm(f => ({ ...f, rcaMethods: e.target.checked ? [...cur, m.value] : cur.filter(x => x !== m.value) }));
                        }} style={{ display: 'none' }} />
                        {m.label}
                      </label>
                    );
                  })}
                </div>
              </Field>
              {(form.rcaMethods || []).includes('other') && (
                <Field label="Beschrijving andere methode">
                  <Inp value={form.rcaMethodOther || ''} onChange={v => setForm(f => ({ ...f, rcaMethodOther: v }))} />
                </Field>
              )}
            </Section>

            <Section title="Resultaat van de oorzaakanalyse">
              <Field label="Beschrijving van de analyse *">
                <Ta value={form.rcaDescription || ''} onChange={v => setForm(f => ({ ...f, rcaDescription: v }))} placeholder="Beschrijf het verloop van de analyse (bijlage rapport mogelijk)…" rows={5} />
              </Field>
              <Field label="Vastgestelde grondoorzaak *">
                <Ta value={form.rootCause || ''} onChange={v => setForm(f => ({ ...f, rootCause: v }))} placeholder="Wat is de echte oorzaak van de non-conformiteit?" rows={4} />
              </Field>
            </Section>
          </>
        );

      // ── PART 2, Step 4 – Action Plan ─────────────────────────────────────
      case 'action_plan':
        return (
          <>
            <Section title="Type actieplan">
              <Field label="Soort actie *">
                <div style={{ display: 'flex', gap: 12 }}>
                  {[
                    { v: 'corrective', l: 'Corrigerend — aanpak van vastgestelde oorzaak' },
                    { v: 'preventive', l: 'Preventief — proactieve maatregel' },
                  ].map(({ v, l }) => (
                    <label key={v} style={{ display: 'flex', alignItems: 'flex-start', gap: 8, cursor: 'pointer', padding: '10px 16px', borderRadius: 10, background: form.actionPlanType === v ? 'rgba(99,102,241,0.2)' : 'rgba(255,255,255,0.05)', border: `1px solid ${form.actionPlanType === v ? '#6366f1' : 'rgba(255,255,255,0.1)'}`, color: form.actionPlanType === v ? '#a5b4fc' : '#94a3b8', fontSize: 13, flex: 1 }}>
                      <input type="radio" name="apt" value={v} checked={form.actionPlanType === v} onChange={() => setForm(f => ({ ...f, actionPlanType: v }))} style={{ marginTop: 2 }} />
                      {l}
                    </label>
                  ))}
                </div>
              </Field>
            </Section>

            <Section title="Acties">
              <div style={{ marginBottom: 12 }}>
                {(form.actions || []).map((act, idx) => (
                  <div key={act.id} style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 10, padding: 16, marginBottom: 12 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                      <span style={{ fontSize: 13, fontWeight: 600, color: '#94a3b8' }}>Actie {idx + 1}</span>
                      <button onClick={() => removeAction(idx)} style={{ background: 'rgba(239,68,68,0.15)', border: '1px solid rgba(239,68,68,0.3)', color: '#ef4444', borderRadius: 6, padding: '4px 10px', cursor: 'pointer', fontSize: 12 }}>Verwijder</button>
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr', gap: 12, marginBottom: 12 }}>
                      <Field label="Beschrijving">
                        <Inp value={act.description} onChange={v => updateAction(idx, 'description', v)} placeholder="Wat moet er gedaan worden?" />
                      </Field>
                      <Field label="Verantwoordelijke">
                        <Inp value={act.ownerName} onChange={v => updateAction(idx, 'ownerName', v)} />
                      </Field>
                      <Field label="Deadline">
                        <input type="date" style={inputStyle} value={act.dueDate || ''} onChange={e => updateAction(idx, 'dueDate', e.target.value)} />
                      </Field>
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                      <Field label="Functietitel verantwoordelijke">
                        <Inp value={act.ownerJobTitle || ''} onChange={v => updateAction(idx, 'ownerJobTitle', v)} />
                      </Field>
                      <Field label="Status">
                        <select style={inputStyle} value={act.status} onChange={e => updateAction(idx, 'status', e.target.value)}>
                          <option value="open">Open</option>
                          <option value="in_progress">In uitvoering</option>
                          <option value="completed">Afgerond</option>
                        </select>
                      </Field>
                    </div>
                    {act.status === 'completed' && (
                      <Field label="Datum afronding">
                        <input type="date" style={inputStyle} value={act.completedDate || ''} onChange={e => updateAction(idx, 'completedDate', e.target.value)} />
                      </Field>
                    )}
                  </div>
                ))}
              </div>
              <button onClick={addAction} style={{ background: 'rgba(99,102,241,0.15)', border: '1px dashed rgba(99,102,241,0.4)', color: '#a5b4fc', borderRadius: 10, padding: '10px 20px', cursor: 'pointer', fontSize: 13, width: '100%' }}>
                + Actie toevoegen
              </button>
            </Section>
          </>
        );

      // ── PART 3 – Verification ─────────────────────────────────────────────
      case 'verification':
        return (
          <>
            <Section title="Verificatieplan">
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                <Field label="Verificatieverantwoordelijke (niet lid CAPA-team) *">
                  <Inp value={form.verificationResponsibleName || ''} onChange={v => setForm(f => ({ ...f, verificationResponsibleName: v }))} />
                </Field>
                <Field label="Startdatum verificatie">
                  <input type="date" style={inputStyle} value={form.verificationStartDate || ''} onChange={e => setForm(f => ({ ...f, verificationStartDate: e.target.value }))} />
                </Field>
              </div>
              <Field label="Verificatieplan beschrijving">
                <Ta value={form.verificationPlan || ''} onChange={v => setForm(f => ({ ...f, verificationPlan: v }))} placeholder="Hoe wordt de effectiviteit gecontroleerd?" rows={4} />
              </Field>
            </Section>

            {[1, 2, 3].map(n => {
              const check = checks.find(c => c.checkNumber === n)!;
              const daysLabel = n === 1 ? '30 dagen' : n === 2 ? '60 dagen' : '90 dagen';
              const targetDate = form.verificationStartDate
                ? new Date(new Date(form.verificationStartDate).getTime() + n * 30 * 86400000).toISOString().split('T')[0]
                : undefined;
              return (
                <Section key={n} title={`Check ${n} — ${daysLabel}${targetDate ? ' (doeldatum: ' + fmtDate(targetDate) + ')' : ''}`}>
                  <Field label="Beschrijving controle">
                    <Ta value={check.description || ''} onChange={v => updateCheck(n as 1|2|3, 'description', v)} rows={3} />
                  </Field>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 16 }}>
                    <Field label="Methode">
                      <select style={inputStyle} value={check.method || 'meeting'} onChange={e => updateCheck(n as 1|2|3, 'method', e.target.value)}>
                        {VERIFY_METHODS.map(m => <option key={m} value={m}>{m.charAt(0).toUpperCase() + m.slice(1)}</option>)}
                      </select>
                    </Field>
                    {check.method === 'other' && (
                      <Field label="Andere methode">
                        <Inp value={check.methodOther || ''} onChange={v => updateCheck(n as 1|2|3, 'methodOther', v)} />
                      </Field>
                    )}
                    <Field label="Datum uitgevoerd">
                      <input type="date" style={inputStyle} value={check.dateDone || ''} onChange={e => updateCheck(n as 1|2|3, 'dateDone', e.target.value)} />
                    </Field>
                    <Field label="Verdict">
                      <select style={inputStyle} value={check.verdict || ''} onChange={e => updateCheck(n as 1|2|3, 'verdict', e.target.value || undefined)}>
                        <option value="">— Nog niet beoordeeld</option>
                        <option value="ok">✅ OK — effectief</option>
                        <option value="not_ok">❌ Niet OK — bijkomende actie vereist</option>
                      </select>
                    </Field>
                  </div>
                  {check.verdict === 'not_ok' && (
                    <Field label="Reden + vereiste actie (verplicht bij Niet OK)">
                      <Ta value={check.notes || ''} onChange={v => updateCheck(n as 1|2|3, 'notes', v)} rows={3} />
                    </Field>
                  )}
                </Section>
              );
            })}
          </>
        );

      // ── PART 4 – Closure ──────────────────────────────────────────────────
      case 'closure':
        return (
          <>
            <Section title="Conclusie">
              <Field label="Conclusie *">
                <Ta value={form.conclusion || ''} onChange={v => setForm(f => ({ ...f, conclusion: v }))} placeholder="Samenvatting van de CAPA en de effectiviteit van de acties…" rows={5} />
              </Field>
              <Field label="Validatie — geen negatieve impact op gerelateerde processen">
                <label style={{ display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer', padding: '10px 14px', background: form.validationConfirmed ? 'rgba(34,197,94,0.1)' : 'rgba(255,255,255,0.05)', border: `1px solid ${form.validationConfirmed ? 'rgba(34,197,94,0.3)' : 'rgba(255,255,255,0.1)'}`, borderRadius: 8 }}>
                  <input type="checkbox" checked={!!form.validationConfirmed} onChange={e => setForm(f => ({ ...f, validationConfirmed: e.target.checked }))} />
                  <span style={{ fontSize: 13, color: form.validationConfirmed ? '#86efac' : '#94a3b8' }}>
                    Ik bevestig dat de geïmplementeerde acties geen negatief effect hebben op aangrenzende processen, producten of diensten.
                  </span>
                </label>
              </Field>
              <Field label="Was de CAPA succesvol?">
                <div style={{ display: 'flex', gap: 12 }}>
                  {[{ v: true, l: '✅ Ja — CAPA succesvol afgesloten' }, { v: false, l: '❌ Nee — nieuwe CAPA nodig' }].map(({ v, l }) => (
                    <label key={String(v)} style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer', padding: '8px 14px', borderRadius: 8, background: form.isSuccessful === v ? (v ? 'rgba(34,197,94,0.15)' : 'rgba(239,68,68,0.15)') : 'rgba(255,255,255,0.05)', border: `1px solid ${form.isSuccessful === v ? (v ? 'rgba(34,197,94,0.4)' : 'rgba(239,68,68,0.4)') : 'rgba(255,255,255,0.1)'}`, color: form.isSuccessful === v ? (v ? '#86efac' : '#fca5a5') : '#94a3b8', fontSize: 13 }}>
                      <input type="radio" name="success" checked={form.isSuccessful === v} onChange={() => setForm(f => ({ ...f, isSuccessful: v }))} style={{ display: 'none' }} />
                      {l}
                    </label>
                  ))}
                </div>
              </Field>
              {form.isSuccessful === false && (
                <Field label="ID nieuwe CAPA">
                  <Inp value={form.newCapaId || ''} onChange={v => setForm(f => ({ ...f, newCapaId: v }))} placeholder="CAPAF-XXX" />
                </Field>
              )}
            </Section>

            <Section title="Autorisatie afsluiting">
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                <Field label="Afgesloten door (naam)">
                  <Inp value={form.closedByName || ''} onChange={v => setForm(f => ({ ...f, closedByName: v }))} />
                </Field>
                <Field label="Functietitel">
                  <Inp value={form.closedByJobTitle || ''} onChange={v => setForm(f => ({ ...f, closedByJobTitle: v }))} />
                </Field>
                <Field label="Afsluitingsdatum">
                  <input type="date" style={inputStyle} value={form.closureDate || ''} onChange={e => setForm(f => ({ ...f, closureDate: e.target.value }))} />
                </Field>
              </div>
            </Section>
          </>
        );

      default:
        return null;
    }
  };

  // ─── Progress summary ──────────────────────────────────────────────────────
  const completedActions = (capa.actions || []).filter(a => a.status === 'completed').length;
  const totalActions = (capa.actions || []).length;
  const allVerified = (capa.verificationChecks || []).length === 3 && (capa.verificationChecks || []).every(c => c.verdict === 'ok');
  const deadlineDays = daysDiff(new Date().toISOString().split('T')[0], capa.planDueDate);
  const isOverdue = deadlineDays < 0;

  return (
    <div style={{ minHeight: '100vh', background: 'linear-gradient(135deg, #0a0e1a 0%, #0f1629 50%, #0a0e1a 100%)', padding: '0 0 80px' }}>

      {/* Header */}
      <div style={{ background: 'rgba(255,255,255,0.03)', borderBottom: '1px solid rgba(255,255,255,0.08)', padding: '20px 32px', display: 'flex', alignItems: 'center', gap: 16 }}>
        <button onClick={() => router.push('/dashboard/capa')} style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)', color: '#94a3b8', borderRadius: 8, padding: '8px 14px', cursor: 'pointer', fontSize: 13 }}>
          ← Terug
        </button>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, flex: 1 }}>
          <span style={{ fontFamily: 'monospace', fontSize: 13, color: '#6366f1', background: 'rgba(99,102,241,0.15)', padding: '4px 8px', borderRadius: 6 }}>{capa.shortId}</span>
          <h1 style={{ fontSize: 18, fontWeight: 700, color: '#e2e8f0', margin: 0, flex: 1 }}>
            {capa.nonconformityDescription?.slice(0, 80) || 'CAPA Detail'}
          </h1>
          <span style={{ fontSize: 12, fontWeight: 600, padding: '4px 12px', borderRadius: 20, background: `${STATUS_COLORS[capa.status] || '#64748b'}22`, color: STATUS_COLORS[capa.status] || '#64748b', border: `1px solid ${STATUS_COLORS[capa.status] || '#64748b'}44` }}>
            {STATUS_LABELS[capa.status] || capa.status}
          </span>
        </div>
        <button onClick={openPanel} style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)', color: '#94a3b8', borderRadius: 8, padding: '8px 14px', cursor: 'pointer', fontSize: 13 }}>
          📎 Updates & bijlagen {capa.attachments?.length ? `(${capa.attachments.length})` : ''}
        </button>
      </div>

      <div style={{ maxWidth: 1000, margin: '0 auto', padding: '32px 32px 0' }}>

        {/* KPI bar */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 16, marginBottom: 28 }}>
          {[
            { label: 'Initiator', value: capa.initiatedByName || '—' },
            { label: 'Eigenaar', value: capa.ownerName || '—' },
            { label: 'Deadline plan', value: fmtDate(capa.planDueDate), accent: isOverdue ? '#ef4444' : '#22c55e', sub: isOverdue ? `${Math.abs(deadlineDays)}d te laat` : `${deadlineDays}d resterend` },
            { label: 'Acties', value: `${completedActions} / ${totalActions}`, sub: allVerified ? 'Verificatie OK ✅' : capa.stage === 'verification' ? 'Verificatie loopt' : '' },
          ].map(({ label, value, accent, sub }) => (
            <div key={label} style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 12, padding: '16px 20px' }}>
              <div style={{ fontSize: 11, color: '#64748b', marginBottom: 4, textTransform: 'uppercase', letterSpacing: '0.06em' }}>{label}</div>
              <div style={{ fontSize: 15, fontWeight: 700, color: accent || '#e2e8f0' }}>{value}</div>
              {sub && <div style={{ fontSize: 11, color: accent || '#64748b', marginTop: 2 }}>{sub}</div>}
            </div>
          ))}
        </div>

        {/* Stage progress */}
        <div style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 12, padding: '20px 24px', marginBottom: 28 }}>
          <div style={{ fontSize: 12, color: '#64748b', marginBottom: 14, textTransform: 'uppercase', letterSpacing: '0.06em' }}>Voortgang procedure</div>
          <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
            {STAGES.map((s, i) => {
              const done = i < currentStageIdx;
              const active = s.key === activeStage;
              const isCapaStage = STAGE_INDEX[capa.stage] >= i;
              return (
                <div key={s.key} style={{ display: 'flex', alignItems: 'center', flex: s.key !== 'closure' ? 1 : undefined }}>
                  <button
                    onClick={() => setActiveStage(s.key)}
                    style={{
                      padding: '6px 10px', borderRadius: 8, fontSize: 12, fontWeight: active ? 700 : 500, cursor: 'pointer', whiteSpace: 'nowrap',
                      background: active ? 'rgba(99,102,241,0.25)' : done || isCapaStage ? 'rgba(34,197,94,0.1)' : 'rgba(255,255,255,0.04)',
                      border: `1px solid ${active ? '#6366f1' : done || isCapaStage ? 'rgba(34,197,94,0.3)' : 'rgba(255,255,255,0.1)'}`,
                      color: active ? '#a5b4fc' : done || isCapaStage ? '#86efac' : '#475569',
                    }}
                  >
                    {done || isCapaStage ? '✓ ' : ''}{s.label}
                  </button>
                  {i < STAGES.length - 1 && <div style={{ flex: 1, height: 1, background: isCapaStage && i < currentStageIdx ? '#22c55e44' : 'rgba(255,255,255,0.08)', minWidth: 8 }} />}
                </div>
              );
            })}
          </div>
        </div>

        {/* Source badge + reference */}
        <div style={{ marginBottom: 20, display: 'flex', gap: 10, alignItems: 'center', flexWrap: 'wrap' }}>
          <span style={{ fontFamily: 'monospace', fontSize: 13, fontWeight: 700, color: '#6366f1', background: 'rgba(99,102,241,0.1)', border: '1px solid rgba(99,102,241,0.25)', padding: '3px 10px', borderRadius: 8 }}>{capa.sourceReference}</span>
          <span style={{ fontSize: 12, color: '#64748b' }}>·</span>
          <span style={{ fontSize: 12, background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)', padding: '3px 10px', borderRadius: 20, color: '#94a3b8' }}>{SOURCE_LABELS[capa.source] || capa.source}</span>
        </div>

        {/* Stage form */}
        {renderStage()}

        {/* Action buttons */}
        <div style={{ display: 'flex', gap: 12, justifyContent: 'space-between', marginTop: 8 }}>
          <div style={{ display: 'flex', gap: 10 }}>
            {currentStageIdx > 0 && (
              <button onClick={() => setActiveStage(STAGES[currentStageIdx - 1].key)} style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)', color: '#94a3b8', borderRadius: 10, padding: '12px 20px', cursor: 'pointer', fontSize: 14 }}>
                ← Vorige
              </button>
            )}
          </div>
          <div style={{ display: 'flex', gap: 10 }}>
            <button onClick={saveAndStay} disabled={saving} style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)', color: '#94a3b8', borderRadius: 10, padding: '12px 20px', cursor: saving ? 'not-allowed' : 'pointer', fontSize: 14, opacity: saving ? 0.6 : 1 }}>
              {saving ? 'Opslaan…' : '💾 Opslaan'}
            </button>
            {currentStageIdx < STAGES.length - 1 && (
              <button
                onClick={() => advanceStage(STAGES[currentStageIdx + 1].key)}
                disabled={saving}
                style={{ background: 'linear-gradient(135deg, #6366f1, #818cf8)', border: 'none', color: '#fff', borderRadius: 10, padding: '12px 24px', cursor: saving ? 'not-allowed' : 'pointer', fontSize: 14, fontWeight: 600, opacity: saving ? 0.6 : 1 }}
              >
                Opslaan & volgende stap →
              </button>
            )}
            {currentStageIdx === STAGES.length - 1 && (
              <button
                onClick={async () => {
                  await patch({
                    ...form,
                    stage: 'closure',
                    status: form.isSuccessful ? 'closed' : 'unsuccessful',
                    closureDate: form.closureDate || new Date().toISOString().split('T')[0],
                  });
                  router.push('/dashboard/capa');
                }}
                disabled={saving || !form.validationConfirmed || form.isSuccessful === undefined}
                style={{ background: form.validationConfirmed && form.isSuccessful !== undefined ? 'linear-gradient(135deg, #22c55e, #4ade80)' : 'rgba(255,255,255,0.06)', border: 'none', color: form.validationConfirmed && form.isSuccessful !== undefined ? '#fff' : '#475569', borderRadius: 10, padding: '12px 24px', cursor: (saving || !form.validationConfirmed || form.isSuccessful === undefined) ? 'not-allowed' : 'pointer', fontSize: 14, fontWeight: 600 }}
              >
                ✅ CAPA afsluiten
              </button>
            )}
          </div>
        </div>
      </div>

      {/* ItemPanel for updates & attachments */}
      <ItemPanel
        item={panelItem}
        onClose={handlePanelClose}
      />
    </div>
  );
}
