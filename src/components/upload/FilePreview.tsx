import { useEffect, useRef, useState } from 'react';

interface FilePreviewProps {
  file: File;
  previewUrl: string | null;
  pageCount: number;
  onRemove: () => void;
}

export default function FilePreview({ file, previewUrl, pageCount, onRemove }: FilePreviewProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [pdfRendered, setPdfRendered] = useState(false);

  const isPdf = file.type === 'application/pdf' || file.name.toLowerCase().endsWith('.pdf');
  const fileSize = (file.size / 1024).toFixed(0);
  const fileSizeLabel = file.size > 1024 * 1024
    ? `${(file.size / (1024 * 1024)).toFixed(1)} MB`
    : `${fileSize} KB`;

  useEffect(() => {
    if (!isPdf || !previewUrl || !canvasRef.current) return;

    let cancelled = false;

    (async () => {
      try {
        const pdfjs = await import('pdfjs-dist');
        pdfjs.GlobalWorkerOptions.workerSrc = new URL(
          'pdfjs-dist/build/pdf.worker.min.mjs',
          import.meta.url,
        ).toString();

        const doc = await pdfjs.getDocument(previewUrl).promise;
        if (cancelled) return;

        const page = await doc.getPage(1);
        const viewport = page.getViewport({ scale: 0.5 });
        const canvas = canvasRef.current;
        if (!canvas) return;

        canvas.width = viewport.width;
        canvas.height = viewport.height;

        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        await page.render({ canvasContext: ctx, viewport }).promise;
        setPdfRendered(true);
      } catch {
        // PDF rendering failed — show fallback
      }
    })();

    return () => { cancelled = true; };
  }, [isPdf, previewUrl]);

  return (
    <div className="glass-surface rounded-xl p-4">
      <div className="flex items-start gap-4">
        {/* Thumbnail */}
        <div className="w-32 h-40 rounded-lg overflow-hidden bg-white/5 flex-shrink-0 flex items-center justify-center border border-panel-border">
          {isPdf ? (
            pdfRendered ? (
              <canvas ref={canvasRef} className="max-w-full max-h-full object-contain" />
            ) : (
              <>
                <canvas ref={canvasRef} className="hidden" />
                <div className="flex flex-col items-center gap-1">
                  <svg className="w-8 h-8 text-error/60" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m2.25 0H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
                  </svg>
                  <span className="text-[9px] text-dimmed">Loading...</span>
                </div>
              </>
            )
          ) : previewUrl ? (
            <img src={previewUrl} alt="Preview" className="max-w-full max-h-full object-contain" />
          ) : (
            <svg className="w-8 h-8 text-dimmed" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909M3.75 21h16.5A2.25 2.25 0 0022.5 18.75V5.25A2.25 2.25 0 0020.25 3H3.75A2.25 2.25 0 001.5 5.25v13.5A2.25 2.25 0 003.75 21z" />
            </svg>
          )}
        </div>

        {/* File info */}
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-surface truncate">{file.name}</p>
          <div className="flex items-center gap-3 mt-1.5">
            <span className="text-[11px] text-dimmed">{fileSizeLabel}</span>
            {isPdf && pageCount > 0 && (
              <span className="text-[11px] text-dimmed">
                {pageCount} page{pageCount !== 1 ? 's' : ''}
              </span>
            )}
            <span className="text-[11px] px-1.5 py-0.5 rounded bg-accent/10 text-accent font-medium uppercase">
              {isPdf ? 'PDF' : file.type.split('/')[1]?.toUpperCase() || 'IMAGE'}
            </span>
          </div>

          <div className="flex items-center gap-2 mt-1.5">
            <div className="flex items-center gap-1 text-[10px] text-success">
              <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
              </svg>
              Ready for processing
            </div>
          </div>

          <button
            onClick={onRemove}
            className="mt-3 px-3 py-1 rounded-md text-[11px] text-dimmed border border-panel-border hover:text-error hover:border-error/30 transition-colors duration-200 cursor-pointer"
          >
            Remove
          </button>
        </div>
      </div>
    </div>
  );
}
