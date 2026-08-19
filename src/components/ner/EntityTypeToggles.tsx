const ENTITY_TYPES = [
  { type: 'Person', color: '#3B82F6' },
  { type: 'Organization', color: '#8B5CF6' },
  { type: 'Location', color: '#10B981' },
  { type: 'Date', color: '#F59E0B' },
  { type: 'Email', color: '#EC4899' },
  { type: 'Phone', color: '#6366F1' },
  { type: 'Money', color: '#14B8A6' },
  { type: 'URL', color: '#64748B' },
  { type: 'Invoice#', color: '#EF4444' },
];

interface EntityTypeTogglesProps {
  enabled: Set<string>;
  onChange: (types: Set<string>) => void;
  disabled?: boolean;
}

export const ENTITY_COLORS: Record<string, string> = Object.fromEntries(
  ENTITY_TYPES.map((e) => [e.type, e.color]),
);

export default function EntityTypeToggles({ enabled, onChange, disabled }: EntityTypeTogglesProps) {
  const toggle = (type: string) => {
    const next = new Set(enabled);
    if (next.has(type)) next.delete(type);
    else next.add(type);
    onChange(next);
  };

  return (
    <div className="flex flex-wrap gap-2">
      {ENTITY_TYPES.map((et) => {
        const isOn = enabled.has(et.type);
        return (
          <button
            key={et.type}
            onClick={() => toggle(et.type)}
            disabled={disabled}
            className={`px-2.5 py-1 rounded-md text-[11px] font-medium border transition-all duration-200 cursor-pointer disabled:cursor-not-allowed ${
              isOn
                ? 'text-white border-transparent'
                : 'text-dimmed border-panel-border bg-transparent hover:border-white/15'
            }`}
            style={isOn ? { backgroundColor: et.color + 'CC', borderColor: et.color } : {}}
          >
            {et.type}
          </button>
        );
      })}
    </div>
  );
}
