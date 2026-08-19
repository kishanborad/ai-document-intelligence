import { describe, it, expect } from 'vitest';
import { classifyDocument, FIXED_CATEGORIES } from '../classifyDocument';

describe('classifyDocument', () => {
  const textEmb = [1, 0, 0, 0];

  it('returns fixed categories sorted by score descending', () => {
    const catEmbs = new Map<string, number[]>();
    catEmbs.set('Invoice', [1, 0, 0, 0]); // perfect match
    catEmbs.set('Receipt', [0, 1, 0, 0]); // orthogonal
    catEmbs.set('Resume', [0.5, 0.5, 0, 0]); // partial

    const results = classifyDocument(textEmb, catEmbs, [], new Map());

    expect(results.length).toBe(3);
    expect(results[0].category).toBe('Invoice');
    expect(results[0].score).toBeCloseTo(1, 3);
    expect(results[0].isCustom).toBe(false);
    expect(results[1].category).toBe('Resume');
    expect(results[2].category).toBe('Receipt');
  });

  it('includes custom categories', () => {
    const catEmbs = new Map<string, number[]>();
    catEmbs.set('Invoice', [0, 1, 0, 0]);

    const customCats = [{ id: 'c1', label: 'Medical', examples: ['health'] }];
    const customEmbs = new Map<string, number[]>();
    customEmbs.set('c1', [1, 0, 0, 0]); // perfect match

    const results = classifyDocument(textEmb, catEmbs, customCats, customEmbs);

    const medical = results.find((r) => r.category === 'Medical');
    expect(medical).toBeDefined();
    expect(medical!.isCustom).toBe(true);
    expect(medical!.score).toBeCloseTo(1, 3);
  });

  it('returns empty when no embeddings provided', () => {
    const results = classifyDocument(textEmb, new Map(), [], new Map());
    expect(results).toEqual([]);
  });

  it('clamps negative scores to 0', () => {
    const catEmbs = new Map<string, number[]>();
    catEmbs.set('Invoice', [-1, 0, 0, 0]); // opposite direction

    const results = classifyDocument(textEmb, catEmbs, [], new Map());
    expect(results[0].score).toBe(0);
  });

  it('exports FIXED_CATEGORIES with 7 entries', () => {
    expect(FIXED_CATEGORIES).toHaveLength(7);
    const names = FIXED_CATEGORIES.map((c) => c.category);
    expect(names).toContain('Invoice');
    expect(names).toContain('Resume');
    expect(names).toContain('Contract');
  });
});
