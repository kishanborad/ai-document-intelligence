import { useState } from 'react';

const MIN_CHARS = 10;

interface TextPasteAreaProps {
  onText: (text: string) => void;
  disabled?: boolean;
}

export default function TextPasteArea({ onText, disabled }: TextPasteAreaProps) {
  const [value, setValue] = useState('');
  const charCount = value.trim().length;
  const isValid = charCount >= MIN_CHARS;

  const handleSubmit = () => {
    if (!isValid || disabled) return;
    onText(value.trim());
  };

  return (
    <div>
      <div className="glass-surface rounded-xl p-4">
        <textarea
          value={value}
          onChange={(e) => setValue(e.target.value)}
          placeholder="Paste your document text here..."
          disabled={disabled}
          rows={10}
          className="w-full bg-transparent border border-panel-border rounded-lg px-4 py-3 text-sm text-surface placeholder:text-dimmed/50 focus:outline-none focus:ring-2 focus:ring-accent/30 focus:border-accent/30 resize-none transition-all duration-200 disabled:opacity-50"
        />

        <div className="flex items-center justify-between mt-3">
          <span className={`text-[11px] ${isValid ? 'text-success' : 'text-dimmed'}`}>
            {charCount} character{charCount !== 1 ? 's' : ''}{' '}
            {!isValid && `(min ${MIN_CHARS})`}
          </span>

          <button
            onClick={handleSubmit}
            disabled={!isValid || disabled}
            className="px-4 py-1.5 rounded-lg text-xs font-semibold gradient-accent text-white shadow-glow hover:shadow-[0_0_30px_rgba(99,102,241,0.35)] disabled:opacity-30 disabled:shadow-none disabled:cursor-not-allowed transition-all duration-200 cursor-pointer"
          >
            Use This Text
          </button>
        </div>
      </div>
    </div>
  );
}
