/**
 * Pure Project — Export utilities
 * Supports: clipboard copy, email sharing, Excel (.xlsx), PDF
 */

// ─── TYPES ────────────────────────────────────────────────────────────────────

export interface ExportColumn {
  key: string;
  label: string;
  width?: number;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type ExportRow = Record<string, any>;

export interface ExportOptions {
  title: string;
  subtitle?: string;
  columns: ExportColumn[];
  rows: ExportRow[];
  filename?: string;
  locale?: 'nl' | 'en';
}

// ─── CLIPBOARD / EMAIL ────────────────────────────────────────────────────────

/**
 * Copy data as formatted HTML table to clipboard.
 * Works in Gmail, Outlook, Notion, etc.
 */
export async function copyToClipboard(options: ExportOptions): Promise<boolean> {
  const { title, subtitle, columns, rows } = options;

  const headerCells = columns.map(c => `<th style="background:#1e293b;color:#94a3b8;padding:8px 12px;text-align:left;font-size:12px;font-weight:600;border:1px solid #334155;">${c.label}</th>`).join('');
  const bodyRows = rows.map((row, i) => {
    const cells = columns.map(c => `<td style="padding:8px 12px;border:1px solid #334155;color:#e2e8f0;font-size:13px;background:${i % 2 === 0 ? '#0f172a' : '#1a2540'};">${formatCell(row[c.key])}</td>`).join('');
    return `<tr>${cells}</tr>`;
  }).join('');

  const html = `
    <div style="font-family:system-ui,-apple-system,sans-serif;max-width:900px;">
      <h2 style="color:#f1f5f9;margin:0 0 4px;font-size:18px;">${title}</h2>
      ${subtitle ? `<p style="color:#64748b;margin:0 0 16px;font-size:13px;">${subtitle}</p>` : ''}
      <table style="border-collapse:collapse;width:100%;margin-top:12px;">
        <thead><tr>${headerCells}</tr></thead>
        <tbody>${bodyRows}</tbody>
      </table>
      <p style="color:#475569;font-size:11px;margin-top:12px;">
        Gegenereerd door Pure Project — pureexcellence.be — ${new Date().toLocaleDateString('nl-BE')}
      </p>
    </div>
  `;

  // Also build plain text fallback
  const plainText = [
    title,
    subtitle || '',
    '',
    columns.map(c => c.label).join('\t'),
    ...rows.map(row => columns.map(c => formatCell(row[c.key])).join('\t')),
    '',
    `Pure Project — pureexcellence.be — ${new Date().toLocaleDateString('nl-BE')}`,
  ].join('\n');

  try {
    if (navigator.clipboard && window.ClipboardItem) {
      const blob = new Blob([html], { type: 'text/html' });
      const textBlob = new Blob([plainText], { type: 'text/plain' });
      await navigator.clipboard.write([
        new ClipboardItem({ 'text/html': blob, 'text/plain': textBlob }),
      ]);
    } else {
      await navigator.clipboard.writeText(plainText);
    }
    return true;
  } catch {
    // Fallback: create textarea
    const el = document.createElement('textarea');
    el.value = plainText;
    document.body.appendChild(el);
    el.select();
    document.execCommand('copy');
    document.body.removeChild(el);
    return true;
  }
}

/**
 * Open native email client with table content pasted in body.
 */
export function shareViaEmail(options: ExportOptions): void {
  const { title, subtitle, columns, rows } = options;

  const header = columns.map(c => c.label).join(' | ');
  const separator = columns.map(c => '-'.repeat(c.label.length)).join('-|-');
  const body = rows.map(row => columns.map(c => String(formatCell(row[c.key])).padEnd(c.label.length)).join(' | ')).join('\n');

  const text = [
    title,
    subtitle ? subtitle : '',
    '',
    header,
    separator,
    body,
    '',
    `Pure Project | pureexcellence.be | ${new Date().toLocaleDateString('nl-BE')}`,
  ].filter(Boolean).join('\n');

  const subject = encodeURIComponent(`${title} — Pure Project`);
  const bodyEncoded = encodeURIComponent(text);
  window.open(`mailto:?subject=${subject}&body=${bodyEncoded}`);
}

// ─── EXCEL EXPORT ─────────────────────────────────────────────────────────────

export async function exportToExcel(options: ExportOptions): Promise<void> {
  const { title, columns, rows, filename = 'export' } = options;

  // Dynamic import to avoid SSR issues
  const XLSX = await import('xlsx');

  const headerRow = columns.map(c => c.label);
  const dataRows = rows.map(row => columns.map(c => formatCellRaw(row[c.key])));

  const ws = XLSX.utils.aoa_to_sheet([headerRow, ...dataRows]);

  // Column widths
  ws['!cols'] = columns.map(c => ({ wch: c.width || Math.max(c.label.length + 2, 12) }));

  // Header style (limited in xlsx community edition)
  const range = XLSX.utils.decode_range(ws['!ref'] || 'A1');
  for (let col = range.s.c; col <= range.e.c; col++) {
    const cell = ws[XLSX.utils.encode_cell({ r: 0, c: col })];
    if (cell) {
      cell.s = {
        font: { bold: true, color: { rgb: 'FFFFFF' } },
        fill: { fgColor: { rgb: '1E293B' } },
        alignment: { horizontal: 'left' },
      };
    }
  }

  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, title.slice(0, 31));

  // Metadata sheet
  const meta = XLSX.utils.aoa_to_sheet([
    ['Pure Project'],
    ['pureexcellence.be'],
    [''],
    ['Rapport', title],
    ['Datum', new Date().toLocaleDateString('nl-BE')],
    ['Rijen', rows.length],
  ]);
  XLSX.utils.book_append_sheet(wb, meta, 'Info');

  XLSX.writeFile(wb, `${filename}-${formatDate()}.xlsx`);
}

// ─── PDF EXPORT ───────────────────────────────────────────────────────────────

export async function exportToPDF(options: ExportOptions): Promise<void> {
  const { title, subtitle, columns, rows, filename = 'export' } = options;

  const { default: jsPDF } = await import('jspdf');
  const { default: autoTable } = await import('jspdf-autotable');

  const doc = new jsPDF({ orientation: 'landscape', unit: 'mm', format: 'a4' });

  // Header
  doc.setFillColor(15, 23, 42); // #0f172a
  doc.rect(0, 0, 297, 30, 'F');

  doc.setTextColor(241, 245, 249);
  doc.setFontSize(18);
  doc.setFont('helvetica', 'bold');
  doc.text('Pure Project', 14, 12);

  doc.setFontSize(14);
  doc.text(title, 14, 22);

  if (subtitle) {
    doc.setFontSize(10);
    doc.setTextColor(148, 163, 184);
    doc.text(subtitle, 14, 28);
  }

  // Date top right
  doc.setFontSize(9);
  doc.setTextColor(100, 116, 139);
  doc.text(new Date().toLocaleDateString('nl-BE'), 283, 12, { align: 'right' });
  doc.text('pureexcellence.be', 283, 18, { align: 'right' });

  // Table
  autoTable(doc, {
    startY: 35,
    head: [columns.map(c => c.label)],
    body: rows.map(row => columns.map(c => formatCell(row[c.key]))),
    styles: {
      fontSize: 9,
      cellPadding: 4,
      textColor: [226, 232, 240],
      fillColor: [15, 23, 42],
      lineColor: [51, 65, 85],
      lineWidth: 0.1,
    },
    headStyles: {
      fillColor: [30, 41, 59],
      textColor: [148, 163, 184],
      fontStyle: 'bold',
      fontSize: 9,
    },
    alternateRowStyles: {
      fillColor: [17, 24, 39],
    },
    columnStyles: columns.reduce((acc, c, i) => {
      if (c.width) acc[i] = { cellWidth: c.width };
      return acc;
    }, {} as Record<number, { cellWidth: number }>),
    margin: { left: 14, right: 14 },
  });

  // Footer
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const pageCount = (doc as any).internal.getNumberOfPages() as number;
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    doc.setFontSize(8);
    doc.setTextColor(71, 85, 105);
    doc.text(`Pure Project | pureexcellence.be | ${new Date().toLocaleDateString('nl-BE')}`, 14, 207);
    doc.text(`${i} / ${pageCount}`, 283, 207, { align: 'right' });
  }

  doc.save(`${filename}-${formatDate()}.pdf`);
}

// ─── HELPERS ──────────────────────────────────────────────────────────────────

function formatCell(value: unknown): string {
  if (value === null || value === undefined) return '';
  if (typeof value === 'boolean') return value ? '✓' : '✗';
  if (value instanceof Date) return value.toLocaleDateString('nl-BE');
  if (typeof value === 'string' && /^\d{4}-\d{2}-\d{2}/.test(value)) {
    return new Date(value).toLocaleDateString('nl-BE');
  }
  return String(value);
}

function formatCellRaw(value: unknown): string | number | boolean {
  if (value === null || value === undefined) return '';
  if (typeof value === 'number') return value;
  if (typeof value === 'boolean') return value;
  return formatCell(value);
}

function formatDate(): string {
  const d = new Date();
  return `${d.getFullYear()}${String(d.getMonth() + 1).padStart(2, '0')}${String(d.getDate()).padStart(2, '0')}`;
}
