'use client';

import { useState } from 'react';
import { ExportOptions, ExportRow, copyToClipboard, shareViaEmail, exportToExcel, exportToPDF } from '@/lib/export';
import { useI18n } from '@/lib/i18n';

interface ExportBarProps extends Omit<ExportOptions, 'rows'> {
  rows: ExportRow[];
  count?: number;
}

export default function ExportBar(props: ExportBarProps) {
  const { t } = useI18n();
  const [copying, setCopying] = useState(false);
  const [exporting, setExporting] = useState<'excel' | 'pdf' | null>(null);
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    setCopying(true);
    await copyToClipboard(props);
    setCopying(false);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleExcel = async () => {
    setExporting('excel');
    await exportToExcel(props);
    setExporting(null);
  };

  const handlePDF = async () => {
    setExporting('pdf');
    await exportToPDF(props);
    setExporting(null);
  };

  const handleEmail = () => {
    shareViaEmail(props);
  };

  const btnStyle = (active: boolean, color = '#3b82f6') => ({
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    padding: '6px 14px',
    borderRadius: '8px',
    border: `1px solid ${active ? color : 'rgba(255,255,255,0.1)'}`,
    background: active ? `${color}22` : 'rgba(255,255,255,0.04)',
    color: active ? color : '#64748b',
    fontSize: '12px',
    fontWeight: '600' as const,
    cursor: 'pointer',
    transition: 'all 0.15s',
    whiteSpace: 'nowrap' as const,
  });

  return (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      gap: '8px',
      padding: '10px 16px',
      background: 'rgba(15,23,42,0.6)',
      borderRadius: '10px',
      border: '1px solid rgba(255,255,255,0.06)',
      marginBottom: '16px',
      flexWrap: 'wrap',
    }}>
      {/* Count badge */}
      {props.count !== undefined && (
        <span style={{ fontSize: '12px', color: '#475569', marginRight: '4px' }}>
          {props.count} {props.count === 1 ? 'item' : 'items'}
        </span>
      )}

      <div style={{ flex: 1 }} />

      {/* Copy */}
      <button
        onClick={handleCopy}
        style={btnStyle(copied, '#10b981')}
        title={t.export.copyTable}
      >
        {copied ? '✓' : '📋'} {copying ? '...' : copied ? t.common.copied : t.common.copy}
      </button>

      {/* Email */}
      <button
        onClick={handleEmail}
        style={btnStyle(false, '#8b5cf6')}
        title={t.export.shareEmail}
      >
        📧 {t.common.share}
      </button>

      {/* Excel */}
      <button
        onClick={handleExcel}
        disabled={exporting === 'excel'}
        style={btnStyle(false, '#22c55e')}
        title={t.export.exportExcel}
      >
        📊 {exporting === 'excel' ? t.export.generating : 'Excel'}
      </button>

      {/* PDF */}
      <button
        onClick={handlePDF}
        disabled={exporting === 'pdf'}
        style={btnStyle(false, '#f43f5e')}
        title={t.export.exportPDF}
      >
        📄 {exporting === 'pdf' ? t.export.generating : 'PDF'}
      </button>
    </div>
  );
}
