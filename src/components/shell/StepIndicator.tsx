import { useDocStore } from '../../store/DocStoreContext';

const STEPS = [
  { num: 1, label: 'Upload' },
  { num: 2, label: 'OCR' },
  { num: 3, label: 'NER' },
  { num: 4, label: 'Classify' },
] as const;

export default function StepIndicator() {
  const { activeStep, completedSteps } = useDocStore();

  return (
    <div className="flex items-center gap-2 px-6 py-4">
      {STEPS.map((step, i) => {
        const isActive = step.num === activeStep;
        const isCompleted = completedSteps.includes(step.num);
        const isLocked = step.num > activeStep && !isCompleted;

        return (
          <div key={step.num} className="flex items-center gap-2">
            {/* Step circle */}
            <div className="flex items-center gap-2.5">
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-semibold transition-all duration-300 ${
                  isActive
                    ? 'gradient-accent text-white shadow-glow'
                    : isCompleted
                      ? 'bg-success/20 text-success border border-success/30'
                      : 'bg-white/5 text-dimmed border border-panel-border'
                }`}
              >
                {isCompleted ? (
                  <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                  </svg>
                ) : (
                  step.num
                )}
              </div>
              <span
                className={`text-xs font-medium transition-colors duration-300 ${
                  isActive ? 'text-surface' : isCompleted ? 'text-success' : isLocked ? 'text-dimmed/50' : 'text-dimmed'
                }`}
              >
                {step.label}
              </span>
            </div>

            {/* Connector line */}
            {i < STEPS.length - 1 && (
              <div
                className={`w-12 h-px transition-colors duration-300 ${
                  completedSteps.includes(step.num) ? 'bg-success/40' : 'bg-panel-border'
                }`}
              />
            )}
          </div>
        );
      })}
    </div>
  );
}
