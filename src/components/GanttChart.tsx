'use client';

import { useMemo } from 'react';

interface GanttItem {
  id: string;
  shortId?: string;
  title: string;
  startDate?: string;
  endDate?: string;
  dueDate?: string;
  status: string;
  type?: string;
  priority?: string;
  progress?: number;
}

interface GanttChartProps {
  items: GanttItem[];
  startDate?: string;  // force chart start
  endDate?: string;    // force chart end
  title?: string;
}

const STATUS_COLORS: Record<string, string> = {
  todo: '#475569',
  in_progress: '#3b82f6',
  review: '#f59e0b',
  done: '#10b981',
  blocked: '#f43f5e',
  planning: '#8b5cf6',
  active: '#3b82f6',
  on_hold: '#f59e0b',
  completed: '#10b981',
  cancelled: '#f43f5e',
};

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Aug', 'Sep', 'Okt', 'Nov', 'Dec'];

function addDays(date: Date, days: number): Date {
  const d = new Date(date);
  d.setDate(d.getDate() + days);
  return d;
}

function daysBetween(a: Date, b: Date): number {
  return Math.round((b.getTime() - a.getTime()) / 86400000);
}

export default function GanttChart({ items, title }: GanttChartProps) {
  const { chartStart, chartEnd, totalDays, months } = useMemo(() => {
    const validItems = items.filter(i => i.startDate || i.dueDate || i.endDate);
    if (validItems.length === 0) {
      const now = new Date();
      const start = new Date(now.getFullYear(), now.getMonth(), 1);
      const end = new Date(now.getFullYear(), now.getMonth() + 3, 0);
      return { chartStart: start, chartEnd: end, totalDays: daysBetween(start, end), months: [] };
    }

    const dates: Date[] = [];
    validItems.forEach(i => {
      if (i.startDate) dates.push(new Date(i.startDate));
      if (i.endDate) dates.push(new Date(i.endDate));
      if (i.dueDate) dates.push(new Date(i.dueDate));
    });

    const minDate = new Date(Math.min(...dates.map(d => d.getTime())));
    const maxDate = new Date(Math.max(...dates.map(d => d.getTime())));

    // Pad by 1 week on each side
    const start = addDays(minDate, -7);
    start.setDate(1); // start of month
    const end = addDays(maxDate, 14);

    const total = daysBetween(start, end);

    // Build month markers
    const monthMarkers: { label: string; offset: number; width: number }[] = [];
    let cursor = new Date(start);
    while (cursor <= end) {
      const monthStart = new Date(cursor.getFullYear(), cursor.getMonth(), 1);
      const monthEnd = new Date(cursor.getFullYear(), cursor.getMonth() + 1, 0);
      const clampedStart = monthStart < start ? start : monthStart;
      const clampedEnd = monthEnd > end ? end : monthEnd;
      monthMarkers.push({
        label: `${MONTHS[cursor.getMonth()]} ${cursor.getFullYear()}`,
        offset: (daysBetween(start, clampedStart) / total) * 100,
        width: (daysBetween(clampedStart, clampedEnd) / total) * 100,
      });
      cursor = new Date(cursor.getFullYear(), cursor.getMonth() + 1, 1);
    }

    return { chartStart: start, chartEnd: end, totalDays: total, months: monthMarkers };
  }, [items]);

  const today = new Date();
  const todayOffset = Math.max(0, Math.min(100, (daysBetween(chartStart, today) / totalDays) * 100));

  const itemsWithDates = items.filter(i => i.startDate || i.dueDate || i.endDate);

  if (itemsWithDates.length === 0) {
    return (
      <div style={{ padding: '40px', textAlign: 'center', color: '#475569' }}>
        <div style={{ fontSize: '32px', marginBottom: '12px' }}>📅</div>
        <p>Geen datums ingesteld om Gantt te tonen.</p>
      </div>
    );
  }

  return (
    <div style={{ overflowX: 'auto' }}>
      {title && (
        <div style={{ fontSize: '13px', fontWeight: '700', color: '#94a3b8', marginBottom: '12px', textTransform: 'uppercase', letterSpacing: '1px' }}>
          {title}
        </div>
      )}
      <div style={{ minWidth: '600px' }}>
        {/* Month header */}
        <div style={{ display: 'flex', marginLeft: '180px', marginBottom: '8px', position: 'relative', height: '20px' }}>
          {months.map((m, i) => (
            <div key={i} style={{
              position: 'absolute',
              left: `${m.offset}%`,
              width: `${m.width}%`,
              fontSize: '11px',
              color: '#64748b',
              fontWeight: '600',
              overflow: 'hidden',
              whiteSpace: 'nowrap',
              paddingLeft: '4px',
            }}>
              {m.label}
            </div>
          ))}
        </div>

        {/* Grid + bars */}
        <div style={{ position: 'relative' }}>
          {/* Month separator lines */}
          {months.map((m, i) => (
            <div key={i} style={{
              position: 'absolute',
              left: `calc(180px + ${m.offset}% * (100% - 180px) / 100)`,
              top: 0, bottom: 0,
              width: '1px',
              background: 'rgba(255,255,255,0.04)',
              pointerEvents: 'none',
              zIndex: 0,
            }} />
          ))}

          {/* Today line */}
          <div style={{
            position: 'absolute',
            left: `calc(180px + ${todayOffset}% * (100% - 180px) / 100)`,
            top: 0, bottom: 0,
            width: '2px',
            background: 'rgba(239,68,68,0.6)',
            zIndex: 10,
            pointerEvents: 'none',
          }}>
            <div style={{
              position: 'absolute',
              top: '-18px',
              left: '-12px',
              fontSize: '10px',
              color: '#f87171',
              fontWeight: '700',
              whiteSpace: 'nowrap',
              background: 'rgba(239,68,68,0.15)',
              padding: '1px 5px',
              borderRadius: '3px',
            }}>Vandaag</div>
          </div>

          {itemsWithDates.map(item => {
            const start = item.startDate ? new Date(item.startDate) : (item.dueDate ? addDays(new Date(item.dueDate), -7) : chartStart);
            const end = item.endDate ? new Date(item.endDate) : (item.dueDate ? new Date(item.dueDate) : addDays(start, 1));

            const leftPct = Math.max(0, (daysBetween(chartStart, start) / totalDays) * 100);
            const widthPct = Math.max(0.5, (daysBetween(start, end) / totalDays) * 100);
            const color = STATUS_COLORS[item.status] || '#475569';
            const isOverdue = end < today && item.status !== 'done' && item.status !== 'completed' && item.status !== 'cancelled';

            return (
              <div key={item.id} style={{ display: 'flex', alignItems: 'center', marginBottom: '8px', gap: '0' }}>
                {/* Label */}
                <div style={{
                  width: '180px',
                  flexShrink: 0,
                  paddingRight: '12px',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '2px',
                }}>
                  <div style={{ fontSize: '12px', fontWeight: '600', color: '#e2e8f0', overflow: 'hidden', whiteSpace: 'nowrap', textOverflow: 'ellipsis' }}>
                    {item.title}
                  </div>
                  <div style={{ fontSize: '10px', color: '#475569' }}>
                    {item.shortId && <span style={{ color: '#60a5fa', marginRight: '6px' }}>{item.shortId}</span>}
                    {item.type && item.type}
                  </div>
                </div>

                {/* Bar area */}
                <div style={{ flex: 1, position: 'relative', height: '32px' }}>
                  {/* Background track */}
                  <div style={{
                    position: 'absolute',
                    inset: '8px 0',
                    background: 'rgba(255,255,255,0.03)',
                    borderRadius: '4px',
                  }} />

                  {/* Bar */}
                  <div style={{
                    position: 'absolute',
                    left: `${leftPct}%`,
                    width: `${widthPct}%`,
                    top: '6px', bottom: '6px',
                    background: isOverdue ? '#f43f5e' : color,
                    borderRadius: '4px',
                    opacity: 0.85,
                    border: isOverdue ? '1px solid rgba(244,63,94,0.5)' : `1px solid ${color}88`,
                    display: 'flex',
                    alignItems: 'center',
                    overflow: 'hidden',
                    transition: 'opacity 0.15s',
                    cursor: 'default',
                  }}
                    title={`${item.title}\n${start.toLocaleDateString('nl-BE')} → ${end.toLocaleDateString('nl-BE')}`}
                  >
                    {/* Progress fill */}
                    {item.progress !== undefined && item.progress > 0 && (
                      <div style={{
                        position: 'absolute',
                        left: 0, top: 0, bottom: 0,
                        width: `${item.progress}%`,
                        background: 'rgba(255,255,255,0.15)',
                        borderRadius: '4px 0 0 4px',
                      }} />
                    )}
                    <span style={{
                      fontSize: '10px',
                      fontWeight: '600',
                      color: 'white',
                      padding: '0 6px',
                      overflow: 'hidden',
                      whiteSpace: 'nowrap',
                      textOverflow: 'ellipsis',
                      position: 'relative',
                    }}>
                      {widthPct > 8 ? item.title : ''}
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Legend */}
        <div style={{ display: 'flex', gap: '16px', marginTop: '12px', marginLeft: '180px', flexWrap: 'wrap' }}>
          {Object.entries(STATUS_COLORS).slice(0, 5).map(([status, color]) => (
            <span key={status} style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '11px', color: '#475569' }}>
              <span style={{ width: '12px', height: '4px', background: color, borderRadius: '2px', display: 'inline-block' }} />
              {status.replace('_', ' ')}
            </span>
          ))}
          <span style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '11px', color: '#f87171' }}>
            <span style={{ width: '2px', height: '12px', background: '#f87171', display: 'inline-block' }} />
            Vandaag
          </span>
        </div>
      </div>
    </div>
  );
}
