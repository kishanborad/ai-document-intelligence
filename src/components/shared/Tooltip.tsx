import { useState, useRef, type ReactNode } from 'react';

interface TooltipProps {
  content: string;
  children: ReactNode;
  position?: 'top' | 'bottom';
}

export default function Tooltip({ content, children, position = 'top' }: TooltipProps) {
  const [visible, setVisible] = useState(false);
  const timeoutRef = useRef<ReturnType<typeof setTimeout>>();

  const show = () => {
    clearTimeout(timeoutRef.current);
    timeoutRef.current = setTimeout(() => setVisible(true), 300);
  };

  const hide = () => {
    clearTimeout(timeoutRef.current);
    setVisible(false);
  };

  const posClass = position === 'top'
    ? 'bottom-full mb-1.5'
    : 'top-full mt-1.5';

  return (
    <span
      className="relative inline-flex"
      onMouseEnter={show}
      onMouseLeave={hide}
      onFocus={show}
      onBlur={hide}
    >
      {children}
      {visible && (
        <span
          className={`absolute left-1/2 -translate-x-1/2 ${posClass} px-2 py-1 rounded-md bg-panel-surface border border-panel-border text-[10px] text-surface whitespace-nowrap shadow-glass z-50 pointer-events-none`}
        >
          {content}
        </span>
      )}
    </span>
  );
}
