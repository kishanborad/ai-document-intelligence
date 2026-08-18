import StepHeader from '../shell/StepHeader';

export default function OcrStep() {
  return (
    <div>
      <StepHeader
        title="Optical Character Recognition"
        description="Extract text from your document using Tesseract.js or PaddleOCR."
      />
      <div className="glass-surface rounded-xl p-6 min-h-[200px] flex items-center justify-center">
        <p className="text-sm text-dimmed">OCR engine will be implemented in Phase 3</p>
      </div>
    </div>
  );
}
