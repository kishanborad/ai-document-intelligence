import type { Entity } from '../store/types';

/**
 * Merge regex and BERT entities, deduplicating overlapping spans.
 * When spans overlap, keep the one with higher confidence.
 * Regex entities (confidence 1.0) win ties over BERT.
 */
export function mergeEntities(regexEntities: Entity[], bertEntities: Entity[]): Entity[] {
  const all = [...regexEntities, ...bertEntities];

  // Sort by start position, then by confidence descending
  all.sort((a, b) => a.start - b.start || b.confidence - a.confidence);

  const merged: Entity[] = [];

  for (const entity of all) {
    const last = merged[merged.length - 1];

    if (last && entity.start < last.end) {
      // Overlapping — keep whichever has higher confidence
      if (entity.confidence > last.confidence) {
        merged[merged.length - 1] = entity;
      }
      // Otherwise skip this entity (keep existing)
    } else {
      merged.push(entity);
    }
  }

  return merged;
}
