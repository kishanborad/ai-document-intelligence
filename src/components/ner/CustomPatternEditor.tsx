import { useState } from 'react';
import type { CustomPattern } from '../../store/types';

interface CustomPatternEditorProps {
  patterns: CustomPattern[];
  onChange: (patterns: CustomPattern[]) => void;
  disabled?: boolean;
}

const STORAGE_KEY = 'doc-intel-patterns';

export function loadSavedPatterns(): CustomPattern[] {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch {
    return [];
  }
}

export function savePatterns(patterns: CustomPattern[]) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(patterns));
  } catch {
    // localStorage quota exceeded — ignore
  }
}

export default function CustomPatternEditor({ patterns, onChange, disabled }: CustomPatternEditorProps) {
  const [expanded, setExpanded] = useState(false);
  const [label, setLabel] = useState('');
  const [pattern, setPattern] = useState('');
  const [error, setError] = useState<string | null>(null);

  const handleAdd = () => {
    if (!label.trim() || !pattern.trim()) return;

    try {
      new RegExp(pattern);
    } catch {
      setError('Invalid regex pattern');
      return;
    }

    const newPattern: CustomPattern = {
      id: `custom-${Date.now()}`,
      label: label.trim(),
      pattern: pattern.trim(),
    };

    const updated = [...patterns, newPattern];
    onChange(updated);
    savePatterns(updated);
    setLabel('');
    setPattern('');
    setError(null);
  };

  const handleRemove = (id: string) => {
    const updated = patterns.filter((p) => p.id !== id);
    onChange(updated);
    savePatterns(updated);
  };

  return (
    <div className="glass-surface rounded-xl overflow-hidden">
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full px-4 py-2.5 flex items-center justify-between text-xs font-medium text-dimmed hover:text-surface transition-colors cursor-pointer"
      >
        <span>Custom Patterns ({patterns.length})</span>
        <svg
          className={`w-3.5 h-3.5 transition-transform duration-200 ${expanded ? 'rotate-180' : ''}`}
          fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {expanded && (
        <div className="px-4 pb-4 space-y-3">
          {/* Existing patterns */}
          {patterns.map((p) => (
            <div key={p.id} className="flex items-center gap-2 text-xs">
              <span className="px-1.5 py-0.5 rounded bg-accent/10 text-accent font-medium">{p.label}</span>
              <code className="flex-1 text-dimmed font-mono truncate">{p.pattern}</code>
              <button
                onClick={() => handleRemove(p.id)}
                disabled={disabled}
                className="text-dimmed hover:text-error transition-colors cursor-pointer"
              >
                ×
              </button>
            </div>
          ))}

          {/* Add new pattern */}
          <div className="flex gap-2">
            <input
              type="text"
              value={label}
              onChange={(e) => setLabel(e.target.value)}
              placeholder="Label"
              disabled={disabled}
              className="w-24 bg-white/5 border border-panel-border rounded-md px-2 py-1.5 text-xs text-surface placeholder:text-dimmed/50 focus:outline-none focus:ring-1 focus:ring-accent/30"
            />
            <input
              type="text"
              value={pattern}
              onChange={(e) => { setPattern(e.target.value); setError(null); }}
              placeholder="Regex pattern"
              disabled={disabled}
              className="flex-1 bg-white/5 border border-panel-border rounded-md px-2 py-1.5 text-xs text-surface font-mono placeholder:text-dimmed/50 focus:outline-none focus:ring-1 focus:ring-accent/30"
            />
            <button
              onClick={handleAdd}
              disabled={disabled || !label.trim() || !pattern.trim()}
              className="px-3 py-1.5 rounded-md text-xs font-medium gradient-accent text-white disabled:opacity-30 cursor-pointer disabled:cursor-not-allowed"
            >
              Add
            </button>
          </div>

          {error && <p className="text-[10px] text-error">{error}</p>}
        </div>
      )}
    </div>
  );
}
