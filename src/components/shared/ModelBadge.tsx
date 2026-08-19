interface ModelBadgeProps {
  name: string;
  size: string;
  status: 'idle' | 'loading' | 'ready' | 'error';
}

export default function ModelBadge({ name, size, status }: ModelBadgeProps) {
  const statusConfig = {
    idle: { dot: 'bg-dimmed', label: 'Not loaded', text: 'text-dimmed' },
    loading: { dot: 'bg-warning animate-pulse', label: 'Loading...', text: 'text-warning' },
    ready: { dot: 'bg-success', label: 'Ready', text: 'text-success' },
    error: { dot: 'bg-error', label: 'Failed', text: 'text-error' },
  };

  const config = statusConfig[status];

  return (
    <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-lg bg-white/3 border border-panel-border">
      <span className={`w-1.5 h-1.5 rounded-full ${config.dot}`} />
      <span className="text-[10px] text-surface font-medium">{name}</span>
      <span className="text-[9px] text-dimmed">({size})</span>
      <span className={`text-[9px] font-medium ${config.text}`}>{config.label}</span>
    </div>
  );
}
