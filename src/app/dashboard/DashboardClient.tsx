'use client';

import { useState } from 'react';
import { Project, WorkItem } from '@/lib/db';
import { useI18n } from '@/lib/i18n';

interface Props {
  user: { name: string; role: string };
  stats: {
    totalProjects: number;
    activeProjects: number;
    completedProjects: number;
    totalTasks: number;
    openTasks: number;
    overdueTasks: number;
    criticalTasks: number;
    openQuality: number;
    highRisks: number;
  };
  recentProjects: Project[];
  urgentTasks: WorkItem[];
}

const statusColors: Record<string, string> = {
  planning: '#8b5cf6', active: '#3b82f6', on_hold: '#f59e0b',
  completed: '#10b981', cancelled: '#f43f5e',
  todo: '#64748b', in_progress: '#3b82f6', review: '#f59e0b', done: '#10b981', blocked: '#f43f5e',
};

const priorityColors: Record<string, string> = {
  low: '#64748b', medium: '#3b82f6', high: '#f59e0b', critical: '#f43f5e',
};

const statusLabels: Record<string, string> = {
  planning: 'Gepland', active: 'Actief', on_hold: 'On hold',
  completed: 'Voltooid', cancelled: 'Geannuleerd',
  todo: 'Te doen', in_progress: 'Bezig', review: 'Review', done: 'Klaar', blocked: 'Geblokkeerd',
};

export default function DashboardClient({ user, stats, recentProjects, urgentTasks }: Props) {
  const { t, locale } = useI18n();
  const [aiMessage, setAiMessage] = useState('');
  const [aiResponse, setAiResponse] = useState('');
  const [aiLoading, setAiLoading] = useState(false);
  const [aiOpen, setAiOpen] = useState(false);

  const sendAiMessage = async (msg?: string) => {
    const message = msg || aiMessage;
    if (!message.trim()) return;
    setAiLoading(true);
    setAiResponse('');
    setAiOpen(true);
    try {
      const res = await fetch('/api/ai', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message }),
      });
      const data = await res.json();
      setAiResponse(data.response || 'Geen antwoord beschikbaar.');
    } catch {
      setAiResponse('Er ging iets mis. Probeer opnieuw.');
    } finally {
      setAiLoading(false);
      setAiMessage('');
    }
  };

  const hour = new Date().getHours();
  const greeting = locale === 'nl'
    ? (hour < 12 ? 'Goedemorgen' : hour < 18 ? 'Goedemiddag' : 'Goedenavond')
    : (hour < 12 ? 'Good morning' : hour < 18 ? 'Good afternoon' : 'Good evening');

  return (
    <div style={{ maxWidth: '1200px' }}>
      {/* Header */}
      <div style={{ marginBottom: '32px' }}>
        <h1 style={{ fontSize: '28px', fontWeight: '800', color: '#f1f5f9', margin: '0 0 4px' }}>
          {greeting}, {user.name} 👋
        </h1>
        <p style={{ color: '#64748b', margin: 0, fontSize: '15px' }}>
          {locale === 'nl' ? 'Hier is je Pure Project overzicht van vandaag' : 'Here is your Pure Project overview for today'}
        </p>
      </div>

      {/* Stats Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px', marginBottom: '32px' }}>
        {[
          { label: t.dashboard.activeProjects, value: stats.activeProjects, total: stats.totalProjects, color: '#3b82f6', icon: '📋', bg: 'rgba(59,130,246,0.1)' },
          { label: t.dashboard.openTasks, value: stats.openTasks, total: stats.totalTasks, color: '#8b5cf6', icon: '✅', bg: 'rgba(139,92,246,0.1)' },
          { label: t.dashboard.qualityIssues, value: stats.openQuality, total: null, color: '#f59e0b', icon: '🔍', bg: 'rgba(245,158,11,0.1)', alert: stats.openQuality > 0 },
          { label: t.dashboard.highRisks, value: stats.highRisks, total: null, color: '#f43f5e', icon: '🛡️', bg: 'rgba(244,63,94,0.1)', alert: stats.highRisks > 0 },
        ].map((stat, i) => (
          <div key={i} className="glass card-hover" style={{ padding: '20px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <div>
                <div style={{ fontSize: '12px', color: '#64748b', marginBottom: '8px', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                  {stat.label}
                </div>
                <div style={{ fontSize: '36px', fontWeight: '800', color: stat.color, lineHeight: 1 }}>
                  {stat.value}
                  {stat.total !== null && <span style={{ fontSize: '16px', color: '#475569', fontWeight: '400' }}>/{stat.total}</span>}
                </div>
              </div>
              <div style={{ width: '44px', height: '44px', background: stat.bg, borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '20px' }}>
                {stat.icon}
              </div>
            </div>
            {stat.alert && stat.value > 0 && (
              <div style={{ marginTop: '10px', fontSize: '11px', color: stat.color, display: 'flex', alignItems: 'center', gap: '4px' }}>
                <span className="pulse-dot" style={{ background: stat.color }} />
                Vereist aandacht
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Health Score KPI Strip */}
      {(() => {
        // Calculate overall health score (0-100)
        const projectHealth = stats.totalProjects === 0 ? 100 : Math.round((stats.completedProjects / stats.totalProjects) * 30 + (stats.activeProjects / Math.max(stats.totalProjects, 1)) * 30);
        const taskHealth = stats.totalTasks === 0 ? 100 : Math.max(0, 100 - Math.round((stats.overdueTasks / Math.max(stats.totalTasks, 1)) * 100));
        const qualityHealth = Math.max(0, 100 - (stats.openQuality * 5));
        const riskHealth = Math.max(0, 100 - (stats.highRisks * 10));
        const overall = Math.round((projectHealth + taskHealth + qualityHealth + riskHealth) / 4);
        const healthColor = overall >= 80 ? '#10b981' : overall >= 60 ? '#f59e0b' : '#f43f5e';
        const healthLabel = overall >= 80 ? (locale === 'nl' ? 'Gezond' : 'Healthy') : overall >= 60 ? (locale === 'nl' ? 'Aandacht' : 'Attention') : (locale === 'nl' ? 'Kritiek' : 'Critical');

        return (
          <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr 1fr 1fr', gap: '10px', marginBottom: '24px' }}>
            {/* Overall health */}
            <div style={{ background: `${healthColor}12`, border: `1px solid ${healthColor}44`, borderRadius: '12px', padding: '16px 20px', display: 'flex', alignItems: 'center', gap: '16px' }}>
              <div style={{ textAlign: 'center', minWidth: '64px' }}>
                <div style={{ fontSize: '32px', fontWeight: '900', color: healthColor }}>{overall}</div>
                <div style={{ fontSize: '10px', color: healthColor, fontWeight: '700', letterSpacing: '1px' }}>/ 100</div>
              </div>
              <div>
                <div style={{ fontWeight: '700', color: '#f1f5f9', fontSize: '14px' }}>
                  {locale === 'nl' ? 'Organisatie gezondheid' : 'Organisation health'}
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginTop: '4px' }}>
                  <span className="pulse-dot" style={{ background: healthColor }} />
                  <span style={{ fontSize: '12px', color: healthColor, fontWeight: '600' }}>{healthLabel}</span>
                </div>
                <div style={{ marginTop: '8px', height: '4px', background: 'rgba(255,255,255,0.1)', borderRadius: '2px', width: '160px' }}>
                  <div style={{ height: '100%', width: `${overall}%`, background: healthColor, borderRadius: '2px', transition: 'width 0.5s' }} />
                </div>
              </div>
            </div>
            {/* Mini KPI cards */}
            {[
              { label: locale === 'nl' ? 'Projecten' : 'Projects', score: Math.min(100, projectHealth), icon: '📋' },
              { label: locale === 'nl' ? 'Taken' : 'Tasks', score: taskHealth, icon: '✅' },
              { label: locale === 'nl' ? 'Kwaliteit' : 'Quality', score: qualityHealth, icon: '🔍' },
              { label: 'BCM', score: riskHealth, icon: '🛡️' },
            ].map(kpi => {
              const c = kpi.score >= 80 ? '#10b981' : kpi.score >= 60 ? '#f59e0b' : '#f43f5e';
              return (
                <div key={kpi.label} style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: '12px', padding: '14px', textAlign: 'center' }}>
                  <div style={{ fontSize: '18px', marginBottom: '6px' }}>{kpi.icon}</div>
                  <div style={{ fontSize: '22px', fontWeight: '800', color: c }}>{kpi.score}</div>
                  <div style={{ fontSize: '10px', color: '#64748b', marginTop: '2px' }}>{kpi.label}</div>
                  <div style={{ marginTop: '8px', height: '3px', background: 'rgba(255,255,255,0.08)', borderRadius: '2px' }}>
                    <div style={{ height: '100%', width: `${kpi.score}%`, background: c, borderRadius: '2px' }} />
                  </div>
                </div>
              );
            })}
          </div>
        );
      })()}

      {/* Alerts */}
      {(stats.overdueTasks > 0 || stats.criticalTasks > 0) && (
        <div style={{
          background: 'rgba(244,63,94,0.08)', border: '1px solid rgba(244,63,94,0.25)',
          borderRadius: '12px', padding: '16px 20px', marginBottom: '24px',
          display: 'flex', alignItems: 'center', gap: '12px',
        }}>
          <span style={{ fontSize: '20px' }}>⚠️</span>
          <div>
            <div style={{ fontWeight: '600', color: '#f87171', fontSize: '14px' }}>Directe aandacht vereist</div>
            <div style={{ color: '#94a3b8', fontSize: '13px', marginTop: '2px' }}>
              {stats.overdueTasks > 0 && `${stats.overdueTasks} taak/taken zijn te laat. `}
              {stats.criticalTasks > 0 && `${stats.criticalTasks} kritieke taak/taken wachten op opvolging.`}
            </div>
          </div>
          <button
            onClick={() => sendAiMessage('Geef me aanbevelingen voor de kritieke items')}
            style={{ marginLeft: 'auto', padding: '6px 14px', background: 'rgba(244,63,94,0.15)', border: '1px solid rgba(244,63,94,0.3)', borderRadius: '8px', color: '#f87171', fontSize: '12px', cursor: 'pointer' }}
          >
            AI Advies
          </button>
        </div>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px', marginBottom: '24px' }}>
        {/* Recent Projects */}
        <div className="glass" style={{ padding: '24px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
            <h2 style={{ margin: 0, fontSize: '16px', fontWeight: '700', color: '#f1f5f9' }}>Recente Projecten</h2>
            <a href="/dashboard/projects" style={{ fontSize: '12px', color: '#3b82f6', textDecoration: 'none' }}>Alle projecten →</a>
          </div>
          {recentProjects.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '24px', color: '#475569' }}>
              <div style={{ fontSize: '32px', marginBottom: '8px' }}>📋</div>
              <p style={{ margin: 0, fontSize: '14px' }}>Nog geen projecten. Maak je eerste project aan!</p>
              <a href="/dashboard/projects" style={{ display: 'inline-block', marginTop: '12px', padding: '8px 16px', background: 'rgba(59,130,246,0.1)', border: '1px solid rgba(59,130,246,0.3)', borderRadius: '8px', color: '#60a5fa', fontSize: '12px', textDecoration: 'none' }}>
                + Nieuw project
              </a>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {recentProjects.map(project => (
                <div key={project.id} className="card-hover" style={{ padding: '14px', background: 'rgba(255,255,255,0.03)', borderRadius: '10px', border: '1px solid rgba(255,255,255,0.06)', cursor: 'pointer' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px' }}>
                    <div style={{ fontWeight: '600', color: '#e2e8f0', fontSize: '14px' }}>{project.name}</div>
                    <span style={{ fontSize: '11px', padding: '2px 8px', borderRadius: '6px', background: `${statusColors[project.status]}22`, color: statusColors[project.status] }}>
                      {statusLabels[project.status]}
                    </span>
                  </div>
                  <div style={{ marginBottom: '8px' }}>
                    <div className="progress-bar">
                      <div className="progress-fill" style={{ width: `${project.progress}%`, background: statusColors[project.status] }} />
                    </div>
                  </div>
                  <div style={{ fontSize: '12px', color: '#475569' }}>{project.progress}% voltooid</div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Urgent Tasks */}
        <div className="glass" style={{ padding: '24px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
            <h2 style={{ margin: 0, fontSize: '16px', fontWeight: '700', color: '#f1f5f9' }}>Urgente Taken</h2>
            <a href="/dashboard/tasks" style={{ fontSize: '12px', color: '#3b82f6', textDecoration: 'none' }}>Alle taken →</a>
          </div>
          {urgentTasks.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '24px', color: '#475569' }}>
              <div style={{ fontSize: '32px', marginBottom: '8px' }}>✅</div>
              <p style={{ margin: 0, fontSize: '14px' }}>Geen urgente taken. Geweldig!</p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {urgentTasks.map(task => (
                <div key={task.id} style={{ padding: '12px 14px', background: 'rgba(255,255,255,0.03)', borderRadius: '10px', border: '1px solid rgba(255,255,255,0.06)', display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: priorityColors[task.priority], flexShrink: 0 }} />
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontWeight: '500', color: '#e2e8f0', fontSize: '13px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{task.title}</div>
                    {task.dueDate && (
                      <div style={{ fontSize: '11px', color: new Date(task.dueDate) < new Date() ? '#f87171' : '#64748b', marginTop: '2px' }}>
                        {new Date(task.dueDate) < new Date() ? '⏰ Te laat: ' : '📅 '}
                        {new Date(task.dueDate).toLocaleDateString('nl-BE')}
                      </div>
                    )}
                  </div>
                  <span style={{ fontSize: '11px', padding: '2px 8px', borderRadius: '6px', background: `${statusColors[task.status]}22`, color: statusColors[task.status], flexShrink: 0 }}>
                    {statusLabels[task.status]}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* AI Assistant */}
      <div className="glass" style={{ padding: '24px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
          <div style={{ width: '40px', height: '40px', background: 'linear-gradient(135deg, #8b5cf6, #3b82f6)', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '20px' }}>
            🤖
          </div>
          <div>
            <div style={{ fontWeight: '700', color: '#f1f5f9', fontSize: '15px' }}>Pure AI Assistent</div>
            <div style={{ fontSize: '12px', color: '#475569' }}>Proactieve intelligentie voor je projecten</div>
          </div>
        </div>

        {/* Quick actions */}
        <div style={{ display: 'flex', gap: '8px', marginBottom: '16px', flexWrap: 'wrap' }}>
          {[
            'Geef me een statusoverzicht',
            'Welke risico\'s zijn er?',
            'Kwaliteitsanalyse',
            'Wat moet ik vandaag doen?',
          ].map(q => (
            <button
              key={q}
              onClick={() => sendAiMessage(q)}
              style={{
                padding: '6px 14px', borderRadius: '20px', fontSize: '12px',
                background: 'rgba(139,92,246,0.1)', border: '1px solid rgba(139,92,246,0.25)',
                color: '#a78bfa', cursor: 'pointer', transition: 'all 0.15s',
              }}
              onMouseEnter={e => (e.currentTarget.style.background = 'rgba(139,92,246,0.2)')}
              onMouseLeave={e => (e.currentTarget.style.background = 'rgba(139,92,246,0.1)')}
            >
              {q}
            </button>
          ))}
        </div>

        {/* AI Response */}
        {aiOpen && (
          <div style={{ marginBottom: '16px', padding: '16px', background: 'rgba(139,92,246,0.08)', border: '1px solid rgba(139,92,246,0.2)', borderRadius: '12px', minHeight: '60px' }}>
            {aiLoading ? (
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#8b5cf6' }}>
                <svg style={{ animation: 'spin 1s linear infinite', width: 16, height: 16 }} viewBox="0 0 24 24" fill="none">
                  <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" opacity="0.3"/>
                  <path d="M12 2a10 10 0 0 1 10 10" stroke="currentColor" strokeWidth="3" strokeLinecap="round"/>
                </svg>
                Pure AI denkt na...
              </div>
            ) : (
              <div style={{ fontSize: '14px', color: '#c4b5fd', lineHeight: '1.6', whiteSpace: 'pre-line' }}>
                {aiResponse}
              </div>
            )}
          </div>
        )}

        {/* Input */}
        <div style={{ display: 'flex', gap: '10px' }}>
          <input
            className="input-dark"
            style={{ flex: 1 }}
            placeholder="Stel een vraag aan Pure AI... (bijv. 'Wat is de status van mijn projecten?')"
            value={aiMessage}
            onChange={e => setAiMessage(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && sendAiMessage()}
          />
          <button
            className="btn-primary"
            onClick={() => sendAiMessage()}
            disabled={aiLoading || !aiMessage.trim()}
            style={{ flexShrink: 0 }}
          >
            Vraag
          </button>
        </div>
      </div>

      <style>{`
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
      `}</style>
    </div>
  );
}
