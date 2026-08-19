import { describe, it, expect } from 'vitest';
import { chunkText } from '../chunkText';

describe('chunkText', () => {
  it('returns single chunk for short text', () => {
    const text = 'Hello world';
    const chunks = chunkText(text);
    expect(chunks).toHaveLength(1);
    expect(chunks[0]).toEqual({ chunk: text, offset: 0 });
  });

  it('splits long text into overlapping chunks', () => {
    // MAX_TOKENS=512, CHARS_PER_TOKEN=4, so maxChars=2048
    const text = 'A'.repeat(3000);
    const chunks = chunkText(text);

    expect(chunks.length).toBeGreaterThan(1);
    // First chunk starts at 0
    expect(chunks[0].offset).toBe(0);
    // Chunks overlap
    expect(chunks[1].offset).toBeLessThan(chunks[0].chunk.length);
  });

  it('covers entire text', () => {
    const text = 'B'.repeat(5000);
    const chunks = chunkText(text);
    const lastChunk = chunks[chunks.length - 1];
    expect(lastChunk.offset + lastChunk.chunk.length).toBe(text.length);
  });

  it('handles exact boundary length', () => {
    const text = 'C'.repeat(2048); // exactly maxChars
    const chunks = chunkText(text);
    expect(chunks).toHaveLength(1);
  });

  it('preserves text content', () => {
    const text = 'Hello World! '.repeat(200);
    const chunks = chunkText(text);
    for (const { chunk, offset } of chunks) {
      expect(chunk).toBe(text.slice(offset, offset + chunk.length));
    }
  });
});
