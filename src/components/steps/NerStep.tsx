import StepHeader from '../shell/StepHeader';

interface NerStepProps {
  extractedText: string;
}

export default function NerStep({ extractedText }: NerStepProps) {
  return (
    <div>
      <StepHeader
        title="Named Entity Recognition"
        description="Identify people, organizations, dates, and more in your document."
      />
      <div className="glass-surface rounded-xl p-6 min-h-[200px]">
        {extractedText ? (
          <p className="text-xs text-dimmed font-mono whitespace-pre-wrap line-clamp-6">{extractedText}</p>
        ) : (
          <p className="text-sm text-dimmed text-center">No text available. Complete a previous step first.</p>
        )}
      </div>
    </div>
  );
}
