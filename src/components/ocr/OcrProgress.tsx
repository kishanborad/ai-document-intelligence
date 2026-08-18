interface OcrProgressProps {
  percent: number;
  stage: string;
}

export default function OcrProgress({ percent, stage }: OcrProgressProps) {
  return (
    <div className="glass-surface rounded-xl p-5">
      <div className="flex items-center justify-between mb-2">
        <span className="text-xs font-medium text-surface">Processing</span>
        <span className="text-[11px] text-accent font-semibold">{percent}%</span>
      </div>

      <div className="w-full h-1.5 rounded-full bg-white/5 overflow-hidden">
        <div
          className="h-full rounded-full gradient-accent transition-all duration-300 ease-out"
          style={{ width: `${percent}%` }}
        />
      </div>

      <p className="text-[11px] text-dimmed mt-2 capitalize">{stage}</p>
    </div>
  );
}
