const MAX_TOKENS = 512;
const OVERLAP = 64;
// Rough estimate: 1 token ≈ 4 characters
const CHARS_PER_TOKEN = 4;

/**
 * Split text into overlapping chunks that fit within BERT's 512 token limit.
 * Returns chunks with their character offsets for entity position mapping.
 */
export function chunkText(text: string): { chunk: string; offset: number }[] {
  const maxChars = MAX_TOKENS * CHARS_PER_TOKEN;
  const overlapChars = OVERLAP * CHARS_PER_TOKEN;

  if (text.length <= maxChars) {
    return [{ chunk: text, offset: 0 }];
  }

  const chunks: { chunk: string; offset: number }[] = [];
  let start = 0;

  while (start < text.length) {
    const end = Math.min(start + maxChars, text.length);
    chunks.push({ chunk: text.slice(start, end), offset: start });

    if (end >= text.length) break;
    start = end - overlapChars;
  }

  return chunks;
}
