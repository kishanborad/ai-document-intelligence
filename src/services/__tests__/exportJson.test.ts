import { describe, it, expect } from 'vitest';
import { buildExportPayload } from '../exportJson';
import type { DocStore } from '../../store/types';
import { initialState } from '../../store/reducer';

describe('buildExportPayload', () => {
  it('handles empty state', () => {
    const payload = buildExportPayload(initialState);
    expect(payload.exportedAt).toBeDefined();
    expect(payload.input.type).toBe('unknown');
    expect(payload.ocr).toBeNull();
    expect(payload.ner).toBeNull();
    expect(payload.classification).toBeNull();
  });

  it('includes OCR data', () => {
    const store: DocStore = {
      ...initialState,
      input: { type: 'image', rawFile: null, rawText: null, previewUrl: null, pageCount: 1 },
      ocr: { text: 'Hello world', engine: 'tesseract', language: 'eng', confidence: 95, wordBoxes: [] },
    };
    const payload = buildExportPayload(store);
    expect(payload.ocr!.text).toBe('Hello world');
    expect(payload.ocr!.wordCount).toBe(2);
    expect(payload.ocr!.confidence).toBe(95);
  });

  it('includes NER entities', () => {
    const store: DocStore = {
      ...initialState,
      ner: {
        entities: [
          { text: 'John', type: 'Person', start: 0, end: 4, source: 'regex', confidence: 1 },
        ],
        customPatterns: [],
      },
    };
    const payload = buildExportPayload(store);
    expect(payload.ner!.entityCount).toBe(1);
    expect(payload.ner!.entities[0].text).toBe('John');
  });

  it('includes classification results', () => {
    const store: DocStore = {
      ...initialState,
      classification: {
        results: [
          { category: 'Invoice', score: 0.9, isCustom: false },
          { category: 'Receipt', score: 0.5, isCustom: false },
        ],
        customCategories: [],
      },
    };
    const payload = buildExportPayload(store);
    expect(payload.classification!.topCategory).toBe('Invoice');
    expect(payload.classification!.results).toHaveLength(2);
  });
});
