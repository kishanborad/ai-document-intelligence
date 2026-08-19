import { useState } from 'react';
import { useDocStore } from '../../store/DocStoreContext';
import { buildExportPayload, downloadJson } from '../../services/exportJson';
import { buildAnnotatedText, downloadText } from '../../services/exportAnnotatedText';
import { downloadZip } from '../../services/exportZip';

type ExportFormat = 'json' | 'text' | 'zip';

interface ExportOption {
  format: ExportFormat;
  label: string;
  description: string;
  icon: string;
}

const EXPORT_OPTIONS: ExportOption[] = [
  {
    format: 'json',
    label: 'JSON',
    description: 'Structured results with all metadata',
    icon: '{ }',
  },
  {
    format: 'text',
    label: 'Annotated Text',
    description: 'Readable report with inline annotations',
    icon: 'Aa',
  },
  {
    format: 'zip',
    label: 'ZIP Bundle',
    description: 'All files: JSON, text report, CSV, original',
    icon: '\u{1F4E6}',
  },
];

export default function ExportPanel() {
  const store = useDocStore();
  const [exporting, setExporting] = useState<ExportFormat | null>(null);

  const hasData = store.ocr || store.ner || store.classification || store.input?.rawText;

  const getFileStem = () => {
    const name = store.input?.rawFile?.name?.replace(/\.[^.]+$/, '') ?? 'document';
    return name.slice(0, 40);
  };

  const handleExport = async (format: ExportFormat) => {
    setExporting(format);
    const stem = getFileStem();

    try {
      switch (format) {
        case 'json': {
          const payload = buildExportPayload(store);
          downloadJson(payload, `${stem}-analysis.json`);
          break;
        }
        case 'text': {
          const text = store.ocr?.text ?? store.input?.rawText ?? '';
          const entities = store.ner?.entities ?? [];
          const classifications = store.classification?.results ?? [];
          const report = buildAnnotatedText(text, entities, classifications);
          downloadText(report, `${stem}-report.txt`);
          break;
        }
        case 'zip': {
          await downloadZip(store);
          break;
        }
      }
    } catch (err) {
      console.error('Export failed:', err);
    } finally {
      setExporting(null);
    }
  };

  // Summary stats
  const stats = [
    store.ocr && { label: 'OCR', value: `${Math.round(store.ocr.confidence)}% conf` },
    store.ner && { label: 'Entities', value: String(store.ner.entities.length) },
    store.classification && { label: 'Top class', value: store.classification.results[0]?.category ?? '-' },
  ].filter(Boolean) as Array<{ label: string; value: string }>;

  return (
    <div className="space-y-4">
      {/* Summary */}
      {stats.length > 0 && (
        <div className="glass-surface rounded-xl p-4 border border-panel-border">
          <p className="text-[11px] text-dimmed font-medium mb-3">Analysis Summary</p>
          <div className="grid grid-cols-3 gap-3">
            {stats.map((s) => (
              <div key={s.label} className="text-center">
                <p className="text-sm font-semibold text-accent">{s.value}</p>
                <p className="text-[10px] text-dimmed">{s.label}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Export options */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        {EXPORT_OPTIONS.map((opt) => {
          const isActive = exporting === opt.format;
          return (
            <button
              key={opt.format}
              onClick={() => handleExport(opt.format)}
              disabled={!hasData || isActive}
              className={`glass-surface rounded-xl p-4 border text-left transition-all duration-200 cursor-pointer disabled:cursor-not-allowed group ${
                isActive
                  ? 'border-accent/40 shadow-glow'
                  : 'border-panel-border hover:border-white/15 hover:shadow-[0_0_20px_rgba(99,102,241,0.1)]'
              } disabled:opacity-40`}
            >
              <div className="flex items-center gap-3 mb-2">
                <span className="text-lg font-mono text-accent">{opt.icon}</span>
                <span className="text-sm font-semibold text-surface group-hover:text-accent transition-colors">
                  {opt.label}
                </span>
              </div>
              <p className="text-[10px] text-dimmed leading-relaxed">
                {isActive ? 'Exporting...' : opt.description}
              </p>
            </button>
          );
        })}
      </div>

      {!hasData && (
        <p className="text-[10px] text-dimmed text-center">
          Complete at least one analysis step before exporting.
        </p>
      )}
    </div>
  );
}
