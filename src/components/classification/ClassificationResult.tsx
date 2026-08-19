import type { Classification } from '../../store/types';

interface ClassificationResultProps {
  results: Classification[];
}

export default function ClassificationResult({ results }: ClassificationResultProps) {
  if (results.length === 0) return null;

  return (
    <div className="space-y-2">
      <p className="text-[11px] text-dimmed font-medium">All Results (ranked by confidence)</p>
      <div className="glass-surface rounded-xl border border-panel-border overflow-hidden">
        <table className="w-full text-xs">
          <thead>
            <tr className="border-b border-panel-border text-dimmed">
              <th className="text-left px-4 py-2 font-medium">#</th>
              <th className="text-left px-4 py-2 font-medium">Category</th>
              <th className="text-left px-4 py-2 font-medium">Type</th>
              <th className="text-right px-4 py-2 font-medium">Score</th>
              <th className="text-left px-4 py-2 font-medium w-[40%]">Confidence</th>
            </tr>
          </thead>
          <tbody>
            {results.map((r, i) => {
              const pct = Math.round(r.score * 100);
              return (
                <tr
                  key={`${r.category}-${r.isCustom}`}
                  className="border-b border-panel-border/50 last:border-0 hover:bg-white/3 transition-colors"
                >
                  <td className="px-4 py-2 text-dimmed tabular-nums">{i + 1}</td>
                  <td className="px-4 py-2 text-surface font-medium">{r.category}</td>
                  <td className="px-4 py-2">
                    <span
                      className={`px-1.5 py-0.5 rounded text-[9px] font-medium ${
                        r.isCustom
                          ? 'bg-purple-500/15 text-purple-400'
                          : 'bg-accent/15 text-accent'
                      }`}
                    >
                      {r.isCustom ? 'Custom' : 'Built-in'}
                    </span>
                  </td>
                  <td className="px-4 py-2 text-right tabular-nums text-surface font-semibold">
                    {pct}%
                  </td>
                  <td className="px-4 py-2">
                    <div className="w-full h-1 rounded-full bg-white/5 overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all duration-500 ${
                          r.isCustom ? 'bg-purple-500' : 'bg-accent'
                        }`}
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
