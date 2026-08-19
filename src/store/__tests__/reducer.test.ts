import { describe, it, expect } from 'vitest';
import { docReducer, initialState } from '../reducer';
import type { DocStore } from '../types';

describe('docReducer', () => {
  it('starts with correct initial state', () => {
    expect(initialState.input).toBeNull();
    expect(initialState.ocr).toBeNull();
    expect(initialState.ner).toBeNull();
    expect(initialState.classification).toBeNull();
    expect(initialState.activeStep).toBe(1);
    expect(initialState.completedSteps).toEqual([]);
    expect(initialState.errors).toEqual([]);
  });

  it('SET_INPUT clears all downstream state', () => {
    const state: DocStore = {
      ...initialState,
      ocr: { text: 'old', engine: 'tesseract', language: 'eng', confidence: 90, wordBoxes: [] },
      ner: { entities: [], customPatterns: [] },
      classification: { results: [], customCategories: [] },
      completedSteps: [1, 2, 3],
    };

    const input = { type: 'text' as const, rawFile: null, rawText: 'hello', previewUrl: null, pageCount: 0 };
    const next = docReducer(state, { type: 'SET_INPUT', payload: input });

    expect(next.input).toBe(input);
    expect(next.ocr).toBeNull();
    expect(next.ner).toBeNull();
    expect(next.classification).toBeNull();
    expect(next.completedSteps).toEqual([]);
  });

  it('SET_OCR clears NER and classification', () => {
    const state: DocStore = {
      ...initialState,
      ner: { entities: [], customPatterns: [] },
      classification: { results: [], customCategories: [] },
      completedSteps: [1, 2, 3],
    };

    const ocr = { text: 'hello', engine: 'tesseract' as const, language: 'eng', confidence: 95, wordBoxes: [] };
    const next = docReducer(state, { type: 'SET_OCR', payload: ocr });

    expect(next.ocr).toBe(ocr);
    expect(next.ner).toBeNull();
    expect(next.classification).toBeNull();
    expect(next.completedSteps).toEqual([1]);
  });

  it('SET_NER clears classification', () => {
    const state: DocStore = {
      ...initialState,
      classification: { results: [], customCategories: [] },
      completedSteps: [1, 2, 3],
    };

    const ner = { entities: [], customPatterns: [] };
    const next = docReducer(state, { type: 'SET_NER', payload: ner });

    expect(next.ner).toBe(ner);
    expect(next.classification).toBeNull();
    expect(next.completedSteps).toEqual([1, 2]);
  });

  it('COMPLETE_STEP adds step without duplicates', () => {
    let state = docReducer(initialState, { type: 'COMPLETE_STEP', payload: 1 });
    expect(state.completedSteps).toEqual([1]);

    state = docReducer(state, { type: 'COMPLETE_STEP', payload: 1 });
    expect(state.completedSteps).toEqual([1]);

    state = docReducer(state, { type: 'COMPLETE_STEP', payload: 2 });
    expect(state.completedSteps).toEqual([1, 2]);
  });

  it('SET_STEP changes active step', () => {
    const state = docReducer(initialState, { type: 'SET_STEP', payload: 3 });
    expect(state.activeStep).toBe(3);
  });

  it('ADD_ERROR appends error', () => {
    const error = { step: 2, severity: 'blocking' as const, code: 'OCR_FAIL', message: 'Failed', retryable: true };
    const state = docReducer(initialState, { type: 'ADD_ERROR', payload: error });
    expect(state.errors).toHaveLength(1);
    expect(state.errors[0].code).toBe('OCR_FAIL');
  });

  it('CLEAR_ERRORS removes errors for specific step', () => {
    const state: DocStore = {
      ...initialState,
      errors: [
        { step: 2, severity: 'blocking', code: 'A', message: 'a', retryable: false },
        { step: 3, severity: 'degraded', code: 'B', message: 'b', retryable: true },
      ],
    };

    const next = docReducer(state, { type: 'CLEAR_ERRORS', payload: 2 });
    expect(next.errors).toHaveLength(1);
    expect(next.errors[0].step).toBe(3);
  });

  it('RESET returns initial state', () => {
    const state: DocStore = {
      ...initialState,
      activeStep: 3,
      completedSteps: [1, 2],
      input: { type: 'text', rawFile: null, rawText: 'test', previewUrl: null, pageCount: 0 },
    };

    const next = docReducer(state, { type: 'RESET' });
    expect(next).toEqual(initialState);
  });
});
