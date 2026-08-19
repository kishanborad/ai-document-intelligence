import { describe, it, expect } from 'vitest';
import { buildAnnotatedText } from '../exportAnnotatedText';

describe('buildAnnotatedText', () => {
  it('includes header and footer', () => {
    const result = buildAnnotatedText('Hello', [], []);
    expect(result).toContain('AI Document Intelligence');
    expect(result).toContain('Generated:');
  });

  it('annotates entities inline', () => {
    const text = 'Hello John from NYC';
    const entities = [
      { text: 'John', type: 'Person', start: 6, end: 10, source: 'regex' as const, confidence: 1 },
      { text: 'NYC', type: 'Location', start: 16, end: 19, source: 'bert' as const, confidence: 0.9 },
    ];
    const result = buildAnnotatedText(text, entities, []);
    expect(result).toContain('[John](Person)');
    expect(result).toContain('[NYC](Location)');
  });

  it('includes entity summary by type', () => {
    const entities = [
      { text: 'test@test.com', type: 'Email', start: 0, end: 13, source: 'regex' as const, confidence: 1 },
    ];
    const result = buildAnnotatedText('test@test.com', entities, []);
    expect(result).toContain('Email (1)');
    expect(result).toContain('test@test.com');
  });

  it('includes classification results with bars', () => {
    const classifications = [
      { category: 'Invoice', score: 0.8, isCustom: false },
    ];
    const result = buildAnnotatedText('text', [], classifications);
    expect(result).toContain('Invoice');
    expect(result).toContain('80%');
  });

  it('handles empty inputs', () => {
    const result = buildAnnotatedText('', [], []);
    expect(result).toContain('AI Document Intelligence');
  });
});
