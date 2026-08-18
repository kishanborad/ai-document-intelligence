type OcrEngine = 'tesseract' | 'paddle';

interface EngineSelectorProps {
  value: OcrEngine;
  onChange: (engine: OcrEngine) => void;
  disabled?: boolean;
}

const ENGINES = [
  {
    id: 'tesseract' as const,
    name: 'Tesseract.js',
    description: 'Fast, lightweight OCR',
    size: '~7 MB',
    badge: 'Default',
  },
  {
    id: 'paddle' as const,
    name: 'PaddleOCR',
    description: 'Higher accuracy for complex layouts',
    size: '~15-30 MB',
    badge: 'Coming Soon',
    comingSoon: true,
  },
];

export default function EngineSelector({ value, onChange, disabled }: EngineSelectorProps) {
  return (
    <div className="flex gap-3">
      {ENGINES.map((engine) => (
        <button
          key={engine.id}
          onClick={() => !engine.comingSoon && onChange(engine.id)}
          disabled={disabled || engine.comingSoon}
          className={`flex-1 p-3 rounded-xl border text-left transition-all duration-200 cursor-pointer disabled:cursor-not-allowed ${
            value === engine.id && !engine.comingSoon
              ? 'border-accent/40 bg-accent/5 shadow-glow'
              : 'border-panel-border bg-white/[0.02] hover:border-white/10'
          } ${engine.comingSoon ? 'opacity-40' : ''}`}
        >
          <div className="flex items-center gap-2 mb-1">
            <span className="text-sm font-medium text-surface">{engine.name}</span>
            <span className={`text-[9px] px-1.5 py-0.5 rounded font-medium ${
              engine.comingSoon
                ? 'bg-warning/10 text-warning'
                : 'bg-accent/10 text-accent'
            }`}>
              {engine.badge}
            </span>
          </div>
          <p className="text-[11px] text-dimmed">{engine.description}</p>
          <p className="text-[10px] text-dimmed/60 mt-1">{engine.size}</p>
        </button>
      ))}
    </div>
  );
}
