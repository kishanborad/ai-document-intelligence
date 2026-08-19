import type { Classification } from '../../store/types';

interface FixedCategoriesProps {
  results: Classification[];
}

const CATEGORY_ICONS: Record<string, string> = {
  Invoice: '\u{1F4C4}',
  Receipt: '\u{1F9FE}',
  Resume: '\u{1F4CB}',
  Letter: '\u{2709}\uFE0F',
  'ID Card': '\u{1FAAA}',
  Contract: '\u{1F4DD}',
  Report: '\u{1F4CA}',
};

export default function FixedCategories({ results }: FixedCategoriesProps) {
  const fixed = results.filter((r) => !r.isCustom).slice(0, 3);

  if (fixed.length === 0) return null;

  return (
    <div className="space-y-2">
      <p className="text-[11px] text-dimmed font-medium">Top Categories</p>
      {fixed.map((r, i) => {
        const pct = Math.round(r.score * 100);
        const isTop = i === 0;
        return (
          <div
            key={r.category}
            className={`glass-surface rounded-xl p-4 border transition-all duration-200 ${
              isTop ? 'border-accent/30 shadow-glow' : 'border-panel-border'
            }`}
          >
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <span className="text-base">{CATEGORY_ICONS[r.category] ?? '\u{1F4C1}'}</span>
                <span className={`text-sm font-semibold ${isTop ? 'text-accent' : 'text-surface'}`}>
                  {r.category}
                </span>
                {isTop && (
                  <span className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-accent/20 text-accent uppercase tracking-wider">
                    Best match
                  </span>
                )}
              </div>
              <span className={`text-xs font-semibold tabular-nums ${isTop ? 'text-accent' : 'text-dimmed'}`}>
                {pct}%
              </span>
            </div>
            <div className="w-full h-1.5 rounded-full bg-white/5 overflow-hidden">
              <div
                className={`h-full rounded-full transition-all duration-500 ease-out ${
                  isTop ? 'gradient-accent' : 'bg-dimmed/40'
                }`}
                style={{ width: `${pct}%` }}
              />
            </div>
          </div>
        );
      })}
    </div>
  );
}
