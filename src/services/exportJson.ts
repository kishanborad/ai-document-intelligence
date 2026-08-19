import type { DocStore } from '../store/types';

export interface ExportPayload {
  exportedAt: string;
  input: {
    type: string;
    fileName: string | null;
    pageCount: number;
  };
  ocr: {
    text: string;
    engine: string;
    language: string;
    confidence: number;
    wordCount: number;
  } | null;
  ner: {
    entityCount: number;
    entities: Array<{
      text: string;
      type: string;
      source: string;
      confidence: number;
      start: number;
      end: number;
    }>;
  } | null;
  classification: {
    topCategory: string;
    results: Array<{
      category: string;
      score: number;
      isCustom: boolean;
    }>;
  } | null;
}

export function buildExportPayload(store: DocStore): ExportPayload {
  return {
    exportedAt: new Date().toISOString(),
    input: {
      type: store.input?.type ?? 'unknown',
      fileName: store.input?.rawFile?.name ?? null,
      pageCount: store.input?.pageCount ?? 0,
    },
    ocr: store.ocr
      ? {
          text: store.ocr.text,
          engine: store.ocr.engine,
          language: store.ocr.language,
          confidence: store.ocr.confidence,
          wordCount: store.ocr.text.split(/\s+/).filter(Boolean).length,
        }
      : null,
    ner: store.ner
      ? {
          entityCount: store.ner.entities.length,
          entities: store.ner.entities.map((e) => ({
            text: e.text,
            type: e.type,
            source: e.source,
            confidence: e.confidence,
            start: e.start,
            end: e.end,
          })),
        }
      : null,
    classification: store.classification
      ? {
          topCategory: store.classification.results[0]?.category ?? 'Unknown',
          results: store.classification.results.map((r) => ({
            category: r.category,
            score: r.score,
            isCustom: r.isCustom,
          })),
        }
      : null,
  };
}

export function downloadJson(payload: ExportPayload, filename: string) {
  const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}
