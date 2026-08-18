interface OcrResultProps {
  text: string;
  confidence: number;
  onChange: (text: string) => void;
}

export default function OcrResult({ text, confidence, onChange }: OcrResultProps) {
  const confidenceColor =
    confidence >= 0.8 ? 'text-success' : confidence >= 0.5 ? 'text-warning' : 'text-error';

  return (
    <div className="glass-surface rounded-xl p-4">
      <div className="flex items-center justify-between mb-3">
        <span className="text-xs font-medium text-surface">Extracted Text</span>
        <div className="flex items-center gap-2">
          <span className="text-[10px] text-dimmed">Confidence</span>
          <span className={`text-xs font-semibold ${confidenceColor}`}>
            {(confidence * 100).toFixed(0)}%
          </span>
        </div>
      </div>

      {confidence < 0.5 && (
        <div className="mb-3 px-3 py-2 rounded-lg bg-warning/10 border border-warning/20 text-warning text-[11px]">
          Low confidence — review and edit text below before proceeding.
        </div>
      )}

      <textarea
        value={text}
        onChange={(e) => onChange(e.target.value)}
        rows={12}
        className="w-full bg-white/[0.03] border border-panel-border rounded-lg px-4 py-3 text-sm text-surface font-mono leading-relaxed focus:outline-none focus:ring-2 focus:ring-accent/30 resize-none transition-all duration-200"
      />

      <div className="flex items-center justify-between mt-2">
        <span className="text-[10px] text-dimmed">{text.length} characters</span>
        <span className="text-[10px] text-dimmed/60">Edit text above if OCR made mistakes</span>
      </div>
    </div>
  );
}
