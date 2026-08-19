import { describe, it, expect } from 'vitest';
import { mergeEntities } from '../mergeEntities';
import type { Entity } from '../../store/types';

const makeEntity = (start: number, end: number, confidence: number, source: 'regex' | 'bert' = 'regex'): Entity => ({
  text: 'test',
  type: 'Person',
  start,
  end,
  source,
  confidence,
});

describe('mergeEntities', () => {
  it('returns all entities when no overlap', () => {
    const regex = [makeEntity(0, 5, 1.0)];
    const bert = [makeEntity(10, 15, 0.9, 'bert')];
    const merged = mergeEntities(regex, bert);
    expect(merged).toHaveLength(2);
  });

  it('keeps higher confidence when overlapping', () => {
    const regex = [makeEntity(0, 10, 1.0)];
    const bert = [makeEntity(5, 15, 0.8, 'bert')];
    const merged = mergeEntities(regex, bert);
    expect(merged).toHaveLength(1);
    expect(merged[0].confidence).toBe(1.0);
  });

  it('keeps BERT entity when it has higher confidence', () => {
    const regex = [makeEntity(0, 10, 0.5)];
    const bert = [makeEntity(5, 15, 0.95, 'bert')];
    const merged = mergeEntities(regex, bert);
    expect(merged).toHaveLength(1);
    expect(merged[0].source).toBe('bert');
  });

  it('handles empty arrays', () => {
    expect(mergeEntities([], [])).toEqual([]);
    expect(mergeEntities([makeEntity(0, 5, 1)], [])).toHaveLength(1);
    expect(mergeEntities([], [makeEntity(0, 5, 0.9, 'bert')])).toHaveLength(1);
  });

  it('sorts by start position', () => {
    const regex = [makeEntity(20, 25, 1.0)];
    const bert = [makeEntity(0, 5, 0.9, 'bert')];
    const merged = mergeEntities(regex, bert);
    expect(merged[0].start).toBe(0);
    expect(merged[1].start).toBe(20);
  });

  it('handles adjacent non-overlapping entities', () => {
    const regex = [makeEntity(0, 5, 1.0)];
    const bert = [makeEntity(5, 10, 0.9, 'bert')];
    const merged = mergeEntities(regex, bert);
    expect(merged).toHaveLength(2);
  });
});
