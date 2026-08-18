import StepHeader from '../shell/StepHeader';

interface ClassificationStepProps {
  extractedText: string;
}

export default function ClassificationStep({ extractedText }: ClassificationStepProps) {
  return (
    <div>
      <StepHeader
        title="Document Classification"
        description="Classify your document into categories using AI embeddings."
      />
      <div className="glass-surface rounded-xl p-6 min-h-[200px]">
        {extractedText ? (
          <p className="text-sm text-dimmed">Classification engine will be implemented in Phase 5</p>
        ) : (
          <p className="text-sm text-dimmed text-center">No text available. Complete a previous step first.</p>
        )}
      </div>
    </div>
  );
}
