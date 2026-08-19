import { useState, useMemo } from 'react';
import type { Entity } from '../../store/types';
import { ENTITY_COLORS } from './EntityTypeToggles';

interface EntityTableProps {
  entities: Entity[];
}

type SortKey = 'text' | 'type' | 'source' | 'confidence';
type SortDir = 'asc' | 'desc';

const DEFAULT_COLOR = '#A855F7';

export default function EntityTable({ entities }: EntityTableProps) {
  const [sortKey, setSortKey] = useState<SortKey>('confidence');
  const [sortDir, setSortDir] = useState<SortDir>('desc');
  const [filterType, setFilterType] = useState<string>('');

  const types = useMemo(() => [...new Set(entities.map((e) => e.type))].sort(), [entities]);

  const sorted = useMemo(() => {
    let filtered = filterType
      ? entities.filter((e) => e.type === filterType)
      : entities;

    return [...filtered].sort((a, b) => {
      const valA = a[sortKey];
      const valB = b[sortKey];
      const cmp = typeof valA === 'string'
        ? valA.localeCompare(valB as string)
        : (valA as number) - (valB as number);
      return sortDir === 'asc' ? cmp : -cmp;
    });
  }, [entities, sortKey, sortDir, filterType]);

  const toggleSort = (key: SortKey) => {
    if (sortKey === key) {
      setSortDir((d) => (d === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortKey(key);
      setSortDir('desc');
    }
  };

  const SortIcon = ({ col }: { col: SortKey }) => {
    if (sortKey !== col) return null;
    return <span className="ml-0.5">{sortDir === 'asc' ? '↑' : '↓'}</span>;
  };

  if (entities.length === 0) {
    return (
      <div className="glass-surface rounded-xl p-4 text-xs text-dimmed text-center">
        No entities found
      </div>
    );
  }

  return (
    <div className="glass-surface rounded-xl overflow-hidden">
      {/* Filter bar */}
      <div className="px-3 py-2 border-b border-panel-border flex items-center gap-2">
        <span className="text-[10px] text-dimmed uppercase tracking-wider">Filter</span>
        <select
          value={filterType}
          onChange={(e) => setFilterType(e.target.value)}
          className="bg-white/5 border border-panel-border rounded px-2 py-1 text-[11px] text-surface focus:outline-none cursor-pointer"
        >
          <option value="" className="bg-panel-bg">All ({entities.length})</option>
          {types.map((t) => (
            <option key={t} value={t} className="bg-panel-bg">
              {t} ({entities.filter((e) => e.type === t).length})
            </option>
          ))}
        </select>
        <span className="text-[10px] text-dimmed ml-auto">{sorted.length} results</span>
      </div>

      {/* Table */}
      <div className="max-h-[300px] overflow-y-auto">
        <table className="w-full text-[11px]">
          <thead className="sticky top-0 bg-panel-bg/90 backdrop-blur-sm">
            <tr className="text-left text-dimmed">
              <th className="px-3 py-2 cursor-pointer hover:text-surface" onClick={() => toggleSort('text')}>
                Entity <SortIcon col="text" />
              </th>
              <th className="px-3 py-2 cursor-pointer hover:text-surface" onClick={() => toggleSort('type')}>
                Type <SortIcon col="type" />
              </th>
              <th className="px-3 py-2 cursor-pointer hover:text-surface" onClick={() => toggleSort('source')}>
                Source <SortIcon col="source" />
              </th>
              <th className="px-3 py-2 cursor-pointer hover:text-surface text-right" onClick={() => toggleSort('confidence')}>
                Conf <SortIcon col="confidence" />
              </th>
            </tr>
          </thead>
          <tbody>
            {sorted.map((entity, i) => {
              const color = ENTITY_COLORS[entity.type] ?? DEFAULT_COLOR;
              return (
                <tr key={i} className="border-t border-panel-border hover:bg-white/[0.02] transition-colors">
                  <td className="px-3 py-1.5 text-surface font-mono truncate max-w-[160px]">{entity.text}</td>
                  <td className="px-3 py-1.5">
                    <span
                      className="px-1.5 py-0.5 rounded text-[10px] font-medium text-white"
                      style={{ backgroundColor: color + 'CC' }}
                    >
                      {entity.type}
                    </span>
                  </td>
                  <td className="px-3 py-1.5 text-dimmed capitalize">{entity.source}</td>
                  <td className="px-3 py-1.5 text-right font-mono">
                    {(entity.confidence * 100).toFixed(0)}%
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
