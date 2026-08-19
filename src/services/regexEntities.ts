import type { Entity, CustomPattern } from '../store/types';

interface PatternDef {
  type: string;
  pattern: RegExp;
}

const BUILT_IN_PATTERNS: PatternDef[] = [
  { type: 'Email', pattern: /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g },
  { type: 'Phone', pattern: /(?:\+?1[-.\s]?)?(?:\(?\d{3}\)?[-.\s]?)?\d{3}[-.\s]?\d{4}/g },
  { type: 'URL', pattern: /https?:\/\/[^\s<>"{}|\\^`[\]]+/g },
  { type: 'Date', pattern: /\b(?:\d{1,2}[/\-.]\d{1,2}[/\-.]\d{2,4}|\d{4}[/\-.]\d{1,2}[/\-.]\d{1,2}|(?:Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)[a-z]*\.?\s+\d{1,2},?\s+\d{4}|\d{1,2}\s+(?:Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)[a-z]*\.?\s+\d{4})\b/gi },
  { type: 'Money', pattern: /[$€£¥]\s?\d{1,3}(?:[,.\s]\d{3})*(?:\.\d{1,2})?|\d{1,3}(?:[,.\s]\d{3})*(?:\.\d{1,2})?\s?(?:USD|EUR|GBP|JPY|INR)\b/g },
  { type: 'Invoice#', pattern: /\b(?:INV|Invoice|Inv)[#\-:\s]*\d{3,}\b/gi },
];

export function extractRegexEntities(
  text: string,
  enabledTypes: Set<string>,
  customPatterns: CustomPattern[],
): Entity[] {
  const entities: Entity[] = [];

  for (const def of BUILT_IN_PATTERNS) {
    if (!enabledTypes.has(def.type)) continue;

    const regex = new RegExp(def.pattern.source, def.pattern.flags);
    let match: RegExpExecArray | null;

    while ((match = regex.exec(text)) !== null) {
      entities.push({
        text: match[0],
        type: def.type,
        start: match.index,
        end: match.index + match[0].length,
        source: 'regex',
        confidence: 1.0,
      });
    }
  }

  for (const cp of customPatterns) {
    try {
      const regex = new RegExp(cp.pattern, 'gi');
      let match: RegExpExecArray | null;

      while ((match = regex.exec(text)) !== null) {
        entities.push({
          text: match[0],
          type: cp.label,
          start: match.index,
          end: match.index + match[0].length,
          source: 'regex',
          confidence: 1.0,
        });
      }
    } catch {
      // Invalid regex pattern — skip silently
    }
  }

  return entities;
}
