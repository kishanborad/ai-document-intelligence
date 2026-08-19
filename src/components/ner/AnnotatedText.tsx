import type { Entity } from '../../store/types';
import { ENTITY_COLORS } from './EntityTypeToggles';

interface AnnotatedTextProps {
  text: string;
  entities: Entity[];
  onEntityClick?: (entity: Entity) => void;
}

const DEFAULT_COLOR = '#A855F7'; // violet for custom types

export default function AnnotatedText({ text, entities, onEntityClick }: AnnotatedTextProps) {
  if (entities.length === 0) {
    return (
      <div className="glass-surface rounded-xl p-4">
        <p className="text-xs font-mono text-dimmed/70 whitespace-pre-wrap leading-relaxed">{text}</p>
      </div>
    );
  }

  // Sort entities by start position
  const sorted = [...entities].sort((a, b) => a.start - b.start);

  const segments: JSX.Element[] = [];
  let lastEnd = 0;

  sorted.forEach((entity, i) => {
    // Text before entity
    if (entity.start > lastEnd) {
      segments.push(
        <span key={`text-${i}`} className="text-dimmed/70">
          {text.slice(lastEnd, entity.start)}
        </span>,
      );
    }

    const color = ENTITY_COLORS[entity.type] ?? DEFAULT_COLOR;
    const borderStyle = entity.source === 'regex' ? 'solid' : 'dashed';

    segments.push(
      <span
        key={`entity-${i}`}
        onClick={() => onEntityClick?.(entity)}
        className="relative inline cursor-pointer group"
        style={{
          backgroundColor: color + '20',
          borderBottom: `2px ${borderStyle} ${color}`,
          padding: '1px 2px',
          borderRadius: '2px',
        }}
      >
        <span className="text-surface">{entity.text}</span>
        <span
          className="absolute -top-5 left-0 px-1.5 py-0.5 rounded text-[9px] font-semibold whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-10"
          style={{ backgroundColor: color, color: '#fff' }}
        >
          {entity.type}
          {entity.source === 'bert' && ` ${(entity.confidence * 100).toFixed(0)}%`}
        </span>
      </span>,
    );

    lastEnd = entity.end;
  });

  // Remaining text
  if (lastEnd < text.length) {
    segments.push(
      <span key="text-end" className="text-dimmed/70">
        {text.slice(lastEnd)}
      </span>,
    );
  }

  return (
    <div className="glass-surface rounded-xl p-4">
      <p className="text-xs font-mono whitespace-pre-wrap leading-relaxed">{segments}</p>
    </div>
  );
}
