import { useState, useEffect } from 'react';
import type { CustomCategory } from '../../store/types';

const STORAGE_KEY = 'doc-intel-custom-categories';

export function loadSavedCategories(): CustomCategory[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function saveCategories(cats: CustomCategory[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(cats));
}

interface CustomCategoryTrainerProps {
  categories: CustomCategory[];
  onChange: (cats: CustomCategory[]) => void;
  disabled?: boolean;
}

export default function CustomCategoryTrainer({
  categories,
  onChange,
  disabled,
}: CustomCategoryTrainerProps) {
  const [expanded, setExpanded] = useState(false);
  const [newLabel, setNewLabel] = useState('');
  const [newExample, setNewExample] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);

  useEffect(() => {
    saveCategories(categories);
  }, [categories]);

  const addCategory = () => {
    const label = newLabel.trim();
    if (!label) return;
    if (categories.some((c) => c.label.toLowerCase() === label.toLowerCase())) return;

    onChange([
      ...categories,
      { id: crypto.randomUUID(), label, examples: [] },
    ]);
    setNewLabel('');
  };

  const removeCategory = (id: string) => {
    onChange(categories.filter((c) => c.id !== id));
    if (editingId === id) setEditingId(null);
  };

  const addExample = (id: string) => {
    const text = newExample.trim();
    if (!text || text.length < 5) return;

    onChange(
      categories.map((c) =>
        c.id === id ? { ...c, examples: [...c.examples, text] } : c,
      ),
    );
    setNewExample('');
  };

  const removeExample = (catId: string, index: number) => {
    onChange(
      categories.map((c) =>
        c.id === catId
          ? { ...c, examples: c.examples.filter((_, i) => i !== index) }
          : c,
      ),
    );
  };

  return (
    <div className="glass-surface rounded-xl border border-panel-border">
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full px-4 py-3 flex items-center justify-between text-xs cursor-pointer"
      >
        <span className="font-medium text-surface">
          Custom Categories ({categories.length})
        </span>
        <svg
          className={`w-3.5 h-3.5 text-dimmed transition-transform duration-200 ${expanded ? 'rotate-180' : ''}`}
          viewBox="0 0 20 20"
          fill="currentColor"
        >
          <path fillRule="evenodd" d="M5.23 7.21a.75.75 0 011.06.02L10 11.168l3.71-3.938a.75.75 0 111.08 1.04l-4.25 4.5a.75.75 0 01-1.08 0l-4.25-4.5a.75.75 0 01.02-1.06z" clipRule="evenodd" />
        </svg>
      </button>

      {expanded && (
        <div className="px-4 pb-4 space-y-3 border-t border-panel-border pt-3">
          {/* Add new category */}
          <div className="flex gap-2">
            <input
              type="text"
              value={newLabel}
              onChange={(e) => setNewLabel(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && addCategory()}
              placeholder="Category name..."
              disabled={disabled}
              className="flex-1 px-3 py-1.5 rounded-lg bg-white/5 border border-panel-border text-xs text-surface placeholder:text-dimmed/50 focus:outline-none focus:border-accent/40"
            />
            <button
              onClick={addCategory}
              disabled={disabled || !newLabel.trim()}
              className="px-3 py-1.5 rounded-lg text-xs font-medium gradient-accent text-white disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer"
            >
              Add
            </button>
          </div>

          {/* Category list */}
          {categories.map((cat) => (
            <div key={cat.id} className="rounded-lg bg-white/3 border border-panel-border p-3 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-surface">{cat.label}</span>
                <div className="flex items-center gap-2">
                  <span className="text-[10px] text-dimmed">
                    {cat.examples.length} example{cat.examples.length !== 1 ? 's' : ''}
                  </span>
                  <button
                    onClick={() => setEditingId(editingId === cat.id ? null : cat.id)}
                    disabled={disabled}
                    className="text-[10px] text-accent hover:underline cursor-pointer disabled:cursor-not-allowed"
                  >
                    {editingId === cat.id ? 'Close' : 'Edit'}
                  </button>
                  <button
                    onClick={() => removeCategory(cat.id)}
                    disabled={disabled}
                    className="text-[10px] text-error hover:underline cursor-pointer disabled:cursor-not-allowed"
                  >
                    Remove
                  </button>
                </div>
              </div>

              {editingId === cat.id && (
                <div className="space-y-2">
                  {/* Existing examples */}
                  {cat.examples.map((ex, i) => (
                    <div key={i} className="flex items-start gap-2 text-[11px]">
                      <span className="text-dimmed flex-1 break-words line-clamp-2">{ex}</span>
                      <button
                        onClick={() => removeExample(cat.id, i)}
                        disabled={disabled}
                        className="text-error/60 hover:text-error text-[10px] shrink-0 cursor-pointer"
                      >
                        x
                      </button>
                    </div>
                  ))}

                  {/* Add example */}
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={newExample}
                      onChange={(e) => setNewExample(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && addExample(cat.id)}
                      placeholder="Example text (min 5 chars)..."
                      disabled={disabled}
                      className="flex-1 px-2 py-1 rounded bg-white/5 border border-panel-border text-[11px] text-surface placeholder:text-dimmed/50 focus:outline-none focus:border-accent/40"
                    />
                    <button
                      onClick={() => addExample(cat.id)}
                      disabled={disabled || newExample.trim().length < 5}
                      className="px-2 py-1 rounded text-[10px] font-medium text-accent border border-accent/30 hover:bg-accent/10 disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer"
                    >
                      Add
                    </button>
                  </div>

                  {cat.examples.length < 2 && (
                    <p className="text-[10px] text-warning">
                      Add at least 2 examples for better accuracy.
                    </p>
                  )}
                </div>
              )}
            </div>
          ))}

          {categories.length === 0 && (
            <p className="text-[10px] text-dimmed text-center py-2">
              No custom categories yet. Add one above to train on your own document types.
            </p>
          )}
        </div>
      )}
    </div>
  );
}
