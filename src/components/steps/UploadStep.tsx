import StepHeader from '../shell/StepHeader';

export default function UploadStep() {
  return (
    <div>
      <StepHeader
        title="Upload Document"
        description="Upload an image or PDF, or paste text directly to analyze."
      />
      <div className="glass-surface rounded-xl p-8 flex flex-col items-center justify-center min-h-[300px] border-dashed border-2 border-panel-border hover:border-accent/30 transition-colors duration-200">
        <svg className="w-12 h-12 text-dimmed mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5" />
        </svg>
        <p className="text-sm text-dimmed mb-1">Drag and drop your document here</p>
        <p className="text-xs text-dimmed/60">PNG, JPG, TIFF, or PDF up to 20MB</p>
      </div>
    </div>
  );
}
