import { useDocStore, useDocDispatch } from '../../store/DocStoreContext';
import StepIndicator from './StepIndicator';
import UploadStep from '../steps/UploadStep';
import OcrStep from '../steps/OcrStep';
import NerStep from '../steps/NerStep';
import ClassificationStep from '../steps/ClassificationStep';

function getExtractedText(store: ReturnType<typeof useDocStore>): string {
  if (store.ocr?.text) return store.ocr.text;
  if (store.input?.rawText) return store.input.rawText;
  return '';
}

export default function WizardShell() {
  const store = useDocStore();
  const dispatch = useDocDispatch();
  const { activeStep, completedSteps, input } = store;

  const canGoNext = completedSteps.includes(activeStep) && activeStep < 4;
  const canGoBack = activeStep > 1;

  // Skip OCR for text input
  const effectiveNextStep = (): 1 | 2 | 3 | 4 => {
    if (activeStep === 1 && input?.type === 'text') return 3;
    return Math.min(activeStep + 1, 4) as 1 | 2 | 3 | 4;
  };

  const effectivePrevStep = (): 1 | 2 | 3 | 4 => {
    if (activeStep === 3 && input?.type === 'text') return 1;
    return Math.max(activeStep - 1, 1) as 1 | 2 | 3 | 4;
  };

  const handleNext = () => {
    if (!canGoNext) return;
    dispatch({ type: 'SET_STEP', payload: effectiveNextStep() });
  };

  const handleBack = () => {
    if (!canGoBack) return;
    dispatch({ type: 'SET_STEP', payload: effectivePrevStep() });
  };

  const extractedText = getExtractedText(store);

  return (
    <div className="flex flex-col h-full">
      {/* Step indicator */}
      <div className="border-b border-panel-border flex-shrink-0">
        <StepIndicator />
      </div>

      {/* Step content */}
      <div className="flex-1 overflow-y-auto p-6">
        {activeStep === 1 && <UploadStep />}
        {activeStep === 2 && <OcrStep />}
        {activeStep === 3 && <NerStep extractedText={extractedText} />}
        {activeStep === 4 && <ClassificationStep extractedText={extractedText} />}
      </div>

      {/* Navigation footer */}
      <div className="border-t border-panel-border px-6 py-3 flex items-center justify-between flex-shrink-0">
        <button
          onClick={handleBack}
          disabled={!canGoBack}
          className="px-4 py-2 rounded-lg text-sm font-medium border border-panel-border text-dimmed hover:text-surface hover:border-white/15 disabled:opacity-30 disabled:cursor-not-allowed transition-all duration-200 cursor-pointer"
        >
          Back
        </button>

        <div className="flex items-center gap-3">
          <span className="text-[10px] text-dimmed uppercase tracking-wider">
            Step {activeStep} of 4
          </span>
          <button
            onClick={handleNext}
            disabled={!canGoNext}
            className="px-5 py-2 rounded-lg text-sm font-semibold gradient-accent text-white shadow-glow hover:shadow-[0_0_30px_rgba(99,102,241,0.35)] disabled:opacity-30 disabled:shadow-none disabled:cursor-not-allowed transition-all duration-200 cursor-pointer"
          >
            Next
          </button>
        </div>
      </div>
    </div>
  );
}
