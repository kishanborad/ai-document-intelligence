interface ErrorBannerProps {
  message: string;
  severity?: 'error' | 'warning';
  onRetry?: () => void;
  onDismiss?: () => void;
}

export default function ErrorBanner({
  message,
  severity = 'error',
  onRetry,
  onDismiss,
}: ErrorBannerProps) {
  const isWarning = severity === 'warning';
  const color = isWarning ? 'warning' : 'error';

  return (
    <div className={`px-3 py-2.5 rounded-xl bg-${color}/10 border border-${color}/20 flex items-start gap-3`}>
      <div className={`w-5 h-5 rounded-md bg-${color}/15 flex items-center justify-center flex-shrink-0 mt-0.5`}>
        <svg className={`w-3 h-3 text-${color}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
          {isWarning ? (
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
          ) : (
            <path strokeLinecap="round" strokeLinejoin="round" d="M9.75 9.75l4.5 4.5m0-4.5l-4.5 4.5M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          )}
        </svg>
      </div>
      <div className="flex-1 min-w-0">
        <p className={`text-[11px] text-${color} leading-relaxed`}>{message}</p>
      </div>
      <div className="flex items-center gap-2 flex-shrink-0">
        {onRetry && (
          <button
            onClick={onRetry}
            className={`px-2 py-0.5 rounded text-[10px] font-medium border border-${color}/30 text-${color} hover:bg-${color}/10 transition-colors cursor-pointer`}
          >
            Retry
          </button>
        )}
        {onDismiss && (
          <button
            onClick={onDismiss}
            className={`text-${color}/50 hover:text-${color} transition-colors cursor-pointer`}
          >
            <svg className="w-3.5 h-3.5" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
            </svg>
          </button>
        )}
      </div>
    </div>
  );
}
