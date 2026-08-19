import type { Entity, Classification } from '../store/types';

/**
 * Build a plain-text annotated report with entities marked inline
 * and classification results appended.
 */
export function buildAnnotatedText(
  text: string,
  entities: Entity[],
  classifications: Classification[],
): string {
  const lines: string[] = [];

  lines.push('═══════════════════════════════════════════════════');
  lines.push('  AI Document Intelligence — Analysis Report');
  lines.push('═══════════════════════════════════════════════════');
  lines.push('');

  // Annotated text section
  lines.push('── Annotated Text ──────────────────────────────');
  lines.push('');

  if (entities.length > 0) {
    // Sort entities by start descending so insertions don't shift offsets
    const sorted = [...entities].sort((a, b) => b.start - a.start);
    let annotated = text;
    for (const e of sorted) {
      const before = annotated.slice(0, e.start);
      const matched = annotated.slice(e.start, e.end);
      const after = annotated.slice(e.end);
      annotated = `${before}[${matched}](${e.type})${after}`;
    }
    lines.push(annotated);
  } else {
    lines.push(text);
  }

  lines.push('');

  // Entity summary
  if (entities.length > 0) {
    lines.push('── Entities Found ──────────────────────────────');
    lines.push('');

    const byType = new Map<string, Entity[]>();
    for (const e of entities) {
      const list = byType.get(e.type) ?? [];
      list.push(e);
      byType.set(e.type, list);
    }

    for (const [type, list] of byType) {
      lines.push(`  ${type} (${list.length}):`);
      const unique = [...new Set(list.map((e) => e.text))];
      for (const val of unique) {
        lines.push(`    - ${val}`);
      }
      lines.push('');
    }
  }

  // Classification results
  if (classifications.length > 0) {
    lines.push('── Classification Results ──────────────────────');
    lines.push('');
    for (const c of classifications) {
      const pct = Math.round(c.score * 100);
      const bar = '█'.repeat(Math.round(pct / 5)) + '░'.repeat(20 - Math.round(pct / 5));
      const tag = c.isCustom ? ' (custom)' : '';
      lines.push(`  ${c.category}${tag}: ${bar} ${pct}%`);
    }
    lines.push('');
  }

  lines.push('═══════════════════════════════════════════════════');
  lines.push(`  Generated: ${new Date().toISOString()}`);
  lines.push('═══════════════════════════════════════════════════');

  return lines.join('\n');
}

export function downloadText(content: string, filename: string) {
  const blob = new Blob([content], { type: 'text/plain' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}
