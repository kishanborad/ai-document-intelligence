import { useState, useRef, useCallback } from 'react';

const ACCEPTED_TYPES = [
  'image/png',
  'image/jpeg',
  'image/tiff',
  'application/pdf',
];

const ACCEPTED_EXTENSIONS = ['.png', '.jpg', '.jpeg', '.tiff', '.tif', '.pdf'];
const MAX_SIZE_BYTES = 20 * 1024 * 1024; // 20MB

interface DropZoneProps {
  onFile: (file: File) => void;
  disabled?: boolean;
}

function validateFile(file: File): string | null {
  const ext = '.' + file.name.split('.').pop()?.toLowerCase();
  if (!ACCEPTED_TYPES.includes(file.type) && !ACCEPTED_EXTENSIONS.includes(ext)) {
    return `Unsupported format. Use PNG, JPG, TIFF, or PDF.`;
  }
  if (file.size > MAX_SIZE_BYTES) {
    return `File too large (${(file.size / 1024 / 1024).toFixed(1)}MB). Max 20MB.`;
  }
  if (file.size === 0) {
    return 'File is empty.';
  }
  return null;
}

export default function DropZone({ onFile, disabled }: DropZoneProps) {
  const [dragOver, setDragOver] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFiles = useCallback(
    (files: FileList | null) => {
      if (!files || files.length === 0) return;
      const file = files[0];
      const err = validateFile(file);
      if (err) {
        setError(err);
        return;
      }
      setError(null);
      onFile(file);
    },
    [onFile],
  );

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setDragOver(false);
      if (disabled) return;
      handleFiles(e.dataTransfer.files);
    },
    [handleFiles, disabled],
  );

  const handleDragOver = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      if (!disabled) setDragOver(true);
    },
    [disabled],
  );

  const handleDragLeave = useCallback(() => setDragOver(false), []);

  return (
    <div>
      <div
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onClick={() => !disabled && inputRef.current?.click()}
        className={`relative rounded-xl p-8 flex flex-col items-center justify-center min-h-[260px] border-2 border-dashed transition-all duration-200 cursor-pointer ${
          disabled
            ? 'opacity-50 cursor-not-allowed border-panel-border bg-white/[0.02]'
            : dragOver
              ? 'border-accent bg-accent/5 shadow-glow'
              : 'border-panel-border hover:border-accent/30 bg-white/[0.02] hover:bg-white/[0.04]'
        }`}
      >
        <input
          ref={inputRef}
          type="file"
          accept={ACCEPTED_EXTENSIONS.join(',')}
          className="hidden"
          onChange={(e) => handleFiles(e.target.files)}
          disabled={disabled}
        />

        <div className={`w-14 h-14 rounded-2xl flex items-center justify-center mb-4 transition-colors duration-200 ${
          dragOver ? 'bg-accent/20' : 'bg-white/5'
        }`}>
          <svg className={`w-7 h-7 transition-colors duration-200 ${dragOver ? 'text-accent' : 'text-dimmed'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5" />
          </svg>
        </div>

        <p className="text-sm text-surface/80 mb-1 font-medium">
          {dragOver ? 'Drop your file here' : 'Drag and drop your document'}
        </p>
        <p className="text-xs text-dimmed">or click to browse</p>
        <p className="text-[10px] text-dimmed/60 mt-3">PNG, JPG, TIFF, or PDF &middot; Max 20MB</p>
      </div>

      {error && (
        <div className="mt-3 px-3 py-2 rounded-lg bg-error/10 border border-error/20 text-error text-xs">
          {error}
        </div>
      )}
    </div>
  );
}
